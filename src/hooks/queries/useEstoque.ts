/**
 * React Query hooks for Estoque/Produtos CRUD operations
 * Connects to Supabase tables: produtos, movimentacoes_estoque, categorias
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { queryKeys } from '@/lib/query/queryClient'
import { toast } from 'sonner'

// Types based on Supabase schema
export interface Produto {
  id: string
  empresa_id: string
  codigo: string
  nome: string
  descricao?: string | null
  categoria_id?: string | null
  tipo: 'OPME' | 'Consignado' | 'Compra'
  registro_anvisa?: string | null
  fabricante_id?: string | null
  unidade_medida: string
  preco_custo: number
  preco_venda: number
  margem_lucro: number
  estoque_minimo: number
  estoque_atual: number
  ativo: boolean
  foto_url?: string | null
  metadados?: Record<string, unknown>
  criado_em: string
  atualizado_em: string
  // Joined data
  categoria?: { id: string; nome: string }
  fabricante?: { id: string; razao_social: string }
}

export interface ProdutoInput {
  codigo: string
  nome: string
  descricao?: string | null
  categoria_id?: string | null
  tipo: 'OPME' | 'Consignado' | 'Compra'
  registro_anvisa?: string | null
  fabricante_id?: string | null
  unidade_medida: string
  preco_custo?: number
  preco_venda?: number
  estoque_minimo?: number
  estoque_atual?: number
  foto_url?: string | null
}

export interface MovimentacaoEstoque {
  id: string
  empresa_id: string
  produto_id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
  quantidade: number
  valor_unitario: number
  valor_total: number
  lote?: string | null
  validade?: string | null
  origem?: string | null
  destino?: string | null
  referencia_id?: string | null
  observacoes?: string | null
  usuario_id: string
  criado_em: string
  produto?: { id: string; nome: string; codigo: string }
}

export interface ProdutoFilters {
  categoria_id?: string
  tipo?: string
  ativo?: boolean
  estoque_baixo?: boolean
  search?: string
}

/**
 * Hook to fetch all produtos with filters
 */
export function useProdutos(filters?: ProdutoFilters) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.estoque.list(filters),
    queryFn: async (): Promise<Produto[]> => {
      if (!isConfigured) {
        return getMockProdutos()
      }

      let query = supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias(id, nome),
          fabricante:fornecedores(id, razao_social)
        `)
        .order('nome', { ascending: true })

      // Apply filters
      if (filters?.categoria_id) {
        query = query.eq('categoria_id', filters.categoria_id)
      }
      if (filters?.tipo) {
        query = query.eq('tipo', filters.tipo)
      }
      if (filters?.ativo !== undefined) {
        query = query.eq('ativo', filters.ativo)
      }
      if (filters?.estoque_baixo) {
        query = query.lte('estoque_atual', supabase.rpc('get_estoque_minimo'))
      }
      if (filters?.search) {
        query = query.or(`nome.ilike.%${filters.search}%,codigo.ilike.%${filters.search}%,registro_anvisa.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching produtos:', error)
        throw error
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch produtos with low stock
 */
export function useProdutosEstoqueBaixo() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...queryKeys.estoque.all, 'estoque-baixo'],
    queryFn: async (): Promise<Produto[]> => {
      if (!isConfigured) {
        return getMockProdutos().filter(p => p.estoque_atual <= p.estoque_minimo)
      }

      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias(id, nome)
        `)
        .eq('ativo', true)
        .filter('estoque_atual', 'lte', supabase.rpc('get_estoque_minimo'))
        .order('estoque_atual', { ascending: true })

      if (error) {
        // Fallback: fetch all and filter client-side
        const { data: allProducts, error: allError } = await supabase
          .from('produtos')
          .select(`*, categoria:categorias(id, nome)`)
          .eq('ativo', true)

        if (allError) throw allError

        return (allProducts || []).filter(p => p.estoque_atual <= p.estoque_minimo)
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook to fetch a single produto by ID
 */
export function useProduto(id: string | undefined) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.estoque.detail(id || ''),
    queryFn: async (): Promise<Produto | null> => {
      if (!id) return null

      if (!isConfigured) {
        const mock = getMockProdutos().find(p => p.id === id)
        return mock || null
      }

      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categoria:categorias(id, nome),
          fabricante:fornecedores(id, razao_social)
        `)
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error fetching produto:', error)
        throw error
      }

      return data
    },
    enabled: !!id,
  })
}

/**
 * Hook to create a new produto
 */
export function useCreateProduto() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: ProdutoInput): Promise<Produto> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('produtos')
        .insert({
          ...input,
          preco_custo: input.preco_custo || 0,
          preco_venda: input.preco_venda || 0,
          estoque_minimo: input.estoque_minimo || 0,
          estoque_atual: input.estoque_atual || 0,
          ativo: true,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating produto:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.estoque.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Produto criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar produto: ${error.message}`)
    },
  })
}

/**
 * Hook to update a produto
 */
export function useUpdateProduto() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<ProdutoInput> & { id: string }): Promise<Produto> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('produtos')
        .update(input)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error updating produto:', error)
        throw error
      }

      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.estoque.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.estoque.detail(data.id) })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Produto atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`)
    },
  })
}

/**
 * Hook to delete a produto (soft delete)
 */
export function useDeleteProduto() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      // Soft delete - just set ativo to false
      const { error } = await supabase
        .from('produtos')
        .update({ ativo: false })
        .eq('id', id)

      if (error) {
        console.error('Error deleting produto:', error)
        throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.estoque.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Produto desativado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao desativar produto: ${error.message}`)
    },
  })
}

/**
 * Hook to register stock movement
 */
export function useRegistrarMovimentacao() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      produto_id: string
      tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
      quantidade: number
      valor_unitario: number
      lote?: string
      validade?: string
      origem?: string
      destino?: string
      observacoes?: string
    }): Promise<MovimentacaoEstoque> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('movimentacoes_estoque')
        .insert({
          ...input,
          valor_total: input.quantidade * input.valor_unitario,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating movimentacao:', error)
        throw error
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.estoque.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Movimentação registrada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao registrar movimentação: ${error.message}`)
    },
  })
}

/**
 * Hook to fetch estoque statistics
 */
export function useEstoqueStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: queryKeys.estoque.stats(),
    queryFn: async () => {
      if (!isConfigured) {
        return {
          totalProdutos: 150,
          produtosAtivos: 142,
          estoqueBaixo: 8,
          valorTotal: 450000,
          entradasMes: 45,
          saidasMes: 38,
        }
      }

      // Get product counts
      const { data: produtos, error: prodError } = await supabase
        .from('produtos')
        .select('id, ativo, estoque_atual, estoque_minimo, preco_custo')

      if (prodError) throw prodError

      const ativos = produtos?.filter(p => p.ativo) || []
      const estoqueBaixo = ativos.filter(p => p.estoque_atual <= p.estoque_minimo)
      const valorTotal = ativos.reduce((sum, p) => sum + (p.estoque_atual * p.preco_custo), 0)

      // Get movements this month
      const startOfMonth = new Date(new Date().setDate(1)).toISOString()
      
      const { data: movimentos, error: movError } = await supabase
        .from('movimentacoes_estoque')
        .select('tipo')
        .gte('criado_em', startOfMonth)

      if (movError) throw movError

      const entradas = movimentos?.filter(m => m.tipo === 'entrada').length || 0
      const saidas = movimentos?.filter(m => m.tipo === 'saida').length || 0

      return {
        totalProdutos: produtos?.length || 0,
        produtosAtivos: ativos.length,
        estoqueBaixo: estoqueBaixo.length,
        valorTotal,
        entradasMes: entradas,
        saidasMes: saidas,
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

// Mock data for development/demo
function getMockProdutos(): Produto[] {
  return [
    {
      id: '1',
      empresa_id: 'demo',
      codigo: 'OPME-001',
      nome: 'Prótese de Quadril Cimentada',
      descricao: 'Prótese de quadril para artroplastia total',
      categoria_id: '1',
      tipo: 'OPME',
      registro_anvisa: '10123456789',
      unidade_medida: 'UN',
      preco_custo: 4500,
      preco_venda: 6500,
      margem_lucro: 44.44,
      estoque_minimo: 5,
      estoque_atual: 12,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      categoria: { id: '1', nome: 'Ortopedia' },
    },
    {
      id: '2',
      empresa_id: 'demo',
      codigo: 'OPME-002',
      nome: 'Stent Coronário Farmacológico',
      descricao: 'Stent para angioplastia coronária',
      categoria_id: '2',
      tipo: 'OPME',
      registro_anvisa: '10987654321',
      unidade_medida: 'UN',
      preco_custo: 8000,
      preco_venda: 12000,
      margem_lucro: 50,
      estoque_minimo: 10,
      estoque_atual: 3, // Low stock
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      categoria: { id: '2', nome: 'Cardiologia' },
    },
    {
      id: '3',
      empresa_id: 'demo',
      codigo: 'OPME-003',
      nome: 'Lente Intraocular Multifocal',
      descricao: 'Lente para cirurgia de catarata',
      categoria_id: '3',
      tipo: 'OPME',
      registro_anvisa: '10555666777',
      unidade_medida: 'UN',
      preco_custo: 2200,
      preco_venda: 3500,
      margem_lucro: 59.09,
      estoque_minimo: 8,
      estoque_atual: 25,
      ativo: true,
      criado_em: new Date().toISOString(),
      atualizado_em: new Date().toISOString(),
      categoria: { id: '3', nome: 'Oftalmologia' },
    },
  ]
}

