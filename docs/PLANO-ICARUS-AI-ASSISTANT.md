# 🤖 Plano de Implementação - ICARUS AI Assistant

**Data:** 26/11/2025  
**Versão:** 5.0  
**Status:** 🚧 Em Desenvolvimento

---

## 📋 Sumário

1. [Estado Atual](#1-estado-atual)
2. [Arquitetura Backend](#2-arquitetura-backend)
3. [Edge Functions Disponíveis](#3-edge-functions-disponíveis)
4. [Funcionalidades Implementadas](#4-funcionalidades-implementadas)
5. [Funcionalidades Pendentes](#5-funcionalidades-pendentes)
6. [Roadmap de Implementação](#6-roadmap-de-implementação)
7. [Integrações de IA](#7-integrações-de-ia)

---

## 1. Estado Atual

### ✅ Implementado

| Componente | Status | Descrição |
|------------|--------|-----------|
| `ChatWidget.tsx` | ✅ | UI completa com categorias, comandos, feedback |
| `useChatSession.ts` | ✅ | Hook com integração Edge Function + fallback |
| `useIcarusBrain.ts` | ✅ | Hook para análises de IA (demanda, churn, etc.) |
| Edge Function `chat` | ✅ | Chatbot com GPT-4, rate limiting, auth |
| Edge Function `icarus-brain` | ✅ | 8 tipos de análise IA em background |
| Edge Function `agent-compliance` | ✅ | Verificação ANVISA com IA |
| Edge Function `gpt-researcher` | ✅ | Pesquisa web com síntese IA |
| Edge Function `send-lead-email` | ✅ | Captura de leads |

### 📊 Tabelas de IA no Supabase

| Tabela | Descrição |
|--------|-----------|
| `chatbot_sessoes` | Sessões de chat por usuário |
| `chatbot_mensagens` | Mensagens com intent e feedback |
| `chatbot_pesquisas_gpt` | Resultados de pesquisas |
| `agentes_ia_compliance` | Logs de verificação ANVISA |
| `chatbot_metricas` | Métricas diárias agregadas |
| `icarus_brain_results` | Resultados de análises IA |

---

## 2. Arquitetura Backend

### Schema Principal (12 tabelas)

```
empresas (multi-tenant)
├── perfis (usuários)
├── categorias_produtos
├── fabricantes
├── produtos (OPME)
├── hospitais (clientes)
├── medicos
├── cirurgias
│   └── itens_cirurgia
├── notas_fiscais
├── contas_receber
├── movimentacoes_estoque
└── leads
```

### Tabelas de IA (6 tabelas)

```
chatbot_sessoes
├── chatbot_mensagens
├── chatbot_pesquisas_gpt
└── chatbot_metricas

agentes_ia_compliance
icarus_brain_results
```

---

## 3. Edge Functions Disponíveis

### 3.1 `chat` - Chatbot Principal

**Endpoint:** `supabase.functions.invoke('chat')`

**Request:**
```typescript
{
  message: string;
  sessionId?: string;
  context?: {
    empresaId?: string;
    userId?: string;
    currentPage?: string;
  }
}
```

**Response:**
```typescript
{
  response: string;
  sessionId: string;
  intent?: string;
  actions?: Array<{
    type: string;
    label: string;
    link?: string;
  }>;
}
```

**Capacidades:**
- ✅ Autenticação obrigatória
- ✅ Rate limiting (30 req/min)
- ✅ Validação Zod
- ✅ Proteção contra prompt injection
- ✅ Histórico de conversas (10 últimas)
- ✅ Detecção de intent
- ✅ Ações sugeridas com links
- ✅ Fallback para respostas locais

---

### 3.2 `icarus-brain` - Análises de IA

**Endpoint:** `supabase.functions.invoke('icarus-brain')`

**Tipos de Análise:**

| Tipo | Descrição | Uso |
|------|-----------|-----|
| `demanda` | Previsão de demanda | Estoque |
| `inadimplencia` | Score de risco | Financeiro |
| `churn` | Previsão de abandono | CRM |
| `recomendacao` | Produtos recomendados | Vendas |
| `estoque` | Otimização de estoque | Logística |
| `precificacao` | Precificação dinâmica | Financeiro |
| `sentiment` | Análise de sentimento | CRM |
| `anomalia` | Detecção de fraudes | Compliance |

**Request:**
```typescript
{
  analysisType: 'demanda' | 'inadimplencia' | ...;
  data: Record<string, unknown>;
  webhookUrl?: string;
}
```

**Response (imediata):**
```typescript
{
  jobId: string;
  analysisType: string;
  status: 'processing';
  message: string;
  startedAt: string;
}
```

---

### 3.3 `agent-compliance` - Verificação ANVISA

**Endpoint:** `supabase.functions.invoke('agent-compliance')`

**Tipos de Verificação:**
- `produto` - Valida registro ANVISA, validade
- `cirurgia` - Valida requisitos RDC 665/2022
- `lote` - Valida rastreabilidade
- `processo` - Valida conformidade geral

**Response:**
```typescript
{
  conforme: boolean;
  score: number; // 0-100
  problemas: Array<{
    codigo: string;
    severidade: 'alta' | 'media' | 'baixa';
    descricao: string;
    regulamentacao: string;
    recomendacao: string;
  }>;
  alertas: string[];
  aprovado: boolean;
  timestamp: string;
}
```

---

### 3.4 `gpt-researcher` - Pesquisa Web

**Endpoint:** `supabase.functions.invoke('gpt-researcher')`

**Request:**
```typescript
{
  query: string;
  maxSources?: number; // default: 5
  language?: string; // default: 'pt-BR'
}
```

**Response:**
```typescript
{
  id: string;
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  synthesis: string;
  timestamp: string;
}
```

---

## 4. Funcionalidades Implementadas

### ChatWidget

- [x] UI responsiva Dark Glass Medical
- [x] 8 categorias de sugestões
- [x] Comandos rápidos (`/estoque`, `/ajuda`, etc.)
- [x] Feedback thumbs up/down
- [x] Histórico local (localStorage)
- [x] Loading states animados
- [x] Botão de voz (placeholder)
- [x] Sessão persistente (24h)
- [x] Integração com Edge Function

### Hooks

- [x] `useChatSession` - Gerenciamento de sessões
- [x] `useIcarusBrain` - Análises de IA
- [x] Fallback para mock responses

---

## 5. Funcionalidades Pendentes

### Fase 1 - Essencial (Sprint 1)

| Feature | Prioridade | Esforço |
|---------|-----------|---------|
| Voice input (Web Speech API) | Alta | Médio |
| Voice output (TTS) | Média | Baixo |
| Upload de documentos | Alta | Alto |
| OCR de imagens | Média | Alto |
| Cards interativos nas respostas | Alta | Médio |

### Fase 2 - Agentes Especializados (Sprint 2)

| Agente | Função |
|--------|--------|
| Dashboard AI | KPIs e tendências |
| Estoque AI | Previsão e reposição |
| Cirurgias AI | Justificativas médicas |
| Financeiro AI | Fluxo e inadimplência |
| Logística AI | Rotas otimizadas |
| Compliance AI | Verificação ANVISA |

### Fase 3 - Avançado (Sprint 3)

- [ ] Aprendizado com feedback
- [ ] Personalização por usuário
- [ ] Notificações proativas
- [ ] Integração WhatsApp Business
- [ ] Análise de sentimento em tempo real

---

## 6. Roadmap de Implementação

### Sprint 1 (1-2 semanas)

```
┌─────────────────────────────────────────────────────────┐
│ SPRINT 1: Funcionalidades Core                          │
├─────────────────────────────────────────────────────────┤
│ □ Implementar Web Speech API (voice input)              │
│ □ Implementar Text-to-Speech (voice output)             │
│ □ Cards interativos com ações                           │
│ □ Tabelas formatadas em respostas                       │
│ □ Histórico do banco de dados                           │
│ □ Feedback com persistência                             │
└─────────────────────────────────────────────────────────┘
```

### Sprint 2 (2-3 semanas)

```
┌─────────────────────────────────────────────────────────┐
│ SPRINT 2: Agentes Especializados                        │
├─────────────────────────────────────────────────────────┤
│ □ Agente Dashboard AI                                   │
│ □ Agente Estoque AI (com icarus-brain)                  │
│ □ Agente Cirurgias AI (justificativas)                  │
│ □ Agente Financeiro AI (inadimplência)                  │
│ □ Integração com módulos existentes                     │
└─────────────────────────────────────────────────────────┘
```

### Sprint 3 (3-4 semanas)

```
┌─────────────────────────────────────────────────────────┐
│ SPRINT 3: Multimodalidade e Avançado                    │
├─────────────────────────────────────────────────────────┤
│ □ Upload de documentos (PDF, imagens)                   │
│ □ OCR com Azure/Google Vision                           │
│ □ Análise de NF-e                                       │
│ □ Geração de relatórios PDF                             │
│ □ Notificações push                                     │
│ □ WhatsApp Business API                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 7. Integrações de IA

### APIs Configuradas no Supabase

| Serviço | Variável | Uso |
|---------|----------|-----|
| OpenAI GPT-4 | `OPENAI_MEDICAL_MODEL` | Chat, análises |
| Anthropic Claude | `ANTHROPIC_API_KEY` | Análises longas |
| Brave Search | `BRAVE_SEARCH_API_KEY` | Pesquisa web |
| Resend | `RESEND_API_KEY` | Emails |

### Modelos Utilizados

| Modelo | Uso | Custo |
|--------|-----|-------|
| `gpt-4-turbo-preview` | Chat principal | ~$0.01/1K tokens |
| `gpt-4o-mini` | Análises rápidas | ~$0.0001/1K tokens |

---

## 📚 Referências

- [Edge Functions - chat/index.ts](../supabase/functions/chat/index.ts)
- [Edge Functions - icarus-brain/index.ts](../supabase/functions/icarus-brain/index.ts)
- [Migration - 007_create_ai_tables.sql](../supabase/migrations/007_create_ai_tables.sql)
- [Hook - useChatSession.ts](../src/hooks/useChatSession.ts)
- [Hook - useIcarusBrain.ts](../src/hooks/useIcarusBrain.ts)

---

**Documento mantido por:** Designer Icarus v5.0  
**Última atualização:** 26/11/2025

