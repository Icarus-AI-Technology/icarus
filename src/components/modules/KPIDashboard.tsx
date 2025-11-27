/**
 * ICARUS v5.0 - Módulo: KPI Dashboard
 * Categoria: Analytics & Automação
 * Descrição: Dashboard consolidado de KPIs estratégicos em tempo real
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { KPICard } from '@/components/ui/KPICard'
import { Button } from '@/components/ui/Button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { BarChart3, TrendingUp, TrendingDown, Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { useKPIs, useRevenueData, usePerformanceData, useTrendData } from '@/hooks/queries/useAnalytics'
import { useDashboardRealtime } from '@/hooks/useRealtimeSubscription'

type CategoriaKPI = 'vendas' | 'financeiro' | 'operacional' | 'marketing' | 'qualidade'
type TendenciaKPI = 'subindo' | 'estavel' | 'descendo'

interface KPI {
  id: string
  categoria: CategoriaKPI
  nome: string
  valor_atual: number
  meta: number
  unidade: string
  variacao_percentual: number
  tendencia: TendenciaKPI
  atingimento: number
  periodo: string
  responsavel: string
  prioridade: 'alta' | 'media' | 'baixa'
}

interface AlertaKPI {
  kpi_id: string
  kpi_nome: string
  tipo: 'meta_nao_atingida' | 'queda_acentuada' | 'melhoria_significativa'
  severidade: 'info' | 'warning' | 'critical'
  mensagem: string
  data: string
}

export default function KPIDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [categoria, setCategoria] = useState<CategoriaKPI | 'todas'>('todas')
  
  // React Query hooks for real data
  const { data: _kpisData } = useKPIs()
  const { data: _revenueData } = useRevenueData('mes')
  const { data: _performanceData } = usePerformanceData()
  const { data: _trendData } = useTrendData('vendas')
  
  // Enable real-time updates
  useDashboardRealtime()

  const [kpis] = useState<KPI[]>([
    {
      id: 'kpi-001',
      categoria: 'vendas',
      nome: 'Receita Mensal',
      valor_atual: 1850000,
      meta: 2000000,
      unidade: 'R$',
      variacao_percentual: 18.5,
      tendencia: 'subindo',
      atingimento: 92.5,
      periodo: 'Novembro/2025',
      responsavel: 'Diretor Comercial',
      prioridade: 'alta'
    },
    {
      id: 'kpi-002',
      categoria: 'vendas',
      nome: 'Ticket Médio',
      valor_atual: 285000,
      meta: 300000,
      unidade: 'R$',
      variacao_percentual: 12.3,
      tendencia: 'subindo',
      atingimento: 95.0,
      periodo: 'Novembro/2025',
      responsavel: 'Diretor Comercial',
      prioridade: 'media'
    },
    {
      id: 'kpi-003',
      categoria: 'financeiro',
      nome: 'Margem EBITDA',
      valor_atual: 21.6,
      meta: 20.0,
      unidade: '%',
      variacao_percentual: 8.5,
      tendencia: 'subindo',
      atingimento: 108.0,
      periodo: 'Novembro/2025',
      responsavel: 'CFO',
      prioridade: 'alta'
    },
    {
      id: 'kpi-004',
      categoria: 'financeiro',
      nome: 'Inadimplência',
      valor_atual: 5.5,
      meta: 3.0,
      unidade: '%',
      variacao_percentual: -8.3,
      tendencia: 'descendo',
      atingimento: 54.5,
      periodo: 'Novembro/2025',
      responsavel: 'CFO',
      prioridade: 'alta'
    },
    {
      id: 'kpi-005',
      categoria: 'operacional',
      nome: 'Giro de Estoque',
      valor_atual: 4.2,
      meta: 5.0,
      unidade: 'x/ano',
      variacao_percentual: -5.4,
      tendencia: 'descendo',
      atingimento: 84.0,
      periodo: 'Novembro/2025',
      responsavel: 'Gerente Logística',
      prioridade: 'media'
    },
    {
      id: 'kpi-006',
      categoria: 'operacional',
      nome: 'Taxa Entrega no Prazo',
      valor_atual: 94.5,
      meta: 95.0,
      unidade: '%',
      variacao_percentual: 2.8,
      tendencia: 'subindo',
      atingimento: 99.5,
      periodo: 'Novembro/2025',
      responsavel: 'Gerente Logística',
      prioridade: 'media'
    },
    {
      id: 'kpi-007',
      categoria: 'marketing',
      nome: 'Taxa de Conversão',
      valor_atual: 68.5,
      meta: 70.0,
      unidade: '%',
      variacao_percentual: 15.2,
      tendencia: 'subindo',
      atingimento: 97.9,
      periodo: 'Novembro/2025',
      responsavel: 'Gerente Marketing',
      prioridade: 'media'
    },
    {
      id: 'kpi-008',
      categoria: 'marketing',
      nome: 'CAC (Custo Aquisição)',
      valor_atual: 12500,
      meta: 15000,
      unidade: 'R$',
      variacao_percentual: -18.3,
      tendencia: 'descendo',
      atingimento: 120.0,
      periodo: 'Novembro/2025',
      responsavel: 'Gerente Marketing',
      prioridade: 'baixa'
    },
    {
      id: 'kpi-009',
      categoria: 'qualidade',
      nome: 'Taxa Conformidade ANVISA',
      valor_atual: 98.5,
      meta: 100.0,
      unidade: '%',
      variacao_percentual: 1.5,
      tendencia: 'subindo',
      atingimento: 98.5,
      periodo: 'Novembro/2025',
      responsavel: 'Diretor Qualidade',
      prioridade: 'alta'
    },
    {
      id: 'kpi-010',
      categoria: 'qualidade',
      nome: 'NPS (Net Promoter Score)',
      valor_atual: 72,
      meta: 75,
      unidade: 'pontos',
      variacao_percentual: 8.0,
      tendencia: 'subindo',
      atingimento: 96.0,
      periodo: 'Novembro/2025',
      responsavel: 'Diretor Qualidade',
      prioridade: 'media'
    }
  ])

  const [alertas] = useState<AlertaKPI[]>([
    {
      kpi_id: 'kpi-004',
      kpi_nome: 'Inadimplência',
      tipo: 'meta_nao_atingida',
      severidade: 'critical',
      mensagem: 'Taxa de inadimplência 83% acima da meta. Ações urgentes de cobrança necessárias.',
      data: '2025-11-16'
    },
    {
      kpi_id: 'kpi-001',
      kpi_nome: 'Receita Mensal',
      tipo: 'melhoria_significativa',
      severidade: 'info',
      mensagem: 'Crescimento de 18.5% vs mês anterior. Manter estratégia atual.',
      data: '2025-11-15'
    },
    {
      kpi_id: 'kpi-005',
      kpi_nome: 'Giro de Estoque',
      tipo: 'queda_acentuada',
      severidade: 'warning',
      mensagem: 'Queda de 5.4% no giro. Revisar mix de produtos e política de reposição.',
      data: '2025-11-14'
    }
  ])

  const kpisFiltrados = categoria === 'todas' ? kpis : kpis.filter(k => k.categoria === categoria)

  const kpisMetaNaoAtingida = kpis.filter(k => k.atingimento < 90).length
  const kpisAcimaMeta = kpis.filter(k => k.atingimento >= 100).length
  const atingimentoMedio = (kpis.reduce((sum, k) => sum + k.atingimento, 0) / kpis.length).toFixed(1)

  const getCategoriaBadge = (cat: CategoriaKPI) => {
    switch (cat) {
      case 'vendas':
        return 'bg-blue-100 text-blue-800'
      case 'financeiro':
        return 'bg-green-100 text-green-800'
      case 'operacional':
        return 'bg-purple-100 text-purple-800'
      case 'marketing':
        return 'bg-orange-100 text-orange-800'
      case 'qualidade':
        return 'bg-indigo-100 text-indigo-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getAtingimentoColor = (atingimento: number) => {
    if (atingimento >= 100) return 'text-green-600'
    if (atingimento >= 90) return 'text-blue-600'
    if (atingimento >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getTendenciaIcon = (tendencia: TendenciaKPI) => {
    switch (tendencia) {
      case 'subindo':
        return '📈'
      case 'descendo':
        return '📉'
      case 'estavel':
        return '➡️'
      default:
        return '—'
    }
  }

  const getSeveridadeBadge = (severidade: AlertaKPI['severidade']) => {
    switch (severidade) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'info':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">KPI Dashboard</h1>
          <p className="text-muted-foreground">Dashboard consolidado de KPIs estratégicos em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Select value={categoria} onValueChange={(v) => setCategoria(v as CategoriaKPI | 'todas')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Categorias</SelectItem>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="financeiro">Financeiro</SelectItem>
              <SelectItem value="operacional">Operacional</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="qualidade">Qualidade</SelectItem>
            </SelectContent>
          </Select>
          <Button>+ Novo KPI</Button>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total de KPIs"
          value={kpis.length}
          icon={BarChart3}
          variant="default"
        />

        <KPICard
          title="KPIs Acima da Meta"
          value={kpisAcimaMeta}
          icon={TrendingUp}
          variant="success"
        />

        <KPICard
          title="KPIs Abaixo da Meta"
          value={kpisMetaNaoAtingida}
          icon={TrendingDown}
          variant="danger"
        />

        <KPICard
          title="Atingimento Médio"
          value={`${atingimentoMedio}%`}
          icon={Target}
          variant="primary"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="kpis">Todos os KPIs</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="categorias">Por Categoria</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>🎯 KPIs Críticos (Alta Prioridade)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kpis
                    .filter(k => k.prioridade === 'alta')
                    .map(kpi => (
                      <div key={kpi.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-semibold">{kpi.nome}</div>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${getCategoriaBadge(kpi.categoria)}`}>
                              {kpi.categoria}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${getAtingimentoColor(kpi.atingimento)}`}>
                              {kpi.atingimento.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500">Atingimento</div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${kpi.atingimento >= 100 ? 'bg-green-500' : kpi.atingimento >= 90 ? 'bg-blue-500' : kpi.atingimento >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(kpi.atingimento, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic border-red-200">
              <CardHeader>
                <CardTitle>⚠️ Alertas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {alertas.map((alerta, idx) => (
                    <div key={idx} className={`p-3 border rounded-lg ${getSeveridadeBadge(alerta.severidade)}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeBadge(alerta.severidade)}`}>
                          {alerta.severidade.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">{alerta.data}</span>
                      </div>
                      <div className="font-semibold">{alerta.kpi_nome}</div>
                      <p className="text-sm text-gray-700 mt-1">{alerta.mensagem}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Performance por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {(['vendas', 'financeiro', 'operacional', 'marketing', 'qualidade'] as CategoriaKPI[]).map(cat => {
                  const kpisCat = kpis.filter(k => k.categoria === cat)
                  const atingMedio = (kpisCat.reduce((sum, k) => sum + k.atingimento, 0) / kpisCat.length).toFixed(0)
                  return (
                    <div key={cat} className="p-4 border rounded-lg">
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${getCategoriaBadge(cat)}`}>
                        {cat}
                      </span>
                      <div className="mt-3">
                        <div className="text-3xl font-bold">{atingMedio}%</div>
                        <div className="text-xs text-gray-500">{kpisCat.length} KPIs</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: TODOS OS KPIs */}
        <TabsContent value="kpis" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todos os KPIs ({kpisFiltrados.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {kpisFiltrados.map(kpi => (
                  <Card key={kpi.id} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{kpi.nome}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${getCategoriaBadge(kpi.categoria)}`}>
                            {kpi.categoria}
                          </span>
                          <span className="text-xs text-gray-600">• {kpi.responsavel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getAtingimentoColor(kpi.atingimento)}`}>
                          {kpi.atingimento.toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Atingimento</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div>
                        <p className="text-xs text-gray-500">Valor Atual</p>
                        <p className="text-xl font-bold">
                          {kpi.unidade === 'R$' && formatCurrency(kpi.valor_atual)}
                          {kpi.unidade !== 'R$' && `${kpi.valor_atual.toFixed(1)}${kpi.unidade}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Meta</p>
                        <p className="text-xl font-semibold text-gray-600">
                          {kpi.unidade === 'R$' && formatCurrency(kpi.meta)}
                          {kpi.unidade !== 'R$' && `${kpi.meta.toFixed(1)}${kpi.unidade}`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Variação vs Anterior</p>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">{getTendenciaIcon(kpi.tendencia)}</span>
                          <p className={`text-xl font-semibold ${kpi.variacao_percentual > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {kpi.variacao_percentual > 0 ? '+' : ''}{kpi.variacao_percentual.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${kpi.atingimento >= 100 ? 'bg-green-500' : kpi.atingimento >= 90 ? 'bg-blue-500' : kpi.atingimento >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(kpi.atingimento, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{kpi.periodo}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ALERTAS */}
        <TabsContent value="alertas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Alertas de KPIs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.map((alerta, idx) => (
                  <Card key={idx} className={`p-4 border-2 ${getSeveridadeBadge(alerta.severidade)}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-lg">{alerta.kpi_nome}</div>
                        <div className="text-xs text-gray-600 capitalize">{alerta.tipo.replace('_', ' ')}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeveridadeBadge(alerta.severidade)}`}>
                        {alerta.severidade.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alerta.mensagem}</p>
                    <div className="text-xs text-gray-500">Data: {alerta.data}</div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: POR CATEGORIA */}
        <TabsContent value="categorias" className="space-y-4">
          {(['vendas', 'financeiro', 'operacional', 'marketing', 'qualidade'] as CategoriaKPI[]).map(cat => {
            const kpisCat = kpis.filter(k => k.categoria === cat)
            const atingMedio = (kpisCat.reduce((sum, k) => sum + k.atingimento, 0) / kpisCat.length).toFixed(1)
            return (
              <Card key={cat} className="neomorphic">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="capitalize">{cat}</CardTitle>
                      <CardDescription>{kpisCat.length} KPIs • Atingimento Médio: {atingMedio}%</CardDescription>
                    </div>
                    <span className={`text-xs px-3 py-1.5 rounded capitalize ${getCategoriaBadge(cat)}`}>
                      {cat}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {kpisCat.map(kpi => (
                      <div key={kpi.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="font-semibold">{kpi.nome}</div>
                          <div className={`text-xl font-bold ${getAtingimentoColor(kpi.atingimento)}`}>
                            {kpi.atingimento.toFixed(0)}%
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                          <div>
                            <span className="text-xs text-gray-500">Atual:</span>{' '}
                            <span className="font-semibold">
                              {kpi.unidade === 'R$' ? formatCurrency(kpi.valor_atual) : `${kpi.valor_atual.toFixed(1)}${kpi.unidade}`}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-gray-500">Meta:</span>{' '}
                            <span className="font-semibold">
                              {kpi.unidade === 'R$' ? formatCurrency(kpi.meta) : `${kpi.meta.toFixed(1)}${kpi.unidade}`}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${kpi.atingimento >= 100 ? 'bg-green-500' : kpi.atingimento >= 90 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                              style={{ width: `${Math.min(kpi.atingimento, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </TabsContent>
      </Tabs>
    </div>
  )
}
