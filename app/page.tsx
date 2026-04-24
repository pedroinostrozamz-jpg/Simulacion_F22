"use client"

import { useState } from "react"
import ClientDataSheet from "@/components/ClientDataSheet"
import Form22Sheet from "@/components/Form22Sheet"
import TaxBracketSheet from "@/components/TaxBracketSheet"
import ApvSimulatorSheet from "@/components/ApvSimulatorSheet"
import ProjectionSheet from "@/components/ProjectionSheet"
import { ExcelExporter } from "@/components/ExcelExporter"

export type ClientData = {
  nombre: string
  rut: string
  email: string
  telefono: string
  asesor: string
  fecha: string
}

export type Form22Data = {
  // Identificación
  folio: string
  anioTributario: string
  // Rentas
  rentasSueldosPensiones: number      // 1098
  rentasHonorarios: number             // 110
  rentasArrendamiento: number          // 1849
  rentasCapitalesMobiliarios: number  // 155 / 1867
  otrasRentas: number                  // 955
  // Subtotales y base
  subTotal: number                     // 158
  baseImponible: number               // 170
  // IGC / IUSC
  igcSegunTabla: number               // 157
  creditoIgcIusc: number              // 162
  creditoImpTerritorial: number       // 1637
  igcDebitoFiscal: number             // 304 / 31
  // Retenciones
  retencionesHonorarios: number       // 198
  retencionesTotalRentas: number      // 619
  // Resultado
  resultadoLiquidacion: number        // 305
  saldoFavor: number                  // 85
  montoDevolucion: number             // 87
  // Banco
  nombreBanco: string                 // 301
  numeroCuenta: string                // 306
  tipoCuenta: string                  // 780
}

const defaultClient: ClientData = {
  nombre: "",
  rut: "",
  email: "",
  telefono: "",
  asesor: "",
  fecha: new Date().toLocaleDateString("es-CL"),
}

const defaultForm22: Form22Data = {
  folio: "",
  anioTributario: "2025",
  rentasSueldosPensiones: 0,
  rentasHonorarios: 0,
  rentasArrendamiento: 0,
  rentasCapitalesMobiliarios: 0,
  otrasRentas: 0,
  subTotal: 0,
  baseImponible: 0,
  igcSegunTabla: 0,
  creditoIgcIusc: 0,
  creditoImpTerritorial: 0,
  igcDebitoFiscal: 0,
  retencionesHonorarios: 0,
  retencionesTotalRentas: 0,
  resultadoLiquidacion: 0,
  saldoFavor: 0,
  montoDevolucion: 0,
  nombreBanco: "",
  numeroCuenta: "",
  tipoCuenta: "",
}

const TABS = [
  { id: "cliente", label: "1. Datos del Cliente" },
  { id: "form22", label: "2. Formulario 22" },
  { id: "tramo", label: "3. Tramo Impositivo" },
  { id: "apv", label: "4. Simulación APV" },
  { id: "proyeccion", label: "5. Proyección Rentabilidad" },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState("cliente")
  const [clientData, setClientData] = useState<ClientData>(defaultClient)
  const [form22Data, setForm22Data] = useState<Form22Data>(defaultForm22)
  const [apvMonto, setApvMonto] = useState<number>(0)
  const [tasaAnual, setTasaAnual] = useState<number>(0.118)
  const [ufBase, setUfBase] = useState<number>(38000)

  return (
    <main className="min-h-screen bg-[#f0f0f0] font-sans">
      {/* Header */}
      <header className="bg-[#1a3a5c] text-white px-6 py-4 shadow-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-wide">SIMULADOR APV</h1>
            <p className="text-[#a8c4e0] text-xs mt-0.5">
              Ahorro Previsional Voluntario — Global Complementario 2026
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right text-xs text-[#a8c4e0]">
              <div className="font-semibold text-white text-sm">{clientData.nombre || "Sin cliente"}</div>
              <div>{clientData.rut || "RUT no ingresado"}</div>
            </div>
            <ExcelExporter
              clientData={{
                nombre: clientData.nombre,
                rut: clientData.rut,
                email: clientData.email,
                telefono: clientData.telefono,
                asesor: clientData.asesor,
                empresa: "",
                anoTributario: 2025,
              }}
              form22Data={{
                cod1098: form22Data.rentasSueldosPensiones,
                cod110:  form22Data.rentasHonorarios,
                cod155:  form22Data.rentasCapitalesMobiliarios,
                cod157:  form22Data.igcSegunTabla,
                cod158:  form22Data.subTotal,
                cod161:  form22Data.rentasSueldosPensiones,
                cod162:  form22Data.creditoIgcIusc,
                cod169:  0,
                cod170:  form22Data.baseImponible,
                cod198:  form22Data.retencionesHonorarios,
                cod304:  form22Data.igcDebitoFiscal,
                cod619:  form22Data.retencionesTotalRentas,
                cod305:  form22Data.resultadoLiquidacion,
                cod461:  form22Data.rentasHonorarios,
                cod85:   form22Data.saldoFavor,
                cod87:   form22Data.montoDevolucion,
                cod750:  0,
                cod547:  0,
                cod1849: form22Data.rentasArrendamiento,
                cod955:  form22Data.otrasRentas,
                cod1637: form22Data.creditoImpTerritorial,
                cod1867: form22Data.rentasCapitalesMobiliarios,
                nombreBanco:   form22Data.nombreBanco,
                numeroCuenta:  form22Data.numeroCuenta,
              }}
              apvMensual={apvMonto}
              tasaAnual={tasaAnual}
              ufBase={ufBase}
            />
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="bg-[#1a3a5c] px-6 border-t border-[#2a5a8c]">
        <div className="max-w-[1400px] mx-auto flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold transition-all border-t-2 ${
                activeTab === tab.id
                  ? "bg-[#f0f0f0] text-[#1a3a5c] border-[#e8a020]"
                  : "bg-transparent text-[#a8c4e0] border-transparent hover:bg-[#2a5a8c] hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sheet content */}
      <div className="max-w-[1400px] mx-auto p-6">
        {activeTab === "cliente" && (
          <ClientDataSheet
            data={clientData}
            onChange={setClientData}
            onNext={() => setActiveTab("form22")}
          />
        )}
        {activeTab === "form22" && (
          <Form22Sheet
            data={form22Data}
            onChange={setForm22Data}
            onNext={() => setActiveTab("tramo")}
          />
        )}
        {activeTab === "tramo" && (
          <TaxBracketSheet
            form22Data={form22Data}
            onNext={() => setActiveTab("apv")}
          />
        )}
        {activeTab === "apv" && (
          <ApvSimulatorSheet
            form22Data={form22Data}
            apvMonto={apvMonto}
            onApvMontoChange={setApvMonto}
            onNext={() => setActiveTab("proyeccion")}
          />
        )}
        {activeTab === "proyeccion" && (
          <ProjectionSheet
            apvMonto={apvMonto}
            form22Data={form22Data}
            tasaAnualExternal={tasaAnual}
            ufBaseExternal={ufBase}
            onTasaChange={setTasaAnual}
            onUfBaseChange={setUfBase}
          />
        )}
      </div>
    </main>
  )
}
