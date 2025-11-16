/**
 * ICARUS v5.0 - Módulo: Cirurgias & Procedimentos
 *
 * Categoria: Core Business
 * Descrição: Gestão completa de cirurgias e procedimentos que utilizam OPME
 *
 * CONTEXTO DE NEGÓCIO:
 * - Sistema para Distribuidora de Dispositivos Médicos (OPME)
 * - Fluxo: Médico prescreve → Hospital/Plano solicita → Distribuidora fornece → Cirurgia → Faturamento
 * - Este módulo rastreia cirurgias agendadas/realizadas e produtos OPME utilizados
 *
 * Funcionalidades:
 * - Acompanhamento de cirurgias agendadas
 * - Vinculação de produtos OPME a cada procedimento
 * - Rastreabilidade de uso (qual produto/lote usado em qual cirurgia/paciente)
 * - Gestão de status (Agendada, Em Preparo, Realizada, Faturada, Cancelada)
 * - Integração com hospitais, médicos e produtos
 * - IA para predição de demanda e análise de consumo
 *
 * KPIs:
 * - Total de Cirurgias (período)
 * - Produtos Pendentes (aguardando entrega)
 * - Valor Total (R$)
 * - Taxa de Sucesso (%)
 *
 * Abas:
 * - Overview: KPIs + gráficos + cirurgias recentes
 * - Agendadas: Lista de cirurgias agendadas + gestão de produtos
 * - Realizadas: Histórico de cirurgias realizadas
 * - IA: Predições de demanda, análises de consumo, insights
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { formatCurrency, formatDate } from '@/lib/utils'

// ==================== INTERFACES ====================

interface Cirurgia {
  id: number
  hospital_id: number
  hospital_name: string
  doctor_id: number
  doctor_name: string
  patient_name: string
  procedure_type: string
  scheduled_date: string
  status: 'agendada' | 'em_preparo' | 'realizada' | 'faturada' | 'cancelada'
  total_value: number
  items: CirurgiaItem[]
  created_at: string
  observations?: string
}

interface CirurgiaItem {
  id: number
  surgery_id: number
  product_id: number
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  lote?: string
  validade?: string
  status: 'pendente' | 'entregue' | 'utilizado' | 'devolvido'
}

interface Hospital {
  id: number
  name: string
  cnpj: string
  city: string
}

interface Doctor {
  id: number
  name: string
  crm: string
  specialty: string
}

interface Product {
  id: number
  name: string
  category: string
  price: number
  stock: number
}

interface KPIs {
  totalCirurgias: number
  produtosPendentes: number
  valorTotal: number
  taxaSucesso: number
}

// ==================== COMPONENTE PRINCIPAL ====================

export function CirurgiasProcedimentos() {
  const { supabase } = useSupabase()
  const { predict, chat, isLoading: aiLoading } = useIcarusBrain()

  // Estados
  const [cirurgias, setCirurgias] = useState<Cirurgia[]>([])
  const [kpis, setKpis] = useState<KPIs>({
    totalCirurgias: 0,
    produtosPendentes: 0,
    valorTotal: 0,
    taxaSucesso: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('30')

  // Modal de criação/edição
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCirurgia, setEditingCirurgia] = useState<Cirurgia | null>(null)

  // IA
  const [aiPrediction, setAiPrediction] = useState<any>(null)
  const [aiInsights, setAiInsights] = useState<string>('')

  // ==================== EFEITOS ====================

  useEffect(() => {
    loadData()
  }, [dateFilter, statusFilter])

  // ==================== FUNÇÕES DE DADOS ====================

  const loadData = async () => {
    setLoading(true)
    try {
      // Simular carregamento de dados do Supabase
      // Em produção: const { data, error } = await supabase.from('surgeries').select('*')

      const mockCirurgias: Cirurgia[] = [
        {
          id: 1,
          hospital_id: 1,
          hospital_name: 'Hospital São Lucas',
          doctor_id: 1,
          doctor_name: 'Dr. Carlos Silva',
          patient_name: 'João Santos',
          procedure_type: 'Artroplastia de Joelho',
          scheduled_date: '2025-11-20T09:00:00',
          status: 'agendada',
          total_value: 45000,
          items: [
            {
              id: 1,
              surgery_id: 1,
              product_id: 1,
              product_name: 'Prótese de Joelho - Modelo Premium',
              quantity: 1,
              unit_price: 35000,
              total_price: 35000,
              lote: 'LOT2025001',
              validade: '2027-12-31',
              status: 'pendente',
            },
            {
              id: 2,
              surgery_id: 1,
              product_id: 2,
              product_name: 'Parafusos de Fixação Titânio (kit)',
              quantity: 2,
              unit_price: 5000,
              total_price: 10000,
              lote: 'LOT2025045',
              validade: '2028-06-30',
              status: 'entregue',
            },
          ],
          created_at: '2025-11-10T14:30:00',
          observations: 'Paciente com alergia a níquel - usar titânio',
        },
        {
          id: 2,
          hospital_id: 2,
          hospital_name: 'Clínica Ortopédica Excellence',
          doctor_id: 2,
          doctor_name: 'Dra. Maria Oliveira',
          patient_name: 'Ana Costa',
          procedure_type: 'Artrodese de Coluna',
          scheduled_date: '2025-11-18T14:00:00',
          status: 'em_preparo',
          total_value: 62000,
          items: [
            {
              id: 3,
              surgery_id: 2,
              product_id: 3,
              product_name: 'Sistema de Fixação Vertebral',
              quantity: 1,
              unit_price: 48000,
              total_price: 48000,
              lote: 'LOT2025089',
              validade: '2027-09-15',
              status: 'entregue',
            },
            {
              id: 4,
              surgery_id: 2,
              product_id: 4,
              product_name: 'Cage Intersomático PEEK',
              quantity: 2,
              unit_price: 7000,
              total_price: 14000,
              lote: 'LOT2025102',
              validade: '2028-03-20',
              status: 'entregue',
            },
          ],
          created_at: '2025-11-08T10:15:00',
        },
        {
          id: 3,
          hospital_id: 1,
          hospital_name: 'Hospital São Lucas',
          doctor_id: 3,
          doctor_name: 'Dr. Pedro Almeida',
          patient_name: 'Roberto Lima',
          procedure_type: 'Artroplastia de Quadril',
          scheduled_date: '2025-11-15T08:30:00',
          status: 'realizada',
          total_value: 52000,
          items: [
            {
              id: 5,
              surgery_id: 3,
              product_id: 5,
              product_name: 'Prótese de Quadril Cimentada',
              quantity: 1,
              unit_price: 42000,
              total_price: 42000,
              lote: 'LOT2024987',
              validade: '2027-05-10',
              status: 'utilizado',
            },
            {
              id: 6,
              surgery_id: 3,
              product_id: 6,
              product_name: 'Parafusos de Fixação (kit)',
              quantity: 1,
              unit_price: 10000,
              total_price: 10000,
              lote: 'LOT2024999',
              validade: '2027-08-25',
              status: 'utilizado',
            },
          ],
          created_at: '2025-11-01T11:20:00',
          observations: 'Cirurgia realizada com sucesso',
        },
        {
          id: 4,
          hospital_id: 3,
          hospital_name: 'Hospital Regional Sul',
          doctor_id: 1,
          doctor_name: 'Dr. Carlos Silva',
          patient_name: 'Mariana Souza',
          procedure_type: 'Reconstrução de LCA',
          scheduled_date: '2025-11-22T10:00:00',
          status: 'agendada',
          total_value: 18000,
          items: [
            {
              id: 7,
              surgery_id: 4,
              product_id: 7,
              product_name: 'Enxerto de LCA',
              quantity: 1,
              unit_price: 12000,
              total_price: 12000,
              status: 'pendente',
            },
            {
              id: 8,
              surgery_id: 4,
              product_id: 8,
              product_name: 'Parafusos de Interferência',
              quantity: 2,
              unit_price: 3000,
              total_price: 6000,
              status: 'pendente',
            },
          ],
          created_at: '2025-11-12T16:45:00',
        },
        {
          id: 5,
          hospital_id: 2,
          hospital_name: 'Clínica Ortopédica Excellence',
          doctor_id: 4,
          doctor_name: 'Dr. Fernando Costa',
          patient_name: 'Lucas Pereira',
          procedure_type: 'Osteossíntese de Fêmur',
          scheduled_date: '2025-11-12T13:00:00',
          status: 'faturada',
          total_value: 38000,
          items: [
            {
              id: 9,
              surgery_id: 5,
              product_id: 9,
              product_name: 'Haste Intramedular Bloqueada',
              quantity: 1,
              unit_price: 28000,
              total_price: 28000,
              lote: 'LOT2024856',
              validade: '2027-02-15',
              status: 'utilizado',
            },
            {
              id: 10,
              surgery_id: 5,
              product_id: 10,
              product_name: 'Parafusos de Bloqueio (kit)',
              quantity: 1,
              unit_price: 10000,
              total_price: 10000,
              lote: 'LOT2024867',
              validade: '2027-04-10',
              status: 'utilizado',
            },
          ],
          created_at: '2025-11-05T09:30:00',
        },
      ]

      setCirurgias(mockCirurgias)
      calculateKPIs(mockCirurgias)
    } catch (error) {
      console.error('Erro ao carregar cirurgias:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateKPIs = (data: Cirurgia[]) => {
    const total = data.length
    const pendentes = data.reduce((acc, c) => {
      return acc + c.items.filter(item => item.status === 'pendente').length
    }, 0)
    const valorTotal = data.reduce((acc, c) => acc + c.total_value, 0)
    const realizadas = data.filter(c => c.status === 'realizada' || c.status === 'faturada').length
    const taxaSucesso = total > 0 ? (realizadas / total) * 100 : 0

    setKpis({
      totalCirurgias: total,
      produtosPendentes: pendentes,
      valorTotal,
      taxaSucesso,
    })
  }

  const handleCreateCirurgia = () => {
    setEditingCirurgia(null)
    setIsDialogOpen(true)
  }

  const handleEditCirurgia = (cirurgia: Cirurgia) => {
    setEditingCirurgia(cirurgia)
    setIsDialogOpen(true)
  }

  const handleSaveCirurgia = async () => {
    // Implementar lógica de salvar no Supabase
    setIsDialogOpen(false)
    await loadData()
  }

  const handlePredictDemand = async () => {
    try {
      const result = await predict('demanda_produtos', {
        cirurgias: cirurgias.slice(0, 10),
        periodo: 'próximos 30 dias',
      })
      setAiPrediction(result)
    } catch (error) {
      console.error('Erro na predição:', error)
    }
  }

  const handleAnalyzeConsumption = async () => {
    try {
      const prompt = `Analise o padrão de consumo de produtos OPME nas cirurgias abaixo e forneça insights:

${cirurgias.slice(0, 5).map(c => `
- Procedimento: ${c.procedure_type}
- Hospital: ${c.hospital_name}
- Médico: ${c.doctor_name}
- Produtos: ${c.items.map(i => `${i.product_name} (${i.quantity}x)`).join(', ')}
- Valor: ${formatCurrency(c.total_value)}
`).join('\n')}

Forneça insights sobre:
1. Produtos mais utilizados
2. Padrões de consumo por tipo de procedimento
3. Recomendações de estoque
4. Oportunidades de otimização`

      const response = await chat(prompt)
      setAiInsights(response)
    } catch (error) {
      console.error('Erro na análise:', error)
    }
  }

  // ==================== FILTROS ====================

  const filteredCirurgias = cirurgias.filter(cirurgia => {
    const matchesSearch =
      cirurgia.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirurgia.hospital_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirurgia.doctor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cirurgia.procedure_type.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || cirurgia.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const cirurgiasAgendadas = filteredCirurgias.filter(c => c.status === 'agendada' || c.status === 'em_preparo')
  const cirurgiasRealizadas = filteredCirurgias.filter(c => c.status === 'realizada' || c.status === 'faturada')

  // ==================== STATUS BADGE ====================

  const getStatusBadge = (status: Cirurgia['status']) => {
    const styles = {
      agendada: 'bg-blue-100 text-blue-800',
      em_preparo: 'bg-yellow-100 text-yellow-800',
      realizada: 'bg-green-100 text-green-800',
      faturada: 'bg-purple-100 text-purple-800',
      cancelada: 'bg-red-100 text-red-800',
    }

    const labels = {
      agendada: 'Agendada',
      em_preparo: 'Em Preparo',
      realizada: 'Realizada',
      faturada: 'Faturada',
      cancelada: 'Cancelada',
    }

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const getItemStatusBadge = (status: CirurgiaItem['status']) => {
    const styles = {
      pendente: 'bg-orange-100 text-orange-800',
      entregue: 'bg-blue-100 text-blue-800',
      utilizado: 'bg-green-100 text-green-800',
      devolvido: 'bg-gray-100 text-gray-800',
    }

    const labels = {
      pendente: 'Pendente',
      entregue: 'Entregue',
      utilizado: 'Utilizado',
      devolvido: 'Devolvido',
    }

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${styles[status]}`}>
        {labels[status]}
      </span>
    )
  }

  // ==================== RENDERIZAÇÃO ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cirurgias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cirurgias & Procedimentos</h1>
          <p className="text-muted-foreground mt-1">
            Gestão de cirurgias e produtos OPME - B2B para Hospitais e Planos
          </p>
        </div>
        <Button onClick={handleCreateCirurgia} size="lg">
          + Nova Cirurgia
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Total de Cirurgias</CardDescription>
            <CardTitle className="text-3xl">{kpis.totalCirurgias}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Pendentes</CardDescription>
            <CardTitle className="text-3xl text-orange-600">{kpis.produtosPendentes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Aguardando entrega</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Valor Total</CardDescription>
            <CardTitle className="text-3xl text-green-600">{formatCurrency(kpis.valorTotal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Período selecionado</p>
          </CardContent>
        </Card>

        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Sucesso</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{kpis.taxaSucesso.toFixed(1)}%</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Cirurgias realizadas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="neu-soft">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por paciente, hospital, médico ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="agendada">Agendada</SelectItem>
                <SelectItem value="em_preparo">Em Preparo</SelectItem>
                <SelectItem value="realizada">Realizada</SelectItem>
                <SelectItem value="faturada">Faturada</SelectItem>
                <SelectItem value="cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
                <SelectItem value="all">Todos os períodos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agendadas">Agendadas ({cirurgiasAgendadas.length})</TabsTrigger>
          <TabsTrigger value="realizadas">Realizadas ({cirurgiasRealizadas.length})</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        {/* TAB: Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Próximas Cirurgias</CardTitle>
              <CardDescription>Cirurgias agendadas para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cirurgiasAgendadas.slice(0, 3).map(cirurgia => (
                  <div key={cirurgia.id} className="p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{cirurgia.procedure_type}</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(cirurgia.scheduled_date)} - {cirurgia.hospital_name}
                        </p>
                      </div>
                      {getStatusBadge(cirurgia.status)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div>
                        <span className="text-muted-foreground">Paciente:</span> {cirurgia.patient_name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Médico:</span> {cirurgia.doctor_name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Produtos:</span> {cirurgia.items.length} itens
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valor:</span> {formatCurrency(cirurgia.total_value)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => handleEditCirurgia(cirurgia)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Produtos Mais Utilizados</CardTitle>
                <CardDescription>Top 5 produtos em procedimentos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prótese de Joelho Premium</span>
                    <span className="font-semibold">8 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sistema Fixação Vertebral</span>
                    <span className="font-semibold">6 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Prótese de Quadril</span>
                    <span className="font-semibold">5 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Parafusos Titânio (kit)</span>
                    <span className="font-semibold">12 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Haste Intramedular</span>
                    <span className="font-semibold">4 cirurgias</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="neu-soft">
              <CardHeader>
                <CardTitle>Hospitais Ativos</CardTitle>
                <CardDescription>Principais clientes B2B</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hospital São Lucas</span>
                    <span className="font-semibold">2 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clínica Ortopédica Excellence</span>
                    <span className="font-semibold">2 cirurgias</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Hospital Regional Sul</span>
                    <span className="font-semibold">1 cirurgia</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB: Agendadas */}
        <TabsContent value="agendadas" className="space-y-4">
          {cirurgiasAgendadas.length === 0 ? (
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Nenhuma cirurgia agendada no momento</p>
              </CardContent>
            </Card>
          ) : (
            cirurgiasAgendadas.map(cirurgia => (
              <Card key={cirurgia.id} className="neu-soft">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{cirurgia.procedure_type}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(cirurgia.scheduled_date)} • {cirurgia.hospital_name} • Dr(a). {cirurgia.doctor_name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(cirurgia.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Paciente</p>
                        <p className="font-medium">{cirurgia.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Produtos</p>
                        <p className="font-medium">{cirurgia.items.length} itens</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium text-green-600">{formatCurrency(cirurgia.total_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Criado em</p>
                        <p className="font-medium">{formatDate(cirurgia.created_at)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Produtos OPME:</h4>
                      <div className="space-y-2">
                        {cirurgia.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qtd: {item.quantity} • Unitário: {formatCurrency(item.unit_price)}
                                {item.lote && ` • Lote: ${item.lote}`}
                                {item.validade && ` • Validade: ${formatDate(item.validade)}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getItemStatusBadge(item.status)}
                              <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {cirurgia.observations && (
                      <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                        <p className="text-sm"><strong>Observações:</strong> {cirurgia.observations}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditCirurgia(cirurgia)}>
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        Confirmar Entrega
                      </Button>
                      <Button variant="outline" size="sm">
                        Imprimir Romaneio
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TAB: Realizadas */}
        <TabsContent value="realizadas" className="space-y-4">
          {cirurgiasRealizadas.length === 0 ? (
            <Card className="neu-soft">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Nenhuma cirurgia realizada no período selecionado</p>
              </CardContent>
            </Card>
          ) : (
            cirurgiasRealizadas.map(cirurgia => (
              <Card key={cirurgia.id} className="neu-soft">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle>{cirurgia.procedure_type}</CardTitle>
                      <CardDescription className="mt-1">
                        {formatDate(cirurgia.scheduled_date)} • {cirurgia.hospital_name} • Dr(a). {cirurgia.doctor_name}
                      </CardDescription>
                    </div>
                    {getStatusBadge(cirurgia.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Paciente</p>
                        <p className="font-medium">{cirurgia.patient_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Produtos</p>
                        <p className="font-medium">{cirurgia.items.length} itens</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Valor Total</p>
                        <p className="font-medium text-green-600">{formatCurrency(cirurgia.total_value)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status Faturamento</p>
                        <p className="font-medium">{cirurgia.status === 'faturada' ? '✅ Faturado' : '⏳ Pendente'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Produtos Utilizados:</h4>
                      <div className="space-y-2">
                        {cirurgia.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 bg-accent/30 rounded">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{item.product_name}</p>
                              <p className="text-xs text-muted-foreground">
                                Qtd: {item.quantity} • Lote: {item.lote} • Validade: {item.validade && formatDate(item.validade)}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              {getItemStatusBadge(item.status)}
                              <span className="font-semibold">{formatCurrency(item.total_price)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Ver Detalhes Completos
                      </Button>
                      {cirurgia.status === 'realizada' && (
                        <Button variant="default" size="sm">
                          Gerar Fatura
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Exportar PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* TAB: IA */}
        <TabsContent value="ia" className="space-y-4">
          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Predição de Demanda com IA</CardTitle>
              <CardDescription>
                Análise preditiva de demanda de produtos OPME baseada no histórico de cirurgias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handlePredictDemand}
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? 'Analisando...' : 'Gerar Predição de Demanda'}
              </Button>

              {aiPrediction && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Resultado da Predição:</h4>
                  <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(aiPrediction, null, 2)}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Análise de Consumo</CardTitle>
              <CardDescription>
                Insights sobre padrões de consumo de produtos em procedimentos cirúrgicos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleAnalyzeConsumption}
                disabled={aiLoading}
                className="w-full"
              >
                {aiLoading ? 'Analisando...' : 'Analisar Padrão de Consumo'}
              </Button>

              {aiInsights && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold mb-2">Insights de IA:</h4>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{aiInsights}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="neu-soft">
            <CardHeader>
              <CardTitle>Assistente IA - Pergunte Qualquer Coisa</CardTitle>
              <CardDescription>
                Faça perguntas sobre cirurgias, produtos, tendências e otimizações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Ex: Quais produtos têm maior rotatividade?" />
                <Button disabled={aiLoading}>
                  {aiLoading ? 'Processando...' : 'Perguntar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
