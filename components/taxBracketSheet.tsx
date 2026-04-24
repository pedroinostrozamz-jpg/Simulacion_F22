"use client"

import type { Form22Data } from "@/app/page"

interface Props {
  form22Data: Form22Data
  onNext: () => void
}

// Tabla IGC 2026
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

function calcIGC(base: number) {
  const tramo = getTramo(base)
  return Math.max(0, base * tramo.factor - tramo.rebaja)
}

function fmt(n: number) {
  return n.toLocaleString("es-CL", { maximumFractionDigits: 0 })
}

function fmtPct(n: number) {
  return (n * 100).toFixed(1) + "%"
}

export default function TaxBracketSheet({ form22Data, onNext }: Props) {
  const base = form22Data.baseImponible
  const tramoActual = getTramo(base)
  const igcCalculado = calcIGC(base)
  const tramoIdx = TRAMOS_IGC.indexOf(tramoActual)

  return (
    <div className="space-y-6">
      {/* Current situation */}
      <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5c] text-white px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Sección 3 — Tramo Impositivo Global Complementario 2026
          </h2>
          <p className="text-[#a8c4e0] text-xs mt-0.5">
            Determinación del tramo en base a la Base Imponible Anual (código 170)
          </p>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-[#e0e5ec] border-b border-[#e0e5ec]">
          <div className="p-5">
            <div className="text-xs text-[#6a6a6a] uppercase font-semibold mb-1">Base Imponible (Cód. 170)</div>
            <div className="text-2xl font-bold text-[#1a3a5c]">
              {base > 0 ? `$${fmt(base)}` : "Sin datos"}
            </div>
            <div className="text-xs text-[#8a8a8a] mt-1">Ingrese en la sección anterior</div>
          </div>
          <div className={`p-5 ${tramoIdx > 0 ? "bg-[#fff8e8]" : "bg-white"}`}>
            <div className="text-xs text-[#6a6a6a] uppercase font-semibold mb-1">Tramo Actual</div>
            <div className={`text-2xl font-bold ${tramoIdx === 0 ? "text-[#2e7d32]" : tramoIdx <= 2 ? "text-[#1a3a5c]" : tramoIdx <= 4 ? "text-[#e8a020]" : "text-[#c0392b]"}`}>
              {base > 0 ? tramoActual.label : "—"}
            </div>
            <div className="text-xs text-[#8a8a8a] mt-1">
              {base > 0
                ? `Tramo ${tramoIdx + 1} de ${TRAMOS_IGC.length}`
                : "Ingrese base imponible"}
            </div>
          </div>
          <div className="p-5">
            <div className="text-xs text-[#6a6a6a] uppercase font-semibold mb-1">IGC Calculado</div>
            <div className="text-2xl font-bold text-[#c0392b]">
              {base > 0 ? `$${fmt(igcCalculado)}` : "—"}
            </div>
            <div className="text-xs text-[#8a8a8a] mt-1">
              {base > 0 && igcCalculado > 0
                ? `Tasa efectiva: ${fmtPct(igcCalculado / base)}`
                : base > 0
                ? "Exento de impuesto"
                : ""}
            </div>
          </div>
        </div>

        {/* Tax table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[#2a4a6c] text-white">
                <th className="px-3 py-2 text-center font-semibold">Tramo</th>
                <th className="px-3 py-2 text-right font-semibold">Desde ($)</th>
                <th className="px-3 py-2 text-right font-semibold">Hasta ($)</th>
                <th className="px-3 py-2 text-center font-semibold">Factor</th>
                <th className="px-3 py-2 text-right font-semibold">Cantidad a Rebajar ($)</th>
                <th className="px-3 py-2 text-center font-semibold">IGC s/ Tramo ($)</th>
              </tr>
            </thead>
            <tbody>
              {TRAMOS_IGC.map((t, i) => {
                const isActive = i === tramoIdx && base > 0
                const igcTramo =
                  t.factor === 0
                    ? 0
                    : Math.max(
                        0,
                        Math.min(base, t.hasta === Infinity ? base : t.hasta) * t.factor - t.rebaja
                      )
                return (
                  <tr
                    key={i}
                    className={`border-b border-[#e0e5ec] ${
                      isActive
                        ? "bg-[#e8f0fa] font-semibold border-l-4 border-l-[#e8a020]"
                        : i % 2 === 0
                        ? "bg-white"
                        : "bg-[#f7f9fc]"
                    }`}
                  >
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                          isActive
                            ? "bg-[#e8a020] text-white"
                            : "bg-[#e0e5ec] text-[#4a4a4a]"
                        }`}
                      >
                        {t.label}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {i === 0 ? "$ 0,00" : `$ ${fmt(t.desde)}`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {t.hasta === Infinity ? "y más" : `$ ${fmt(t.hasta)}`}
                    </td>
                    <td className="px-3 py-2.5 text-center font-semibold text-[#1a3a5c]">
                      {t.factor === 0 ? "Exento" : t.factor.toFixed(3)}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {t.rebaja === 0 ? "$ 0,00" : `$ ${fmt(t.rebaja)}`}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-[#c0392b]">
                      {isActive && base > 0
                        ? igcCalculado === 0
                          ? "Exento"
                          : `$ ${fmt(igcCalculado)}`
                        : "—"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Formula explanation */}
        {base > 0 && tramoIdx > 0 && (
          <div className="p-4 bg-[#e8f0fa] border-t border-[#c8d0da]">
            <div className="text-xs font-bold text-[#1a3a5c] mb-2">Fórmula aplicada:</div>
            <div className="text-xs text-[#2a2a2a] font-mono bg-white border border-[#c8d0da] rounded px-3 py-2">
              IGC = Base Imponible × Factor − Cantidad a Rebajar
              <br />
              IGC = ${fmt(base)} × {tramoActual.factor} − ${fmt(tramoActual.rebaja)}
              <br />
              IGC = <strong className="text-[#c0392b]">${fmt(igcCalculado)}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
        >
          Siguiente: Simulación APV →
        </button>
      </div>
    </div>
  )
}
