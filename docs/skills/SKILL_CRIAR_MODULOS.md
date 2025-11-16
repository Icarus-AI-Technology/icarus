# 📦 SKILL: Criar Módulos ICARUS

Guia completo para criar novos módulos seguindo o padrão ICARUS.

---

## 🎯 Estrutura Obrigatória

Todos os 58 módulos seguem **exatamente** esta estrutura:

```tsx
export function NomeModulo() {
  return (
    <div className="p-6">
      {/* 1. KPIs (4-5 cards neumórficos) */}
      {/* 2. Tabs (Overview, Lista, Relatórios, IA) */}
    </div>
  )
}
```

---

## 📋 Template Completo

Use como base para qualquer novo módulo:

```tsx
// src/components/modules/NomeModulo.tsx
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { TrendingUp, TrendingDown } from 'lucide-react'

export function NomeModulo() {
  // State
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // KPIs (buscar do Supabase ou calcular)
  const kpis = {
    total: 142,
    variacao: 12.5,
    ativo: 120,
    inativo: 22,
  }

  return (
    <div className="p-6">
      {/* ===== SEÇÃO 1: KPIs (4-5 cards) ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI 1 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total de Itens</p>
            <p className="text-2xl font-bold">{kpis.total}</p>
            <p className={`text-xs flex items-center gap-1 ${
              kpis.variacao > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {kpis.variacao > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(kpis.variacao)}%
            </p>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Ativos</p>
            <p className="text-2xl font-bold text-green-600">{kpis.ativo}</p>
            <p className="text-xs text-gray-500">
              {((kpis.ativo / kpis.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Inativos</p>
            <p className="text-2xl font-bold text-red-600">{kpis.inativo}</p>
            <p className="text-xs text-gray-500">
              {((kpis.inativo / kpis.total) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="neu-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">Métrica Custom</p>
            <p className="text-2xl font-bold">R$ 125k</p>
            <p className="text-xs text-green-600">↑ 18.2%</p>
          </CardContent>
        </Card>
      </div>

      {/* ===== SEÇÃO 2: Tabs ===== */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        {/* ===== TAB 1: Overview ===== */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Gráfico */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
                {/* Aqui: Gráfico (Recharts, Chart.js, etc) */}
                <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                  <p className="text-gray-500">Gráfico aqui</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Resumo */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Resumo Rápido</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Processado</span>
                    <span className="font-semibold">R$ 1.2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ticket Médio</span>
                    <span className="font-semibold">R$ 8.5k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxa Conversão</span>
                    <span className="font-semibold">24.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 2: Lista (CRUD) ===== */}
        <TabsContent value="lista">
          <Card className="neu-soft">
            <CardContent className="pt-6">
              {/* Toolbar */}
              <div className="flex justify-between items-center mb-4">
                <Input
                  placeholder="Buscar..."
                  className="max-w-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Dialog de criação */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Adicionar</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Novo Item</DialogTitle>
                    </DialogHeader>
                    {/* Form aqui */}
                    <div className="space-y-4">
                      <div className="form-row">
                        <label htmlFor="nome">Nome *</label>
                        <Input id="nome" required />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline">Cancelar</Button>
                        <Button>Salvar</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabela */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500">
                        Nenhum item encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.nome}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.ativo
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {item.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost">Editar</Button>
                          <Button size="sm" variant="ghost">Ver</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== TAB 3: Relatórios ===== */}
        <TabsContent value="relatorios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relatório 1 */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Relatório Mensal</h3>
                <p className="text-gray-600 mb-4">Consolidado do mês atual</p>
                <Button variant="outline" className="w-full">
                  Gerar PDF
                </Button>
              </CardContent>
            </Card>

            {/* Relatório 2 */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Relatório Anual</h3>
                <p className="text-gray-600 mb-4">Consolidado do ano</p>
                <Button variant="outline" className="w-full">
                  Gerar Excel
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== TAB 4: IA ===== */}
        <TabsContent value="ia">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Serviço IA 1 */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">🔮 Previsão de Demanda</h3>
                <p className="text-gray-600 mb-4">Próximos 30 dias</p>
                <Button className="w-full">Executar Previsão</Button>
              </CardContent>
            </Card>

            {/* Serviço IA 2 */}
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">💬 Chat Assistente</h3>
                <p className="text-gray-600 mb-4">Pergunte sobre seus dados</p>
                <div className="form-row">
                  <Input placeholder="Ex: Qual o item mais vendido?" />
                </div>
                <Button className="w-full mt-2">Perguntar</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

---

## 🔗 Integração com Supabase

### Buscar Dados

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export function NomeModulo() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)

      const { data, error } = await supabase
        .from('nome_tabela')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro:', error)
        toast.error('Erro ao carregar dados')
      } else {
        setData(data)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6">Carregando...</div>
  }

  // ... resto do componente
}
```

### Criar Item

```tsx
async function handleCreate(formData) {
  const { data, error } = await supabase
    .from('nome_tabela')
    .insert(formData)
    .select()
    .single()

  if (error) {
    toast.error('Erro ao criar item')
    return
  }

  toast.success('Item criado com sucesso!')
  setData([...data, data])
}
```

### Atualizar Item

```tsx
async function handleUpdate(id, updates) {
  const { error } = await supabase
    .from('nome_tabela')
    .update(updates)
    .eq('id', id)

  if (error) {
    toast.error('Erro ao atualizar item')
    return
  }

  toast.success('Item atualizado!')
  // Refetch data
}
```

### Deletar Item

```tsx
async function handleDelete(id) {
  const { error } = await supabase
    .from('nome_tabela')
    .delete()
    .eq('id', id)

  if (error) {
    toast.error('Erro ao deletar item')
    return
  }

  toast.success('Item deletado!')
  setData(data.filter(item => item.id !== id))
}
```

---

## 🧠 Integração com IA

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

export function NomeModulo() {
  const { predict, chat } = useIcarusBrain()
  const [forecast, setForecast] = useState(null)

  async function handlePrevisao() {
    setLoading(true)

    try {
      const result = await predict('demanda', {
        categoria: 'produtos',
        dias: 30
      })

      setForecast(result)
      toast.success('Previsão gerada!')
    } catch (err) {
      toast.error('Erro na previsão')
    } finally {
      setLoading(false)
    }
  }

  // ... rest
}
```

---

## ✅ Checklist de Criação

Ao criar um novo módulo, verifique:

- [ ] Nome do arquivo é PascalCase (ex: `NomeModulo.tsx`)
- [ ] Tem 4-5 KPIs no topo
- [ ] Usa grid responsivo 3/2/1 ou 4/2/1
- [ ] Tem 4 tabs (Overview, Lista, Relatórios, IA)
- [ ] Tab Overview tem gráficos/dashboard
- [ ] Tab Lista tem tabela + CRUD com Dialog
- [ ] Tab Relatórios tem cards de exportação
- [ ] Tab IA tem serviços IcarusBrain
- [ ] Todos os componentes são shadcn/ui
- [ ] Usa paleta de cores universal
- [ ] Tratamento de erros Supabase
- [ ] Loading states
- [ ] Toast notifications
- [ ] Responsivo (mobile/tablet/desktop)
- [ ] Dark mode funciona
- [ ] Acessibilidade (labels, aria-labels)

---

**✅ Seguindo este template, módulos consistentes garantidos!**
