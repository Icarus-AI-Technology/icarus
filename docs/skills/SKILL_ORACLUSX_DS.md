# 🎨 SKILL: OraclusX Design System

Guia prático para desenvolver UI seguindo o OraclusX Design System.

---

## 🎯 Objetivo

Garantir **100% de consistência visual** em todo o ICARUS usando:
- Componentes shadcn/ui (nunca HTML nativo)
- Paleta de cores universal
- Grid responsivo 3/2/1
- Acessibilidade WCAG AA

---

## ✅ Regras Obrigatórias

### 1. SEMPRE Use Componentes shadcn/ui

```tsx
// ❌ NUNCA FAÇA ISSO
<input type="text" placeholder="Nome" />
<button onClick={handleClick}>Salvar</button>
<select><option>Opção</option></select>

// ✅ SEMPRE FAÇA ISSO
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

<Input placeholder="Nome" />
<Button onClick={handleClick}>Salvar</Button>
<Select>...</Select>
```

### 2. Paleta Universal (ÚNICA Permitida)

```css
/* Light Mode */
--primary: #6366F1      /* Indigo - COR PRINCIPAL */
--success: #10B981      /* Verde - Sucesso */
--warning: #F59E0B      /* Laranja - Avisos */
--danger: #EF4444       /* Vermelho - Perigo */
--background: #F9FAFB   /* Fundo */
--foreground: #1F2937   /* Texto */

/* Dark Mode - mesmas vars, valores diferentes */
```

```tsx
// ✅ CORRETO
<div className="bg-primary text-white">
<div className="text-success">
<div className="border-warning">
<Button variant="destructive">  {/* danger */}

// ❌ ERRADO
<div className="bg-blue-500">  {/* Cor fora da paleta */}
<div style={{ color: '#FF0000' }}>  {/* Inline style */}
```

### 3. Grid Responsivo 3/2/1

```tsx
// ✅ PADRÃO para conteúdo geral
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 3 colunas desktop, 2 tablet, 1 mobile */}
</div>

// ✅ Para KPIs (4 cards)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 colunas desktop, 2 tablet, 1 mobile */}
</div>

// ❌ ERRADO - grid fixo
<div className="grid grid-cols-3">
  {/* Quebra em mobile */}
</div>
```

---

## 📦 Componentes Base

### Button

```tsx
import { Button } from '@/components/ui/button'

// Variantes
<Button variant="default">Ação Principal</Button>      // Indigo (#6366F1)
<Button variant="secondary">Ação Secundária</Button>   // Cinza
<Button variant="destructive">Deletar</Button>         // Vermelho
<Button variant="outline">Cancelar</Button>            // Borda
<Button variant="ghost">Sutil</Button>                 // Transparente
<Button variant="link">Link</Button>                   // Como link

// Tamanhos
<Button size="sm">Pequeno</Button>
<Button size="default">Padrão</Button>
<Button size="lg">Grande</Button>
<Button size="icon"><PlusIcon /></Button>  // Ícone apenas

// ⚠️ IMPORTANTE: Botões ícone precisam aria-label
<Button size="icon" aria-label="Adicionar novo item">
  <PlusIcon />
</Button>
```

### Input

```tsx
import { Input } from '@/components/ui/input'

// ✅ SEMPRE em form-row com label
<div className="form-row">
  <label htmlFor="nome">Nome *</label>
  <Input id="nome" required />
</div>

<div className="form-row">
  <label htmlFor="email">Email</label>
  <Input id="email" type="email" placeholder="exemplo@email.com" />
</div>

// ❌ NUNCA sem label
<Input placeholder="Nome" />  // Ruim para acessibilidade
```

### Card (Neumórfico)

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

// ✅ Card padrão neumórfico
<Card className="neu-soft">
  <CardHeader>
    <CardTitle>Título do Card</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Conteúdo aqui</p>
  </CardContent>
  <CardFooter>
    <Button>Ação</Button>
  </CardFooter>
</Card>

// Card com maior profundidade
<Card className="neu-card">
  {/* Sombras mais pronunciadas */}
</Card>
```

### Dialog

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'

// ✅ SEMPRE use Dialog (NUNCA alert/confirm)
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
      <DialogDescription>Descrição opcional</DialogDescription>
    </DialogHeader>
    {/* Conteúdo do dialog */}
    <div className="space-y-4">
      <div className="form-row">
        <label>Nome</label>
        <Input />
      </div>
    </div>
    <div className="flex justify-end gap-2 mt-4">
      <Button variant="outline">Cancelar</Button>
      <Button>Salvar</Button>
    </div>
  </DialogContent>
</Dialog>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

// Padrão de módulos
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="lista">Lista</TabsTrigger>
    <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
    <TabsTrigger value="ia">IA</TabsTrigger>
  </TabsList>

  <TabsContent value="overview">
    {/* Gráficos, dashboard */}
  </TabsContent>

  <TabsContent value="lista">
    {/* Tabela, CRUD */}
  </TabsContent>

  <TabsContent value="relatorios">
    {/* Relatórios */}
  </TabsContent>

  <TabsContent value="ia">
    {/* Serviços IA */}
  </TabsContent>
</Tabs>
```

### Table

```tsx
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nome</TableHead>
      <TableHead>Email</TableHead>
      <TableHead className="text-right">Ações</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.nome}</TableCell>
        <TableCell>{item.email}</TableCell>
        <TableCell className="text-right">
          <Button size="sm" variant="ghost">Editar</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Select

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

<div className="form-row">
  <label>Categoria</label>
  <Select onValueChange={setValue}>
    <SelectTrigger>
      <SelectValue placeholder="Selecione..." />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="categoria1">Categoria 1</SelectItem>
      <SelectItem value="categoria2">Categoria 2</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 🎨 Classes Utilitárias Custom

### Neumorfismo

```tsx
// Cards neumórficos
<Card className="neu-soft">     // Sombras suaves (padrão)
<Card className="neu-card">     // Sombras pronunciadas
<Card className="neu-inset">    // Sombra interna (pressionado)

// Botões neumórficos (automático em Button)
<Button>  // Já vem com efeito neumórfico
```

### Spacing

```tsx
// Form rows (padrão)
<div className="form-row">
  {/* Label + Input com spacing correto */}
</div>

// Spacing responsivo
<div className="space-y-4">           // Vertical spacing
<div className="space-x-4">           // Horizontal spacing
<div className="grid gap-4">          // Grid spacing

// Padding responsivo
<div className="p-4 md:p-6 lg:p-8">  // Aumenta com tela
```

### Typography

```tsx
// Headings
<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
<h2 className="text-xl md:text-2xl font-semibold">
<h3 className="text-lg font-medium">

// Body text
<p className="text-sm md:text-base">  // Responsivo
<p className="text-gray-600 dark:text-gray-400">  // Cor dinâmica
```

---

## 📱 Responsividade

### Breakpoints

```typescript
{
  sm: '640px',   // Tablet pequeno
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Desktop grande
  '2xl': '1536px'  // Ultra-wide
}
```

### Padrões Responsivos

```tsx
// Layout
<div className="
  flex flex-col md:flex-row  // Coluna mobile, linha desktop
  gap-4 md:gap-6 lg:gap-8   // Spacing progressivo
">

// Width
<div className="
  w-full md:w-1/2 lg:w-1/3  // 100% mobile, 50% tablet, 33% desktop
">

// Padding
<div className="
  p-4 md:p-6 lg:p-8         // Aumenta com tela
">

// Visibility
<div className="
  hidden md:block            // Só visível em desktop
">
<div className="
  block md:hidden            // Só visível em mobile
">
```

---

## 🌓 Dark Mode

### Classes Dinâmicas

```tsx
// ✅ CORRETO - funciona em ambos os temas
<div className="bg-background text-foreground">
<div className="bg-card text-card-foreground">
<div className="border-border">

// ✅ Conditional manual
<div className="bg-white dark:bg-gray-900">
<p className="text-gray-900 dark:text-white">

// ❌ ERRADO - só light mode
<div className="bg-white text-black">
```

### Theme Provider

```tsx
// Já configurado em src/main.tsx
import { ThemeProvider } from '@/components/theme-provider'

<ThemeProvider defaultTheme="system" storageKey="icarus-theme">
  <App />
</ThemeProvider>
```

---

## ♿ Acessibilidade

### Regras WCAG AA

```tsx
// 1. Labels em inputs
<div className="form-row">
  <label htmlFor="nome">Nome</label>
  <Input id="nome" />
</div>

// 2. Aria-labels em botões ícone
<Button size="icon" aria-label="Adicionar">
  <PlusIcon />
</Button>

// 3. Alt em imagens
<img src="..." alt="Descrição clara" />

// 4. Contraste adequado (automático nas cores da paleta)
// Todas as cores têm contraste mínimo 4.5:1

// 5. Keyboard navigation (automático em shadcn/ui)
// Todos os componentes são navegáveis por teclado
```

---

## 🧩 Exemplo Completo: Form de Criação

```tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

export function CriarProdutoDialog() {
  const [nome, setNome] = useState('')
  const [categoria, setCategoria] = useState('')
  const [preco, setPreco] = useState('')
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      // Salvar no Supabase
      const { error } = await supabase
        .from('produtos')
        .insert({ nome, categoria, preco: parseFloat(preco) })

      if (error) throw error

      toast({
        title: 'Produto criado!',
        description: `${nome} foi adicionado com sucesso.`,
      })

      setOpen(false)
    } catch (err) {
      toast({
        title: 'Erro',
        description: err.message,
        variant: 'destructive',
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Adicionar Produto</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Produto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-row">
            <label htmlFor="nome">Nome *</label>
            <Input
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          </div>

          <div className="form-row">
            <label>Categoria *</label>
            <Select value={categoria} onValueChange={setCategoria} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="protese">Prótese</SelectItem>
                <SelectItem value="ortese">Órtese</SelectItem>
                <SelectItem value="material">Material</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="form-row">
            <label htmlFor="preco">Preço (R$) *</label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

---

## ✅ Checklist Pré-Review

Antes de commitar, verifique:

- [ ] Usou componentes shadcn/ui (não HTML nativo)?
- [ ] Paleta de cores universal (sem cores customizadas)?
- [ ] Inputs em form-row com label?
- [ ] Grid responsivo 3/2/1?
- [ ] Aria-labels em botões ícone?
- [ ] Testou em dark mode?
- [ ] Testou em mobile (375px)?
- [ ] Testou em tablet (768px)?
- [ ] Testou em desktop (1920px)?
- [ ] Navegação por teclado funciona?
- [ ] Contraste adequado (WCAG AA)?

---

**✅ Seguindo este guia, 100% de consistência visual garantida!**
