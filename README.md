# 🚀 ICARUS v5.0

**ERP Enterprise para OPME** (Órteses, Próteses e Materiais Especiais) com **Inteligência Artificial**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_16-3FCF8E?logo=supabase)](https://supabase.com/)

**🔗 Produção:** https://icarus-g7taqo9op-daxs-projects-5db3d203.vercel.app

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

- 🏥 **Gestão de Cirurgias** - Kanban completo com 12 status, rastreabilidade OPME
- 📦 **Estoque Inteligente** - Previsão de demanda com IA, alertas preditivos
- 💰 **Financeiro Avançado** - Conciliação ML, Pluggy/DDA, gestão fiscal
- 🤖 **IcarusBrain** - 9 Agentes IA especializados (LangGraph)
- 📊 **Dashboards** - Smart View com ML nativo
- 🎨 **Dark Glass Medical** - Design System neumórfico 3D
- 📱 **Mobile App** - React Native para instrumentadores
- 🔊 **Voice Commands** - Operações hands-free
- 🔗 **Blockchain** - Audit trail para compliance
- 📄 **Qualidade** - Gestão de documentos ANVISA e Cartas de Comercialização

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18.3.1 + TypeScript 5.9 + Vite 6.4 |
| **Styling** | Tailwind CSS 4.1 + Radix UI |
| **Database** | Supabase PostgreSQL 16 + pgvector + HNSW |
| **Design System** | Dark Glass Medical (Neumorphism 3D) |
| **Animações** | Framer Motion 12.x |
| **Gráficos** | Recharts 2.15 |
| **Ícones** | Lucide React |
| **IA** | LangChain 0.3 + LangGraph 0.2 + Claude 3.5 Sonnet + GPT-4o |
| **Backend** | Supabase Edge Functions (Deno/TS) |
| **Mobile** | React Native + Expo SDK 50 |
| **Deploy** | Vercel + GitHub Actions |
| **Cache** | Redis |
| **Blockchain** | SHA-256 + Proof of Work |

---

## 🧠 IA Avançada - 9 Agentes Especializados

### Agentes LangGraph Implementados

| Agente | Funcionalidade |
|--------|----------------|
| **TrainingTutor** | Treinamento RDC 59, simulações interativas |
| **TestCertifier** | Avaliação e certificação digital |
| **ErrorPredictor** | Previsão de falhas, alertas proativos |
| **AutoCorrector** | Correção automática de dados |
| **UserGuide** | Onboarding e ajuda contextual |
| **LogAuditor** | Auditoria de logs e compliance |
| **FraudDetector** | Detecção de anomalias e fraudes |
| **AnvisaTutor** | Especialista em ANVISA/RDCs |
| **BaseAgent** | Framework base para novos agentes |

### Módulos com IA Integrada

| Módulo | Funcionalidade IA | Status |
|--------|-------------------|--------|
| **Estoque IA** | RAG + previsão de demanda + alertas | ✅ |
| **Cirurgias** | Kit inteligente + análise preditiva | ✅ |
| **Financeiro** | Conciliação ML + score inadimplência | ✅ |
| **Smart View** | Dashboard com ML nativo | ✅ |
| **Qualidade** | Alertas preditivos de vencimento | ✅ |
| **Compliance** | Treinamento e certificação | ✅ |

### Uso dos Agentes

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { createAgent } from '@/lib/ai/agents'

// Usar hook centralizado
const { predict, analyze, recommend } = useIcarusBrain()

// Criar agente específico
const anvisaTutor = createAgent('anvisa-tutor')
const response = await anvisaTutor.execute({
  action: 'consultar_rdc',
  params: { numeroRDC: '665' }
})
```

---

## 📊 58 Módulos Implementados

### Módulos com Funcionalidade Completa (12)

| Módulo | Descrição |
|--------|-----------|
| **Dashboard** | KPIs, gráficos, ações rápidas, IA insights |
| **Cirurgias** | Kanban 12 colunas, mapa, formulários completos |
| **Estoque IA** | CRUD, alertas, previsão IA |
| **Financeiro** | Contas, conciliação ML, gestão fiscal |
| **Cadastros** | CRUD completo 8 entidades |
| **RH** | DIRF 2025, folha, PJ, NR-1 |
| **Configurações** | Certificado digital, logo, CNPJ |
| **Manufatura** | MRP integrado, produção |
| **Smart View** | ML nativo, predições |
| **Qualidade** | Documentos ANVISA, cartas comercialização |
| **Compliance** | ANVISA, ISO 42001, LGPD |
| **Licitações** | Processos, editais, propostas |

### Módulos com Template Base (46)

Todos os demais módulos utilizam o `ModuleTemplate` com:
- ✅ Header com ícone e título
- ✅ Barra de ações (busca, filtros, export)
- ✅ Cards de estatísticas
- ✅ Tabela de dados
- ✅ Design Dark Glass Medical
- ✅ Responsividade

---

## 🎨 Dark Glass Medical Design System

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
```

### Componentes UI

| Componente | Descrição |
|------------|-----------|
| **Card** | Container neumórfico 3D |
| **KPICard** | Métricas com ícones coloridos |
| **Button** | Gradiente indigo, variantes |
| **Input** | Efeito inset neumórfico |
| **Dialog** | Modal glassmorphism |
| **Tabs** | Navegação animada |
| **MaskedInput** | Validação visual em tempo real |

---

## 🔄 Módulo Cirurgias - Fluxo Completo

### Kanban (12 Colunas)

```
1. Pedido Médico     → 2. Cotação           → 3. Aguardando Autorização
4. Autorizada        → 5. Agendada          → 6. Logística
7. Em Cirurgia       → 8. Logística Reversa → 9. Pós-Cirúrgico
10. Aguard. Faturamento → 11. Fatur. Parcial → 12. Faturada
```

### Sub-módulos

- ✅ KanbanCirurgias - Drag & drop visual
- ✅ MapaCirurgias - Timeline horizontal
- ✅ CadastroPaciente - Rastreabilidade OPME
- ✅ KitOPMEInteligente - Sugestões IA
- ✅ DashboardCirurgico - Métricas tempo real
- ✅ AutorizacaoPrevia - Workflow convênios
- ✅ RastreamentoRFID - IoT integration
- ✅ PortaisOPME - Integração portais

---

## 📄 Módulo Qualidade - Gestão de Documentos

### Funcionalidades

- 📁 **Upload de Documentos** - Qualquer documento da empresa
- 🏥 **Documentos ANVISA** - Checklist obrigatórios (AFE, AE, Licenças)
- 📜 **Cartas de Comercialização** - Controle de validade por fabricante
- ⏰ **Alertas Preditivos** - 90/60/30/15 dias antes do vencimento
- 🤖 **IA Preditiva** - Análise inteligente de renovações

### Documentos ANVISA Obrigatórios

- ✅ Autorização de Funcionamento (AFE)
- ✅ Autorização Especial (AE)
- ✅ Licença Sanitária Estadual/Municipal
- ✅ CNES
- ✅ CRT
- ✅ Manual de Boas Práticas
- ✅ POPs Obrigatórios

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/                    # 25+ componentes base
│   │   ├── layout/                # IcarusLayout, Sidebar, Topbar
│   │   ├── modules/               # 58 módulos ERP
│   │   │   ├── analytics/         # SmartViewDashboard
│   │   │   ├── cirurgias/         # 10 sub-módulos
│   │   │   ├── estoque/           # ConteineresInteligentes, IoT
│   │   │   ├── financeiro/        # 6 sub-módulos
│   │   │   ├── manufatura/        # ManufaturaLeveMRP
│   │   │   └── qualidade/         # GestaoDocumentosQualidade
│   │   └── chat/                  # ChatWidget IA
│   ├── hooks/                     # 30+ hooks customizados
│   ├── lib/
│   │   ├── ai/agents/             # 9 agentes LangGraph
│   │   ├── blockchain/            # Audit trail
│   │   ├── cache/                 # Redis
│   │   ├── compliance/            # ANVISA, ISO, LGPD
│   │   ├── export/                # BI Export
│   │   ├── integrations/          # APIs externas
│   │   └── voice/                 # Voice commands
│   ├── contexts/                  # React Contexts
│   ├── pages/                     # Páginas principais
│   └── types/                     # TypeScript types
├── supabase/
│   ├── migrations/                # 10+ migrations
│   └── functions/                 # Edge Functions
├── mobile/                        # React Native app
├── tests/e2e/                     # Playwright tests
└── docs/                          # Documentação
```

---

## 🗄️ Supabase + pgvector

### Configuração

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

### Edge Functions

| Função | Descrição |
|--------|-----------|
| `semantic-search` | Busca vetorial HNSW |
| `langchain-agent` | Agente reativo |
| `extract-nfe` | Extração NF-e Vision |
| `whatsapp-webhook` | Bot WhatsApp |
| `cache-redis` | Cache distribuído |

---

## 📝 Scripts

```bash
pnpm dev          # Desenvolvimento (port 5173)
pnpm build        # Build produção
pnpm preview      # Preview build
pnpm lint         # Linter
pnpm type-check   # TypeScript check
pnpm test         # Vitest
pnpm test:e2e     # Playwright
```

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| `CLAUDE.md` | Contexto para Claude Code |
| `docs/AUDITORIA-COMPLETA-2025-11-28.md` | Auditoria completa |
| `docs/DIAGNOSTICO-FUNCIONALIDADES-IA-2025.md` | Diagnóstico IA |
| `docs/PLANO-MELHORIAS-IA-2025.md` | Roadmap IA |
| `docs/ICARUS-INDICE-MESTRE-58-MODULOS.md` | Índice módulos |

---

## 🌟 Status do Projeto

### Implementado ✅

- ✅ 58 módulos ERP
- ✅ 9 agentes IA LangGraph
- ✅ Design System Dark Glass Medical
- ✅ Kanban Cirurgias 12 colunas
- ✅ Qualidade com alertas preditivos
- ✅ Mobile App React Native
- ✅ Voice Commands
- ✅ Blockchain Audit Trail
- ✅ WhatsApp Bot
- ✅ BI Export (Power BI, Tableau)
- ✅ pgvector HNSW
- ✅ Redis Cache
- ✅ RAGAS Evaluation
- ✅ Human-in-the-Loop
- ✅ Deploy Vercel

### Versão

**v5.0.3** - Production Ready (28/11/2025)

---

## 📝 Licença

Propriedade da **Icarus AI Technology**.

---

**Desenvolvido com ❤️ pela equipe Icarus AI Technology**
