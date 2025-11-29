# 🎯 ICARUS v6.0 - Guia de Uso no Cursor

## 📁 Estrutura de Pastas Recomendada

```
icarus-v6/
├── .cursor/
│   └── rules/                    # ⭐ REGRAS DO CURSOR
│       ├── global.mdc            # Regras globais do projeto
│       ├── components.mdc        # Regras para componentes
│       ├── database.mdc          # Regras para SQL/Supabase
│       └── ai-agents.mdc         # Regras para LangChain
├── src/
│   ├── components/
│   │   └── ui/                   # Copiar de: components/ui/
│   ├── hooks/                    # Extrair de: lib/index.ts
│   ├── lib/                      # Copiar de: lib/
│   ├── pages/                    # Criar suas páginas
│   ├── types/
│   │   └── database.ts           # Gerar com Supabase CLI
│   └── App.tsx
├── supabase/
│   ├── migrations/               # Copiar de: sql/
│   │   ├── 001-extensions.sql
│   │   ├── 002-core.sql
│   │   └── ...
│   └── functions/                # Copiar de: edge-functions/
│       ├── icarus-brain/
│       ├── financial-vigilance/
│       └── integration-hub/
├── mobile/                       # Copiar de: mobile/
├── .env.local
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── tsconfig.json
```

---

## 🚀 Passo a Passo

### 1. Criar Projeto Base

```bash
# Criar projeto Vite + React + TypeScript
npm create vite@latest icarus-v6 -- --template react-ts
cd icarus-v6

# Instalar dependências
npm install @supabase/supabase-js @upstash/redis framer-motion \
  @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-slot \
  @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-select \
  class-variance-authority clsx tailwind-merge lucide-react recharts \
  date-fns zod react-router-dom

# Dependências de desenvolvimento
npm install -D tailwindcss postcss autoprefixer tailwindcss-animate \
  @types/node supabase
```

### 2. Extrair Arquivos do ZIP

```bash
# Descompactar o pacote
unzip icarus-v6-complete.zip

# Copiar SQL para migrations
mkdir -p supabase/migrations
cp icarus-v6-complete/sql/*.sql supabase/migrations/

# Copiar componentes
mkdir -p src/components/ui
cp icarus-v6-complete/components/ui/*.tsx src/components/ui/

# Copiar lib
mkdir -p src/lib
cp icarus-v6-complete/lib/*.ts src/lib/

# Copiar Edge Functions
mkdir -p supabase/functions
cp -r icarus-v6-complete/edge-functions/* supabase/functions/

# Copiar CSS
cp icarus-v6-complete/config/tailwind.css src/styles/globals.css
```

### 3. Configurar Cursor Rules

Criar pasta `.cursor/rules/` e adicionar os arquivos abaixo:

---

## 📜 Cursor Rules

### `.cursor/rules/global.mdc`

```markdown
---
description: Regras globais do ICARUS v6.0
globs: ["**/*.{ts,tsx,sql}"]
---

# ICARUS v6.0 - Sistema de Gestão OPME

## Stack Tecnológica
- React 18.3.1 + TypeScript 5.9 + Vite 6.4
- Tailwind CSS 4.1 + Radix UI + Framer Motion 12.x
- Supabase + PostgreSQL 16 + pgvector HNSW
- LangChain 0.3 + LangGraph 0.2
- Claude 3.5 Sonnet (primary) + GPT-4o (secondary)

## Design System: Dark Glass Medical
- Background: #050508 (primary), #0a0a0f (secondary), #12121a (tertiary)
- Glass: rgba(255,255,255,0.03) com backdrop-blur 16px
- Accent: #3b82f6 (blue), #14b8a6 (teal)
- Status: #22c55e (success), #f59e0b (warning), #ef4444 (danger)
- Neumorphic shadows: 4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.03)

## Convenções
- Sempre usar TypeScript strict mode
- Componentes em PascalCase
- Hooks com prefixo "use"
- Arquivos em kebab-case
- Imports com alias @/

## Compliance
- ANVISA RDC 665/2022 para rastreabilidade OPME
- LGPD para proteção de dados
- Audit log com blockchain (SHA-256 + PoW)
```

### `.cursor/rules/components.mdc`

```markdown
---
description: Regras para componentes UI
globs: ["src/components/**/*.tsx"]
---

# Componentes Dark Glass Medical

## Padrões Obrigatórios

### Glass Card
```tsx
<GlassCard elevation="raised" glow="primary">
  {/* Conteúdo */}
</GlassCard>
```

### Neumorphic Button
```tsx
<NeuButton variant="primary" size="md" loading={isLoading}>
  Texto
</NeuButton>
```

### KPI Card
```tsx
<KPICard 
  title="Cirurgias Hoje" 
  value={42} 
  trend={{ value: 12, label: "vs ontem" }}
  icon={<Calendar />}
  accentColor="blue"
/>
```

## Estilo Obrigatório
- Sempre usar classes Tailwind do Design System
- Animações com Framer Motion
- Ícones do Lucide React
- Border radius: rounded-2xl (16px)
- Backdrop blur: backdrop-blur-xl

## Imports
```tsx
import { GlassCard, NeuButton, NeuInput } from '@/components/ui/primitives';
import { KPICard, Badge, StatusIndicator } from '@/components/ui/data-display';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
```
```

### `.cursor/rules/database.mdc`

```markdown
---
description: Regras para banco de dados
globs: ["**/*.sql", "src/**/*supabase*.ts"]
---

# Database - PostgreSQL 16 + Supabase

## Schema Obrigatório
- Todas tabelas têm: id (UUID), empresa_id (UUID), criado_em, atualizado_em
- Soft delete com: excluido_em TIMESTAMPTZ
- RLS obrigatório em todas as tabelas

## pgvector com HNSW
```sql
-- Índice correto (NÃO usar IVFFlat)
CREATE INDEX idx_vectors_hnsw ON ml_vectors 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Busca
SET hnsw.ef_search = 100;
SELECT * FROM search_vectors(embedding, empresa_id, 0.7, 10);
```

## Blockchain Audit Log
```sql
-- Minerar bloco
SELECT mine_audit_block(empresa_id, usuario_id, tabela, registro_id, acao, dados_antes, dados_depois);

-- Validar chain
SELECT * FROM validate_blockchain(empresa_id);
```

## Convenções
- Nomes de tabelas em português snake_case
- Campos em português snake_case
- Constraints descritivas
- Índices para campos filtrados
- Triggers para updated_at
```

### `.cursor/rules/ai-agents.mdc`

```markdown
---
description: Regras para agentes IA
globs: ["src/lib/langchain*.ts", "supabase/functions/**/*.ts"]
---

# Agentes IA - LangChain 0.3 + LangGraph 0.2

## LLMs Configurados
```typescript
// Primary: Claude 3.5 Sonnet
const claude = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.3,
  maxTokens: 4096,
});

// Secondary: GPT-4o
const gpt4o = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.3,
});

// Embeddings
const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-small',
});
```

## Workflow LangGraph
```typescript
const graph = new StateGraph<State>({
  channels: { ... }
});

graph.addNode('node_name', async (state) => { ... });
graph.addEdge(START, 'node_name');
graph.addEdge('node_name', END);

const app = graph.compile();
```

## Prompts
- System prompts em português
- Sempre especificar formato de saída (JSON)
- Incluir contexto da empresa
- Usar RAG com pgvector para conhecimento específico

## Edge Functions
- Deno runtime
- CORS headers obrigatórios
- Service role key para bypass RLS
- Log de tokens e custos
```

---

## 🔧 Configurações Adicionais

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') }
  },
});
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

### `.env.local`
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

---

## 💡 Dicas de Uso no Cursor

### Comandos Úteis

1. **Gerar componente**: 
   > "Crie um componente GlassCard para listagem de cirurgias seguindo o design system"

2. **Criar hook**:
   > "Crie um hook useTransacoes com filtros por data e categoria"

3. **Escrever SQL**:
   > "Crie uma migration para adicionar campo observacoes na tabela cirurgias"

4. **Edge Function**:
   > "Crie uma edge function para sincronizar transações do Pluggy"

### Atalhos
- `Cmd/Ctrl + K` - Chat inline
- `Cmd/Ctrl + L` - Chat lateral
- `Cmd/Ctrl + I` - Composer (múltiplos arquivos)

### Contexto
Sempre inclua nos prompts:
- "seguindo o design system Dark Glass Medical"
- "usando a stack oficial do ICARUS v6"
- "com tipagem TypeScript strict"
- "compatível com Supabase RLS"

---

## 📂 Arquivos para Referência Rápida

Quando precisar de referência, peça ao Cursor para ler:

| Necessidade | Arquivo |
|-------------|---------|
| Componentes UI | `src/components/ui/primitives.tsx` |
| KPIs e Badges | `src/components/ui/data-display.tsx` |
| Hooks | `src/lib/index.ts` |
| LangChain | `src/lib/langchain.ts` |
| Schema DB | `supabase/migrations/*.sql` |
| Edge Functions | `supabase/functions/*/index.ts` |
| CSS/Design | `src/styles/globals.css` |

---

## ✅ Checklist de Setup

- [ ] Projeto Vite criado
- [ ] Dependências instaladas
- [ ] Arquivos do ZIP extraídos
- [ ] `.cursor/rules/` configurado
- [ ] Supabase CLI instalado
- [ ] Migrations executadas
- [ ] Tipos gerados (`supabase gen types`)
- [ ] `.env.local` configurado
- [ ] Tailwind configurado
- [ ] Aliases TypeScript funcionando

---

## 🎯 Fluxo de Trabalho

```
1. Abrir Cursor no projeto
2. Cursor carrega as rules automaticamente
3. Usar Composer (Cmd+I) para tarefas complexas
4. Referenciar arquivos do pacote como contexto
5. Sempre validar tipos e lint antes de commit
```

Pronto! Com essa estrutura, o Cursor vai entender o contexto do projeto e gerar código consistente com a stack oficial.
