import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Criar empresa de exemplo
  const empresa = await prisma.empresa.upsert({
    where: { cnpj: '12.345.678/0001-90' },
    update: {},
    create: {
      nome: 'Empresa Exemplo LTDA',
      cnpj: '12.345.678/0001-90',
    },
  })

  console.log('✅ Empresa criada:', empresa.nome)

  // Criar usuário de exemplo
  const senhaHash = await bcrypt.hash('senha123', 10)
  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@exemplo.com' },
    update: {},
    create: {
      email: 'admin@exemplo.com',
      senha: senhaHash,
      nome: 'Admin Exemplo',
      empresaId: empresa.id,
      onboardingCompleto: true,
    },
  })

  console.log('✅ Usuário criado:', usuario.email)

  // Criar perfil de prospecção
  const perfil = await prisma.perfilProspeccao.upsert({
    where: { empresaId: empresa.id },
    update: {},
    create: {
      empresaId: empresa.id,
      nicho: 'Clínicas',
      tipoCliente: 'PJ',
      cidades: ['São Paulo', 'Rio de Janeiro'],
      ticketMinimo: 5000.00,
      precisaDecisor: true,
      urgenciaMinima: 'Média',
    },
  })

  console.log('✅ Perfil de prospecção criado')

  // Criar alguns leads de exemplo
  const leads = [
    {
      nomeEmpresa: 'Clínica Saúde Total',
      segmento: 'Clínicas',
      cidade: 'São Paulo',
      telefone: '+5511999999999',
      whatsapp: '+5511999999999',
      email: 'contato@clinicasaude.com',
      cnpj: '11.111.111/0001-11',
      status: 'disponivel' as const,
      score: 85,
      classificacao: 'quente' as const,
      urgencia: 'Alta' as const,
      dorPrincipal: 'Precisa de sistema de gestão para agendamentos',
      resumoConversa: 'Cliente demonstrou interesse em sistema de gestão. Orçamento disponível.',
    },
    {
      nomeEmpresa: 'Clínica Bem Estar',
      segmento: 'Clínicas',
      cidade: 'Rio de Janeiro',
      telefone: '+5521888888888',
      whatsapp: '+5521888888888',
      email: 'contato@clinicaest.com',
      cnpj: '22.222.222/0001-22',
      status: 'disponivel' as const,
      score: 70,
      classificacao: 'morno' as const,
      urgencia: 'Média' as const,
      dorPrincipal: 'Dificuldade em organizar atendimentos',
      resumoConversa: 'Cliente tem interesse mas precisa avaliar melhor.',
    },
    {
      nomeEmpresa: 'Clínica Vida',
      segmento: 'Clínicas',
      cidade: 'São Paulo',
      telefone: '+5511777777777',
      whatsapp: '+5511777777777',
      status: 'em_contato' as const,
    },
    {
      nomeEmpresa: 'Clínica Esperança',
      segmento: 'Clínicas',
      cidade: 'São Paulo',
      telefone: '+5511666666666',
      whatsapp: '+5511666666666',
      status: 'prospectavel' as const,
    },
  ]

  for (const leadData of leads) {
    await prisma.lead.create({
      data: {
        ...leadData,
        empresaId: empresa.id,
      },
    })
  }

  console.log(`✅ ${leads.length} leads de exemplo criados`)

  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de teste:')
  console.log('   Email: admin@exemplo.com')
  console.log('   Senha: senha123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


