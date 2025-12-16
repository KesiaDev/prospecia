# Guia de Início Rápido - ProspecIA

Este guia vai te ajudar a configurar e executar o ProspecIA localmente.

## Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando (ou conta no Supabase)
- Conta no n8n (opcional para desenvolvimento inicial)

## Passo 1: Instalar Dependências

```bash
npm install
```

## Passo 2: Configurar Banco de Dados

1. Crie um banco de dados PostgreSQL (ou use Supabase)

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp env.example .env
```

3. Edite o arquivo `.env` e configure:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/prospecia?schema=public"
NEXTAUTH_SECRET="gere-um-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

Para gerar o `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## Passo 3: Configurar o Banco de Dados

1. Gerar o cliente Prisma:
```bash
npm run db:generate
```

2. Aplicar o schema ao banco:
```bash
npm run db:push
```

3. (Opcional) Popular com dados de teste:
```bash
npm run db:seed
```

Isso criará:
- Uma empresa de exemplo
- Um usuário: `admin@exemplo.com` / `senha123`
- Um perfil de prospecção
- Alguns leads de exemplo

## Passo 4: Executar o Projeto

```bash
npm run dev
```

Acesse: http://localhost:3000

## Passo 5: Primeiro Acesso

### Se você executou o seed:

1. Acesse http://localhost:3000
2. Clique em "Entrar"
3. Use as credenciais:
   - Email: `admin@exemplo.com`
   - Senha: `senha123`
4. Você será redirecionado para o dashboard (onboarding já completo)

### Se você não executou o seed:

1. Acesse http://localhost:3000
2. Clique em "Criar Conta"
3. Preencha o formulário de registro
4. Faça login
5. Complete o onboarding (obrigatório)
6. Acesse o dashboard

## Estrutura de Navegação

- **Dashboard** (`/dashboard`): Visão geral dos leads
- **Leads** (`/leads`): Lista de leads qualificados disponíveis
- **Configurações** (`/configuracoes`): Editar perfil de prospecção

## Próximos Passos

### Para Desenvolvimento

1. **Explorar o código**
   - Leia `docs/ESTRUTURA_PROJETO.md` para entender a arquitetura
   - Leia `docs/INTEGRACAO_N8N.md` para entender a integração

2. **Testar funcionalidades**
   - Criar leads manualmente via Prisma Studio: `npm run db:studio`
   - Testar ativação de leads
   - Editar perfil de prospecção

3. **Configurar n8n** (quando estiver pronto)
   - Seguir `docs/INTEGRACAO_N8N.md`
   - Configurar webhooks
   - Testar fluxo completo

### Para Produção

1. **Configurar variáveis de ambiente de produção**
2. **Configurar banco de dados de produção**
3. **Fazer deploy** (Vercel recomendado)
4. **Configurar n8n em produção**
5. **Configurar integração WhatsApp**

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Aplicar schema
npm run db:studio      # Abrir Prisma Studio (GUI)
npm run db:seed        # Popular com dados de teste

# Lint
npm run lint
```

## Troubleshooting

### Erro de conexão com banco de dados

- Verifique se o PostgreSQL está rodando
- Verifique a `DATABASE_URL` no `.env`
- Teste a conexão: `psql $DATABASE_URL`

### Erro "NEXTAUTH_SECRET is not set"

- Certifique-se de ter criado o arquivo `.env`
- Gere um secret: `openssl rand -base64 32`
- Adicione ao `.env`: `NEXTAUTH_SECRET="seu-secret-aqui"`

### Erro ao executar seed

- Certifique-se de ter executado `npm run db:push` primeiro
- Verifique se o banco está acessível
- Verifique os logs de erro

### Página em branco ou erros de build

- Limpe o cache: `rm -rf .next`
- Reinstale dependências: `rm -rf node_modules && npm install`
- Execute novamente: `npm run dev`

## Suporte

Para mais informações:
- Estrutura do projeto: `docs/ESTRUTURA_PROJETO.md`
- Integração n8n: `docs/INTEGRACAO_N8N.md`
- README principal: `README.md`

