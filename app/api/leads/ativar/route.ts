import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { leadIds } = body

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
      return NextResponse.json(
        { error: "IDs de leads são obrigatórios" },
        { status: 400 }
      )
    }

    // Verifica se os leads pertencem à empresa do usuário e estão disponíveis
    const leads = await prisma.lead.findMany({
      where: {
        id: { in: leadIds },
        empresaId: session.user.empresaId,
        status: "disponivel",
      },
    })

    if (leads.length !== leadIds.length) {
      return NextResponse.json(
        { error: "Alguns leads não foram encontrados ou não estão disponíveis" },
        { status: 400 }
      )
    }

    // Verifica limite diário
    const perfil = await prisma.perfilProspeccao.findUnique({
      where: { empresaId: session.user.empresaId },
    })

    if (perfil) {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)

      const ativadosHoje = await prisma.lead.count({
        where: {
          empresaId: session.user.empresaId,
          status: "ativado",
          ativadoEm: {
            gte: hoje,
          },
        },
      })

      if (ativadosHoje + leadIds.length > perfil.capacidadeDiaria) {
        return NextResponse.json(
          {
            error: `Limite diário excedido. Você pode ativar ${perfil.capacidadeDiaria - ativadosHoje} lead(s) hoje.`,
          },
          { status: 400 }
        )
      }
    }

    // Ativa os leads
    await prisma.lead.updateMany({
      where: {
        id: { in: leadIds },
      },
      data: {
        status: "ativado",
        ativadoEm: new Date(),
        ativadoPor: session.user.id,
      },
    })

    return NextResponse.json(
      { message: `${leadIds.length} lead(s) ativado(s) com sucesso` },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao ativar leads:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

