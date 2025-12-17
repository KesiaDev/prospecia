# Guia de Testes - ProspecIA

Este guia vai te ajudar a testar todas as funcionalidades da plataforma após o deploy.

## ✅ Checklist Pré-Teste

Antes de começar, verifique se configurou no Railway:

- [ ] `DATABASE_URL` - URL do PostgreSQL
- [ ] `NEXTAUTH_SECRET` - Secret gerado (ex: `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` - URL da sua aplicação no Railway (ex: `https://seu-app.railway.app`)
- [ ] `N8N_WEBHOOK_URL` - (Opcional) URL do webhook do n8n

## 🧪 Testes Básicos

### 1. Teste de Acesso à Aplicação

1. Acesse a URL do Railway (ex: `https://seu-app.railway.app`)
2. **Esperado**: Página inicial com botões "Entrar" e "Criar Conta"

### 2. Teste de Registro de Conta

1. Clique em "Criar Conta"
2. Preencha o formulário:
   - Nome completo
   - Email válido
   - Nome da empresa
   - CNPJ (opcional)
   - Senha (mínimo 6 caracteres)
   - Confirmar senha
3. Clique em "Criar Conta"
4. **Esperado**: 
   - Conta criada com sucesso
   - Redirecionamento automático para o onboarding
   - Autenticação automática

### 3. Teste de Onboarding

1. Complete as 7 perguntas do onboarding:
   - ✅ Nicho de atuação
   - ✅ Tipo de cliente (PF/PJ/Ambos)
   - ✅ Cidades para prospectar
   - ✅ Ticket mínimo
   - ✅ Precisa ser decisor?
   - ✅ Urgência mínima
   - ✅ Capacidade diária
2. Clique em "Finalizar"
3. **Esperado**:
   - Onboarding salvo com sucesso
   - Redirecionamento para o dashboard
   - Dashboard carregando corretamente

### 4. Teste de Dashboard

1. Após completar onboarding, você deve ver o dashboard
2. **Esperado**:
   - 4 cards com métricas:
     - Em Prospecção: 0
     - Em Qualificação: 0
     - Qualificados Disponíveis: 0
     - Ativados Hoje: 0
   - Mensagem informando que leads estão sendo qualificados

### 5. Teste de Configurações

1. Clique em "Configurações" no menu lateral
2. Edite o perfil de prospecção
3. Clique em "Salvar Configurações"
4. **Esperado**:
   - Mensagem de sucesso
   - Dados salvos corretamente

### 6. Teste de Logout e Login

1. Clique em "Sair" no menu lateral
2. **Esperado**: Redirecionamento para página de login
3. Faça login com as credenciais criadas
4. **Esperado**: 
   - Login bem-sucedido
   - Redirecionamento para dashboard (se onboarding completo)
   - Ou redirecionamento para onboarding (se não completo)

## 🧪 Testes Avançados

### 7. Teste de Proteção de Rotas

1. Sem estar logado, tente acessar diretamente:
   - `/dashboard`
   - `/leads`
   - `/configuracoes`
2. **Esperado**: Redirecionamento para `/auth/login`

### 8. Teste de Middleware (Onboarding Obrigatório)

1. Crie uma nova conta
2. Tente acessar `/dashboard` antes de completar onboarding
3. **Esperado**: Redirecionamento automático para `/onboarding`

### 9. Teste de Lista de Leads (Sem Leads)

1. Acesse `/leads`
2. **Esperado**: 
   - Mensagem: "Nenhum lead disponível"
   - Texto explicativo sobre qualificação

### 10. Teste de API (Opcional)

Use ferramentas como Postman ou curl para testar:

```bash
# Testar endpoint de registro
curl -X POST https://seu-app.railway.app/api/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste",
    "email": "teste@exemplo.com",
    "senha": "senha123",
    "nomeEmpresa": "Empresa Teste",
    "cnpj": ""
  }'

# Testar endpoint de onboarding (requer autenticação)
# Use o token de sessão do NextAuth
```

## 🐛 Troubleshooting

### Erro: "NEXTAUTH_SECRET não está configurado"

**Solução**: Configure `NEXTAUTH_SECRET` nas variáveis de ambiente do Railway

### Erro: "Não é possível conectar ao banco de dados"

**Solução**: 
- Verifique se `DATABASE_URL` está correto
- Verifique se o PostgreSQL está acessível
- Teste a conexão

### Erro: "Página não encontrada"

**Solução**: 
- Verifique se `NEXTAUTH_URL` está configurado corretamente
- Deve ser a URL completa do Railway (ex: `https://seu-app.railway.app`)

### Dashboard mostra erro ao carregar

**Solução**:
- Verifique os logs do Railway
- Verifique se o banco de dados está configurado
- Verifique se as migrations foram executadas

## 📊 Próximos Passos Após Testes Básicos

1. **Configurar Banco de Dados**:
   - Criar instância PostgreSQL no Railway
   - Executar migrations: `npx prisma db push`
   - Popular com dados de teste (opcional)

2. **Configurar n8n** (quando necessário):
   - Seguir `docs/INTEGRACAO_N8N.md`
   - Configurar webhooks
   - Testar integração completa

3. **Criar Leads de Teste**:
   - Usar Prisma Studio: `npm run db:studio`
   - Ou criar via API

## ✅ Checklist Final

- [ ] Registro de conta funcionando
- [ ] Onboarding obrigatório funcionando
- [ ] Dashboard carregando
- [ ] Configurações salvando
- [ ] Logout/Login funcionando
- [ ] Rotas protegidas funcionando
- [ ] Middleware de onboarding funcionando
- [ ] Lista de leads funcionando (mesmo vazia)

## 🎉 Pronto para Produção!

Se todos os testes passaram, sua plataforma está pronta para uso!

Para adicionar funcionalidades:
- Integração com n8n
- Geração automática de leads
- Notificações
- Dashboard avançado


