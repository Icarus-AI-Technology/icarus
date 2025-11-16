import { supabase } from '@/lib/supabase/client'
import type {
  FinancialAccount,
  FinancialAccountFormData,
  FinancialAccountFilters,
  BankAccount,
  CashFlowEntry,
  FinancialSummary,
  MonthlyFinancialData,
  DREData,
  PaymentData,
} from '@/types/financial.types'

export class FinancialService {
  // ==================== FINANCIAL ACCOUNTS ====================

  static async listAccounts(filters?: FinancialAccountFilters): Promise<FinancialAccount[]> {
    let query = supabase
      .from('financial_accounts')
      .select('*')
      .order('due_date', { ascending: false })

    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.startDate) {
      query = query.gte('due_date', filters.startDate)
    }
    if (filters?.endDate) {
      query = query.lte('due_date', filters.endDate)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }

  static async createAccount(data: FinancialAccountFormData): Promise<FinancialAccount> {
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return account
  }

  static async updateAccount(
    id: string,
    data: Partial<FinancialAccountFormData>
  ): Promise<FinancialAccount> {
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return account
  }

  static async deleteAccount(id: string): Promise<void> {
    const { error } = await supabase.from('financial_accounts').delete().eq('id', id)

    if (error) throw error
  }

  static async payAccount(paymentData: PaymentData): Promise<FinancialAccount> {
    const { data: account, error } = await supabase
      .from('financial_accounts')
      .update({
        paid_amount: paymentData.amount,
        payment_date: paymentData.payment_date,
        payment_method: paymentData.payment_method,
        bank_account_id: paymentData.bank_account_id,
        status: 'paid',
        notes: paymentData.notes,
      })
      .eq('id', paymentData.financial_account_id)
      .select()
      .single()

    if (error) throw error
    return account
  }

  // ==================== BANK ACCOUNTS ====================

  static async listBankAccounts(): Promise<BankAccount[]> {
    const { data, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('status', 'active')
      .order('is_main', { ascending: false })

    if (error) throw error
    return data || []
  }

  // ==================== SUMMARY & KPIs ====================

  static async getSummary(): Promise<FinancialSummary> {
    const { data: receivables } = await supabase
      .from('financial_accounts')
      .select('final_amount, status')
      .eq('type', 'receivable')

    const { data: payables } = await supabase
      .from('financial_accounts')
      .select('final_amount, status')
      .eq('type', 'payable')

    const { data: cashFlow } = await supabase
      .from('cash_flow_entries')
      .select('amount, type')

    const { data: banks } = await supabase
      .from('bank_accounts')
      .select('current_balance')
      .eq('status', 'active')

    return {
      receivables: {
        total: receivables?.reduce((sum, r) => sum + r.final_amount, 0) || 0,
        pending:
          receivables
            ?.filter((r) => r.status === 'pending')
            .reduce((sum, r) => sum + r.final_amount, 0) || 0,
        overdue:
          receivables
            ?.filter((r) => r.status === 'overdue')
            .reduce((sum, r) => sum + r.final_amount, 0) || 0,
        paid:
          receivables
            ?.filter((r) => r.status === 'paid')
            .reduce((sum, r) => sum + r.final_amount, 0) || 0,
      },
      payables: {
        total: payables?.reduce((sum, p) => sum + p.final_amount, 0) || 0,
        pending:
          payables
            ?.filter((p) => p.status === 'pending')
            .reduce((sum, p) => sum + p.final_amount, 0) || 0,
        overdue:
          payables
            ?.filter((p) => p.status === 'overdue')
            .reduce((sum, p) => sum + p.final_amount, 0) || 0,
        paid:
          payables
            ?.filter((p) => p.status === 'paid')
            .reduce((sum, p) => sum + p.final_amount, 0) || 0,
      },
      cashFlow: {
        totalIncome:
          cashFlow?.filter((c) => c.type === 'income').reduce((sum, c) => sum + c.amount, 0) || 0,
        totalExpense:
          cashFlow?.filter((c) => c.type === 'expense').reduce((sum, c) => sum + c.amount, 0) || 0,
        netFlow: cashFlow?.reduce((sum, c) => sum + (c.type === 'income' ? c.amount : -c.amount), 0) || 0,
      },
      bankAccounts: {
        totalBalance: banks?.reduce((sum, b) => sum + b.current_balance, 0) || 0,
        accountCount: banks?.length || 0,
      },
    }
  }

  static async getMonthlyData(months: number = 12): Promise<MonthlyFinancialData[]> {
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const { data: accounts } = await supabase
      .from('financial_accounts')
      .select('*')
      .gte('due_date', startDate.toISOString().split('T')[0])

    const monthlyMap = new Map<string, MonthlyFinancialData>()

    accounts?.forEach((account) => {
      const month = new Date(account.due_date).toLocaleDateString('pt-BR', {
        month: 'short',
        year: '2-digit',
      })

      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, {
          month,
          income: 0,
          expense: 0,
          netFlow: 0,
          receivables: 0,
          payables: 0,
        })
      }

      const data = monthlyMap.get(month)!

      if (account.type === 'receivable') {
        data.receivables += account.final_amount
        if (account.status === 'paid') {
          data.income += account.final_amount
        }
      } else {
        data.payables += account.final_amount
        if (account.status === 'paid') {
          data.expense += account.final_amount
        }
      }

      data.netFlow = data.income - data.expense
    })

    return Array.from(monthlyMap.values())
  }

  // ==================== REALTIME ====================

  static subscribe(onUpdate: () => void) {
    const channel = supabase
      .channel('financial_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'financial_accounts' },
        onUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bank_accounts' },
        onUpdate
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cash_flow_entries' },
        onUpdate
      )
      .subscribe()

    return channel
  }

  static unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel)
  }
}
