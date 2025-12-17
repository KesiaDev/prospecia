# Integração com n8n

Este documento descreve como integrar o ProspecIA com o n8n para automatizar a prospecção e qualificação de leads via WhatsApp.

## Visão Geral

O n8n é responsável por:
1. **Receber leads prospectáveis** da plataforma
2. **Iniciar conversas via WhatsApp** (WhatsApp Cloud API ou provedor)
3. **Processar respostas** usando IA (OpenAI)
4. **Qualificar leads** baseado nas respostas
5. **Enviar resultados** de volta para a plataforma

## Fluxo de Dados

```
ProspecIA → n8n (Webhook) → WhatsApp → IA → n8n → ProspecIA (Webhook)
```

### 1. ProspecIA → n8n (Iniciar Prospecção)

**Endpoint n8n:** Configurar webhook no n8n para receber leads

**Payload enviado:**
```json
{
  "leadId": "clx123...",
  "empresaId": "cly456...",
  "nomeEmpresa": "Clínica Exemplo",
  "telefone": "+5511999999999",
  "whatsapp": "+5511999999999",
  "perfilProspeccao": {
    "nicho": "Clínicas",
    "tipoCliente": "PJ",
    "ticketMinimo": 5000.00,
    "precisaDecisor": true,
    "urgenciaMinima": "Média"
  }
}
```

**O que o n8n deve fazer:**
- Validar dados recebidos
- Iniciar conversa no WhatsApp
- Usar prompt personalizado baseado no perfil de prospecção
- Processar respostas em tempo real

### 2. n8n → ProspecIA (Resultado da Qualificação)

**Endpoint ProspecIA:** `POST /api/webhooks/n8n`

**Payload esperado:**
```json
{
  "leadId": "clx123...",
  "empresaId": "cly456...",
  "status": "qualificado" | "disponivel" | "descartado",
  "score": 85,
  "classificacao": "quente" | "morno" | "frio",
  "urgencia": "Alta" | "Média" | "Baixa",
  "dorPrincipal": "Precisa de sistema de gestão",
  "resumoConversa": "Cliente demonstrou interesse em...",
  "motivoDescarte": "Não tem orçamento" (apenas se descartado),
  "historicoConversa": [
    {
      "tipo": "enviada",
      "mensagem": "Olá, tudo bem?",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "tipo": "recebida",
      "mensagem": "Olá, tudo bem sim!",
      "timestamp": "2024-01-15T10:31:00Z"
    }
  ]
}
```

## Configuração no n8n

### Workflow 1: Receber Lead e Iniciar Conversa

1. **Webhook Trigger**
   - Método: POST
   - Path: `/prospectar-lead`
   - Response: JSON

2. **Validar Dados**
   - Verificar campos obrigatórios
   - Validar formato de telefone

3. **Criar Prompt para IA**
   - Usar dados do `perfilProspeccao`
   - Personalizar abordagem baseada no nicho
   - Incluir perguntas de qualificação

4. **Enviar Mensagem WhatsApp**
   - Integração com WhatsApp Cloud API
   - Mensagem inicial educada e contextual
   - Incluir opção de opt-out

5. **Aguardar Resposta**
   - Webhook para receber mensagens do WhatsApp
   - Timeout configurável (ex: 24h)

### Workflow 2: Processar Resposta e Qualificar

1. **Receber Mensagem WhatsApp**
   - Webhook do WhatsApp

2. **Processar com IA (OpenAI)**
   - Enviar histórico da conversa
   - Prompt de qualificação:
     ```
     Analise esta conversa e determine:
     - Score (0-100): interesse e fit
     - Classificação: quente, morno ou frio
     - Urgência: Alta, Média ou Baixa
     - Dor principal identificada
     - Se deve ser qualificado ou descartado
     ```

3. **Decisão: Qualificar ou Descartar**
   - Se qualificado: status = "qualificado" ou "disponivel"
   - Se descartado: status = "descartado" + motivo

4. **Enviar Resultado para ProspecIA**
   - HTTP Request para `/api/webhooks/n8n`
   - Incluir todos os dados de qualificação

## Variáveis de Ambiente Necessárias

No n8n, configure:

```env
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=seu_token
WHATSAPP_PHONE_NUMBER_ID=seu_phone_id
OPENAI_API_KEY=sua_chave_openai
PROSPECIA_WEBHOOK_URL=https://sua-plataforma.com/api/webhooks/n8n
```

## Exemplo de Prompt para IA

```
Você é um SDR (Sales Development Representative) especializado em prospecção B2B.

Contexto:
- Nicho: {nicho}
- Tipo de cliente: {tipoCliente}
- Ticket mínimo: R$ {ticketMinimo}
- Precisa ser decisor: {precisaDecisor}
- Urgência mínima: {urgenciaMinima}

Objetivo:
Qualificar o interesse do lead e identificar se há fit com o perfil desejado.

Após a conversa, retorne:
{
  "score": 0-100,
  "classificacao": "quente" | "morno" | "frio",
  "urgencia": "Alta" | "Média" | "Baixa",
  "dorPrincipal": "descrição da dor",
  "qualificado": true/false,
  "motivoDescarte": "motivo se não qualificado"
}
```

## Tratamento de Erros

- Se o WhatsApp falhar: reverter status do lead para "prospectavel"
- Se a IA falhar: tentar novamente ou marcar como "em_contato" para revisão manual
- Se o webhook do ProspecIA falhar: retry com backoff exponencial

## Segurança

- Validar token/assinatura nos webhooks
- Rate limiting para evitar spam
- Logs de todas as interações
- Dados sensíveis (telefone) só expostos quando necessário

## Próximos Passos

1. Implementar autenticação nos webhooks (API keys)
2. Adicionar retry automático para falhas
3. Dashboard de monitoramento no n8n
4. Métricas de conversão e performance


