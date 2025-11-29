import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { useKPIData, useModuleStats } from '@/hooks/useModuleData'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Download,
  Calendar,
  Filter,
  Loader2
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

/**
 * Módulo: KPI Dashboard Module - VERSÃO COM SUPABASE
 * Categoria: Dashboard & Analytics
 * Descrição: Dashboard executivo com dados reais do Supabase
 * Design System: Dark Glass Medical
 * 
 * EXEMPLO DE INTEGRAÇÃO DE DADOS REAIS
 */

export function KPIDashboardModule() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('financeiro')
  const [periodo, setPeriodo] = useState('mes')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  // ========================================
  // INTEGRAÇÃO COM SUPABASE
  // ========================================
  
  // Busca KPIs do banco de dados
  const { data: kpisData, isLoading: kpisLoading } = useKPIData()
  
  // Busca estatísticas agregadas
  const { data: statsVendas } = useModuleStats('vendas', ['count', 'sum'])
  const { data: statsCirurgias } = useModuleStats('cirurgias', ['count'])
  const { data: statsEstoque } = useModuleStats('estoque', ['count'])

  // ========================================
  // FALLBACK PARA MOCK DATA (se não houver dados reais)
  // ========================================
  const useMockData = !kpisData || kpisData.length === 0

  // Mock data (mantido como fallback)
  const mockFaturamentoData = [
    { mes: 'Jan', valor: 125000, meta: 150000 },
    { mes: 'Fev', valor: 142000, meta: 150000 },
    { mes: 'Mar', valor: 158000, meta: 150000 },
    { mes: 'Abr', valor: 135000, meta: 150000 },
    { mes: 'Mai', valor: 178000, meta: 150000 },
    { mes: 'Jun', valor: 192000, meta: 150000 },
  ]

  // ========================================
  // PROCESSAMENTO DE DADOS REAIS
  // ========================================
  
  // Converte dados do Supabase para formato do gráfico
  const faturamentoData = useMockData 
    ? mockFaturamentoData 
    : (kpisData || [])
        .filter(kpi => kpi.categoria === 'financeiro')
        .map(kpi => ({
          mes: new Date(kpi.mes).toLocaleDateString('pt-BR', { month: 'short' }),
          valor: kpi.valor_real,
          meta: kpi.valor_meta
        }))

  // KPIs calculados a partir de dados reais
  const kpisFinanceiros = useMockData ? {
    faturamentoMes: 192000,
    receitaRecorrente: 85000,
    ticketMedio: 4250,
    margemBruta: 38.5,
    tendenciaFaturamento: 28,
    tendenciaReceita: 12,
    tendenciaTicket: 5,
    tendenciaMargem: -2
  } : {
    faturamentoMes: kpisData?.find(k => k.tipo === 'faturamento_mes')?.valor || 0,
    receitaRecorrente: kpisData?.find(k => k.tipo === 'receita_recorrente')?.valor || 0,
    ticketMedio: kpisData?.find(k => k.tipo === 'ticket_medio')?.valor || 0,
    margemBruta: kpisData?.find(k => k.tipo === 'margem_bruta')?.valor || 0,
    tendenciaFaturamento: kpisData?.find(k => k.tipo === 'faturamento_mes')?.tendencia || 0,
    tendenciaReceita: kpisData?.find(k => k.tipo === 'receita_recorrente')?.tendencia || 0,
    tendenciaTicket: kpisData?.find(k => k.tipo === 'ticket_medio')?.tendencia || 0,
    tendenciaMargem: kpisData?.find(k => k.tipo === 'margem_bruta')?.tendencia || 0,
  }

  // ========================================
  // TABS DO CAROUSEL
  // ========================================
  const carouselTabs = [
    { 
      id: 'financeiro', 
      label: 'Financeiro', 
      count: statsVendas?.total || 12, 
      delta: 8, 
      icon: DollarSign 
    },
    { 
      id: 'operacional', 
      label: 'Operacional', 
      count: statsEstoque?.total || 18, 
      delta: 5, 
      icon: Package 
    },
    { 
      id: 'comercial', 
      label: 'Comercial', 
      count: 15, 
      delta: 12, 
      icon: TrendingUp 
    },
    { 
      id: 'rh', 
      label: 'RH', 
      count: 9, 
      delta: 3, 
      icon: Users 
    },
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

  // ========================================
  // LOADING STATE
  // ========================================
  if (kpisLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-500/10 ${
            isDark
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}>
            <BarChart3 className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${textPrimary}`}>
              KPI Dashboard Consolidado
              {useMockData && <span className={`text-sm ${textMuted} ml-2`}>(Mock Data)</span>}
            </h1>
            <p className={`mt-1 ${textSecondary}`}>Visão executiva de indicadores-chave</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPeriodo(periodo === 'mes' ? 'ano' : 'mes')}>
            <Calendar className="w-4 h-4 mr-2" />
            {periodo === 'mes' ? 'Mensal' : 'Anual'}
          </Button>
          <Button variant="secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Carrossel de Categorias */}
      <CadastroTabsCarousel
        tabs={carouselTabs}
        active={activeTab}
        onChange={setActiveTab}
      />

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="rh">RH</TabsTrigger>
        </TabsList>

        {/* Tab Financeiro - COM DADOS REAIS */}
        <TabsContent value="financeiro" className="space-y-4">
          {/* KPI Cards - DADOS DO SUPABASE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Faturamento Mês</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(kpisFinanceiros.faturamentoMes)}
                </div>
                <Badge className={`mt-2 ${
                  kpisFinanceiros.tendenciaFaturamento >= 0 
                    ? 'bg-emerald-500/20 text-emerald-500' 
                    : 'bg-red-500/20 text-red-500'
                } border-none`}>
                  {kpisFinanceiros.tendenciaFaturamento >= 0 ? '+' : ''}
                  {kpisFinanceiros.tendenciaFaturamento}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Receita Recorrente</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(kpisFinanceiros.receitaRecorrente)}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +{kpisFinanceiros.tendenciaReceita}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Ticket Médio</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(kpisFinanceiros.ticketMedio)}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +{kpisFinanceiros.tendenciaTicket}%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Margem Bruta</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {kpisFinanceiros.margemBruta}%
                </div>
                <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-none">
                  {kpisFinanceiros.tendenciaMargem}%
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Faturamento vs Meta - COM DADOS REAIS */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento vs Meta {useMockData && '(Mock Data)'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={faturamentoData}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="mes" stroke={textMuted} />
                  <YAxis stroke={textMuted} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="#6366F1" 
                    fillOpacity={1} 
                    fill="url(#colorValor)" 
                    name="Faturamento"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="meta" 
                    stroke="#10B981" 
                    fill="none" 
                    strokeDasharray="5 5"
                    name="Meta"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras tabs mantidas como no original... */}
      </Tabs>
    </div>
  )
}

