"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { OnboardingStep } from "@/components/onboarding/OnboardingStep"

const TOTAL_STEPS = 6

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  // Verifica se está autenticado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
    // Se já completou onboarding, redireciona para dashboard
    if (status === "authenticated" && session?.user?.onboardingCompleto) {
      router.push("/dashboard")
    }
  }, [status, session, router])

  const [formData, setFormData] = useState({
    nicho: "",
    tipoCliente: "",
    cidades: [] as string[],
    ticketMinimo: "",
    precisaDecisor: false,
    urgenciaMinima: "",
  })

  const [cidadeInput, setCidadeInput] = useState("")

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

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

  const handleSubmit = async () => {
    setErro("")
    setLoading(true)

    // Validações
    if (!formData.nicho) {
      setErro("Selecione um nicho")
      setLoading(false)
      return
    }
    if (!formData.tipoCliente) {
      setErro("Selecione o tipo de cliente")
      setLoading(false)
      return
    }
    if (formData.cidades.length === 0) {
      setErro("Adicione pelo menos uma cidade")
      setLoading(false)
      return
    }
    if (!formData.ticketMinimo || parseFloat(formData.ticketMinimo) <= 0) {
      setErro("Informe um ticket mínimo válido")
      setLoading(false)
      return
    }
    if (!formData.urgenciaMinima) {
      setErro("Selecione a urgência mínima")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ticketMinimo: parseFloat(formData.ticketMinimo),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErro(data.error || "Erro ao salvar onboarding")
        setLoading(false)
        return
      }

      // Atualiza a sessão para refletir que o onboarding foi concluído
      try {
        await update()
      } catch (updateError) {
        console.warn("[ONBOARDING] Erro ao atualizar sessão:", updateError)
      }

      // Redireciona para o dashboard
      router.push("/dashboard")
    } catch (error) {
      setErro("Erro ao salvar. Tente novamente.")
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <OnboardingStep step={1} totalSteps={TOTAL_STEPS} title="Qual é o seu nicho de atuação?">
            <div className="space-y-3">
              {["Clínicas", "Escritórios", "Imobiliárias", "Prestadores de Serviço", "Outros"].map((nicho) => (
                <label
                  key={nicho}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="nicho"
                    value={nicho}
                    checked={formData.nicho === nicho}
                    onChange={(e) => setFormData({ ...formData, nicho: e.target.value })}
                    className="mr-3"
                  />
                  <span className="font-medium">{nicho}</span>
                </label>
              ))}
            </div>
          </OnboardingStep>
        )

      case 2:
        return (
          <OnboardingStep step={2} totalSteps={TOTAL_STEPS} title="Você atende pessoa física, jurídica ou ambos?">
            <div className="space-y-3">
              {[
                { value: "PF", label: "Pessoa Física" },
                { value: "PJ", label: "Pessoa Jurídica" },
                { value: "Ambos", label: "Ambos" },
              ].map((tipo) => (
                <label
                  key={tipo.value}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="tipoCliente"
                    value={tipo.value}
                    checked={formData.tipoCliente === tipo.value}
                    onChange={(e) => setFormData({ ...formData, tipoCliente: e.target.value })}
                    className="mr-3"
                  />
                  <span className="font-medium">{tipo.label}</span>
                </label>
              ))}
            </div>
          </OnboardingStep>
        )

      case 3:
        return (
          <OnboardingStep step={3} totalSteps={TOTAL_STEPS} title="Quais cidades deseja prospectar?">
            <div className="space-y-4">
              <div className="flex gap-2">
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
          </OnboardingStep>
        )

      case 4:
        return (
          <OnboardingStep step={4} totalSteps={TOTAL_STEPS} title="Qual o ticket mínimo desejado?">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor mínimo em R$
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.ticketMinimo}
                onChange={(e) => setFormData({ ...formData, ticketMinimo: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg"
              />
            </div>
          </OnboardingStep>
        )

      case 5:
        return (
          <OnboardingStep step={5} totalSteps={TOTAL_STEPS} title="O lead precisa ser decisor?">
            <div className="space-y-3">
              {[
                { value: "true", label: "Sim, precisa ser decisor" },
                { value: "false", label: "Não, qualquer pessoa pode ser lead" },
              ].map((opcao) => (
                <label
                  key={opcao.value}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="precisaDecisor"
                    value={opcao.value}
                    checked={formData.precisaDecisor.toString() === opcao.value}
                    onChange={(e) => setFormData({ ...formData, precisaDecisor: e.target.value === "true" })}
                    className="mr-3"
                  />
                  <span className="font-medium">{opcao.label}</span>
                </label>
              ))}
            </div>
          </OnboardingStep>
        )

      case 6:
        return (
          <OnboardingStep step={6} totalSteps={TOTAL_STEPS} title="Qual a urgência mínima aceitável?">
            <div className="space-y-3">
              {["Baixa", "Média", "Alta"].map((urgencia) => (
                <label
                  key={urgencia}
                  className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition"
                >
                  <input
                    type="radio"
                    name="urgenciaMinima"
                    value={urgencia}
                    checked={formData.urgenciaMinima === urgencia}
                    onChange={(e) => setFormData({ ...formData, urgenciaMinima: e.target.value })}
                    className="mr-3"
                  />
                  <span className="font-medium">{urgencia}</span>
                </label>
              ))}
            </div>
          </OnboardingStep>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto mb-6 text-center">
          <p className="text-sm text-gray-600">
            Configure uma vez e a IA trabalha sozinha. O SDR Virtual opera de forma contínua e ilimitada.
          </p>
        </div>
        {erro && (
          <div className="max-w-2xl mx-auto mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {erro}
          </div>
        )}

        {renderStep()}

        <div className="max-w-2xl mx-auto mt-6 flex justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Voltar
          </button>
          {step < TOTAL_STEPS ? (
            <button
              onClick={handleNext}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Próximo
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Salvando..." : "Finalizar"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

