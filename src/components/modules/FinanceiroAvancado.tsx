import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Label } from '@/components/ui/Label'
import { KPICard } from '@/components/ui/KPICard'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import { useFinanceiro } from '@/hooks/useFinanceiro'
import { toast } from 'sonner'
import {
  DollarSign,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  X,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  RefreshCw,
  Wallet,
  BarChart3
} from 'lucide-react'
import { InteractiveChart } from '@/components/charts/InteractiveCharts'

// Componente de carrossel de tabs
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'

/**
 * Módulo: Financeiro Avançado (#33)
 * Categoria: Financeiro & Faturamento
 * Design System: Dark Glass Medical (Neumorphism 3D)
 * 
 * Sub-Módulos:
 * - Contas a Pagar
 * - Contas a Receber
 * - Fluxo de Caixa
 * - Conciliação Bancária
 * - Tesouraria
 * 
 * Formulários:
 * 1. Lançar Conta a Pagar
 * 2. Lançar Conta a Receber
 * 3. Conciliação Bancária
 */

// Types
interface ContaPagar {
  id: string
  descricao: string
  fornecedor: string
  valor: number
  data_vencimento: string
  data_pagamento?: string
  categoria: string
  documento?: string
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
}

interface ContaReceber {
  id: string
  descricao: string
  cliente: string
  valor: number
  data_vencimento: string
  data_recebimento?: string
  categoria: string
  documento?: string
  status: 'pendente' | 'recebido' | 'vencido' | 'cancelado'
}

interface MovimentacaoBancaria {
  id: string
  data: string
  descricao: string
  tipo: 'credito' | 'debito'
  valor: number
  conciliado: boolean
  conta_vinculada?: string
}

// Mock data
const mockContasPagar: ContaPagar[] = [
  {
    id: '1',
    descricao: 'Compra de Próteses - Zimmer',
    fornecedor: 'Zimmer Biomet',
    valor: 45000,
    data_vencimento: '2025-12-05',
    categoria: 'Fornecedores',
    documento: 'NF-12345',
    status: 'pendente',
  },
  {
    id: '2',
    descricao: 'Aluguel do Escritório',
    fornecedor: 'Imobiliária Central',
    valor: 8500,
    data_vencimento: '2025-11-30',
    categoria: 'Despesas Fixas',
    status: 'pendente',
  },
  {
    id: '3',
    descricao: 'Material de Escritório',
    fornecedor: 'Kalunga',
    valor: 1200,
    data_vencimento: '2025-11-25',
    data_pagamento: '2025-11-25',
    categoria: 'Despesas Operacionais',
    documento: 'NF-54321',
    status: 'pago',
  },
]

const mockContasReceber: ContaReceber[] = [
  {
    id: '1',
    descricao: 'Cirurgia - Paciente João Silva',
    cliente: 'Hospital São Lucas',
    valor: 35000,
    data_vencimento: '2025-12-10',
    categoria: 'Cirurgias',
    documento: 'NF-98765',
    status: 'pendente',
  },
  {
    id: '2',
    descricao: 'Consignação - Kit Artroscopia',
    cliente: 'Hospital Albert Einstein',
    valor: 18500,
    data_vencimento: '2025-11-28',
    categoria: 'Consignação',
    documento: 'NF-87654',
    status: 'pendente',
  },
  {
    id: '3',
    descricao: 'Venda de Materiais OPME',
    cliente: 'Clínica Ortopédica',
    valor: 12000,
    data_vencimento: '2025-11-20',
    data_recebimento: '2025-11-20',
    categoria: 'Vendas',
    documento: 'NF-76543',
    status: 'recebido',
  },
]

const mockMovimentacoes: MovimentacaoBancaria[] = [
  { id: '1', data: '2025-11-28', descricao: 'TED Recebido - Hospital São Lucas', tipo: 'credito', valor: 35000, conciliado: false },
  { id: '2', data: '2025-11-27', descricao: 'Pagamento Fornecedor - Zimmer', tipo: 'debito', valor: 25000, conciliado: true, conta_vinculada: 'CP-001' },
  { id: '3', data: '2025-11-27', descricao: 'PIX Recebido - Clínica Ortopédica', tipo: 'credito', valor: 12000, conciliado: true, conta_vinculada: 'CR-003' },
  { id: '4', data: '2025-11-26', descricao: 'Tarifa Bancária', tipo: 'debito', valor: 45.90, conciliado: false },
]

const mockFluxoCaixa = [
  { mes: 'Jul', receitas: 280000, despesas: 195000, saldo: 85000 },
  { mes: 'Ago', receitas: 320000, despesas: 210000, saldo: 110000 },
  { mes: 'Set', receitas: 295000, despesas: 205000, saldo: 90000 },
  { mes: 'Out', receitas: 350000, despesas: 225000, saldo: 125000 },
  { mes: 'Nov', receitas: 380000, despesas: 240000, saldo: 140000 },
  { mes: 'Dez', receitas: 420000, despesas: 260000, saldo: 160000 },
]

const categoriasPagar = [
  'Fornecedores', 'Despesas Fixas', 'Despesas Operacionais', 
  'Impostos', 'Folha de Pagamento', 'Outros'
]

const categoriasReceber = [
  'Cirurgias', 'Consignação', 'Vendas', 
  'Licitações', 'Contratos', 'Outros'
]

export function FinanceiroAvancado() {
  const { isDark } = useTheme()
  const { data: financeiroData } = useFinanceiro()
  
  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('resumo')
  
  // Modal states
  const [isContaPagarOpen, setIsContaPagarOpen] = useState(false)
  const [isContaReceberOpen, setIsContaReceberOpen] = useState(false)
  const [isConciliacaoOpen, setIsConciliacaoOpen] = useState(false)
  
  // Selected items
  const [selectedContaPagar, setSelectedContaPagar] = useState<ContaPagar | null>(null)
  const [selectedContaReceber, setSelectedContaReceber] = useState<ContaReceber | null>(null)
  const [selectedMovimentacao, setSelectedMovimentacao] = useState<MovimentacaoBancaria | null>(null)
  
  // Form states
  const [formContaPagar, setFormContaPagar] = useState({
    descricao: '',
    fornecedor: '',
    valor: '',
    data_vencimento: '',
    categoria: '',
    documento: '',
    observacoes: ''
  })
  
  const [formContaReceber, setFormContaReceber] = useState({
    descricao: '',
    cliente: '',
    valor: '',
    data_vencimento: '',
    categoria: '',
    documento: '',
    observacoes: ''
  })
  
  const [formConciliacao, setFormConciliacao] = useState({
    conta_tipo: 'pagar' as 'pagar' | 'receber',
    conta_id: ''
  })

  // Use mock data
  const contasPagar = mockContasPagar
  const contasReceber = mockContasReceber
  const movimentacoes = mockMovimentacoes

  // Theme colors
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'
  const cardBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-50'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const chartGridColor = isDark ? '#252B44' : '#E2E8F0'

  // Handlers
  const handleSaveContaPagar = useCallback(() => {
    if (!formContaPagar.descricao || !formContaPagar.fornecedor || !formContaPagar.valor || !formContaPagar.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedContaPagar ? 'Conta a pagar atualizada!' : 'Conta a pagar cadastrada!')
    setIsContaPagarOpen(false)
    setSelectedContaPagar(null)
    setFormContaPagar({ descricao: '', fornecedor: '', valor: '', data_vencimento: '', categoria: '', documento: '', observacoes: '' })
  }, [formContaPagar, selectedContaPagar])

  const handleSaveContaReceber = useCallback(() => {
    if (!formContaReceber.descricao || !formContaReceber.cliente || !formContaReceber.valor || !formContaReceber.data_vencimento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    toast.success(selectedContaReceber ? 'Conta a receber atualizada!' : 'Conta a receber cadastrada!')
    setIsContaReceberOpen(false)
    setSelectedContaReceber(null)
    setFormContaReceber({ descricao: '', cliente: '', valor: '', data_vencimento: '', categoria: '', documento: '', observacoes: '' })
  }, [formContaReceber, selectedContaReceber])

  const handleConciliar = useCallback(() => {
    if (!formConciliacao.conta_id) {
      toast.error('Selecione uma conta para conciliar')
      return
    }
    toast.success('Movimentação conciliada com sucesso!')
    setIsConciliacaoOpen(false)
    setSelectedMovimentacao(null)
    setFormConciliacao({ conta_tipo: 'pagar', conta_id: '' })
  }, [formConciliacao])

  const openConciliacao = (mov: MovimentacaoBancaria) => {
    setSelectedMovimentacao(mov)
    setFormConciliacao({
      conta_tipo: mov.tipo === 'debito' ? 'pagar' : 'receber',
      conta_id: ''
    })
    setIsConciliacaoOpen(true)
  }

  // Stats
  const totalPagar = contasPagar.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0)
  const totalReceber = contasReceber.filter(c => c.status === 'pendente').reduce((acc, c) => acc + c.valor, 0)
  const saldoProjetado = totalReceber - totalPagar
  const contasVencidas = contasPagar.filter(c => c.status === 'vencido').length + contasReceber.filter(c => c.status === 'vencido').length

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string }> = {
      pendente: { color: 'bg-[#8b5cf6]/20 text-[#8b5cf6]', label: 'Pendente' },
      pago: { color: 'bg-[#10B981]/20 text-[#10B981]', label: 'Pago' },
      recebido: { color: 'bg-[#10B981]/20 text-[#10B981]', label: 'Recebido' },
      vencido: { color: 'bg-[#EF4444]/20 text-[#EF4444]', label: 'Vencido' },
      cancelado: { color: 'bg-[#64748B]/20 text-[#64748B]', label: 'Cancelado' },
    }
    const config = statusConfig[status] || statusConfig.pendente
    return <Badge className={`${config.color} border-none`}>{config.label}</Badge>
  }

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) => {
    // Map de cores para classes Tailwind
    const getColorClass = (color: string) => {
      const colorMap: Record<string, string> = {
        '#10B981': 'text-emerald-500',
        '#EF4444': 'text-red-500',
        '#6366F1': 'text-indigo-500',
        '#8b5cf6': 'text-violet-500',
        '#3B82F6': 'text-blue-500',
      }
      return colorMap[color] || 'text-slate-400'
    }

    if (active && payload && payload.length) {
      return (
        <div className={`px-4 py-3 rounded-xl ${isDark ? 'bg-[#1A1F35] text-white' : 'bg-white text-slate-900'} shadow-lg`}>
          <p className={`text-sm font-medium ${textSecondary} mb-2`}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className={`text-sm ${getColorClass(entry.color)}`}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-emerald-500/10 ${
              isDark
                ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
                : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
            }`}
          >
            <DollarSign className="w-7 h-7 text-emerald-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>Financeiro Avançado</h1>
            <p className={`mt-1 ${textSecondary}`}>Gestão financeira completa</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsContaPagarOpen(true)}>
            <ArrowDownRight className="w-4 h-4 mr-1 text-[#EF4444]" />
            Conta a Pagar
          </Button>
          <Button onClick={() => setIsContaReceberOpen(true)}>
            <ArrowUpRight className="w-4 h-4 mr-1" />
            Conta a Receber
          </Button>
        </div>
      </div>

      {/* Carrossel de Categorias Financeiras */}
      <CadastroTabsCarousel
        tabs={[
          { id: 'pagar', label: 'Contas a Pagar', count: contasPagar.filter(c => c.status === 'pendente').length, delta: 3, icon: ArrowDownRight },
          { id: 'receber', label: 'Contas a Receber', count: contasReceber.filter(c => c.status === 'pendente').length, delta: 8, icon: ArrowUpRight },
          { id: 'vencidas', label: 'Vencidas', count: contasVencidas, icon: AlertCircle },
          { id: 'pagas', label: 'Pagas/Recebidas', count: contasPagar.filter(c => c.status === 'pago').length + contasReceber.filter(c => c.status === 'recebido').length, delta: 12, icon: CheckCircle },
          { id: 'fluxo', label: 'Fluxo de Caixa', count: movimentacoes.length, icon: BarChart3 },
        ]}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Contas a Receber"
          value={formatCurrency(totalReceber)}
          icon={TrendingUp}
          iconColor="#10B981"
        />
        <KPICard
          title="Contas a Pagar"
          value={formatCurrency(totalPagar)}
          icon={TrendingDown}
          iconColor="#EF4444"
        />
        <KPICard
          title="Saldo Projetado"
          value={formatCurrency(saldoProjetado)}
          icon={Wallet}
          iconColor={saldoProjetado >= 0 ? '#10B981' : '#EF4444'}
        />
        <KPICard
          title="Contas Vencidas"
          value={contasVencidas}
          icon={AlertCircle}
          iconColor="#8b5cf6"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="resumo" className="rounded-lg px-4 py-2">
            <BarChart3 className="w-4 h-4 mr-2" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="pagar" className="rounded-lg px-4 py-2">
            <ArrowDownRight className="w-4 h-4 mr-2 text-[#EF4444]" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger value="receber" className="rounded-lg px-4 py-2">
            <ArrowUpRight className="w-4 h-4 mr-2 text-[#10B981]" />
            Contas a Receber
          </TabsTrigger>
          <TabsTrigger value="conciliacao" className="rounded-lg px-4 py-2">
            <RefreshCw className="w-4 h-4 mr-2" />
            Conciliação
          </TabsTrigger>
        </TabsList>

        {/* Resumo Tab */}
        <TabsContent value="resumo" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Fluxo de Caixa com Drill-Down */}
            <InteractiveChart
              title="Fluxo de Caixa (6 meses)"
              subtitle="Receitas vs Despesas com ML scoring"
              type="area"
              data={mockFluxoCaixa}
              dataKey="receitas"
              xAxisKey="mes"
              showTrend
              enableDrillDown
              drillDownLevels={[
                {
                  name: 'Por Centro de Custo',
                  data: [
                    { mes: 'Comercial', receitas: 85000 },
                    { mes: 'Operacional', receitas: 45000 },
                    { mes: 'Administrativo', receitas: 25000 },
                  ]
                },
                {
                  name: 'Por Conta',
                  data: [
                    { mes: 'Vendas OPME', receitas: 120000 },
                    { mes: 'Consignação', receitas: 25000 },
                    { mes: 'Serviços', receitas: 10000 },
                  ]
                }
              ]}
              onExport={() => console.log('Exportar fluxo de caixa')}
            />

            {/* Saldo Acumulado com Drill-Down */}
            <InteractiveChart
              title="Saldo Acumulado"
              subtitle="Projeção 6 meses com IA"
              type="line"
              data={mockFluxoCaixa}
              dataKey="saldo"
              xAxisKey="mes"
              showTrend
              enableDrillDown
              drillDownLevels={[
                {
                  name: 'Por Banco',
                  data: [
                    { mes: 'Banco A', saldo: 450000 },
                    { mes: 'Banco B', saldo: 280000 },
                    { mes: 'Caixa', saldo: 120000 },
                  ]
                }
              ]}
              onExport={() => console.log('Exportar saldo')}
            />
          </div>

          {/* Próximos Vencimentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#8b5cf6]" />
                Próximos Vencimentos (7 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A Pagar */}
                <div className="space-y-3">
                  <h4 className={`font-semibold ${textSecondary} flex items-center gap-2`}>
                    <ArrowDownRight className="w-4 h-4 text-[#EF4444]" />
                    A Pagar
                  </h4>
                  {contasPagar.filter(c => c.status === 'pendente').slice(0, 3).map((conta) => (
                    <div key={conta.id} className={`p-3 rounded-xl ${cardBg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={textPrimary}>{conta.descricao}</div>
                          <div className={`text-sm ${textMuted}`}>{conta.fornecedor}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#EF4444] font-semibold">{formatCurrency(conta.valor)}</div>
                          <div className={`text-xs ${textMuted}`}>{conta.data_vencimento}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* A Receber */}
                <div className="space-y-3">
                  <h4 className={`font-semibold ${textSecondary} flex items-center gap-2`}>
                    <ArrowUpRight className="w-4 h-4 text-[#10B981]" />
                    A Receber
                  </h4>
                  {contasReceber.filter(c => c.status === 'pendente').slice(0, 3).map((conta) => (
                    <div key={conta.id} className={`p-3 rounded-xl ${cardBg}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className={textPrimary}>{conta.descricao}</div>
                          <div className={`text-sm ${textMuted}`}>{conta.cliente}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[#10B981] font-semibold">{formatCurrency(conta.valor)}</div>
                          <div className={`text-xs ${textMuted}`}>{conta.data_vencimento}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Pagar Tab */}
        <TabsContent value="pagar" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary"><Filter className="w-4 h-4" /></Button>
                  <Button variant="secondary"><Download className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Descrição</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Fornecedor</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Valor</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Vencimento</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasPagar.map((conta) => (
                      <tr key={conta.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4`}>
                          <div className={textPrimary}>{conta.descricao}</div>
                          <div className={`text-xs ${textMuted}`}>{conta.categoria}</div>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{conta.fornecedor}</td>
                        <td className={`py-3 px-4 text-[#EF4444] font-semibold`}>{formatCurrency(conta.valor)}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{conta.data_vencimento}</td>
                        <td className="py-3 px-4">{getStatusBadge(conta.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {conta.status === 'pendente' && (
                              <Button size="sm" variant="ghost" onClick={() => toast.success('Pagamento registrado!')}>
                                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contas a Receber Tab */}
        <TabsContent value="receber" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <Input placeholder="Buscar..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary"><Filter className="w-4 h-4" /></Button>
                  <Button variant="secondary"><Download className="w-4 h-4" /></Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Descrição</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Cliente</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Valor</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Vencimento</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Status</th>
                      <th className={`text-left py-3 px-4 font-semibold ${textSecondary} text-sm`}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contasReceber.map((conta) => (
                      <tr key={conta.id} className={`border-b ${isDark ? 'border-white/5' : 'border-slate-100'} hover:bg-white/5`}>
                        <td className={`py-3 px-4`}>
                          <div className={textPrimary}>{conta.descricao}</div>
                          <div className={`text-xs ${textMuted}`}>{conta.categoria}</div>
                        </td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{conta.cliente}</td>
                        <td className={`py-3 px-4 text-[#10B981] font-semibold`}>{formatCurrency(conta.valor)}</td>
                        <td className={`py-3 px-4 ${textSecondary}`}>{conta.data_vencimento}</td>
                        <td className="py-3 px-4">{getStatusBadge(conta.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            {conta.status === 'pendente' && (
                              <Button size="sm" variant="ghost" onClick={() => toast.success('Recebimento registrado!')}>
                                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                              </Button>
                            )}
                            <Button size="sm" variant="ghost">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conciliação Tab */}
        <TabsContent value="conciliacao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-[#6366F1]" />
                Conciliação Bancária
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {movimentacoes.map((mov) => (
                  <div
                    key={mov.id}
                    className={`p-4 rounded-xl ${cardBg} ${
                      isDark
                        ? 'shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                        : 'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          mov.tipo === 'credito' ? 'bg-[#10B981]/20' : 'bg-[#EF4444]/20'
                        }`}>
                          {mov.tipo === 'credito' ? (
                            <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
                          ) : (
                            <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />
                          )}
                        </div>
                        <div>
                          <div className={textPrimary}>{mov.descricao}</div>
                          <div className={`text-sm ${textMuted}`}>{mov.data}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-semibold ${mov.tipo === 'credito' ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                            {mov.tipo === 'credito' ? '+' : '-'}{formatCurrency(mov.valor)}
                          </div>
                          {mov.conciliado ? (
                            <Badge className="bg-[#10B981]/20 text-[#10B981] border-none text-xs">Conciliado</Badge>
                          ) : (
                            <Badge className="bg-[#8b5cf6]/20 text-[#8b5cf6] border-none text-xs">Pendente</Badge>
                          )}
                        </div>
                        {!mov.conciliado && (
                          <Button size="sm" variant="secondary" onClick={() => openConciliacao(mov)}>
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Conciliar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Conta a Pagar */}
      <Dialog open={isContaPagarOpen} onOpenChange={setIsContaPagarOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowDownRight className="w-5 h-5 text-[#EF4444]" />
              {selectedContaPagar ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
            </DialogTitle>
            <DialogDescription>Preencha os dados da conta</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descricao_pagar">Descrição *</Label>
              <Input
                id="descricao_pagar"
                placeholder="Descrição da conta"
                value={formContaPagar.descricao}
                onChange={(e) => setFormContaPagar({ ...formContaPagar, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fornecedor_pagar">Fornecedor *</Label>
                <Input
                  id="fornecedor_pagar"
                  placeholder="Nome do fornecedor"
                  value={formContaPagar.fornecedor}
                  onChange={(e) => setFormContaPagar({ ...formContaPagar, fornecedor: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_pagar">Valor (R$) *</Label>
                <Input
                  id="valor_pagar"
                  type="number"
                  placeholder="0,00"
                  value={formContaPagar.valor}
                  onChange={(e) => setFormContaPagar({ ...formContaPagar, valor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vencimento_pagar">Data de Vencimento *</Label>
                <Input
                  id="vencimento_pagar"
                  type="date"
                  value={formContaPagar.data_vencimento}
                  onChange={(e) => setFormContaPagar({ ...formContaPagar, data_vencimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria_pagar">Categoria</Label>
                <Select value={formContaPagar.categoria} onValueChange={(v) => setFormContaPagar({ ...formContaPagar, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categoriasPagar.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento_pagar">Documento (NF, Boleto, etc)</Label>
              <Input
                id="documento_pagar"
                placeholder="Número do documento"
                value={formContaPagar.documento}
                onChange={(e) => setFormContaPagar({ ...formContaPagar, documento: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsContaPagarOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveContaPagar}>
              <DollarSign className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Conta a Receber */}
      <Dialog open={isContaReceberOpen} onOpenChange={setIsContaReceberOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-[#10B981]" />
              {selectedContaReceber ? 'Editar Conta a Receber' : 'Nova Conta a Receber'}
            </DialogTitle>
            <DialogDescription>Preencha os dados da conta</DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="descricao_receber">Descrição *</Label>
              <Input
                id="descricao_receber"
                placeholder="Descrição da conta"
                value={formContaReceber.descricao}
                onChange={(e) => setFormContaReceber({ ...formContaReceber, descricao: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cliente_receber">Cliente *</Label>
                <Input
                  id="cliente_receber"
                  placeholder="Nome do cliente"
                  value={formContaReceber.cliente}
                  onChange={(e) => setFormContaReceber({ ...formContaReceber, cliente: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="valor_receber">Valor (R$) *</Label>
                <Input
                  id="valor_receber"
                  type="number"
                  placeholder="0,00"
                  value={formContaReceber.valor}
                  onChange={(e) => setFormContaReceber({ ...formContaReceber, valor: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vencimento_receber">Data de Vencimento *</Label>
                <Input
                  id="vencimento_receber"
                  type="date"
                  value={formContaReceber.data_vencimento}
                  onChange={(e) => setFormContaReceber({ ...formContaReceber, data_vencimento: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria_receber">Categoria</Label>
                <Select value={formContaReceber.categoria} onValueChange={(v) => setFormContaReceber({ ...formContaReceber, categoria: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {categoriasReceber.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="documento_receber">Documento (NF, Boleto, etc)</Label>
              <Input
                id="documento_receber"
                placeholder="Número do documento"
                value={formContaReceber.documento}
                onChange={(e) => setFormContaReceber({ ...formContaReceber, documento: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsContaReceberOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleSaveContaReceber}>
              <DollarSign className="w-4 h-4 mr-1" />Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Conciliação */}
      <Dialog open={isConciliacaoOpen} onOpenChange={setIsConciliacaoOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-[#6366F1]" />
              Conciliar Movimentação
            </DialogTitle>
            <DialogDescription>
              {selectedMovimentacao && `${selectedMovimentacao.descricao} - ${formatCurrency(selectedMovimentacao.valor)}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tipo de Conta</Label>
              <Select value={formConciliacao.conta_tipo} onValueChange={(v: 'pagar' | 'receber') => setFormConciliacao({ ...formConciliacao, conta_tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pagar">Conta a Pagar</SelectItem>
                  <SelectItem value="receber">Conta a Receber</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Selecione a Conta</Label>
              <Select value={formConciliacao.conta_id} onValueChange={(v) => setFormConciliacao({ ...formConciliacao, conta_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione uma conta" /></SelectTrigger>
                <SelectContent>
                  {formConciliacao.conta_tipo === 'pagar' 
                    ? contasPagar.filter(c => c.status === 'pendente').map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.descricao} - {formatCurrency(c.valor)}</SelectItem>
                      ))
                    : contasReceber.filter(c => c.status === 'pendente').map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.descricao} - {formatCurrency(c.valor)}</SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsConciliacaoOpen(false)}>
              <X className="w-4 h-4 mr-1" />Cancelar
            </Button>
            <Button onClick={handleConciliar}>
              <RefreshCw className="w-4 h-4 mr-1" />Conciliar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
