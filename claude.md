# 🚀 ICARUS v5.0 - Claude Code Context

**Sistema**: ERP Enterprise neumórfico para OPME (Órteses, Próteses e Materiais Especiais)
**Versão**: 5.0.3
**Status**: 🟢 Production-Ready
**Arquitetura**: React 18 + TypeScript + Supabase + AI

---

## 📋 Quick Reference

### Stack Tecnológico
```typescript
{
  frontend: "React 18.3.1 + TypeScript 5.6.3 + Vite 6.0.0",
  styling: "Tailwind CSS 4.0.0 + shadcn/ui",
  database: "Supabase PostgreSQL 15",
  designSystem: "OraclusX DS (Neumorphism)",
  ai: ["Claude Sonnet 4.5", "GPT-4", "TensorFlow.js"],
  deployment: "Vercel + GitHub Actions"
}
```

---

## 🎨 OraclusX Design System - REGRAS CRÍTICAS

### ✅ SEMPRE Fazer

1. **Componentes Base**
   - Usar `@/components/ui/input` (shadcn/ui Input)
   - Usar `@/components/ui/button` (shadcn/ui Button)
   - Usar `@/components/ui/card` para containers

2. **Paleta Universal**
   ```css
   --primary: #6366F1  /* Indigo - COR ÚNICA DE BOTÕES */
   --background: #F9FAFB /* Light mode */
   --foreground: #1F2937 /* Texto dark */
   ```

3. **Layout Responsivo**
   ```tsx
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* 3 colunas desktop, 2 tablet, 1 mobile */}
   </div>
   ```

4. **Acessibilidade**
   - aria-label em botões de ícone
   - Contraste mínimo 4.5:1
   - Focus visible (outline 2px)

### ❌ NUNCA Fazer

- ❌ Usar `<input>` ou `<button>` HTML nativo
- ❌ Aplicar sombra (box-shadow) em inputs/buttons
- ❌ Usar cores fora da paleta definida
- ❌ Hardcoded de URLs ou credenciais
- ❌ TypeScript `any` sem justificativa

---

## 🧠 IA Integrada (IcarusBrain)

### Serviços Disponíveis

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

// Em qualquer componente
const { predict, analyze, recommend } = useIcarusBrain()

// Prever demanda de produto
const forecast = await predict('demanda', {
  produto_id: '123',
  dias: 30
})

// Analisar inadimplência
const score = await analyze('inadimplencia', {
  cliente_id: '456'
})

// Recomendar produtos
const produtos = await recommend('produtos', {
  cliente_id: '789',
  limite: 5
})
```

---

## 🗂️ 58 Módulos - Estrutura

### Localização dos Módulos
```
src/components/modules/
├── Dashboard.tsx
├── Cirurgias.tsx           ⭐ Referência de qualidade
├── EstoqueIA.tsx
├── Compras.tsx
└── ... (55 módulos restantes)
```

### Padrão de Cada Módulo

```typescript
// src/components/modules/[Nome].tsx
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ModuloNome() {
  return (
    <div className="p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="neu-card">
          {/* KPI 1 */}
        </Card>
      </div>

      {/* Abas */}
      <Tabs defaultValue="aba1">
        <TabsList>
          <TabsTrigger value="aba1">Aba 1</TabsTrigger>
          <TabsTrigger value="aba2">Aba 2</TabsTrigger>
        </TabsList>

        <TabsContent value="aba1">
          {/* Conteúdo aba 1 */}
        </TabsContent>

        <TabsContent value="aba2">
          {/* Conteúdo aba 2 */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 📊 Supabase - Padrões

### Fetching Data

```typescript
import { useSupabase } from '@/hooks/useSupabase'

function useProdutos() {
  const { supabase } = useSupabase()
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    async function fetch() {
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error(error)
        return
      }

      if (data) setProdutos(data)
    }

    fetch()
  }, [])

  return { produtos }
}
```

### Mutations

```typescript
async function createProduto(data: ProdutoInput) {
  const { error } = await supabase
    .from('produtos')
    .insert([data])

  if (error) throw error
}

async function updateProduto(id: string, data: Partial<ProdutoInput>) {
  const { error } = await supabase
    .from('produtos')
    .update(data)
    .eq('id', id)

  if (error) throw error
}

async function deleteProduto(id: string) {
  const { error } = await supabase
    .from('produtos')
    .delete()
    .eq('id', id)

  if (error) throw error
}
```

---

## 🧪 Testes - Template

```typescript
// [Component].test.tsx
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    const onClick = jest.fn()
    render(<ComponentName onClick={onClick} />)

    // ... teste de interação
  })
})
```

---

## 📚 Skills Disponíveis

**Leia antes de desenvolver:**
- `/skills/oraclusx-ds/SKILL.md` - Padrões OraclusX DS
- `/skills/icarus-module/SKILL.md` - Como criar módulos
- `/skills/ai-integration/SKILL.md` - Integrar IA
- `/skills/supabase/SKILL.md` - Patterns Supabase

---

## 🎯 Como Trabalhar com Claude Code

### Bons Prompts

**✅ Específico**
```
Crie componente ProdutoForm usando OraclusX DS:
- shadcn/ui Input e Button
- Grid responsivo 3/2/1
- Validação Zod
- Integração Supabase
```

**✅ Com Contexto**
```
No módulo Estoque IA, adicione previsão de demanda:
- IcarusBrain service
- Gráfico Recharts
- Confidence score visual
- Salvar no Supabase
```

**❌ Vago**
```
Crie um formulário
```

### Comandos Úteis

```bash
# Dev
npm run dev

# Build
npm run build

# Test
npm test

# Supabase
npx supabase start
npx supabase db push

# Code Connect
npx figma connect publish
```

---

## ⚡ Atalhos

- **Ver módulo específico**: `/docs/modulos/ICARUS-MOD-[NOME].md`
- **Design System**: `/docs/design-system/ORACLUSX-DS.md`
- **API Reference**: `/docs/api/API-REFERENCE.md`
- **Troubleshooting**: `/docs/TROUBLESHOOTING.md`

---

**Versão**: 2.0.0
**Atualizado**: 2025-11-15

🚀 **Pronto para codificar!**
