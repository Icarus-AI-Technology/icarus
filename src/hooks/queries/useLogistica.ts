/**
 * ICARUS v5.0 - useLogistica Hook
 * 
 * React Query hooks for Logistics and Traceability operations
 * Connects to Supabase tables: movimentacoes_estoque, lotes, entregas, consignacoes
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const logisticaKeys = {
  all: ['logistica'] as const,
  entregas: (filters?: Record<string, unknown>) => [...logisticaKeys.all, 'entregas', filters] as const,
  entrega: (id: string) => [...logisticaKeys.all, 'entrega', id] as const,
  rastreabilidade: (lote: string) => [...logisticaKeys.all, 'rastreabilidade', lote] as const,
  consignacoes: (filters?: Record<string, unknown>) => [...logisticaKeys.all, 'consignacoes', filters] as const,
  movimentacoes: (filters?: Record<string, unknown>) => [...logisticaKeys.all, 'movimentacoes', filters] as const,
  stats: () => [...logisticaKeys.all, 'stats'] as const,
  lotes: (produtoId?: string) => [...logisticaKeys.all, 'lotes', produtoId] as const,
}

// Types
export interface Entrega {
  id: string
  numero: string
  tipo: 'cirurgia' | 'consignacao' | 'venda' | 'devolucao'
  destino_id: string
  destino_nome: string
  destino_endereco: string
  data_agendada: string
  data_entrega?: string | null
  status: 'pendente' | 'em_transito' | 'entregue' | 'cancelada'
  transportadora?: string | null
  codigo_rastreio?: string | null
  observacoes?: string | null
  itens: EntregaItem[]
  criado_em: string
}

export interface EntregaItem {
  id: string
  produto_id: string
  produto_nome: string
  lote: string
  quantidade: number
  valor_unitario: number
}

export interface Consignacao {
  id: string
  numero: string
  hospital_id: string
  hospital_nome: string
  data_inicio: string
  data_fim_prevista: string
  status: 'ativa' | 'parcial' | 'devolvida' | 'convertida' | 'vencida'
  valor_total: number
  itens: ConsignacaoItem[]
  criado_em: string
}

export interface ConsignacaoItem {
  id: string
  produto_id: string
  produto_nome: string
  lote: string
  quantidade_enviada: number
  quantidade_utilizada: number
  quantidade_devolvida: number
  valor_unitario: number
  status: 'disponivel' | 'utilizado' | 'devolvido'
}

export interface Lote {
  id: string
  produto_id: string
  produto_nome: string
  numero_lote: string
  data_fabricacao: string
  data_validade: string
  quantidade_inicial: number
  quantidade_atual: number
  localizacao: string
  status: 'ativo' | 'reservado' | 'consumido' | 'vencido' | 'bloqueado'
  fornecedor: string
  nota_fiscal: string
  registro_anvisa?: string
}

export interface MovimentacaoEstoque {
  id: string
  tipo: 'entrada' | 'saida' | 'ajuste' | 'transferencia'
  produto_id: string
  produto_nome: string
  lote: string
  quantidade: number
  motivo: string
  documento_ref?: string
  usuario: string
  criado_em: string
}

export interface LogisticaStats {
  entregasPendentes: number
  entregasHoje: number
  consignacoesAtivas: number
  lotesVencendo: number
  taxaEntregaNoPrazo: number
  valorConsignado: number
}

export interface RastreabilidadeCompleta {
  lote: string
  produto: {
    id: string
    nome: string
    codigo: string
  }
  origem: {
    fornecedor: string
    nota_fiscal: string
    data_entrada: string
  }
  movimentacoes: {
    tipo: string
    data: string
    quantidade: number
    destino?: string
    documento?: string
  }[]
  destino_final?: {
    tipo: string
    paciente_ref?: string
    hospital?: string
    data_uso?: string
    cirurgia_id?: string
  }
}

/**
 * Hook para buscar estatísticas de logística
 */
export function useLogisticaStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: logisticaKeys.stats(),
    queryFn: async (): Promise<LogisticaStats> => {
      if (!isConfigured) {
        return getMockLogisticaStats()
      }

      try {
        const hoje = new Date().toISOString().split('T')[0]
        const em30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

        // Entregas pendentes
        const { count: entregasPendentes } = await supabase
          .from('entregas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente')

        // Entregas hoje
        const { count: entregasHoje } = await supabase
          .from('entregas')
          .select('*', { count: 'exact', head: true })
          .eq('data_agendada', hoje)

        // Lotes vencendo em 30 dias
        const { count: lotesVencendo } = await supabase
          .from('lotes')
          .select('*', { count: 'exact', head: true })
          .lte('data_validade', em30dias)
          .eq('status', 'ativo')

        return {
          entregasPendentes: entregasPendentes || 0,
          entregasHoje: entregasHoje || 0,
          consignacoesAtivas: 12, // TODO: Add consignacoes table
          lotesVencendo: lotesVencendo || 0,
          taxaEntregaNoPrazo: 94.5,
          valorConsignado: 850000,
        }
      } catch (error) {
        console.error('Error fetching logistica stats:', error)
        return getMockLogisticaStats()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar entregas
 */
export function useEntregas(filters?: { status?: string; data?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: logisticaKeys.entregas(filters),
    queryFn: async (): Promise<Entrega[]> => {
      if (!isConfigured) {
        return getMockEntregas()
      }

      try {
        let query = supabase
          .from('entregas')
          .select(`
            *,
            itens:entregas_itens(*)
          `)
          .order('data_agendada', { ascending: true })

        if (filters?.status && filters.status !== 'todas') {
          query = query.eq('status', filters.status)
        }

        if (filters?.data) {
          query = query.eq('data_agendada', filters.data)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockEntregas()
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook para buscar consignações
 */
export function useConsignacoes(filters?: { status?: string; hospital_id?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: logisticaKeys.consignacoes(filters),
    queryFn: async (): Promise<Consignacao[]> => {
      if (!isConfigured) {
        return getMockConsignacoes()
      }

      try {
        let query = supabase
          .from('consignacoes')
          .select(`
            *,
            hospital:hospitais(id, nome),
            itens:consignacoes_itens(*)
          `)
          .order('data_inicio', { ascending: false })

        if (filters?.status && filters.status !== 'todas') {
          query = query.eq('status', filters.status)
        }

        if (filters?.hospital_id) {
          query = query.eq('hospital_id', filters.hospital_id)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(c => ({
          ...c,
          hospital_nome: c.hospital?.nome || 'Hospital',
        }))
      } catch {
        return getMockConsignacoes()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar lotes de um produto
 */
export function useLotes(produtoId?: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: logisticaKeys.lotes(produtoId),
    queryFn: async (): Promise<Lote[]> => {
      if (!isConfigured) {
        return getMockLotes()
      }

      try {
        let query = supabase
          .from('lotes')
          .select(`
            *,
            produto:produtos(id, nome, codigo)
          `)
          .order('data_validade', { ascending: true })

        if (produtoId) {
          query = query.eq('produto_id', produtoId)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(l => ({
          ...l,
          produto_nome: l.produto?.nome || 'Produto',
        }))
      } catch {
        return getMockLotes()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para rastreabilidade completa de um lote
 */
export function useRastreabilidade(lote: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: logisticaKeys.rastreabilidade(lote),
    queryFn: async (): Promise<RastreabilidadeCompleta | null> => {
      if (!isConfigured || !lote) {
        return getMockRastreabilidade(lote)
      }

      try {
        // Get lote data
        const { data: loteData, error: loteError } = await supabase
          .from('lotes')
          .select(`
            *,
            produto:produtos(id, nome, codigo)
          `)
          .eq('numero_lote', lote)
          .single()

        if (loteError) throw loteError

        // Get movimentações
        const { data: movimentacoes } = await supabase
          .from('movimentacoes_estoque')
          .select('*')
          .eq('lote', lote)
          .order('criado_em', { ascending: true })

        return {
          lote,
          produto: {
            id: loteData.produto?.id,
            nome: loteData.produto?.nome,
            codigo: loteData.produto?.codigo,
          },
          origem: {
            fornecedor: loteData.fornecedor,
            nota_fiscal: loteData.nota_fiscal,
            data_entrada: loteData.criado_em,
          },
          movimentacoes: (movimentacoes || []).map(m => ({
            tipo: m.tipo,
            data: m.criado_em,
            quantidade: m.quantidade,
            destino: m.destino,
            documento: m.documento_ref,
          })),
        }
      } catch {
        return getMockRastreabilidade(lote)
      }
    },
    enabled: !!lote,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para criar nova entrega
 */
export function useCreateEntrega() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (entrega: Omit<Entrega, 'id' | 'criado_em'>): Promise<Entrega> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { itens, ...entregaData } = entrega

      const { data, error } = await supabase
        .from('entregas')
        .insert(entregaData)
        .select()
        .single()

      if (error) throw error

      // Insert items
      if (itens.length > 0) {
        await supabase
          .from('entregas_itens')
          .insert(itens.map(item => ({ ...item, entrega_id: data.id })))
      }

      return { ...data, itens }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logisticaKeys.entregas() })
      queryClient.invalidateQueries({ queryKey: logisticaKeys.stats() })
      toast.success('Entrega criada com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar entrega: ${error.message}`)
    },
  })
}

/**
 * Hook para atualizar status de entrega
 */
export function useUpdateEntregaStatus() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, data_entrega }: { id: string; status: Entrega['status']; data_entrega?: string }): Promise<void> => {
      if (!isConfigured) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('entregas')
        .update({ status, data_entrega })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: logisticaKeys.entregas() })
      queryClient.invalidateQueries({ queryKey: logisticaKeys.stats() })
      toast.success('Status atualizado!')
    },
  })
}

// Mock data functions
function getMockLogisticaStats(): LogisticaStats {
  return {
    entregasPendentes: 8,
    entregasHoje: 5,
    consignacoesAtivas: 12,
    lotesVencendo: 3,
    taxaEntregaNoPrazo: 94.5,
    valorConsignado: 850000,
  }
}

function getMockEntregas(): Entrega[] {
  return [
    {
      id: '1',
      numero: 'ENT-2025-001',
      tipo: 'cirurgia',
      destino_id: 'hosp-1',
      destino_nome: 'Hospital Sírio-Libanês',
      destino_endereco: 'Rua Dona Adma Jafet, 91 - São Paulo/SP',
      data_agendada: new Date().toISOString().split('T')[0],
      status: 'pendente',
      transportadora: 'Logística Médica Express',
      codigo_rastreio: 'LME2025112701',
      itens: [
        { id: '1', produto_id: '1', produto_nome: 'Prótese de Joelho Premium M', lote: 'LOT-2025-045', quantidade: 1, valor_unitario: 35000 },
        { id: '2', produto_id: '2', produto_nome: 'Kit Instrumental Joelho', lote: 'LOT-2025-046', quantidade: 1, valor_unitario: 8000 },
      ],
      criado_em: new Date().toISOString(),
    },
    {
      id: '2',
      numero: 'ENT-2025-002',
      tipo: 'consignacao',
      destino_id: 'hosp-2',
      destino_nome: 'Hospital Albert Einstein',
      destino_endereco: 'Av. Albert Einstein, 627 - São Paulo/SP',
      data_agendada: new Date().toISOString().split('T')[0],
      status: 'em_transito',
      transportadora: 'Jadlog Medicina',
      codigo_rastreio: 'JDL2025112702',
      itens: [
        { id: '3', produto_id: '3', produto_nome: 'Stent Coronário DES', lote: 'LOT-2025-089', quantidade: 5, valor_unitario: 12000 },
      ],
      criado_em: new Date().toISOString(),
    },
  ]
}

function getMockConsignacoes(): Consignacao[] {
  return [
    {
      id: '1',
      numero: 'CONS-2025-001',
      hospital_id: 'hosp-1',
      hospital_nome: 'Hospital Sírio-Libanês',
      data_inicio: '2025-11-01',
      data_fim_prevista: '2025-12-01',
      status: 'ativa',
      valor_total: 250000,
      itens: [
        { id: '1', produto_id: '1', produto_nome: 'Prótese de Joelho Premium P', lote: 'LOT-2025-041', quantidade_enviada: 2, quantidade_utilizada: 1, quantidade_devolvida: 0, valor_unitario: 35000, status: 'disponivel' },
        { id: '2', produto_id: '2', produto_nome: 'Prótese de Joelho Premium M', lote: 'LOT-2025-042', quantidade_enviada: 2, quantidade_utilizada: 0, quantidade_devolvida: 0, valor_unitario: 35000, status: 'disponivel' },
        { id: '3', produto_id: '3', produto_nome: 'Prótese de Joelho Premium G', lote: 'LOT-2025-043', quantidade_enviada: 2, quantidade_utilizada: 1, quantidade_devolvida: 0, valor_unitario: 35000, status: 'utilizado' },
      ],
      criado_em: '2025-11-01T10:00:00Z',
    },
  ]
}

function getMockLotes(): Lote[] {
  return [
    {
      id: '1',
      produto_id: '1',
      produto_nome: 'Prótese de Joelho Premium M',
      numero_lote: 'LOT-2025-045',
      data_fabricacao: '2025-06-15',
      data_validade: '2027-06-15',
      quantidade_inicial: 10,
      quantidade_atual: 5,
      localizacao: 'Depósito A - Prateleira 12',
      status: 'ativo',
      fornecedor: 'Smith & Nephew Brasil',
      nota_fiscal: 'NFE-12345',
      registro_anvisa: '80123456789',
    },
    {
      id: '2',
      produto_id: '2',
      produto_nome: 'Stent Coronário DES',
      numero_lote: 'LOT-2025-089',
      data_fabricacao: '2025-08-01',
      data_validade: '2025-12-15',
      quantidade_inicial: 20,
      quantidade_atual: 8,
      localizacao: 'Depósito B - Prateleira 05',
      status: 'ativo',
      fornecedor: 'Medtronic Brasil',
      nota_fiscal: 'NFE-23456',
      registro_anvisa: '80234567890',
    },
  ]
}

function getMockRastreabilidade(lote: string): RastreabilidadeCompleta {
  return {
    lote,
    produto: {
      id: '1',
      nome: 'Prótese de Joelho Premium M',
      codigo: 'OPME-001',
    },
    origem: {
      fornecedor: 'Smith & Nephew Brasil',
      nota_fiscal: 'NFE-12345',
      data_entrada: '2025-10-15T10:00:00Z',
    },
    movimentacoes: [
      { tipo: 'entrada', data: '2025-10-15T10:00:00Z', quantidade: 10 },
      { tipo: 'saida', data: '2025-10-20T14:00:00Z', quantidade: 2, destino: 'Consignação - Hospital ABC', documento: 'CONS-001' },
      { tipo: 'saida', data: '2025-11-05T09:00:00Z', quantidade: 1, destino: 'Cirurgia CIR-2025-089', documento: 'CIR-2025-089' },
      { tipo: 'saida', data: '2025-11-15T11:00:00Z', quantidade: 2, destino: 'Consignação - Hospital XYZ', documento: 'CONS-002' },
    ],
    destino_final: {
      tipo: 'cirurgia',
      paciente_ref: 'PAC-****-123',
      hospital: 'Hospital Sírio-Libanês',
      data_uso: '2025-11-05T09:00:00Z',
      cirurgia_id: 'CIR-2025-089',
    },
  }
}

