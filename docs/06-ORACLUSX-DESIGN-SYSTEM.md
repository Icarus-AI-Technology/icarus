# 🎨 OraclusX Design System

**Interface Neumórfica Moderna e Acessível**

---

## 📖 Documentação Completa

Este documento é um **resumo executivo**. Para o **guia completo de desenvolvimento**, consulte:

**→ [SKILL: OraclusX Design System](skills/SKILL_ORACLUSX_DS.md)**

---

## 🎯 Visão Geral

OraclusX é o design system do ICARUS, baseado em **Neomorphism** (design neumórfico), que combina:
- Minimalismo
- Profundidade 3D
- Acessibilidade WCAG AA
- Performance

---

## 🎨 Filosofia

### Neumorphism (Neumorfismo)

Interface que simula objetos físicos com:
- **Sombras suaves** (soft shadows)
- **Elevações** (raised/inset)
- **Profundidade 3D** sem exageros
- **Minimalismo** funcional

**Exemplo visual**:
```
┌─────────────────┐
│                 │  ← Fundo claro
│   ╔═════════╗   │
│   ║ Botão   ║   │  ← Sombras suaves
│   ╚═════════╝   │     (superior + inferior)
│                 │
└─────────────────┘
```

---

## 🎨 Paleta de Cores Universal

### Cores Primárias

```css
/* Light Mode */
--primary: #6366F1      /* Indigo - ÚNICA COR DE BOTÕES */
--success: #10B981      /* Verde - Sucesso */
--warning: #F59E0B      /* Laranja - Avisos */
--danger: #EF4444       /* Vermelho - Perigo */
--background: #F9FAFB   /* Cinza claro - Fundo */
--foreground: #1F2937   /* Cinza escuro - Texto */

/* Dark Mode */
--primary: #6366F1      /* Mesmo indigo */
--background: #0F172A   /* Cinza muito escuro */
--foreground: #F3F4F6   /* Cinza muito claro */
```

**Regra de Ouro**: ❌ NUNCA use cores fora desta paleta!

---

## 🧩 Componentes Base

### Button
```tsx
<Button variant="default">Ação Principal</Button>
<Button variant="secondary">Secundária</Button>
<Button variant="destructive">Deletar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Sutil</Button>
```

### Card Neumórfico
```tsx
<Card className="neu-soft">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>
```

### Input (SEMPRE em form-row)
```tsx
<div className="form-row">
  <label htmlFor="nome">Nome *</label>
  <Input id="nome" required />
</div>
```

---

## 📐 Grid Responsivo

**Padrão universal**: 3/2/1 (3 colunas desktop, 2 tablet, 1 mobile)

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Conteúdo responsivo */}
</div>

{/* Para KPIs: 4/2/1 */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 cards desktop, 2 tablet, 1 mobile */}
</div>
```

---

## ♿ Acessibilidade

### Regras Obrigatórias

1. **Labels em inputs**:
```tsx
// ✅ CORRETO
<div className="form-row">
  <label htmlFor="email">Email</label>
  <Input id="email" />
</div>

// ❌ ERRADO
<Input placeholder="Email" />  // Sem label
```

2. **Aria-labels em botões ícone**:
```tsx
// ✅ CORRETO
<Button size="icon" aria-label="Adicionar novo item">
  <PlusIcon />
</Button>

// ❌ ERRADO
<Button size="icon"><PlusIcon /></Button>
```

3. **Contraste adequado**:
- Todas as cores da paleta têm contraste mínimo 4.5:1 ✅
- Automático em light/dark mode ✅

---

## 🌓 Dark Mode

**Classes dinâmicas** que funcionam em ambos os temas:

```tsx
// ✅ CORRETO
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">

// ❌ ERRADO
<div className="bg-white text-black">  // Só light mode
```

---

## 📊 Componentes Disponíveis

**175 componentes** baseados em shadcn/ui:

### Essenciais
- Button, Input, Textarea, Select, Checkbox, Radio
- Card, Dialog, Sheet, Popover, Dropdown
- Table, Tabs, Accordion, Collapsible
- Toast, Alert, Badge, Avatar

### Avançados
- Form, Label, Calendar, Date Picker
- Combobox, Command, Context Menu
- Navigation Menu, Menubar, Toolbar
- Slider, Switch, Toggle, Progress

[📖 Ver lista completa no SKILL →](skills/SKILL_ORACLUSX_DS.md)

---

## ✅ Checklist Desenvolvimento

Antes de commitar, verifique:

- [ ] Usou componentes shadcn/ui (não HTML nativo)?
- [ ] Paleta de cores universal (sem customizações)?
- [ ] Inputs em form-row com label?
- [ ] Grid responsivo 3/2/1?
- [ ] Aria-labels em botões ícone?
- [ ] Testou em dark mode?
- [ ] Testou em mobile (375px)?
- [ ] Navegação por teclado funciona?

---

## 🎓 Como Usar

### 1. Leia o SKILL Completo
**→ [SKILL: OraclusX DS](skills/SKILL_ORACLUSX_DS.md)**

### 2. Estude Exemplos
- Ver módulo referência: `src/components/modules/Cirurgias.tsx`
- Explorar componentes: `src/components/ui/`

### 3. Desenvolva Seguindo Padrões
- Sempre usar componentes shadcn/ui
- Sempre usar paleta universal
- Sempre testar responsividade

### 4. Revise com Checklist
- Antes de commitar, verificar todos os pontos

---

## 📚 Recursos

### Documentação
- **[SKILL: OraclusX DS](skills/SKILL_ORACLUSX_DS.md)** ⭐ (Guia completo)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Radix UI Docs](https://www.radix-ui.com)

### Exemplos
- **Módulo Referência**: `Cirurgias.tsx`
- **Componentes Base**: `/src/components/ui/`
- **Paleta**: `globals.css`

---

**OraclusX Design System** - Interface moderna, acessível e performática 🎨

**Para desenvolvimento**: Consulte sempre o [SKILL completo](skills/SKILL_ORACLUSX_DS.md)
