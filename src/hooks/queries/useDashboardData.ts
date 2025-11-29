/**
 * React Query hooks for Dashboard data
 */

import { useQuery } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { queryKeys } from '@/lib/query/queryClient'

interface KPIData {
  surgeriesToday: number
  surgeriesChange: number
  criticalStock: number
  revenue: number
  revenueChange: number
  aiStatus: 'online' | 'offline'
}

/**
 * Hook to fetch dashboard KPIs
 */
export function useDashboardKPIs() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.dashboard.kpis(),
    queryFn: async (): Promise<KPIData> => {
      // If Supabase is not configured, return mock data
      if (!isConfigured) {
        return {
          surgeriesToday: 12,
          surgeriesChange: 2,
          criticalStock: 3,
          revenue: 45200,
          revenueChange: 12,
          aiStatus: 'online' as const,
        }
      }

      try {
        // Fetch surgeries today - only count needed, select minimal fields
        const today = new Date().toISOString().split('T')[0]
        const { data: surgeries, error: surgeriesError} = await supabase
          .from('cirurgias')
          .select('id, status')
          .eq('data_agendada', today)

        if (surgeriesError) throw surgeriesError

        // Fetch critical stock products - only count needed, select minimal fields
        const { data: products, error: productsError } = await supabase
          .from('produtos')
          .select('id, quantidade_estoque')
          .lt('quantidade_estoque', 10) // Products with stock < 10

        if (productsError) throw productsError

        // Calculate revenue (mock for now)
        const revenue = 45200

        return {
          surgeriesToday: surgeries?.length || 0,
          surgeriesChange: 2, // Mock change percentage
          criticalStock: products?.length || 0,
          revenue: revenue,
          revenueChange: 12, // Mock change percentage
          aiStatus: 'online' as const,
        }
      } catch (error) {
        console.error('Error loading dashboard KPIs:', error)

        // Return mock data on error
        return {
          surgeriesToday: 0,
          surgeriesChange: 0,
          criticalStock: 0,
          revenue: 0,
          revenueChange: 0,
          aiStatus: 'offline' as const,
        }
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard data changes frequently)
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes
  })
}

/**
 * Hook to fetch recent orders for dashboard
 */
export function useDashboardRecentOrders() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.dashboard.recentOrders(),
    queryFn: async () => {
      if (!isConfigured) {
        // Return mock data
        return []
      }

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch dashboard statistics
 */
export function useDashboardStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: async () => {
      if (!isConfigured) {
        // Return mock data
        return {
          revenueData: [
            { month: 'Jan', valor: 45000 },
            { month: 'Fev', valor: 52000 },
            { month: 'Mar', valor: 48000 },
            { month: 'Abr', valor: 61000 },
            { month: 'Mai', valor: 55000 },
            { month: 'Jun', valor: 67000 },
          ],
          surgeriesData: [
            { dia: 'Seg', cirurgias: 12 },
            { dia: 'Ter', cirurgias: 15 },
            { dia: 'Qua', cirurgias: 8 },
            { dia: 'Qui', cirurgias: 18 },
            { dia: 'Sex', cirurgias: 14 },
          ],
          productCategoryData: [
            { name: 'Cardiologia (CRM)', value: 35, color: '#6366F1' },
            { name: 'Cirurgia Vascular', value: 30, color: '#10B981' },
            { name: 'Eletrofisiologia', value: 15, color: '#8b5cf6' },
            { name: 'Hemodinâmica', value: 12, color: '#EF4444' },
            { name: 'Outros', value: 8, color: '#8B5CF6' },
          ],
        }
      }

      // Fetch real statistics from Supabase
      try {
        // 1. Revenue data - last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: invoices, error: invoicesError } = await supabase
          .from('notas_fiscais')
          .select('valor_total, data_emissao')
          .gte('data_emissao', sixMonthsAgo.toISOString())
          .eq('status', 'paid')

        if (invoicesError) throw invoicesError

        // Group by month
        const revenueByMonth = (invoices || []).reduce((acc, inv) => {
          const month = new Date(inv.data_emissao).toLocaleDateString('pt-BR', { month: 'short' })
          acc[month] = (acc[month] || 0) + inv.valor_total
          return acc
        }, {} as Record<string, number>)

        const revenueData = Object.entries(revenueByMonth).map(([month, valor]) => ({
          month,
          valor
        }))

        // 2. Surgeries data - current week
        const startOfWeek = new Date()
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

        const { data: surgeries, error: surgeriesError } = await supabase
          .from('cirurgias')
          .select('data_agendada')
          .gte('data_agendada', startOfWeek.toISOString())

        if (surgeriesError) throw surgeriesError

        // Group by day of week
        const surgeriesByDay = (surgeries || []).reduce((acc, surgery) => {
          const day = new Date(surgery.data_agendada).toLocaleDateString('pt-BR', { weekday: 'short' })
          acc[day] = (acc[day] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const surgeriesData = Object.entries(surgeriesByDay).map(([dia, cirurgias]) => ({
          dia,
          cirurgias
        }))

        // 3. Product category distribution
        const { data: products, error: productsError } = await supabase
          .from('produtos')
          .select('categoria_id, categorias_produtos(nome), preco_venda, quantidade_estoque')

        if (productsError) throw productsError

        // Group by category
        const categoryDistribution = (products || []).reduce((acc, product) => {
          const productWithCategory = product as typeof product & { categorias_produtos?: { nome: string } }
          const categoryName = productWithCategory.categorias_produtos?.nome || 'Outros'
          if (!acc[categoryName]) {
            acc[categoryName] = { total: 0, value: 0 }
          }
          acc[categoryName].total += (product.preco_venda * product.quantidade_estoque)
          return acc
        }, {} as Record<string, { total: number, value: 0 }>)

        const totalValue = Object.values(categoryDistribution).reduce((sum, cat) => sum + cat.total, 0)
        const colors = ['#6366F1', '#10B981', '#8b5cf6', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899']

        const productCategoryData = Object.entries(categoryDistribution).map(([name, data], index) => ({
          name,
          value: Math.round((data.total / totalValue) * 100),
          color: colors[index % colors.length]
        }))

        return {
          revenueData,
          surgeriesData,
          productCategoryData
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)

        // Fallback to mock data on error
        return {
          revenueData: [
            { month: 'Jan', valor: 45000 },
            { month: 'Fev', valor: 52000 },
            { month: 'Mar', valor: 48000 },
            { month: 'Abr', valor: 61000 },
            { month: 'Mai', valor: 55000 },
            { month: 'Jun', valor: 67000 },
          ],
          surgeriesData: [
            { dia: 'Seg', cirurgias: 12 },
            { dia: 'Ter', cirurgias: 15 },
            { dia: 'Qua', cirurgias: 8 },
            { dia: 'Qui', cirurgias: 18 },
            { dia: 'Sex', cirurgias: 14 },
          ],
          productCategoryData: [
            { name: 'Cardiologia (CRM)', value: 35, color: '#6366F1' },
            { name: 'Cirurgia Vascular', value: 30, color: '#10B981' },
            { name: 'Eletrofisiologia', value: 15, color: '#8b5cf6' },
            { name: 'Hemodinâmica', value: 12, color: '#EF4444' },
            { name: 'Outros', value: 8, color: '#8B5CF6' },
          ],
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (stats change less frequently)
  })
}
