# ProspecIA

**Geração e Qualificação de Leads via WhatsApp com SDR IA**

ProspecIA é uma plataforma B2B completa que identifica empresas potenciais, prospecta ativamente via WhatsApp usando um SDR com IA, qualifica o interesse e entrega apenas leads prontos e validados para os clientes.

## 🎯 Objetivo do Produto

- **IDENTIFICA** empresas potenciais em bases públicas B2B
- **PROSPECTA** ativamente esses contatos via WhatsApp usando um SDR com IA
- **QUALIFICA** o interesse, urgência e perfil
- **ENTREGA** apenas leads prontos e validados para os clientes

O cliente **NÃO** fornece leads. O cliente **NÃO** faz tráfego pago. A plataforma é responsável por encontrar, abordar e qualificar os leads.

## 🚀 Stack Tecnológica

- **Frontend**: Next.js 14 (App Router)
- **Estilo**: TailwindCSS
- **Autenticação**: NextAuth.js (email/senha)
- **Backend**: API Routes do Next.js
- **Banco de dados**: PostgreSQL (via Prisma)
- **Orquestração**: n8n (via Webhooks)
- **IA**: OpenAI

## ✨ Funcionalidades do MVP

- ✅ **Autenticação multi-tenant** (email/senha)
- ✅ **Onboarding obrigatório** (7 perguntas sobre perfil de prospecção)
- ✅ **Perfil de Prospecção (ICP)** configurável
- ✅ **Dashboard** com métricas de leads
- ✅ **Lista de leads qualificados** disponíveis
- ✅ **Ativação de leads** (individual ou em lote)
- ✅ **Integração com n8n** para WhatsApp e IA
- ✅ **Controle de limite diário** de leads
- ✅ **Histórico de conversas** após ativação

## 📚 Documentação

- **[Guia de Início Rápido](docs/GETTING_STARTED.md)** - Configure e execute o projeto
- **[Estrutura do Projeto](docs/ESTRUTURA_PROJETO.md)** - Arquitetura e organização do código
- **[Integração com n8n](docs/INTEGRACAO_N8N.md)** - Como configurar a integração WhatsApp/IA

## 🛠️ Configuração Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

Copie `env.example` para `.env` e configure:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/prospecia"
NEXTAUTH_SECRET="gere-um-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Configurar Banco de Dados

```bash
npm run db:generate  # Gerar cliente Prisma
npm run db:push       # Aplicar schema
npm run db:seed      # Popular com dados de teste (opcional)
```

### 4. Executar

```bash
npm run dev
```

Acesse: http://localhost:3000

**Credenciais de teste** (se executou o seed):
- Email: `admin@exemplo.com`
- Senha: `senha123`

## 📁 Estrutura do Projeto

```
prospecia/
├── app/              # Rotas e páginas (App Router)
├── components/       # Componentes reutilizáveis
├── lib/              # Utilitários e configurações
├── prisma/           # Schema do banco de dados
├── types/            # Tipos TypeScript
└── docs/             # Documentação
```

## 🔄 Fluxo de Prospecção

1. **Leads são identificados** e criados com status "prospectavel"
2. **API envia para n8n** que inicia conversa via WhatsApp
3. **SDR IA qualifica** o lead baseado nas respostas
4. **n8n retorna resultado** via webhook
5. **Lead fica disponível** para o cliente ativar
6. **Cliente ativa** e recebe contato + histórico

## 🎨 Interface

- Design moderno e responsivo (desktop-first)
- Dashboard com métricas claras
- Lista de leads com filtros e busca
- Detalhes completos após ativação

## 🔐 Segurança

- Autenticação JWT via NextAuth
- Senhas hasheadas com bcrypt
- Multi-tenant (isolamento de dados por empresa)
- Middleware protegendo rotas privadas

## 📝 Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Executar em produção
npm run db:generate  # Gerar cliente Prisma
npm run db:push      # Aplicar schema
npm run db:studio    # Abrir Prisma Studio
npm run db:seed      # Popular com dados de teste
npm run lint         # Verificar código
```

## 🚧 Próximos Passos

- [ ] Autenticação nos webhooks (API keys)
- [ ] Geração automática de leads (integração com bases B2B)
- [ ] Dashboard avançado com gráficos
- [ ] Notificações por email
- [ ] Multi-usuário com permissões

## 📄 Licença

Este projeto é privado e proprietário.

---

**Desenvolvido com ❤️ para automatizar a prospecção B2B**

