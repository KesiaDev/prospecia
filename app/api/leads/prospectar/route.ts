import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * Endpoint para iniciar prospecção de novos leads
 * 
 * Este endpoint pode ser chamado:
 * 1. Manualmente pelo cliente (opcional no MVP)
 * 2. Automaticamente por um cron job
 * 3. Pelo n8n quando necessário
 * 
 * O que faz:
 * 1. Busca leads "prospectavel" baseado no perfil de prospecção
 * 2. Envia para o n8n via webhook para iniciar contato via WhatsApp
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    // Busca perfil de prospecção
    const perfil = await prisma.perfilProspeccao.findUnique({
      where: { empresaId: session.user.empresaId },
    })

    if (!perfil) {
      return NextResponse.json(
        { error: "Perfil de prospecção não encontrado. Complete o onboarding primeiro." },
        { status: 400 }
      )
    }

    // Busca leads prospectáveis que ainda não foram contatados
    const leadsProspectaveis = await prisma.lead.findMany({
      where: {
        empresaId: session.user.empresaId,
        status: "prospectavel",
      },
      take: 10, // Limita a 10 por vez
    })

    if (leadsProspectaveis.length === 0) {
      return NextResponse.json(
        { message: "Nenhum lead prospectável no momento" },
        { status: 200 }
      )
    }

    // Atualiza status para "em_contato" e envia para n8n
    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL

    if (!n8nWebhookUrl) {
      return NextResponse.json(
        { error: "Webhook do n8n não configurado" },
        { status: 500 }
      )
    }

    const leadsEnviados = []

    for (const lead of leadsProspectaveis) {
      // Atualiza status
      await prisma.lead.update({
        where: { id: lead.id },
        data: { status: "em_contato" },
      })

      // Envia para n8n (isso deve ser feito de forma assíncrona em produção)
      try {
        const response = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadId: lead.id,
            empresaId: session.user.empresaId,
            nomeEmpresa: lead.nomeEmpresa,
            telefone: lead.telefone,
            whatsapp: lead.whatsapp,
            perfilProspeccao: {
              nicho: perfil.nicho,
              tipoCliente: perfil.tipoCliente,
              ticketMinimo: perfil.ticketMinimo,
              precisaDecisor: perfil.precisaDecisor,
              urgenciaMinima: perfil.urgenciaMinima,
            },
          }),
        })

        if (response.ok) {
          leadsEnviados.push(lead.id)
        }
      } catch (error) {
        console.error(`Erro ao enviar lead ${lead.id} para n8n:`, error)
        // Reverte status em caso de erro
        await prisma.lead.update({
          where: { id: lead.id },
          data: { status: "prospectavel" },
        })
      }
    }

    return NextResponse.json(
      {
        message: `${leadsEnviados.length} lead(s) enviado(s) para prospecção`,
        leadsEnviados,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao prospectar leads:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

