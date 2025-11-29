# ICARUS v6.0 - Sistema de Gestão OPME

## 🚀 Stack Tecnológica Oficial

### Frontend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.9 | Type Safety |
| Vite | 6.4 | Build Tool |
| Tailwind CSS | 4.1 | Styling |
| Radix UI | Latest | Primitives |
| Framer Motion | 12.x | Animations |
| Recharts | 2.15 | Charts |
| Lucide React | Latest | Icons |

### Backend
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Supabase | Latest | BaaS |
| Edge Functions | Deno | Serverless |
| PostgreSQL | 16 | Database |
| pgvector + HNSW | Latest | Vector Search |
| Redis (Upstash) | Latest | Cache |

### Inteligência Artificial
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| LangChain | 0.3 | AI Framework |
| LangGraph | 0.2 | Agent Workflows |
| Claude 3.5 Sonnet | Latest | Primary LLM |
| GPT-4o | Latest | Secondary LLM |
| text-embedding-3-small | Latest | Embeddings |

### Mobile
| Tecnologia | Versão | Uso |
|------------|--------|-----|
| React Native | Latest | Mobile Framework |
| Expo SDK | 50 | Development Platform |

### Segurança & Compliance
| Tecnologia | Uso |
|------------|-----|
| SHA-256 | Audit Log Hash |
| Proof of Work | Blockchain Integrity |
| RLS | Row Level Security |
| LGPD | Data Protection |
| ANVISA RDC 665 | OPME Traceability |

---

## 📁 Estrutura do Projeto

```
icarus-v6-complete/
├── sql/                          # Database Schema
│   ├── 001-extensions.sql        # PostgreSQL 16 + pgcrypto + vector
│   ├── 002-core.sql              # Empresas, Usuários, Perfis
│   ├── 003-cadastros.sql         # Clientes, Hospitais, Médicos
│   ├── 004-estoque.sql           # Produtos, Lotes, Movimentações
│   ├── 005-cirurgias.sql         # Cirurgias, Rastreabilidade OPME
│   ├── 006-financeiro.sql        # Open Finance, Pluggy, Vigilância
│   ├── 007-fiscal-ia.sql         # NF-e, InfoSimples, pgvector HNSW
│   ├── 008-blockchain-lgpd.sql   # Audit Log Blockchain, LGPD
│   └── 009-rls-security.sql      # Row Level Security
├── components/
│   └── ui/
│       ├── primitives.tsx        # GlassCard, NeuButton, NeuInput, Icon3D
│       └── data-display.tsx      # KPICard, Badge, StatusIndicator, AlertCard
├── lib/
│   ├── index.ts                  # Hooks, Utils, Supabase, Redis
│   └── langchain.ts              # LangChain + LangGraph Configuration
├── edge-functions/
│   └── all-functions.ts          # All Supabase Edge Functions
├── mobile/
│   └── app.tsx                   # React Native + Expo App Complete
├── config/
│   ├── tailwind.css              # Dark Glass Medical Design System
│   └── project-config.ts         # Vite, TypeScript, ESLint, etc.
└── README.md
```

---

## 🎨 Design System: Dark Glass Medical

### Cores Principais
```css
/* Backgrounds */
--bg-primary: #050508;
--bg-secondary: #0a0a0f;
--bg-tertiary: #12121a;

/* Glass Effect */
--glass-bg: rgba(255, 255, 255, 0.03);
--glass-border: rgba(255, 255, 255, 0.08);
--glass-blur: 16px;

/* Accents */
--accent-primary: #3b82f6;    /* Blue */
--accent-secondary: #14b8a6;  /* Teal */

/* Status */
--status-success: #22c55e;
--status-warning: #f59e0b;
--status-danger: #ef4444;
```

### Neumorphic 3D Effects
```css
/* Outer Shadow */
box-shadow: 4px 4px 8px rgba(0,0,0,0.5), -4px -4px 8px rgba(255,255,255,0.03);

/* Inner Shadow */
box-shadow: inset 4px 4px 8px rgba(0,0,0,0.5), inset -4px -4px 8px rgba(255,255,255,0.03);

/* Glow */
box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
```

---

## 🤖 Arquitetura de IA

```
┌─────────────────────────────────────────────────────────────┐
│                    LangGraph Orchestrator                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Financial  │  │   Medical   │  │ Compliance  │         │
│  │   Agent     │  │   Agent     │  │   Agent     │         │
│  │ (LangChain) │  │ (LangChain) │  │ (LangChain) │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         │                │                │                 │
│         ▼                ▼                ▼                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                      LLMs                           │   │
│  │   Claude 3.5 Sonnet (Primary) │ GPT-4o (Secondary)  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         ▼                 ▼                 ▼              │
│  ┌───────────┐     ┌───────────┐     ┌───────────┐        │
│  │ pgvector  │     │   Redis   │     │ Supabase  │        │
│  │   HNSW    │     │   Cache   │     │    DB     │        │
│  └───────────┘     └───────────┘     └───────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### Workflow de Auditoria Financeira
```
START → categorize → detect_anomalies → analyze_fees → generate_suggestions → generate_report → END
```

---

## ⛓️ Blockchain Audit Log

### Estrutura do Bloco
```typescript
{
  block_index: number,
  previous_hash: string,      // SHA-256 do bloco anterior
  hash: string,               // SHA-256 deste bloco
  nonce: number,              // Proof of Work
  difficulty: 2,              // Zeros iniciais no hash
  empresa_id: UUID,
  tabela: string,
  registro_id: UUID,
  acao: 'INSERT' | 'UPDATE' | 'DELETE',
  dados_antes: JSONB,
  dados_depois: JSONB,
  criado_em: timestamp
}
```

### Validação
```sql
SELECT * FROM validate_blockchain('empresa-uuid');
-- Retorna: valid, total_blocks, invalid_block, error_message
```

---

## 📊 pgvector com HNSW

### Índice Otimizado
```sql
CREATE INDEX idx_ml_vectors_hnsw ON ml_vectors 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Busca Semântica
```sql
SELECT * FROM search_vectors(
  query_embedding := '[0.1, 0.2, ...]'::vector,
  p_empresa_id := 'uuid',
  match_threshold := 0.7,
  match_count := 10
);
```

---

## 🔌 Integrações

### Open Finance (Pluggy)
- Conexão bancária automatizada
- Sincronização de transações
- Análise de tarifas
- DDA (Débito Direto Autorizado)

### InfoSimples
- Consulta CNPJ/CPF
- Validação CRM
- Consulta ANVISA (produtos e empresas)
- Emissão de NF-e

### Webhooks
- Pluggy: `POST /api/pluggy-webhook`
- Supabase Realtime: Transações, Cirurgias

---

## 🚀 Instalação

```bash
# Clone
git clone https://github.com/newortho/icarus-v6.git
cd icarus-v6

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Iniciar Supabase local
npx supabase start

# Executar migrations
npx supabase migration up

# Gerar tipos
npx supabase gen types typescript --local > src/types/database.ts

# Iniciar desenvolvimento
npm run dev
```

---

## 📱 Mobile App

```bash
cd mobile

# Instalar Expo CLI
npm install -g expo-cli

# Instalar dependências
npm install

# Iniciar
expo start
```

---

## 🔐 Variáveis de Ambiente

```env
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
ANTHROPIC_API_KEY=
OPENAI_API_KEY=

# Open Finance
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=

# InfoSimples
INFOSIMPLES_TOKEN=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 📋 Compliance

### ANVISA RDC 665/2022
- ✅ Rastreabilidade completa de OPME
- ✅ Registros imutáveis
- ✅ Hash SHA-256 por registro

### LGPD
- ✅ Consentimento documentado
- ✅ Direitos do titular (15 dias)
- ✅ Anonimização de dados
- ✅ Log de acesso a dados pessoais

### Segurança
- ✅ Row Level Security (RLS)
- ✅ Blockchain Audit Log
- ✅ Proof of Work
- ✅ Criptografia de dados sensíveis

---

## 🧪 Testes

```bash
# Lint
npm run lint

# Build
npm run build

# Validar blockchain
SELECT * FROM validate_blockchain('empresa-uuid');
```

---

## 📄 Licença

Proprietário - NEW ORTHO © 2024

---

## 👥 Contato

- **Empresa**: NEW ORTHO
- **Email**: dax@newortho.com.br
- **Sistema**: ICARUS v6.0
