/**
 * Biblioteca de insights e análises automáticas
 * Gera leituras contextuais baseadas nos dados atuais
 */

import { prisma } from "@/lib/prisma"

export interface Insight {
  type: "success" | "warning" | "info" | "alert"
  title: string
  message: string
  action?: string
  actionUrl?: string
}

export interface FunnelMetrics {
  prospectavel: number
  em_contato: number
  qualificado: number
  disponivel: number
  ativado: number
  descartado: number
  conversions: {
    prospectavelToContato: number
    contatoToQualificado: number
    qualificadoToDisponivel: number
    disponivelToAtivado: number
  }
  dropPoints: Array<{
    from: string
    to: string
    dropRate: number
    count: number
  }>
}

export interface ConversationAnalysis {
  totalConversations: number
  byInterest: {
    quente: number
    morno: number
    frio: number
    semClassificacao: number
  }
  avgScore: number
  topReasons: Array<{
    reason: string
    count: number
    percentage: number
  }>
}

/**
 * Gera insights contextuais automáticos baseados nos dados do dashboard
 */
export async function generateDashboardInsights(empresaId: string): Promise<Insight[]> {
  const insights: Insight[] = []

  // Busca dados atuais
  const [
    emProspeccao,
    emQualificacao,
    qualificadosDisponiveis,
    ativadosHoje,
    totalAtivados,
    leadsDescartados,
  ] = await Promise.all([
    prisma.lead.count({
      where: { empresaId, status: "prospectavel" },
    }),
    prisma.lead.count({
      where: { empresaId, status: { in: ["em_contato", "qualificado"] } },
    }),
    prisma.lead.count({
      where: { empresaId, status: "disponivel" },
    }),
    prisma.lead.count({
      where: {
        empresaId,
        status: "ativado",
        ativadoEm: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.lead.count({
      where: { empresaId, status: "ativado" },
    }),
    prisma.lead.count({
      where: { empresaId, status: "descartado" },
    }),
  ])

  // Insight: Leads disponíveis para ativação
  if (qualificadosDisponiveis > 0) {
    insights.push({
      type: "success",
      title: `${qualificadosDisponiveis} lead(s) qualificado(s) aguardando ativação`,
      message: `Você tem leads prontos para contato. Ative-os para iniciar o relacionamento.`,
      action: "Ver Leads",
      actionUrl: "/leads",
    })
  }

  // Insight: Taxa de ativação hoje
  if (ativadosHoje > 0) {
    const taxaAtivacao = qualificadosDisponiveis > 0 
      ? ((ativadosHoje / (qualificadosDisponiveis + ativadosHoje)) * 100).toFixed(1)
      : "100"
    
    insights.push({
      type: "info",
      title: `${ativadosHoje} lead(s) ativado(s) hoje`,
      message: `Taxa de ativação: ${taxaAtivacao}% dos leads disponíveis.`,
    })
  }

  // Insight: Alto volume em prospecção
  if (emProspeccao > 50) {
    insights.push({
      type: "info",
      title: "Alto volume de leads em prospecção",
      message: `${emProspeccao} leads aguardando qualificação. A IA está processando em escala.`,
    })
  }

  // Insight: Leads em qualificação
  if (emQualificacao > 0) {
    insights.push({
      type: "info",
      title: `${emQualificacao} lead(s) em processo de qualificação`,
      message: "A IA está em contato ativo com esses leads. Resultados em breve.",
    })
  }

  // Insight: Taxa de descarte
  if (leadsDescartados > 0 && totalAtivados > 0) {
    const taxaDescarte = ((leadsDescartados / (totalAtivados + leadsDescartados)) * 100).toFixed(1)
    
    if (parseFloat(taxaDescarte) > 30) {
      insights.push({
        type: "warning",
        title: "Taxa de descarte acima de 30%",
        message: `${taxaDescarte}% dos leads foram descartados. Considere revisar os critérios de qualificação.`,
        action: "Ver Configurações",
        actionUrl: "/configuracoes",
      })
    }
  }

  // Insight: Sem leads disponíveis
  if (qualificadosDisponiveis === 0 && emQualificacao === 0 && emProspeccao === 0) {
    insights.push({
      type: "alert",
      title: "Nenhum lead em processo",
      message: "Não há leads sendo processados no momento. Verifique a integração com o sistema de prospecção.",
    })
  }

  return insights
}

/**
 * Calcula métricas do funil de vendas
 */
export async function calculateFunnelMetrics(empresaId: string): Promise<FunnelMetrics> {
  const [
    prospectavel,
    em_contato,
    qualificado,
    disponivel,
    ativado,
    descartado,
  ] = await Promise.all([
    prisma.lead.count({ where: { empresaId, status: "prospectavel" } }),
    prisma.lead.count({ where: { empresaId, status: "em_contato" } }),
    prisma.lead.count({ where: { empresaId, status: "qualificado" } }),
    prisma.lead.count({ where: { empresaId, status: "disponivel" } }),
    prisma.lead.count({ where: { empresaId, status: "ativado" } }),
    prisma.lead.count({ where: { empresaId, status: "descartado" } }),
  ])

  // Calcula conversões
  const totalIniciado = prospectavel + em_contato
  const prospectavelToContato = totalIniciado > 0 
    ? ((em_contato / totalIniciado) * 100) 
    : 0

  const contatoToQualificado = em_contato > 0 
    ? ((qualificado / em_contato) * 100) 
    : 0

  const qualificadoToDisponivel = qualificado > 0 
    ? ((disponivel / qualificado) * 100) 
    : 0

  const disponivelToAtivado = disponivel > 0 
    ? ((ativado / disponivel) * 100) 
    : 0

  // Identifica pontos de queda
  const dropPoints: Array<{ from: string; to: string; dropRate: number; count: number }> = []

  if (prospectavelToContato < 50 && totalIniciado > 0) {
    dropPoints.push({
      from: "Prospectável",
      to: "Em Contato",
      dropRate: 100 - prospectavelToContato,
      count: prospectavel - em_contato,
    })
  }

  if (contatoToQualificado < 40 && em_contato > 0) {
    dropPoints.push({
      from: "Em Contato",
      to: "Qualificado",
      dropRate: 100 - contatoToQualificado,
      count: em_contato - qualificado,
    })
  }

  if (qualificadoToDisponivel < 60 && qualificado > 0) {
    dropPoints.push({
      from: "Qualificado",
      to: "Disponível",
      dropRate: 100 - qualificadoToDisponivel,
      count: qualificado - disponivel,
    })
  }

  if (disponivelToAtivado < 70 && disponivel > 0) {
    dropPoints.push({
      from: "Disponível",
      to: "Ativado",
      dropRate: 100 - disponivelToAtivado,
      count: disponivel - ativado,
    })
  }

  return {
    prospectavel,
    em_contato,
    qualificado,
    disponivel,
    ativado,
    descartado,
    conversions: {
      prospectavelToContato,
      contatoToQualificado,
      qualificadoToDisponivel,
      disponivelToAtivado,
    },
    dropPoints,
  }
}

/**
 * Analisa conversas e classifica por interesse
 */
export async function analyzeConversations(empresaId: string): Promise<ConversationAnalysis> {
  const leads = await prisma.lead.findMany({
    where: {
      empresaId,
      status: { in: ["qualificado", "disponivel", "ativado", "descartado"] },
    },
    select: {
      classificacao: true,
      score: true,
      motivoDescarte: true,
    },
  })

  const totalConversations = leads.length
  const byInterest = {
    quente: leads.filter((l) => l.classificacao === "quente").length,
    morno: leads.filter((l) => l.classificacao === "morno").length,
    frio: leads.filter((l) => l.classificacao === "frio").length,
    semClassificacao: leads.filter((l) => !l.classificacao).length,
  }

  const scores = leads.filter((l) => l.score !== null).map((l) => l.score as number)
  const avgScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0

  // Analisa motivos de descarte
  const descartados = leads.filter((l) => l.motivoDescarte)
  const reasonCounts: Record<string, number> = {}

  descartados.forEach((lead) => {
    if (lead.motivoDescarte) {
      reasonCounts[lead.motivoDescarte] = (reasonCounts[lead.motivoDescarte] || 0) + 1
    }
  })

  const topReasons = Object.entries(reasonCounts)
    .map(([reason, count]) => ({
      reason,
      count,
      percentage: totalConversations > 0 ? (count / totalConversations) * 100 : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    totalConversations,
    byInterest,
    avgScore: Math.round(avgScore),
    topReasons,
  }
}

