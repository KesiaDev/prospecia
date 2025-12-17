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
 * Foca em eficiência da IA, pontos de atenção e oportunidades de melhoria
 */
export async function generateDashboardInsights(empresaId: string): Promise<Insight[]> {
  const insights: Insight[] = []

  // Busca dados atuais e métricas adicionais para análise estratégica
  const [
    emProspeccao,
    emContato,
    qualificado,
    qualificadosDisponiveis,
    ativadosHoje,
    totalAtivados,
    leadsDescartados,
    leadsComScore,
  ] = await Promise.all([
    prisma.lead.count({
      where: { empresaId, status: "prospectavel" },
    }),
    prisma.lead.count({
      where: { empresaId, status: "em_contato" },
    }),
    prisma.lead.count({
      where: { empresaId, status: "qualificado" },
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
    prisma.lead.count({
      where: {
        empresaId,
        score: { not: null },
      },
    }),
  ])

  const emQualificacao = emContato + qualificado
  const totalProcessado = totalAtivados + leadsDescartados

  // ===== ANÁLISE DE EFICIÊNCIA DA IA =====
  
  // Eficiência da IA: taxa de qualificação vs descarte
  if (totalProcessado > 0) {
    const eficienciaIA = ((totalAtivados / totalProcessado) * 100)
    
    if (eficienciaIA >= 70) {
      insights.push({
        type: "success",
        title: "Alta eficiência da IA",
        message: `${eficienciaIA.toFixed(0)}% dos leads processados foram qualificados. A automação está funcionando bem.`,
      })
    } else if (eficienciaIA < 50 && totalProcessado > 10) {
      insights.push({
        type: "warning",
        title: "Eficiência da IA abaixo do esperado",
        message: `${eficienciaIA.toFixed(0)}% de qualificação. Considere ajustar os critérios de prospecção.`,
        action: "Ver Funil",
        actionUrl: "/funil",
      })
    }
  }

  // ===== IDENTIFICAÇÃO DE GARGALOS =====

  // Gargalo: Alto volume em prospecção com poucos em contato
  if (emProspeccao > 20 && emContato < 5) {
    insights.push({
      type: "warning",
      title: "Gargalo na etapa de contato",
      message: `${emProspeccao} leads aguardando, mas apenas ${emContato} em contato. A IA pode estar sobrecarregada ou com baixa taxa de conversão inicial.`,
      action: "Ver Funil",
      actionUrl: "/funil",
    })
  }

  // Gargalo: Muitos em contato, poucos qualificados
  if (emContato > 10 && qualificado < emContato * 0.3) {
    const taxaConversao = emContato > 0 ? ((qualificado / emContato) * 100).toFixed(0) : "0"
    insights.push({
      type: "warning",
      title: "Baixa conversão em qualificação",
      message: `${taxaConversao}% dos leads em contato estão sendo qualificados. Pode indicar necessidade de ajuste no fluxo de conversação.`,
      action: "Ver Relatórios",
      actionUrl: "/relatorios",
    })
  }

  // Gargalo: Muitos qualificados disponíveis, poucos ativados
  if (qualificadosDisponiveis > 10 && ativadosHoje === 0) {
    insights.push({
      type: "info",
      title: "Oportunidade de ativação",
      message: `${qualificadosDisponiveis} leads qualificados aguardando. Ative-os para acelerar o processo comercial.`,
      action: "Ver Leads",
      actionUrl: "/leads",
    })
  }

  // ===== PADRÕES E OPORTUNIDADES =====

  // Padrão: Alta automação com baixa conversão
  if (emProspeccao > 50 && emQualificacao > 20 && totalAtivados < 5) {
    insights.push({
      type: "warning",
      title: "Alta automação, baixa conversão",
      message: "Muitos leads sendo processados, mas poucos ativados. Pode haver gargalo comercial ou necessidade de melhor qualificação.",
      action: "Ver Relatórios",
      actionUrl: "/relatorios",
    })
  }

  // Padrão: Boa escalabilidade (alto volume processando)
  if (emProspeccao > 30 && emQualificacao > 10) {
    insights.push({
      type: "success",
      title: "Boa escalabilidade operacional",
      message: `${emProspeccao + emQualificacao} leads em processamento simultâneo. A IA está operando em escala.`,
    })
  }

  // ===== INSIGHTS CONTEXTUAIS SIMPLES =====

  // Leads disponíveis para ativação (prioritário)
  if (qualificadosDisponiveis > 0) {
    insights.push({
      type: "success",
      title: `${qualificadosDisponiveis} lead(s) pronto(s) para ativação`,
      message: "Leads qualificados aguardando seu contato.",
      action: "Ativar Agora",
      actionUrl: "/leads",
    })
  }

  // Taxa de ativação hoje (se relevante)
  if (ativadosHoje > 0 && qualificadosDisponiveis > 0) {
    const taxaAtivacao = ((ativadosHoje / (qualificadosDisponiveis + ativadosHoje)) * 100).toFixed(0)
    if (parseFloat(taxaAtivacao) < 30) {
      insights.push({
        type: "info",
        title: "Taxa de ativação hoje: " + taxaAtivacao + "%",
        message: "Ainda há leads disponíveis para ativação.",
      })
    }
  }

  // Score médio (se houver dados suficientes)
  if (leadsComScore > 5) {
    const leadsComDados = await prisma.lead.findMany({
      where: {
        empresaId,
        score: { not: null },
      },
      select: { score: true },
      take: 100,
    })
    
    const scores = leadsComDados.map(l => l.score as number)
    const scoreMedio = scores.reduce((a, b) => a + b, 0) / scores.length

    if (scoreMedio >= 70) {
      insights.push({
        type: "success",
        title: "Score médio alto",
        message: `Score médio de ${scoreMedio.toFixed(0)} indica boa qualidade dos leads qualificados.`,
      })
    } else if (scoreMedio < 50 && leadsComScore > 10) {
      insights.push({
        type: "warning",
        title: "Score médio baixo",
        message: `Score médio de ${scoreMedio.toFixed(0)} sugere necessidade de melhorar a qualificação.`,
        action: "Ver Relatórios",
        actionUrl: "/relatorios",
      })
    }
  }

  // ===== ALERTAS CRÍTICOS =====

  // Sistema parado
  if (qualificadosDisponiveis === 0 && emQualificacao === 0 && emProspeccao === 0 && totalAtivados === 0) {
    insights.push({
      type: "alert",
      title: "Nenhum lead em processo",
      message: "Sistema sem atividade. Verifique a integração de prospecção.",
    })
  }

  // Taxa de descarte muito alta
  if (leadsDescartados > 0 && totalProcessado > 10) {
    const taxaDescarte = ((leadsDescartados / totalProcessado) * 100)
    if (taxaDescarte > 50) {
      insights.push({
        type: "warning",
        title: "Taxa de descarte elevada",
        message: `${taxaDescarte.toFixed(0)}% dos leads foram descartados. Revise os critérios de qualificação.`,
        action: "Ver Configurações",
        actionUrl: "/configuracoes",
      })
    }
  }

  // Limita a 5 insights mais relevantes para manter visual limpo
  return insights.slice(0, 5)
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

