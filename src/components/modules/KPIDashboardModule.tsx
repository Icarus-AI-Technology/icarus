import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import CadastroTabsCarousel from '@/components/cadastros/CadastroTabsCarousel'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Package,
  Download,
  Calendar,
  Filter
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
 * Módulo: KPI Dashboard Consolidado
 * Categoria: Dashboard & Analytics
 * Descrição: Dashboard executivo de KPIs com visão consolidada
 * Design System: Dark Glass Medical
 */

export function KPIDashboardModule() {
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('financeiro')
  const [periodo, setPeriodo] = useState('mes')

  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const textMuted = isDark ? 'text-[#64748B]' : 'text-slate-500'

  // Tabs do carrossel
  const carouselTabs = [
    { id: 'financeiro', label: 'Financeiro', count: 12, delta: 8, icon: DollarSign },
    { id: 'operacional', label: 'Operacional', count: 18, delta: 5, icon: Package },
    { id: 'comercial', label: 'Comercial', count: 15, delta: 12, icon: TrendingUp },
    { id: 'rh', label: 'RH', count: 9, delta: 3, icon: Users },
  ]

  // Mock data - Faturamento mensal
  const faturamentoData = [
    { mes: 'Jan', valor: 125000, meta: 150000 },
    { mes: 'Fev', valor: 142000, meta: 150000 },
    { mes: 'Mar', valor: 158000, meta: 150000 },
    { mes: 'Abr', valor: 135000, meta: 150000 },
    { mes: 'Mai', valor: 178000, meta: 150000 },
    { mes: 'Jun', valor: 192000, meta: 150000 },
  ]

  // Mock data - Distribuição de vendas
  const vendasData = [
    { name: 'Cirurgia Vascular', value: 42 },
    { name: 'Cardiologia', value: 28 },
    { name: 'Ortopedia', value: 18 },
    { name: 'Outros', value: 12 },
  ]

  // Mock data - Performance operacional
  const performanceData = [
    { categoria: 'Entregas', realizado: 95, meta: 98 },
    { categoria: 'Qualidade', realizado: 97, meta: 95 },
    { categoria: 'Estoque', realizado: 88, meta: 90 },
    { categoria: 'Cirurgias', realizado: 92, meta: 95 },
  ]

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444']

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
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
            <h1 className={`text-3xl font-bold ${textPrimary}`}>KPI Dashboard Consolidado</h1>
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

        {/* Tab Financeiro */}
        <TabsContent value="financeiro" className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Faturamento Mês</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(192000)}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +28%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Receita Recorrente</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(85000)}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +12%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Ticket Médio</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(4250)}
                </div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +5%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Margem Bruta</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  38.5%
                </div>
                <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-none">
                  -2%
                </Badge>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico Faturamento vs Meta */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento vs Meta</CardTitle>
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

        {/* Tab Operacional */}
        <TabsContent value="operacional" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Taxa Entrega</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>95.2%</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +3%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Acurácia Estoque</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>88.7%</div>
                <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-none">
                  -2%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Giro Estoque</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>4.2x</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +8%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Cirurgias Mês</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>142</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +15%
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="categoria" stroke={textMuted} />
                  <YAxis stroke={textMuted} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="realizado" fill="#6366F1" name="Realizado" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="meta" fill="#10B981" name="Meta" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Comercial */}
        <TabsContent value="comercial" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Leads Mês</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>87</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +22%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Taxa Conversão</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>24.5%</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +5%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Ciclo Venda</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>18 dias</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  -3 dias
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>CAC</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>
                  {formatCurrency(850)}
                </div>
                <Badge className="mt-2 bg-amber-500/20 text-amber-500 border-none">
                  +12%
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição de Vendas por Especialidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vendasData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vendasData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab RH */}
        <TabsContent value="rh" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Colaboradores</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>48</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +4
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Turnover</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>8.2%</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  -2%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Absenteísmo</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>2.1%</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  -0.5%
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className={`text-sm font-medium ${textMuted}`}>Treinamentos</div>
                <div className={`text-2xl font-bold mt-2 ${textPrimary}`}>12</div>
                <Badge className="mt-2 bg-emerald-500/20 text-emerald-500 border-none">
                  +6
                </Badge>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores RH - Em Desenvolvimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-center py-12 ${textMuted}`}>
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Gráficos detalhados de RH serão implementados na próxima versão</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
