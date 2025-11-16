/**
 * ICARUS v5.0 - Módulo: Dashboard Principal
 *
 * Categoria: Core Business
 * Descrição: Visão executiva consolidada do negócio OPME
 *
 * CONTEXTO DE NEGÓCIO:
 * - Sistema para Distribuidora de Dispositivos Médicos (OPME)
 * - Dashboard executivo com métricas consolidadas de todos os módulos
 * - Visão 360° do negócio: vendas, estoque, cirurgias, financeiro
 * - Alertas e notificações críticas para tomada de decisão
 *
 * Funcionalidades:
 * - KPIs principais: Faturamento, Cirurgias, Estoque, Inadimplência
 * - Próximas cirurgias agendadas (visão rápida)
 * - Produtos com estoque crítico
 * - Pendências financeiras (contas a receber)
 * - Performance de vendas (gráficos e tendências)
 * - Top 5 hospitais (principais clientes B2B)
 * - Top 5 produtos mais vendidos
 * - Alertas e notificações importantes
 * - Insights de IA
 *
 * KPIs:
 * - Faturamento do Mês
 * - Cirurgias Agendadas (próximos 7 dias)
 * - Produtos em Estoque Crítico
 * - Taxa de Inadimplência (%)
 *
 * Seções:
 * - KPIs Principais (cards superiores)
 * - Próximas Cirurgias (urgentes)
 * - Estoque Crítico (alerta)
 * - Gráficos de Performance
 * - Top Hospitais e Produtos
 * - Alertas e Notificações
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'
import { formatCurrency, formatDate } from '@/lib/utils'

// ==================== INTERFACES ====================

interface DashboardKPIs {
  faturamentoMes: number
  faturamentoVariacao: number // % em relação ao mês anterior
  cirurgiasAgendadas: number
  cirurgiasVariacao: number
  estoqueCritico: number
  estoqueCriticoVariacao: number
  inadimplencia: number
  inadimplenciaVariacao: number
}

interface CirurgiaProxima {
  id: number
  hospital: string
  procedimento: string
  data: string
  valor: number
  status: 'ok' | 'pendente' | 'critico'
  diasRestantes: number
}

interface ProdutoEstoqueCritico {
  id: number
  nome: string
  estoque: number
  minimo: number
  valor_unitario: number
  categoria: string
  urgencia: 'baixo' | 'medio' | 'alto'
}

interface PendenciaFinanceira {
  id: number
  hospital: string
  valor: number
  vencimento: string
  diasAtraso: number
  status: 'a_vencer' | 'vencido' | 'critico'
}

interface TopHospital {
  id: number
  nome: string
  faturamento: number
  cirurgias: number
  crescimento: number // %
}

interface TopProduto {
  id: number
  nome: string
  quantidade: number
  faturamento: number
  categoria: string
}

interface Alerta {
  id: number
  tipo: 'estoque' | 'cirurgia' | 'financeiro' | 'sistema'
  prioridade: 'baixa' | 'media' | 'alta' | 'critica'
  titulo: string
  mensagem: string
  data: string
}

interface DashboardData {
  kpis: DashboardKPIs
  cirurgiasProximas: CirurgiaProxima[]
  estoqueCritico: ProdutoEstoqueCritico[]
  pendenciasFinanceiras: PendenciaFinanceira[]
  topHospitais: TopHospital[]
  topProdutos: TopProduto[]
  alertas: Alerta[]
}

// ==================== COMPONENTE PRINCIPAL ====================

export function DashboardPrincipal() {
  const { supabase } = useSupabase()
  const { predict, chat, isLoading: aiLoading } = useIcarusBrain()

  // Estados
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')
  const [aiInsight, setAiInsight] = useState<string>('')

  // ==================== EFEITOS ====================

  useEffect(() => {
    loadDashboardData()
  }, [selectedPeriod])

  // ==================== FUNÇÕES DE DADOS ====================

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      // Simular carregamento de dados agregados
      // Em produção: múltiplas queries ao Supabase com JOIN e agregações

      const mockData: DashboardData = {
        kpis: {
          faturamentoMes: 1250000,
          faturamentoVariacao: 12.5, // +12.5%
          cirurgiasAgendadas: 23,
          cirurgiasVariacao: -8.2, // -8.2%
          estoqueCritico: 8,
          estoqueCriticoVariacao: 14.3, // +14.3% (aumento = ruim)
          inadimplencia: 5.8, // 5.8%
          inadimplenciaVariacao: -2.1, // -2.1% (redução = bom)
        },
        cirurgiasProximas: [
          {
            id: 1,
            hospital: 'Hospital São Lucas',
            procedimento: 'Artroplastia de Joelho',
            data: '2025-11-18T09:00:00',
            valor: 45000,
            status: 'critico',
            diasRestantes: 2,
          },
          {
            id: 2,
            hospital: 'Clínica Ortopédica Excellence',
            procedimento: 'Artrodese de Coluna',
            data: '2025-11-19T14:00:00',
            valor: 62000,
            status: 'pendente',
            diasRestantes: 3,
          },
          {
            id: 3,
            hospital: 'Hospital Regional Sul',
            procedimento: 'Artroplastia de Quadril',
            data: '2025-11-20T08:30:00',
            valor: 52000,
            status: 'ok',
            diasRestantes: 4,
          },
          {
            id: 4,
            hospital: 'Hospital Santa Maria',
            procedimento: 'Reconstrução de LCA',
            data: '2025-11-21T10:00:00',
            valor: 18000,
            status: 'ok',
            diasRestantes: 5,
          },
        ],
        estoqueCritico: [
          {
            id: 1,
            nome: 'Prótese de Joelho - Modelo Premium',
            estoque: 2,
            minimo: 5,
            valor_unitario: 35000,
            categoria: 'Próteses',
            urgencia: 'alto',
          },
          {
            id: 2,
            nome: 'Cage Intersomático PEEK',
            estoque: 3,
            minimo: 8,
            valor_unitario: 7000,
            categoria: 'Implantes Coluna',
            urgencia: 'alto',
          },
          {
            id: 3,
            nome: 'Parafusos de Fixação Titânio (kit)',
            estoque: 8,
            minimo: 15,
            valor_unitario: 5000,
            categoria: 'Fixação',
            urgencia: 'medio',
          },
          {
            id: 4,
            nome: 'Sistema de Fixação Vertebral',
            estoque: 1,
            minimo: 3,
            valor_unitario: 48000,
            categoria: 'Implantes Coluna',
            urgencia: 'alto',
          },
          {
            id: 5,
            nome: 'Haste Intramedular Bloqueada',
            estoque: 4,
            minimo: 6,
            valor_unitario: 28000,
            categoria: 'Implantes Trauma',
            urgencia: 'medio',
          },
        ],
        pendenciasFinanceiras: [
          {
            id: 1,
            hospital: 'Hospital Regional Norte',
            valor: 128000,
            vencimento: '2025-11-10',
            diasAtraso: 6,
            status: 'vencido',
          },
          {
            id: 2,
            hospital: 'Clínica São José',
            valor: 85000,
            vencimento: '2025-11-05',
            diasAtraso: 11,
            status: 'critico',
          },
          {
            id: 3,
            hospital: 'Hospital Santa Catarina',
            valor: 52000,
            vencimento: '2025-11-18',
            diasAtraso: 0,
            status: 'a_vencer',
          },
        ],
        topHospitais: [
          {
            id: 1,
            nome: 'Hospital São Lucas',
            faturamento: 425000,
            cirurgias: 8,
            crescimento: 18.5,
          },
          {
            id: 2,
            nome: 'Clínica Ortopédica Excellence',
            faturamento: 380000,
            cirurgias: 7,
            crescimento: 12.3,
          },
          {
            id: 3,
            nome: 'Hospital Regional Sul',
            faturamento: 285000,
            cirurgias: 5,
            crescimento: -5.2,
          },
          {
            id: 4,
            nome: 'Hospital Santa Maria',
            faturamento: 220000,
            cirurgias: 4,
            crescimento: 8.7,
          },
          {
            id: 5,
            nome: 'Clínica Traumato Center',
            faturamento: 180000,
            cirurgias: 3,
            crescimento: 22.1,
          },
        ],
        topProdutos: [
          {
            id: 1,
            nome: 'Prótese de Joelho Premium',
            quantidade: 12,
            faturamento: 420000,
            categoria: 'Próteses',
          },
          {
            id: 2,
            nome: 'Sistema Fixação Vertebral',
            quantidade: 8,
            faturamento: 384000,
            categoria: 'Implantes Coluna',
          },
          {
            id: 3,
            nome: 'Prótese de Quadril Cimentada',
            quantidade: 7,
            faturamento: 294000,
            categoria: 'Próteses',
          },
          {
            id: 4,
            nome: 'Haste Intramedular Bloqueada',
            quantidade: 10,
            faturamento: 280000,
            categoria: 'Implantes Trauma',
          },
          {
            id: 5,
            nome: 'Parafusos Titânio (kit)',
            quantidade: 45,
            faturamento: 225000,
            categoria: 'Fixação',
          },
        ],
        alertas: [
          {
            id: 1,
            tipo: 'estoque',
            prioridade: 'critica',
            titulo: 'Estoque Crítico: Sistema de Fixação Vertebral',
            mensagem: 'Apenas 1 unidade em estoque. 2 cirurgias agendadas nos próximos 7 dias.',
            data: '2025-11-16T08:00:00',
          },
          {
            id: 2,
            tipo: 'cirurgia',
            prioridade: 'alta',
            titulo: 'Cirurgia em 48h - Produtos Pendentes',
            mensagem: 'Artroplastia de Joelho (Hospital São Lucas) - 2 produtos ainda não entregues.',
            data: '2025-11-16T09:30:00',
          },
          {
            id: 3,
            tipo: 'financeiro',
            prioridade: 'alta',
            titulo: 'Inadimplência: Clínica São José',
            mensagem: 'R$ 85.000 com 11 dias de atraso. Valor total: R$ 85.000.',
            data: '2025-11-16T07:15:00',
          },
          {
            id: 4,
            tipo: 'estoque',
            prioridade: 'media',
            titulo: 'Produtos Próximos ao Vencimento',
            mensagem: '5 produtos com validade em até 60 dias. Valor total: R$ 142.000.',
            data: '2025-11-15T16:20:00',
          },
          {
            id: 5,
            tipo: 'sistema',
            prioridade: 'baixa',
            titulo: 'Integração NFe Sincronizada',
            mensagem: 'Todas as 15 notas fiscais do dia foram emitidas com sucesso.',
            data: '2025-11-15T18:00:00',
          },
        ],
      }

      setDashboardData(mockData)
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateInsights = async () => {
    if (!dashboardData) return

    try {
      const prompt = `Analise os dados do dashboard da distribuidora OPME e forneça insights estratégicos:

FATURAMENTO: ${formatCurrency(dashboardData.kpis.faturamentoMes)} (${dashboardData.kpis.faturamentoVariacao > 0 ? '+' : ''}${dashboardData.kpis.faturamentoVariacao}%)
CIRURGIAS AGENDADAS: ${dashboardData.kpis.cirurgiasAgendadas} (${dashboardData.kpis.cirurgiasVariacao}%)
ESTOQUE CRÍTICO: ${dashboardData.kpis.estoqueCritico} produtos
INADIMPLÊNCIA: ${dashboardData.kpis.inadimplencia}%

TOP 3 HOSPITAIS:
${dashboardData.topHospitais.slice(0, 3).map(h => `- ${h.nome}: ${formatCurrency(h.faturamento)} (${h.crescimento > 0 ? '+' : ''}${h.crescimento}%)`).join('\n')}

ALERTAS CRÍTICOS: ${dashboardData.alertas.filter(a => a.prioridade === 'critica' || a.prioridade === 'alta').length}

Forneça:
1. Análise da situação atual
2. Principais riscos e oportunidades
3. Recomendações estratégicas (3-5 ações prioritárias)
4. Predições para os próximos 30 dias`

      const response = await chat(prompt)
      setAiInsight(response)
    } catch (error) {
      console.error('Erro ao gerar insights:', error)
    }
  }

  // ==================== HELPERS ====================

  const getStatusColor = (status: string) => {
    const colors = {
      ok: 'text-green-600 bg-green-100',
      pendente: 'text-yellow-600 bg-yellow-100',
      critico: 'text-red-600 bg-red-100',
      a_vencer: 'text-blue-600 bg-blue-100',
      vencido: 'text-orange-600 bg-orange-100',
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  const getPrioridadeColor = (prioridade: string) => {
    const colors = {
      baixa: 'text-blue-700 bg-blue-50 border-blue-200',
      media: 'text-yellow-700 bg-yellow-50 border-yellow-200',
      alta: 'text-orange-700 bg-orange-50 border-orange-200',
      critica: 'text-red-700 bg-red-50 border-red-200',
    }
    return colors[prioridade as keyof typeof colors] || 'text-gray-700 bg-gray-50 border-gray-200'
  }

  const getUrgenciaColor = (urgencia: string) => {
    const colors = {
      baixo: 'text-blue-600',
      medio: 'text-yellow-600',
      alto: 'text-red-600',
    }
    return colors[urgencia as keyof typeof colors] || 'text-gray-600'
  }

  const getVariacaoIcon = (valor: number) => {
    if (valor > 0) return '↗'
    if (valor < 0) return '↘'
    return '→'
  }

  const getVariacaoColor = (valor: number, inverso: boolean = false) => {
    // inverso = true quando aumento é ruim (ex: inadimplência, estoque crítico)
    const isPositive = inverso ? valor < 0 : valor > 0
    return isPositive ? 'text-green-600' : 'text-red-600'
  }

  // ==================== RENDERIZAÇÃO ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return <div className="p-6">Erro ao carregar dados do dashboard.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Executivo</h1>
          <p className="text-muted-foreground mt-1">
            Visão consolidada do negócio OPME - Distribuidora B2B
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleGenerateInsights} disabled={aiLoading}>
            {aiLoading ? 'Gerando...' : '🤖 Insights de IA'}
          </Button>
          <Button variant="outline">📊 Exportar Relatório</Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Faturamento do Mês */}
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Faturamento do Mês</CardDescription>
            <CardTitle className="text-3xl text-green-600">
              {formatCurrency(dashboardData.kpis.faturamentoMes)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${getVariacaoColor(dashboardData.kpis.faturamentoVariacao)}`}>
              {getVariacaoIcon(dashboardData.kpis.faturamentoVariacao)} {Math.abs(dashboardData.kpis.faturamentoVariacao)}% vs mês anterior
            </p>
          </CardContent>
        </Card>

        {/* Cirurgias Agendadas */}
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Cirurgias Agendadas</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {dashboardData.kpis.cirurgiasAgendadas}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${getVariacaoColor(dashboardData.kpis.cirurgiasVariacao)}`}>
              {getVariacaoIcon(dashboardData.kpis.cirurgiasVariacao)} {Math.abs(dashboardData.kpis.cirurgiasVariacao)}% próximos 7 dias
            </p>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Produtos Estoque Crítico</CardDescription>
            <CardTitle className="text-3xl text-orange-600">
              {dashboardData.kpis.estoqueCritico}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${getVariacaoColor(dashboardData.kpis.estoqueCriticoVariacao, true)}`}>
              {getVariacaoIcon(dashboardData.kpis.estoqueCriticoVariacao)} {Math.abs(dashboardData.kpis.estoqueCriticoVariacao)}% abaixo do mínimo
            </p>
          </CardContent>
        </Card>

        {/* Inadimplência */}
        <Card className="neu-soft">
          <CardHeader className="pb-2">
            <CardDescription>Taxa de Inadimplência</CardDescription>
            <CardTitle className="text-3xl text-purple-600">
              {dashboardData.kpis.inadimplencia}%
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-sm font-medium ${getVariacaoColor(dashboardData.kpis.inadimplenciaVariacao, true)}`}>
              {getVariacaoIcon(dashboardData.kpis.inadimplenciaVariacao)} {Math.abs(dashboardData.kpis.inadimplenciaVariacao)}% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticos */}
      {dashboardData.alertas.filter(a => a.prioridade === 'critica' || a.prioridade === 'alta').length > 0 && (
        <Card className="neu-soft border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚨 Alertas Importantes ({dashboardData.alertas.filter(a => a.prioridade === 'critica' || a.prioridade === 'alta').length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.alertas
                .filter(a => a.prioridade === 'critica' || a.prioridade === 'alta')
                .slice(0, 3)
                .map(alerta => (
                  <div
                    key={alerta.id}
                    className={`p-3 rounded-lg border ${getPrioridadeColor(alerta.prioridade)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">{alerta.titulo}</h4>
                        <p className="text-xs mt-1 opacity-90">{alerta.mensagem}</p>
                      </div>
                      <span className="text-xs opacity-75">{formatDate(alerta.data)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Cirurgias */}
        <Card className="neu-soft">
          <CardHeader>
            <CardTitle>Próximas Cirurgias</CardTitle>
            <CardDescription>Procedimentos agendados que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.cirurgiasProximas.slice(0, 4).map(cirurgia => (
                <div key={cirurgia.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{cirurgia.procedimento}</h4>
                      <p className="text-xs text-muted-foreground">{cirurgia.hospital}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(cirurgia.status)}`}>
                      {cirurgia.diasRestantes}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{formatDate(cirurgia.data)}</span>
                    <span className="font-semibold text-green-600">{formatCurrency(cirurgia.valor)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="neu-soft">
          <CardHeader>
            <CardTitle>Produtos em Estoque Crítico</CardTitle>
            <CardDescription>Produtos abaixo do estoque mínimo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.estoqueCritico.slice(0, 4).map(produto => (
                <div key={produto.id} className="p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{produto.nome}</h4>
                      <p className="text-xs text-muted-foreground">{produto.categoria}</p>
                    </div>
                    <span className={`font-bold ${getUrgenciaColor(produto.urgencia)}`}>
                      {produto.estoque}/{produto.minimo}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${getUrgenciaColor(produto.urgencia)}`}>
                      Urgência: {produto.urgencia.toUpperCase()}
                    </span>
                    <span className="text-muted-foreground">{formatCurrency(produto.valor_unitario)}/un</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Hospitais */}
        <Card className="neu-soft">
          <CardHeader>
            <CardTitle>Top 5 Hospitais (B2B)</CardTitle>
            <CardDescription>Principais clientes por faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.topHospitais.map((hospital, index) => (
                <div key={hospital.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{hospital.nome}</h4>
                    <p className="text-xs text-muted-foreground">{hospital.cirurgias} cirurgias</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(hospital.faturamento)}</p>
                    <p className={`text-xs font-medium ${getVariacaoColor(hospital.crescimento)}`}>
                      {hospital.crescimento > 0 ? '+' : ''}{hospital.crescimento}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Produtos */}
        <Card className="neu-soft">
          <CardHeader>
            <CardTitle>Top 5 Produtos</CardTitle>
            <CardDescription>Produtos mais vendidos por faturamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.topProdutos.map((produto, index) => (
                <div key={produto.id} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{produto.nome}</h4>
                    <p className="text-xs text-muted-foreground">{produto.categoria} • {produto.quantidade} unidades</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-green-600">{formatCurrency(produto.faturamento)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pendências Financeiras */}
      {dashboardData.pendenciasFinanceiras.length > 0 && (
        <Card className="neu-soft">
          <CardHeader>
            <CardTitle>Pendências Financeiras</CardTitle>
            <CardDescription>Contas a receber vencidas ou próximas do vencimento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.pendenciasFinanceiras.map(pendencia => (
                <div key={pendencia.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{pendencia.hospital}</h4>
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {formatDate(pendencia.vencimento)}
                      {pendencia.diasAtraso > 0 && ` • ${pendencia.diasAtraso} dias de atraso`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-lg">{formatCurrency(pendencia.valor)}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(pendencia.status)}`}>
                      {pendencia.status === 'critico' ? 'CRÍTICO' : pendencia.status === 'vencido' ? 'VENCIDO' : 'A VENCER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights de IA */}
      {aiInsight && (
        <Card className="neu-soft border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🤖 Insights Estratégicos de IA
            </CardTitle>
            <CardDescription>Análise inteligente baseada nos dados do dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-sm">{aiInsight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Todos os Alertas */}
      <Card className="neu-soft">
        <CardHeader>
          <CardTitle>Centro de Notificações</CardTitle>
          <CardDescription>Todos os alertas e notificações do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="todos">Todos ({dashboardData.alertas.length})</TabsTrigger>
              <TabsTrigger value="critica">
                Críticos ({dashboardData.alertas.filter(a => a.prioridade === 'critica').length})
              </TabsTrigger>
              <TabsTrigger value="alta">
                Alta ({dashboardData.alertas.filter(a => a.prioridade === 'alta').length})
              </TabsTrigger>
              <TabsTrigger value="media">
                Média ({dashboardData.alertas.filter(a => a.prioridade === 'media').length})
              </TabsTrigger>
              <TabsTrigger value="baixa">
                Baixa ({dashboardData.alertas.filter(a => a.prioridade === 'baixa').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="todos" className="space-y-2 mt-4">
              {dashboardData.alertas.map(alerta => (
                <div
                  key={alerta.id}
                  className={`p-3 rounded-lg border ${getPrioridadeColor(alerta.prioridade)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold uppercase">{alerta.tipo}</span>
                        <span className="text-xs opacity-75">•</span>
                        <span className="text-xs opacity-75">{formatDate(alerta.data)}</span>
                      </div>
                      <h4 className="font-semibold text-sm">{alerta.titulo}</h4>
                      <p className="text-xs mt-1 opacity-90">{alerta.mensagem}</p>
                    </div>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </div>
                </div>
              ))}
            </TabsContent>

            {['critica', 'alta', 'media', 'baixa'].map(prioridade => (
              <TabsContent key={prioridade} value={prioridade} className="space-y-2 mt-4">
                {dashboardData.alertas
                  .filter(a => a.prioridade === prioridade)
                  .map(alerta => (
                    <div
                      key={alerta.id}
                      className={`p-3 rounded-lg border ${getPrioridadeColor(alerta.prioridade)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold uppercase">{alerta.tipo}</span>
                            <span className="text-xs opacity-75">•</span>
                            <span className="text-xs opacity-75">{formatDate(alerta.data)}</span>
                          </div>
                          <h4 className="font-semibold text-sm">{alerta.titulo}</h4>
                          <p className="text-xs mt-1 opacity-90">{alerta.mensagem}</p>
                        </div>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </div>
                    </div>
                  ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
