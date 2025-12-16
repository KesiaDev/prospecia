# Troubleshooting - ProspecIA

## Erro: NotFound: (NEXTAUTH_URL=http://localhost:3000:String)

### Causa do Erro

Este erro ocorre quando a variável de ambiente `NEXTAUTH_URL` contém um sufixo indesejado (como `:String`) que impede o NextAuth de fazer o parse correto da URL.

Isso pode acontecer por:
- Formatação incorreta no arquivo `.env`
- Alguns editores que adicionam tipos automaticamente
- Problemas na leitura da variável de ambiente

### Solução Aplicada

O código em `lib/auth.ts` agora limpa automaticamente a variável `NEXTAUTH_URL` removendo sufixos como `:String` ou `:string` antes de ser usada pelo NextAuth.

### Verificação Manual

Se o erro persistir, verifique seu arquivo `.env`:

**❌ Incorreto:**
```env
NEXTAUTH_URL="http://localhost:3000:String"
NEXTAUTH_URL=http://localhost:3000:String
```

**✅ Correto:**
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL=http://localhost:3000
```

### Passos para Corrigir

1. Abra o arquivo `.env` na raiz do projeto
2. Localize a linha `NEXTAUTH_URL`
3. Certifique-se de que está no formato: `NEXTAUTH_URL="http://localhost:3000"` (sem aspas duplas dentro, ou sem aspas)
4. Salve o arquivo
5. Reinicie o servidor de desenvolvimento (`npm run dev`)

### Outros Erros Comuns

#### Erro: "NEXTAUTH_SECRET is not set"

**Solução:**
1. Gere um secret: `openssl rand -base64 32`
2. Adicione ao `.env`: `NEXTAUTH_SECRET="seu-secret-gerado"`

#### Erro: "Cannot find module '@prisma/client'"

**Solução:**
```bash
npm run db:generate
```

#### Erro de conexão com banco de dados

**Solução:**
1. Verifique se o PostgreSQL está rodando
2. Verifique a `DATABASE_URL` no `.env`
3. Teste a conexão: `psql $DATABASE_URL`

