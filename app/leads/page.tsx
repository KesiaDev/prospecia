import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { prisma } from "@/lib/prisma"
import { LeadsList } from "@/components/leads/LeadsList"

async function getLeads(empresaId: string) {
  const leads = await prisma.lead.findMany({
    where: {
      empresaId,
      status: "disponivel",
    },
    orderBy: [
      { score: "desc" },
      { createdAt: "desc" },
    ],
  })

  return leads
}

export default async function LeadsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  if (!session.user.onboardingCompleto) {
    redirect("/onboarding")
  }

  const leads = await getLeads(session.user.empresaId)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Qualificados</h1>
            <p className="text-gray-600">
              {leads.length} lead(s) disponível(is) para ativação
            </p>
          </div>
        </div>

        <LeadsList leads={leads} />
      </div>
    </DashboardLayout>
  )
}


