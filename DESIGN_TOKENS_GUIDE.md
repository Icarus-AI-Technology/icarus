# 🎨 DESIGN TOKENS - Guia Completo ICARUS v5.0

**Arquivo**: `design-tokens.json`
**Versão**: 5.0.3
**Data**: 2025-11-16

---

## 📋 ÍNDICE

1. [Introdução](#introdução)
2. [Estrutura](#estrutura)
3. [Como Usar](#como-usar)
4. [Cores](#cores)
5. [Tipografia](#tipografia)
6. [Espaçamento](#espaçamento)
7. [Sombras Neumórficas](#sombras-neumórficas)
8. [Dimensões Obrigatórias](#dimensões-obrigatórias)
9. [Regras de Uso](#regras-de-uso)
10. [Exemplos Práticos](#exemplos-práticos)

---

## INTRODUÇÃO

Design Tokens são **valores de design reutilizáveis** que garantem consistência visual em todo o sistema ICARUS.

### Benefícios:

✅ **Consistência** - Todos os componentes usam os mesmos valores
✅ **Manutenibilidade** - Mudar um token atualiza todo o sistema
✅ **Documentação** - Valores centralizados
✅ **Integração Figma** - Tokens sincronizados com Figma

---

## ESTRUTURA

```
design-tokens.json
├── colors
│   ├── primary (Indigo #6366F1)
│   ├── palette (17 cores completas)
│   ├── semantic (success, error, warning, info)
│   ├── neutral (white, gray, black)
│   ├── background
│   ├── text
│   └── kpi
├── typography
│   ├── fontFamily
│   ├── fontSize (xs → 5xl)
│   ├── fontWeight
│   ├── lineHeight
│   └── letterSpacing
├── spacing (0 → 24)
├── borderRadius (none → full)
├── shadows
│   ├── neomorphic (raised, flat, inset)
│   └── standard (sm → xl)
├── dimensions
│   ├── topbar (64px ⚠️)
│   ├── sidebar
│   ├── kpi (160px ⚠️)
│   ├── chart (420px ⚠️)
│   └── modal
├── breakpoints (sm → 2xl)
├── animation
├── zIndex
├── opacity
└── components
```

---

## COMO USAR

### No TypeScript:

```typescript
import tokens from './design-tokens.json';

// Cores
const primaryColor = tokens.colors.primary.indigo.value; // "#6366F1"
const successColor = tokens.colors.semantic.success.value; // "#10B981"

// Espaçamento
const cardPadding = tokens.spacing["6"].value; // "1.5rem" (24px)

// Dimensões
const chartHeight = tokens.dimensions.chart.height.value; // "420px"

// Tipografia
const baseFont = tokens.typography.fontSize.base.value; // "1rem" (16px)
```

### No JSX/TSX:

```tsx
// ✅ CORRETO - Usando tokens
<NeomorphicCard className="p-6 rounded-[16px]">
  <h2 style={{ color: "#6366F1" }}>Título</h2>
</NeomorphicCard>

// ❌ ERRADO - Valores hardcoded
<div className="p-[20px] rounded-[15px]">
  <h2 style={{ color: "#5555FF" }}>Título</h2>
</div>
```

---

## CORES

### Paleta Completa (17 cores)

| Cor | Hex | Uso |
|-----|-----|-----|
| **Blue** | `#3B82F6` | Informação, links |
| **Indigo** ⭐ | `#6366F1` | COR PRIMÁRIA |
| **Cyan** | `#06B6D4` | Analytics, dados |
| **Teal** | `#14B8A6` | Estoque, inventário |
| **Green** | `#10B981` | Sucesso, financeiro |
| **Emerald** | `#059669` | Lucro, crescimento |
| **Lime** | `#84CC16` | Eco, sustentável |
| **Amber** | `#F59E0B` | Alerta, pendente |
| **Orange** | `#F97316` | Urgente, importante |
| **Red** | `#EF4444` | Erro, crítico |
| **Rose** | `#F43F5E` | Destaque, promoção |
| **Pink** | `#EC4899` | Satisfação, NPS |
| **Purple** | `#A855F7` | IA, automação |
| **Violet** | `#8B5CF6` | Machine Learning |
| **Sky** | `#0EA5E9` | Cloud, integrações |
| **Slate** | `#64748B` | Neutro, secundário |
| **Yellow** | `#EAB308` | Novo, destaque |

### Cores por Contexto:

```typescript
// KPIs Financeiros
iconColor: "#10B981" // Green

// KPIs de Vendas
iconColor: "#3B82F6" // Blue

// KPIs de Estoque
iconColor: "#14B8A6" // Teal

// Alertas
iconColor: "#F59E0B" // Amber

// Críticos
iconColor: "#EF4444" // Red

// IA/Automação
iconColor: "#A855F7" // Purple
```

---

## TIPOGRAFIA

### Tamanhos:

| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| `xs` | `0.75rem` | 12px | Labels, badges |
| `sm` | `0.875rem` | 14px | Texto secundário |
| `base` | `1rem` | 16px | Texto padrão ⭐ |
| `lg` | `1.125rem` | 18px | Subtítulos |
| `xl` | `1.25rem` | 20px | Títulos seções |
| `2xl` | `1.5rem` | 24px | Títulos cards |
| `3xl` | `1.875rem` | 30px | Títulos principais |
| `4xl` | `2.25rem` | 36px | Hero titles |
| `5xl` | `3rem` | 48px | Display |

### Pesos:

| Token | Valor | Uso |
|-------|-------|-----|
| `light` | 300 | Texto decorativo |
| `normal` | 400 | Texto padrão ⭐ |
| `medium` | 500 | Destaque leve |
| `semibold` | 600 | Subtítulos |
| `bold` | 700 | Títulos |
| `extrabold` | 800 | Display |

---

## ESPAÇAMENTO

### Escala (baseada em 4px):

| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| `0` | `0` | 0px | Sem espaço |
| `1` | `0.25rem` | 4px | Micro espaços |
| `2` | `0.5rem` | 8px | Espaços pequenos |
| `3` | `0.75rem` | 12px | Espaços médios |
| `4` | `1rem` | 16px | Espaço base |
| `5` | `1.25rem` | 20px | - |
| `6` | `1.5rem` | 24px | **Padding cards ⭐** |
| `8` | `2rem` | 32px | Separação grande |
| `10` | `2.5rem` | 40px | - |
| `12` | `3rem` | 48px | - |
| `16` | `4rem` | 64px | - |
| `20` | `5rem` | 80px | - |
| `24` | `6rem` | 96px | Espaços enormes |

### Regras de Uso:

```tsx
// ✅ Cards - SEMPRE p-6 (24px)
<NeomorphicCard className="p-6">

// ✅ Gap entre seções - SEMPRE gap-6 (24px)
<div className="grid grid-cols-2 gap-6">

// ✅ Botões
<Button className="px-6 py-3"> // 24px H, 12px V
```

---

## SOMBRAS NEUMÓRFICAS

### Tipos:

#### 1. **Raised** (Botões elevados)

```css
box-shadow: 8px 8px 16px rgba(163, 177, 198, 0.6),
            -8px -8px 16px rgba(255, 255, 255, 0.5);
```

**Uso**: Botões, elementos interativos elevados

---

#### 2. **Flat** (Cards planos) ⭐ PADRÃO

```css
box-shadow: 4px 4px 8px rgba(163, 177, 198, 0.4),
            -4px -4px 8px rgba(255, 255, 255, 0.4);
```

**Uso**: Cards, containers principais

---

#### 3. **Inset** (Inputs afundados)

```css
box-shadow: inset 4px 4px 8px rgba(163, 177, 198, 0.5),
            inset -4px -4px 8px rgba(255, 255, 255, 0.5);
```

**Uso**: Inputs, áreas de texto, elementos pressionados

---

## DIMENSÕES OBRIGATÓRIAS

### ⚠️ NUNCA ALTERE ESTAS DIMENSÕES:

```typescript
{
  topbar: "64px",      // Altura da topbar
  kpiCard: "160px",    // Altura dos KPI cards
  chart: "420px",      // Altura dos gráficos
  sidebarItem: "48px"  // Altura dos items da sidebar
}
```

### Exemplos:

```tsx
// ✅ CORRETO
<WorkingLineChart height={420} />
<IcarusKPICard /> // Altura 160px implícita

// ❌ ERRADO
<WorkingLineChart height={300} /> // ❌ Só pode ser 420!
```

---

## REGRAS DE USO

### ✅ **SEMPRE FAZER:**

1. **Usar cor primária Indigo**
   ```tsx
   iconColor="#6366F1"
   ```

2. **Padding de cards = 24px**
   ```tsx
   <NeomorphicCard className="p-6">
   ```

3. **Border radius cards = 16px**
   ```tsx
   className="rounded-[16px]"
   ```

4. **Border radius botões = 10px**
   ```tsx
   className="rounded-[10px]"
   ```

5. **Gap entre seções = 24px**
   ```tsx
   <div className="grid gap-6">
   ```

6. **Altura gráficos = 420px**
   ```tsx
   <WorkingLineChart height={420} />
   ```

7. **Usar cores da paleta**
   ```tsx
   iconColor={IcarusColorPalette.green}
   ```

---

### ❌ **NUNCA FAZER:**

1. **Cores hardcoded arbitrárias**
   ```tsx
   iconColor="#FF5733" // ❌ ERRADO
   ```

2. **Padding customizado em cards**
   ```tsx
   className="p-[20px]" // ❌ ERRADO
   ```

3. **Border radius customizado**
   ```tsx
   className="rounded-[15px]" // ❌ ERRADO
   ```

4. **Altura customizada em gráficos**
   ```tsx
   <WorkingLineChart height={300} /> // ❌ ERRADO
   ```

5. **Gap customizado entre seções**
   ```tsx
   <div className="grid gap-[25px]"> // ❌ ERRADO
   ```

---

## EXEMPLOS PRÁTICOS

### Exemplo 1: Card de KPI

```tsx
<IcarusKPICard
  title="Faturamento Mensal"
  value="R$ 2.847.500"
  icon={DollarSign}
  iconColor="#10B981" // tokens.colors.palette.green
  changeType="positive"
  changeValue="+12.5%"
/>
```

**Tokens aplicados:**
- Color: `#10B981` (green)
- Height: `160px` (implícito)
- Padding: `24px` (implícito)
- Border radius: `16px` (implícito)

---

### Exemplo 2: Gráfico de Linha

```tsx
<WorkingLineChart
  data={vendas}
  height={420} // ⚠️ OBRIGATÓRIO
  lines={[
    {
      dataKey: "vendas",
      stroke: "#10B981", // green
      name: "Vendas"
    },
    {
      dataKey: "meta",
      stroke: "#3B82F6", // blue
      name: "Meta"
    }
  ]}
  xAxisKey="mes"
/>
```

**Tokens aplicados:**
- Height: `420px` ⚠️
- Green: `#10B981`
- Blue: `#3B82F6`

---

### Exemplo 3: Grid de Cards

```tsx
<div className="grid grid-cols-3 gap-6">
  <NeomorphicCard className="p-6 rounded-[16px]">
    <h3>Card 1</h3>
  </NeomorphicCard>
  <NeomorphicCard className="p-6 rounded-[16px]">
    <h3>Card 2</h3>
  </NeomorphicCard>
  <NeomorphicCard className="p-6 rounded-[16px]">
    <h3>Card 3</h3>
  </NeomorphicCard>
</div>
```

**Tokens aplicados:**
- Gap: `24px` (spacing.6)
- Padding: `24px` (spacing.6)
- Border radius: `16px` (borderRadius.md)

---

### Exemplo 4: Botão Primário

```tsx
<Button
  variant="primary"
  size="md"
  className="px-6 py-3 rounded-[10px]"
>
  Salvar Alterações
</Button>
```

**Tokens aplicados:**
- Background: `#6366F1` (primary.indigo)
- Padding H: `24px` (spacing.6)
- Padding V: `12px` (spacing.3)
- Border radius: `10px` (borderRadius.sm)

---

## TABELA DE REFERÊNCIA RÁPIDA

| Elemento | Token | Valor |
|----------|-------|-------|
| **Cor Primária** | `colors.primary.indigo` | `#6366F1` |
| **Sucesso** | `colors.semantic.success` | `#10B981` |
| **Erro** | `colors.semantic.error` | `#EF4444` |
| **Alerta** | `colors.semantic.warning` | `#F59E0B` |
| **Padding Card** | `spacing.6` | `24px` ⭐ |
| **Gap Seções** | `spacing.6` | `24px` ⭐ |
| **Border Card** | `borderRadius.md` | `16px` ⭐ |
| **Border Botão** | `borderRadius.sm` | `10px` ⭐ |
| **Topbar** | `dimensions.topbar.height` | `64px` ⚠️ |
| **KPI** | `dimensions.kpi.height` | `160px` ⚠️ |
| **Chart** | `dimensions.chart.height` | `420px` ⚠️ |

---

## ✅ CHECKLIST DE VALIDAÇÃO

Antes de considerar código completo, verificar:

- [ ] Cores vêm de `design-tokens.json`
- [ ] Padding cards = `p-6` (24px)
- [ ] Border radius cards = `rounded-[16px]`
- [ ] Border radius botões = `rounded-[10px]`
- [ ] Altura gráficos = `420px`
- [ ] Altura KPIs = `160px`
- [ ] Gap entre seções = `gap-6` (24px)
- [ ] Sem cores hardcoded arbitrárias
- [ ] Componentes OraclusX DS usados
- [ ] Sombras neumórficas aplicadas

---

## 📊 ESTATÍSTICAS

```json
{
  "arquivo": "design-tokens.json",
  "tamanho": "~15KB",
  "cores": 17,
  "fontSizes": 9,
  "spacings": 13,
  "borderRadius": 7,
  "shadows": 7,
  "dimensionsFixed": 4,
  "breakpoints": 5,
  "components": 4,
  "rulesTotal": 10,
  "version": "5.0.3",
  "lastUpdated": "2025-11-16"
}
```

---

## 🎯 CONCLUSÃO

**Design Tokens** garantem:

✅ Consistência visual 100%
✅ Facilidade de manutenção
✅ Integração Figma ↔ Code
✅ Documentação clara
✅ Qualidade enterprise

**Sempre consulte `design-tokens.json` antes de gerar código!**

---

**Versão**: 5.0.3
**Data**: 2025-11-16
**Status**: ✅ **COMPLETO**

🎨 **OraclusX Design System - ICARUS v5.0**
