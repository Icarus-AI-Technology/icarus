# 🤖 CLAUDE.md - Contexto Claude Code

> **LEIA PRIMEIRO** antes de desenvolver em ICARUS v5.0

---

## 📘 Sobre o Projeto

**ICARUS v5.0** é um sistema ERP enterprise completo para gestão OPME (Órteses, Próteses e Materiais Especiais) com:

- **58 módulos funcionais** de gestão completa
- **12 serviços de IA** (IcarusBrain) para previsões e insights
- **OraclusX Design System** - Design neumórfico 3D enterprise
- **Supabase PostgreSQL** - Database com RLS multi-tenant
- **React 18 + TypeScript 5 + Vite 6**
- **Tailwind CSS 4** com temas neumórficos

---

## 🏗️ Arquitetura

```
icarus-v5.0/
├── src/
│   ├── components/
│   │   ├── ui/              # OraclusX Design System (175+ componentes)
│   │   ├── layout/          # Layout (Sidebar, Header, Footer)
│   │   └── modules/         # 58 módulos ERP
│   ├── lib/
│   │   ├── ai/              # IcarusBrain (12 serviços IA)
│   │   ├── supabase/        # Client + Types
│   │   └── utils.ts         # Utilitários
│   ├── hooks/               # Custom React hooks
│   ├── pages/               # Páginas de rota
│   └── types/               # TypeScript types
└── docs/                    # Documentação completa
```

---

## 🎨 OraclusX Design System

### Paleta de Cores

```typescript
const colors = {
  primary: '#6366F1',    // Indigo - Ações principais
  success: '#10B981',    // Green - Sucesso
  warning: '#F59E0B',    // Amber - Avisos
  danger: '#EF4444',     // Red - Erros/Exclusões
}
```

### Componentes Neumórficos

```tsx
import { Card, Button } from '@/components/ui'

// Card com efeito neumórfico soft
<Card className="neu-soft">
  <Button variant="default">Salvar</Button>
</Card>

// Card com efeito neumórfico hard (mais pronunciado)
<Card className="neu-hard">
  <Button variant="success">Confirmar</Button>
</Card>

// Card com efeito inset (côncavo)
<Card className="neu-inset">
  <Button variant="warning">Atenção</Button>
</Card>
```

### Classes Disponíveis

- `neu-soft` - Sombra suave 3D
- `neu-hard` - Sombra forte 3D
- `neu-inset` - Efeito côncavo (pressionado)
- `neu-hover` - Efeito hover interativo

---

## 🧠 IcarusBrain - IA Integrada

### Serviços Disponíveis

1. **Previsão de Demanda** - Forecast 30 dias
2. **Score de Inadimplência** - Análise de risco
3. **Recomendação de Produtos** - Cross-sell/Up-sell
4. **Otimização de Estoque** - Ponto de reposição
5. **Análise de Sentimento** - NPS e feedback
6. **Detecção de Anomalias** - Fraudes e erros
7. **Precificação Dinâmica** - Sugestões de preço
8. **Churn Prediction** - Risco de cancelamento
9. **Lead Scoring** - Qualificação de leads
10. **Gestão de Crédito** - Limite automático
11. **Roteamento Inteligente** - Logística otimizada
12. **Assistente Virtual** - Chat com IA

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

  // Recomendações
  const produtos = await recommend('produtos', {
    cliente_id: '789',
    contexto: 'cross-sell'
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
import { supabase } from '@/lib/supabase/client'

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

## 📦 Módulos ERP (58 Total)

### Categorias

1. **Vendas** (12 módulos)
   - Pedidos, Orçamentos, Propostas, Contratos...

2. **Estoque** (8 módulos)
   - Produtos, Movimentações, Inventário...

3. **Financeiro** (10 módulos)
   - Contas a Receber/Pagar, Fluxo de Caixa...

4. **CRM** (8 módulos)
   - Clientes, Leads, Oportunidades...

5. **Compras** (6 módulos)
   - Fornecedores, Cotações, Ordens de Compra...

6. **Gestão** (14 módulos)
   - Relatórios, Dashboard, Analytics...

### Estrutura de Módulo

```typescript
// src/components/modules/vendas/Pedidos.tsx
export function Pedidos() {
  return (
    <div className="space-y-6">
      <Card className="neu-soft">
        {/* Conteúdo do módulo */}
      </Card>
    </div>
  )
}
```

---

## 🧪 Testes

```bash
# Unit tests
npm test

# Coverage
npm run test:coverage

# E2E
npm run test:e2e
```

**Meta**: 85% coverage (atual: 65%)

---

## 🚀 Deploy

### Vercel (Recomendado)

```bash
vercel
```

### Manual

```bash
npm run build
# Deploy pasta dist/
```

---

## 📝 Regras de Desenvolvimento

**SEMPRE leia `.clinerules` antes de desenvolver!**

### Principais Regras

1. **TypeScript estrito** - Sem `any`, usar tipos explícitos
2. **Componentes funcionais** - Hooks, não classes
3. **Neumorphism** - Usar classes `neu-*` em todos os cards/botões
4. **Responsivo** - Mobile-first, breakpoints Tailwind
5. **Acessibilidade** - WCAG 2.1 AA (aria-labels, keyboard nav)
6. **Performance** - Code splitting, lazy loading
7. **Testes** - Mínimo 65% coverage para PR

---

## 🔧 Ferramentas

- **Claude Code** - Assistente IA de desenvolvimento
- **ESLint** - Linting TypeScript
- **Prettier** - Formatação de código
- **Husky** - Git hooks
- **GitHub Actions** - CI/CD

---

## 📚 Recursos

- **Documentação**: `/docs/`
- **Troubleshooting**: `TROUBLESHOOTING.md`
- **Changelog**: `CHANGELOG.md`
- **Skills**: `SKILL_*.md`

---

## 🆘 Ajuda

### Problemas Comuns

1. **Erro Supabase** → Verificar `.env.local`
2. **Build falha** → `rm -rf node_modules && npm install`
3. **Types errados** → `npm run type-check`

### Contato

- **Issues**: GitHub Issues
- **Docs**: `/docs/`

---

**v5.0.3** | Release: 2025-11-15

🎯 **Use este documento como referência principal ao desenvolver com Claude Code!**
