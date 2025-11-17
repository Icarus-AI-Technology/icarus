import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
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
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  FileSpreadsheet, TrendingUp, Clock, CheckCircle2, XCircle,
  AlertTriangle, Plus, Search, Download, Eye, Calendar,
  Building2, FileText, Award, Target
} from 'lucide-react'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { toast } from 'sonner'

type LicitacaoStatus =
  | 'open' // Aberta
  | 'proposal_sent' // Proposta Enviada
  | 'in_analysis' // Em Análise
  | 'won' // Vencida
  | 'lost' // Perdida
  | 'cancelled' // Cancelada

type LicitacaoModality =
  | 'pregao' // Pregão Eletrônico/Presencial
  | 'concorrencia' // Concorrência
  | 'tomada_precos' // Tomada de Preços
  | 'convite' // Convite
  | 'rdc' // Regime Diferenciado de Contratação

interface Licitacao {
  id: string
  code: string
  number: string
  process_number: string
  modality: LicitacaoModality
  entity: string
  entity_type: 'municipal' | 'estadual' | 'federal'
  description: string
  estimated_value: number
  opening_date: string
  closing_date: string
  proposal_deadline: string
  status: LicitacaoStatus
  our_proposal_value?: number
  winning_value?: number
  winner?: string
  items_count: number
  created_at: string
  updated_at: string
}

const STATUS_COLORS = {
  open: '#F59E0B',
  proposal_sent: '#3B82F6',
  in_analysis: '#8B5CF6',
  won: '#10B981',
  lost: '#EF4444',
  cancelled: '#6B7280'
}

export function Licitacoes() {

  // State
  const [loading, setLoading] = useState(true)
  const [licitacoes, setLicitacoes] = useState<Licitacao[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterModality, setFilterModality] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('overview')

  const debouncedSearch = useDebounce(searchTerm, 300)

  // Load data
  useEffect(() => {
    loadLicitacoes()
  }, [])

  async function loadLicitacoes() {
    setLoading(true)

    try {
      // Simulate API call - replace with real Supabase query
      const mockData: Licitacao[] = [
        {
          id: '1',
          code: 'LIC-2024-001',
          number: '001/2024',
          process_number: '2024.01.001234-5',
          modality: 'pregao',
          entity: 'Hospital Municipal de São Paulo',
          entity_type: 'municipal',
          description: 'Aquisição de órteses e próteses para procedimentos cirúrgicos ortopédicos',
          estimated_value: 850000,
          opening_date: '2024-02-15',
          closing_date: '2024-02-20',
          proposal_deadline: '2024-02-19T14:00:00',
          status: 'proposal_sent',
          our_proposal_value: 785000,
          items_count: 45,
          created_at: '2024-02-01',
          updated_at: '2024-02-15'
        },
        {
          id: '2',
          code: 'LIC-2024-002',
          number: '002/2024',
          process_number: '2024.01.002345-6',
          modality: 'pregao',
          entity: 'Secretaria Estadual de Saúde - SP',
          entity_type: 'estadual',
          description: 'Fornecimento de materiais especiais (OPME) para cirurgias cardíacas',
          estimated_value: 1500000,
          opening_date: '2024-03-01',
          closing_date: '2024-03-10',
          proposal_deadline: '2024-03-09T16:00:00',
          status: 'in_analysis',
          our_proposal_value: 1450000,
          items_count: 67,
          created_at: '2024-02-15',
          updated_at: '2024-03-05'
        },
        {
          id: '3',
          code: 'LIC-2024-003',
          number: '003/2024',
          process_number: '2024.02.003456-7',
          modality: 'concorrencia',
          entity: 'Ministério da Saúde',
          entity_type: 'federal',
          description: 'Registro de preços para fornecimento de próteses ortopédicas',
          estimated_value: 5000000,
          opening_date: '2024-04-01',
          closing_date: '2024-05-15',
          proposal_deadline: '2024-05-14T10:00:00',
          status: 'open',
          items_count: 125,
          created_at: '2024-03-01',
          updated_at: '2024-03-15'
        },
        {
          id: '4',
          code: 'LIC-2023-045',
          number: '045/2023',
          process_number: '2023.12.045678-9',
          modality: 'pregao',
          entity: 'Hospital das Clínicas - FMUSP',
          entity_type: 'estadual',
          description: 'Aquisição de materiais especiais para neurocirurgia',
          estimated_value: 980000,
          opening_date: '2023-12-10',
          closing_date: '2023-12-18',
          proposal_deadline: '2023-12-17T15:00:00',
          status: 'won',
          our_proposal_value: 920000,
          winning_value: 920000,
          winner: 'Nossa Empresa',
          items_count: 38,
          created_at: '2023-11-20',
          updated_at: '2023-12-20'
        },
        {
          id: '5',
          code: 'LIC-2023-042',
          number: '042/2023',
          process_number: '2023.11.042345-6',
          modality: 'tomada_precos',
          entity: 'Prefeitura Municipal de Campinas',
          entity_type: 'municipal',
          description: 'Fornecimento de materiais ortopédicos e traumatológicos',
          estimated_value: 650000,
          opening_date: '2023-11-15',
          closing_date: '2023-11-25',
          proposal_deadline: '2023-11-24T14:00:00',
          status: 'lost',
          our_proposal_value: 615000,
          winning_value: 590000,
          winner: 'Concorrente A',
          items_count: 32,
          created_at: '2023-11-01',
          updated_at: '2023-11-28'
        }
      ]

      setLicitacoes(mockData)
    } catch (error) {
      console.error('Erro ao carregar licitações:', error)
      toast.error('Erro ao carregar licitações')
    } finally {
      setLoading(false)
    }
  }

  // Filtered licitacoes
  const filteredLicitacoes = useMemo(() => {
    return licitacoes.filter(lic => {
      const matchesSearch =
        lic.number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lic.code.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lic.entity.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        lic.description.toLowerCase().includes(debouncedSearch.toLowerCase())

      const matchesStatus = filterStatus === 'all' || lic.status === filterStatus
      const matchesModality = filterModality === 'all' || lic.modality === filterModality

      return matchesSearch && matchesStatus && matchesModality
    })
  }, [licitacoes, debouncedSearch, filterStatus, filterModality])

  // KPIs
  const totalLicitacoes = licitacoes.length
  const openLicitacoes = licitacoes.filter(l => l.status === 'open' || l.status === 'proposal_sent' || l.status === 'in_analysis').length
  const wonLicitacoes = licitacoes.filter(l => l.status === 'won').length
  const winRate = (wonLicitacoes / licitacoes.filter(l => l.status === 'won' || l.status === 'lost').length * 100) || 0
  const totalProposalValue = licitacoes
    .filter(l => l.our_proposal_value)
    .reduce((sum, l) => sum + (l.our_proposal_value || 0), 0)

  // Charts data
  const statusDistribution = [
    { name: 'Abertas', value: licitacoes.filter(l => l.status === 'open').length, color: STATUS_COLORS.open },
    { name: 'Proposta Enviada', value: licitacoes.filter(l => l.status === 'proposal_sent').length, color: STATUS_COLORS.proposal_sent },
    { name: 'Em Análise', value: licitacoes.filter(l => l.status === 'in_analysis').length, color: STATUS_COLORS.in_analysis },
    { name: 'Vencidas', value: licitacoes.filter(l => l.status === 'won').length, color: STATUS_COLORS.won },
    { name: 'Perdidas', value: licitacoes.filter(l => l.status === 'lost').length, color: STATUS_COLORS.lost },
  ].filter(item => item.value > 0)

  const valueByModality = [
    {
      modality: 'Pregão',
      value: licitacoes.filter(l => l.modality === 'pregao')
        .reduce((sum, l) => sum + l.estimated__value, 0) / 1000
    },
    {
      modality: 'Concorrência',
      value: licitacoes.filter(l => l.modality === 'concorrencia')
        .reduce((sum, l) => sum + l.estimated__value, 0) / 1000
    },
    {
      modality: 'Tomada de Preços',
      value: licitacoes.filter(l => l.modality === 'tomada_precos')
        .reduce((sum, l) => sum + l.estimated__value, 0) / 1000
    }
  ].filter(item => item.value > 0)

  // Helper functions
  const getModalityLabel = (modality: LicitacaoModality) => {
    const labels = {
      pregao: 'Pregão',
      concorrencia: 'Concorrência',
      tomada_precos: 'Tomada de Preços',
      convite: 'Convite',
      rdc: 'RDC'
    }
    return labels[modality]
  }

  const getStatusBadge = (status: LicitacaoStatus) => {
    const variants = {
      open: 'warning',
      proposal_sent: 'default',
      in_analysis: 'secondary',
      won: 'success',
      lost: 'destructive',
      cancelled: 'outline'
    } as const

    const labels = {
      open: 'Aberta',
      proposal_sent: 'Proposta Enviada',
      in_analysis: 'Em Análise',
      won: 'Vencida',
      lost: 'Perdida',
      cancelled: 'Cancelada'
    }

    const icons = {
      open: Clock,
      proposal_sent: FileText,
      in_analysis: AlertTriangle,
      won: CheckCircle2,
      lost: XCircle,
      cancelled: XCircle
    }

    const Icon = icons[status]

    return (
      <Badge variant={variants[status]} className="gap-1">
        <Icon className="h-3 w-3" />
        {labels[status]}
      </Badge>
    )
  }

  const getEntityTypeLabel = (type: string) => {
    const labels = {
      municipal: 'Municipal',
      estadual: 'Estadual',
      federal: 'Federal'
    }
    return labels[type as keyof typeof labels] || type
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
            <Award className="h-8 w-8 text-primary" />
            Licitações
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão de licitações públicas e processos licitatórios
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Licitação
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Licitações</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLicitacoes}</div>
            <p className="text-xs text-muted-foreground">
              {openLicitacoes} em andamento
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Êxito</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {wonLicitacoes} licitações vencidas
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor em Propostas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalProposalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total proposto
            </p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximos Prazos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Nos próximos 7 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="licitacoes">Licitações</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Status Distribution */}
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Value by Modality */}
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Valor por Modalidade (R$ mil)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={valueByModality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="modality" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value) * 1000)} />
                    <Bar dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Licitacoes Tab */}
        <TabsContent value="licitacoes" className="space-y-4">
          {/* Filters */}
          <Card className="neu-soft">
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar licitação..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="open">Aberta</SelectItem>
                    <SelectItem value="proposal_sent">Proposta Enviada</SelectItem>
                    <SelectItem value="in_analysis">Em Análise</SelectItem>
                    <SelectItem value="won">Vencida</SelectItem>
                    <SelectItem value="lost">Perdida</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterModality} onValueChange={setFilterModality}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pregao">Pregão</SelectItem>
                    <SelectItem value="concorrencia">Concorrência</SelectItem>
                    <SelectItem value="tomada_precos">Tomada de Preços</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Licitacoes List */}
          <div className="grid gap-4">
            {filteredLicitacoes.map((lic) => (
              <Card key={lic.id} className="neu-soft hover:neu-hard transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{lic.number}</h3>
                        <Badge variant="outline">{lic.code}</Badge>
                        {getStatusBadge(lic.status)}
                        <Badge>{getModalityLabel(lic.modality)}</Badge>
                        <Badge variant="secondary">{getEntityTypeLabel(lic.entity_type)}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {lic.entity}
                      </p>
                      <p className="text-sm text-muted-foreground mb-3">{lic.description}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Processo</p>
                          <p className="text-sm font-medium">{lic.process_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Valor Estimado</p>
                          <p className="text-sm font-medium">{formatCurrency(lic.estimated_value)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Nossa Proposta</p>
                          <p className="text-sm font-medium text-primary">
                            {lic.our_proposal_value ? formatCurrency(lic.our_proposal_value) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Prazo de Proposta</p>
                          <p className="text-sm font-medium">
                            {formatDate(lic.proposal_deadline)}
                          </p>
                        </div>
                      </div>
                      {lic.winner && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground">Vencedor</p>
                          <p className="text-sm font-medium">{lic.winner} - {formatCurrency(lic.winning_value || 0)}</p>
                        </div>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
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
              <CardTitle>Performance por Esfera Governamental</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['municipal', 'estadual', 'federal'].map((type) => {
                  const typeLics = licitacoes.filter(l => l.entity_type === type)
                  const wonCount = typeLics.filter(l => l.status === 'won').length
                  const totalCount = typeLics.filter(l => l.status === 'won' || l.status === 'lost').length
                  const rate = totalCount > 0 ? (wonCount / totalCount * 100) : 0

                  return (
                    <div key={type} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getEntityTypeLabel(type)}</p>
                        <p className="text-xs text-muted-foreground">
                          {wonCount} vencidas de {totalCount} participadas
                        </p>
                      </div>
                      <div className="flex-1 h-8 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <div className="text-sm font-medium w-16 text-right">
                        {rate.toFixed(1)}%
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
