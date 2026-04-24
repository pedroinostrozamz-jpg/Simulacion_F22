"use client"

import { useState } from "react"
import * as XLSX from "xlsx"

interface ExcelExporterProps {
  clientData: {
    nombre: string
    rut: string
    email: string
    telefono: string
    asesor: string
    empresa: string
    anoTributario: number
  }
  form22Data: {
    cod1098: number
    cod110: number
    cod155: number
    cod157: number
    cod158: number
    cod161: number
    cod162: number
    cod169: number
    cod170: number
    cod198: number
    cod304: number
    cod619: number
    cod305: number
    cod461: number
    cod85: number
    cod87: number
    cod750: number
    cod547: number
    cod1849: number
    cod955: number
    cod1637: number
    cod1867: number
    nombreBanco: string
    numeroCuenta: string
  }
  apvMensual: number
  tasaAnual: number
  ufBase: number
}

const TRAMOS = [
  { desde: 0,             hasta: 11265804,    factor: 0,     rebaja: 0,             label: "Exento" },
  { desde: 11265804.01,   hasta: 25035120,    factor: 0.04,  rebaja: 450632.16,     label: "4% — Tramo 2" },
  { desde: 25035120.01,   hasta: 41725200,    factor: 0.08,  rebaja: 1452036.96,    label: "8% — Tramo 3" },
  { desde: 41725200.01,   hasta: 58415280,    factor: 0.135, rebaja: 3746922.96,    label: "13.5% — Tramo 4" },
  { desde: 58415280.01,   hasta: 75105360,    factor: 0.23,  rebaja: 9296374.56,    label: "23% — Tramo 5" },
  { desde: 75105360.01,   hasta: 100140480,   factor: 0.304, rebaja: 14854171.20,   label: "30.4% — Tramo 6" },
  { desde: 100140480.01,  hasta: 258696240,   factor: 0.35,  rebaja: 19460633.28,   label: "35% — Tramo 7" },
  { desde: 258696240.01,  hasta: 9999999999,  factor: 0.40,  rebaja: 32395445.28,   label: "40% — Tramo 8" },
]

function getTramo(base: number) {
  return TRAMOS.find((t) => base >= t.desde && base <= t.hasta) || TRAMOS[0]
}

function calcIGC(base: number) {
  const t = getTramo(base)
  return Math.max(0, base * t.factor - t.rebaja)
}

function pct(v: number) { return `${(v * 100).toFixed(2)}%` }
function clp(v: number) { return Math.round(v).toLocaleString("es-CL") }
function uf(v: number)  { return v.toFixed(2) }

export function ExcelExporter({ clientData, form22Data, apvMensual, tasaAnual, ufBase }: ExcelExporterProps) {
  const [loading, setLoading] = useState(false)

  async function generateExcel() {
    setLoading(true)
    try {
      const wb = XLSX.utils.book_new()

      // ─── Cálculos ────────────────────────────────────────────
      const apvAnual      = apvMensual * 12
      const base          = form22Data.cod170
      const baseConApv    = Math.max(0, base - apvAnual)
      const tramoSin      = getTramo(base)
      const tramoCon      = getTramo(baseConApv)
      const igcSin        = calcIGC(base)
      const igcCon        = calcIGC(baseConApv)
      const ahorro        = igcSin - igcCon
      const tasaEfSin     = base > 0 ? igcSin / base : 0
      const tasaEfCon     = baseConApv > 0 ? igcCon / baseConApv : 0
      const rentImpl      = apvAnual > 0 ? ahorro / apvAnual : 0
      const cod305        = form22Data.cod305
      const resConApv     = cod305 - ahorro
      const devSin        = -cod305
      const devCon        = -resConApv

      const tasaMensual   = Math.pow(1 + tasaAnual, 1 / 12) - 1
      const UF_CREC       = 0.03

      // ─── HOJA 1: Datos del Cliente ───────────────────────────
      const ws1Data = [
        ["SIMULADOR APV — GLOBAL COMPLEMENTARIO 2026"],
        [""],
        ["DATOS DEL CLIENTE"],
        ["Campo", "Valor"],
        ["Nombre completo", clientData.nombre],
        ["RUT", clientData.rut],
        ["Correo electrónico", clientData.email],
        ["Teléfono", clientData.telefono],
        ["Asesor", clientData.asesor],
        ["Empresa / Empleador", clientData.empresa],
        ["Año tributario", clientData.anoTributario],
        ["Fecha de simulación", new Date().toLocaleDateString("es-CL")],
        [""],
        ["INSTRUCCIONES"],
        ["Esta hoja contiene el resumen completo del simulador APV."],
        ["Cada sección (F22, Tramo, Simulación, Proyección) está en su propia hoja."],
        ["Para un nuevo cliente, actualice los valores ingresados manualmente."],
      ]
      const ws1 = XLSX.utils.aoa_to_sheet(ws1Data)
      ws1["!cols"] = [{ wch: 30 }, { wch: 40 }]
      XLSX.utils.book_append_sheet(wb, ws1, "1. Datos Cliente")

      // ─── HOJA 2: Formulario 22 ───────────────────────────────
      const ws2Data = [
        [`FORMULARIO 22 COMPACTO — DATOS TRIBUTARIOS`],
        [`Cliente: ${clientData.nombre} | RUT: ${clientData.rut}`],
        [""],
        ["Código", "Descripción", "Valor ($)"],
        ["1098", "Sueldos, pensiones y otras rentas similares de fuente nacional",              form22Data.cod1098],
        ["110",  "Rentas percibidas honorarios y remuneraciones directores S.A. (Art. 42 N°2)", form22Data.cod110],
        ["155",  "Rentas de capitales mobiliarios, mayor valor enajenación fondos mutuos",      form22Data.cod155],
        ["157",  "IGC o IUSC, según tabla (arts. 47, 52 o 52 bis LIR)",                        form22Data.cod157],
        ["158",  "SUB TOTAL (Si declara IA trasladar a código 133 o 32)",                       form22Data.cod158],
        ["161",  "Rta. Art. 42 N°1",                                                            form22Data.cod161],
        ["162",  "Crédito al IGC o IUSC por IUSC, según art. 56 N°2 LIR",                     form22Data.cod162],
        ["169",  "Pérdida en operaciones de capitales mobiliarios (arts. 54 N°1 y 62 LIR)",    form22Data.cod169],
        ["170",  "BASE IMPONIBLE ANUAL DE IUSC o IGC",                                         form22Data.cod170],
        ["198",  "Retenciones por rentas declaradas en código 110",                             form22Data.cod198],
        ["304",  "IGC O IUSC, DÉBITO FISCAL Y/O TASA ADICIONAL DETERMINADO",                  form22Data.cod304],
        ["619",  "Impuesto Retenido del Total Rentas y Retenciones",                            form22Data.cod619],
        ["305",  "RESULTADO LIQUIDACIÓN ANUAL (negativo = devolución)",                        form22Data.cod305],
        ["85",   "SALDO A FAVOR",                                                               form22Data.cod85],
        ["87",   "MONTO DEVOLUCIÓN SOLICITADA",                                                form22Data.cod87],
        ["461",  "Honorarios Anuales Con Retención",                                            form22Data.cod461],
        ["547",  "Total Ingresos Brutos",                                                       form22Data.cod547],
        ["750",  "Intereses pagados por créditos con garantía hipotecaria, art. 55 bis LIR",   form22Data.cod750],
        ["1849", "Rentas del arrendamiento de bienes raíces agrícolas y no agrícolas",          form22Data.cod1849],
        ["955",  "Otras rentas propias y/o de terceros (art. 14 B) N°1 LIR)",                  form22Data.cod955],
        ["1637", "Crédito al IGC por Impuesto Territorial, art. 56 N°5 LIR",                  form22Data.cod1637],
        ["1867", "Rentas de capitales mobiliarios (art. 20 N°2 LIR)",                           form22Data.cod1867],
        [""],
        ["Banco", form22Data.nombreBanco],
        ["N° Cuenta", form22Data.numeroCuenta],
      ]
      const ws2 = XLSX.utils.aoa_to_sheet(ws2Data)
      ws2["!cols"] = [{ wch: 8 }, { wch: 62 }, { wch: 18 }]
      XLSX.utils.book_append_sheet(wb, ws2, "2. Formulario 22")

      // ─── HOJA 3: Tramo Impositivo ────────────────────────────
      const ws3Data = [
        ["TRAMO IMPOSITIVO — GLOBAL COMPLEMENTARIO 2026"],
        [`Cliente: ${clientData.nombre}`],
        [""],
        ["TABLA DE TRAMOS 2026"],
        ["Desde ($)", "Hasta ($)", "Factor", "Cantidad a Rebajar ($)", "Descripción"],
        ...TRAMOS.map((t) => [
          t.desde.toLocaleString("es-CL"),
          t.desde === 258696240.01 ? "y más" : t.hasta.toLocaleString("es-CL"),
          t.factor === 0 ? "Exento" : t.factor,
          t.rebaja.toLocaleString("es-CL"),
          t.label,
        ]),
        [""],
        ["RESULTADO DEL CLIENTE"],
        ["Campo", "Sin APV", "Con APV"],
        ["Base Imponible ($)",           clp(base),          clp(baseConApv)],
        ["Tramo IGC",                    tramoSin.label,     tramoCon.label],
        ["Factor",                       tramoSin.factor,    tramoCon.factor],
        ["Cantidad a Rebajar ($)",       clp(tramoSin.rebaja), clp(tramoCon.rebaja)],
        ["IGC Calculado ($)",            clp(igcSin),        clp(igcCon)],
        ["Tasa Efectiva",                pct(tasaEfSin),     pct(tasaEfCon)],
      ]
      const ws3 = XLSX.utils.aoa_to_sheet(ws3Data)
      ws3["!cols"] = [{ wch: 28 }, { wch: 22 }, { wch: 22 }, { wch: 22 }, { wch: 22 }]
      XLSX.utils.book_append_sheet(wb, ws3, "3. Tramo Impositivo")

      // ─── HOJA 4: Simulación APV ──────────────────────────────
      const ws4Data = [
        ["SIMULACIÓN APV — IMPACTO TRIBUTARIO"],
        [`Cliente: ${clientData.nombre} | RUT: ${clientData.rut}`],
        [""],
        ["PARÁMETROS APV"],
        ["Monto APV Mensual ($)", clp(apvMensual)],
        ["Monto APV Anual ($)",   clp(apvAnual)],
        [""],
        ["COMPARATIVA SIN / CON APV"],
        ["Concepto",                          "Sin APV",              "Con APV"],
        ["Base Imponible ($)",                clp(base),              clp(baseConApv)],
        ["Tramo IGC",                         tramoSin.label,         tramoCon.label],
        ["Factor",                            tramoSin.factor,        tramoCon.factor],
        ["Cantidad a Rebajar ($)",            clp(tramoSin.rebaja),   clp(tramoCon.rebaja)],
        ["IGC Calculado ($)",                 clp(igcSin),            clp(igcCon)],
        ["Tasa Efectiva",                     pct(tasaEfSin),         pct(tasaEfCon)],
        [""],
        ["RESULTADO LIQUIDACIÓN ANUAL"],
        ["Concepto",                          "Sin APV",              "Con APV"],
        ["Resultado F22 — Cód. 305 ($)",     clp(cod305),            clp(resConApv)],
        ["Estado",                            cod305 <= 0 ? "DEVOLUCIÓN" : "PAGO", resConApv <= 0 ? "DEVOLUCIÓN" : "PAGO"],
        ["Monto Devolución / Pago ($)",       clp(Math.abs(cod305)),  clp(Math.abs(resConApv))],
        ["Mayor devolución gracias al APV",   "—",                    clp(ahorro)],
        [""],
        ["RESUMEN EJECUTIVO"],
        ["Ahorro tributario anual ($)",       clp(ahorro)],
        ["Rentabilidad implícita del APV",    pct(rentImpl)],
        ["Cambio de tramo",                   tramoSin.label !== tramoCon.label ? `${tramoSin.label} → ${tramoCon.label}` : "Mismo tramo"],
      ]
      const ws4 = XLSX.utils.aoa_to_sheet(ws4Data)
      ws4["!cols"] = [{ wch: 38 }, { wch: 24 }, { wch: 24 }]
      XLSX.utils.book_append_sheet(wb, ws4, "4. Simulación APV")

      // ─── HOJA 5: Proyección Rentabilidad ─────────────────────
      const ws5Rows: (string | number)[][] = [
        ["PROYECCIÓN RENTABILIDAD APV — 10 AÑOS"],
        [`Cliente: ${clientData.nombre} | APV Mensual: $${clp(apvMensual)} | Tasa: ${pct(tasaAnual)} anual`],
        [""],
        ["PARÁMETROS"],
        ["Monto APV Mensual ($)",          clp(apvMensual)],
        ["Monto APV Anual ($)",            clp(apvAnual)],
        ["Tasa de rentabilidad anual",     pct(tasaAnual)],
        ["Tasa mensual equivalente",       `${((tasaMensual) * 100).toFixed(4)}%`],
        ["UF base ($)",                    ufBase],
        ["Crecimiento anual UF",           "3.00%"],
        [""],
        ["TABLA DE PROYECCIÓN ANUAL"],
        [
          "Año",
          "UF Proyectada ($)",
          "Total Aportado (CLP $)",
          "Total Aportado (UF)",
          "Fondo Acumulado (CLP $)",
          "Fondo Acumulado (UF)",
          "Rentabilidad Generada (CLP $)",
          "Rentabilidad Generada (UF)",
          "ROI %",
        ],
      ]

      for (let yr = 1; yr <= 10; yr++) {
        const ufAno        = ufBase * Math.pow(1 + UF_CREC, yr)
        const nMeses       = yr * 12
        // FV anualidad adelantada (aporte al inicio de cada mes)
        const fondoCLP     = apvMensual * ((Math.pow(1 + tasaMensual, nMeses) - 1) / tasaMensual) * (1 + tasaMensual)
        const aporteTot    = apvAnual * yr
        const rentCLP      = fondoCLP - aporteTot
        const roi          = aporteTot > 0 ? rentCLP / aporteTot : 0

        ws5Rows.push([
          yr,
          parseFloat(ufAno.toFixed(2)),
          Math.round(aporteTot),
          parseFloat((aporteTot / ufAno).toFixed(2)),
          Math.round(fondoCLP),
          parseFloat((fondoCLP / ufAno).toFixed(2)),
          Math.round(rentCLP),
          parseFloat((rentCLP / ufAno).toFixed(2)),
          pct(roi),
        ])
      }

      ws5Rows.push([""])
      ws5Rows.push(["METODOLOGÍA"])
      ws5Rows.push(["Fondo Acumulado: FV con aportes al INICIO de cada mes, capitalización mensual compuesta."])
      ws5Rows.push([`Fórmula: Aporte_mensual × ((1+tm)^N − 1) / tm × (1+tm) donde tm = (1+${pct(tasaAnual)})^(1/12) − 1`])
      ws5Rows.push(["UF proyectada: UF_base × (1 + 3%)^N — crecimiento histórico promedio UF Chile."])
      ws5Rows.push(["Rentabilidad Generada = Fondo Acumulado − Total Aportado. El ahorro tributario es dinero del cliente."])

      const ws5 = XLSX.utils.aoa_to_sheet(ws5Rows)
      ws5["!cols"] = [
        { wch: 8 }, { wch: 20 }, { wch: 24 }, { wch: 18 },
        { wch: 26 }, { wch: 20 }, { wch: 28 }, { wch: 22 }, { wch: 12 },
      ]
      XLSX.utils.book_append_sheet(wb, ws5, "5. Proyección Rentabilidad")

      // ─── Descargar ────────────────────────────────────────────
      const nombreArchivo = `Simulador_APV_${clientData.nombre.replace(/\s+/g, "_") || "Cliente"}_${new Date().getFullYear()}.xlsx`
      XLSX.writeFile(wb, nombreArchivo)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={generateExcel}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-all"
      style={{
        background: loading ? "#94a3b8" : "#1a3a5c",
        color: "#fff",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        boxShadow: loading ? "none" : "0 2px 8px rgba(26,58,92,0.25)",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      {loading ? "Generando..." : "Descargar Excel (.xlsx)"}
    </button>
  )
}
