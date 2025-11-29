import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency } from '@/lib/utils/formatters'
import { ModuleLoadingSkeleton } from '@/components/common/ModuleLoadingSkeleton'
import { useDashboardKPIs, useDashboardStats } from '@/hooks/queries/useDashboardData'
import { useTheme } from '@/hooks/useTheme'
import { useDashboardRealtime } from '@/hooks/useRealtimeSubscription'
import { CalendarioCompacto } from './dashboard/CalendarioCompacto'
import {
  Calendar, DollarSign, AlertCircle, BrainCircuit,
  TrendingUp, Clock, Star, Activity, BarChart2, PieChart as PieChartIcon,
  Plus, FileText, ShoppingCart, UserPlus, Settings
} from 'lucide-react'
import { InteractiveChart } from '@/components/charts/InteractiveCharts'

export function Dashboard() {
  const { isDark } = useTheme()
  
  // React Query hooks for data fetching
  const { data: kpis, isLoading: kpisLoading } = useDashboardKPIs()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  
  // Enable real-time updates for dashboard data
  useDashboardRealtime()

  // Combined loading state
  const loading = kpisLoading || statsLoading

  // Extract chart data from stats (with fallback to empty arrays)
  const revenueData = stats?.revenueData || []
  const surgeriesData = stats?.surgeriesData || []
  const productCategoryData = stats?.productCategoryData || []

  if (loading) {
    return (
      <ModuleLoadingSkeleton
        title="Dashboard"
        subtitle="Visão geral do sistema ICARUS v5.0"
        kpiCount={4}
      />
    )
  }

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
  const chartGridColor = isDark ? '#252B44' : '#E2E8F0'
  const chartLabelColor = isDark ? '#64748B' : '#64748B'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className={`text-3xl font-bold ${textPrimary} mb-2`} data-testid="dashboard-heading">Dashboard</h1>
        <p className={textSecondary}>
          Visão geral do sistema ICARUS v5.0
        </p>
      </div>

      {/* SEÇÃO SUPERIOR: KPIs + Calendário */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* KPIs - 3 colunas em desktop */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Cirurgias Hoje - Calendar (Cyan) */}
          <KPICard
            title="Cirurgias Hoje"
            value={kpis?.surgeriesToday || 0}
            icon={Calendar}
            iconColor="#2DD4BF"
            trend={{
              value: Math.abs(kpis?.surgeriesChange || 0),
              direction: (kpis?.surgeriesChange || 0) > 0 ? 'up' : (kpis?.surgeriesChange || 0) < 0 ? 'down' : 'stable'
            }}
          />

          {/* Estoque Crítico - AlertCircle (Red) */}
          <KPICard
            title="Estoque Crítico"
            value={kpis?.criticalStock || 0}
            icon={AlertCircle}
            iconColor="#EF4444"
          />

          {/* Faturamento - DollarSign (Green) */}
          <KPICard
            title="Faturamento"
            value={formatCurrency(kpis?.revenue || 0)}
            icon={DollarSign}
            iconColor="#10B981"
            trend={{
              value: kpis?.revenueChange || 0,
              direction: 'up'
            }}
          />

          {/* IA Status - BrainCircuit (Purple) */}
          <KPICard
            title="IcarusBrain"
            value={(kpis?.aiStatus || 'offline') === 'online' ? 'Online' : 'Offline'}
            icon={BrainCircuit}
            iconColor="#8B5CF6"
          />
        </div>

        {/* Calendário Compacto - 1 coluna à direita */}
        <div className="xl:col-span-1 xl:row-span-2">
          <CalendarioCompacto />
        </div>

        {/* Ações Rápidas - 3 colunas abaixo dos KPIs */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className={`text-lg font-semibold ${textPrimary}`}>
                Ações Rápidas
              </CardTitle>
              <p className={`text-sm ${textSecondary}`}>
                Acesso rápido às operações mais utilizadas
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {/* Novo Pedido */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/compras-gestao'}
                >
                  <Plus className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Novo Pedido</span>
                </button>

                {/* Nova NF */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/faturamento-nfe-completo'}
                >
                  <FileText className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Nova NF</span>
                </button>

                {/* Orçamento */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/cirurgias-procedimentos'}
                >
                  <ShoppingCart className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Orçamento</span>
                </button>

                {/* Cadastro */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/gestao-cadastros'}
                >
                  <UserPlus className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Cadastro</span>
                </button>

                {/* Relatórios */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/relatorios-executivos'}
                >
                  <BarChart2 className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Relatórios</span>
                </button>

                {/* Configurar */}
                <button
                  className="btn-quick-action flex flex-col items-center justify-center min-w-[110px] h-[85px] px-3 py-2"
                  onClick={() => window.location.href = '/configuracoes-system'}
                >
                  <Settings className="w-5 h-5 mb-1.5" strokeWidth={2} />
                  <span className="text-xs font-medium">Configurar</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tabs - Conteúdo principal */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList 
          className={`${inputBg} p-1 rounded-xl ${
            isDark 
              ? 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-2px_-2px_4px_rgba(255,255,255,0.02)]'
              : 'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-2px_-2px_4px_rgba(255,255,255,0.8)]'
          }`}
        >
          <TabsTrigger 
            value="overview" 
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <BarChart2 className="w-4 h-4 mr-2 text-[#6366F1]" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <Activity className="w-4 h-4 mr-2 text-[#10B981]" />
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="ai"
            className={`data-[state=active]:bg-[${isDark ? '#1A1F35' : '#FFFFFF'}] data-[state=active]:text-${isDark ? 'white' : 'slate-900'} ${textSecondary} rounded-lg px-4 py-2 transition-all`}
          >
            <BrainCircuit className="w-4 h-4 mr-2 text-[#8B5CF6]" />
            IA Insights
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Revenue Chart with Drill-Down */}
            <InteractiveChart
              title="Faturamento Mensal"
              subtitle="Receita consolidada com tendência"
              type="area"
              data={revenueData}
              dataKey="valor"
              xAxisKey="month"
              showTrend
              enableDrillDown
              drillDownLevels={[
                {
                  name: 'Por Convênio',
                  data: [
                    { month: 'Particular', valor: 45000 },
                    { month: 'Planos de Saúde', valor: 85000 },
                    { month: 'SUS', valor: 25000 },
                  ]
                },
                {
                  name: 'Por Hospital',
                  data: [
                    { month: 'Hospital A', valor: 60000 },
                    { month: 'Hospital B', valor: 50000 },
                    { month: 'Hospital C', valor: 45000 },
                  ]
                }
              ]}
              onExport={() => console.log('Exportar faturamento')}
            />

            {/* Surgeries Chart with Drill-Down */}
            <InteractiveChart
              title="Cirurgias da Semana"
              subtitle="Volume de procedimentos"
              type="bar"
              data={surgeriesData}
              dataKey="cirurgias"
              xAxisKey="dia"
              showTrend
              enableDrillDown
              drillDownLevels={[
                {
                  name: 'Por Especialidade',
                  data: [
                    { dia: 'Cardíaca', cirurgias: 25 },
                    { dia: 'Vascular', cirurgias: 18 },
                    { dia: 'Ortopédica', cirurgias: 12 },
                  ]
                }
              ]}
              onExport={() => console.log('Exportar cirurgias')}
            />
          </div>

          {/* Category Distribution with Drill-Down */}
          <InteractiveChart
            title="Distribuição por Categoria"
            subtitle="Análise de produtos OPME"
            type="pie"
            data={productCategoryData}
            dataKey="value"
            xAxisKey="name"
            enableDrillDown
            drillDownLevels={[
              {
                name: 'Por Fabricante',
                data: [
                  { name: 'Abbott', value: 35 },
                  { name: 'Medtronic', value: 28 },
                  { name: 'Boston Scientific', value: 22 },
                  { name: 'Outros', value: 15 },
                ]
              }
            ]}
            onExport={() => console.log('Exportar categorias')}
          />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Conversion Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-[#10B981]" strokeWidth={2.5} />
                  </div>
                  Taxa de Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>87.5%</div>
                <Badge 
                  className="mt-2 bg-[#10B981]/20 text-[#10B981] border-none"
                >
                  +5.2% este mês
                </Badge>
              </CardContent>
            </Card>

            {/* Surgery Time */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-[#3B82F6]" strokeWidth={2.5} />
                  </div>
                  Tempo Médio Cirurgia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>2h 45m</div>
                <Badge 
                  className="mt-2 bg-[#3B82F6]/20 text-[#3B82F6] border-none"
                >
                  -15 min vs média
                </Badge>
              </CardContent>
            </Card>

            {/* Customer Satisfaction */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <div 
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isDark 
                        ? 'bg-[#1A1F35] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(255,255,255,0.02)]'
                        : 'bg-slate-100 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.05),inset_-1px_-1px_3px_rgba(255,255,255,0.8)]'
                    }`}
                  >
                    <Star className="w-4 h-4 text-[#8b5cf6]" strokeWidth={2.5} />
                  </div>
                  Satisfação Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${textPrimary}`}>4.8/5.0</div>
                <Badge 
                  className="mt-2 bg-[#10B981]/20 text-[#10B981] border-none"
                >
                  Excelente
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center bg-linear-to-br from-indigo-500 to-purple-500 shadow-[0_4px_15px_rgba(99,102,241,0.4)]"
                >
                  <BrainCircuit className="h-5 w-5 text-white" strokeWidth={2} />
                </div>
                <CardTitle>Insights de Inteligência Artificial</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* AI Insight 1 - Optimization */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-blue-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <Activity className="w-5 h-5 text-[#3B82F6]" />
                  Oportunidade de Otimização
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  O IcarusBrain identificou que aumentar o estoque de produtos de Cardiologia
                  em 15% pode reduzir perdas de vendas em até R$ 12.500/mês.
                </p>
                <Badge className="mt-3 bg-[#3B82F6]/20 text-[#3B82F6] border-none">
                  Confiança: 92%
                </Badge>
              </div>

              {/* AI Insight 2 - Positive Forecast */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-emerald-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  Previsão Positiva
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  Tendência de crescimento de 18% em procedimentos de Cirurgia Vascular
                  para o próximo trimestre baseado em dados históricos.
                </p>
                <Badge className="mt-3 bg-[#10B981]/20 text-[#10B981] border-none">
                  Confiança: 88%
                </Badge>
              </div>

              {/* AI Insight 3 - Attention Needed */}
              <div 
                className={`p-4 rounded-xl border-l-4 border-l-violet-500 ${
                  isDark 
                    ? 'bg-[#1A1F35] shadow-[4px_4px_8px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(255,255,255,0.02)]'
                    : 'bg-slate-50 shadow-[3px_3px_6px_rgba(0,0,0,0.06),-2px_-2px_4px_rgba(255,255,255,0.9)]'
                }`}
              >
                <div className={`font-medium ${textPrimary} mb-2 flex items-center gap-2`}>
                  <AlertCircle className="w-5 h-5 text-[#8b5cf6]" />
                  Atenção Necessária
                </div>
                <p className={`text-sm ${textSecondary}`}>
                  3 clientes com alto risco de inadimplência detectados.
                  Recomenda-se contato proativo para negociação.
                </p>
                <Badge className="mt-3 bg-[#8b5cf6]/20 text-[#8b5cf6] border-none">
                  Confiança: 85%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
