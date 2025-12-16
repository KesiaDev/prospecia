import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { formatCurrency } from "@/lib/utils"
import { getClassificacaoColor } from "@/lib/utils"
import { ArrowLeft, Phone, Mail, Building2 } from "lucide-react"
import Link from "next/link"

async function getLead(leadId: string, empresaId: string) {
  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      empresaId,
      status: "ativado", // Só mostra detalhes de leads ativados
    },
  })

  return lead
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const lead = await getLead(params.id, session.user.empresaId)

  if (!lead) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lead não encontrado</h2>
          <p className="text-gray-600 mb-4">
            Este lead não existe ou ainda não foi ativado.
          </p>
          <Link
            href="/leads"
            className="inline-flex items-center text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para lista de leads
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Link
          href="/leads"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para lista de leads
        </Link>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {lead.nomeEmpresa}
                </h1>
                <p className="text-gray-600">
                  {lead.segmento} • {lead.cidade}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {lead.score !== null && (
                  <span className="px-4 py-2 bg-primary-100 text-primary-800 rounded-full font-medium">
                    Score: {lead.score}
                  </span>
                )}
                {lead.classificacao && (
                  <span
                    className={`px-4 py-2 rounded-full font-medium ${getClassificacaoColor(
                      lead.classificacao
                    )}`}
                  >
                    {lead.classificacao.charAt(0).toUpperCase() + lead.classificacao.slice(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações de Contato */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Informações de Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead.telefone && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Telefone</p>
                      <p className="font-medium text-gray-900">{lead.telefone}</p>
                    </div>
                  </div>
                )}
                {lead.whatsapp && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Phone className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">WhatsApp</p>
                      <p className="font-medium text-gray-900">{lead.whatsapp}</p>
                    </div>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Mail className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{lead.email}</p>
                    </div>
                  </div>
                )}
                {lead.cnpj && (
                  <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                    <Building2 className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">CNPJ</p>
                      <p className="font-medium text-gray-900">{lead.cnpj}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Qualificação */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Qualificação</h2>
              <div className="space-y-3">
                {lead.urgencia && (
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700">Urgência</span>
                    <span className="text-gray-900">{lead.urgencia}</span>
                  </div>
                )}
                {lead.dorPrincipal && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 block mb-2">Dor Principal</span>
                    <p className="text-gray-900">{lead.dorPrincipal}</p>
                  </div>
                )}
                {lead.resumoConversa && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-700 block mb-2">Resumo da Conversa</span>
                    <p className="text-gray-900 whitespace-pre-wrap">{lead.resumoConversa}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Histórico de Conversa */}
            {lead.historicoConversa && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Histórico de Conversa</h2>
                <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                  {Array.isArray(lead.historicoConversa) ? (
                    <div className="space-y-3">
                      {lead.historicoConversa.map((msg: any, index: number) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg ${
                            msg.tipo === "enviada"
                              ? "bg-primary-100 ml-8"
                              : "bg-white mr-8"
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            {msg.tipo === "enviada" ? "SDR IA" : lead.nomeEmpresa}
                          </p>
                          <p className="text-gray-900">{msg.mensagem}</p>
                          {msg.timestamp && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(msg.timestamp).toLocaleString("pt-BR")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Histórico não disponível</p>
                  )}
                </div>
              </div>
            )}

            {/* Informações de Ativação */}
            {lead.ativadoEm && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Ativado em {new Date(lead.ativadoEm).toLocaleString("pt-BR")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

