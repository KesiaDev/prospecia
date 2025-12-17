import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { Users, Clock, CheckCircle, TrendingUp } from "lucide-react"

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


