import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  DollarSign, TrendingUp, Percent, FileSpreadsheet, Plus,
  Search, Download, Eye, Edit, Trash2, Copy
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type PriceTableType = 'hospital' | 'convenio' | 'particular' | 'licitacao'
type PriceTableStatus = 'active' | 'inactive' | 'pending' | 'expired'

interface PriceTable {
  id: string
  code: string
  name: string
  type: PriceTableType
  status: PriceTableStatus
  customer_id?: string
  customer_name?: string
  valid_from: string
  valid_until?: string
  markup: number
  discount: number
  items_count: number
  created_at: string
  updated_at: string
}


const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

export function TabelaPrecos() {

  // State
  const [loading, setLoading] = useState(true)
  const [priceTables, setPriceTables] = useState<PriceTable[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Load data
  useEffect(() => {
    loadPriceTables()
  }, [])

  async function loadPriceTables() {
    setLoading(true)

    try {
      // Simulate API call - replace with real Supabase query
      const mockData: PriceTable[] = [
        {
          id: '1',
          code: 'TAB-001',
          name: 'Hospital Sírio-Libanês',
          type: 'hospital',
          status: 'active',
          customer_id: 'cust-001',
          customer_name: 'Hospital Sírio-Libanês',
          valid_from: '2024-01-01',
          valid_until: '2024-12-31',
          markup: 35,
          discount: 5,
          items_count: 245,
          created_at: '2024-01-01',
          updated_at: '2024-01-15'
        },
        {
          id: '2',
          code: 'TAB-002',
          name: 'Convênio Unimed',
          type: 'convenio',
          status: 'active',
          customer_id: 'cust-002',
          customer_name: 'Unimed',
          valid_from: '2024-01-01',
          valid_until: '2024-06-30',
          markup: 25,
          discount: 10,
          items_count: 189,
          created_at: '2024-01-01',
          updated_at: '2024-01-10'
        },
        {
          id: '3',
          code: 'TAB-003',
          name: 'Tabela Particular Padrão',
          type: 'particular',
          status: 'active',
          valid_from: '2024-01-01',
          markup: 45,
          discount: 0,
          items_count: 312,
          created_at: '2024-01-01',
          updated_at: '2024-01-20'
        },
        {
          id: '4',
          code: 'TAB-004',
          name: 'Licitação SUS SP 2024',
          type: 'licitacao',
          status: 'pending',
          valid_from: '2024-03-01',
          valid_until: '2025-02-28',
          markup: 15,
          discount: 20,
          items_count: 156,
          created_at: '2024-02-01',
          updated_at: '2024-02-10'
        },
        {
          id: '5',
          code: 'TAB-005',
          name: 'Hospital Albert Einstein',
          type: 'hospital',
          status: 'active',
          customer_id: 'cust-003',
          customer_name: 'Hospital Albert Einstein',
          valid_from: '2024-01-01',
          valid_until: '2024-12-31',
          markup: 40,
          discount: 3,
          items_count: 278,
          created_at: '2024-01-01',
          updated_at: '2024-01-12'
        }
      ]

      setPriceTables(mockData)
    } catch (error) {
      console.error('Erro ao carregar tabelas de preço:', error)
      toast.error('Erro ao carregar tabelas de preço')
    } finally {
      setLoading(false)
    }
  }

  // Filtered tables
  const filteredTables = useMemo(() => {
    return priceTables.filter(table => {
      const matchesSearch = table.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                           table.code.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesType = filterType === 'all' || table.type === filterType
      const matchesStatus = filterStatus === 'all' || table.status === filterStatus

      return matchesSearch && matchesType && matchesStatus
    })
  }, [priceTables, debouncedSearch, filterType, filterStatus])

  // KPIs
  const totalTables = priceTables.length
  const activeTables = priceTables.filter(t => t.status === 'active').length
  const avgMarkup = priceTables.reduce((sum, t) => sum + t.markup, 0) / totalTables || 0
  const totalItems = priceTables.reduce((sum, t) => sum + t.items_count, 0)

  // Charts data
  const tablesByType = [
    { name: 'Hospital', value: priceTables.filter(t => t.type === 'hospital').length },
    { name: 'Convênio', value: priceTables.filter(t => t.type === 'convenio').length },
    { name: 'Particular', value: priceTables.filter(t => t.type === 'particular').length },
    { name: 'Licitação', value: priceTables.filter(t => t.type === 'licitacao').length },
  ]

  const markupByType = [
    {
      type: 'Hospital',
      markup: priceTables.filter(t => t.type === 'hospital')
        .reduce((sum, t) => sum + t.markup, 0) / priceTables.filter(t => t.type === 'hospital').length || 0
    },
    {
      type: 'Convênio',
      markup: priceTables.filter(t => t.type === 'convenio')
        .reduce((sum, t) => sum + t.markup, 0) / priceTables.filter(t => t.type === 'convenio').length || 0
    },
    {
      type: 'Particular',
      markup: priceTables.filter(t => t.type === 'particular')
        .reduce((sum, t) => sum + t.markup, 0) / priceTables.filter(t => t.type === 'particular').length || 0
    },
    {
      type: 'Licitação',
      markup: priceTables.filter(t => t.type === 'licitacao')
        .reduce((sum, t) => sum + t.markup, 0) / priceTables.filter(t => t.type === 'licitacao').length || 0
    }
  ]

  // Helper functions
  const getTypeLabel = (type: PriceTableType) => {
    const labels = {
      hospital: 'Hospital',
      convenio: 'Convênio',
      particular: 'Particular',
      licitacao: 'Licitação'
    }
    return labels[type]
  }

  const getStatusBadge = (status: PriceTableStatus) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning',
      expired: 'destructive'
    } as const

    const labels = {
      active: 'Ativa',
      inactive: 'Inativa',
      pending: 'Pendente',
      expired: 'Expirada'
    }

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    )
  }

  if (loading) {
    return <ModuleLoadingSkeleton />
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            Tabela de Preços
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de tabelas de preços para hospitais, convênios e licitações
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Tabela
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tabelas</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTables}</div>
            <p className="text-xs text-muted-foreground">
              {activeTables} ativas
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Markup Médio</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgMarkup.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Média geral
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Produtos Precificados</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">
              Total de itens
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87.5%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="tables">Tabelas</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Distribuição por Tipo */}
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tablesByType}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {tablesByType.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Markup por Tipo */}
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Markup Médio por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={markupByType}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    <Bar dataKey="markup" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tables Tab */}
        <TabsContent value="tables" className="space-y-4">
          {/* Filters */}
          <Card className="neu-soft">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar tabela..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="hospital">Hospital</SelectItem>
                    <SelectItem value="convenio">Convênio</SelectItem>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="licitacao">Licitação</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="expired">Expirada</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Price Tables List */}
          <div className="grid gap-4">
            {filteredTables.map((table) => (
              <Card key={table.id} className="neu-soft hover:neu-hard transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{table.name}</h3>
                        <Badge variant="outline">{table.code}</Badge>
                        {getStatusBadge(table.status)}
                        <Badge>{getTypeLabel(table.type)}</Badge>
                      </div>
                      {table.customer_name && (
                        <p className="text-sm text-muted-foreground mb-2">
                          Cliente: {table.customer_name}
                        </p>
                      )}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Vigência</p>
                          <p className="text-sm font-medium">
                            {formatDate(table.valid_from)} - {table.valid_until ? formatDate(table.valid_until) : 'Indeterminado'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Markup</p>
                          <p className="text-sm font-medium text-green-600">+{table.markup}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Desconto</p>
                          <p className="text-sm font-medium text-orange-600">-{table.discount}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Produtos</p>
                          <p className="text-sm font-medium">{table.items_count} itens</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Performance de Vendas por Tabela</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTables.map((table) => (
                  <div key={table.id} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{table.name}</p>
                      <p className="text-xs text-muted-foreground">{table.items_count} produtos</p>
                    </div>
                    <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(table.items_count / totalItems) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium w-16 text-right">
                      {((table.items_count / totalItems) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
