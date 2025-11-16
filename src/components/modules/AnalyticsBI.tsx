/**
 * ICARUS v5.0 - Módulo: Analytics BI
 * Categoria: Analytics & Automação
 * Descrição: Business Intelligence - Análises, dashboards e relatórios gerenciais
 */

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

type PeriodoAnalise = 'dia' | 'semana' | 'mes' | 'trimestre' | 'ano'

interface MetricaBI {
  nome: string
  valor_atual: number
  variacao_percentual: number
  variacao_absoluta: number
  periodo_anterior: number
  unidade: string
  categoria: 'vendas' | 'financeiro' | 'operacional' | 'marketing'
}

interface DashboardPersonalizado {
  id: number
  nome: string
  descricao: string
  widgets: string[]
  usuario: string
  compartilhado: boolean
}

interface RelatorioAgendado {
  id: number
  titulo: string
  tipo: 'vendas' | 'financeiro' | 'estoque' | 'crm' | 'executivo'
  frequencia: 'diario' | 'semanal' | 'mensal'
  destinatarios: string[]
  proximo_envio: string
  ativo: boolean
}

export default function AnalyticsBI() {
  const [activeTab, setActiveTab] = useState('overview')
  const [periodo, setPeriodo] = useState<PeriodoAnalise>('mes')

  const [metricas] = useState<MetricaBI[]>([
    {
      nome: 'Receita Total',
      valor_atual: 1850000,
      variacao_percentual: 18.5,
      variacao_absoluta: 289000,
      periodo_anterior: 1561000,
      unidade: 'R$',
      categoria: 'vendas'
    },
    {
      nome: 'Ticket Médio',
      valor_atual: 285000,
      variacao_percentual: 12.3,
      variacao_absoluta: 31000,
      periodo_anterior: 254000,
      unidade: 'R$',
      categoria: 'vendas'
    },
    {
      nome: 'Margem EBITDA',
      valor_atual: 21.6,
      variacao_percentual: 8.5,
      variacao_absoluta: 1.7,
      periodo_anterior: 19.9,
      unidade: '%',
      categoria: 'financeiro'
    },
    {
      nome: 'Giro de Estoque',
      valor_atual: 4.2,
      variacao_percentual: -5.4,
      variacao_absoluta: -0.24,
      periodo_anterior: 4.44,
      unidade: 'x',
      categoria: 'operacional'
    },
    {
      nome: 'Taxa de Conversão',
      valor_atual: 68.5,
      variacao_percentual: 15.2,
      variacao_absoluta: 9.0,
      periodo_anterior: 59.5,
      unidade: '%',
      categoria: 'marketing'
    },
    {
      nome: 'CAC (Custo Aquisição Cliente)',
      valor_atual: 12500,
      variacao_percentual: -18.3,
      variacao_absoluta: -2800,
      periodo_anterior: 15300,
      unidade: 'R$',
      categoria: 'marketing'
    }
  ])

  const [dashboards] = useState<DashboardPersonalizado[]>([
    {
      id: 1,
      nome: 'Dashboard Executivo',
      descricao: 'Visão consolidada para diretoria',
      widgets: ['Receita', 'EBITDA', 'Fluxo de Caixa', 'Top Clientes'],
      usuario: 'CEO',
      compartilhado: true
    },
    {
      id: 2,
      nome: 'Dashboard Comercial',
      descricao: 'Métricas de vendas e pipeline',
      widgets: ['Pipeline', 'Conversão', 'Ticket Médio', 'Vendedores'],
      usuario: 'Diretor Comercial',
      compartilhado: true
    },
    {
      id: 3,
      nome: 'Dashboard Financeiro',
      descricao: 'Análises financeiras e fluxo de caixa',
      widgets: ['DRE', 'Contas a Receber', 'Contas a Pagar', 'Inadimplência'],
      usuario: 'CFO',
      compartilhado: false
    }
  ])

  const [relatorios] = useState<RelatorioAgendado[]>([
    {
      id: 1,
      titulo: 'Relatório Executivo Semanal',
      tipo: 'executivo',
      frequencia: 'semanal',
      destinatarios: ['CEO', 'Diretoria'],
      proximo_envio: '2025-11-18 08:00',
      ativo: true
    },
    {
      id: 2,
      titulo: 'Performance de Vendas Diária',
      tipo: 'vendas',
      frequencia: 'diario',
      destinatarios: ['Gerente Comercial', 'Vendedores'],
      proximo_envio: '2025-11-17 07:00',
      ativo: true
    },
    {
      id: 3,
      titulo: 'Análise Financeira Mensal',
      tipo: 'financeiro',
      frequencia: 'mensal',
      destinatarios: ['CFO', 'Controladoria'],
      proximo_envio: '2025-12-01 09:00',
      ativo: true
    }
  ])

  // KPIs
  const metricasPositivas = metricas.filter(m => m.variacao_percentual > 0).length
  const metricasNegativas = metricas.filter(m => m.variacao_percentual < 0).length
  const dashboardsAtivos = dashboards.length
  const relatoriosAtivos = relatorios.filter(r => r.ativo).length

  const getVariacaoBadge = (variacao: number) => {
    if (variacao > 0) return 'bg-green-100 text-green-800 border-green-300'
    if (variacao < 0) return 'bg-red-100 text-red-800 border-red-300'
    return 'bg-gray-100 text-gray-800 border-gray-300'
  }

  const getCategoriaBadge = (categoria: MetricaBI['categoria']) => {
    switch (categoria) {
      case 'vendas':
        return 'bg-blue-100 text-blue-800'
      case 'financeiro':
        return 'bg-green-100 text-green-800'
      case 'operacional':
        return 'bg-purple-100 text-purple-800'
      case 'marketing':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics BI</h1>
          <p className="text-muted-foreground">Business Intelligence - Análises, dashboards e relatórios gerenciais</p>
        </div>
        <div className="flex gap-2">
          <Select value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoAnalise)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dia">Hoje</SelectItem>
              <SelectItem value="semana">Esta Semana</SelectItem>
              <SelectItem value="mes">Este Mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button>+ Novo Dashboard</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="neomorphic border-green-200">
          <CardHeader className="pb-2">
            <CardDescription>Métricas Positivas</CardDescription>
            <CardTitle className="text-3xl text-green-600">{metricasPositivas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600">↑ Em crescimento</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-red-200">
          <CardHeader className="pb-2">
            <CardDescription>Métricas Negativas</CardDescription>
            <CardTitle className="text-3xl text-red-600">{metricasNegativas}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">↓ Em queda</p>
          </CardContent>
        </Card>

        <Card className="neomorphic">
          <CardHeader className="pb-2">
            <CardDescription>Dashboards Ativos</CardDescription>
            <CardTitle className="text-3xl">{dashboardsAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dashboards configurados</p>
          </CardContent>
        </Card>

        <Card className="neomorphic border-blue-200">
          <CardHeader className="pb-2">
            <CardDescription>Relatórios Agendados</CardDescription>
            <CardTitle className="text-3xl text-blue-600">{relatoriosAtivos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-blue-600">Automação ativa</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metricas">Métricas</TabsTrigger>
          <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
        </TabsList>

        {/* TAB: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📊 Performance Geral ({periodo})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metricas.slice(0, 4).map((metrica, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold">{metrica.nome}</div>
                          <div className="text-xs text-gray-600 capitalize">{metrica.categoria}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold">
                            {metrica.unidade === 'R$' && formatCurrency(metrica.valor_atual)}
                            {metrica.unidade === '%' && `${metrica.valor_atual}%`}
                            {metrica.unidade === 'x' && `${metrica.valor_atual}x`}
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border ${getVariacaoBadge(metrica.variacao_percentual)}`}
                          >
                            {metrica.variacao_percentual > 0 ? '+' : ''}
                            {metrica.variacao_percentual.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="neomorphic">
              <CardHeader>
                <CardTitle>📈 Tendências por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(['vendas', 'financeiro', 'operacional', 'marketing'] as const).map(cat => {
                    const metricasCat = metricas.filter(m => m.categoria === cat)
                    const mediaVariacao =
                      metricasCat.reduce((sum, m) => sum + m.variacao_percentual, 0) / metricasCat.length
                    return (
                      <div key={cat} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className={`text-xs px-2 py-0.5 rounded capitalize ${getCategoriaBadge(cat)}`}>
                              {cat}
                            </span>
                            <div className="text-xs text-gray-600 mt-1">{metricasCat.length} métricas</div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-2xl font-bold ${mediaVariacao > 0 ? 'text-green-600' : 'text-red-600'}`}
                            >
                              {mediaVariacao > 0 ? '+' : ''}
                              {mediaVariacao.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-500">Média</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>🎯 Top Insights do Período</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-4 border-l-4 border-green-500 bg-green-50 rounded">
                  <div className="font-semibold text-green-800">📈 Crescimento Acelerado em Vendas</div>
                  <p className="text-sm text-gray-700 mt-1">
                    Receita aumentou 18.5% vs período anterior, impulsionada por novos contratos com hospitais de grande
                    porte.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-800">💡 Eficiência Comercial Melhorou</div>
                  <p className="text-sm text-gray-700 mt-1">
                    Taxa de conversão subiu 15.2% e CAC reduziu 18.3%, indicando melhoria na qualidade dos leads.
                  </p>
                </div>
                <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                  <div className="font-semibold text-orange-800">⚠️ Atenção: Giro de Estoque em Queda</div>
                  <p className="text-sm text-gray-700 mt-1">
                    Giro de estoque caiu 5.4%. Recomenda-se revisar mix de produtos e política de reposição.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: MÉTRICAS */}
        <TabsContent value="metricas" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Todas as Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricas.map((metrica, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-bold text-lg">{metrica.nome}</div>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${getCategoriaBadge(metrica.categoria)}`}>
                          {metrica.categoria}
                        </span>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${getVariacaoBadge(metrica.variacao_percentual)}`}
                      >
                        {metrica.variacao_percentual > 0 ? '↑' : '↓'} {metrica.variacao_percentual > 0 ? '+' : ''}
                        {metrica.variacao_percentual.toFixed(1)}%
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Valor Atual</p>
                        <p className="text-2xl font-bold">
                          {metrica.unidade === 'R$' && formatCurrency(metrica.valor_atual)}
                          {metrica.unidade === '%' && `${metrica.valor_atual}%`}
                          {metrica.unidade === 'x' && `${metrica.valor_atual}x`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Período Anterior</p>
                        <p className="text-lg font-semibold text-gray-600">
                          {metrica.unidade === 'R$' && formatCurrency(metrica.periodo_anterior)}
                          {metrica.unidade === '%' && `${metrica.periodo_anterior}%`}
                          {metrica.unidade === 'x' && `${metrica.periodo_anterior}x`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Variação Absoluta</p>
                        <p
                          className={`text-lg font-semibold ${metrica.variacao_absoluta > 0 ? 'text-green-600' : 'text-red-600'}`}
                        >
                          {metrica.variacao_absoluta > 0 ? '+' : ''}
                          {metrica.unidade === 'R$' && formatCurrency(metrica.variacao_absoluta)}
                          {metrica.unidade === '%' && `${metrica.variacao_absoluta.toFixed(1)}%`}
                          {metrica.unidade === 'x' && `${metrica.variacao_absoluta.toFixed(2)}x`}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: DASHBOARDS */}
        <TabsContent value="dashboards" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>Dashboards Personalizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {dashboards.map(dash => (
                  <Card key={dash.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold text-lg">{dash.nome}</div>
                        <p className="text-sm text-gray-600 mt-1">{dash.descricao}</p>
                        <div className="flex gap-1 mt-3 flex-wrap">
                          {dash.widgets.map((widget, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              {widget}
                            </span>
                          ))}
                        </div>
                        <div className="text-xs text-gray-500 mt-3">
                          Criado por: {dash.usuario}
                          {dash.compartilhado && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-700">Compartilhado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Visualizar</Button>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Relatórios Agendados</CardTitle>
                <Button>+ Agendar Relatório</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatorios.map(rel => (
                  <Card key={rel.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-lg">{rel.titulo}</div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${rel.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                          >
                            {rel.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                          <div>
                            <span className="text-gray-500">Tipo:</span>{' '}
                            <span className="capitalize font-semibold">{rel.tipo}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Frequência:</span>{' '}
                            <span className="capitalize font-semibold">{rel.frequencia}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Próximo Envio:</span>{' '}
                            <span className="font-semibold">{rel.proximo_envio}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Destinatários:</span>{' '}
                          <span className="font-semibold">{rel.destinatarios.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        <Button size="sm" variant="outline">
                          Enviar Agora
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: ANÁLISES */}
        <TabsContent value="analises" className="space-y-4">
          <Card className="neomorphic">
            <CardHeader>
              <CardTitle>📊 Análises Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise de Vendas</div>
                    <div className="text-xs text-gray-500">Performance comercial por período</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise de Clientes</div>
                    <div className="text-xs text-gray-500">Segmentação e comportamento</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise Financeira</div>
                    <div className="text-xs text-gray-500">DRE, fluxo de caixa, margens</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise de Produtos</div>
                    <div className="text-xs text-gray-500">Mix, giro, rentabilidade</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise de Estoque</div>
                    <div className="text-xs text-gray-500">Giro, ruptura, obsolescência</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="font-bold">Análise de Marketing</div>
                    <div className="text-xs text-gray-500">CAC, ROI, conversão</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
