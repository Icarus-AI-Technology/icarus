/**
 * React Query hooks for Financeiro CRUD operations
 * Connects to Supabase tables: contas_receber, contas_pagar, clientes, fornecedores
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { queryKeys } from '@/lib/query/queryClient'
import { toast } from 'sonner'

// Types based on Supabase schema
export interface ContaReceber {
  id: string
  empresa_id: string
  numero: string
  cliente_id: string
  cirurgia_id?: string | null
  valor: number
  valor_pago: number
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  forma_pagamento?: string | null
  observacoes?: string | null
  criado_em: string
  atualizado_em: string
  // Joined data
  cliente?: { id: string; nome: string }
  cirurgia?: { id: string; numero: string }
}

export interface ContaPagar {
  id: string
  empresa_id: string
  numero: string
  fornecedor_id: string
  valor: number
  valor_pago: number
  data_emissao: string
  data_vencimento: string
  data_pagamento?: string | null
  status: 'pendente' | 'pago' | 'vencido' | 'cancelado'
  forma_pagamento?: string | null
  categoria?: string | null
  observacoes?: string | null
  criado_em: string
  atualizado_em: string
  // Joined data
  fornecedor?: { id: string; razao_social: string }
}

export interface ContaReceberInput {
  numero: string
  cliente_id: string
  cirurgia_id?: string | null
  valor: number
  data_emissao: string
  data_vencimento: string
  forma_pagamento?: string | null
  observacoes?: string | null
}

export interface ContaReceberFilters {
  status?: string
  cliente_id?: string
  data_inicio?: string
  data_fim?: string
  vencidas?: boolean
  search?: string
}

/**
 * Hook to fetch all contas a receber with filters
 */
export function useContasReceber(filters?: ContaReceberFilters) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.contasReceber.list(filters),
    queryFn: async (): Promise<ContaReceber[]> => {
      if (!isConfigured) {
        return getMockContasReceber()
      }

      let query = supabase
        .from('contas_receber')
        .select(`
          *,
          cliente:clientes(id, nome),
          cirurgia:cirurgias(id, numero)
        `)
        .order('data_vencimento', { ascending: true })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id)
      }
      if (filters?.data_inicio) {
        query = query.gte('data_vencimento', filters.data_inicio)
      }
      if (filters?.data_fim) {
        query = query.lte('data_vencimento', filters.data_fim)
      }
      if (filters?.vencidas) {
        const today = new Date().toISOString().split('T')[0]
        query = query.lt('data_vencimento', today).eq('status', 'pendente')
      }
      if (filters?.search) {
        query = query.or(`numero.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching contas a receber:', error)
        throw error
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch overdue accounts
 */
export function useContasVencidas() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...queryKeys.contasReceber.all, 'vencidas'],
    queryFn: async (): Promise<ContaReceber[]> => {
      if (!isConfigured) {
        const today = new Date().toISOString().split('T')[0]
        return getMockContasReceber().filter(c => c.data_vencimento < today && c.status === 'pendente')
      }

      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('contas_receber')
        .select(`
          *,
          cliente:clientes(id, nome)
        `)
        .lt('data_vencimento', today)
        .eq('status', 'pendente')
        .order('data_vencimento', { ascending: true })

      if (error) {
        console.error('Error fetching contas vencidas:', error)
        throw error
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to create a new conta a receber
 */
export function useCreateContaReceber() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ContaReceberInput): Promise<ContaReceber> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('contas_receber')
        .insert({
          ...input,
          valor_pago: 0,
          status: 'pendente',
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating conta a receber:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contasReceber.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Conta a receber criada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar conta a receber: ${error.message}`)
    },
  })
}

/**
 * Hook to register payment
 */
export function useRegistrarPagamento() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      valor_pago, 
      forma_pagamento 
    }: { 
      id: string
      valor_pago: number
      forma_pagamento?: string 
    }): Promise<ContaReceber> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      // Get current account
      const { data: conta, error: fetchError } = await supabase
        .from('contas_receber')
        .select('valor, valor_pago')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const novoValorPago = conta.valor_pago + valor_pago
      const novoStatus = novoValorPago >= conta.valor ? 'pago' : 'pendente'

      const { data, error } = await supabase
        .from('contas_receber')
        .update({
          valor_pago: novoValorPago,
          status: novoStatus,
          forma_pagamento,
          data_pagamento: novoStatus === 'pago' ? new Date().toISOString().split('T')[0] : null,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error registering payment:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contasReceber.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Pagamento registrado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao registrar pagamento: ${error.message}`)
    },
  })
}

/**
 * Hook to cancel account
 */
export function useCancelarConta() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('contas_receber')
        .update({ status: 'cancelado' })
        .eq('id', id)

      if (error) {
        console.error('Error canceling account:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contasReceber.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Conta cancelada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao cancelar conta: ${error.message}`)
    },
  })
}

/**
 * Hook to fetch financial statistics
 */
export function useFinanceiroStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.contasReceber.stats(),
    queryFn: async () => {
      if (!isConfigured) {
        return {
          totalReceber: 125000,
          totalPago: 85000,
          totalVencido: 15000,
          totalPendente: 25000,
          receitaMes: 45000,
          inadimplencia: 12,
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]

      // Get all accounts
      const { data: contas, error } = await supabase
        .from('contas_receber')
        .select('valor, valor_pago, status, data_vencimento, data_pagamento')

      if (error) throw error

      const totalReceber = (contas || []).reduce((sum, c) => sum + c.valor, 0)
      const totalPago = (contas || []).reduce((sum, c) => sum + c.valor_pago, 0)
      
      const vencidas = (contas || []).filter(c => 
        c.status === 'pendente' && c.data_vencimento < today
      )
      const totalVencido = vencidas.reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)
      
      const pendentes = (contas || []).filter(c => c.status === 'pendente')
      const totalPendente = pendentes.reduce((sum, c) => sum + (c.valor - c.valor_pago), 0)

      // Revenue this month
      const pagosMes = (contas || []).filter(c => 
        c.status === 'pago' && c.data_pagamento && c.data_pagamento >= startOfMonth
      )
      const receitaMes = pagosMes.reduce((sum, c) => sum + c.valor_pago, 0)

      // Inadimplência rate
      const inadimplencia = totalReceber > 0 ? (totalVencido / totalReceber) * 100 : 0

      return {
        totalReceber,
        totalPago,
        totalVencido,
        totalPendente,
        receitaMes,
        inadimplencia: Math.round(inadimplencia * 100) / 100,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch cash flow data
 */
export function useFluxoCaixa(periodo: 'semana' | 'mes' | 'trimestre' = 'mes') {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...queryKeys.contasReceber.all, 'fluxo-caixa', periodo],
    queryFn: async () => {
      if (!isConfigured) {
        return getMockFluxoCaixa()
      }

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()
      
      switch (periodo) {
        case 'semana':
          startDate.setDate(startDate.getDate() - 7)
          break
        case 'mes':
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 'trimestre':
          startDate.setMonth(startDate.getMonth() - 3)
          break
      }

      // Get receivables
      const { data: recebimentos, error: recError } = await supabase
        .from('contas_receber')
        .select('valor_pago, data_pagamento')
        .gte('data_pagamento', startDate.toISOString())
        .lte('data_pagamento', endDate.toISOString())
        .eq('status', 'pago')

      if (recError) throw recError

      // Get payables
      const { data: pagamentos, error: pagError } = await supabase
        .from('contas_pagar')
        .select('valor_pago, data_pagamento')
        .gte('data_pagamento', startDate.toISOString())
        .lte('data_pagamento', endDate.toISOString())
        .eq('status', 'pago')

      if (pagError) throw pagError

      // Group by date
      const fluxo: Record<string, { entradas: number; saidas: number }> = {}

      ;(recebimentos || []).forEach(r => {
        const date = r.data_pagamento?.split('T')[0] || ''
        if (!fluxo[date]) fluxo[date] = { entradas: 0, saidas: 0 }
        fluxo[date].entradas += r.valor_pago
      })

      ;(pagamentos || []).forEach(p => {
        const date = p.data_pagamento?.split('T')[0] || ''
        if (!fluxo[date]) fluxo[date] = { entradas: 0, saidas: 0 }
        fluxo[date].saidas += p.valor_pago
      })

      return Object.entries(fluxo)
        .map(([data, valores]) => ({
          data,
          entradas: valores.entradas,
          saidas: valores.saidas,
          saldo: valores.entradas - valores.saidas,
        }))
        .sort((a, b) => a.data.localeCompare(b.data))
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Mock data for development/demo
function getMockContasReceber(): ContaReceber[] {
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  
  return [
    {
      id: '1',
      empresa_id: 'demo',
      numero: 'CR-2025-001',
      cliente_id: '1',
      cirurgia_id: '1',
      valor: 15000,
      valor_pago: 0,
      data_emissao: formatDate(new Date(today.getTime() - 7 * 86400000)),
      data_vencimento: formatDate(new Date(today.getTime() + 23 * 86400000)),
      status: 'pendente',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      cliente: { id: '1', nome: 'Hospital Santa Casa' },
      cirurgia: { id: '1', numero: 'CIR-2025-001' },
    },
    {
      id: '2',
      empresa_id: 'demo',
      numero: 'CR-2025-002',
      cliente_id: '2',
      cirurgia_id: '2',
      valor: 22000,
      valor_pago: 22000,
      data_emissao: formatDate(new Date(today.getTime() - 30 * 86400000)),
      data_vencimento: formatDate(new Date(today.getTime() - 5 * 86400000)),
      data_pagamento: formatDate(new Date(today.getTime() - 3 * 86400000)),
      status: 'pago',
      forma_pagamento: 'Transferência',
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      cliente: { id: '2', nome: 'Hospital Albert Einstein' },
      cirurgia: { id: '2', numero: 'CIR-2025-002' },
    },
    {
      id: '3',
      empresa_id: 'demo',
      numero: 'CR-2025-003',
      cliente_id: '3',
      valor: 8500,
      valor_pago: 0,
      data_emissao: formatDate(new Date(today.getTime() - 45 * 86400000)),
      data_vencimento: formatDate(new Date(today.getTime() - 15 * 86400000)),
      status: 'pendente', // Overdue
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      cliente: { id: '3', nome: 'Hospital Sírio-Libanês' },
    },
  ]
}

function getMockFluxoCaixa() {
  const today = new Date()
  const data = []
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 86400000)
    data.push({
      data: date.toISOString().split('T')[0],
      entradas: Math.floor(Math.random() * 20000) + 5000,
      saidas: Math.floor(Math.random() * 15000) + 3000,
      saldo: 0,
    })
  }
  
  data.forEach(d => {
    d.saldo = d.entradas - d.saidas
  })
  
  return data
}

