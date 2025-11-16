import { supabase } from '@/lib/supabase/client'

export interface DashboardKPIs {
  todaySurgeries: number
  monthRevenue: number
  criticalStock: number
  accountsReceivable: number
  approvalRate: number
  totalProducts: number
}

export interface MonthlyRevenue {
  month: string
  revenue: number
  surgeries: number
}

export interface TopProduct {
  name: string
  quantity: number
  revenue: number
}

export interface SurgeryBySpecialty {
  specialty: string
  count: number
  percentage: number
}

export class DashboardService {
  /**
   * Get all KPIs for dashboard
   */
  static async getKPIs(): Promise<DashboardKPIs> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      // Today's surgeries
      const { count: todaySurgeries } = await supabase
        .from('surgeries')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_date', today)
        .lt('scheduled_date', new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0])

      // Month revenue
      const { data: invoices } = await supabase
        .from('invoices')
        .select('total_amount')
        .gte('issue_date', firstDayOfMonth)

      const monthRevenue = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0

      // Critical stock (products below min_stock)
      const { count: criticalStock } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .filter('stock_quantity', 'lt', 'min_stock')

      // Accounts receivable (pending)
      const { data: receivables } = await supabase
        .from('accounts_receivable')
        .select('amount')
        .eq('status', 'pending')

      const accountsReceivable = receivables?.reduce((sum, rec) => sum + (rec.amount || 0), 0) || 0

      // Approval rate (surgeries confirmed vs scheduled)
      const { count: totalSurgeries } = await supabase
        .from('surgeries')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_date', firstDayOfMonth)

      const { count: confirmedSurgeries } = await supabase
        .from('surgeries')
        .select('*', { count: 'exact', head: true })
        .gte('scheduled_date', firstDayOfMonth)
        .in('status', ['confirmed', 'completed'])

      const approvalRate = totalSurgeries ? (confirmedSurgeries || 0) / totalSurgeries * 100 : 0

      // Total products
      const { count: totalProducts } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')

      return {
        todaySurgeries: todaySurgeries || 0,
        monthRevenue,
        criticalStock: criticalStock || 0,
        accountsReceivable,
        approvalRate,
        totalProducts: totalProducts || 0,
      }
    } catch (error) {
      console.error('Error fetching KPIs:', error)
      throw error
    }
  }

  /**
   * Get monthly revenue for last 12 months
   */
  static async getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
    try {
      const twelveMonthsAgo = new Date()
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

      const { data: surgeries } = await supabase
        .from('surgeries')
        .select('scheduled_date, estimated_value')
        .gte('scheduled_date', twelveMonthsAgo.toISOString().split('T')[0])
        .eq('status', 'completed')

      // Group by month
      const monthlyData: { [key: string]: { revenue: number; count: number } } = {}

      surgeries?.forEach((surgery) => {
        const month = new Date(surgery.scheduled_date).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        if (!monthlyData[month]) {
          monthlyData[month] = { revenue: 0, count: 0 }
        }
        monthlyData[month].revenue += surgery.estimated_value || 0
        monthlyData[month].count += 1
      })

      return Object.entries(monthlyData).map(([month, data]) => ({
        month,
        revenue: data.revenue,
        surgeries: data.count,
      }))
    } catch (error) {
      console.error('Error fetching monthly revenue:', error)
      throw error
    }
  }

  /**
   * Get top 10 products by revenue
   */
  static async getTopProducts(): Promise<TopProduct[]> {
    try {
      const { data: products } = await supabase
        .from('products')
        .select('name, stock_quantity, sale_price')
        .eq('status', 'active')
        .order('stock_quantity', { ascending: false })
        .limit(10)

      return products?.map((product) => ({
        name: product.name,
        quantity: product.stock_quantity,
        revenue: product.stock_quantity * (product.sale_price || 0),
      })) || []
    } catch (error) {
      console.error('Error fetching top products:', error)
      throw error
    }
  }

  /**
   * Get surgeries by specialty
   */
  static async getSurgeryBySpecialty(): Promise<SurgeryBySpecialty[]> {
    try {
      const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

      const { data: surgeries } = await supabase
        .from('surgeries')
        .select('procedure_name')
        .gte('scheduled_date', firstDayOfMonth)

      // Extract specialty from procedure name (simplified logic)
      const specialtyCount: { [key: string]: number } = {}
      let total = 0

      surgeries?.forEach((surgery) => {
        const specialty = surgery.procedure_name.split(' ')[0] // First word as specialty
        specialtyCount[specialty] = (specialtyCount[specialty] || 0) + 1
        total += 1
      })

      return Object.entries(specialtyCount).map(([specialty, count]) => ({
        specialty,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }))
    } catch (error) {
      console.error('Error fetching surgeries by specialty:', error)
      throw error
    }
  }

  /**
   * Subscribe to realtime updates
   */
  static subscribe(onUpdate: () => void) {
    const channel = supabase
      .channel('dashboard_updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'surgeries' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, onUpdate)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invoices' }, onUpdate)
      .subscribe()

    return channel
  }

  /**
   * Unsubscribe from realtime updates
   */
  static unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel)
  }
}
