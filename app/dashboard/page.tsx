import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { Users, Clock, CheckCircle, TrendingUp, Lightbulb, AlertTriangle, Info } from "lucide-react"
import { generateDashboardInsights } from "@/lib/insights"
import Link from "next/link"

async function getDashboardData(empresaId: string) {
  const [
    emProspeccao,
    emQualificacao,
    qualificadosDisponiveis,
    ativadosHoje,
  ] = await Promise.all([
    prisma.lead.count({
      where: {
        empresaId,
        status: "prospectavel",
      },
    }),
    prisma.lead.count({
      where: {
        empresaId,
        status: { in: ["em_contato", "qualificado"] },
      },
    }),
    prisma.lead.count({
      where: {
        empresaId,
        status: "disponivel",
      },
    }),
    prisma.lead.count({
      where: {
        empresaId,
        status: "ativado",
        ativadoEm: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  return {
    emProspeccao,
    emQualificacao,
    qualificadosDisponiveis,
    ativadosHoje,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const data = await getDashboardData(session.user.empresaId)
  const insights = await generateDashboardInsights(session.user.empresaId)

  const cards = [
    {
      title: "Em Prospecção",
      value: data.emProspeccao,
      icon: Users,
      color: "bg-blue-500",
      description: "Leads sendo identificados",
    },
    {
      title: "Em Qualificação",
      value: data.emQualificacao,
      icon: Clock,
      color: "bg-yellow-500",
      description: "SDR IA em contato",
    },
    {
      title: "Qualificados Disponíveis",
      value: data.qualificadosDisponiveis,
      icon: CheckCircle,
      color: "bg-green-500",
      description: "Prontos para ativar",
    },
    {
      title: "Ativados Hoje",
      value: data.ativadosHoje,
      icon: TrendingUp,
      color: "bg-purple-500",
      description: "Leads consumidos hoje",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Acompanhe o status da sua prospecção de leads
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.color} p-3 rounded-lg`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          ))}
        </div>

        {insights.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">
                Insights Automáticos
              </h2>
            </div>
            <div className="space-y-3">
              {insights.map((insight, index) => {
                const iconMap = {
                  success: CheckCircle,
                  warning: AlertTriangle,
                  info: Info,
                  alert: AlertTriangle,
                }
                const colorMap = {
                  success: "bg-green-50 border-green-200 text-green-900",
                  warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
                  info: "bg-blue-50 border-blue-200 text-blue-900",
                  alert: "bg-red-50 border-red-200 text-red-900",
                }
                const Icon = iconMap[insight.type]
                const colors = colorMap[insight.type]

                return (
                  <div
                    key={index}
                    className={`flex items-start p-4 border rounded-lg ${colors}`}
                  >
                    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${
                      insight.type === "success" ? "text-green-600" :
                      insight.type === "warning" ? "text-yellow-600" :
                      insight.type === "info" ? "text-blue-600" :
                      "text-red-600"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium mb-1">{insight.title}</p>
                      <p className="text-sm opacity-90">{insight.message}</p>
                      {insight.action && insight.actionUrl && (
                        <Link
                          href={insight.actionUrl}
                          className="inline-block mt-2 text-sm font-medium underline hover:opacity-80"
                        >
                          {insight.action} →
                        </Link>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Próximos Passos
          </h2>
          <div className="space-y-3">
            {data.qualificadosDisponiveis > 0 ? (
              <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-green-900">
                    Você tem {data.qualificadosDisponiveis} lead(s) qualificado(s) disponível(is)
                  </p>
                  <p className="text-sm text-green-700">
                    Acesse a página de Leads para ativá-los
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-blue-900">
                    Seus leads estão sendo qualificados
                  </p>
                  <p className="text-sm text-blue-700">
                    Em breve você terá leads qualificados disponíveis
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


