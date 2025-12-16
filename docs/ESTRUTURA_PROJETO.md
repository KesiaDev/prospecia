# Estrutura do Projeto ProspecIA

## Visão Geral

ProspecIA é uma plataforma B2B completa para geração e qualificação de leads via WhatsApp com SDR IA. O projeto foi desenvolvido com Next.js 14 (App Router), TypeScript, Prisma e TailwindCSS.

## Estrutura de Diretórios

```
prospecia/
├── app/                          # App Router do Next.js
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Autenticação
│   │   │   ├── [...nextauth]/   # NextAuth handler
│   │   │   └── registro/         # Registro de novos usuários
│   │   ├── webhooks/             # Webhooks externos
│   │   │   └── n8n/              # Webhook do n8n
│   │   ├── leads/                # APIs de leads
│   │   │   ├── ativar/           # Ativar leads
│   │   │   └── prospectar/       # Iniciar prospecção
│   │   ├── onboarding/           # API de onboarding
│   │   └── configuracoes/        # APIs de configurações
│   ├── auth/                     # Páginas de autenticação
│   │   ├── login/                # Página de login
│   │   └── registro/             # Página de registro
│   ├── onboarding/               # Fluxo de onboarding
│   ├── dashboard/                # Dashboard principal
│   ├── leads/                    # Páginas de leads
│   │   └── [id]/                 # Detalhes do lead
│   ├── configuracoes/            # Página de configurações
│   ├── layout.tsx                # Layout raiz
│   ├── page.tsx                  # Página inicial
│   ├── providers.tsx             # Providers (NextAuth)
│   └── globals.css               # Estilos globais
├── components/                   # Componentes reutilizáveis
│   ├── layout/                   # Componentes de layout
│   │   ├── Sidebar.tsx           # Barra lateral
│   │   └── DashboardLayout.tsx   # Layout do dashboard
│   ├── onboarding/               # Componentes de onboarding
│   │   └── OnboardingStep.tsx    # Componente de passo
│   ├── leads/                    # Componentes de leads
│   │   ├── LeadsList.tsx         # Lista de leads
│   │   └── AtivarLeadButton.tsx  # Botão de ativação
│   └── configuracoes/            # Componentes de configurações
│       └── PerfilProspeccaoForm.tsx
├── lib/                          # Bibliotecas e utilitários
│   ├── prisma.ts                 # Cliente Prisma
│   ├── auth.ts                   # Configuração NextAuth
│   └── utils.ts                  # Funções utilitárias
├── prisma/                       # Prisma ORM
│   └── schema.prisma             # Schema do banco de dados
├── types/                        # Tipos TypeScript
│   └── next-auth.d.ts            # Tipos do NextAuth
├── docs/                         # Documentação
│   ├── ESTRUTURA_PROJETO.md      # Este arquivo
│   └── INTEGRACAO_N8N.md         # Documentação n8n
├── middleware.ts                 # Middleware do Next.js
├── tailwind.config.ts            # Configuração Tailwind
├── tsconfig.json                 # Configuração TypeScript
├── next.config.js                # Configuração Next.js
└── package.json                  # Dependências
```

## Modelos de Dados (Prisma)

### Empresa
- Representa uma empresa cliente (multi-tenant)
- Campos: id, nome, cnpj, timestamps
- Relacionamentos: usuarios, perfilProspeccao, leads

### Usuario
- Usuário da plataforma (pertence a uma empresa)
- Campos: id, email, senha (hash), nome, empresaId, role, onboardingCompleto
- Relacionamento: empresa

### PerfilProspeccao
- Configuração de prospecção (ICP) do cliente
- Campos: nicho, tipoCliente, cidades[], ticketMinimo, precisaDecisor, urgenciaMinima, capacidadeDiaria
- Relacionamento: empresa (1:1)

### Lead
- Lead prospectado e qualificado
- Campos: dados da empresa, status, score, classificacao, urgencia, dorPrincipal, resumoConversa, historicoConversa
- Status: prospectavel → em_contato → qualificado → disponivel → ativado / descartado
- Relacionamento: empresa

## Fluxos Principais

### 1. Autenticação
- Registro de empresa e primeiro usuário
- Login com email/senha
- Sessão JWT via NextAuth
- Middleware protegendo rotas privadas

### 2. Onboarding
- Fluxo obrigatório no primeiro login
- 7 perguntas sobre perfil de prospecção
- Bloqueia acesso ao dashboard até completar
- Cria/atualiza PerfilProspeccao

### 3. Prospecção de Leads
- Leads são criados com status "prospectavel"
- API `/api/leads/prospectar` envia para n8n
- n8n inicia conversa via WhatsApp
- n8n processa com IA e qualifica
- n8n retorna via webhook `/api/webhooks/n8n`
- Lead atualizado com dados de qualificação

### 4. Ativação de Leads
- Cliente visualiza leads "disponivel"
- Pode ativar individual ou em lote
- Respeita limite diário (capacidadeDiaria)
- Ao ativar: libera contato e histórico
- Status muda para "ativado"

## Regras de Negócio Implementadas

1. **Multi-tenant**: Cada empresa vê apenas seus dados
2. **Onboarding obrigatório**: Bloqueia acesso até completar
3. **Limite diário**: Respeitado na ativação de leads
4. **Contato oculto**: Telefone/WhatsApp só aparecem após ativação
5. **Duplicidade**: Estrutura preparada (entregueParaNicho, entregueParaCidade)

## APIs Principais

### Autenticação
- `POST /api/auth/registro` - Criar conta
- `POST /api/auth/[...nextauth]` - NextAuth (login/logout)

### Onboarding
- `POST /api/onboarding` - Salvar respostas do onboarding

### Leads
- `POST /api/leads/ativar` - Ativar lead(s)
- `POST /api/leads/prospectar` - Iniciar prospecção (envia para n8n)

### Webhooks
- `POST /api/webhooks/n8n` - Receber resultado da qualificação do n8n

### Configurações
- `PUT /api/configuracoes/perfil` - Atualizar perfil de prospecção

## Próximos Passos

### Para Produção

1. **Configurar Banco de Dados**
   - Criar instância PostgreSQL (Supabase, Railway, etc.)
   - Executar migrations: `npx prisma db push`
   - Gerar cliente: `npx prisma generate`

2. **Configurar Variáveis de Ambiente**
   - Copiar `env.example` para `.env`
   - Gerar `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Configurar `DATABASE_URL`
   - Configurar `N8N_WEBHOOK_URL`

3. **Configurar n8n**
   - Seguir documentação em `docs/INTEGRACAO_N8N.md`
   - Criar workflows de prospecção
   - Configurar integração WhatsApp
   - Configurar integração OpenAI

4. **Deploy**
   - Vercel (recomendado para Next.js)
   - Ou outro provedor (Railway, Render, etc.)

### Melhorias Futuras

1. **Autenticação nos Webhooks**
   - API keys ou assinatura HMAC
   - Rate limiting

2. **Geração Automática de Leads**
   - Integração com bases públicas B2B
   - Scraping ou APIs de dados empresariais
   - Fila de processamento

3. **Dashboard Avançado**
   - Gráficos de conversão
   - Métricas de performance
   - Exportação de relatórios

4. **Notificações**
   - Email quando lead qualificado
   - Notificações push
   - Alertas de limite diário

5. **Multi-usuário**
   - Gestão de usuários por empresa
   - Permissões e roles
   - Logs de atividades

## Tecnologias Utilizadas

- **Next.js 14**: Framework React com App Router
- **TypeScript**: Tipagem estática
- **Prisma**: ORM para PostgreSQL
- **NextAuth.js**: Autenticação
- **TailwindCSS**: Estilização
- **Lucide React**: Ícones
- **Zod**: Validação (preparado para uso futuro)

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm start

# Banco de dados
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
```

## Suporte

Para dúvidas sobre integração com n8n, consulte `docs/INTEGRACAO_N8N.md`.

