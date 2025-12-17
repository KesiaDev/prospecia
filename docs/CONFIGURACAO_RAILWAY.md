# Configuração do Banco de Dados no Railway

Este guia explica como configurar o PostgreSQL no Railway para o ProspecIA.

## 🚀 Passo a Passo

### 1. Criar Serviço PostgreSQL no Railway

1. Acesse seu projeto no Railway
2. Clique em **"+ New"** ou **"New"**
3. Selecione **"Database"** → **"Add PostgreSQL"**
4. Aguarde o Railway criar o serviço PostgreSQL

### 2. Obter DATABASE_URL

1. Clique no serviço PostgreSQL criado
2. Vá na aba **"Variables"**
3. Copie o valor de `DATABASE_URL` (ou `POSTGRES_URL`)
4. O formato será algo como:
   ```
   postgresql://postgres:senha@host:porta/railway
   ```

### 3. Configurar DATABASE_URL no Serviço da Aplicação

1. Vá para o serviço da sua aplicação Next.js
2. Clique em **"Variables"**
3. Adicione a variável:
   - **Nome**: `DATABASE_URL`
   - **Valor**: Cole a URL copiada do PostgreSQL
4. Salve

### 4. Executar Migrations (Criar Tabelas)

O Railway pode executar automaticamente, mas você pode fazer manualmente:

#### Opção A: Via Railway CLI

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Executar migrations
railway run npx prisma db push
```

#### Opção B: Via Script de Build

Adicione ao `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "db:deploy": "prisma db push"
  }
}
```

E configure no Railway para executar `db:deploy` após o build.

#### Opção C: Manualmente via Railway Shell

1. No Railway, vá em **"Settings"** do serviço da aplicação
2. Vá em **"Deploy"** → **"Shell"**
3. Execute:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### 5. Verificar se Está Funcionando

1. Acesse: `https://seu-app.railway.app/api/health`
2. Deve retornar:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "tables": "exists"
   }
   ```

## 🔍 Troubleshooting

### Erro: "DATABASE_URL não está configurado"

**Solução**: Adicione a variável `DATABASE_URL` nas variáveis de ambiente do serviço da aplicação.

### Erro: "Erro de conexão com o banco de dados"

**Possíveis causas**:
1. PostgreSQL não está rodando
2. `DATABASE_URL` está incorreta
3. Firewall bloqueando conexão

**Solução**:
- Verifique se o serviço PostgreSQL está ativo
- Verifique se a `DATABASE_URL` está correta
- Certifique-se de que ambos os serviços estão no mesmo projeto Railway

### Erro: "Tabelas do banco de dados não foram criadas"

**Solução**: Execute as migrations:
```bash
npx prisma db push
```

### Verificar Logs

1. No Railway, vá em **"Deployments"**
2. Clique no deployment mais recente
3. Vá em **"Logs"**
4. Procure por erros relacionados a:
   - `DATABASE_URL`
   - `Prisma`
   - `Connection`
   - `P1001` (erro de conexão)
   - `P2021` (tabela não existe)

## ✅ Checklist Final

- [ ] Serviço PostgreSQL criado no Railway
- [ ] `DATABASE_URL` configurada no serviço da aplicação
- [ ] Migrations executadas (`prisma db push`)
- [ ] Health check retorna `"status": "ok"` em `/api/health`
- [ ] Registro de conta funcionando

## 📝 Variáveis de Ambiente Necessárias

Certifique-se de ter configurado:

- ✅ `DATABASE_URL` - URL do PostgreSQL
- ✅ `NEXTAUTH_SECRET` - Secret gerado
- ✅ `NEXTAUTH_URL` - URL da aplicação (ex: `https://seu-app.railway.app`)

## 🎯 Próximos Passos

Após configurar o banco:
1. Teste criar uma conta
2. Verifique se o onboarding funciona
3. Teste o dashboard

