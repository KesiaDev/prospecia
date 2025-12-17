import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { calculateFunnelMetrics } from "@/lib/insights"
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react"

export default async function FunilPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const funnel = await calculateFunnelMetrics(session.user.empresaId)

  const stages = [
    {
      name: "Prospectável",
      count: funnel.prospectavel,
      color: "bg-gray-500",
      nextConversion: funnel.conversions.prospectavelToContato,
    },
    {
      name: "Em Contato",
      count: funnel.em_contato,
      color: "bg-blue-500",
      nextConversion: funnel.conversions.contatoToQualificado,
    },
    {
      name: "Qualificado",
      count: funnel.qualificado,
      color: "bg-yellow-500",
      nextConversion: funnel.conversions.qualificadoToDisponivel,
    },
    {
      name: "Disponível",
      count: funnel.disponivel,
      color: "bg-green-500",
      nextConversion: funnel.conversions.disponivelToAtivado,
    },
    {
      name: "Ativado",
      count: funnel.ativado,
      color: "bg-purple-500",
      nextConversion: null,
    },
  ]

  const totalLeads = stages.reduce((sum, stage) => sum + stage.count, 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Funil de Vendas</h1>
          <p className="text-gray-600">
            Acompanhe a conversão entre as etapas e identifique pontos de melhoria
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Visão Geral do Funil</h2>
          
          <div className="space-y-4">
            {stages.map((stage, index) => {
              const percentage = totalLeads > 0 ? (stage.count / totalLeads) * 100 : 0
              const isLast = index === stages.length - 1

              return (
                <div key={stage.name}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`${stage.color} w-4 h-4 rounded-full`} />
                      <span className="font-semibold text-gray-900">{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-gray-900">{stage.count}</span>
                      <span className="text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`${stage.color} h-3 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {!isLast && stage.nextConversion !== null && (
                    <div className="flex items-center gap-2 mt-2">
                      {stage.nextConversion < 50 ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      )}
                      <span className={`text-sm ${
                        stage.nextConversion < 50 ? "text-red-600" : "text-green-600"
                      }`}>
                        Taxa de conversão: {stage.nextConversion.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {funnel.dropPoints.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Pontos de Queda Identificados
              </h2>
            </div>
            <div className="space-y-3">
              {funnel.dropPoints.map((drop, index) => (
                <div
                  key={index}
                  className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-yellow-900">
                        {drop.from} → {drop.to}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {drop.count} lead(s) perdido(s) nesta etapa
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-yellow-900">
                        {drop.dropRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-yellow-600">Taxa de queda</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumo de Conversões</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Prospectável → Contato</p>
              <p className="text-2xl font-bold text-blue-900">
                {funnel.conversions.prospectavelToContato.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Contato → Qualificado</p>
              <p className="text-2xl font-bold text-yellow-900">
                {funnel.conversions.contatoToQualificado.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Qualificado → Disponível</p>
              <p className="text-2xl font-bold text-green-900">
                {funnel.conversions.qualificadoToDisponivel.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Disponível → Ativado</p>
              <p className="text-2xl font-bold text-purple-900">
                {funnel.conversions.disponivelToAtivado.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

