import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * Webhook para receber dados de leads do n8n
 * 
 * Endpoint mínimo que recebe dados de um lead e salva no banco
 * 
 * Payload esperado:
 * {
 *   empresaId: string (obrigatório),
 *   nomeEmpresa: string (obrigatório),
 *   segmento: string (obrigatório),
 *   cidade: string (obrigatório),
 *   telefone?: string,
 *   whatsapp?: string,
 *   email?: string,
 *   score?: number,
 *   classificacao?: string,
 *   urgencia?: string,
 *   dorPrincipal?: string,
 *   resumoConversa?: string,
 *   status?: string (default: "prospectavel")
 * }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const {
      empresaId,
      nomeEmpresa,
      segmento,
      cidade,
      telefone,
      whatsapp,
      email,
      score,
      classificacao,
      urgencia,
      dorPrincipal,
      resumoConversa,
      status,
    } = body

    // Validações básicas dos campos obrigatórios
    if (!empresaId || !nomeEmpresa || !segmento || !cidade) {
      return NextResponse.json(
        { error: "empresaId, nomeEmpresa, segmento e cidade são obrigatórios" },
        { status: 400 }
      )
    }

    // Cria o lead no banco
    const lead = await prisma.lead.create({
      data: {
        empresaId,
        nomeEmpresa,
        segmento,
        cidade,
        telefone: telefone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        score: score !== undefined ? score : null,
        classificacao: classificacao || null,
        urgencia: urgencia || null,
        dorPrincipal: dorPrincipal || null,
        resumoConversa: resumoConversa || null,
        status: status || "prospectavel",
      },
    })

    return NextResponse.json(
      { success: true, leadId: lead.id },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("[WEBHOOK N8N] Erro ao processar webhook:", error)
    
    // Log detalhado do erro para debug
    if (error.code) {
      console.error("[WEBHOOK N8N] Código do erro:", error.code)
    }
    if (error.message) {
      console.error("[WEBHOOK N8N] Mensagem do erro:", error.message)
    }
    
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

