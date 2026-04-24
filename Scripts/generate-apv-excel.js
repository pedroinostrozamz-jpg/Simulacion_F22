import ExcelJS from "exceljs"
import { writeFileSync } from "fs"

const workbook = new ExcelJS.Workbook()
workbook.creator = "Simulador APV"
workbook.created = new Date()

// ─────────────────────────────────────────────
// COLORES Y ESTILOS GLOBALES
// ─────────────────────────────────────────────
const COLORS = {
  azulOscuro:   "FF1A3A5C",
  azulMedio:    "FF2A5A8C",
  azulClaro:    "FFD6E4F7",
  azulMuyClaro: "FFEEF4FC",
  naranja:      "FFEF6C00",
  naranjaClaro: "FFFFF3E0",
  verde:        "FF2E7D32",
  verdeClaro:   "FFE8F5E9",
  rojo:         "FFC62828",
  rojoClaro:    "FFFFEBEE",
  grisOscuro:   "FF4A4A4A",
  grisMedio:    "FF888888",
  grisClaro:    "FFF5F5F5",
  grisBorde:    "FFD0D0D0",
  blanco:       "FFFFFFFF",
  dorado:       "FFF9A825",
  doradoClaro:  "FFFFFDE7",
}

function hdr(cell, text, bgColor, fontColor = "FFFFFFFF", size = 11, bold = true) {
  cell.value = text
  cell.font = { bold, size, color: { argb: fontColor }, name: "Calibri" }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }
  cell.border = {
    top:    { style: "thin", color: { argb: COLORS.grisBorde } },
    bottom: { style: "thin", color: { argb: COLORS.grisBorde } },
    left:   { style: "thin", color: { argb: COLORS.grisBorde } },
    right:  { style: "thin", color: { argb: COLORS.grisBorde } },
  }
}

function label(cell, text, indent = false) {
  cell.value = text
  cell.font = { size: 10, color: { argb: COLORS.grisOscuro }, name: "Calibri", italic: indent }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.grisClaro } }
  cell.alignment = { horizontal: "left", vertical: "middle", wrapText: true }
  cell.border = {
    top:    { style: "hair", color: { argb: COLORS.grisBorde } },
    bottom: { style: "hair", color: { argb: COLORS.grisBorde } },
    left:   { style: "thin", color: { argb: COLORS.grisBorde } },
    right:  { style: "hair", color: { argb: COLORS.grisBorde } },
  }
}

function inputCell(cell, value = "", fmt = null, bgColor = COLORS.blanco) {
  if (value !== "") cell.value = value
  cell.font = { size: 11, color: { argb: COLORS.azulOscuro }, name: "Calibri", bold: true }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cell.alignment = { horizontal: "right", vertical: "middle" }
  cell.border = {
    top:    { style: "thin", color: { argb: COLORS.azulMedio } },
    bottom: { style: "double", color: { argb: COLORS.azulMedio } },
    left:   { style: "hair", color: { argb: COLORS.grisBorde } },
    right:  { style: "thin", color: { argb: COLORS.grisBorde } },
  }
  if (fmt) cell.numFmt = fmt
}

function formulaCell(cell, formula, fmt = null, bgColor = COLORS.azulMuyClaro, fontColor = COLORS.azulOscuro) {
  cell.value = { formula }
  cell.font = { size: 11, color: { argb: fontColor }, name: "Calibri", bold: true }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cell.alignment = { horizontal: "right", vertical: "middle" }
  cell.border = {
    top:    { style: "hair", color: { argb: COLORS.grisBorde } },
    bottom: { style: "hair", color: { argb: COLORS.grisBorde } },
    left:   { style: "hair", color: { argb: COLORS.grisBorde } },
    right:  { style: "thin", color: { argb: COLORS.grisBorde } },
  }
  if (fmt) cell.numFmt = fmt
}

function sectionTitle(ws, row, col, text, mergeEnd, bgColor = COLORS.azulOscuro) {
  const cell = ws.getCell(row, col)
  cell.value = text
  cell.font = { bold: true, size: 12, color: { argb: COLORS.blanco }, name: "Calibri" }
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cell.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
  ws.mergeCells(row, col, row, mergeEnd)
  ws.getRow(row).height = 22
}

function divider(ws, row, cols = 8) {
  for (let c = 1; c <= cols; c++) {
    const cell = ws.getCell(row, c)
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMedio } }
  }
  ws.getRow(row).height = 4
}

// ═══════════════════════════════════════════════════════
// HOJA 1 — DATOS CLIENTE
// ═══════════════════════════════════════════════════════
const ws1 = workbook.addWorksheet("1. Datos Cliente", {
  views: [{ showGridLines: false }],
  pageSetup: { paperSize: 9, orientation: "portrait", fitToPage: true, fitToWidth: 1 },
})

ws1.columns = [
  { width: 3 },   // A - margen
  { width: 28 },  // B - etiqueta
  { width: 32 },  // C - valor
  { width: 3 },   // D - separador
  { width: 28 },  // E - etiqueta
  { width: 32 },  // F - valor
  { width: 3 },   // G - margen
]

// Encabezado principal
ws1.mergeCells("A1:G1")
const title1 = ws1.getCell("A1")
title1.value = "SIMULADOR APV — GLOBAL COMPLEMENTARIO 2026"
title1.font = { bold: true, size: 16, color: { argb: COLORS.blanco }, name: "Calibri" }
title1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
title1.alignment = { horizontal: "center", vertical: "middle" }
ws1.getRow(1).height = 36

ws1.mergeCells("A2:G2")
const sub1 = ws1.getCell("A2")
sub1.value = "Herramienta de análisis tributario y proyección de rentabilidad APV"
sub1.font = { size: 10, color: { argb: COLORS.azulMedio }, name: "Calibri", italic: true }
sub1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMuyClaro } }
sub1.alignment = { horizontal: "center", vertical: "middle" }
ws1.getRow(2).height = 18

ws1.getRow(3).height = 10

// Sección datos cliente
sectionTitle(ws1, 4, 1, "  DATOS DEL CLIENTE", 7, COLORS.azulOscuro)

const clientRows = [
  ["Nombre completo", "", "RUT", ""],
  ["Correo electrónico", "", "Teléfono", ""],
  ["Nombre asesor", "", "Fecha de simulación", new Date()],
  ["Empresa / Empleador", "", "Año tributario", 2025],
]

let r = 5
for (const [l1, v1, l2, v2] of clientRows) {
  ws1.getRow(r).height = 24
  label(ws1.getCell(r, 2), l1)
  inputCell(ws1.getCell(r, 3), v1)
  label(ws1.getCell(r, 5), l2)
  const vc = ws1.getCell(r, 6)
  if (v2 instanceof Date) {
    inputCell(vc, v2, "DD/MM/YYYY")
  } else {
    inputCell(vc, v2, v2 ? "#,##0" : null)
  }
  r++
}

// Instrucciones
ws1.getRow(10).height = 10
sectionTitle(ws1, 11, 1, "  INSTRUCCIONES DE USO", 7, COLORS.naranja)
const instrucciones = [
  "1. Complete los datos del cliente en esta hoja.",
  "2. En la hoja '2. Formulario 22' ingrese los códigos del F22 compacto del cliente.",
  "3. La hoja '3. Tramo Impositivo' calculará automáticamente el tramo IGC del cliente.",
  "4. En la hoja '4. Simulación APV' ingrese el monto APV a evaluar.",
  "5. La hoja '5. Proyección' mostrará la rentabilidad a 10 años en CLP y UF.",
  "→  Las celdas con borde azul son de ingreso de datos. Las de fondo azul claro son calculadas.",
]
for (const instr of instrucciones) {
  r = ws1.rowCount + 1
  ws1.getRow(r).height = 18
  ws1.mergeCells(r, 2, r, 6)
  const c = ws1.getCell(r, 2)
  c.value = instr
  c.font = { size: 10, color: { argb: COLORS.grisOscuro }, name: "Calibri" }
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranjaClaro } }
  c.alignment = { horizontal: "left", vertical: "middle", indent: 1 }
  c.border = { bottom: { style: "hair", color: { argb: COLORS.grisBorde } } }
}

// ═══════════════════════════════════════════════════════
// HOJA 2 — FORMULARIO 22
// ═══════════════════════════════════════════════════════
const ws2 = workbook.addWorksheet("2. Formulario 22", {
  views: [{ showGridLines: false }],
})

ws2.columns = [
  { width: 3 },   // A
  { width: 10 },  // B - código
  { width: 42 },  // C - descripción
  { width: 22 },  // D - valor
  { width: 3 },   // E - sep
  { width: 10 },  // F - código
  { width: 42 },  // G - descripción
  { width: 22 },  // H - valor
  { width: 3 },   // I
]

ws2.mergeCells("A1:I1")
const title2 = ws2.getCell("A1")
title2.value = "FORMULARIO 22 COMPACTO — DATOS TRIBUTARIOS"
title2.font = { bold: true, size: 14, color: { argb: COLORS.blanco }, name: "Calibri" }
title2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranja } }
title2.alignment = { horizontal: "center", vertical: "middle" }
ws2.getRow(1).height = 30

ws2.mergeCells("A2:I2")
const sub2 = ws2.getCell("A2")
sub2.value = `Cliente: — Vinculado desde hoja '1. Datos Cliente'`
sub2.value = { formula: `="Cliente: "&'1. Datos Cliente'!C5` }
sub2.font = { size: 10, italic: true, color: { argb: COLORS.naranja }, name: "Calibri" }
sub2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranjaClaro } }
sub2.alignment = { horizontal: "center", vertical: "middle" }
ws2.getRow(2).height = 18

ws2.getRow(3).height = 8

// Cabeceras columnas
const f22Headers = ws2.getRow(4)
f22Headers.height = 22
const hdrLabels = ["Cód.", "Descripción", "Valor ($)", "", "Cód.", "Descripción", "Valor ($)"]
;[2, 3, 4, 6, 7, 8].forEach((col, i) => {
  hdr(ws2.getCell(4, col), hdrLabels[[0,1,2,3,4,5][i]], COLORS.naranja, COLORS.blanco, 10)
})

// Filas del F22 — [cod_izq, desc_izq, cod_der, desc_der]
const f22Rows = [
  ["1098", "Sueldos, pensiones y otras rentas similares de fuente nacional", "110", "Rentas percibidas de los arts. 42 N°2 (honorarios) y 48 (rem. directores S.A.) LIR"],
  ["155",  "Rentas de capitales mobiliarios (art. 20 N°2 LIR), mayor valor en la enajenación o rescate de cuotas fondos mutuos y acciones", "157", "IGC o IUSC, según tabla (arts. 47, 52 o 52 bis LIR)"],
  ["158",  "SUB TOTAL (Si declara IA trasladar a código 133 o 32)", "161", "Rta. Art. 42 N°1"],
  ["162",  "Crédito al IGC o IUSC por IUSC, según art. 56 N°2 LIR", "169", "Pérdida en operaciones de capitales mobiliarios y ganancias de capital (arts. 54 N°1 y 62 LIR)"],
  ["170",  "BASE IMPONIBLE ANUAL DE IUSC o IGC (registre solo si diferencia es positiva)", "198", "Retenciones por rentas declaradas en código 110 (Recuadro N°1)"],
  ["304",  "IGC O IUSC, DÉBITO FISCAL Y/O TASA ADICIONAL DETERMINADO", "619", "Impuesto Retenido del Total Rentas y Retenciones"],
  ["305",  "RESULTADO LIQUIDACIÓN ANUAL IMPUESTO A LA RENTA (negativo = devolución)", "461", "Honorarios Anuales Con Retención"],
  ["85",   "SALDO A FAVOR (Cód. 305 negativo)", "87",  "MONTO DEVOLUCIÓN SOLICITADA"],
  ["750",  "Intereses pagados por créditos con garantía hipotecaria, art. 55 bis LIR", "547", "Total Ingresos Brutos"],
  ["1849", "Rentas del arrendamiento, subarrendamiento, usufructo o cesión de bienes raíces agrícolas y no agrícolas", "955", "Otras rentas propias y/o de terceros, provenientes de empresas que determinan su renta efectiva sin contabilidad completa, art. 14 B) N°1 LIR"],
  ["1637", "Crédito al IGC por Impuesto Territorial pagado por explotación de bienes raíces no agrícolas, art. 56 N°5 LIR", "1867", "Rentas de capitales mobiliarios (art. 20 N°2 LIR)"],
]

// Mapeo de celdas F22 para referencia en otras hojas
// F22_ROW_MAP: cód -> dirección celda de valor
// Col D = izquierdo, Col H = derecho
const F22_MAP = {}
let f22r = 5
for (const [cl, dl, cr, dr] of f22Rows) {
  ws2.getRow(f22r).height = 36

  // Izquierda
  const codL = ws2.getCell(f22r, 2)
  codL.value = cl
  codL.font = { bold: true, size: 10, color: { argb: COLORS.blanco }, name: "Calibri" }
  codL.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranja } }
  codL.alignment = { horizontal: "center", vertical: "middle" }
  codL.border = { top: { style: "thin", color: { argb: COLORS.grisBorde } }, bottom: { style: "thin", color: { argb: COLORS.grisBorde } } }

  label(ws2.getCell(f22r, 3), dl)
  ws2.getCell(f22r, 3).alignment = { vertical: "middle", wrapText: true }

  inputCell(ws2.getCell(f22r, 4), "", "#,##0")
  F22_MAP[cl] = `'2. Formulario 22'!D${f22r}`

  // Derecha
  const codR = ws2.getCell(f22r, 6)
  codR.value = cr
  codR.font = { bold: true, size: 10, color: { argb: COLORS.blanco }, name: "Calibri" }
  codR.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranja } }
  codR.alignment = { horizontal: "center", vertical: "middle" }
  codR.border = { top: { style: "thin", color: { argb: COLORS.grisBorde } }, bottom: { style: "thin", color: { argb: COLORS.grisBorde } } }

  label(ws2.getCell(f22r, 7), dr)
  ws2.getCell(f22r, 7).alignment = { vertical: "middle", wrapText: true }

  inputCell(ws2.getCell(f22r, 8), "", "#,##0")
  F22_MAP[cr] = `'2. Formulario 22'!H${f22r}`

  f22r++
}

// ═══════════════════════════════════════════════════════
// HOJA 3 — TRAMO IMPOSITIVO
// ═══════════════════════════════════════════════════════
const ws3 = workbook.addWorksheet("3. Tramo Impositivo", {
  views: [{ showGridLines: false }],
})

ws3.columns = [
  { width: 3 },
  { width: 22 },
  { width: 22 },
  { width: 14 },
  { width: 24 },
  { width: 28 },
  { width: 3 },
]

ws3.mergeCells("A1:G1")
const title3 = ws3.getCell("A1")
title3.value = "TRAMO IMPOSITIVO — GLOBAL COMPLEMENTARIO 2026"
title3.font = { bold: true, size: 14, color: { argb: COLORS.blanco }, name: "Calibri" }
title3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
title3.alignment = { horizontal: "center", vertical: "middle" }
ws3.getRow(1).height = 30

// Tabla tramos
sectionTitle(ws3, 3, 1, "  TABLA DE TRAMOS IGC 2026", 6, COLORS.azulOscuro)

const tramosHdr = ["Desde ($)", "Hasta ($)", "Factor", "Cantidad a Rebajar ($)", "Descripción tramo"]
;[2,3,4,5,6].forEach((col, i) => {
  hdr(ws3.getCell(4, col), tramosHdr[i], COLORS.azulMedio)
})
ws3.getRow(4).height = 22

// Datos tramos 2026 — [desde, hasta, factor, rebaja, label]
const tramos = [
  [0,             11265804,    0,     0,             "Exento"],
  [11265804.01,   25035120,    0.04,  450632.16,     "4% — Tramo 2"],
  [25035120.01,   41725200,    0.08,  1452036.96,    "8% — Tramo 3"],
  [41725200.01,   58415280,    0.135, 3746922.96,    "13.5% — Tramo 4"],
  [58415280.01,   75105360,    0.23,  9296374.56,    "23% — Tramo 5"],
  [75105360.01,   100140480,   0.304, 14854171.20,   "30.4% — Tramo 6"],
  [100140480.01,  258696240,   0.35,  19460633.28,   "35% — Tramo 7"],
  [258696240.01,  9999999999,  0.40,  32395445.28,   "40% — Tramo 8"],
]

// Nombres de rango para los tramos (para IFS en hoja 4)
const TRAMO_START_ROW = 5

for (let i = 0; i < tramos.length; i++) {
  const [desde, hasta, factor, rebaja, lbl] = tramos[i]
  const row = ws3.getRow(TRAMO_START_ROW + i)
  row.height = 20

  const bgColor = i % 2 === 0 ? COLORS.azulMuyClaro : COLORS.blanco

  const cDesde = ws3.getCell(TRAMO_START_ROW + i, 2)
  cDesde.value = desde
  cDesde.numFmt = '#,##0.00'
  cDesde.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cDesde.font = { size: 10, name: "Calibri" }
  cDesde.alignment = { horizontal: "right", vertical: "middle" }

  const cHasta = ws3.getCell(TRAMO_START_ROW + i, 3)
  cHasta.value = i < 7 ? hasta : null
  cHasta.numFmt = '#,##0.00'
  if (i === 7) cHasta.value = "y más"
  cHasta.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cHasta.font = { size: 10, name: "Calibri" }
  cHasta.alignment = { horizontal: "right", vertical: "middle" }

  const cFactor = ws3.getCell(TRAMO_START_ROW + i, 4)
  cFactor.value = i === 0 ? "Exento" : factor
  cFactor.numFmt = i === 0 ? "@" : "0.000"
  cFactor.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cFactor.font = { size: 10, bold: true, name: "Calibri", color: { argb: COLORS.azulOscuro } }
  cFactor.alignment = { horizontal: "center", vertical: "middle" }

  const cRebaja = ws3.getCell(TRAMO_START_ROW + i, 5)
  cRebaja.value = rebaja
  cRebaja.numFmt = '#,##0.00'
  cRebaja.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cRebaja.font = { size: 10, name: "Calibri" }
  cRebaja.alignment = { horizontal: "right", vertical: "middle" }

  const cLabel = ws3.getCell(TRAMO_START_ROW + i, 6)
  cLabel.value = lbl
  cLabel.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bgColor } }
  cLabel.font = { size: 10, name: "Calibri", color: { argb: COLORS.grisOscuro } }
  cLabel.alignment = { horizontal: "left", vertical: "middle", indent: 1 }

  // Borde exterior tabla
  for (let c = 2; c <= 6; c++) {
    const cell = ws3.getCell(TRAMO_START_ROW + i, c)
    cell.border = {
      top:    { style: "hair", color: { argb: COLORS.grisBorde } },
      bottom: { style: "hair", color: { argb: COLORS.grisBorde } },
      left:   { style: "thin", color: { argb: COLORS.grisBorde } },
      right:  { style: "thin", color: { argb: COLORS.grisBorde } },
    }
  }
}

// Sección: tramo del cliente
const tcRow = TRAMO_START_ROW + tramos.length + 2
sectionTitle(ws3, tcRow, 1, "  RESULTADO — TRAMO DEL CLIENTE", 6, COLORS.verde)

const base170 = F22_MAP["170"]  // referencia a celda Base Imponible F22

ws3.getRow(tcRow + 1).height = 24
label(ws3.getCell(tcRow + 1, 2), "Base Imponible Anual (Cód. 170)")
formulaCell(ws3.getCell(tcRow + 1, 3), `${base170}`, "#,##0", COLORS.azulMuyClaro, COLORS.azulOscuro)
ws3.mergeCells(tcRow + 1, 3, tcRow + 1, 6)

ws3.getRow(tcRow + 2).height = 24
label(ws3.getCell(tcRow + 2, 2), "Tramo IGC aplicable")
const tramolabel = `IFS(${base170}<=11265804,"Exento",${base170}<=25035120,"4% — Tramo 2",${base170}<=41725200,"8% — Tramo 3",${base170}<=58415280,"13.5% — Tramo 4",${base170}<=75105360,"23% — Tramo 5",${base170}<=100140480,"30.4% — Tramo 6",${base170}<=258696240,"35% — Tramo 7",TRUE,"40% — Tramo 8")`
formulaCell(ws3.getCell(tcRow + 2, 3), tramolabel, "@", COLORS.verdeClaro, COLORS.verde)
ws3.mergeCells(tcRow + 2, 3, tcRow + 2, 6)

ws3.getRow(tcRow + 3).height = 24
label(ws3.getCell(tcRow + 3, 2), "Factor aplicable")
const factorFormula = `IFS(${base170}<=11265804,0,${base170}<=25035120,0.04,${base170}<=41725200,0.08,${base170}<=58415280,0.135,${base170}<=75105360,0.23,${base170}<=100140480,0.304,${base170}<=258696240,0.35,TRUE,0.40)`
formulaCell(ws3.getCell(tcRow + 3, 3), factorFormula, "0.000", COLORS.azulMuyClaro)
ws3.mergeCells(tcRow + 3, 3, tcRow + 3, 6)

ws3.getRow(tcRow + 4).height = 24
label(ws3.getCell(tcRow + 4, 2), "Cantidad a rebajar ($)")
const rebajaFormula = `IFS(${base170}<=11265804,0,${base170}<=25035120,450632.16,${base170}<=41725200,1452036.96,${base170}<=58415280,3746922.96,${base170}<=75105360,9296374.56,${base170}<=100140480,14854171.20,${base170}<=258696240,19460633.28,TRUE,32395445.28)`
formulaCell(ws3.getCell(tcRow + 4, 3), rebajaFormula, "#,##0.00", COLORS.azulMuyClaro)
ws3.mergeCells(tcRow + 4, 3, tcRow + 4, 6)

ws3.getRow(tcRow + 5).height = 24
label(ws3.getCell(tcRow + 5, 2), "IGC Calculado ($)")
const igcFormula = `MAX(0,${base170}*${factorFormula}-${rebajaFormula})`
formulaCell(ws3.getCell(tcRow + 5, 3), igcFormula, "#,##0", COLORS.azulOscuro, COLORS.blanco)
ws3.getCell(tcRow + 5, 3).font = { bold: true, size: 12, color: { argb: COLORS.blanco }, name: "Calibri" }
ws3.mergeCells(tcRow + 5, 3, tcRow + 5, 6)

ws3.getRow(tcRow + 6).height = 24
label(ws3.getCell(tcRow + 6, 2), "Tasa Efectiva (%)")
const tasaEfFormula = `IF(${base170}>0,${igcFormula}/${base170},0)`
formulaCell(ws3.getCell(tcRow + 6, 3), tasaEfFormula, "0.00%", COLORS.azulMuyClaro)
ws3.mergeCells(tcRow + 6, 3, tcRow + 6, 6)

// ═══════════════════════════════════════════════════════
// HOJA 4 — SIMULACIÓN APV
// ═══════════════════════════════════════════════════════
const ws4 = workbook.addWorksheet("4. Simulación APV", {
  views: [{ showGridLines: false }],
})

ws4.columns = [
  { width: 3 },
  { width: 36 },
  { width: 24 },
  { width: 3 },
  { width: 36 },
  { width: 24 },
  { width: 3 },
]

ws4.mergeCells("A1:G1")
const title4 = ws4.getCell("A1")
title4.value = "SIMULACIÓN APV — IMPACTO TRIBUTARIO"
title4.font = { bold: true, size: 14, color: { argb: COLORS.blanco }, name: "Calibri" }
title4.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
title4.alignment = { horizontal: "center", vertical: "middle" }
ws4.getRow(1).height = 30

ws4.mergeCells("A2:G2")
ws4.getCell("A2").value = { formula: `="Cliente: "&'1. Datos Cliente'!C5` }
ws4.getCell("A2").font = { size: 10, italic: true, color: { argb: COLORS.azulMedio }, name: "Calibri" }
ws4.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMuyClaro } }
ws4.getCell("A2").alignment = { horizontal: "center", vertical: "middle" }
ws4.getRow(2).height = 18

ws4.getRow(3).height = 8

// Parámetros APV
sectionTitle(ws4, 4, 1, "  PARÁMETROS APV (Régimen A)", 6, COLORS.azulOscuro)

ws4.getRow(5).height = 24
label(ws4.getCell(5, 2), "Monto APV Mensual ($)")
inputCell(ws4.getCell(5, 3), 250000, "#,##0", "FFFFFDE7")
const APV_MENSUAL = "'4. Simulación APV'!C5"
const APV_ANUAL   = `${APV_MENSUAL}*12`

ws4.getRow(6).height = 24
label(ws4.getCell(6, 2), "Monto APV Anual ($) — calculado")
formulaCell(ws4.getCell(6, 3), APV_ANUAL, "#,##0")

ws4.getRow(7).height = 8

// Dos columnas: SIN APV | CON APV
sectionTitle(ws4, 8, 2, "SIN APV — Situación Actual", 3, COLORS.grisMedio)
sectionTitle(ws4, 8, 5, "CON APV — Proyección", 6, COLORS.azulMedio)

// Referencias de celdas de la hoja 3
const factorCell  = `'3. Tramo Impositivo'!C${tcRow+3}`
const rebajaCell  = `'3. Tramo Impositivo'!C${tcRow+4}`
const igcSinApvCell = `'3. Tramo Impositivo'!C${tcRow+5}`

const simRows = [
  {
    label: "Base Imponible ($) [Cód. 170]",
    sinFormula: `${base170}`,
    conFormula: `MAX(0,${base170}-${APV_ANUAL})`,
    fmt: "#,##0",
  },
  {
    label: "Tramo IGC",
    sinFormula: `'3. Tramo Impositivo'!C${tcRow+2}`,
    conFormula: `IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,"Exento",MAX(0,${base170}-${APV_ANUAL})<=25035120,"4% — Tramo 2",MAX(0,${base170}-${APV_ANUAL})<=41725200,"8% — Tramo 3",MAX(0,${base170}-${APV_ANUAL})<=58415280,"13.5% — Tramo 4",MAX(0,${base170}-${APV_ANUAL})<=75105360,"23% — Tramo 5",MAX(0,${base170}-${APV_ANUAL})<=100140480,"30.4% — Tramo 6",MAX(0,${base170}-${APV_ANUAL})<=258696240,"35% — Tramo 7",TRUE,"40% — Tramo 8")`,
    fmt: "@",
  },
  {
    label: "Factor IGC",
    sinFormula: factorCell,
    conFormula: `IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,0.04,MAX(0,${base170}-${APV_ANUAL})<=41725200,0.08,MAX(0,${base170}-${APV_ANUAL})<=58415280,0.135,MAX(0,${base170}-${APV_ANUAL})<=75105360,0.23,MAX(0,${base170}-${APV_ANUAL})<=100140480,0.304,MAX(0,${base170}-${APV_ANUAL})<=258696240,0.35,TRUE,0.40)`,
    fmt: "0.000",
  },
  {
    label: "Cantidad a Rebajar ($)",
    sinFormula: rebajaCell,
    conFormula: `IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,450632.16,MAX(0,${base170}-${APV_ANUAL})<=41725200,1452036.96,MAX(0,${base170}-${APV_ANUAL})<=58415280,3746922.96,MAX(0,${base170}-${APV_ANUAL})<=75105360,9296374.56,MAX(0,${base170}-${APV_ANUAL})<=100140480,14854171.20,MAX(0,${base170}-${APV_ANUAL})<=258696240,19460633.28,TRUE,32395445.28)`,
    fmt: "#,##0.00",
  },
  {
    label: "IGC Calculado ($)",
    sinFormula: igcSinApvCell,
    conFormula: `MAX(0,(MAX(0,${base170}-${APV_ANUAL})*IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,0.04,MAX(0,${base170}-${APV_ANUAL})<=41725200,0.08,MAX(0,${base170}-${APV_ANUAL})<=58415280,0.135,MAX(0,${base170}-${APV_ANUAL})<=75105360,0.23,MAX(0,${base170}-${APV_ANUAL})<=100140480,0.304,MAX(0,${base170}-${APV_ANUAL})<=258696240,0.35,TRUE,0.40))-IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,450632.16,MAX(0,${base170}-${APV_ANUAL})<=41725200,1452036.96,MAX(0,${base170}-${APV_ANUAL})<=58415280,3746922.96,MAX(0,${base170}-${APV_ANUAL})<=75105360,9296374.56,MAX(0,${base170}-${APV_ANUAL})<=100140480,14854171.20,MAX(0,${base170}-${APV_ANUAL})<=258696240,19460633.28,TRUE,32395445.28))`,
    fmt: "#,##0",
    highlight: true,
  },
  {
    label: "Tasa Efectiva (%)",
    sinFormula: `IF(${base170}>0,${igcSinApvCell}/${base170},0)`,
    conFormula: `IF(MAX(0,${base170}-${APV_ANUAL})>0,(MAX(0,(MAX(0,${base170}-${APV_ANUAL})*IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,0.04,MAX(0,${base170}-${APV_ANUAL})<=41725200,0.08,MAX(0,${base170}-${APV_ANUAL})<=58415280,0.135,MAX(0,${base170}-${APV_ANUAL})<=75105360,0.23,MAX(0,${base170}-${APV_ANUAL})<=100140480,0.304,MAX(0,${base170}-${APV_ANUAL})<=258696240,0.35,TRUE,0.40))-IFS(MAX(0,${base170}-${APV_ANUAL})<=11265804,0,MAX(0,${base170}-${APV_ANUAL})<=25035120,450632.16,MAX(0,${base170}-${APV_ANUAL})<=41725200,1452036.96,MAX(0,${base170}-${APV_ANUAL})<=58415280,3746922.96,MAX(0,${base170}-${APV_ANUAL})<=75105360,9296374.56,MAX(0,${base170}-${APV_ANUAL})<=100140480,14854171.20,MAX(0,${base170}-${APV_ANUAL})<=258696240,19460633.28,TRUE,32395445.28)))/MAX(0,${base170}-${APV_ANUAL}),0)`,
    fmt: "0.00%",
  },
]

// Referencia a IGC Con APV — necesitamos la fila donde se calcula
let apvSimRowStart = 9
for (let i = 0; i < simRows.length; i++) {
  const { label: lbl, sinFormula, conFormula, fmt, highlight } = simRows[i]
  const row = apvSimRowStart + i
  ws4.getRow(row).height = 22

  label(ws4.getCell(row, 2), lbl)
  ws4.getCell(row, 2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: highlight ? COLORS.azulMuyClaro : COLORS.grisClaro } }
  if (highlight) ws4.getCell(row, 2).font = { bold: true, size: 10, name: "Calibri", color: { argb: COLORS.azulOscuro } }

  formulaCell(ws4.getCell(row, 3), sinFormula, fmt, highlight ? COLORS.azulMedio : COLORS.blanco, highlight ? COLORS.blanco : COLORS.grisOscuro)
  formulaCell(ws4.getCell(row, 5), lbl, "@", COLORS.grisClaro, COLORS.grisOscuro)
  ws4.getCell(row, 5).value = lbl
  ws4.getCell(row, 5).font = { size: 10, color: { argb: COLORS.grisOscuro }, name: "Calibri", italic: highlight }
  formulaCell(ws4.getCell(row, 6), conFormula, fmt, highlight ? COLORS.azulOscuro : COLORS.azulMuyClaro, highlight ? COLORS.blanco : COLORS.azulOscuro)
}

// IGC Con APV referencia (fila del highlight = apvSimRowStart + 4)
const IGC_CON_APV = `'4. Simulación APV'!F${apvSimRowStart + 4}`
const IGC_SIN_APV = `'4. Simulación APV'!C${apvSimRowStart + 4}`

// Resultado de liquidación
const divRow = apvSimRowStart + simRows.length + 1
ws4.getRow(divRow).height = 10
sectionTitle(ws4, divRow, 2, "RESULTADO LIQUIDACIÓN (Cód. 305)", 3, COLORS.azulMedio)
sectionTitle(ws4, divRow, 5, "RESULTADO LIQUIDACIÓN CON APV", 6, COLORS.verde)

const cod305 = F22_MAP["305"]
const retenciones = F22_MAP["619"]  // retenciones totales

// El resultado = retenciones - IGC determinado (negativo = devolución)
// Cód 305 ya ingresado directo del F22. Con APV calculamos la diferencia.
const resLiq = [
  {
    label: "Resultado Liquidación ($) [Cód. 305]",
    sinF: `${cod305}`,
    conF: `${cod305}-(${IGC_SIN_APV}-${IGC_CON_APV})`,
    fmt: "#,##0",
  },
  {
    label: "Estado",
    sinF: `IF(${cod305}<0,"DEVOLUCIÓN",IF(${cod305}=0,"SIN RESULTADO","PAGO"))`,
    conF: `IF(${cod305}-(${IGC_SIN_APV}-${IGC_CON_APV})<0,"DEVOLUCIÓN",IF(${cod305}-(${IGC_SIN_APV}-${IGC_CON_APV})=0,"SIN RESULTADO","PAGO"))`,
    fmt: "@",
  },
  {
    label: "Monto Devolución / Pago ($)",
    sinF: `ABS(${cod305})`,
    conF: `ABS(${cod305}-(${IGC_SIN_APV}-${IGC_CON_APV}))`,
    fmt: "#,##0",
    highlight: true,
  },
  {
    label: "Mayor devolución gracias al APV ($)",
    sinF: `""`,
    conF: `MAX(0,${IGC_SIN_APV}-${IGC_CON_APV})`,
    fmt: "#,##0",
    destacado: true,
  },
]

for (let i = 0; i < resLiq.length; i++) {
  const { label: lbl, sinF, conF, fmt, highlight, destacado } = resLiq[i]
  const row = divRow + 1 + i
  ws4.getRow(row).height = 24

  label(ws4.getCell(row, 2), lbl)
  if (highlight || destacado) ws4.getCell(row, 2).font = { bold: true, size: 10, name: "Calibri" }

  formulaCell(ws4.getCell(row, 3), sinF, fmt,
    highlight ? COLORS.azulMedio : COLORS.blanco,
    highlight ? COLORS.blanco : COLORS.grisOscuro)

  ws4.getCell(row, 5).value = lbl
  ws4.getCell(row, 5).font = { size: 10, color: { argb: COLORS.grisOscuro }, name: "Calibri", bold: destacado || highlight }
  ws4.getCell(row, 5).fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.grisClaro } }

  formulaCell(ws4.getCell(row, 6), conF, fmt,
    destacado ? COLORS.verde : highlight ? COLORS.verde : COLORS.verdeClaro,
    destacado ? COLORS.blanco : highlight ? COLORS.blanco : COLORS.verde)
}

// ═══════════════════════════════════════════════════════
// HOJA 5 — PROYECCIÓN RENTABILIDAD
// ═══════════════════════════════════════════════════════
const ws5 = workbook.addWorksheet("5. Proyección Rentabilidad", {
  views: [{ showGridLines: false }],
})

ws5.columns = [
  { width: 3 },   // A
  { width: 8 },   // B - Año
  { width: 18 },  // C - UF año
  { width: 20 },  // D - Aporte total CLP
  { width: 16 },  // E - Aporte total UF
  { width: 22 },  // F - Fondo acumulado CLP
  { width: 18 },  // G - Fondo acumulado UF
  { width: 22 },  // H - Rentabilidad generada CLP
  { width: 18 },  // I - Rentabilidad generada UF
  { width: 14 },  // J - ROI %
  { width: 3 },   // K
]

ws5.mergeCells("A1:K1")
const title5 = ws5.getCell("A1")
title5.value = "PROYECCIÓN RENTABILIDAD APV — 10 AÑOS"
title5.font = { bold: true, size: 14, color: { argb: COLORS.blanco }, name: "Calibri" }
title5.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
title5.alignment = { horizontal: "center", vertical: "middle" }
ws5.getRow(1).height = 30

ws5.mergeCells("A2:K2")
ws5.getCell("A2").value = { formula: `="Cliente: "&'1. Datos Cliente'!C5` }
ws5.getCell("A2").font = { size: 10, italic: true, color: { argb: COLORS.azulMedio }, name: "Calibri" }
ws5.getCell("A2").fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMuyClaro } }
ws5.getCell("A2").alignment = { horizontal: "center", vertical: "middle" }
ws5.getRow(2).height = 18

// Parámetros
sectionTitle(ws5, 4, 1, "  PARÁMETROS DE PROYECCIÓN", 10, COLORS.azulOscuro)

ws5.getRow(5).height = 22
label(ws5.getCell(5, 2), "Monto APV Mensual ($)")
ws5.mergeCells(5, 3, 5, 4)
formulaCell(ws5.getCell(5, 3), `${APV_MENSUAL}`, "#,##0")

ws5.getRow(6).height = 22
label(ws5.getCell(6, 2), "Monto APV Anual ($)")
ws5.mergeCells(6, 3, 6, 4)
formulaCell(ws5.getCell(6, 3), `${APV_MENSUAL}*12`, "#,##0")

ws5.getRow(7).height = 22
label(ws5.getCell(7, 2), "Tasa de rentabilidad anual (%)")
ws5.mergeCells(7, 3, 7, 4)
inputCell(ws5.getCell(7, 3), 0.118, "0.00%", "FFFFFDE7")
const TASA = "'5. Proyección Rentabilidad'!C7"

ws5.getRow(8).height = 22
label(ws5.getCell(8, 2), "Tasa mensual equivalente (%)")
ws5.mergeCells(8, 3, 8, 4)
formulaCell(ws5.getCell(8, 3), `(1+${TASA})^(1/12)-1`, "0.0000%")

ws5.getRow(9).height = 22
label(ws5.getCell(9, 2), "Valor UF base actual ($)")
ws5.mergeCells(9, 3, 9, 4)
inputCell(ws5.getCell(9, 3), 38000, "#,##0.00", "FFFFFDE7")
const UF_BASE = "'5. Proyección Rentabilidad'!C9"

ws5.getRow(10).height = 22
label(ws5.getCell(10, 2), "Crecimiento anual UF (%)")
ws5.mergeCells(10, 3, 10, 4)
inputCell(ws5.getCell(10, 3), 0.03, "0.00%", "FFFFFDE7")
const UF_CREC = "'5. Proyección Rentabilidad'!C10"

ws5.getRow(11).height = 8

// Encabezados tabla
sectionTitle(ws5, 12, 1, "  TABLA DE PROYECCIÓN ANUAL", 10, COLORS.azulOscuro)
ws5.getRow(12).height = 24

const colHdrs = [
  { col: 2, label: "Año", bg: COLORS.azulOscuro },
  { col: 3, label: "UF Proyectada ($)", bg: COLORS.azulMedio },
  { col: 4, label: "Total Aportado (CLP)", bg: COLORS.azulMedio },
  { col: 5, label: "Total Aportado (UF)", bg: COLORS.dorado },
  { col: 6, label: "Fondo Acumulado (CLP)", bg: COLORS.azulMedio },
  { col: 7, label: "Fondo Acumulado (UF)", bg: COLORS.dorado },
  { col: 8, label: "Rentabilidad Generada (CLP)", bg: COLORS.verde },
  { col: 9, label: "Rentabilidad Generada (UF)", bg: COLORS.dorado },
  { col: 10, label: "ROI %", bg: COLORS.naranja },
]
for (const { col, label: lbl, bg } of colHdrs) {
  hdr(ws5.getCell(13, col), lbl, bg, COLORS.blanco, 9)
}
ws5.getRow(13).height = 30

// ─── Tabla dinámica: cada fila calcula el fondo mes a mes usando la tasa mensual ───
// Fórmula de valor futuro con aportes al INICIO de cada mes (anualidad adelantada):
// FV = Fondo_anterior * (1+tm)^12 + Aporte_mensual * ((1+tm)^12 - 1)/tm * (1+tm)
// Esto se simplifica en Excel como:
// FV(tasa_mensual, 12, -aporte_mensual, -fondo_anterior_acumulado, 1)
// ExcelJS no ejecuta FV() nativamente en escritura, pero la escribe como fórmula válida.

const TASA_M = `(1+${TASA})^(1/12)-1`
const APV_M  = `${APV_MENSUAL}`

const PROJ_START = 14
for (let yr = 1; yr <= 10; yr++) {
  const row = PROJ_START + yr - 1
  ws5.getRow(row).height = 20
  const bg = yr % 2 === 0 ? COLORS.azulMuyClaro : COLORS.blanco

  // Año
  const cAno = ws5.getCell(row, 2)
  cAno.value = yr
  cAno.font = { bold: true, size: 11, color: { argb: COLORS.blanco }, name: "Calibri" }
  cAno.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
  cAno.alignment = { horizontal: "center", vertical: "middle" }

  // UF proyectada = UF_BASE * (1 + UF_CREC)^año
  const ufFormula = `${UF_BASE}*(1+${UF_CREC})^${yr}`

  const cUF = ws5.getCell(row, 3)
  cUF.value = { formula: ufFormula }
  cUF.numFmt = "#,##0.00"
  cUF.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.doradoClaro } }
  cUF.font = { size: 10, name: "Calibri", color: { argb: COLORS.grisOscuro }, bold: true }
  cUF.alignment = { horizontal: "right", vertical: "middle" }

  // Total aportado CLP
  const aporteTotalFormula = `${APV_M}*12*${yr}`
  const cAporteCLP = ws5.getCell(row, 4)
  cAporteCLP.value = { formula: aporteTotalFormula }
  cAporteCLP.numFmt = "#,##0"
  cAporteCLP.fill = { type: "pattern", pattern: "solid", fgColor: { argb: bg } }
  cAporteCLP.font = { size: 10, name: "Calibri", color: { argb: COLORS.azulOscuro } }
  cAporteCLP.alignment = { horizontal: "right", vertical: "middle" }

  // Total aportado UF
  const cAporteUF = ws5.getCell(row, 5)
  cAporteUF.value = { formula: `${aporteTotalFormula}/(${ufFormula})` }
  cAporteUF.numFmt = "#,##0.00"
  cAporteUF.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.doradoClaro } }
  cAporteUF.font = { size: 10, name: "Calibri", color: { argb: COLORS.grisOscuro } }
  cAporteUF.alignment = { horizontal: "right", vertical: "middle" }

  // Fondo acumulado CLP — FV con aportes al inicio de cada mes, capitalización mensual
  // FV(tasa_mensual, n_meses_totales, -aporte_mensual, 0, 1)
  const nMeses = yr * 12
  const fondoFormula = `FV(${TASA_M},${nMeses},-${APV_M},0,1)`

  const cFondoCLP = ws5.getCell(row, 6)
  cFondoCLP.value = { formula: fondoFormula }
  cFondoCLP.numFmt = "#,##0"
  cFondoCLP.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMuyClaro } }
  cFondoCLP.font = { bold: true, size: 11, name: "Calibri", color: { argb: COLORS.azulOscuro } }
  cFondoCLP.alignment = { horizontal: "right", vertical: "middle" }
  cFondoCLP.border = { right: { style: "medium", color: { argb: COLORS.azulMedio } } }

  // Fondo acumulado UF
  const cFondoUF = ws5.getCell(row, 7)
  cFondoUF.value = { formula: `(${fondoFormula})/(${ufFormula})` }
  cFondoUF.numFmt = "#,##0.00"
  cFondoUF.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.doradoClaro } }
  cFondoUF.font = { bold: true, size: 11, name: "Calibri", color: { argb: COLORS.grisOscuro } }
  cFondoUF.alignment = { horizontal: "right", vertical: "middle" }

  // Rentabilidad generada CLP = Fondo - Total aportado
  const rentFormula = `(${fondoFormula})-(${aporteTotalFormula})`
  const cRentCLP = ws5.getCell(row, 8)
  cRentCLP.value = { formula: rentFormula }
  cRentCLP.numFmt = "#,##0"
  cRentCLP.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.verdeClaro } }
  cRentCLP.font = { bold: true, size: 11, name: "Calibri", color: { argb: COLORS.verde } }
  cRentCLP.alignment = { horizontal: "right", vertical: "middle" }

  // Rentabilidad generada UF
  const cRentUF = ws5.getCell(row, 9)
  cRentUF.value = { formula: `(${rentFormula})/(${ufFormula})` }
  cRentUF.numFmt = "#,##0.00"
  cRentUF.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.doradoClaro } }
  cRentUF.font = { bold: true, size: 11, name: "Calibri", color: { argb: COLORS.grisOscuro } }
  cRentUF.alignment = { horizontal: "right", vertical: "middle" }

  // ROI % = Rentabilidad / Total aportado
  const cROI = ws5.getCell(row, 10)
  cROI.value = { formula: `IF(${aporteTotalFormula}>0,(${rentFormula})/(${aporteTotalFormula}),0)` }
  cROI.numFmt = "0.00%"
  cROI.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.naranjaClaro } }
  cROI.font = { bold: true, size: 11, name: "Calibri", color: { argb: COLORS.naranja } }
  cROI.alignment = { horizontal: "right", vertical: "middle" }

  // Bordes fila
  for (let c = 2; c <= 10; c++) {
    const cell = ws5.getCell(row, c)
    cell.border = {
      top:    { style: "hair", color: { argb: COLORS.grisBorde } },
      bottom: { style: "hair", color: { argb: COLORS.grisBorde } },
    }
  }
}

// Fila resumen total (año 10)
const summaryRow = PROJ_START + 10
ws5.getRow(summaryRow).height = 28
ws5.mergeCells(summaryRow, 2, summaryRow, 3)
const cSumLbl = ws5.getCell(summaryRow, 2)
cSumLbl.value = "RESUMEN A 10 AÑOS"
cSumLbl.font = { bold: true, size: 11, color: { argb: COLORS.blanco }, name: "Calibri" }
cSumLbl.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
cSumLbl.alignment = { horizontal: "center", vertical: "middle" }

const finalRow = PROJ_START + 9  // año 10
const finalCols = [4, 5, 6, 7, 8, 9, 10]
for (const c of finalCols) {
  const refCell = ws5.getCell(finalRow, c)
  const sumCell = ws5.getCell(summaryRow, c)
  sumCell.value = { formula: `'5. Proyección Rentabilidad'!${String.fromCharCode(64 + c)}${finalRow}` }
  sumCell.numFmt = refCell.numFmt
  sumCell.font = { bold: true, size: 11, color: { argb: COLORS.blanco }, name: "Calibri" }
  sumCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulOscuro } }
  sumCell.alignment = { horizontal: "right", vertical: "middle" }
}

// Nota metodológica
ws5.getRow(summaryRow + 2).height = 16
sectionTitle(ws5, summaryRow + 2, 1, "  METODOLOGÍA DE CÁLCULO", 10, COLORS.azulMedio)

const notas = [
  `Fondo Acumulado: FV(tasa_mensual, N_meses, -aporte_mensual, 0, tipo=1) — aportes al INICIO de cada mes, capitalización mensual compuesta.`,
  `Tasa mensual = (1 + tasa_anual)^(1/12) − 1. Con ${(0.118 * 100).toFixed(1)}% anual la tasa mensual es ${((Math.pow(1.118, 1/12) - 1) * 100).toFixed(4)}%.`,
  `UF proyectada: UF_base × (1 + 3%)^N. Refleja el crecimiento histórico promedio de la UF en Chile.`,
  `Rentabilidad Generada = Fondo Acumulado − Total Aportado. El ahorro tributario (APV Régimen A) queda disponible para el cliente.`,
  `Para simular otro cliente: actualice los datos en las hojas 1 a 4. Las fórmulas se recalculan automáticamente.`,
]

for (let i = 0; i < notas.length; i++) {
  const row = summaryRow + 3 + i
  ws5.getRow(row).height = 18
  ws5.mergeCells(row, 2, row, 10)
  const c = ws5.getCell(row, 2)
  c.value = `• ${notas[i]}`
  c.font = { size: 9, color: { argb: COLORS.grisOscuro }, name: "Calibri", italic: i === 0 }
  c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: COLORS.azulMuyClaro } }
  c.alignment = { horizontal: "left", vertical: "middle", indent: 1, wrapText: true }
  c.border = { bottom: { style: "hair", color: { argb: COLORS.grisBorde } } }
}

// ─── Guardar archivo ───
const buffer = await workbook.xlsx.writeBuffer()
writeFileSync("simulador_apv_2026.xlsx", buffer)
console.log("✓ Archivo generado: simulador_apv_2026.xlsx")
