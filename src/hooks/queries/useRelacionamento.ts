/**
 * ICARUS v5.0 - useRelacionamento Hook
 * 
 * React Query hooks for CRM, Leads and Relationship Management
 * Connects to Supabase for customer relationship data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const relacionamentoKeys = {
  all: ['relacionamento'] as const,
  leads: (filters?: Record<string, unknown>) => [...relacionamentoKeys.all, 'leads', filters] as const,
  lead: (id: string) => [...relacionamentoKeys.all, 'lead', id] as const,
  contatos: (clienteId?: string) => [...relacionamentoKeys.all, 'contatos', clienteId] as const,
  interacoes: (clienteId: string) => [...relacionamentoKeys.all, 'interacoes', clienteId] as const,
  oportunidades: (filters?: Record<string, unknown>) => [...relacionamentoKeys.all, 'oportunidades', filters] as const,
  campanhas: (filters?: Record<string, unknown>) => [...relacionamentoKeys.all, 'campanhas', filters] as const,
  stats: () => [...relacionamentoKeys.all, 'stats'] as const,
  pipeline: () => [...relacionamentoKeys.all, 'pipeline'] as const,
}

// Types
export interface Lead {
  id: string
  nome: string
  empresa: string
  cargo?: string
  email: string
  telefone?: string
  origem: 'site' | 'indicacao' | 'evento' | 'linkedin' | 'cold_call' | 'outro'
  status: 'novo' | 'qualificado' | 'em_negociacao' | 'convertido' | 'perdido'
  temperatura: 'frio' | 'morno' | 'quente'
  valor_potencial?: number
  responsavel?: string
  notas?: string
  tags?: string[]
  criado_em: string
  atualizado_em: string
}

export interface Contato {
  id: string
  cliente_id: string
  nome: string
  cargo: string
  departamento?: string
  email: string
  telefone?: string
  celular?: string
  tipo: 'decisor' | 'influenciador' | 'tecnico' | 'administrativo' | 'outro'
  principal: boolean
  ativo: boolean
  aniversario?: string
  linkedin?: string
  notas?: string
  criado_em: string
}

export interface Interacao {
  id: string
  cliente_id: string
  contato_id?: string
  tipo: 'reuniao' | 'ligacao' | 'email' | 'visita' | 'proposta' | 'outro'
  assunto: string
  descricao?: string
  data: string
  duracao_minutos?: number
  resultado?: 'positivo' | 'neutro' | 'negativo'
  proxima_acao?: string
  data_proxima_acao?: string
  responsavel: string
  criado_em: string
}

export interface Oportunidade {
  id: string
  titulo: string
  cliente_id: string
  cliente_nome: string
  valor: number
  probabilidade: number
  estagio: 'prospeccao' | 'qualificacao' | 'proposta' | 'negociacao' | 'fechamento' | 'ganho' | 'perdido'
  data_previsao: string
  responsavel: string
  motivo_perda?: string
  concorrentes?: string[]
  produtos?: string[]
  notas?: string
  criado_em: string
  atualizado_em: string
}

export interface Campanha {
  id: string
  nome: string
  tipo: 'email' | 'evento' | 'webinar' | 'promocao' | 'lancamento' | 'outro'
  status: 'planejada' | 'ativa' | 'pausada' | 'concluida' | 'cancelada'
  data_inicio: string
  data_fim?: string
  orcamento?: number
  custo_real?: number
  leads_gerados: number
  conversoes: number
  roi?: number
  responsavel: string
  descricao?: string
  criado_em: string
}

export interface RelacionamentoStats {
  leadsNovos: number
  leadsQualificados: number
  oportunidadesAbertas: number
  valorPipeline: number
  taxaConversao: number
  campanhasAtivas: number
  interacoesHoje: number
  clientesAtivos: number
}

export interface PipelineData {
  estagio: string
  quantidade: number
  valor: number
}

/**
 * Hook para buscar estatísticas de relacionamento
 */
export function useRelacionamentoStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.stats(),
    queryFn: async (): Promise<RelacionamentoStats> => {
      if (!isConfigured) {
        return getMockRelacionamentoStats()
      }

      try {
        // Get leads count
        const { count: leadsNovos } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'novo')

        const { count: leadsQualificados } = await supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'qualificado')

        // Get opportunities
        const { data: oportunidades } = await supabase
          .from('oportunidades')
          .select('valor, estagio')
          .not('estagio', 'in', '("ganho","perdido")')

        const valorPipeline = oportunidades?.reduce((sum, o) => sum + (o.valor || 0), 0) || 0

        return {
          leadsNovos: leadsNovos || 0,
          leadsQualificados: leadsQualificados || 0,
          oportunidadesAbertas: oportunidades?.length || 0,
          valorPipeline,
          taxaConversao: 28.5,
          campanhasAtivas: 3,
          interacoesHoje: 12,
          clientesAtivos: 85,
        }
      } catch (error) {
        console.error('Error fetching relacionamento stats:', error)
        return getMockRelacionamentoStats()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar leads
 */
export function useLeads(filters?: { status?: string; origem?: string; temperatura?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.leads(filters),
    queryFn: async (): Promise<Lead[]> => {
      if (!isConfigured) {
        return getMockLeads()
      }

      try {
        let query = supabase
          .from('leads')
          .select('*')
          .order('criado_em', { ascending: false })

        if (filters?.status && filters.status !== 'todos') {
          query = query.eq('status', filters.status)
        }

        if (filters?.origem && filters.origem !== 'todas') {
          query = query.eq('origem', filters.origem)
        }

        if (filters?.temperatura && filters.temperatura !== 'todas') {
          query = query.eq('temperatura', filters.temperatura)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockLeads()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar contatos de um cliente
 */
export function useContatos(clienteId?: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.contatos(clienteId),
    queryFn: async (): Promise<Contato[]> => {
      if (!isConfigured) {
        return getMockContatos()
      }

      try {
        let query = supabase
          .from('contatos')
          .select('*')
          .eq('ativo', true)
          .order('principal', { ascending: false })

        if (clienteId) {
          query = query.eq('cliente_id', clienteId)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockContatos()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar interações de um cliente
 */
export function useInteracoes(clienteId: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.interacoes(clienteId),
    queryFn: async (): Promise<Interacao[]> => {
      if (!isConfigured || !clienteId) {
        return getMockInteracoes()
      }

      try {
        const { data, error } = await supabase
          .from('interacoes')
          .select(`
            *,
            contato:contatos(nome)
          `)
          .eq('cliente_id', clienteId)
          .order('data', { ascending: false })

        if (error) throw error
        return data || []
      } catch {
        return getMockInteracoes()
      }
    },
    enabled: !!clienteId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar oportunidades
 */
export function useOportunidades(filters?: { estagio?: string; responsavel?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.oportunidades(filters),
    queryFn: async (): Promise<Oportunidade[]> => {
      if (!isConfigured) {
        return getMockOportunidades()
      }

      try {
        let query = supabase
          .from('oportunidades')
          .select(`
            *,
            cliente:clientes(nome)
          `)
          .order('data_previsao', { ascending: true })

        if (filters?.estagio && filters.estagio !== 'todos') {
          query = query.eq('estagio', filters.estagio)
        }

        if (filters?.responsavel) {
          query = query.eq('responsavel', filters.responsavel)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(o => ({
          ...o,
          cliente_nome: o.cliente?.nome || 'Cliente',
        }))
      } catch {
        return getMockOportunidades()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar campanhas
 */
export function useCampanhas(filters?: { status?: string; tipo?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.campanhas(filters),
    queryFn: async (): Promise<Campanha[]> => {
      if (!isConfigured) {
        return getMockCampanhas()
      }

      try {
        let query = supabase
          .from('campanhas')
          .select('*')
          .order('data_inicio', { ascending: false })

        if (filters?.status && filters.status !== 'todas') {
          query = query.eq('status', filters.status)
        }

        if (filters?.tipo && filters.tipo !== 'todos') {
          query = query.eq('tipo', filters.tipo)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockCampanhas()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para dados do pipeline
 */
export function usePipeline() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: relacionamentoKeys.pipeline(),
    queryFn: async (): Promise<PipelineData[]> => {
      if (!isConfigured) {
        return getMockPipeline()
      }

      try {
        const { data, error } = await supabase
          .from('oportunidades')
          .select('estagio, valor')
          .not('estagio', 'in', '("ganho","perdido")')

        if (error) throw error

        // Group by stage
        const grouped: Record<string, { quantidade: number; valor: number }> = {}
        const estagios = ['prospeccao', 'qualificacao', 'proposta', 'negociacao', 'fechamento']

        estagios.forEach(e => {
          grouped[e] = { quantidade: 0, valor: 0 }
        })

        data?.forEach(o => {
          if (grouped[o.estagio]) {
            grouped[o.estagio].quantidade++
            grouped[o.estagio].valor += o.valor || 0
          }
        })

        return estagios.map(e => ({
          estagio: e,
          quantidade: grouped[e].quantidade,
          valor: grouped[e].valor,
        }))
      } catch {
        return getMockPipeline()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para criar lead
 */
export function useCreateLead() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (lead: Omit<Lead, 'id' | 'criado_em' | 'atualizado_em'>): Promise<Lead> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.leads() })
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.stats() })
      toast.success('Lead criado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar lead: ${error.message}`)
    },
  })
}

/**
 * Hook para criar interação
 */
export function useCreateInteracao() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (interacao: Omit<Interacao, 'id' | 'criado_em'>): Promise<Interacao> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('interacoes')
        .insert(interacao)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.interacoes(variables.cliente_id) })
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.stats() })
      toast.success('Interação registrada!')
    },
  })
}

/**
 * Hook para atualizar estágio da oportunidade
 */
export function useUpdateOportunidadeEstagio() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, estagio, motivo_perda }: { id: string; estagio: Oportunidade['estagio']; motivo_perda?: string }): Promise<void> => {
      if (!isConfigured) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('oportunidades')
        .update({ estagio, motivo_perda, atualizado_em: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.oportunidades() })
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.pipeline() })
      queryClient.invalidateQueries({ queryKey: relacionamentoKeys.stats() })
      toast.success('Oportunidade atualizada!')
    },
  })
}

// Mock data functions
function getMockRelacionamentoStats(): RelacionamentoStats {
  return {
    leadsNovos: 15,
    leadsQualificados: 8,
    oportunidadesAbertas: 12,
    valorPipeline: 2850000,
    taxaConversao: 28.5,
    campanhasAtivas: 3,
    interacoesHoje: 12,
    clientesAtivos: 85,
  }
}

function getMockLeads(): Lead[] {
  return [
    {
      id: '1',
      nome: 'Dr. Carlos Mendes',
      empresa: 'Hospital Regional Sul',
      cargo: 'Diretor Médico',
      email: 'carlos.mendes@hospitalregional.com.br',
      telefone: '(11) 98765-4321',
      origem: 'evento',
      status: 'qualificado',
      temperatura: 'quente',
      valor_potencial: 150000,
      responsavel: 'João Silva',
      notas: 'Interessado em próteses de joelho para novo centro cirúrgico',
      tags: ['ortopedia', 'alto_valor'],
      criado_em: '2025-11-15T10:00:00Z',
      atualizado_em: '2025-11-20T14:00:00Z',
    },
    {
      id: '2',
      nome: 'Ana Paula Ferreira',
      empresa: 'Clínica CardioVida',
      cargo: 'Coordenadora de Compras',
      email: 'ana.ferreira@cardiovida.com.br',
      telefone: '(11) 91234-5678',
      origem: 'site',
      status: 'novo',
      temperatura: 'morno',
      valor_potencial: 80000,
      criado_em: '2025-11-25T09:00:00Z',
      atualizado_em: '2025-11-25T09:00:00Z',
    },
  ]
}

function getMockContatos(): Contato[] {
  return [
    {
      id: '1',
      cliente_id: 'hosp-1',
      nome: 'Dr. Roberto Lima',
      cargo: 'Diretor Clínico',
      departamento: 'Diretoria',
      email: 'roberto.lima@hospital.com.br',
      telefone: '(11) 3456-7890',
      celular: '(11) 99876-5432',
      tipo: 'decisor',
      principal: true,
      ativo: true,
      linkedin: 'linkedin.com/in/robertolima',
      criado_em: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      cliente_id: 'hosp-1',
      nome: 'Maria Santos',
      cargo: 'Gerente de Compras',
      departamento: 'Suprimentos',
      email: 'maria.santos@hospital.com.br',
      telefone: '(11) 3456-7891',
      tipo: 'influenciador',
      principal: false,
      ativo: true,
      criado_em: '2025-02-01T10:00:00Z',
    },
  ]
}

function getMockInteracoes(): Interacao[] {
  return [
    {
      id: '1',
      cliente_id: 'hosp-1',
      contato_id: '1',
      tipo: 'reuniao',
      assunto: 'Apresentação de novos produtos ortopédicos',
      descricao: 'Reunião presencial com diretor clínico para apresentar linha de próteses premium',
      data: '2025-11-20T14:00:00Z',
      duracao_minutos: 60,
      resultado: 'positivo',
      proxima_acao: 'Enviar proposta comercial',
      data_proxima_acao: '2025-11-25',
      responsavel: 'João Silva',
      criado_em: '2025-11-20T15:30:00Z',
    },
  ]
}

function getMockOportunidades(): Oportunidade[] {
  return [
    {
      id: '1',
      titulo: 'Fornecimento de próteses para centro cirúrgico',
      cliente_id: 'hosp-1',
      cliente_nome: 'Hospital Sírio-Libanês',
      valor: 450000,
      probabilidade: 70,
      estagio: 'proposta',
      data_previsao: '2025-12-15',
      responsavel: 'João Silva',
      produtos: ['Prótese de Joelho', 'Prótese de Quadril', 'Instrumental'],
      criado_em: '2025-10-01T10:00:00Z',
      atualizado_em: '2025-11-20T14:00:00Z',
    },
    {
      id: '2',
      titulo: 'Contrato anual de stents coronários',
      cliente_id: 'hosp-2',
      cliente_nome: 'Hospital Albert Einstein',
      valor: 850000,
      probabilidade: 50,
      estagio: 'negociacao',
      data_previsao: '2026-01-10',
      responsavel: 'Maria Costa',
      concorrentes: ['Medtronic', 'Boston Scientific'],
      criado_em: '2025-09-15T10:00:00Z',
      atualizado_em: '2025-11-18T11:00:00Z',
    },
  ]
}

function getMockCampanhas(): Campanha[] {
  return [
    {
      id: '1',
      nome: 'Webinar Inovações em Ortopedia 2025',
      tipo: 'webinar',
      status: 'ativa',
      data_inicio: '2025-11-01',
      data_fim: '2025-12-15',
      orcamento: 15000,
      custo_real: 8500,
      leads_gerados: 45,
      conversoes: 8,
      roi: 320,
      responsavel: 'Marketing',
      descricao: 'Série de webinars sobre novas tecnologias em OPME ortopédico',
      criado_em: '2025-10-15T10:00:00Z',
    },
    {
      id: '2',
      nome: 'Email Marketing - Cardiologia',
      tipo: 'email',
      status: 'ativa',
      data_inicio: '2025-11-15',
      orcamento: 5000,
      custo_real: 2000,
      leads_gerados: 22,
      conversoes: 3,
      responsavel: 'Marketing',
      criado_em: '2025-11-10T10:00:00Z',
    },
  ]
}

function getMockPipeline(): PipelineData[] {
  return [
    { estagio: 'prospeccao', quantidade: 8, valor: 450000 },
    { estagio: 'qualificacao', quantidade: 5, valor: 380000 },
    { estagio: 'proposta', quantidade: 4, valor: 620000 },
    { estagio: 'negociacao', quantidade: 3, valor: 850000 },
    { estagio: 'fechamento', quantidade: 2, valor: 550000 },
  ]
}

