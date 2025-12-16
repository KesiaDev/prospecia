import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Webhook para receber dados do n8n após qualificação de lead via WhatsApp
 * 
 * Este endpoint é chamado pelo n8n quando:
 * 1. Um lead foi contatado via WhatsApp
 * 2. A conversa foi processada pela IA
 * 3. O lead foi qualificado ou descartado
 * 
 * Payload esperado:
 * {
 *   leadId: string,
 *   empresaId: string,
 *   status: "qualificado" | "disponivel" | "descartado",
 *   score: number (0-100),
 *   classificacao: "frio" | "morno" | "quente",
 *   urgencia: "Baixa" | "Média" | "Alta",
 *   dorPrincipal?: string,
 *   resumoConversa?: string,
 *   motivoDescarte?: string,
 *   historicoConversa?: Array<{tipo: "enviada" | "recebida", mensagem: string, timestamp: string}>
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      leadId,
      empresaId,
      status,
      score,
      classificacao,
      urgencia,
      dorPrincipal,
      resumoConversa,
      motivoDescarte,
      historicoConversa,
    } = body

    // Validações básicas
    if (!leadId || !empresaId || !status) {
      return NextResponse.json(
        { error: "leadId, empresaId e status são obrigatórios" },
        { status: 400 }
      )
    }

    // Verifica se o lead existe e pertence à empresa
    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        empresaId,
      },
    })

    if (!lead) {
      return NextResponse.json(
        { error: "Lead não encontrado" },
        { status: 404 }
      )
    }

    // Atualiza o lead com os dados da qualificação
    const updateData: any = {
      status,
      score: score !== undefined ? score : null,
      classificacao: classificacao || null,
      urgencia: urgencia || null,
      dorPrincipal: dorPrincipal || null,
      resumoConversa: resumoConversa || null,
      motivoDescarte: motivoDescarte || null,
      historicoConversa: historicoConversa ? historicoConversa : null,
    }

    await prisma.lead.update({
      where: { id: leadId },
      data: updateData,
    })

    return NextResponse.json(
      { message: "Lead atualizado com sucesso", leadId },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erro ao processar webhook do n8n:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    )
  }
}

/**
 * GET para verificar se o webhook está funcionando
 */
export async function GET() {
  return NextResponse.json(
    { message: "Webhook n8n está ativo", timestamp: new Date().toISOString() },
    { status: 200 }
  )
}

