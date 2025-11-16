# 🎨 OraclusX Design System - ICARUS v5.0

## 📐 Filosofia

O **OraclusX Design System** é baseado no conceito **neumórfico** (ou soft UI), que cria uma sensação de profundidade e tridimensionalidade através de sombras sutis, gradientes e bordas delicadas.

### Princípios

1. **Profundidade**: Elementos parecem flutuar ou afundar na interface
2. **Suavidade**: Transições e animações suaves
3. **Elegância**: Design minimalista e sofisticado
4. **Contraste**: Alto contraste para legibilidade
5. **Consistência**: Padrões uniformes em todo o sistema

---

## 🎨 Paleta de Cores

### Backgrounds

```css
--bg-primary: #0f1419        /* Fundo principal - escuro profundo */
--bg-secondary: #1a1f26      /* Cartões e elevações */
--bg-tertiary: #232930       /* Elementos internos */
```

```tsx
// Uso em componentes
<div className="bg-[#0f1419]">       {/* Primary */}
<div className="bg-[#1a1f26]">       {/* Secondary */}
<div className="bg-[#232930]">       {/* Tertiary */}
```

### Sombras Neumórficas

```css
--shadow-light: rgba(255,255,255,0.03)  /* Luz superior esquerda */
--shadow-dark: rgba(0,0,0,0.5)          /* Sombra inferior direita */
```

```tsx
// Sombra externa (elevado)
className="shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]"

// Sombra interna (pressionado)
className="shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]"
```

### Cores de Destaque (Accent)

```css
--accent-primary: #3b82f6    /* Azul - ações principais */
--accent-success: #10b981    /* Verde - sucesso */
--accent-warning: #f59e0b    /* Amarelo - avisos */
--accent-danger: #ef4444     /* Vermelho - erros */
--accent-info: #06b6d4       /* Ciano - informações */
```

```tsx
// Tailwind equivalentes
<div className="bg-blue-500">      {/* Primary */}
<div className="bg-green-500">     {/* Success */}
<div className="bg-yellow-500">    {/* Warning */}
<div className="bg-red-500">       {/* Danger */}
<div className="bg-cyan-500">      {/* Info */}
```

### Texto

```css
--text-primary: #f3f4f6      /* Texto principal - branco acinzentado */
--text-secondary: #9ca3af    /* Texto secundário - cinza médio */
--text-muted: #6b7280        /* Texto desabilitado - cinza escuro */
```

```tsx
<p className="text-gray-100">     {/* Primary */}
<p className="text-gray-400">     {/* Secondary */}
<p className="text-gray-500">     {/* Muted */}
```

### Bordas

```css
--border-primary: rgba(255,255,255,0.1)   /* Borda padrão */
--border-focus: rgba(59,130,246,0.5)      /* Borda em foco */
```

```tsx
<div className="border border-white/10">           {/* Primary */}
<div className="border-blue-500/50">               {/* Focus */}
```

---

## 🧩 Componentes Base

### Input (Texto, Email, Número, etc)

```tsx
<input
  type="text"
  placeholder="Digite aqui..."
  className="
    /* Background e layout */
    bg-gray-900/50 backdrop-blur-sm
    w-full px-4 py-3 rounded-xl

    /* Borda */
    border border-white/10

    /* Texto */
    text-gray-100 placeholder-gray-500

    /* Sombra neumórfica interna */
    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]

    /* Estados */
    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
    disabled:opacity-50 disabled:cursor-not-allowed

    /* Transição */
    transition-all duration-200
  "
/>
```

#### Variações

**Input com erro:**
```tsx
className="
  bg-gray-900/50 backdrop-blur-sm
  border border-red-500/50
  focus:border-red-500 focus:ring-2 focus:ring-red-500/20
  /* resto igual */
"
```

**Input com sucesso:**
```tsx
className="
  bg-gray-900/50 backdrop-blur-sm
  border border-green-500/50
  focus:border-green-500 focus:ring-2 focus:ring-green-500/20
  /* resto igual */
"
```

---

### Select

```tsx
<select
  className="
    bg-gray-900/50 backdrop-blur-sm
    w-full px-4 py-3 rounded-xl
    border border-white/10
    text-gray-100
    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
    transition-all duration-200
    cursor-pointer
  "
>
  <option value="">Selecione...</option>
  <option value="1">Opção 1</option>
</select>
```

---

### Textarea

```tsx
<textarea
  rows={4}
  placeholder="Digite aqui..."
  className="
    bg-gray-900/50 backdrop-blur-sm
    w-full px-4 py-3 rounded-xl
    border border-white/10
    text-gray-100 placeholder-gray-500
    shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
    focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
    resize-none
    transition-all duration-200
  "
/>
```

---

### Button

#### Primary (Ação Principal)

```tsx
<button
  className="
    /* Background gradiente */
    bg-gradient-to-br from-blue-500 to-blue-600

    /* Layout */
    px-6 py-3 rounded-xl

    /* Borda */
    border border-blue-400/20

    /* Texto */
    text-white font-medium

    /* Sombra elevada */
    shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]

    /* Hover - sombra interna */
    hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]

    /* Active - escala */
    active:scale-95

    /* Disabled */
    disabled:opacity-50 disabled:cursor-not-allowed

    /* Transição */
    transition-all duration-200
  "
>
  Salvar
</button>
```

#### Secondary (Ação Secundária)

```tsx
<button
  className="
    bg-gradient-to-br from-gray-800 to-gray-900
    px-6 py-3 rounded-xl
    border border-white/10
    text-gray-100 font-medium
    shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
    hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]
    active:scale-95
    transition-all duration-200
  "
>
  Cancelar
</button>
```

#### Danger (Ação Destrutiva)

```tsx
<button
  className="
    bg-gradient-to-br from-red-500 to-red-600
    px-6 py-3 rounded-xl
    border border-red-400/20
    text-white font-medium
    shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(239,68,68,0.1)]
    hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
    active:scale-95
    transition-all duration-200
  "
>
  Excluir
</button>
```

#### Icon Button

```tsx
<button
  className="
    bg-gradient-to-br from-gray-800 to-gray-900
    p-3 rounded-xl
    border border-white/10
    text-gray-100
    shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
    hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]
    active:scale-95
    transition-all duration-200
  "
  aria-label="Editar"
>
  <Edit className="w-5 h-5" />
</button>
```

---

### Card

#### Card Padrão

```tsx
<div
  className="
    /* Background gradiente */
    bg-gradient-to-br from-gray-900/90 to-gray-800/90
    backdrop-blur-sm

    /* Layout */
    p-6 rounded-2xl

    /* Borda */
    border border-white/10

    /* Sombra elevada */
    shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
  "
>
  {/* Conteúdo */}
</div>
```

#### KPI Card

```tsx
<div
  className="
    bg-gradient-to-br from-gray-900/90 to-gray-800/90
    backdrop-blur-sm
    p-6 rounded-2xl
    border border-white/10
    shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
    hover:border-blue-500/30
    transition-all duration-200
  "
>
  <div className="flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm">Total de Vendas</p>
      <p className="text-2xl font-bold text-gray-100 mt-2">R$ 125.400</p>
    </div>
    <div className="p-3 bg-blue-500/10 rounded-xl">
      <TrendingUp className="w-6 h-6 text-blue-400" />
    </div>
  </div>

  {/* Variação */}
  <div className="flex items-center gap-1 mt-4 text-sm">
    <ArrowUp className="w-4 h-4 text-green-400" />
    <span className="text-green-400">12.5%</span>
    <span className="text-gray-500">vs mês anterior</span>
  </div>
</div>
```

---

### Badge

```tsx
{/* Success */}
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-lg
  bg-green-500/10 border border-green-500/20
  text-green-400 text-xs font-medium
">
  Ativo
</span>

{/* Warning */}
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-lg
  bg-yellow-500/10 border border-yellow-500/20
  text-yellow-400 text-xs font-medium
">
  Pendente
</span>

{/* Danger */}
<span className="
  inline-flex items-center gap-1
  px-3 py-1 rounded-lg
  bg-red-500/10 border border-red-500/20
  text-red-400 text-xs font-medium
">
  Inativo
</span>
```

---

### Table

```tsx
<div className="overflow-x-auto">
  <table className="w-full">
    {/* Header */}
    <thead className="bg-gray-800/50 border-b border-white/10">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
          Nome
        </th>
        <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">
          Status
        </th>
        <th className="px-4 py-3 text-right text-sm font-medium text-gray-400">
          Ações
        </th>
      </tr>
    </thead>

    {/* Body */}
    <tbody className="divide-y divide-white/5">
      <tr className="hover:bg-white/5 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-300">
          Produto A
        </td>
        <td className="px-4 py-3">
          <span className="px-3 py-1 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs">
            Ativo
          </span>
        </td>
        <td className="px-4 py-3 text-right">
          <button className="text-blue-400 hover:text-blue-300">
            Editar
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

### Modal

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

  {/* Modal */}
  <div className="
    relative z-10
    bg-gradient-to-br from-gray-900 to-gray-800
    border border-white/10
    rounded-2xl
    shadow-[0_20px_60px_rgba(0,0,0,0.8)]
    max-w-md w-full
    p-6
  ">
    {/* Header */}
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-bold text-gray-100">
        Título do Modal
      </h2>
      <button
        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        aria-label="Fechar"
      >
        <X className="w-5 h-5 text-gray-400" />
      </button>
    </div>

    {/* Content */}
    <div className="mb-6">
      <p className="text-gray-300">Conteúdo do modal...</p>
    </div>

    {/* Actions */}
    <div className="flex justify-end gap-3">
      <button className="px-4 py-2 rounded-xl bg-gray-800 border border-white/10 text-gray-100">
        Cancelar
      </button>
      <button className="px-4 py-2 rounded-xl bg-blue-500 border border-blue-400/20 text-white">
        Confirmar
      </button>
    </div>
  </div>
</div>
```

---

## 📐 Layouts Padrão

### Page Layout (Estrutura Completa)

```tsx
<div className="min-h-screen bg-[#0f1419] p-6">
  <div className="max-w-7xl mx-auto space-y-6">

    {/* Header */}
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Título da Página</h1>
        <p className="text-gray-400 mt-1">Descrição da página</p>
      </div>
      <button className="px-6 py-3 rounded-xl bg-blue-500 text-white">
        Nova Ação
      </button>
    </div>

    {/* KPIs Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI Cards aqui */}
    </div>

    {/* Main Content */}
    <div className="
      bg-gradient-to-br from-gray-900/90 to-gray-800/90
      backdrop-blur-sm
      border border-white/10
      rounded-2xl p-6
      shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
    ">
      {/* Conteúdo principal */}
    </div>

  </div>
</div>
```

### Form Layout

```tsx
<form className="space-y-6">
  {/* Grid 2 colunas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Nome
      </label>
      <input type="text" className="..." />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Email
      </label>
      <input type="email" className="..." />
    </div>
  </div>

  {/* Campo full width */}
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Descrição
    </label>
    <textarea rows={4} className="..." />
  </div>

  {/* Actions */}
  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
    <button type="button" className="...">Cancelar</button>
    <button type="submit" className="...">Salvar</button>
  </div>
</form>
```

### List Layout (Tabs + Filters + Table)

```tsx
<div className="space-y-6">
  {/* Tabs */}
  <div className="flex gap-2 border-b border-white/10">
    <button className="px-4 py-2 text-blue-400 border-b-2 border-blue-400">
      Todos
    </button>
    <button className="px-4 py-2 text-gray-400 hover:text-gray-300">
      Ativos
    </button>
    <button className="px-4 py-2 text-gray-400 hover:text-gray-300">
      Inativos
    </button>
  </div>

  {/* Filters */}
  <div className="flex gap-4">
    <input
      type="search"
      placeholder="Buscar..."
      className="flex-1 ..."
    />
    <select className="...">
      <option>Filtrar por...</option>
    </select>
  </div>

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full">
      {/* ... */}
    </table>
  </div>

  {/* Pagination */}
  <div className="flex items-center justify-between">
    <p className="text-sm text-gray-400">
      Mostrando 1-10 de 100
    </p>
    <div className="flex gap-2">
      <button className="p-2 rounded-lg bg-gray-800 border border-white/10">
        Anterior
      </button>
      <button className="p-2 rounded-lg bg-gray-800 border border-white/10">
        Próxima
      </button>
    </div>
  </div>
</div>
```

---

## ✅ Regras de Uso

1. **SEMPRE** use as classes fornecidas (copie e cole)
2. **NUNCA** invente novas cores fora da paleta
3. **SEMPRE** use sombras neumórficas nos componentes interativos
4. **SEMPRE** inclua estados hover, focus, active, disabled
5. **SEMPRE** use transições suaves (transition-all duration-200)
6. **SEMPRE** mantenha bordas arredondadas (rounded-xl ou rounded-2xl)
7. **SEMPRE** use backdrop-blur-sm em cards
8. **SEMPRE** verifique contraste de texto (WCAG 2.1 AA mínimo)

---

## 📚 Exemplos Completos

Ver arquivo `SKILL_CRIAR_MODULOS.md` para exemplos de módulos completos usando OraclusX DS.

---

**Versão**: 1.0.0
**Data**: 2025-11-15
**Status**: ✅ Design System ativo

🎨 **Use este guia como referência única para UI no ICARUS!**
