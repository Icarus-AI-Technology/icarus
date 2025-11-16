import { useState, useEffect } from 'react'
import {
  FinancialService,
  type FinancialAccount,
  type FinancialAccountFilters,
  type BankAccount,
  type FinancialSummary,
  type MonthlyFinancialData,
} from '@/services/financial.service'

export function useFinancial(initialFilters?: FinancialAccountFilters) {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [summary, setSummary] = useState<FinancialSummary | null>(null)
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [filters, setFilters] = useState<FinancialAccountFilters | undefined>(initialFilters)

  const loadData = async (newFilters?: FinancialAccountFilters) => {
    try {
      setLoading(true)
      setError(null)

      const filtersToUse = newFilters || filters

      const [accountsData, banksData, summaryData, monthlyDataResult] = await Promise.all([
        FinancialService.listAccounts(filtersToUse),
        FinancialService.listBankAccounts(),
        FinancialService.getSummary(),
        FinancialService.getMonthlyData(12),
      ])

      setAccounts(accountsData)
      setBankAccounts(banksData)
      setSummary(summaryData)
      setMonthlyData(monthlyDataResult)
    } catch (err) {
      setError(err as Error)
      console.error('Error loading financial data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    // Subscribe to realtime updates
    const channel = FinancialService.subscribe(() => {
      loadData()
    })

    return () => {
      FinancialService.unsubscribe(channel)
    }
  }, [])

  return {
    accounts,
    bankAccounts,
    summary,
    monthlyData,
    loading,
    error,
    filters,
    setFilters: (newFilters: FinancialAccountFilters) => {
      setFilters(newFilters)
      loadData(newFilters)
    },
    reload: loadData,
    createAccount: FinancialService.createAccount,
    updateAccount: FinancialService.updateAccount,
    deleteAccount: FinancialService.deleteAccount,
    payAccount: FinancialService.payAccount,
  }
}
