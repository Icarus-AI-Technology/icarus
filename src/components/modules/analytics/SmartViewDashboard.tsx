/**
 * ICARUS v5.0 - Smart View Dashboard com ML Nativo
 * 
 * Dashboard inteligente com insights de Machine Learning,
 * detecção de padrões e recomendações em tempo real.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { useTheme } from '@/hooks/useTheme'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BrainCircuit, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  Target, Zap, Eye, RefreshCw, Sparkles, BarChart2, PieChart as PieChartIcon,
  Activity, Clock, DollarSign, Package, Users, Calendar, ArrowRight,
  Lightbulb, Shield, Bell, ChevronRight
} from 'lucide-react'
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

// ============ TIPOS ============

interface MLInsight {
  id: string
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly' | 'recommendation'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  confidence: number
  category: string
  actionable: boolean
  suggestedAction?: string
  createdAt: string
}

interface PredictiveMetric {
  id: string
  name: string
  currentValue: number
  predictedValue: number
  trend: 'up' | 'down' | 'stable'
  confidence: number
  horizon: string
}

interface AnomalyDetection {
  id: string
  metric: string
  expectedValue: number
  actualValue: number
  deviation: number
  severity: 'critical' | 'warning' | 'info'
  timestamp: string
}

// ============ DADOS MOCK ============

const mlInsightsMock: MLInsight[] = [
  {
    id: '1',
    type: 'opportunity',
    title: 'Oportunidade de Cross-Sell Detectada',
    description: 'Clientes que compraram Kit Artroscopia têm 78% de probabilidade de precisar de Kit Reabilitação nos próximos 60 dias.',
    impact: 'high',
    confidence: 87,
    category: 'Vendas',
    actionable: true,
    suggestedAction: 'Criar campanha de email segmentada para 156 clientes elegíveis',
    createdAt: '2025-11-28T10:30:00Z'
  },
  {
    id: '2',
    type: 'risk',
    title: 'Risco de Ruptura de Estoque',
    description: 'Hastes Intramedulares Fêmur podem atingir estoque zero em 12 dias com base na demanda atual.',
    impact: 'high',
    confidence: 92,
    category: 'Estoque',
    actionable: true,
    suggestedAction: 'Emitir ordem de compra urgente para 50 unidades',
    createdAt: '2025-11-28T09:15:00Z'
  },
  {
    id: '3',
    type: 'trend',
    title: 'Tendência de Crescimento em Ortopedia',
    description: 'Cirurgias de Ortopedia apresentam crescimento de 23% nos últimos 3 meses, superando a média do setor.',
    impact: 'medium',
    confidence: 85,
    category: 'Analytics',
    actionable: false,
    createdAt: '2025-11-28T08:00:00Z'
  },
  {
    id: '4',
    type: 'anomaly',
    title: 'Anomalia em Tempo de Faturamento',
    description: 'Tempo médio de faturamento aumentou 45% esta semana, possivelmente devido a gargalo no processo de autorização.',
    impact: 'medium',
    confidence: 79,
    category: 'Financeiro',
    actionable: true,
    suggestedAction: 'Revisar workflow de autorização prévia',
    createdAt: '2025-11-28T07:30:00Z'
  },
  {
    id: '5',
    type: 'recommendation',
    title: 'Otimização de Rota Logística',
    description: 'Reorganizar rotas de entrega pode reduzir custos logísticos em 18% e tempo de entrega em 25%.',
    impact: 'medium',
    confidence: 83,
    category: 'Logística',
    actionable: true,
    suggestedAction: 'Aplicar nova configuração de rotas',
    createdAt: '2025-11-27T16:00:00Z'
  }
]

const predictiveMetricsMock: PredictiveMetric[] = [
  { id: '1', name: 'Faturamento Mensal', currentValue: 1250000, predictedValue: 1420000, trend: 'up', confidence: 88, horizon: '30 dias' },
  { id: '2', name: 'Cirurgias Agendadas', currentValue: 45, predictedValue: 52, trend: 'up', confidence: 82, horizon: '7 dias' },
  { id: '3', name: 'Taxa de Inadimplência', currentValue: 4.2, predictedValue: 3.8, trend: 'down', confidence: 76, horizon: '30 dias' },
  { id: '4', name: 'Estoque Crítico', currentValue: 8, predictedValue: 12, trend: 'up', confidence: 91, horizon: '14 dias' }
]

const anomaliesMock: AnomalyDetection[] = [
  { id: '1', metric: 'Tempo Faturamento', expectedValue: 2.5, actualValue: 3.8, deviation: 52, severity: 'warning', timestamp: '2025-11-28T10:00:00Z' },
  { id: '2', metric: 'Custo por Cirurgia', expectedValue: 15000, actualValue: 18500, deviation: 23, severity: 'warning', timestamp: '2025-11-28T09:00:00Z' },
  { id: '3', metric: 'Taxa de Retorno', expectedValue: 2.1, actualValue: 4.5, deviation: 114, severity: 'critical', timestamp: '2025-11-28T08:00:00Z' }
]

const trendDataMock = [
  { month: 'Jul', faturamento: 980000, cirurgias: 38, estoque: 92 },
  { month: 'Ago', faturamento: 1050000, cirurgias: 42, estoque: 88 },
  { month: 'Set', faturamento: 1120000, cirurgias: 45, estoque: 85 },
  { month: 'Out', faturamento: 1180000, cirurgias: 48, estoque: 90 },
  { month: 'Nov', faturamento: 1250000, cirurgias: 52, estoque: 87 },
  { month: 'Dez*', faturamento: 1420000, cirurgias: 58, estoque: 82 }
]

const performanceRadarMock = [
  { subject: 'Vendas', A: 85, fullMark: 100 },
  { subject: 'Estoque', A: 72, fullMark: 100 },
  { subject: 'Financeiro', A: 88, fullMark: 100 },
  { subject: 'Logística', A: 78, fullMark: 100 },
  { subject: 'Compliance', A: 95, fullMark: 100 },
  { subject: 'Satisfação', A: 82, fullMark: 100 }
]

const categoryDistributionMock = [
  { name: 'Ortopedia', value: 45, color: '#6366F1' },
  { name: 'Cardiologia', value: 25, color: '#10B981' },
  { name: 'Neurologia', value: 15, color: '#8b5cf6' },
  { name: 'Outros', value: 15, color: '#8B5CF6' }
]

// ============ COMPONENTE PRINCIPAL ============

export function SmartViewDashboard() {
  const { isDark } = useTheme()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedInsight, setSelectedInsight] = useState<MLInsight | null>(null)

  // Cores do tema
  const textPrimary = isDark ? 'text-white' : 'text-slate-900'
  const textSecondary = isDark ? 'text-[#94A3B8]' : 'text-slate-600'
  const inputBg = isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'

  // KPIs calculados
  const kpis = useMemo(() => ({
    totalInsights: mlInsightsMock.length,
    highImpact: mlInsightsMock.filter(i => i.impact === 'high').length,
    actionable: mlInsightsMock.filter(i => i.actionable).length,
    avgConfidence: Math.round(mlInsightsMock.reduce((acc, i) => acc + i.confidence, 0) / mlInsightsMock.length)
  }), [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    toast.info('Atualizando insights com ML...')
    await new Promise(resolve => setTimeout(resolve, 2000))
    toast.success('Insights atualizados!')
    setIsRefreshing(false)
  }

  const handleApplyAction = (insight: MLInsight) => {
    toast.success(`Ação aplicada: ${insight.suggestedAction}`)
  }

  const getInsightIcon = (type: MLInsight['type']) => {
    const icons = {
      opportunity: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      risk: <AlertTriangle className="w-5 h-5 text-red-400" />,
      trend: <Activity className="w-5 h-5 text-blue-400" />,
      anomaly: <Zap className="w-5 h-5 text-violet-300" />,
      recommendation: <Lightbulb className="w-5 h-5 text-purple-400" />
    }
    return icons[type]
  }

  const getInsightColor = (type: MLInsight['type']) => {
    const colors = {
      opportunity: 'border-l-emerald-500',
      risk: 'border-l-red-500',
      trend: 'border-l-blue-500',
      anomaly: 'border-l-violet-500',
      recommendation: 'border-l-purple-500'
    }
    return colors[type]
  }

  const getImpactBadge = (impact: MLInsight['impact']) => {
    const configs = {
      high: { label: 'Alto Impacto', className: 'bg-red-500/20 text-red-400' },
      medium: { label: 'Médio Impacto', className: 'bg-violet-500/20 text-violet-300' },
      low: { label: 'Baixo Impacto', className: 'bg-slate-500/20 text-slate-400' }
    }
    const config = configs[impact]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const getSeverityBadge = (severity: AnomalyDetection['severity']) => {
    const configs = {
      critical: { label: 'Crítico', className: 'bg-red-500/20 text-red-400' },
      warning: { label: 'Atenção', className: 'bg-violet-500/20 text-violet-300' },
      info: { label: 'Info', className: 'bg-blue-500/20 text-blue-400' }
    }
    const config = configs[severity]
    return <Badge className={config.className}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${textPrimary} mb-2 flex items-center gap-3`}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <BrainCircuit className="w-8 h-8 text-[#8B5CF6]" />
            </motion.div>
            Smart View Dashboard
          </h1>
          <p className={textSecondary}>
            Insights inteligentes e predições com Machine Learning
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="btn-quick-action flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Processando...' : 'Atualizar ML'}
        </Button>
      </div>

      {/* KPIs de ML */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="neu-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Total Insights</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.totalInsights}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#6366F1]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="neu-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Alto Impacto</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.highImpact}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="neu-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Acionáveis</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.actionable}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="neu-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Confiança Média</p>
                  <p className={`text-3xl font-bold ${textPrimary}`}>{kpis.avgConfidence}%</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className={`${inputBg} p-1 rounded-xl`}>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Insights ML
          </TabsTrigger>
          <TabsTrigger value="predictions" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Predições
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Anomalias
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* Tab: Insights ML */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Lista de Insights */}
            <div className="space-y-3">
              <AnimatePresence>
                {mlInsightsMock.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card 
                      className={`neu-card cursor-pointer border-l-4 ${getInsightColor(insight.type)} hover:shadow-lg transition-all`}
                      onClick={() => setSelectedInsight(insight)}
                    >
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-1">{getInsightIcon(insight.type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-semibold ${textPrimary}`}>{insight.title}</h4>
                              {getImpactBadge(insight.impact)}
                            </div>
                            <p className={`text-sm ${textSecondary} line-clamp-2`}>{insight.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className={`text-xs ${textSecondary}`}>
                                Confiança: <span className="text-[#6366F1] font-semibold">{insight.confidence}%</span>
                              </span>
                              <span className={`text-xs ${textSecondary}`}>{insight.category}</span>
                              {insight.actionable && (
                                <Badge className="bg-emerald-500/20 text-emerald-400 text-xs">
                                  Acionável
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className={`w-5 h-5 ${textSecondary}`} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Detalhe do Insight Selecionado */}
            <Card className="neu-card sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#6366F1]" />
                  Detalhes do Insight
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedInsight ? (
                  <motion.div
                    key={selectedInsight.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      {getInsightIcon(selectedInsight.type)}
                      <h3 className={`text-xl font-bold ${textPrimary}`}>{selectedInsight.title}</h3>
                    </div>
                    
                    <p className={textSecondary}>{selectedInsight.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className={`p-3 rounded-xl ${inputBg}`}>
                        <p className={`text-xs ${textSecondary}`}>Confiança</p>
                        <p className={`text-2xl font-bold ${textPrimary}`}>{selectedInsight.confidence}%</p>
                      </div>
                      <div className={`p-3 rounded-xl ${inputBg}`}>
                        <p className={`text-xs ${textSecondary}`}>Categoria</p>
                        <p className={`text-2xl font-bold ${textPrimary}`}>{selectedInsight.category}</p>
                      </div>
                    </div>

                    {selectedInsight.suggestedAction && (
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'} border-l-4 border-emerald-500`}>
                        <p className={`text-sm font-medium ${isDark ? 'text-emerald-300' : 'text-emerald-700'} mb-2`}>
                          Ação Sugerida
                        </p>
                        <p className={`text-sm ${textSecondary}`}>{selectedInsight.suggestedAction}</p>
                        <Button
                          className="mt-3 btn-quick-action"
                          size="sm"
                          onClick={() => handleApplyAction(selectedInsight)}
                        >
                          Aplicar Ação
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className={`text-center py-12 ${textSecondary}`}>
                    <Eye className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>Selecione um insight para ver detalhes</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Predições */}
        <TabsContent value="predictions" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Métricas Preditivas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#10B981]" />
                  Métricas Preditivas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {predictiveMetricsMock.map((metric) => (
                  <div key={metric.id} className={`p-4 rounded-xl ${inputBg}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-medium ${textPrimary}`}>{metric.name}</span>
                      <Badge className={
                        metric.trend === 'up' ? 'bg-emerald-500/20 text-emerald-400' :
                        metric.trend === 'down' ? 'bg-red-500/20 text-red-400' :
                        'bg-slate-500/20 text-slate-400'
                      }>
                        {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} {metric.horizon}
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-4">
                      <span className={`text-2xl font-bold ${textPrimary}`}>
                        {metric.name.includes('Taxa') ? `${metric.currentValue}%` :
                         metric.name.includes('Faturamento') ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(metric.currentValue) :
                         metric.currentValue}
                      </span>
                      <span className={textSecondary}>→</span>
                      <span className={`text-lg ${metric.trend === 'up' && !metric.name.includes('Inadimplência') && !metric.name.includes('Crítico') ? 'text-emerald-400' : metric.trend === 'down' && (metric.name.includes('Inadimplência') || metric.name.includes('Crítico')) ? 'text-emerald-400' : 'text-violet-300'}`}>
                        {metric.name.includes('Taxa') ? `${metric.predictedValue}%` :
                         metric.name.includes('Faturamento') ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(metric.predictedValue) :
                         metric.predictedValue}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                          style={{ width: `${metric.confidence}%` }}
                        />
                      </div>
                      <span className={`text-xs ${textSecondary}`}>{metric.confidence}%</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Gráfico de Tendências */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#6366F1]" />
                  Tendência de Faturamento (com Previsão)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trendDataMock}>
                    <defs>
                      <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <XAxis dataKey="month" stroke={isDark ? '#64748B' : '#64748B'} />
                    <YAxis stroke={isDark ? '#64748B' : '#64748B'} tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                      }}
                      formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Faturamento']}
                    />
                    <Area
                      type="monotone"
                      dataKey="faturamento"
                      stroke="#6366F1"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFaturamento)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <p className={`text-xs ${textSecondary} text-center mt-2`}>
                  * Dez representa previsão baseada em ML
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Anomalias */}
        <TabsContent value="anomalies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#8b5cf6]" />
                Detecção de Anomalias em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {anomaliesMock.map((anomaly) => (
                  <div 
                    key={anomaly.id} 
                    className={`p-4 rounded-xl ${inputBg} border-l-4 ${
                      anomaly.severity === 'critical' ? 'border-l-red-500' :
                      anomaly.severity === 'warning' ? 'border-l-violet-500' :
                      'border-l-blue-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h4 className={`font-semibold ${textPrimary}`}>{anomaly.metric}</h4>
                        {getSeverityBadge(anomaly.severity)}
                      </div>
                      <span className={`text-xs ${textSecondary}`}>
                        {new Date(anomaly.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Esperado</p>
                        <p className={`text-lg font-semibold ${textPrimary}`}>{anomaly.expectedValue}</p>
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Atual</p>
                        <p className={`text-lg font-semibold ${anomaly.severity === 'critical' ? 'text-red-400' : 'text-violet-300'}`}>
                          {anomaly.actualValue}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${textSecondary}`}>Desvio</p>
                        <p className={`text-lg font-semibold ${anomaly.severity === 'critical' ? 'text-red-400' : 'text-violet-300'}`}>
                          +{anomaly.deviation}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Performance */}
        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Radar de Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#8B5CF6]" />
                  Radar de Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={performanceRadarMock}>
                    <PolarGrid stroke={isDark ? '#252B44' : '#E2E8F0'} />
                    <PolarAngleAxis dataKey="subject" stroke={isDark ? '#64748B' : '#64748B'} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke={isDark ? '#64748B' : '#64748B'} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="#6366F1"
                      fill="#6366F1"
                      fillOpacity={0.3}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-[#10B981]" />
                  Distribuição por Especialidade
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryDistributionMock}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryDistributionMock.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1A1F35' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '12px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SmartViewDashboard

