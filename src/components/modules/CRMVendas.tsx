import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSupabase } from '@/hooks/useSupabase'
import { useDebounce } from '@/hooks/useDebounce'
import { formatCurrency, formatDate } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import {
  Users, Plus, Search, Filter, Edit, Trash2, Eye, Phone,
  Mail, MapPin, Building2, TrendingUp, DollarSign, Target,
  Star, Calendar, CheckCircle2, Clock, XCircle, AlertCircle
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Funnel, FunnelChart
} from 'recharts'
import { toast } from 'sonner'

type OpportunityStage = 'lead' | 'contact' | 'proposal' | 'negotiation' | 'won' | 'lost'

interface Customer {
  id: string
  name: string
  document: string
  email: string
  phone: string
  address: string | null
  city: string
  state: string
  type: 'hospital' | 'clinic' | 'distributor' | 'other'
  status: 'active' | 'inactive' | 'prospect'
  total_purchases: number
  last_purchase_date: string | null
  created_at: string
}

interface Opportunity {
  id: string
  title: string
  customer_id: string
  customer_name?: string
  value: number
  stage: OpportunityStage
  probability: number
  expected_close_date: string
  description: string | null
  created_at: string
  updated_at: string
}

interface Activity {
  id: string
  customer_id: string
  customer_name?: string
  type: 'call' | 'email' | 'meeting' | 'note'
  description: string
  date: string
  completed: boolean
}

export function CRMVendas() {
  const { supabase, isConfigured } = useSupabase()
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false)
  const [isCreateOpportunityOpen, setIsCreateOpportunityOpen] = useState(false)
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Form state for customer
  const [customerForm, setCustomerForm] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    type: 'hospital' as Customer['type']
  })

  // Form state for opportunity
  const [opportunityForm, setOpportunityForm] = useState({
    title: '',
    customer_id: '',
    value: '',
    stage: 'lead' as OpportunityStage,
    probability: '20',
    expected_close_date: '',
    description: ''
  })

  // Mock data
  const mockCustomers: Customer[] = [
    {
      id: '1',
      name: 'Hospital Santa Casa',
      document: '12.345.678/0001-90',
      email: 'contato@santacasa.com.br',
      phone: '(11) 3456-7890',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      type: 'hospital',
      status: 'active',
      total_purchases: 450000,
      last_purchase_date: '2025-01-15',
      created_at: '2024-01-10'
    },
    {
      id: '2',
      name: 'Hospital Albert Einstein',
      document: '23.456.789/0001-01',
      email: 'compras@einstein.br',
      phone: '(11) 2345-6789',
      address: 'Av. Albert Einstein, 627',
      city: 'São Paulo',
      state: 'SP',
      type: 'hospital',
      status: 'active',
      total_purchases: 780000,
      last_purchase_date: '2025-01-12',
      created_at: '2023-06-15'
    },
    {
      id: '3',
      name: 'Clínica Morumbi',
      document: '34.567.890/0001-12',
      email: 'admin@clmorumbi.com.br',
      phone: '(11) 4567-8901',
      address: null,
      city: 'São Paulo',
      state: 'SP',
      type: 'clinic',
      status: 'active',
      total_purchases: 125000,
      last_purchase_date: '2024-12-20',
      created_at: '2024-03-20'
    },
    {
      id: '4',
      name: 'Distribuidora MedSul',
      document: '45.678.901/0001-23',
      email: 'vendas@medsul.com.br',
      phone: '(11) 5678-9012',
      address: 'Rua do Comércio, 456',
      city: 'São Paulo',
      state: 'SP',
      type: 'distributor',
      status: 'prospect',
      total_purchases: 0,
      last_purchase_date: null,
      created_at: '2025-01-05'
    }
  ]

  const mockOpportunities: Opportunity[] = [
    {
      id: '1',
      title: 'Implantação de Stents Coronários',
      customer_id: '1',
      customer_name: 'Hospital Santa Casa',
      value: 120000,
      stage: 'proposal',
      probability: 60,
      expected_close_date: '2025-02-15',
      description: 'Fornecimento de 10 stents coronários farmacológicos',
      created_at: '2025-01-10',
      updated_at: '2025-01-15'
    },
    {
      id: '2',
      title: 'Próteses Ortopédicas - Contrato Anual',
      customer_id: '2',
      customer_name: 'Hospital Albert Einstein',
      value: 450000,
      stage: 'negotiation',
      probability: 80,
      expected_close_date: '2025-02-28',
      description: 'Contrato anual para fornecimento de próteses de quadril e joelho',
      created_at: '2024-12-15',
      updated_at: '2025-01-14'
    },
    {
      id: '3',
      title: 'Lentes Intraoculares',
      customer_id: '3',
      customer_name: 'Clínica Morumbi',
      value: 35000,
      stage: 'contact',
      probability: 30,
      expected_close_date: '2025-03-10',
      description: 'Interesse em 50 lentes para cirurgias de catarata',
      created_at: '2025-01-08',
      updated_at: '2025-01-12'
    },
    {
      id: '4',
      title: 'Marcapassos Cardíacos',
      customer_id: '1',
      customer_name: 'Hospital Santa Casa',
      value: 200000,
      stage: 'won',
      probability: 100,
      expected_close_date: '2025-01-20',
      description: 'Fornecimento de 8 marcapassos definitivos',
      created_at: '2024-12-01',
      updated_at: '2025-01-18'
    },
    {
      id: '5',
      title: 'Materiais Neurocirurgia',
      customer_id: '4',
      customer_name: 'Distribuidora MedSul',
      value: 85000,
      stage: 'lead',
      probability: 20,
      expected_close_date: '2025-04-15',
      description: 'Interesse inicial em placas e parafusos de titânio',
      created_at: '2025-01-12',
      updated_at: '2025-01-12'
    }
  ]

  // Analytics data
  const salesFunnel = [
    { stage: 'Leads', value: 15, fill: '#6366F1' },
    { stage: 'Contato', value: 12, fill: '#8B5CF6' },
    { stage: 'Proposta', value: 8, fill: '#10B981' },
    { stage: 'Negociação', value: 5, fill: '#F59E0B' },
    { stage: 'Ganhos', value: 3, fill: '#EF4444' },
  ]

  const monthlyRevenue = [
    { month: 'Jul', valor: 285000, meta: 250000 },
    { month: 'Ago', valor: 320000, meta: 280000 },
    { month: 'Set', valor: 298000, meta: 290000 },
    { month: 'Out', valor: 385000, meta: 310000 },
    { month: 'Nov', valor: 420000, meta: 350000 },
    { month: 'Dez', valor: 512000, meta: 400000 },
  ]

  const customerTypeDistribution = [
    { name: 'Hospitais', value: 55, color: '#6366F1' },
    { name: 'Clínicas', value: 30, color: '#10B981' },
    { name: 'Distribuidores', value: 10, color: '#F59E0B' },
    { name: 'Outros', value: 5, color: '#8B5CF6' },
  ]

  const topCustomers = [
    { name: 'Hospital Einstein', value: 780000 },
    { name: 'Hospital Santa Casa', value: 450000 },
    { name: 'Hospital Sírio-Libanês', value: 385000 },
    { name: 'Clínica Morumbi', value: 125000 },
    { name: 'Hospital São Luiz', value: 98000 },
  ]

  useEffect(() => {
    loadData()
  }, [isConfigured])

  const loadData = async () => {
    setLoading(true)

    if (!isConfigured) {
      setTimeout(() => {
        setCustomers(mockCustomers)
        setOpportunities(mockOpportunities)
        setLoading(false)
      }, 500)
      return
    }

    try {
      // Fetch customers (using hospitals table as base)
      const { data: customersData, error: customersError } = await supabase
        .from('hospitals')
        .select('*')
        .order('name')

      if (customersError) throw customersError

      setCustomers(customersData || [])
      setOpportunities(mockOpportunities) // Opportunities table would need to be created
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Erro ao carregar dados')
      setCustomers(mockCustomers)
      setOpportunities(mockOpportunities)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCustomer = async () => {
    if (!customerForm.name || !customerForm.email || !customerForm.phone) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const newCustomer: Customer = {
      id: String(customers.length + 1),
      name: customerForm.name,
      document: customerForm.document,
      email: customerForm.email,
      phone: customerForm.phone,
      address: customerForm.address || null,
      city: customerForm.city,
      state: customerForm.state,
      type: customerForm.type,
      status: 'prospect',
      total_purchases: 0,
      last_purchase_date: null,
      created_at: new Date().toISOString()
    }

    setCustomers([...customers, newCustomer])
    toast.success('Cliente cadastrado com sucesso!')
    resetCustomerForm()
    setIsCreateCustomerOpen(false)
  }

  const handleCreateOpportunity = async () => {
    if (!opportunityForm.title || !opportunityForm.customer_id || !opportunityForm.value) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    const customer = customers.find(c => c.id === opportunityForm.customer_id)

    const newOpportunity: Opportunity = {
      id: String(opportunities.length + 1),
      title: opportunityForm.title,
      customer_id: opportunityForm.customer_id,
      customer_name: customer?.name,
      value: parseFloat(opportunityForm.value),
      stage: opportunityForm.stage,
      probability: parseInt(opportunityForm.probability),
      expected_close_date: opportunityForm.expected_close_date,
      description: opportunityForm.description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    setOpportunities([newOpportunity, ...opportunities])
    toast.success('Oportunidade criada com sucesso!')
    resetOpportunityForm()
    setIsCreateOpportunityOpen(false)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    if (!confirm(`Deseja realmente excluir ${customer.name}?`)) return

    setCustomers(customers.filter(c => c.id !== customer.id))
    toast.success('Cliente excluído com sucesso!')
  }

  const handleStageChange = (opportunity: Opportunity, newStage: OpportunityStage) => {
    const updatedOpportunities = opportunities.map(opp =>
      opp.id === opportunity.id
        ? {
            ...opp,
            stage: newStage,
            probability: getStageProbability(newStage),
            updated_at: new Date().toISOString()
          }
        : opp
    )
    setOpportunities(updatedOpportunities)
    toast.success('Etapa atualizada com sucesso!')
  }

  const getStageProbability = (stage: OpportunityStage): number => {
    switch (stage) {
      case 'lead': return 20
      case 'contact': return 30
      case 'proposal': return 60
      case 'negotiation': return 80
      case 'won': return 100
      case 'lost': return 0
    }
  }

  const getStageBadge = (stage: OpportunityStage) => {
    switch (stage) {
      case 'lead':
        return <Badge variant="outline">Lead</Badge>
      case 'contact':
        return <Badge variant="info">Contato</Badge>
      case 'proposal':
        return <Badge className="bg-blue-500">Proposta</Badge>
      case 'negotiation':
        return <Badge variant="warning">Negociação</Badge>
      case 'won':
        return <Badge variant="success">Ganho</Badge>
      case 'lost':
        return <Badge variant="destructive">Perdido</Badge>
    }
  }

  const getStatusBadge = (status: Customer['status']) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativo</Badge>
      case 'inactive':
        return <Badge variant="outline">Inativo</Badge>
      case 'prospect':
        return <Badge variant="info">Prospect</Badge>
    }
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      document: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      type: 'hospital'
    })
  }

  const resetOpportunityForm = () => {
    setOpportunityForm({
      title: '',
      customer_id: '',
      value: '',
      stage: 'lead',
      probability: '20',
      expected_close_date: '',
      description: ''
    })
  }

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      const matchesSearch =
        customer.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        customer.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        customer.document.includes(debouncedSearch)

      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [customers, debouncedSearch, statusFilter])

  const stats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    prospects: customers.filter(c => c.status === 'prospect').length,
    totalOpportunities: opportunities.length,
    pipelineValue: opportunities
      .filter(o => o.stage !== 'won' && o.stage !== 'lost')
      .reduce((sum, o) => sum + o.value, 0),
    wonValue: opportunities
      .filter(o => o.stage === 'won')
      .reduce((sum, o) => sum + o.value, 0),
    conversionRate: 28.5
  }

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="CRM & Vendas"
        subtitle="Gestão de clientes e pipeline de vendas"
        kpiCount={4}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">CRM & Vendas</h1>
          <p className="text-muted-foreground">
            Gestão de clientes e pipeline de vendas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateOpportunityOpen} onOpenChange={setIsCreateOpportunityOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Target className="h-4 w-4" />
                Nova Oportunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Oportunidade</DialogTitle>
                <DialogDescription>
                  Registre uma nova oportunidade de venda
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="opp_title">Título *</Label>
                  <Input
                    id="opp_title"
                    value={opportunityForm.title}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, title: e.target.value })}
                    placeholder="Ex: Fornecimento de Stents"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opp_customer">Cliente *</Label>
                    <Select
                      value={opportunityForm.customer_id}
                      onValueChange={(value) => setOpportunityForm({ ...opportunityForm, customer_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_value">Valor *</Label>
                    <Input
                      id="opp_value"
                      type="number"
                      value={opportunityForm.value}
                      onChange={(e) => setOpportunityForm({ ...opportunityForm, value: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="opp_stage">Etapa</Label>
                    <Select
                      value={opportunityForm.stage}
                      onValueChange={(value: OpportunityStage) => setOpportunityForm({
                        ...opportunityForm,
                        stage: value,
                        probability: String(getStageProbability(value))
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="contact">Contato</SelectItem>
                        <SelectItem value="proposal">Proposta</SelectItem>
                        <SelectItem value="negotiation">Negociação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opp_date">Data Prevista Fechamento</Label>
                    <Input
                      id="opp_date"
                      type="date"
                      value={opportunityForm.expected_close_date}
                      onChange={(e) => setOpportunityForm({ ...opportunityForm, expected_close_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="opp_description">Descrição</Label>
                  <Textarea
                    id="opp_description"
                    value={opportunityForm.description}
                    onChange={(e) => setOpportunityForm({ ...opportunityForm, description: e.target.value })}
                    placeholder="Detalhes da oportunidade"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateOpportunityOpen(false)
                  resetOpportunityForm()
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOpportunity}>
                  Criar Oportunidade
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do cliente
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="document">CNPJ</Label>
                    <Input
                      id="document"
                      value={customerForm.document}
                      onChange={(e) => setCustomerForm({ ...customerForm, document: e.target.value })}
                      placeholder="00.000.000/0000-00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                      placeholder="(00) 0000-0000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select
                    value={customerForm.type}
                    onValueChange={(value: Customer['type']) => setCustomerForm({ ...customerForm, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="clinic">Clínica</SelectItem>
                      <SelectItem value="distributor">Distribuidor</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                    placeholder="Rua, número"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      id="city"
                      value={customerForm.city}
                      onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                      placeholder="São Paulo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Input
                      id="state"
                      value={customerForm.state}
                      onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })}
                      placeholder="SP"
                      maxLength={2}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsCreateCustomerOpen(false)
                  resetCustomerForm()
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateCustomer}>
                  Cadastrar Cliente
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.activeCustomers} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline
            </CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.pipelineValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {opportunities.filter(o => o.stage !== 'won' && o.stage !== 'lost').length} oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vendas Ganhas
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.wonValue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Este período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conversão
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Média histórica
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
          <TabsTrigger value="customers">Clientes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Pipeline Tab */}
        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Funil de Vendas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium">{opp.title}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {opp.customer_name} • Previsto: {formatDate(opp.expected_close_date)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(opp.value)}</div>
                        {getStageBadge(opp.stage)}
                      </div>
                    </div>
                    {opp.description && (
                      <div className="text-sm text-muted-foreground mb-2">{opp.description}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${opp.probability}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">{opp.probability}%</span>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageChange(opp, 'contact')}
                        disabled={opp.stage === 'won' || opp.stage === 'lost'}
                      >
                        Contato
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageChange(opp, 'proposal')}
                        disabled={opp.stage === 'won' || opp.stage === 'lost'}
                      >
                        Proposta
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageChange(opp, 'negotiation')}
                        disabled={opp.stage === 'won' || opp.stage === 'lost'}
                      >
                        Negociação
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageChange(opp, 'won')}
                        disabled={opp.stage === 'won' || opp.stage === 'lost'}
                        className="text-green-600"
                      >
                        Ganho
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStageChange(opp, 'lost')}
                        disabled={opp.stage === 'won' || opp.stage === 'lost'}
                        className="text-red-600"
                      >
                        Perdido
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, email ou CNPJ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="prospect">Prospects</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum cliente encontrado
                  </div>
                ) : (
                  filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="font-medium">{customer.name}</div>
                          <div className="text-sm text-muted-foreground">{customer.document}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {customer.phone}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Total de Compras</div>
                          <div className="text-sm font-bold">{formatCurrency(customer.total_purchases)}</div>
                        </div>
                        <div className="flex items-center justify-between">
                          {getStatusBadge(customer.status)}
                          <div className="flex items-center gap-2 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedCustomer(customer)
                                setIsViewCustomerOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(customer)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Receita Mensal vs Meta</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="valor"
                    stroke="#6366F1"
                    fillOpacity={1}
                    fill="url(#colorValor)"
                    name="Realizado"
                  />
                  <Line type="monotone" dataKey="meta" stroke="#10B981" strokeWidth={2} name="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={customerTypeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {customerTypeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={topCustomers} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="value" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* View Customer Dialog */}
      <Dialog open={isViewCustomerOpen} onOpenChange={setIsViewCustomerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Nome</Label>
                  <div className="text-lg font-medium">{selectedCustomer.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedCustomer.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">CNPJ</Label>
                  <div className="font-medium">{selectedCustomer.document}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tipo</Label>
                  <div className="font-medium capitalize">{selectedCustomer.type}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium">{selectedCustomer.email}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefone</Label>
                  <div className="font-medium">{selectedCustomer.phone}</div>
                </div>
              </div>

              {selectedCustomer.address && (
                <div>
                  <Label className="text-muted-foreground">Endereço</Label>
                  <div className="font-medium">
                    {selectedCustomer.address}, {selectedCustomer.city} - {selectedCustomer.state}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Total de Compras</Label>
                  <div className="text-2xl font-bold">{formatCurrency(selectedCustomer.total_purchases)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Última Compra</Label>
                  <div className="font-medium">
                    {selectedCustomer.last_purchase_date
                      ? formatDate(selectedCustomer.last_purchase_date)
                      : 'Nenhuma compra'}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="flex justify-end">
            <Button onClick={() => {
              setIsViewCustomerOpen(false)
              setSelectedCustomer(null)
            }}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
