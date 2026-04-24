"use client"

import type { Form22Data } from "@/app/page"

interface Props {
  form22Data: Form22Data
  apvMonto: number
  onApvMontoChange: (v: number) => void
  onNext: () => void
}

const TRAMOS_IGC = [
  { desde: 0, hasta: 11265804, factor: 0, rebaja: 0, label: "Exento" },
  { desde: 11265804.01, hasta: 25035120, factor: 0.04, rebaja: 450632.16, label: "4%" },
  { desde: 25035120.01, hasta: 41725200, factor: 0.08, rebaja: 1452036.96, label: "8%" },
  { desde: 41725200.01, hasta: 58415280, factor: 0.135, rebaja: 3746922.96, label: "13,5%" },
  { desde: 58415280.01, hasta: 75105360, factor: 0.23, rebaja: 9296374.56, label: "23%" },
  { desde: 75105360.01, hasta: 100140480, factor: 0.304, rebaja: 14854171.2, label: "30,4%" },
  { desde: 100140480.01, hasta: 258696240, factor: 0.35, rebaja: 19460633.28, label: "35%" },
  { desde: 258696240.01, hasta: Infinity, factor: 0.40, rebaja: 32395445.28, label: "40%" },
]

function getTramo(base: number) {
  return TRAMOS_IGC.find((t) => base >= t.desde && base <= t.hasta) ?? TRAMOS_IGC[TRAMOS_IGC.length - 1]
}

function calcIGC(base: number): number {
  const t = getTramo(base)
  return Math.max(0, base * t.factor - t.rebaja)
}

function fmt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 })
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%"
}

// APV máximo permitido: 50 UTA (año 2026 aprox $42.500.000) o 600 UTM 
const APV_MAX_ANUAL = 42500000

export default function ApvSimulatorSheet({
  form22Data,
  apvMonto,
  onApvMontoChange,
  onNext,
}: Props) {
  const base = form22Data.baseImponible

  // Sin APV
  const igcSinApv = calcIGC(base)
  const tramoSinApv = getTramo(base)

  // Con APV (Régimen A): se descuenta de la base imponible
  const baseConApv = Math.max(0, base - apvMonto)
  const igcConApv = calcIGC(baseConApv)
  const tramoConApv = getTramo(baseConApv)

  // Ahorro tributario
  const ahorro = igcSinApv - igcConApv
  const tasaEfectivaSinApv = base > 0 ? igcSinApv / base : 0
  const tasaEfectivaConApv = baseConApv > 0 ? igcConApv / baseConApv : 0
  const rentabilidadImplicita = apvMonto > 0 ? ahorro / apvMonto : 0

  // Resultado de liquidación: retenciones - IGC determinado
  // El resultado del F22 real (código 305) se usa de base para proyectar con APV
  const totalRetenciones = form22Data.retencionesTotalRentas
  const resultadoSinApv = form22Data.resultadoLiquidacion   // valor real del F22 (negativo = devolución)
  // Con APV: el IGC baja en "ahorro", por lo que la devolución aumenta (o la deuda disminuye)
  const resultadoConApv = resultadoSinApv - ahorro
  // Normalización para mostrar: negativo = devolución, positivo = pago
  const devolucionSinApv = -resultadoSinApv   // positivo si había devolución
  const devolucionConApv = -resultadoConApv   // positivo si hay devolución con APV

  // Scenarios
  const scenarios = [3000000, 5000000, 10000000, 15000000, 20000000]

  return (
    <div className="space-y-6">
      {/* Main simulator */}
      <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5c] text-white px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Sección 4 — Simulación de Ahorro Tributario APV (Régimen A)
          </h2>
          <p className="text-[#a8c4e0] text-xs mt-0.5">
            El APV Régimen A reduce la Base Imponible del IGC, generando una devolución de impuestos proporcional al tramo del cliente.
          </p>
        </div>

        {/* APV input */}
        <div className="p-5 border-b border-[#e0e5ec] bg-[#f7f9fc]">
          <label className="block text-xs font-bold text-[#1a3a5c] uppercase tracking-wide mb-2">
            Monto APV Anual a Simular (CLP)
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8a8a8a] text-sm font-semibold">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={apvMonto === 0 ? "" : fmt(apvMonto)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\./g, "").replace(/[^0-9]/g, "")
                  const val = raw === "" ? 0 : parseInt(raw, 10)
                  onApvMontoChange(Math.min(val, APV_MAX_ANUAL))
                }}
                placeholder="Ingrese monto APV"
                className="border border-[#c8d0da] bg-white pl-8 pr-3 py-2.5 text-sm font-semibold w-full rounded focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div className="text-xs text-[#8a8a8a]">
              Máx: ${fmt(APV_MAX_ANUAL)} (50 UTA 2026)
            </div>
          </div>
          {/* Quick scenario buttons */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-[#8a8a8a] self-center">Accesos rápidos:</span>
            {scenarios.map((s) => (
              <button
                key={s}
                onClick={() => onApvMontoChange(s)}
                className={`text-xs px-3 py-1 rounded border transition-colors ${
                  apvMonto === s
                    ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                    : "bg-white text-[#1a3a5c] border-[#c8d0da] hover:border-[#1a3a5c]"
                }`}
              >
                ${fmt(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#e0e5ec]">
          {/* Without APV */}
          <div className="p-5">
            <div className="text-xs font-bold text-[#6a6a6a] uppercase mb-3 pb-2 border-b border-[#e0e5ec]">
              Sin APV — Situación Actual
            </div>
            <div className="space-y-3">
              <Row label="Base Imponible (Cód. 170)" value={`$${fmt(base)}`} />
              <Row
                label="Tramo IGC"
                value={base > 0 ? tramoSinApv.label : "—"}
                badge
                badgeColor={tramoSinApv.factor > 0.2 ? "red" : tramoSinApv.factor > 0 ? "orange" : "green"}
              />
              <Row label="Factor" value={base > 0 ? tramoSinApv.factor.toString() : "—"} />
              <Row label="Cantidad a Rebajar" value={base > 0 ? `$${fmt(tramoSinApv.rebaja)}` : "—"} />
              <Row label="IGC Calculado" value={base > 0 ? `$${fmt(igcSinApv)}` : "—"} highlight />
              <Row
                label="Tasa Efectiva"
                value={base > 0 ? fmtPct(tasaEfectivaSinApv) : "—"}
              />
              <div className="pt-3 mt-1 border-t-2 border-dashed border-[#c8d0da]">
                <ResultadoLiquidacionRow
                  resultado={resultadoSinApv}
                  devolucion={devolucionSinApv}
                  isApv={false}
                />
              </div>
            </div>
          </div>

          {/* With APV */}
          <div className="p-5 bg-[#f0f8ff]">
            <div className="text-xs font-bold text-[#1a3a5c] uppercase mb-3 pb-2 border-b border-[#c8d8f0]">
              Con APV de ${fmt(apvMonto)} — Proyección
            </div>
            <div className="space-y-3">
              <Row label="Base Imponible Reducida" value={`$${fmt(baseConApv)}`} />
              <Row
                label="Nuevo Tramo IGC"
                value={baseConApv > 0 ? tramoConApv.label : "Exento"}
                badge
                badgeColor={
                  tramoConApv.label !== tramoSinApv.label
                    ? "green"
                    : tramoConApv.factor > 0.2
                    ? "red"
                    : tramoConApv.factor > 0
                    ? "orange"
                    : "green"
                }
              />
              <Row label="Factor" value={baseConApv > 0 ? tramoConApv.factor.toString() : "0"} />
              <Row label="Cantidad a Rebajar" value={`$${fmt(tramoConApv.rebaja)}`} />
              <Row label="IGC con APV" value={`$${fmt(igcConApv)}`} highlight />
              <Row
                label="Tasa Efectiva"
                value={baseConApv > 0 ? fmtPct(tasaEfectivaConApv) : "0,0%"}
              />
              <div className="pt-3 mt-1 border-t-2 border-dashed border-[#a8c4e0]">
                <ResultadoLiquidacionRow
                  resultado={resultadoConApv}
                  devolucion={devolucionConApv}
                  isApv
                  aumento={ahorro}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results highlight */}
        <div className="border-t border-[#e0e5ec] bg-gradient-to-r from-[#1a3a5c] to-[#2a5a8c] text-white p-5">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Devolución actual */}
            <div className="text-center">
              <div className="text-xs text-[#a8c4e0] uppercase font-semibold mb-1">Devolución Actual</div>
              <div className={`text-2xl font-bold ${resultadoSinApv <= 0 && devolucionSinApv > 0 ? "text-white" : resultadoSinApv > 0 ? "text-[#ff8a80]" : "text-[#a8c4e0]"}`}>
                {resultadoSinApv === 0 ? "—" : resultadoSinApv <= 0 ? `$${fmt(devolucionSinApv)}` : `-$${fmt(resultadoSinApv)}`}
              </div>
              <div className="text-xs text-[#a8c4e0] mt-1">
                {resultadoSinApv === 0 ? "Sin datos F22" : resultadoSinApv <= 0 ? "Cód. 87 sin APV" : "Impuesto a pagar"}
              </div>
            </div>

            {/* Devolución con APV */}
            <div className="text-center border-l border-[#2a5a8c]">
              <div className="text-xs text-[#a8c4e0] uppercase font-semibold mb-1">Devolución con APV</div>
              <div className={`text-2xl font-bold ${devolucionConApv > 0 ? "text-[#4dffb4]" : "text-[#ff8a80]"}`}>
                {apvMonto > 0
                  ? devolucionConApv > 0
                    ? `$${fmt(devolucionConApv)}`
                    : `-$${fmt(-devolucionConApv)}`
                  : "—"}
              </div>
              <div className="text-xs text-[#a8c4e0] mt-1">
                {apvMonto > 0 ? (devolucionConApv > 0 ? "Cód. 87 con APV" : "Saldo a pagar con APV") : "Ingrese monto APV"}
              </div>
            </div>

            {/* Ahorro tributario */}
            <div className="text-center border-l border-[#2a5a8c]">
              <div className="text-xs text-[#a8c4e0] uppercase font-semibold mb-1">Ahorro Tributario Anual</div>
              <div className="text-2xl font-bold text-[#4dffb4]">
                {ahorro > 0 ? `+$${fmt(ahorro)}` : "—"}
              </div>
              <div className="text-xs text-[#a8c4e0] mt-1">Mayor devolución por APV</div>
            </div>

            {/* Rentabilidad implícita / tramo */}
            <div className="text-center border-l border-[#2a5a8c]">
              <div className="text-xs text-[#a8c4e0] uppercase font-semibold mb-1">Rentabilidad Implícita</div>
              <div className="text-2xl font-bold text-[#ffd54f]">
                {rentabilidadImplicita > 0 ? fmtPct(rentabilidadImplicita) : "—"}
              </div>
              <div className="text-xs text-[#a8c4e0] mt-1">
                {apvMonto > 0 && base > 0 ? (
                  tramoSinApv.label !== tramoConApv.label
                    ? `Tramo: ${tramoSinApv.label} → ${tramoConApv.label}`
                    : `Tramo: ${tramoSinApv.label}`
                ) : "Ahorro / APV invertido"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scenarios table */}
      {base > 0 && (
        <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
          <div className="bg-[#2a4a6c] text-white px-5 py-3">
            <h3 className="text-sm font-bold uppercase">Tabla Comparativa de Escenarios APV</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f0f4f8] text-[#2a2a2a]">
                  <th className="px-4 py-2.5 text-right font-semibold">Monto APV Anual</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Base Reducida</th>
                  <th className="px-4 py-2.5 text-center font-semibold">Tramo</th>
                  <th className="px-4 py-2.5 text-right font-semibold">IGC con APV</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Ahorro Tributario</th>
                  <th className="px-4 py-2.5 text-right font-semibold">% Rentabilidad Implícita</th>
                </tr>
              </thead>
              <tbody>
                {[1000000, 3000000, 5000000, 7500000, 10000000, 15000000, 20000000].map((monto, i) => {
                  const baseR = Math.max(0, base - monto)
                  const igcR = calcIGC(baseR)
                  const aho = igcSinApv - igcR
                  const rent = aho / monto
                  const tr = getTramo(baseR)
                  const isSelected = monto === apvMonto
                  return (
                    <tr
                      key={i}
                      onClick={() => onApvMontoChange(monto)}
                      className={`border-b border-[#e0e5ec] cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#e8f0fa] border-l-4 border-l-[#e8a020]"
                          : i % 2 === 0
                          ? "bg-white hover:bg-[#f7f9fc]"
                          : "bg-[#f7f9fc] hover:bg-[#eef2f8]"
                      }`}
                    >
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-[#1a3a5c]">
                        ${fmt(monto)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">${fmt(baseR)}</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-[#e0e5ec] text-[#2a2a2a] font-semibold">
                          {tr.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">${fmt(igcR)}</td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-[#2e7d32]">
                        ${fmt(aho)}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-bold text-[#e8a020]">
                        {fmtPct(rent)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-[#f7f9fc] text-xs text-[#8a8a8a] border-t border-[#e0e5ec]">
            Haga clic en cualquier fila para seleccionar ese monto de APV.
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
        >
          Siguiente: Proyección Rentabilidad →
        </button>
      </div>
    </div>
  )
}

function ResultadoLiquidacionRow({
  resultado,
  devolucion,
  isApv,
  aumento,
}: {
  resultado: number
  devolucion: number
  isApv: boolean
  aumento?: number
}) {
  const esDev = resultado <= 0 // negativo o cero = devolución
  const esDeuda = resultado > 0 // positivo = pago

  return (
    <div className={`rounded p-3 ${isApv ? "bg-[#e0f2e9] border border-[#a5d6a7]" : "bg-[#fafafa] border border-[#e0e5ec]"}`}>
      <div className="text-[10px] font-bold uppercase tracking-wide text-[#555] mb-2">
        Resultado Liquidación Anual (Cód. 305)
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#555]">Estado:</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${esDev ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]" : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"}`}>
          {resultado === 0 ? "Sin resultado" : esDev ? "DEVOLUCIÓN" : "PAGO"}
        </span>
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-[#555]">Resultado F22 (Cód. 305):</span>
        <span className={`text-sm font-mono font-bold ${esDev ? "text-[#2e7d32]" : esDeuda ? "text-[#c62828]" : "text-[#555]"}`}>
          {resultado === 0 ? "—" : `$${fmt(resultado)}`}
        </span>
      </div>

      {esDev && devolucion > 0 && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-semibold text-[#1a3a5c]">Monto Devolución (Cód. 87):</span>
          <span className="text-base font-mono font-bold text-[#2e7d32]">
            ${fmt(devolucion)}
          </span>
        </div>
      )}

      {esDeuda && (
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs font-semibold text-[#c62828]">Monto a Pagar (Cód. 91):</span>
          <span className="text-base font-mono font-bold text-[#c62828]">
            ${fmt(resultado)}
          </span>
        </div>
      )}

      {isApv && aumento !== undefined && aumento > 0 && (
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#a5d6a7]">
          <span className="text-xs font-bold text-[#1a6b2e]">Mayor devolución gracias al APV:</span>
          <span className="text-sm font-mono font-bold text-[#1a6b2e]">
            +${fmt(aumento)}
          </span>
        </div>
      )}
    </div>
  )
}

function Row({
  label,
  value,
  highlight,
  badge,
  badgeColor,
}: {
  label: string
  value: string
  highlight?: boolean
  badge?: boolean
  badgeColor?: "green" | "orange" | "red"
}) {
  const badgeClass =
    badgeColor === "green"
      ? "bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7]"
      : badgeColor === "orange"
      ? "bg-[#fff8e1] text-[#e65100] border border-[#ffcc80]"
      : "bg-[#ffebee] text-[#c62828] border border-[#ef9a9a]"

  return (
    <div
      className={`flex items-center justify-between gap-2 ${
        highlight ? "pt-2 border-t border-[#e0e5ec]" : ""
      }`}
    >
      <span className={`text-xs ${highlight ? "font-bold text-[#1a1a1a]" : "text-[#6a6a6a]"}`}>
        {label}
      </span>
      {badge ? (
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeClass}`}>{value}</span>
      ) : (
        <span className={`text-sm font-mono ${highlight ? "font-bold text-[#c0392b]" : "font-semibold text-[#1a1a1a]"}`}>
          {value}
        </span>
      )}
    </div>
  )
}
