import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { PerfilProspeccaoForm } from "@/components/configuracoes/PerfilProspeccaoForm"
import { Settings, Zap, Cog, Info } from "lucide-react"

async function getPerfil(empresaId: string) {
  const perfil = await prisma.perfilProspeccao.findUnique({
    where: { empresaId },
  })

  return perfil
}

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const perfil = await getPerfil(session.user.empresaId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">
            Configure uma vez e a IA trabalha sozinha. O SDR Virtual opera de forma contínua e ilimitada.
          </p>
        </div>

        {/* CAMADA 1 - CONFIGURAÇÃO ESSENCIAL (BÁSICA) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">Configuração Essencial</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Essas configurações são essenciais para o funcionamento do seu SDR Virtual. Configure uma vez e a IA trabalha sozinha.
          </p>

          {/* Perfil de Prospecção (ICP) */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Perfil de Prospecção (ICP)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Defina quais leads serão prospectados e qualificados pela IA. Essas regras orientam a prospecção, enquanto a IA opera de forma contínua e escalável, sem limitações de volume.
            </p>
            {perfil && <PerfilProspeccaoForm perfil={perfil} />}
          </div>

          {/* Placeholder para futuras configurações essenciais */}
          {/* 
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Status do Agente
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Ative ou desative o SDR Virtual. Quando ativo, a IA trabalha de forma contínua e ilimitada.
            </p>
            <div className="flex items-center gap-3">
              <label className="flex items-center">
                <input type="radio" name="status" value="ativo" className="mr-2" />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="status" value="desligado" className="mr-2" />
                <span className="text-sm font-medium text-gray-700">Desligado</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Objetivo Central do Agente
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Defina o objetivo principal do seu SDR Virtual. A IA usará isso para guiar todas as conversas.
            </p>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={4}
              placeholder="Ex: Qualificar leads interessados em sistema de gestão para clínicas..."
            />
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Canais de Comunicação
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Selecione os canais onde o SDR Virtual irá operar. A IA pode trabalhar em múltiplos canais simultaneamente.
            </p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">WhatsApp</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Chatguru</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">ManyChat</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Agenda e Regras Operacionais
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure regras de agenda para organização humana e compliance. A IA continua operando de forma contínua, respeitando essas regras para melhor organização.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duração Mínima de Reunião (minutos)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="30"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Regra para organização da agenda humana. A IA continua operando normalmente.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Antecedência Mínima para Agendamento (horas)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="24"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Garante melhor organização da agenda humana, enquanto a IA trabalha continuamente.
                </p>
              </div>
            </div>
          </div>
          */}
        </div>

        {/* CAMADA 2 - CONFIGURAÇÃO AVANÇADA */}
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Cog className="h-5 w-5 text-gray-500" />
            <h2 className="text-xl font-bold text-gray-900">Configuração Avançada</h2>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
              Avançado
            </span>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <p className="text-sm text-blue-800">
                <strong>Recomendado para usuários experientes.</strong> Essas configurações permitem personalização avançada do comportamento do SDR Virtual. A IA continua operando de forma ilimitada, independente dessas configurações.
              </p>
            </div>
          </div>

          {/* Placeholder para configurações avançadas */}
          {/*
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Ritmo de Resposta
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure o tempo entre mensagens e latência de resposta. Essas configurações afetam apenas o timing, não limitam a capacidade da IA.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer de Resposta (segundos)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tempo entre Mensagens (segundos)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Linguagem e Estilo
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalize o estilo de comunicação do SDR Virtual. A IA adapta-se mantendo eficiência ilimitada.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tamanho de Mensagens
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                  <option>Curto</option>
                  <option>Médio</option>
                  <option>Longo</option>
                </select>
              </div>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Usar emojis</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-700">Permitir abreviações</span>
              </label>
            </div>
          </div>
          */}

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
            <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              Configurações avançadas estarão disponíveis em breve.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


