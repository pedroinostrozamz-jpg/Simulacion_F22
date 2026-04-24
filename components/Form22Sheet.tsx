"use client"

import { useEffect } from "react"
import type { Form22Data } from "@/app/page"

interface Props {
  data: Form22Data
  onChange: (data: Form22Data) => void
  onNext: () => void
}

function formatCLP(n: number) {
  if (!n) return ""
  return n.toLocaleString("es-CL")
}

function NumericField({
  codigo,
  label,
  value,
  onChange,
  highlight = false,
  readOnly = false,
}: {
  codigo: string | number
  label: string
  value: number
  onChange?: (v: number) => void
  highlight?: boolean
  readOnly?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#e0e5ec] last:border-b-0 ${
        highlight ? "bg-[#fff8e8]" : "bg-white"
      }`}
    >
      <div
        className={`min-w-[52px] text-center text-xs font-bold px-2 py-1 rounded ${
          highlight
            ? "bg-[#e8a020] text-white"
            : "bg-[#1a3a5c] text-white"
        }`}
      >
        {codigo}
      </div>
      <div className="flex-1 text-xs text-[#2a2a2a]">{label}</div>
      {readOnly ? (
        <div className="text-right text-sm font-semibold text-[#1a3a5c] min-w-[140px]">
          {formatCLP(value) || "—"}
        </div>
      ) : (
        <input
          type="text"
          inputMode="numeric"
          value={value === 0 ? "" : formatCLP(value)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\./g, "").replace(/[^0-9-]/g, "")
            onChange?.(raw === "" ? 0 : parseInt(raw, 10))
          }}
          placeholder="0"
          className={`text-right text-sm font-semibold border border-[#c8d0da] rounded px-2 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] ${
            highlight ? "bg-[#fff3d0]" : "bg-[#f7f9fc]"
          }`}
        />
      )}
    </div>
  )
}

function TextField({
  codigo,
  label,
  value,
  onChange,
}: {
  codigo: string | number
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e0e5ec] last:border-b-0 bg-white">
      <div className="min-w-[52px] text-center text-xs font-bold px-2 py-1 rounded bg-[#1a3a5c] text-white">
        {codigo}
      </div>
      <div className="flex-1 text-xs text-[#2a2a2a]">{label}</div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-right text-sm border border-[#c8d0da] rounded px-2 py-1 w-36 bg-[#f7f9fc] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
      />
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="bg-[#2a4a6c] text-white text-xs font-bold uppercase tracking-wide px-4 py-2">
      {title}
    </div>
  )
}

export default function Form22Sheet({ data, onChange, onNext }: Props) {
  const set = (key: keyof Form22Data) => (value: number | string) =>
    onChange({ ...data, [key]: value })

  // Auto-calculate SubTotal = sum of all income sources
  useEffect(() => {
    const sub =
      data.rentasSueldosPensiones +
      data.rentasHonorarios +
      data.rentasArrendamiento +
      data.rentasCapitalesMobiliarios +
      data.otrasRentas
    if (sub !== data.subTotal) onChange({ ...data, subTotal: sub })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    data.rentasSueldosPensiones,
    data.rentasHonorarios,
    data.rentasArrendamiento,
    data.rentasCapitalesMobiliarios,
    data.otrasRentas,
  ])

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#c8d0da] rounded shadow-sm overflow-hidden">
        <div className="bg-[#1a3a5c] text-white px-5 py-3">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Sección 2 — Datos del Formulario 22 Compacto
          </h2>
          <p className="text-[#a8c4e0] text-xs mt-0.5">
            Ingrese los valores según el compacto del F22. Los códigos corresponden al formulario oficial del SII.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-[#e0e5ec]">
          {/* Left column */}
          <div>
            <SectionTitle title="Identificación" />
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e0e5ec] bg-white">
              <div className="min-w-[52px] text-center text-xs font-bold px-2 py-1 rounded bg-[#1a3a5c] text-white">
                Folio
              </div>
              <div className="flex-1 text-xs text-[#2a2a2a]">Número de Folio</div>
              <input
                type="text"
                value={data.folio}
                onChange={(e) => set("folio")(e.target.value)}
                className="text-right text-sm border border-[#c8d0da] rounded px-2 py-1 w-36 bg-[#f7f9fc] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[#e0e5ec] bg-white">
              <div className="min-w-[52px] text-center text-xs font-bold px-2 py-1 rounded bg-[#1a3a5c] text-white">
                AT
              </div>
              <div className="flex-1 text-xs text-[#2a2a2a]">Año Tributario</div>
              <input
                type="text"
                value={data.anioTributario}
                onChange={(e) => set("anioTributario")(e.target.value)}
                className="text-right text-sm border border-[#c8d0da] rounded px-2 py-1 w-36 bg-[#f7f9fc] focus:outline-none focus:ring-2 focus:ring-[#1a3a5c]"
              />
            </div>

            <SectionTitle title="Rentas Percibidas" />
            <NumericField
              codigo={1098}
              label="Sueldos, pensiones y otras rentas similares de fuente nacional"
              value={data.rentasSueldosPensiones}
              onChange={(v) => set("rentasSueldosPensiones")(v)}
            />
            <NumericField
              codigo={110}
              label="Rentas percibidas de los arts. 42 N° 2 (honorarios) y 48 LIR"
              value={data.rentasHonorarios}
              onChange={(v) => set("rentasHonorarios")(v)}
            />
            <NumericField
              codigo={1849}
              label="Rentas del arrendamiento de bienes raíces (agrícolas y no agrícolas)"
              value={data.rentasArrendamiento}
              onChange={(v) => set("rentasArrendamiento")(v)}
            />
            <NumericField
              codigo={155}
              label="Rentas de capitales mobiliarios (art. 20 N° 2 LIR) y mayor valor fondos"
              value={data.rentasCapitalesMobiliarios}
              onChange={(v) => set("rentasCapitalesMobiliarios")(v)}
            />
            <NumericField
              codigo={955}
              label="Otras rentas propias y/o de terceros (art. 14 letra B N° 1 LIR)"
              value={data.otrasRentas}
              onChange={(v) => set("otrasRentas")(v)}
            />
            <NumericField
              codigo={158}
              label="SUB TOTAL de rentas"
              value={data.subTotal}
              readOnly
              highlight
            />
            <NumericField
              codigo={170}
              label="BASE IMPONIBLE ANUAL DE IGC o IUSC (registrar solo si diferencia es positiva)"
              value={data.baseImponible}
              onChange={(v) => set("baseImponible")(v)}
              highlight
            />
          </div>

          {/* Right column */}
          <div>
            <SectionTitle title="Impuesto Global Complementario (IGC)" />
            <NumericField
              codigo={157}
              label="IGC o IUSC según tabla (arts. 47, 52 o 52 bis LIR)"
              value={data.igcSegunTabla}
              onChange={(v) => set("igcSegunTabla")(v)}
            />
            <NumericField
              codigo={162}
              label="Crédito al IGC o IUSC por IUSC, según art. 56 N° 2 LIR"
              value={data.creditoIgcIusc}
              onChange={(v) => set("creditoIgcIusc")(v)}
            />
            <NumericField
              codigo={1637}
              label="Crédito al IGC por Impuesto Territorial pagado (art. 56 N° 5 LIR)"
              value={data.creditoImpTerritorial}
              onChange={(v) => set("creditoImpTerritorial")(v)}
            />
            <NumericField
              codigo={304}
              label="IGC O IUSC, DÉBITO FISCAL Y/O TASA ADICIONAL DETERMINADO"
              value={data.igcDebitoFiscal}
              onChange={(v) => set("igcDebitoFiscal")(v)}
              highlight
            />

            <SectionTitle title="Retenciones" />
            <NumericField
              codigo={198}
              label="Retenciones por rentas declaradas en código 110 (Recuadro N°1)"
              value={data.retencionesHonorarios}
              onChange={(v) => set("retencionesHonorarios")(v)}
            />
            <NumericField
              codigo={619}
              label="Impuesto Retenido del Total Rentas y Retenciones"
              value={data.retencionesTotalRentas}
              onChange={(v) => set("retencionesTotalRentas")(v)}
            />

            <SectionTitle title="Resultado Liquidación" />
            <NumericField
              codigo={305}
              label="RESULTADO LIQUIDACIÓN ANUAL IMPUESTO A LA RENTA"
              value={data.resultadoLiquidacion}
              onChange={(v) => set("resultadoLiquidacion")(v)}
              highlight
            />
            <NumericField
              codigo={85}
              label="SALDO A FAVOR"
              value={data.saldoFavor}
              onChange={(v) => set("saldoFavor")(v)}
              highlight
            />
            <NumericField
              codigo={87}
              label="MONTO DEVOLUCIÓN SOLICITADA"
              value={data.montoDevolucion}
              onChange={(v) => set("montoDevolucion")(v)}
              highlight
            />

            <SectionTitle title="Datos Bancarios" />
            <TextField
              codigo={301}
              label="Nombre Institución Bancaria"
              value={data.nombreBanco}
              onChange={(v) => set("nombreBanco")(v)}
            />
            <TextField
              codigo={306}
              label="Número de Cuenta"
              value={data.numeroCuenta}
              onChange={(v) => set("numeroCuenta")(v)}
            />
            <TextField
              codigo={780}
              label="Tipo de Cuenta"
              value={data.tipoCuenta}
              onChange={(v) => set("tipoCuenta")(v)}
            />
          </div>
        </div>
      </div>

      {/* Helper note */}
      <div className="bg-[#fff8e8] border border-[#e8a020] rounded p-4 text-xs text-[#5a3a00]">
        <strong>Nota:</strong> Los códigos resaltados en naranjo corresponden a los valores más relevantes para el cálculo del APV. El código <strong>170 (Base Imponible)</strong> es el dato clave para determinar el tramo de impuesto. Si el F22 no muestra algún código, deje el campo en 0.
      </div>

      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
        >
          Siguiente: Tramo Impositivo →
        </button>
      </div>
    </div>
  )
}
