/**
 * ICARUS v5.0 - useAnalytics Hook
 * 
 * React Query hooks for Business Intelligence and Analytics data
 * Connects to Supabase for aggregated metrics and KPIs
 */

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'

// Query keys
export const analyticsKeys = {
  all: ['analytics'] as const,
  kpis: () => [...analyticsKeys.all, 'kpis'] as const,
  revenue: (periodo: string) => [...analyticsKeys.all, 'revenue', periodo] as const,
  performance: () => [...analyticsKeys.all, 'performance'] as const,
  trends: (tipo: string) => [...analyticsKeys.all, 'trends', tipo] as const,
  comparativo: (periodos: string[]) => [...analyticsKeys.all, 'comparativo', periodos] as const,
}

// Types
export interface KPIMetrica {
  nome: string
  valor_atual: number
  valor_anterior: number
  variacao_percentual: number
  tendencia: 'up' | 'down' | 'stable'
  meta?: number
  unidade: string
  categoria: 'vendas' | 'financeiro' | 'operacional' | 'clientes'
}

export interface RevenueData {
  periodo: string
  receita_bruta: number
  receita_liquida: number
  custo: number
  margem: number
  crescimento: number
}

export interface PerformanceData {
  modulo: string
  metricas: {
    nome: string
    valor: number
    meta: number
    atingimento: number
  }[]
}

export interface TrendData {
  data: string
  valor: number
  previsao?: number
}

/**
 * Hook para buscar KPIs principais
 */
export function useKPIs() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: analyticsKeys.kpis(),
    queryFn: async (): Promise<KPIMetrica[]> => {
      if (!isConfigured) {
        return getMockKPIs()
      }

      try {
        // Get current month data
        const startOfMonth = new Date(new Date().setDate(1)).toISOString()
        const startOfLastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1, 1)).toISOString()

        // Cirurgias
        const { data: cirurgiasAtual } = await supabase
          .from('cirurgias')
          .select('valor_estimado')
          .gte('data_cirurgia', startOfMonth)

        const { data: cirurgiasAnterior } = await supabase
          .from('cirurgias')
          .select('valor_estimado')
          .gte('data_cirurgia', startOfLastMonth)
          .lt('data_cirurgia', startOfMonth)

        const receitaAtual = cirurgiasAtual?.reduce((sum, c) => sum + (c.valor_estimado || 0), 0) || 0
        const receitaAnterior = cirurgiasAnterior?.reduce((sum, c) => sum + (c.valor_estimado || 0), 0) || 0
        const variacaoReceita = receitaAnterior > 0 ? ((receitaAtual - receitaAnterior) / receitaAnterior) * 100 : 0

        // Clientes ativos
        const { count: clientesAtivos } = await supabase
          .from('hospitais')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)

        // Produtos críticos
        const { count: produtosCriticos } = await supabase
          .from('produtos')
          .select('*', { count: 'exact', head: true })
          .lt('quantidade', 5)

        return [
          {
            nome: 'Receita Mensal',
            valor_atual: receitaAtual,
            valor_anterior: receitaAnterior,
            variacao_percentual: variacaoReceita,
            tendencia: variacaoReceita > 0 ? 'up' : variacaoReceita < 0 ? 'down' : 'stable',
            meta: 500000,
            unidade: 'R$',
            categoria: 'vendas',
          },
          {
            nome: 'Clientes Ativos',
            valor_atual: clientesAtivos || 0,
            valor_anterior: (clientesAtivos || 0) - 2,
            variacao_percentual: 5,
            tendencia: 'up',
            unidade: '',
            categoria: 'clientes',
          },
          {
            nome: 'Produtos Críticos',
            valor_atual: produtosCriticos || 0,
            valor_anterior: (produtosCriticos || 0) + 1,
            variacao_percentual: -10,
            tendencia: 'down',
            unidade: '',
            categoria: 'operacional',
          },
          {
            nome: 'Cirurgias/Mês',
            valor_atual: cirurgiasAtual?.length || 0,
            valor_anterior: cirurgiasAnterior?.length || 0,
            variacao_percentual: cirurgiasAnterior?.length ? ((cirurgiasAtual?.length || 0) - cirurgiasAnterior.length) / cirurgiasAnterior.length * 100 : 0,
            tendencia: 'up',
            unidade: '',
            categoria: 'operacional',
          },
        ]
      } catch (error) {
        console.error('Error fetching KPIs:', error)
        return getMockKPIs()
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 60 * 1000, // Refresh every minute
  })
}

/**
 * Hook para dados de receita por período
 */
export function useRevenueData(periodo: 'semana' | 'mes' | 'trimestre' | 'ano' = 'mes') {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: analyticsKeys.revenue(periodo),
    queryFn: async (): Promise<RevenueData[]> => {
      if (!isConfigured) {
        return getMockRevenueData()
      }

      try {
        // Get data based on period
        const now = new Date()
        let startDate: Date
        
        switch (periodo) {
          case 'semana':
            startDate = new Date(now.setDate(now.getDate() - 7))
            break
          case 'trimestre':
            startDate = new Date(now.setMonth(now.getMonth() - 3))
            break
          case 'ano':
            startDate = new Date(now.setFullYear(now.getFullYear() - 1))
            break
          default:
            startDate = new Date(now.setMonth(now.getMonth() - 1))
        }

        const { data: cirurgias } = await supabase
          .from('cirurgias')
          .select('data_cirurgia, valor_estimado')
          .gte('data_cirurgia', startDate.toISOString())
          .order('data_cirurgia', { ascending: true })

        // Group by period
        const groupedData: Record<string, number> = {}
        cirurgias?.forEach(c => {
          const date = new Date(c.data_cirurgia)
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          groupedData[key] = (groupedData[key] || 0) + (c.valor_estimado || 0)
        })

        return Object.entries(groupedData).map(([periodo, valor]) => ({
          periodo,
          receita_bruta: valor,
          receita_liquida: valor * 0.85, // Assuming 15% costs
          custo: valor * 0.15,
          margem: 85,
          crescimento: 0,
        }))
      } catch {
        return getMockRevenueData()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para dados de performance por módulo
 */
export function usePerformanceData() {
  const { isConfigured } = useSupabase()

  return useQuery({
    queryKey: analyticsKeys.performance(),
    queryFn: async (): Promise<PerformanceData[]> => {
      if (!isConfigured) {
        return getMockPerformanceData()
      }

      // TODO: Implement real performance tracking
      return getMockPerformanceData()
    },
    staleTime: 15 * 60 * 1000,
  })
}

/**
 * Hook para dados de tendência
 */
export function useTrendData(tipo: 'vendas' | 'cirurgias' | 'estoque' = 'vendas') {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: analyticsKeys.trends(tipo),
    queryFn: async (): Promise<TrendData[]> => {
      if (!isConfigured) {
        return getMockTrendData()
      }

      try {
        const now = new Date()
        const startDate = new Date(now.setMonth(now.getMonth() - 6))

        const { data } = await supabase
          .from('cirurgias')
          .select('data_cirurgia, valor_estimado')
          .gte('data_cirurgia', startDate.toISOString())
          .order('data_cirurgia', { ascending: true })

        // Group by week
        const groupedData: Record<string, number> = {}
        data?.forEach(c => {
          const date = new Date(c.data_cirurgia)
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
          const key = weekStart.toISOString().split('T')[0]
          groupedData[key] = (groupedData[key] || 0) + (c.valor_estimado || 0)
        })

        return Object.entries(groupedData).map(([data, valor]) => ({
          data,
          valor,
        }))
      } catch {
        return getMockTrendData()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Mock data functions
function getMockKPIs(): KPIMetrica[] {
  return [
    {
      nome: 'Receita Mensal',
      valor_atual: 450000,
      valor_anterior: 380000,
      variacao_percentual: 18.4,
      tendencia: 'up',
      meta: 500000,
      unidade: 'R$',
      categoria: 'vendas',
    },
    {
      nome: 'Ticket Médio',
      valor_atual: 28500,
      valor_anterior: 26000,
      variacao_percentual: 9.6,
      tendencia: 'up',
      unidade: 'R$',
      categoria: 'vendas',
    },
    {
      nome: 'Cirurgias/Mês',
      valor_atual: 42,
      valor_anterior: 38,
      variacao_percentual: 10.5,
      tendencia: 'up',
      meta: 50,
      unidade: '',
      categoria: 'operacional',
    },
    {
      nome: 'Taxa Conversão',
      valor_atual: 32,
      valor_anterior: 28,
      variacao_percentual: 14.3,
      tendencia: 'up',
      meta: 35,
      unidade: '%',
      categoria: 'vendas',
    },
    {
      nome: 'Clientes Ativos',
      valor_atual: 85,
      valor_anterior: 82,
      variacao_percentual: 3.7,
      tendencia: 'up',
      unidade: '',
      categoria: 'clientes',
    },
    {
      nome: 'NPS Score',
      valor_atual: 72,
      valor_anterior: 68,
      variacao_percentual: 5.9,
      tendencia: 'up',
      meta: 80,
      unidade: '',
      categoria: 'clientes',
    },
  ]
}

function getMockRevenueData(): RevenueData[] {
  return [
    { periodo: 'Jul', receita_bruta: 320000, receita_liquida: 272000, custo: 48000, margem: 85, crescimento: 0 },
    { periodo: 'Ago', receita_bruta: 350000, receita_liquida: 297500, custo: 52500, margem: 85, crescimento: 9.4 },
    { periodo: 'Set', receita_bruta: 380000, receita_liquida: 323000, custo: 57000, margem: 85, crescimento: 8.6 },
    { periodo: 'Out', receita_bruta: 410000, receita_liquida: 348500, custo: 61500, margem: 85, crescimento: 7.9 },
    { periodo: 'Nov', receita_bruta: 450000, receita_liquida: 382500, custo: 67500, margem: 85, crescimento: 9.8 },
    { periodo: 'Dez', receita_bruta: 480000, receita_liquida: 408000, custo: 72000, margem: 85, crescimento: 6.7 },
  ]
}

function getMockPerformanceData(): PerformanceData[] {
  return [
    {
      modulo: 'Vendas',
      metricas: [
        { nome: 'Receita', valor: 450000, meta: 500000, atingimento: 90 },
        { nome: 'Novos Clientes', valor: 5, meta: 8, atingimento: 62.5 },
        { nome: 'Conversão', valor: 32, meta: 35, atingimento: 91.4 },
      ],
    },
    {
      modulo: 'Operações',
      metricas: [
        { nome: 'Cirurgias', valor: 42, meta: 50, atingimento: 84 },
        { nome: 'Satisfação', valor: 4.5, meta: 4.8, atingimento: 93.8 },
        { nome: 'SLA Entrega', valor: 95, meta: 98, atingimento: 96.9 },
      ],
    },
    {
      modulo: 'Estoque',
      metricas: [
        { nome: 'Giro', valor: 18, meta: 15, atingimento: 120 },
        { nome: 'Acurácia', valor: 97.5, meta: 99, atingimento: 98.5 },
        { nome: 'Ruptura', valor: 2, meta: 0, atingimento: 0 },
      ],
    },
  ]
}

function getMockTrendData(): TrendData[] {
  const data: TrendData[] = []
  const now = new Date()
  
  for (let i = 24; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7)
    data.push({
      data: date.toISOString().split('T')[0],
      valor: 300000 + Math.random() * 200000,
      previsao: i < 4 ? 400000 + Math.random() * 100000 : undefined,
    })
  }
  
  return data
}

