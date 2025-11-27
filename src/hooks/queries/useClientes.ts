/**
 * React Query hooks for Clientes CRUD operations
 * Connects to Supabase table: clientes (hospitais, clinicas, medicos)
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { queryKeys } from '@/lib/query/queryClient'
import { toast } from 'sonner'

// Types based on Supabase schema
export interface Cliente {
  id: string
  empresa_id: string
  tipo: 'hospital' | 'clinica' | 'medico'
  cnpj_cpf: string
  nome: string
  razao_social?: string | null
  contato?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: {
    logradouro?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  } | null
  limite_credito: number
  credito_disponivel: number
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface ClienteInput {
  tipo: 'hospital' | 'clinica' | 'medico'
  cnpj_cpf: string
  nome: string
  razao_social?: string | null
  contato?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: Record<string, string> | null
  limite_credito?: number
}

export interface ClienteFilters {
  tipo?: string
  ativo?: boolean
  search?: string
}

/**
 * Hook to fetch all clientes with filters
 */
export function useClientes(filters?: ClienteFilters) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.clientes.list(filters),
    queryFn: async (): Promise<Cliente[]> => {
      if (!isConfigured) {
        return getMockClientes()
      }

      let query = supabase
        .from('clientes')
        .select('*')
        .order('nome', { ascending: true })

      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo)
      }
      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,cnpj_cpf.ilike.%${filters.search}%,razao_social.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching clientes:', error)
        throw error
      }

      return data || []
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to fetch only hospitals
 */
export function useHospitais() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.clientes.hospitais(),
    queryFn: async (): Promise<Cliente[]> => {
      if (!isConfigured) {
        return getMockClientes().filter(c => c.tipo === 'hospital')
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('tipo', 'hospital')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) {
        console.error('Error fetching hospitais:', error)
        throw error
      }

      return data || []
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch only doctors
 */
export function useMedicos() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.clientes.medicos(),
    queryFn: async (): Promise<Cliente[]> => {
      if (!isConfigured) {
        return getMockClientes().filter(c => c.tipo === 'medico')
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('tipo', 'medico')
        .eq('ativo', true)
        .order('nome', { ascending: true })

      if (error) {
        console.error('Error fetching medicos:', error)
        throw error
      }

      return data || []
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single cliente by ID
 */
export function useCliente(id: string | undefined) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.clientes.detail(id || ''),
    queryFn: async (): Promise<Cliente | null> => {
      if (!id) return null

      if (!isConfigured) {
        const mock = getMockClientes().find(c => c.id === id)
        return mock || null
      }

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching cliente:', error)
        throw error
      }

      return data
    },
    enabled: !!id,
  })
}

/**
 * Hook to create a new cliente
 */
export function useCreateCliente() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ClienteInput): Promise<Cliente> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...input,
          limite_credito: input.limite_credito || 0,
          credito_disponivel: input.limite_credito || 0,
          ativo: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating cliente:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
      if (data.tipo === 'hospital') {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientes.hospitais() })
      } else if (data.tipo === 'medico') {
        queryClient.invalidateQueries({ queryKey: queryKeys.clientes.medicos() })
      }
      toast.success('Cliente criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar cliente: ${error.message}`)
    },
  })
}

/**
 * Hook to update a cliente
 */
export function useUpdateCliente() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ClienteInput> & { id: string }): Promise<Cliente> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('clientes')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating cliente:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.hospitais() })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.medicos() })
      toast.success('Cliente atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`)
    },
  })
}

/**
 * Hook to delete a cliente (soft delete)
 */
export function useDeleteCliente() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('clientes')
        .update({ ativo: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting cliente:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.hospitais() })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.medicos() })
      toast.success('Cliente desativado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao desativar cliente: ${error.message}`)
    },
  })
}

/**
 * Hook to update credit limit
 */
export function useAtualizarLimiteCredito() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, limite_credito }: { id: string; limite_credito: number }): Promise<Cliente> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      // Get current credit used
      const { data: current, error: fetchError } = await supabase
        .from('clientes')
        .select('limite_credito, credito_disponivel')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const creditoUsado = current.limite_credito - current.credito_disponivel
      const novoDisponivel = Math.max(0, limite_credito - creditoUsado)

      const { data, error } = await supabase
        .from('clientes')
        .update({
          limite_credito,
          credito_disponivel: novoDisponivel,
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating credit limit:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.clientes.detail(data.id) })
      toast.success('Limite de crédito atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar limite de crédito: ${error.message}`)
    },
  })
}

// Mock data for development/demo
function getMockClientes(): Cliente[] {
  return [
    {
      id: '1',
      empresa_id: 'demo',
      tipo: 'hospital',
      cnpj_cpf: '12.345.678/0001-90',
      nome: 'Hospital Santa Casa',
      razao_social: 'Santa Casa de Misericórdia de São Paulo',
      contato: 'João Silva',
      email: 'contato@santacasa.com.br',
      telefone: '(11) 3333-4444',
      endereco: {
        logradouro: 'Rua Santa Isabel',
        numero: '181',
        bairro: 'Santa Cecília',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01221-010',
      },
      limite_credito: 500000,
      credito_disponivel: 350000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '2',
      empresa_id: 'demo',
      tipo: 'hospital',
      cnpj_cpf: '23.456.789/0001-01',
      nome: 'Hospital Albert Einstein',
      razao_social: 'Sociedade Beneficente Israelita Brasileira Albert Einstein',
      contato: 'Maria Santos',
      email: 'compras@einstein.br',
      telefone: '(11) 2151-1233',
      endereco: {
        logradouro: 'Av. Albert Einstein',
        numero: '627',
        bairro: 'Morumbi',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '05652-900',
      },
      limite_credito: 1000000,
      credito_disponivel: 780000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '3',
      empresa_id: 'demo',
      tipo: 'hospital',
      cnpj_cpf: '34.567.890/0001-12',
      nome: 'Hospital Sírio-Libanês',
      razao_social: 'Hospital Sírio-Libanês',
      contato: 'Pedro Costa',
      email: 'suprimentos@hsl.org.br',
      telefone: '(11) 3155-0200',
      endereco: {
        logradouro: 'Rua Dona Adma Jafet',
        numero: '91',
        bairro: 'Bela Vista',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01308-050',
      },
      limite_credito: 800000,
      credito_disponivel: 650000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '4',
      empresa_id: 'demo',
      tipo: 'medico',
      cnpj_cpf: '123.456.789-00',
      nome: 'Dr. Carlos Silva',
      contato: 'Carlos Silva',
      email: 'dr.carlos@gmail.com',
      telefone: '(11) 99999-1111',
      limite_credito: 50000,
      credito_disponivel: 50000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '5',
      empresa_id: 'demo',
      tipo: 'medico',
      cnpj_cpf: '234.567.890-11',
      nome: 'Dra. Ana Santos',
      contato: 'Ana Santos',
      email: 'dra.ana@gmail.com',
      telefone: '(11) 99999-2222',
      limite_credito: 50000,
      credito_disponivel: 45000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '6',
      empresa_id: 'demo',
      tipo: 'medico',
      cnpj_cpf: '345.678.901-22',
      nome: 'Dr. Pedro Costa',
      contato: 'Pedro Costa',
      email: 'dr.pedro@gmail.com',
      telefone: '(11) 99999-3333',
      limite_credito: 50000,
      credito_disponivel: 50000,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
  ]
}

