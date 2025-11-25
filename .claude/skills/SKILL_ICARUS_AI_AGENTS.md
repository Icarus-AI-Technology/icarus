# ICARUS AI Agents — Chatbot e Agentes Especializados

> **Padroes de implementacao de IA no sistema ICARUS**

---

## Visao Geral de Agentes

| Agente | Funcao | Tecnologia |
|--------|--------|------------|
| **Chatbot** | Assistente geral | GPT-4 + RAG |
| **Compliance** | Validacao regulatoria | GPT-4 + Rules Engine |
| **ERP** | Consultas de dados | GPT-4 + SQL Generator |
| **Synthesis** | Resumos e relatorios | GPT-4 |
| **GPT Researcher** | Pesquisa externa | GPT-4 + Web Search |

---

## Chatbot Principal

### Arquitetura

```
+-------------+     +--------------+     +-------------+
|   Frontend  |---->| Edge Function |---->|   OpenAI    |
|  (Widget)   |     |    (chat)     |     |   GPT-4     |
+-------------+     +--------------+     +-------------+
                           |
                           v
                    +--------------+
                    |   Vector DB  |
                    |  (Embeddings)|
                    +--------------+
```

### Componentes Frontend

1. **ChatWidget** (`src/components/chat/ChatWidget.tsx`)
   - Interface principal do chatbot
   - Widget flutuante com minimize/maximize
   - Historico de mensagens
   - Input com envio por Enter

2. **ChatbotFab** (`src/components/ui/chatbot-fab.tsx`)
   - Botao flutuante para abrir o chat
   - Indicador de mensagens nao lidas
   - Animacao de pulso

3. **useChatSession** (`src/hooks/useChatSession.ts`)
   - Gerenciamento de sessao
   - Envio de mensagens
   - Estado de loading

4. **ChatProvider** (`src/contexts/ChatContext.tsx`)
   - Estado global do chat
   - Funcoes de open/close
   - Persistencia de sessao

### Edge Function (Chat)

```typescript
// supabase/functions/chat/index.ts

interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: {
    empresaId: string;
    userId: string;
    currentPage?: string;
  };
}

interface ChatResponse {
  response: string;
  sessionId: string;
  intent?: string;
  actions?: Array<{
    type: string;
    payload: any;
  }>;
}
```

### Intencoes Suportadas

| Intencao | Descricao | Exemplo |
|----------|-----------|---------|
| `consulta_estoque` | Consulta de estoque | "Qual o estoque do produto X?" |
| `ajuda_cirurgia` | Ajuda com cirurgias | "Como agendar uma cirurgia?" |
| `consulta_financeiro` | Consultas financeiras | "Qual o faturamento do mes?" |
| `compliance` | Duvidas regulatorias | "Como validar registro ANVISA?" |
| `navegacao` | Navegacao no sistema | "Onde fica o modulo de estoque?" |

---

## Agente de Compliance

### Funcionalidades

1. **Validacao de Produtos ANVISA**
   - Verifica validade de registro
   - Consulta API da ANVISA
   - Alertas de vencimento

2. **Verificacao de Lotes**
   - Rastreabilidade completa
   - Conformidade com RDC 16/2013
   - Documentacao tecnica

3. **Auditoria de Processos**
   - Checklist automatizado
   - Relatorios de conformidade
   - Identificacao de gaps

### Edge Function

```typescript
// supabase/functions/agent-compliance/index.ts

interface ComplianceCheckRequest {
  tipo: 'produto' | 'cirurgia' | 'lote' | 'processo';
  dados: Record<string, any>;
}

interface ComplianceResponse {
  conforme: boolean;
  score: number;
  problemas: Array<{
    codigo: string;
    severidade: 'alta' | 'media' | 'baixa';
    descricao: string;
    regulamentacao: string;
    recomendacao: string;
  }>;
  alertas: string[];
  aprovado: boolean;
}
```

---

## GPT Researcher

### Funcionalidades

1. **Pesquisa Web**
   - Busca em fontes confiaveis
   - Sintese de resultados
   - Citacao de fontes

2. **Analise de Mercado**
   - Tendencias do setor OPME
   - Precos de concorrentes
   - Novidades regulatorias

### Edge Function

```typescript
// supabase/functions/gpt-researcher/index.ts

interface ResearchRequest {
  query: string;
  maxSources?: number;
  language?: string;
}

interface ResearchResponse {
  id: string;
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
  synthesis: string;
}
```

---

## Vector Search (Embeddings)

### Tabela ml_vectors

```sql
CREATE TABLE ml_vectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES empresas(id),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  embedding vector(1536),
  criado_em TIMESTAMPTZ DEFAULT NOW()
);
```

### Funcao de Busca

```sql
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_empresa_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  content_type TEXT,
  metadata JSONB,
  similarity FLOAT
);
```

---

## Metricas e Feedback

### Tabelas

```sql
-- Metricas de uso
CREATE TABLE chatbot_metricas (
  id UUID PRIMARY KEY,
  empresa_id UUID,
  data DATE NOT NULL,
  total_sessoes INTEGER,
  total_mensagens INTEGER,
  tempo_medio_resposta_ms INTEGER,
  taxa_resolucao DECIMAL(5,2),
  intencoes JSONB DEFAULT '{}'
);

-- Feedback de mensagens
CREATE TABLE chatbot_feedback (
  id UUID PRIMARY KEY,
  mensagem_id UUID,
  avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
  util BOOLEAN,
  comentario TEXT
);
```

---

## Uso no Frontend

### ChatWidget

```tsx
import { ChatWidget } from '@/components/chat/ChatWidget';

// Em qualquer pagina
<ChatWidget />
```

### useChatSession Hook

```typescript
import { useChatSession } from '@/hooks/useChatSession';

function MyComponent() {
  const { sendMessage, isLoading, messages, resetSession } = useChatSession();

  const handleSend = async (text: string) => {
    const response = await sendMessage(text);
    console.log(response);
  };
}
```

### ChatProvider

```tsx
import { ChatProvider, useChat } from '@/contexts/ChatContext';

// Em App.tsx
<ChatProvider>
  <App />
</ChatProvider>

// Em qualquer componente
function MyComponent() {
  const { isOpen, openChat, closeChat, unreadCount } = useChat();
}
```

---

## Configuracao

### Variaveis de Ambiente

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Brave Search (para GPT Researcher)
BRAVE_SEARCH_API_KEY=...

# Supabase (automatico)
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Ativar Agentes

1. Deploy das Edge Functions via Supabase CLI
2. Configurar variaveis de ambiente no Supabase Dashboard
3. Integrar ChatWidget no layout principal

---

## Boas Praticas

1. **Seguranca**
   - Validar inputs no servidor
   - Usar RLS para dados da empresa
   - Nao expor API keys no frontend

2. **Performance**
   - Cache de embeddings
   - Limitar historico de mensagens
   - Timeout em chamadas externas

3. **UX**
   - Feedback visual de loading
   - Mensagens de erro amigaveis
   - Sugestoes de perguntas

---

**Ultima atualizacao:** 2025-11-25
