import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: Request) {
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

    // Atualiza perfil de prospecção
    await prisma.perfilProspeccao.update({
      where: { empresaId: session.user.empresaId },
      data: {
        nicho,
        tipoCliente,
        cidades,
        ticketMinimo,
        precisaDecisor,
        urgenciaMinima,
      },
    })

    return NextResponse.json(
      { message: "Configurações salvas com sucesso" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao salvar configurações:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}


