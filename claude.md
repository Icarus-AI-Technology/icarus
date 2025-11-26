# 🤖 CLAUDE.md - Contexto Claude Code

> **LEIA PRIMEIRO** antes de desenvolver em ICARUS v5.0

---

## 📘 Sobre o Projeto

**ICARUS v5.0** é um sistema ERP enterprise completo para gestão OPME (Órteses, Próteses e Materiais Especiais) com:

- **Módulos funcionais** de gestão completa
- **IcarusBrain** - Serviços de IA para previsões e insights
- **Dark Glass Medical** - Design System neumórfico 3D profissional
- **Supabase PostgreSQL** - Database com RLS multi-tenant
- **React 18.3 + TypeScript 5.8 + Vite 6.3**
- **Tailwind CSS 4.1** com temas Dark Glass

---

## 🏗️ Arquitetura

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base (Card, Button, Input, etc.)
│   │   ├── layout/          # Layout (IcarusSidebar, IcarusTopbar, IcarusLayout)
│   │   ├── modules/         # Módulos ERP (Dashboard, etc.)
│   │   └── chat/            # ChatWidget - Assistente virtual
│   ├── contexts/            # React Contexts (ThemeContext, SidebarContext)
│   ├── hooks/               # Custom React hooks (useTheme, useSidebar)
│   ├── lib/                 # Utilitários e configurações
│   ├── pages/               # Páginas (HomePage, LoginPage)
│   └── types/               # TypeScript types
└── docs/                    # Documentação completa
```

---

## 🎨 Dark Glass Medical Design System

### Paleta de Cores

```typescript
// Dark Mode (padrão)
const darkColors = {
  background: '#0B0D16',      // Fundo principal
  card: '#15192B',            // Cards e containers
  cardElevated: '#1A1F35',    // Elementos elevados/inputs
  primary: '#6366F1',         // Indigo - Ações principais
  success: '#10B981',         // Verde - Sucesso
  warning: '#F59E0B',         // Âmbar - Avisos
  danger: '#EF4444',          // Vermelho - Erros
  textPrimary: '#FFFFFF',     // Texto principal
  textSecondary: '#94A3B8',   // Texto secundário
  textMuted: '#64748B',       // Texto desabilitado
}

// Light Mode
const lightColors = {
  background: '#F1F5F9',
  card: '#FFFFFF',
  cardElevated: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
}
```

### Efeitos Neumórficos 3D

```tsx
// Sombra elevada (cards)
const neuElevated = isDark 
  ? '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.02)'
  : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)'

// Sombra inset (inputs)
const neuInset = isDark 
  ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
  : 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.8)'
```

### Componentes Principais

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from '@/hooks/useTheme'

// Exemplo de uso
function MyComponent() {
  const { isDark } = useTheme()
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Título</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Digite aqui..." />
        <Button>Salvar</Button>
      </CardContent>
    </Card>
  )
}
```

### KPI Cards com Ícones Coloridos

```tsx
import { KPICard } from '@/components/ui/KPICard'
import { Calendar, DollarSign, AlertCircle, BrainCircuit } from 'lucide-react'

<KPICard
  title="Cirurgias Hoje"
  value={12}
  icon={Calendar}
  iconColor="#2DD4BF"  // Cyan
  trend={{ value: 5, direction: 'up' }}
/>

<KPICard
  title="Faturamento"
  value="R$ 45.200"
  icon={DollarSign}
  iconColor="#10B981"  // Verde
/>
```

---

## 🧠 IcarusBrain - IA Integrada

### Serviços Disponíveis

1. **Previsão de Demanda** - Forecast 30 dias
2. **Score de Inadimplência** - Análise de risco
3. **Recomendação de Produtos** - Cross-sell/Up-sell
4. **Otimização de Estoque** - Ponto de reposição
5. **Análise de Sentimento** - NPS e feedback
6. **Detecção de Anomalias** - Fraudes e erros
7. **Assistente Virtual** - Chat com IA

### Uso Básico

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function MyComponent() {
  const { predict, analyze, recommend } = useIcarusBrain()

  // Previsão de demanda
  const forecast = await predict('demanda', {
    produto_id: '123',
    periodo: 30
  })

  // Score de inadimplência
  const score = await analyze('inadimplencia', {
    cliente_id: '456'
  })
}
```

---

## 🗄️ Supabase - Database

### Configuração

```bash
# .env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Uso

```typescript
import { supabase } from '@/lib/config/supabase-client'

// Query simples
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)

// Realtime subscription
const channel = supabase
  .channel('vendas')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'vendas' },
    (payload) => console.log(payload)
  )
  .subscribe()
```

---

## 📦 Módulos ERP

### Categorias

1. **Principal** - Dashboard
2. **Cadastros & Gestão** - Cadastros, Contratos, Contábil, RH, Usuários
3. **Core Business** - Estoque IA, Cirurgias, Financeiro, CRM, Produtos OPME
4. **Compras & Fornecedores** - Compras, Licitações
5. **Operações & Logística** - Logística, Rastreabilidade
6. **Analytics & BI** - KPI Dashboard, Relatórios
7. **Automação & IA** - IA Central, Notificações
8. **Integrações** - API Gateway, Integrations Dashboard

### Estrutura de Módulo

```typescript
// src/components/modules/MeuModulo.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { useTheme } from '@/hooks/useTheme'

export function MeuModulo() {
  const { isDark } = useTheme()
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Meu Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Conteúdo */}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
vercel
```

### Manual

```bash
pnpm build
# Deploy pasta dist/
```

---

## 📝 Regras de Desenvolvimento

### Principais Regras

1. **TypeScript estrito** - Sem `any`, usar tipos explícitos
2. **Componentes funcionais** - Hooks, não classes
3. **Dark Glass Medical** - Seguir paleta de cores e efeitos neumórficos
4. **useTheme hook** - Usar para adaptar cores ao tema
5. **Ícones Lucide React** - Priorizar ícones do Lucide
6. **Responsivo** - Mobile-first, breakpoints Tailwind
7. **Acessibilidade** - WCAG 2.1 AA (aria-labels, keyboard nav)
8. **Performance** - Code splitting, lazy loading

---

## 🔧 Ferramentas

- **Claude Code** - Assistente IA de desenvolvimento
- **ESLint** - Linting TypeScript
- **Husky** - Git hooks (pre-commit)
- **GitHub Actions** - CI/CD
- **Vercel** - Deploy automático

---

## 📚 Recursos

- **Documentação**: `/docs/`
- **Troubleshooting**: `TROUBLESHOOTING.md`

---

## 🆘 Problemas Comuns

1. **Erro Supabase** → Verificar `.env.local`
2. **Build falha** → `rm -rf node_modules && pnpm install`
3. **Types errados** → `pnpm type-check`
4. **Tema não atualiza** → Verificar `useTheme` hook

---

**v5.0** | Release: 2025-11-26

🎯 **Use este documento como referência principal ao desenvolver com Claude Code!**
