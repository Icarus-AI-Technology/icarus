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
        // Fetch surgeries today
        const today = new Date().toISOString().split('T')[0]
        const { data: surgeries, error: surgeriesError } = await supabase
          .from('surgeries')
          .select('*')
          .eq('scheduled_date', today)

        if (surgeriesError) throw surgeriesError

        // Fetch critical stock products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .lt('stock_quantity', 10) // Simplified: products with stock < 10

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
            { name: 'Cardiologia', value: 30, color: '#6366F1' },
            { name: 'Ortopedia', value: 25, color: '#10B981' },
            { name: 'Neurocirurgia', value: 20, color: '#F59E0B' },
            { name: 'Oftalmologia', value: 15, color: '#EF4444' },
            { name: 'Outros', value: 10, color: '#8B5CF6' },
          ],
        }
      }

      // Fetch real statistics from Supabase
      try {
        // 1. Revenue data - last 6 months
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const { data: invoices, error: invoicesError } = await supabase
          .from('invoices')
          .select('total_amount, issue_date')
          .gte('issue_date', sixMonthsAgo.toISOString())
          .eq('status', 'paid')

        if (invoicesError) throw invoicesError

        // Group by month
        const revenueByMonth = (invoices || []).reduce((acc, inv) => {
          const month = new Date(inv.issue_date).toLocaleDateString('pt-BR', { month: 'short' })
          acc[month] = (acc[month] || 0) + inv.total_amount
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
          .from('surgeries')
          .select('scheduled_date')
          .gte('scheduled_date', startOfWeek.toISOString())

        if (surgeriesError) throw surgeriesError

        // Group by day of week
        const surgeriesByDay = (surgeries || []).reduce((acc, surgery) => {
          const day = new Date(surgery.scheduled_date).toLocaleDateString('pt-BR', { weekday: 'short' })
          acc[day] = (acc[day] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const surgeriesData = Object.entries(surgeriesByDay).map(([dia, cirurgias]) => ({
          dia,
          cirurgias
        }))

        // 3. Product category distribution
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('category_id, categories(name), sale_price, stock_quantity')

        if (productsError) throw productsError

        // Group by category
        const categoryDistribution = (products || []).reduce((acc, product) => {
          const categoryName = (product as any).categories?.name || 'Outros'
          if (!acc[categoryName]) {
            acc[categoryName] = { total: 0, value: 0 }
          }
          acc[categoryName].total += (product.sale_price * product.stock_quantity)
          return acc
        }, {} as Record<string, { total: number, value: number }>)

        const totalValue = Object.values(categoryDistribution).reduce((sum, cat) => sum + cat.total, 0)
        const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899']

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
            { name: 'Cardiologia', value: 30, color: '#6366F1' },
            { name: 'Ortopedia', value: 25, color: '#10B981' },
            { name: 'Neurocirurgia', value: 20, color: '#F59E0B' },
            { name: 'Oftalmologia', value: 15, color: '#EF4444' },
            { name: 'Outros', value: 10, color: '#8B5CF6' },
          ],
        }
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (stats change less frequently)
  })
}
