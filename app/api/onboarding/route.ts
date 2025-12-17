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
    const {
      nicho,
      tipoCliente,
      cidades,
      ticketMinimo,
      precisaDecisor,
      urgenciaMinima,
    } = body

    // Validações
    if (!nicho || !tipoCliente || !cidades || cidades.length === 0 || !ticketMinimo || !urgenciaMinima) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Cria ou atualiza perfil de prospecção
    await prisma.perfilProspeccao.upsert({
      where: { empresaId: session.user.empresaId },
      update: {
        nicho,
        tipoCliente,
        cidades,
        ticketMinimo,
        precisaDecisor,
        urgenciaMinima,
      },
      create: {
        empresaId: session.user.empresaId,
        nicho,
        tipoCliente,
        cidades,
        ticketMinimo,
        precisaDecisor,
        urgenciaMinima,
      },
    })

    // Marca onboarding como completo
    await prisma.usuario.update({
      where: { id: session.user.id },
      data: { onboardingCompleto: true },
    })

    return NextResponse.json(
      { message: "Onboarding concluído com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao salvar onboarding:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


