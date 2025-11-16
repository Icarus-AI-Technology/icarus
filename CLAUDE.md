# 🚀 ICARUS v5.0 - Contexto para Claude Code

## 📋 Visão Geral

**ICARUS** é um ERP moderno e inteligente que substitui sistemas legados (Protheus) com uma solução web-first, orientada por IA e design neumórfico.

### Stack Tecnológico

```typescript
{
  frontend: {
    framework: "Next.js 14 (App Router)",
    language: "TypeScript 5.0+",
    styling: "Tailwind CSS 3.4",
    ui: "OraclusX Design System (Neumórfico)",
    stateManagement: "Zustand + React Query",
    forms: "React Hook Form + Zod"
  },

  backend: {
    runtime: "Node.js 20+",
    api: "Next.js API Routes",
    database: "Supabase (PostgreSQL)",
    auth: "Supabase Auth",
    storage: "Supabase Storage"
  },

  ia: {
    engine: "IcarusBrain (GPT-4 based)",
    services: ["predict", "analyze", "recommend", "chat"],
    integration: "useIcarusBrain hook"
  },

  qualidade: {
    tests: "Jest + React Testing Library",
    e2e: "Playwright",
    linter: "ESLint",
    formatter: "Prettier",
    typeCheck: "TypeScript strict mode"
  }
}
```

---

## 🏗️ Estrutura do Projeto

```
icarus/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Rotas autenticadas
│   │   ├── (public)/          # Rotas públicas
│   │   └── api/               # API Routes
│   │
│   ├── components/            # Componentes React
│   │   ├── ui/               # Componentes base (OraclusX DS)
│   │   ├── layouts/          # Layouts
│   │   └── shared/           # Componentes compartilhados
│   │
│   ├── modules/              # 58 módulos ICARUS
│   │   ├── vendas/          # Vendas (Pedidos, Clientes, etc)
│   │   ├── compras/         # Compras (Fornecedores, etc)
│   │   ├── financeiro/      # Financeiro (Contas, Fluxo, etc)
│   │   ├── estoque/         # Estoque (Produtos, Movimentos, etc)
│   │   └── .../             # Outros módulos
│   │
│   ├── services/            # Serviços
│   │   ├── supabase/       # Cliente Supabase
│   │   ├── ia/             # IcarusBrain
│   │   └── api/            # API clients
│   │
│   ├── hooks/              # Custom Hooks
│   │   ├── useIcarusBrain.ts
│   │   ├── useSupabase.ts
│   │   └── .../
│   │
│   ├── lib/                # Bibliotecas e utils
│   │   ├── utils.ts
│   │   ├── validators.ts
│   │   └── .../
│   │
│   ├── types/              # TypeScript types
│   │   ├── models/        # Modelos de dados
│   │   ├── api/           # API types
│   │   └── .../
│   │
│   └── styles/             # Estilos globais
│       └── globals.css
│
├── public/                 # Assets estáticos
├── tests/                  # Testes
├── docs/                   # Documentação
└── .config files          # Configurações
```

---

## 🎨 OraclusX Design System (Resumo)

### Filosofia
Design **neumórfico** com foco em profundidade, suavidade e elegância.

### Paleta de Cores

```css
/* Backgrounds */
--bg-primary: #0f1419      /* Fundo principal escuro */
--bg-secondary: #1a1f26    /* Cartões e elevações */

/* Neumorphic Shadows */
--shadow-light: rgba(255,255,255,0.03)  /* Luz superior */
--shadow-dark: rgba(0,0,0,0.5)          /* Sombra inferior */

/* Accent Colors */
--accent-primary: #3b82f6   /* Azul principal */
--accent-success: #10b981   /* Verde sucesso */
--accent-warning: #f59e0b   /* Amarelo aviso */
--accent-danger: #ef4444    /* Vermelho erro */

/* Text */
--text-primary: #f3f4f6     /* Texto principal */
--text-secondary: #9ca3af   /* Texto secundário */
```

### Componentes Base

#### Input Neumórfico
```tsx
<input
  className="
    bg-gray-900/50 backdrop-blur-sm
    border border-white/10
    rounded-xl px-4 py-3
    text-gray-100 placeholder-gray-500
    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
    transition-all duration-200
  "
/>
```

#### Button Neumórfico
```tsx
<button
  className="
    bg-gradient-to-br from-gray-800 to-gray-900
    border border-white/10
    rounded-xl px-6 py-3
    text-gray-100 font-medium
    shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
    hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
    active:scale-95
    transition-all duration-200
  "
/>
```

**📖 Ver detalhes completos**: `SKILL_ORACLUSX_DS.md`

---

## 🤖 IA Integration (Resumo)

### Hook useIcarusBrain

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function MyComponent() {
  const { predict, analyze, recommend, chat, loading } = useIcarusBrain()

  // Predição
  const handlePredict = async () => {
    const result = await predict({
      type: 'sales_forecast',
      data: { historical: [...] }
    })
  }

  // Análise
  const handleAnalyze = async () => {
    const insights = await analyze({
      type: 'customer_behavior',
      customerId: '123'
    })
  }

  // Recomendação
  const handleRecommend = async () => {
    const suggestions = await recommend({
      context: 'product_upsell',
      userId: '456'
    })
  }
}
```

**📖 Ver detalhes completos**: `SKILL_IA_INTEGRATION.md`

---

## 📦 58 Módulos ICARUS

### Vendas (8 módulos)
1. Pedidos de Venda
2. Orçamentos
3. Clientes
4. Comissões
5. Metas
6. Pipeline
7. Propostas Comerciais
8. Análise de Vendas

### Compras (6 módulos)
9. Pedidos de Compra
10. Cotações
11. Fornecedores
12. Solicitações de Compra
13. Aprovações
14. Análise de Compras

### Financeiro (12 módulos)
15. Contas a Pagar
16. Contas a Receber
17. Fluxo de Caixa
18. Bancos
19. Conciliação Bancária
20. Títulos
21. Cheques
22. Cartões
23. Boletos
24. PIX
25. Previsão Financeira
26. DRE

### Estoque (8 módulos)
27. Produtos
28. Movimentações
29. Inventário
30. Lotes
31. Armazéns
32. Transferências
33. Requisições
34. Análise de Estoque

### Fiscal (6 módulos)
35. NF-e
36. NFS-e
37. CT-e
38. SPED Fiscal
39. SPED Contribuições
40. Livros Fiscais

### Produção (5 módulos)
41. Ordens de Produção
42. Estrutura de Produtos
43. Roteiro de Produção
44. Apontamentos
45. PCP

### Qualidade (3 módulos)
46. Inspeções
47. Não Conformidades
48. Certificados

### RH (6 módulos)
49. Funcionários
50. Folha de Pagamento
51. Ponto Eletrônico
52. Férias
53. Benefícios
54. Treinamentos

### BI & Analytics (4 módulos)
55. Dashboards
56. Relatórios
57. KPIs
58. Alertas Inteligentes

---

## ⚙️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor dev (localhost:3000)
npm run build            # Build de produção
npm run start            # Inicia servidor produção
npm run lint             # Lint check
npm run lint:fix         # Lint fix
npm run type-check       # TypeScript check

# Testes
npm test                 # Roda testes unitários
npm run test:watch       # Testes em watch mode
npm run test:coverage    # Coverage report
npm run test:e2e         # Testes E2E

# Database (Supabase)
npm run db:types         # Gera types do DB
npm run db:migrate       # Roda migrations
npm run db:seed          # Seed database

# Code Quality
npm run format           # Formata código (Prettier)
npm run check:all        # Lint + Type + Test
```

---

## 💡 Bons Prompts para Claude Code

### Criar Novo Módulo
```
"Criar módulo de [NOME] seguindo o padrão ICARUS.
Incluir: KPIs, Tabs (Lista/Form/Kanban), integração Supabase,
validação Zod, e OraclusX DS."
```

### Modificar UI
```
"Atualizar componente [NOME] para usar OraclusX Design System.
Garantir acessibilidade WCAG 2.1 AA e responsividade."
```

### Adicionar IA
```
"Integrar IcarusBrain no módulo [NOME] para [FUNCIONALIDADE].
Usar serviço [predict/analyze/recommend/chat]."
```

### Debug
```
"Analisar erro em [ARQUIVO/COMPONENTE].
Verificar: tipos TS, imports, dependências, e logs."
```

### Otimização
```
"Otimizar performance do [COMPONENTE/MÓDULO].
Focar em: memoization, code splitting, lazy loading."
```

---

## 🎯 Regras de Desenvolvimento

### TypeScript
- ✅ Modo strict habilitado
- ✅ Tipos explícitos (evitar `any`)
- ✅ Interfaces para props de componentes
- ✅ Enums para constantes

### React
- ✅ Componentes funcionais + hooks
- ✅ Memoization (React.memo, useMemo, useCallback)
- ✅ Prop drilling máximo 2 níveis (usar context/zustand)
- ✅ Error boundaries

### Supabase
- ✅ RLS (Row Level Security) habilitado
- ✅ Typed queries
- ✅ Realtime quando necessário
- ✅ Error handling completo

### Acessibilidade
- ✅ WCAG 2.1 AA mínimo
- ✅ Aria labels
- ✅ Navegação por teclado
- ✅ Contraste adequado

### Performance
- ✅ Lazy loading de rotas
- ✅ Image optimization (next/image)
- ✅ Code splitting
- ✅ Debounce em inputs

### Segurança
- ✅ Sanitização de inputs
- ✅ CSRF protection
- ✅ XSS prevention
- ✅ SQL injection prevention (via Supabase)

**📖 Ver regras completas**: `.clinerules`

---

## 📚 Documentação Adicional

- **Design System**: `SKILL_ORACLUSX_DS.md`
- **Criar Módulos**: `SKILL_CRIAR_MODULOS.md`
- **Integração IA**: `SKILL_IA_INTEGRATION.md`
- **Supabase**: `SKILL_SUPABASE.md`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Documento Mestre**: `ICARUS_V5_CONSOLIDADO_DEFINITIVO.md`
- **Índice Completo**: `INDEX.md`

---

## 🚦 Quick Start

1. **Ler este arquivo** (você já fez! ✅)
2. **Ler `.clinerules`** (regras obrigatórias)
3. **Ler skill relevante** (OraclusX, Módulos, IA, Supabase)
4. **Começar a codificar** seguindo os padrões

---

**Versão**: 1.0.0
**Data**: 2025-11-15
**Status**: ✅ Pronto para desenvolvimento

🎯 **Use este arquivo como referência principal antes de qualquer desenvolvimento!**
