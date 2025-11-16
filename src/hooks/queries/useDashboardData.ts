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

      // TODO: Fetch real statistics from Supabase when data model is ready
      return {
        revenueData: [],
        surgeriesData: [],
        productCategoryData: [],
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes (stats change less frequently)
  })
}
