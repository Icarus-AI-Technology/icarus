import { useState, useEffect } from 'react'
import {
  DashboardService,
  type DashboardKPIs,
  type MonthlyRevenue,
  type TopProduct,
  type SurgeryBySpecialty,
} from '@/services/dashboard.service'

export function useDashboard() {
  const [kpis, setKPIs] = useState<DashboardKPIs | null>(null)
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [surgeryBySpecialty, setSurgeryBySpecialty] = useState<SurgeryBySpecialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [kpisData, revenueData, productsData, specialtyData] = await Promise.all([
        DashboardService.getKPIs(),
        DashboardService.getMonthlyRevenue(),
        DashboardService.getTopProducts(),
        DashboardService.getSurgeryBySpecialty(),
      ])

      setKPIs(kpisData)
      setMonthlyRevenue(revenueData)
      setTopProducts(productsData)
      setSurgeryBySpecialty(specialtyData)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to realtime updates
    const channel = DashboardService.subscribe(() => {
      loadData()
    })

    return () => {
      DashboardService.unsubscribe(channel)
    }
  }, [])

  return {
    kpis,
    monthlyRevenue,
    topProducts,
    surgeryBySpecialty,
    loading,
    error,
    reload: loadData,
  }
}
