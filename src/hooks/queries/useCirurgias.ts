/**
 * React Query hooks for Cirurgias CRUD operations
 * Connects to Supabase tables: cirurgias, cirurgias_produtos, clientes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { queryKeys } from '@/lib/query/queryClient'
import { toast } from 'sonner'

// Types based on Supabase schema
export interface Cirurgia {
  id: string
  empresa_id: string
  numero: string
  paciente_nome: string
  paciente_cpf?: string | null
  hospital_id: string
  medico_id: string
  tipo_cirurgia: string
  data_cirurgia: string
  status: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
  valor_total: number
  observacoes?: string | null
  metadados?: Record<string, unknown>
  criado_em: string
  atualizado_em: string
  // Joined data
  hospital?: { id: string; nome: string }
  medico?: { id: string; nome: string }
}

export interface CirurgiaInput {
  numero: string
  paciente_nome: string
  paciente_cpf?: string | null
  hospital_id: string
  medico_id: string
  tipo_cirurgia: string
  data_cirurgia: string
  status?: 'agendada' | 'confirmada' | 'realizada' | 'cancelada'
  valor_total?: number
  observacoes?: string | null
}

export interface CirurgiaFilters {
  status?: string
  hospital_id?: string
  medico_id?: string
  data_inicio?: string
  data_fim?: string
  search?: string
}

/**
 * Hook to fetch all cirurgias with filters
 */
export function useCirurgias(filters?: CirurgiaFilters) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.cirurgias.list(filters),
    queryFn: async (): Promise<Cirurgia[]> => {
      if (!isConfigured) {
        // Return mock data when Supabase is not configured
        return getMockCirurgias()
      }

      let query = supabase
        .from('cirurgias')
        .select(`
          *,
          hospital:clientes!hospital_id(id, nome),
          medico:clientes!medico_id(id, nome)
        `)
        .order('data_cirurgia', { ascending: false })

      // Apply filters
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.hospital_id) {
        query = query.eq('hospital_id', filters.hospital_id)
      }
      if (filters?.medico_id) {
        query = query.eq('medico_id', filters.medico_id)
      }
      if (filters?.data_inicio) {
        query = query.gte('data_cirurgia', filters.data_inicio)
      }
      if (filters?.data_fim) {
        query = query.lte('data_cirurgia', filters.data_fim)
      }
      if (filters?.search) {
        query = query.or(`numero.ilike.%${filters.search}%,paciente_nome.ilike.%${filters.search}%,tipo_cirurgia.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching cirurgias:', error)
        throw error
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook to fetch a single cirurgia by ID
 */
export function useCirurgia(id: string | undefined) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.cirurgias.detail(id || ''),
    queryFn: async (): Promise<Cirurgia | null> => {
      if (!id) return null

      if (!isConfigured) {
        const mock = getMockCirurgias().find(c => c.id === id)
        return mock || null
      }

      const { data, error } = await supabase
        .from('cirurgias')
        .select(`
          *,
          hospital:clientes!hospital_id(id, nome),
          medico:clientes!medico_id(id, nome)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching cirurgia:', error)
        throw error
      }

      return data
    },
    enabled: !!id,
  })
}

/**
 * Hook to create a new cirurgia
 */
export function useCreateCirurgia() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CirurgiaInput): Promise<Cirurgia> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('cirurgias')
        .insert({
          ...input,
          status: input.status || 'agendada',
          valor_total: input.valor_total || 0,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating cirurgia:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cirurgias.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Cirurgia criada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar cirurgia: ${error.message}`)
    },
  })
}

/**
 * Hook to update a cirurgia
 */
export function useUpdateCirurgia() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<CirurgiaInput> & { id: string }): Promise<Cirurgia> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('cirurgias')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating cirurgia:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cirurgias.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.cirurgias.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Cirurgia atualizada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cirurgia: ${error.message}`)
    },
  })
}

/**
 * Hook to delete a cirurgia
 */
export function useDeleteCirurgia() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('cirurgias')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting cirurgia:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.cirurgias.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Cirurgia excluída com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao excluir cirurgia: ${error.message}`)
    },
  })
}

/**
 * Hook to fetch cirurgias statistics
 */
export function useCirurgiasStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.cirurgias.stats(),
    queryFn: async () => {
      if (!isConfigured) {
        return {
          total: 15,
          agendadas: 5,
          confirmadas: 3,
          realizadas: 6,
          canceladas: 1,
          valorTotal: 125000,
          mediaValor: 8333.33,
        }
      }

      const today = new Date().toISOString().split('T')[0]
      const startOfMonth = new Date(new Date().setDate(1)).toISOString().split('T')[0]

      // Get counts by status
      const { data: statusCounts, error: statusError } = await supabase
        .from('cirurgias')
        .select('status')
        .gte('data_cirurgia', startOfMonth)

      if (statusError) throw statusError

      const counts = (statusCounts || []).reduce((acc, { status }) => {
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      // Get total value
      const { data: valueData, error: valueError } = await supabase
        .from('cirurgias')
        .select('valor_total')
        .gte('data_cirurgia', startOfMonth)
        .eq('status', 'realizada')

      if (valueError) throw valueError

      const valorTotal = (valueData || []).reduce((sum, { valor_total }) => sum + (valor_total || 0), 0)
      const realizadas = counts['realizada'] || 0

      return {
        total: statusCounts?.length || 0,
        agendadas: counts['agendada'] || 0,
        confirmadas: counts['confirmada'] || 0,
        realizadas,
        canceladas: counts['cancelada'] || 0,
        valorTotal,
        mediaValor: realizadas > 0 ? valorTotal / realizadas : 0,
        hoje: await getCirurgiasHoje(supabase, today),
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Helper function to get today's surgeries count
async function getCirurgiasHoje(supabase: ReturnType<typeof useSupabase>['supabase'], today: string) {
  const { count } = await supabase
    .from('cirurgias')
    .select('*', { count: 'exact', head: true })
    .eq('data_cirurgia', today)
  
  return count || 0
}

// Mock data for development/demo
function getMockCirurgias(): Cirurgia[] {
  const today = new Date().toISOString().split('T')[0]
  
  return [
    {
      id: '1',
      empresa_id: 'demo',
      numero: 'CIR-2025-001',
      paciente_nome: 'J.S.',
      hospital_id: '1',
      medico_id: '1',
      tipo_cirurgia: 'Angioplastia Coronária',
      data_cirurgia: today,
      status: 'agendada',
      valor_total: 15000,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      hospital: { id: '1', nome: 'Hospital Santa Casa' },
      medico: { id: '1', nome: 'Dr. Carlos Silva' },
    },
    {
      id: '2',
      empresa_id: 'demo',
      numero: 'CIR-2025-002',
      paciente_nome: 'M.O.',
      hospital_id: '2',
      medico_id: '2',
      tipo_cirurgia: 'Artroplastia de Quadril',
      data_cirurgia: today,
      status: 'confirmada',
      valor_total: 22000,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      hospital: { id: '2', nome: 'Hospital Albert Einstein' },
      medico: { id: '2', nome: 'Dr. Ana Santos' },
    },
    {
      id: '3',
      empresa_id: 'demo',
      numero: 'CIR-2025-003',
      paciente_nome: 'P.R.',
      hospital_id: '3',
      medico_id: '3',
      tipo_cirurgia: 'Craniotomia',
      data_cirurgia: new Date(Date.now() - 86400000).toISOString().split('T')[0],
      status: 'realizada',
      valor_total: 35000,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      hospital: { id: '3', nome: 'Hospital Sírio-Libanês' },
      medico: { id: '3', nome: 'Dr. Pedro Costa' },
    },
  ]
}

