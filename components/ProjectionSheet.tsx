"use client"

import { useState } from "react"
import type { Form22Data } from "@/app/page"

interface Props {
  apvMonto: number
  form22Data: Form22Data
  tasaAnualExternal?: number
  ufBaseExternal?: number
  onTasaChange?: (v: number) => void
  onUfBaseChange?: (v: number) => void
}

const TRAMOS_IGC = [
  { desde: 0, hasta: 11265804, factor: 0, rebaja: 0 },
  { desde: 11265804.01, hasta: 25035120, factor: 0.04, rebaja: 450632.16 },
  { desde: 25035120.01, hasta: 41725200, factor: 0.08, rebaja: 1452036.96 },
  { desde: 41725200.01, hasta: 58415280, factor: 0.135, rebaja: 3746922.96 },
  { desde: 58415280.01, hasta: 75105360, factor: 0.23, rebaja: 9296374.56 },
  { desde: 75105360.01, hasta: 100140480, factor: 0.304, rebaja: 14854171.2 },
  { desde: 100140480.01, hasta: 258696240, factor: 0.35, rebaja: 19460633.28 },
  { desde: 258696240.01, hasta: Infinity, factor: 0.40, rebaja: 32395445.28 },
]

function calcIGC(base: number): number {
  const t = TRAMOS_IGC.find((t) => base >= t.desde && base <= t.hasta) ?? TRAMOS_IGC[TRAMOS_IGC.length - 1]
  return Math.max(0, base * t.factor - t.rebaja)
}

const ANOS = 10
const UF_CRECIMIENTO_ANUAL = 0.03

function fmt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 })
}

function fmtUF(n: number) {
  return n.toLocaleString("es-CL", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n: number, decimals = 1) {
  return (n * 100).toFixed(decimals) + "%"
}

export default function ProjectionSheet({ apvMonto, form22Data }: Props) {
  // Tasa de rentabilidad modificable
  const [tasaPct, setTasaPct] = useState<string>("11.8")
  // UF base actual (valor de referencia del día)
  const [ufBase, setUfBase] = useState<string>("38500")

  const tasa = Math.max(0, Math.min(100, parseFloat(tasaPct.replace(",", ".")) || 0)) / 100
  const ufValorBase = Math.max(1, parseFloat(ufBase.replace(",", ".").replace(/\./g, "").replace(",", ".")) || 38500)

  const base = form22Data.baseImponible
  const igcSinApv = calcIGC(base)
  const igcConApv = calcIGC(Math.max(0, base - apvMonto))
  const ahorroAnual = igcSinApv - igcConApv

  // Aporte mensual = apvMonto anual / 12
  const aporteMensual = apvMonto / 12
  // Tasa mensual equivalente
  const tasaMensual = Math.pow(1 + tasa, 1 / 12) - 1

  // Construcción de filas año a año con capitalización mensual
  const rows = []
  let acumuladoCLP = 0
  let aporteTotalAcum = 0

  for (let year = 1; year <= ANOS; year++) {
    // UF del año N = UF base × (1 + 3%)^N
    const ufAno = ufValorBase * Math.pow(1 + UF_CRECIMIENTO_ANUAL, year)

    // Simulación mes a mes: cada mes el fondo crece y se suma el aporte al inicio del mes
    for (let mes = 1; mes <= 12; mes++) {
      acumuladoCLP = (acumuladoCLP + aporteMensual) * (1 + tasaMensual)
    }
    aporteTotalAcum += apvMonto

    const rentabilidadGeneradaCLP = acumuladoCLP - aporteTotalAcum
    const roi = aporteTotalAcum > 0 ? rentabilidadGeneradaCLP / aporteTotalAcum : 0

    // Conversión a UF usando la UF del año correspondiente
    const aporteAnualUF = apvMonto / ufAno
    const aporteTotalAcumUF = aporteTotalAcum / ufAno
    const acumuladoUF = acumuladoCLP / ufAno
    const rentabilidadUF = rentabilidadGeneradaCLP / ufAno

    rows.push({
      year,
      ufAno,
      // CLP
      aporteAnualCLP: apvMonto,
      aporteTotalAcumCLP: aporteTotalAcum,
      acumuladoCLP,
      rentabilidadGeneradaCLP,
      roi,
      // UF
      aporteAnualUF,
      aporteTotalAcumUF,
      acumuladoUF,
      rentabilidadUF,
    })
  }

  const final = rows[ANOS - 1]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5c] text-white px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Sección 5 — Proyección de Rentabilidad APV a 10 Años
          </h2>
          <p className="text-[#a8c4e0] text-xs mt-0.5">
            Valores expresados en CLP y UF — Crecimiento UF estimado: <strong>3% anual</strong>
          </p>
        </div>

        {/* Parametros editables */}
        <div className="bg-[#f0f4f8] border-b border-[#e0e5ec] px-5 py-4">
          <div className="text-xs font-bold text-[#1a3a5c] uppercase mb-3">Parámetros de simulación</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tasa rentabilidad */}
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1">
                Tasa de Rentabilidad Anual (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={tasaPct}
                  onChange={(e) => setTasaPct(e.target.value)}
                  className="w-28 border-2 border-[#1a3a5c] rounded px-3 py-1.5 text-sm font-mono font-bold text-[#1a3a5c] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]/30"
                />
                <span className="text-sm font-bold text-[#1a3a5c]">%</span>
                <span className="text-xs text-[#8a8a8a]">
                  (referencia: 11,8%)
                </span>
              </div>
              {/* Accesos rápidos de tasa */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {["8.0", "10.0", "11.8", "13.0", "15.0"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTasaPct(t)}
                    className={`px-2 py-0.5 rounded text-xs font-semibold border transition-colors ${
                      tasaPct === t
                        ? "bg-[#1a3a5c] text-white border-[#1a3a5c]"
                        : "bg-white text-[#1a3a5c] border-[#c8d0da] hover:border-[#1a3a5c]"
                    }`}
                  >
                    {t}%
                  </button>
                ))}
              </div>
            </div>

            {/* Valor UF base */}
            <div>
              <label className="block text-xs font-semibold text-[#444] mb-1">
                Valor UF Actual (CLP)
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={ufBase}
                onChange={(e) => setUfBase(e.target.value)}
                className="w-40 border-2 border-[#c8a020] rounded px-3 py-1.5 text-sm font-mono font-bold text-[#6a4a00] focus:outline-none focus:ring-2 focus:ring-[#c8a020]/30"
              />
              <div className="text-xs text-[#8a8a8a] mt-1">
                Crecimiento proyectado: <strong>3% anual</strong>
              </div>
              <div className="text-xs text-[#8a8a8a]">
                UF año 10: <strong>${fmt(Math.round(ufValorBase * Math.pow(1.03, 10)))}</strong>
              </div>
            </div>

            {/* Tasa UF info */}
            <div className="bg-white border border-[#e0e5ec] rounded p-3">
              <div className="text-xs font-semibold text-[#6a6a6a] uppercase mb-2">Resumen de parámetros</div>
              <div className="space-y-1 text-xs text-[#444]">
                <div className="flex justify-between">
                  <span>Tasa rentabilidad:</span>
                  <span className="font-bold text-[#1a3a5c]">{tasaPct}% anual</span>
                </div>
                <div className="flex justify-between">
                  <span>Crecimiento UF:</span>
                  <span className="font-bold text-[#c8a020]">3% anual</span>
                </div>
                <div className="flex justify-between">
                  <span>APV anual:</span>
                  <span className="font-bold">{apvMonto > 0 ? `$${fmt(apvMonto)}` : "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>APV en UF hoy:</span>
                  <span className="font-bold text-[#c8a020]">
                    {apvMonto > 0 && ufValorBase > 0
                      ? `UF ${fmtUF(apvMonto / ufValorBase)}`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#e0e5ec] border-b border-[#e0e5ec]">
          <KpiCard label="APV Anual" value={apvMonto > 0 ? `$${fmt(apvMonto)}` : "—"} sub="Aporte al fondo" />
          <KpiCard
            label="APV Anual en UF"
            value={apvMonto > 0 ? `UF ${fmtUF(apvMonto / ufValorBase)}` : "—"}
            sub="Al valor UF actual"
            color="gold"
          />
          <KpiCard
            label="Tasa Activa"
            value={`${tasaPct}% anual`}
            sub="Editable arriba"
            color="blue"
          />
        </div>

        {/* Summary at 10 years */}
        {apvMonto > 0 && (
          <div className="bg-[#1a3a5c] text-white px-5 py-4">
            <div className="text-xs text-[#a8c4e0] uppercase font-semibold mb-3">
              Resultado proyectado a 10 años
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <SummaryBlock
                label="Total Aportado"
                clp={`$${fmt(final.aporteTotalAcumCLP)}`}
                uf={`UF ${fmtUF(final.aporteTotalAcumUF)}`}
              />
              <SummaryBlock
                label="Fondo Acumulado"
                clp={`$${fmt(final.acumuladoCLP)}`}
                uf={`UF ${fmtUF(final.acumuladoUF)}`}
                highlight="blue"
              />
              <SummaryBlock
                label="Rentabilidad Generada"
                clp={`$${fmt(final.rentabilidadGeneradaCLP)}`}
                uf={`UF ${fmtUF(final.rentabilidadUF)}`}
                highlight="gold"
              />
            </div>
          </div>
        )}
      </div>

      {/* Projection table */}
      {apvMonto > 0 ? (
        <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
          <div className="bg-[#2a4a6c] text-white px-5 py-3 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase">Tabla de Proyección Anual — CLP y UF</h3>
            <span className="text-xs text-[#a8c4e0]">
              Tasa: <strong>{tasaPct}%</strong> | UF base: <strong>${fmt(ufValorBase)}</strong> | Crecimiento UF: <strong>3%/año</strong>
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[1100px]">
              <thead>
                <tr className="bg-[#e8eef4] border-b-2 border-[#c8d0da]">
                  <th rowSpan={2} className="px-3 py-2 text-center font-semibold text-[#1a3a5c] border-r border-[#c8d0da] align-middle">
                    Año
                  </th>
                  <th rowSpan={2} className="px-3 py-2 text-right font-semibold text-[#6a6a6a] border-r border-[#c8d0da] align-middle">
                    Valor UF
                  </th>
                  {/* Fondo acumulado */}
                  <th colSpan={2} className="px-3 py-2 text-center font-semibold text-[#1a3a5c] border-r border-[#c8d0da] bg-[#dce8f4]">
                    Fondo Acumulado
                  </th>
                  {/* Rentabilidad generada */}
                  <th colSpan={2} className="px-3 py-2 text-center font-semibold text-[#2a4a8c] border-r border-[#c8d0da] bg-[#eaeefa]">
                    Rentabilidad Generada
                  </th>
                </tr>
                <tr className="bg-[#f0f4f8] border-b border-[#e0e5ec]">
                  {/* Fondo acumulado sub */}
                  <th className="px-3 py-1.5 text-right font-semibold text-[#1a3a5c] bg-[#dce8f4]">CLP ($)</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-[#c8a020] border-r border-[#c8d0da] bg-[#dce8f4]">UF</th>
                  {/* Rentabilidad sub */}
                  <th className="px-3 py-1.5 text-right font-semibold text-[#2a4a8c] bg-[#eaeefa]">CLP ($)</th>
                  <th className="px-3 py-1.5 text-right font-semibold text-[#c8a020] border-r border-[#c8d0da] bg-[#eaeefa]">UF</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={r.year}
                    className={`border-b border-[#e0e5ec] transition-colors ${
                      r.year === ANOS
                        ? "bg-[#fff8e8] font-semibold"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-[#f7f9fc]"
                    }`}
                  >
                    {/* Año */}
                    <td className="px-3 py-2 text-center border-r border-[#e0e5ec]">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          r.year === ANOS
                            ? "bg-[#e8a020] text-white"
                            : "bg-[#e0e5ec] text-[#4a4a4a]"
                        }`}
                      >
                        {r.year}
                      </span>
                    </td>
                    {/* Valor UF del año */}
                    <td className="px-3 py-2 text-right font-mono text-[#8a6a00] border-r border-[#e0e5ec]">
                      ${fmt(Math.round(r.ufAno))}
                    </td>
                    {/* Fondo acumulado CLP */}
                    <td className="px-3 py-2 text-right font-mono font-semibold text-[#1a3a5c] bg-[#f4f8fc]">
                      ${fmt(Math.round(r.acumuladoCLP))}
                    </td>
                    {/* Fondo acumulado UF */}
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#c8a020] bg-[#f4f8fc] border-r border-[#c8d0da]">
                      {fmtUF(r.acumuladoUF)}
                    </td>
                    {/* Rentabilidad generada CLP */}
                    <td className="px-3 py-2 text-right font-mono text-[#2a4a8c] bg-[#f4f4fc]">
                      ${fmt(Math.round(r.rentabilidadGeneradaCLP))}
                    </td>
                    {/* Rentabilidad generada UF */}
                    <td className="px-3 py-2 text-right font-mono font-bold text-[#c8a020] bg-[#f4f4fc] border-r border-[#c8d0da]">
                      {fmtUF(r.rentabilidadUF)}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Footer totals */}
              <tfoot>
                <tr className="bg-[#1a3a5c] text-white text-xs font-bold">
                  <td colSpan={2} className="px-3 py-2.5 text-right pr-4 border-r border-[#2a5a8c]">
                    ROI Fondo APV a 10 años:
                  </td>
                  <td colSpan={6} className="px-3 py-2.5">
                    <span className="text-[#ffd54f] text-sm">
                      {apvMonto > 0 ? fmtPct(final.roi) : "—"}
                    </span>
                    <span className="text-[#a8c4e0] ml-3 font-normal">
                      (Rentabilidad neta: {apvMonto > 0 ? `$${fmt(Math.round(final.rentabilidadGeneradaCLP))} CLP` : "—"}
                      {apvMonto > 0 && ufValorBase > 0
                        ? ` / UF ${fmtUF(final.rentabilidadUF)}`
                        : ""})
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="p-3 bg-[#f7f9fc] text-xs text-[#8a8a8a] border-t border-[#e0e5ec]">
            * Los valores en UF se calculan dividiendo el monto CLP por la UF proyectada del año correspondiente (UF base × 1,03^N). Los valores son estimativos y no garantizan rentabilidad futura.
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#c8d0da] rounded p-8 text-center text-[#8a8a8a]">
          <div className="text-lg font-semibold mb-2">Ingrese el monto APV en la sección anterior</div>
          <div className="text-sm">Para ver la proyección a 10 años, primero defina el monto de APV anual en la Sección 4.</div>
        </div>
      )}

      {/* Methodology */}
      {apvMonto > 0 && (
        <div className="bg-[#e8f0fa] border border-[#a8c4e0] rounded p-4">
          <div className="text-xs font-bold text-[#1a3a5c] uppercase mb-3">Metodología de cálculo</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-[#2a4a6c]">
            <div>
              <strong>Capitalización mensual (aporte al inicio de cada mes):</strong>
              <div className="font-mono bg-white border border-[#c8d0da] rounded px-2 py-1 mt-1">
                Fondo = (Fondo + Aporte mensual) × (1 + tasa mensual)
              </div>
              <div className="mt-1 text-[#4a6a8c]">
                Tasa mensual = (1 + {tasaPct}%)^(1/12) − 1. Se repite 12 veces por año, por lo que desde el año 1 el fondo ya genera intereses sobre los aportes del mes.
              </div>
            </div>
            <div>
              <strong>UF proyectada (año N):</strong>
              <div className="font-mono bg-white border border-[#c8d0da] rounded px-2 py-1 mt-1">
                UF(N) = UF base × (1 + 3%)^N
              </div>
            </div>
            <div>
              <strong>Conversión a UF:</strong>
              <div className="font-mono bg-white border border-[#c8d0da] rounded px-2 py-1 mt-1">
                Monto UF = Monto CLP / UF(N)
              </div>
            </div>
            <div>
              <strong>ROI del Fondo APV:</strong>
              <div className="font-mono bg-white border border-[#c8d0da] rounded px-2 py-1 mt-1">
                ROI = Rentabilidad generada / Total aportado
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function KpiCard({
  label, value, sub, color = "default",
}: {
  label: string; value: string; sub: string; color?: "default" | "green" | "blue" | "gold"
}) {
  const textColor =
    color === "green" ? "text-[#2e7d32]" :
    color === "blue"  ? "text-[#1a3a5c]" :
    color === "gold"  ? "text-[#c8a020]" :
    "text-[#1a1a1a]"

  return (
    <div className="p-4 text-center">
      <div className="text-xs text-[#6a6a6a] uppercase font-semibold mb-1">{label}</div>
      <div className={`text-lg font-bold ${textColor}`}>{value}</div>
      <div className="text-xs text-[#8a8a8a] mt-0.5">{sub}</div>
    </div>
  )
}

function SummaryBlock({
  label, clp, uf, highlight = "default",
}: {
  label: string; clp: string; uf: string; highlight?: "default" | "blue" | "green" | "gold"
}) {
  const clpColor =
    highlight === "blue"  ? "text-[#7ec8e3]" :
    highlight === "green" ? "text-[#4dffb4]" :
    highlight === "gold"  ? "text-[#ffd54f]" :
    "text-white"

  return (
    <div className="text-center">
      <div className="text-xs text-[#a8c4e0] mb-1">{label}</div>
      <div className={`text-lg font-bold ${clpColor}`}>{clp}</div>
      <div className="text-sm font-semibold text-[#c8a020] mt-0.5">{uf}</div>
    </div>
  )
}
