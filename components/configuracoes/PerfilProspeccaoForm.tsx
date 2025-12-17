"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/lib/utils"

interface PerfilProspeccao {
  id: string
  nicho: string
  tipoCliente: string
  cidades: string[]
  ticketMinimo: number
  precisaDecisor: boolean
  urgenciaMinima: string
}

interface PerfilProspeccaoFormProps {
  perfil: PerfilProspeccao
}

export function PerfilProspeccaoForm({ perfil }: PerfilProspeccaoFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState(false)

  const [formData, setFormData] = useState({
    nicho: perfil.nicho,
    tipoCliente: perfil.tipoCliente,
    cidades: perfil.cidades,
    ticketMinimo: perfil.ticketMinimo.toString(),
    precisaDecisor: perfil.precisaDecisor,
    urgenciaMinima: perfil.urgenciaMinima,
  })

  const [cidadeInput, setCidadeInput] = useState("")

  const addCidade = () => {
    if (cidadeInput.trim() && !formData.cidades.includes(cidadeInput.trim())) {
      setFormData({
        ...formData,
        cidades: [...formData.cidades, cidadeInput.trim()],
      })
      setCidadeInput("")
    }
  }

  const removeCidade = (cidade: string) => {
    setFormData({
      ...formData,
      cidades: formData.cidades.filter((c) => c !== cidade),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setSucesso(false)
    setLoading(true)

    try {
      const response = await fetch("/api/configuracoes/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ticketMinimo: parseFloat(formData.ticketMinimo),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErro(data.error || "Erro ao salvar configurações")
        setLoading(false)
        return
      }

      setSucesso(true)
      setLoading(false)
      router.refresh()
    } catch (error) {
      setErro("Erro ao salvar. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {erro}
        </div>
      )}

      {sucesso && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          Configurações salvas com sucesso!
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nicho de Atuação
        </label>
        <select
          value={formData.nicho}
          onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="Clínicas">Clínicas</option>
          <option value="Escritórios">Escritórios</option>
          <option value="Imobiliárias">Imobiliárias</option>
          <option value="Prestadores de Serviço">Prestadores de Serviço</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Cliente
        </label>
        <select
          value={formData.tipoCliente}
          onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="PF">Pessoa Física</option>
          <option value="PJ">Pessoa Jurídica</option>
          <option value="Ambos">Ambos</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cidades
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={cidadeInput}
            onChange={(e) => setCidadeInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCidade())}
            placeholder="Digite o nome da cidade"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={addCidade}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Adicionar
          </button>
        </div>
        {formData.cidades.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.cidades.map((cidade) => (
              <span
                key={cidade}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm"
              >
                {cidade}
                <button
                  type="button"
                  onClick={() => removeCidade(cidade)}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ticket Mínimo (R$)
        </label>
        <input
          type="number"
          min="0"
          step="0.01"
          value={formData.ticketMinimo}
          onChange={(e) => setFormData({ ...formData, ticketMinimo: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.precisaDecisor}
            onChange={(e) => setFormData({ ...formData, precisaDecisor: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">
            O lead precisa ser decisor
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Urgência Mínima Aceitável
        </label>
        <select
          value={formData.urgenciaMinima}
          onChange={(e) => setFormData({ ...formData, urgenciaMinima: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="Baixa">Baixa</option>
          <option value="Média">Média</option>
          <option value="Alta">Alta</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Salvando..." : "Salvar Configurações"}
      </button>
    </form>
  )
}


