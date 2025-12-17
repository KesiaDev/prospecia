import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { PerfilProspeccaoForm } from "@/components/configuracoes/PerfilProspeccaoForm"

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
            Gerencie seu perfil de prospecção e preferências
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Perfil de Prospecção (ICP)
          </h2>
          <p className="text-gray-600 mb-6">
            Estas configurações definem quais leads serão prospectados e qualificados para você.
          </p>
          {perfil && <PerfilProspeccaoForm perfil={perfil} />}
        </div>
      </div>
    </DashboardLayout>
  )
}


