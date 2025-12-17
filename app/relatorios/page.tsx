import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { analyzeConversations } from "@/lib/insights"
import { Bot, User, TrendingUp, BarChart3 } from "lucide-react"

async function getReportData(empresaId: string) {
  const [
    totalLeads,
    leadsAtivados,
    leadsDescartados,
    leadsEmProcesso,
    leadsQualificados,
    conversationAnalysis,
  ] = await Promise.all([
    prisma.lead.count({ where: { empresaId } }),
    prisma.lead.count({ where: { empresaId, status: "ativado" } }),
    prisma.lead.count({ where: { empresaId, status: "descartado" } }),
    prisma.lead.count({
      where: {
        empresaId,
        status: { in: ["prospectavel", "em_contato", "qualificado"] },
      },
    }),
    prisma.lead.count({
      where: {
        empresaId,
        status: { in: ["qualificado", "disponivel", "ativado"] },
      },
    }),
    analyzeConversations(empresaId),
  ])

  // Calcula eficiência da IA (leads qualificados vs total processado)
  const totalProcessado = leadsQualificados + leadsDescartados
  const eficienciaIA = totalProcessado > 0
    ? ((leadsQualificados / totalProcessado) * 100)
    : 0

  // Taxa de ativação
  const taxaAtivacao = leadsQualificados > 0
    ? ((leadsAtivados / leadsQualificados) * 100)
    : 0

  return {
    totalLeads,
    leadsAtivados,
    leadsDescartados,
    leadsEmProcesso,
    leadsQualificados,
    eficienciaIA,
    taxaAtivacao,
    conversationAnalysis,
  }
}

export default async function RelatoriosPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const data = await getReportData(session.user.empresaId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Relatórios</h1>
          <p className="text-gray-600">
            Análise de performance e eficiência do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total de Leads</h3>
            <p className="text-3xl font-bold text-gray-900">{data.totalLeads}</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Leads Ativados</h3>
            <p className="text-3xl font-bold text-gray-900">{data.leadsAtivados}</p>
            <p className="text-sm text-gray-500 mt-1">
              {data.taxaAtivacao.toFixed(1)}% dos qualificados
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Bot className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Eficiência da IA</h3>
            <p className="text-3xl font-bold text-gray-900">{data.eficienciaIA.toFixed(1)}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {data.leadsQualificados} qualificados de {data.leadsQualificados + data.leadsDescartados} processados
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <User className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Em Processo</h3>
            <p className="text-3xl font-bold text-gray-900">{data.leadsEmProcesso}</p>
            <p className="text-sm text-gray-500 mt-1">
              Sendo qualificados pela IA
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Análise de Conversas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Classificação por Interesse
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="font-medium text-red-900">Quente</span>
                  <span className="text-lg font-bold text-red-900">
                    {data.conversationAnalysis.byInterest.quente}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-900">Morno</span>
                  <span className="text-lg font-bold text-orange-900">
                    {data.conversationAnalysis.byInterest.morno}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-900">Frio</span>
                  <span className="text-lg font-bold text-blue-900">
                    {data.conversationAnalysis.byInterest.frio}
                  </span>
                </div>
                {data.conversationAnalysis.byInterest.semClassificacao > 0 && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">Sem Classificação</span>
                    <span className="text-lg font-bold text-gray-900">
                      {data.conversationAnalysis.byInterest.semClassificacao}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Score Médio</p>
                <p className="text-2xl font-bold text-primary-900">
                  {data.conversationAnalysis.avgScore}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Motivos de Não Qualificação
              </h3>
              {data.conversationAnalysis.topReasons.length > 0 ? (
                <div className="space-y-3">
                  {data.conversationAnalysis.topReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{reason.reason}</span>
                        <span className="text-sm font-bold text-gray-600">
                          {reason.count}x
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${reason.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {reason.percentage.toFixed(1)}% do total
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">
                    Nenhum motivo de descarte identificado ainda
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Comparativo: IA vs Interação Humana
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Bot className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-purple-900">Processamento pela IA</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Leads processados:</span>
                  <span className="font-medium">{data.leadsQualificados + data.leadsDescartados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Taxa de qualificação:</span>
                  <span className="font-medium">{data.eficienciaIA.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Score médio:</span>
                  <span className="font-medium">{data.conversationAnalysis.avgScore}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">Ativação Humana</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Leads ativados:</span>
                  <span className="font-medium">{data.leadsAtivados}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Taxa de ativação:</span>
                  <span className="font-medium">{data.taxaAtivacao.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-700">Leads disponíveis:</span>
                  <span className="font-medium">
                    {data.leadsQualificados - data.leadsAtivados}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

