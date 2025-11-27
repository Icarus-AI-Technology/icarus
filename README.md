# 🚀 ICARUS v5.0

**ERP Enterprise para OPME** (Órteses, Próteses e Materiais Especiais) com **Inteligência Artificial**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)

---

## ⚡ Quick Start

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase

# 3. Iniciar desenvolvimento
pnpm dev
```

Acesse: **http://localhost:5173**

---

## 📋 Sobre o Projeto

ICARUS é um sistema ERP completo desenvolvido com as mais modernas tecnologias web, incorporando **Inteligência Artificial** para otimização de processos em empresas de OPME.

### ✨ Principais Funcionalidades

- 🏥 **Gestão de Cirurgias** - Controle completo de procedimentos cirúrgicos
- 📦 **Estoque Inteligente** - Previsão de demanda com IA
- 💰 **Financeiro** - Controle de faturamento e inadimplência
- 🤖 **IcarusBrain** - IA integrada para análises preditivas
- 📊 **Dashboards** - Visualizações em tempo real
- 🎨 **Dark Glass Medical** - Design System moderno e profissional

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18.3.1 + TypeScript 5.8 + Vite 6.3 |
| **Styling** | Tailwind CSS 4.1 + Radix UI |
| **Database** | Supabase PostgreSQL 15 + pgvector |
| **Design System** | Dark Glass Medical (Neumorphism 3D) |
| **Animações** | Motion (Framer Motion) 12.x |
| **Gráficos** | Recharts 3.x |
| **Ícones** | Lucide React |
| **IA** | LangChain 0.3 + LangGraph 0.2 + Claude 3.5 Sonnet + GPT-4o |
| **Backend** | Supabase Edge Functions (Deno/TS) |
| **Deploy** | Vercel + GitHub Actions |

---

## 🧠 IA Avançada (Integração 2025)

### LangChain + LangGraph + pgvector

O ICARUS integra as mais recentes tecnologias de IA para gestão OPME:

- **LangChain 0.3.1 + LangGraph 0.2.5**: Agentes reativos para RAG em estoque, cirurgias e farmacovigilância
- **pgvector (Supabase)**: Embeddings vetoriais para busca semântica em catálogos ANVISA
- **LLMs**: Claude 3.5 Sonnet (prioridade para raciocínio regulatório) + GPT-4o (embeddings)
- **Backend**: Supabase Edge Functions (Deno/TS) para IcarusBrain serverless

### Módulos com IA Integrada

| Módulo | Funcionalidade IA | Status |
|--------|-------------------|--------|
| **Estoque IA** | RAG para previsão de demanda + rastreabilidade lote (RDC 59) | ✅ Novo |
| **Cirurgias** | Análise preditiva de procedimentos + alertas ANVISA | ✅ Novo |
| **Financeiro** | Score de inadimplência com análise semântica de NF-e | ✅ Novo |
| **IcarusBrain** | Agente LangGraph para queries cross-módulo | ✅ Novo |
| **Produtos OPME** | Busca semântica em 200+ itens reais (stents, implantes) | ✅ Novo |
| **Faturamento** | Extração automática de NF-e via Claude Vision | ✅ Novo |

### Ferramentas do Agente IA

```typescript
import { useLangChainTools } from '@/hooks/useLangChainTools'

const { searchCatalog, sendToAgent, extractNFE } = useLangChainTools()

// Busca semântica no catálogo OPME
const results = await searchCatalog('stent coronário 3.0mm', {
  anvisaValido: true,
  classeRisco: ['III', 'IV'],
  vencimentoApos: '2026-01-01'
})

// Chat com agente LangGraph
const response = await sendToAgent(
  'Qual estoque de stent Resolute 3.0x24mm na região Sudeste?'
)

// Extração de NF-e via Vision
const nfe = await extractNFE(file) // Suporta XML, PDF, imagem
```

### Edge Functions Disponíveis

| Função | Descrição |
|--------|-----------|
| `semantic-search` | Busca vetorial com filtros regulatórios ANVISA |
| `langchain-agent` | Agente reativo com 5 ferramentas especializadas |
| `extract-nfe` | Extração de NF-e via XML parser + Claude Vision |
| `chat` | Chat conversacional com contexto de módulo |

---

## 🎨 Dark Glass Medical Design System

O ICARUS utiliza o **Dark Glass Medical**, um design system moderno baseado em:

### Características
- 🌙 **Dark Mode** como padrão
- ✨ **Neumorphism 3D** com sombras elevadas
- 🎯 **Glassmorphism** com blur e transparência
- 🎨 **Paleta profissional** para ambiente médico-hospitalar
- ♿ **Acessibilidade** WCAG 2.1 AA
- 📱 **Responsivo** mobile-first

### Paleta de Cores

```css
/* Dark Mode */
--background: #0B0D16       /* Fundo principal */
--card: #15192B             /* Cards e containers */
--card-elevated: #1A1F35    /* Elementos elevados */
--primary: #6366F1          /* Indigo - Ações principais */
--success: #10B981          /* Verde - Sucesso */
--warning: #F59E0B          /* Âmbar - Avisos */
--danger: #EF4444           /* Vermelho - Erros */
--text-primary: #FFFFFF     /* Texto principal */
--text-secondary: #94A3B8   /* Texto secundário */
--text-muted: #64748B       /* Texto desabilitado */
```

### Componentes Principais

- ✅ **Card** - Container com efeito neumórfico 3D
- ✅ **KPICard** - Cards de métricas com ícones coloridos
- ✅ **Button** - Botões com variantes (primary, secondary, ghost)
- ✅ **Input** - Campos com efeito inset neumórfico
- ✅ **Sidebar** - Navegação colapsável com transições suaves
- ✅ **Topbar** - Barra superior com busca e notificações
- ✅ **ChatWidget** - Assistente virtual flutuante

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── IcarusLayout.tsx
│   │   │   ├── IcarusSidebar.tsx
│   │   │   └── IcarusTopbar.tsx
│   │   ├── modules/            # Módulos do sistema
│   │   │   ├── Dashboard.tsx
│   │   │   └── ...
│   │   └── chat/               # Assistente virtual
│   │       └── ChatWidget.tsx
│   ├── pages/                  # Páginas
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── hooks/                  # Hooks customizados
│   │   ├── useTheme.ts
│   │   ├── useSidebar.ts
│   │   └── useIcarusBrain.ts
│   ├── contexts/               # React Contexts
│   │   ├── ThemeContext.tsx
│   │   └── SidebarContext.tsx
│   ├── lib/                    # Utilitários
│   │   ├── utils.ts
│   │   └── data/navigation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # CSS Variables + Tailwind
├── docs/                       # Documentação
├── public/
│   └── favicon.svg
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🧠 Integração com IA

### IcarusBrain

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

const { predict, analyze, recommend } = useIcarusBrain()

// Previsão de demanda
const forecast = await predict('demanda', {
  produto_id: '123',
  dias: 30
})

// Score de inadimplência
const score = await analyze('inadimplencia', {
  cliente_id: '456'
})
```

---

## 📊 Módulos Disponíveis

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Dashboard | ✅ | Visão geral do sistema |
| Cirurgias | ✅ | Gestão de procedimentos |
| Estoque IA | ✅ | Controle inteligente |
| Financeiro | ✅ | Faturamento e cobrança |
| CRM & Vendas | ✅ | Gestão de clientes |
| Compras | ✅ | Gestão de fornecedores |
| Produtos OPME | ✅ | Cadastro de produtos |
| Contas a Receber | ✅ | Gestão de recebíveis |
| Faturamento NFe | ✅ | Emissão de notas fiscais |
| Inventário | ✅ | Controle de inventário |
| Licitações | ✅ | Gestão de licitações |

---

## 🗄️ Supabase + pgvector

### Configuração

1. Crie um projeto no [Supabase](https://supabase.com)
2. Habilite a extensão `pgvector` no SQL Editor
3. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
OPENAI_API_KEY=sk-...  # Para embeddings
ANTHROPIC_API_KEY=sk-ant-...  # Para Claude Vision
```

### Migrações (pgvector + OPME)

```bash
# Aplicar migrações
supabase db push

# Deploy Edge Functions
supabase functions deploy langchain-agent
supabase functions deploy semantic-search
supabase functions deploy extract-nfe
```

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `catalogo_medico_embeddings` | Embeddings vetoriais para busca semântica ANVISA |
| `ai_agent_tools_log` | Auditoria de execução de ferramentas IA |
| `nfe_extractions` | NF-e extraídas automaticamente |
| `audit_logs` | Logs de compliance (21 CFR Part 11) |

### Exemplo de Uso

```typescript
import { supabase } from '@/lib/config/supabase-client'

// Busca tradicional
const { data } = await supabase
  .from('produtos')
  .select('*')

// Busca semântica via RPC (pgvector)
const { data: results } = await supabase.rpc('busca_semantica_catalogo', {
  query_embedding: embeddings,
  match_threshold: 0.7,
  match_count: 10,
  filtro_anvisa_valido: true
})

// Chamar Edge Function
const { data: agentResponse } = await supabase.functions.invoke('langchain-agent', {
  body: { mensagem: 'Qual estoque de stents?', modulo: 'estoque' }
})
```

---

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento (port 5173)
pnpm build        # Build de produção
pnpm preview      # Preview do build
pnpm lint         # Executar linter
pnpm type-check   # Verificar tipos TypeScript
```

---

## 🔧 Suporte

- **Issues**: [GitHub Issues](https://github.com/Icarus-AI-Technology/icarus/issues)
- **Docs**: Ver pasta `/docs/` para guias completos
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Licença

Este projeto é propriedade da **Icarus AI Technology**.

---

## 🌟 Versão

**v5.0** - Production Ready (LangChain Edition)

### Status do Projeto
- ✅ Design System Dark Glass Medical
- ✅ 14+ componentes otimizados
- ✅ Dark mode como padrão
- ✅ Sidebar colapsável com transições
- ✅ 11 módulos implementados
- ✅ Assistente virtual integrado
- ✅ Deploy automático Vercel
- ✅ **LangChain + LangGraph** integrado
- ✅ **pgvector** para busca semântica
- ✅ **Claude Vision** para extração de NF-e
- ✅ **Agente reativo** com 5 ferramentas
- ✅ GitHub Actions CI/CD

### Secrets Necessários (GitHub Actions)

| Secret | Descrição |
|--------|-----------|
| `VERCEL_TOKEN` | Token de acesso Vercel |
| `VERCEL_ORG_ID` | ID da organização Vercel |
| `VERCEL_PROJECT_ID` | ID do projeto Vercel |
| `SUPABASE_ACCESS_TOKEN` | Token de acesso Supabase CLI |
| `SUPABASE_PROJECT_REF` | Referência do projeto Supabase |

---

**Desenvolvido com ❤️ pela equipe Icarus AI Technology**
