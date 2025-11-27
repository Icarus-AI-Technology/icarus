/**
 * React Query hooks for Compras (Purchases) CRUD operations
 * Connects to Supabase tables: fornecedores, pedidos_compra
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const comprasKeys = {
  all: ['compras'] as const,
  fornecedores: () => [...comprasKeys.all, 'fornecedores'] as const,
  fornecedor: (id: string) => [...comprasKeys.fornecedores(), id] as const,
  pedidos: (filters?: Record<string, unknown>) => [...comprasKeys.all, 'pedidos', filters] as const,
  pedido: (id: string) => [...comprasKeys.all, 'pedido', id] as const,
  stats: () => [...comprasKeys.all, 'stats'] as const,
}

// Types
export interface Fornecedor {
  id: string
  empresa_id: string
  cnpj: string
  razao_social: string
  nome_fantasia?: string | null
  contato?: string | null
  email?: string | null
  telefone?: string | null
  endereco?: Record<string, string> | null
  ativo: boolean
  criado_em: string
  atualizado_em: string
}

export interface PedidoCompra {
  id: string
  empresa_id: string
  numero: string
  fornecedor_id: string
  data_pedido: string
  data_entrega_prevista?: string | null
  data_entrega?: string | null
  valor_total: number
  status: 'rascunho' | 'enviado' | 'confirmado' | 'recebido' | 'cancelado'
  observacoes?: string | null
  criado_em: string
  atualizado_em: string
  // Joined
  fornecedor?: { id: string; razao_social: string }
}

/**
 * Hook to fetch all fornecedores
 */
export function useFornecedores() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: comprasKeys.fornecedores(),
    queryFn: async (): Promise<Fornecedor[]> => {
      if (!isConfigured) {
        return getMockFornecedores()
      }

      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('ativo', true)
        .order('razao_social', { ascending: true })

      if (error) {
        console.error('Error fetching fornecedores:', error)
        throw error
      }

      return data || []
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook to fetch compras statistics
 */
export function useComprasStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: comprasKeys.stats(),
    queryFn: async () => {
      if (!isConfigured) {
        return {
          totalPedidos: 45,
          pedidosPendentes: 8,
          valorMensal: 250000,
          fornecedoresAtivos: 12,
          prazoMedioEntrega: 7,
        }
      }

      const startOfMonth = new Date(new Date().setDate(1)).toISOString()

      // Get orders this month
      const { data: pedidos, error } = await supabase
        .from('pedidos_compra')
        .select('status, valor_total, data_entrega_prevista, data_entrega')
        .gte('criado_em', startOfMonth)

      if (error) throw error

      const total = pedidos?.length || 0
      const pendentes = pedidos?.filter(p => ['rascunho', 'enviado', 'confirmado'].includes(p.status)).length || 0
      const valorMensal = pedidos?.reduce((sum, p) => sum + (p.valor_total || 0), 0) || 0

      // Get active suppliers count
      const { count: fornecedoresCount } = await supabase
        .from('fornecedores')
        .select('*', { count: 'exact', head: true })
        .eq('ativo', true)

      return {
        totalPedidos: total,
        pedidosPendentes: pendentes,
        valorMensal,
        fornecedoresAtivos: fornecedoresCount || 0,
        prazoMedioEntrega: 7, // TODO: Calculate from actual data
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook to create a new fornecedor
 */
export function useCreateFornecedor() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: Omit<Fornecedor, 'id' | 'empresa_id' | 'criado_em' | 'atualizado_em'>): Promise<Fornecedor> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('fornecedores')
        .insert(input)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: comprasKeys.fornecedores() })
      toast.success('Fornecedor criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar fornecedor: ${error.message}`)
    },
  })
}

// Mock data
function getMockFornecedores(): Fornecedor[] {
  return [
    {
      id: '1',
      empresa_id: 'demo',
      cnpj: '12.345.678/0001-90',
      razao_social: 'Smith & Nephew Brasil Ltda',
      nome_fantasia: 'Smith & Nephew',
      contato: 'João Silva',
      email: 'vendas@smithnephew.com.br',
      telefone: '(11) 4444-5555',
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '2',
      empresa_id: 'demo',
      cnpj: '23.456.789/0001-01',
      razao_social: 'Medtronic Comercial Ltda',
      nome_fantasia: 'Medtronic',
      contato: 'Maria Santos',
      email: 'compras@medtronic.com.br',
      telefone: '(11) 5555-6666',
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
    {
      id: '3',
      empresa_id: 'demo',
      cnpj: '34.567.890/0001-12',
      razao_social: 'Stryker do Brasil Ltda',
      nome_fantasia: 'Stryker',
      contato: 'Pedro Costa',
      email: 'vendas@stryker.com.br',
      telefone: '(11) 6666-7777',
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
    },
  ]
}

