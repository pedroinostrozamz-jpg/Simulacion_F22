"use client"

import type { ClientData } from "@/app/page"

interface Props {
  data: ClientData
  onChange: (data: ClientData) => void
  onNext: () => void
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-[#4a4a4a] uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-[#c8d0da] bg-white px-3 py-2 text-sm text-[#1a1a1a] rounded focus:outline-none focus:ring-2 focus:ring-[#1a3a5c] focus:border-transparent"
      />
    </div>
  )
}

export default function ClientDataSheet({ data, onChange, onNext }: Props) {
  const set = (key: keyof ClientData) => (value: string) =>
    onChange({ ...data, [key]: value })

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="bg-white border border-[#c8d0da] rounded shadow-sm">
        <div className="bg-[#1a3a5c] text-white px-5 py-3 rounded-t">
          <h2 className="text-sm font-bold uppercase tracking-wide">
            Sección 1 — Datos del Cliente
          </h2>
          <p className="text-[#a8c4e0] text-xs mt-0.5">
            Información personal del cliente para la simulación APV
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <Field
            label="Nombre Completo"
            value={data.nombre}
            onChange={set("nombre")}
            placeholder="Ej: Juan Pérez González"
          />
          <Field
            label="RUT"
            value={data.rut}
            onChange={set("rut")}
            placeholder="Ej: 12.345.678-9"
          />
          <Field
            label="Correo Electrónico"
            value={data.email}
            onChange={set("email")}
            placeholder="correo@ejemplo.cl"
            type="email"
          />
          <Field
            label="Teléfono"
            value={data.telefono}
            onChange={set("telefono")}
            placeholder="+56 9 XXXX XXXX"
          />
          <Field
            label="Asesor / Ejecutivo"
            value={data.asesor}
            onChange={set("asesor")}
            placeholder="Nombre del asesor"
          />
          <Field
            label="Fecha Simulación"
            value={data.fecha}
            onChange={set("fecha")}
            placeholder="DD/MM/AAAA"
          />
        </div>
      </div>

      {/* Info card */}
      <div className="bg-[#e8f0fa] border border-[#a8c4e0] rounded p-4">
        <h3 className="text-xs font-bold text-[#1a3a5c] uppercase mb-2">Acerca de este simulador</h3>
        <ul className="text-xs text-[#2a4a6c] space-y-1">
          <li>• Simula el ahorro tributario del APV bajo la modalidad <strong>Régimen A (Global Complementario)</strong>.</li>
          <li>• Utiliza la tabla de tramos del Impuesto Global Complementario vigente para el año tributario <strong>2026</strong>.</li>
          <li>• Los datos del Formulario 22 deben ser extraídos del compacto oficial del SII.</li>
          <li>• La proyección de rentabilidad se calcula a una tasa anual del <strong>11,8%</strong> a 10 años.</li>
          <li>• Todos los valores están expresados en <strong>pesos chilenos (CLP)</strong>.</li>
        </ul>
      </div>

      {/* Navigation */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-[#1a3a5c] hover:bg-[#2a5a8c] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
        >
          Siguiente: Formulario 22 →
        </button>
      </div>
    </div>
  )
}
