"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { getStatusColor, getClassificacaoColor } from "@/lib/utils"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { AtivarLeadButton } from "./AtivarLeadButton"

interface Lead {
  id: string
  nomeEmpresa: string
  segmento: string
  cidade: string
  score: number | null
  classificacao: string | null
  urgencia: string | null
  dorPrincipal: string | null
  status: string
}

interface LeadsListProps {
  leads: Lead[]
}

export function LeadsList({ leads }: LeadsListProps) {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([])

  const toggleSelect = (leadId: string) => {
    setSelectedLeads((prev) =>
      prev.includes(leadId)
        ? prev.filter((id) => id !== leadId)
        : [...prev, leadId]
    )
  }

  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([])
    } else {
      setSelectedLeads(leads.map((lead) => lead.id))
    }
  }

  if (leads.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
        <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum lead disponível
        </h3>
        <p className="text-gray-600">
          Seus leads estão sendo qualificados. Em breve você terá leads disponíveis aqui.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <input
            type="checkbox"
            checked={selectedLeads.length === leads.length && leads.length > 0}
            onChange={toggleSelectAll}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            {selectedLeads.length > 0
              ? `${selectedLeads.length} selecionado(s)`
              : "Selecionar todos"}
          </span>
        </div>
        {selectedLeads.length > 0 && (
          <AtivarLeadButton
            leadIds={selectedLeads}
            onSuccess={() => setSelectedLeads([])}
          />
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedLeads.includes(lead.id)}
                onChange={() => toggleSelect(lead.id)}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {lead.nomeEmpresa}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {lead.segmento} • {lead.cidade}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lead.score !== null && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                        Score: {lead.score}
                      </span>
                    )}
                    {lead.classificacao && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getClassificacaoColor(
                          lead.classificacao
                        )}`}
                      >
                        {lead.classificacao.charAt(0).toUpperCase() + lead.classificacao.slice(1)}
                      </span>
                    )}
                  </div>
                </div>

                {lead.dorPrincipal && (
                  <div className="mb-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Dor principal:</span> {lead.dorPrincipal}
                    </p>
                  </div>
                )}

                {lead.urgencia && (
                  <div className="mb-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        lead.urgencia === "Alta"
                          ? "bg-red-100 text-red-800"
                          : lead.urgencia === "Média"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {lead.urgencia === "Alta" && <AlertCircle className="h-3 w-3 mr-1" />}
                      {lead.urgencia === "Média" && <Clock className="h-3 w-3 mr-1" />}
                      {lead.urgencia === "Baixa" && <CheckCircle className="h-3 w-3 mr-1" />}
                      Urgência: {lead.urgencia}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-end mt-3">
                  <AtivarLeadButton
                    leadIds={[lead.id]}
                    onSuccess={() => setSelectedLeads((prev) => prev.filter((id) => id !== lead.id))}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

