# Arquitetura do Produto - Expert Integrado (Super SDR)

## Visão Geral

O sistema é um **SDR Virtual com Inteligência Artificial ilimitada**, capaz de atender múltiplos leads simultaneamente sem restrições de volume ou capacidade.

## Princípios Fundamentais

### 1. IA Ilimitada e Contínua
- A IA opera de forma **contínua e escalável**
- **Nenhuma limitação** de leads, atendimentos ou volume
- Qualquer configuração de horários, agenda ou regras é para:
  - Organização humana
  - Compliance de comunicação
  - Regras operacionais
  - **NUNCA** limitação da IA

### 2. Narrativa do Produto
- **"Configure uma vez e a IA trabalha sozinha"**
- Regras são **orientações**, não limitações
- Sistema focado em **escala e eficiência**

## Camadas de Configuração

### CAMADA 1 — Configuração Essencial (Básica)

**Visibilidade:** Sempre visível para todos os usuários

**Objetivo:** Transmitir "Configure uma vez e a IA trabalha sozinha"

**Configurações:**
- ✅ Status do Agente (Ativo / Desligado)
- ✅ Nome do Agente
- ✅ Objetivo Central do Agente (com sugestão guiada)
- ✅ Canais de Comunicação (WhatsApp, Chatguru, ManyChat, etc.)
- ✅ Funil de Intenções e CRM
- ✅ Base de Conhecimento
- ✅ Follow-ups Dinâmicos
- ✅ Agenda (regras básicas de duração, antecedência e janelas)
- ✅ Perfil de Prospecção (ICP) - **IMPLEMENTADO**

**Textos Explicativos:**
- "Essas regras orientam a prospecção, enquanto a IA opera de forma contínua e escalável"
- "Regra para organização da agenda humana. A IA continua operando normalmente"
- "Garante melhor organização da agenda humana, enquanto a IA trabalha continuamente"

### CAMADA 2 — Configuração Avançada

**Visibilidade:** Oculto ou destacado como "Avançado"

**Objetivo:** Separar complexidade técnica do usuário comum

**Configurações:**
- Ritmo de resposta (buffer, latência, tempo entre mensagens)
- Linguagem e estilo (tamanho de mensagens, emojis, abreviações)
- Humanização do texto
- Configurações de voz e áudio
- Probabilidade de resposta em áudio
- WPM de áudio
- Adaptação para linguagem falada

**Elementos Visuais:**
- Badge: "Avançado"
- Aviso: "Recomendado para usuários experientes"
- Explicação: "Essas configurações permitem personalização avançada do comportamento do SDR Virtual. A IA continua operando de forma ilimitada, independente dessas configurações."

## Ajustes de Narrativa

### Onde existir:
- Horário de funcionamento
- Horário de envio
- Antecedência
- Máximo de reuniões
- Limites de lembretes

### O sistema deve:
- Ajustar textos explicativos
- Deixar claro que essas regras **NÃO limitam a IA**
- Explicar que são regras de **agenda humana, organização e compliance**

### Exemplo de Explicação Aceitável:
> "Essas regras garantem uma melhor organização da agenda humana, enquanto a IA continua operando de forma contínua."

### Exemplo de Explicação NÃO Aceitável:
> ❌ "Limite de leads por dia"
> ❌ "Capacidade máxima atingida"
> ❌ "Plano limitado a X leads"

## Agenda e Rodízio

- **Manter** regras de agendamento, rodízio e distribuição de usuários
- **Reforçar** que rodízio só se aplica quando há atendimento humano
- **IA continua** responsável por qualificação, follow-up e condução até a reunião

## Lembretes e Follow-ups

- **Manter** lembretes dinâmicos baseados em prompt
- Se existir mensagem como "Limite atingido", ajustar para:
  - ✅ "Capacidade operacional atual configurada"
  - ✅ "Configuração de agenda aplicada"
- **Nunca** usar linguagem de limitação de plano

## Base de Conhecimento

- **Manter** estrutura atual
- **Garantir** que a IA priorize a base antes de responder
- **Nenhuma** mudança estrutural, apenas garantir prioridade lógica

## Estrutura de Arquivos

```
app/
├── configuracoes/
│   └── page.tsx              # Página principal com camadas básica/avançada
components/
├── configuracoes/
│   └── PerfilProspeccaoForm.tsx  # Formulário de ICP (camada básica)
```

## Checklist de Implementação

### ✅ Implementado
- [x] Separação visual entre camada básica e avançada
- [x] Narrativas ajustadas para IA ilimitada
- [x] Textos explicativos sobre regras operacionais
- [x] Estrutura preparada para futuras funcionalidades
- [x] Perfil de Prospecção (ICP) na camada básica

### 🔄 Pendente (Estrutura Preparada)
- [ ] Status do Agente
- [ ] Objetivo Central do Agente
- [ ] Canais de Comunicação
- [ ] Agenda e Regras Operacionais
- [ ] Configurações Avançadas (ritmo, linguagem, etc.)

## Regras de Negócio

1. **Nenhuma funcionalidade removida**
2. **Nenhum limite artificial criado**
3. **Apenas reorganização de UX e textos**
4. **Mantida arquitetura técnica base**
5. **Integrações existentes preservadas**

## Resultado Final

Após aplicar esta arquitetura, o sistema deve:

- ✅ Continuar exatamente com as mesmas funcionalidades
- ✅ Ficar mais claro, profissional e vendável
- ✅ Transmitir claramente que a IA é ilimitada
- ✅ Separar complexidade técnica do usuário comum
- ✅ Reduzir risco de confusão e suporte

