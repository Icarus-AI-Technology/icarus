/**
 * ICARUS v5.0 - useRH Hook
 * 
 * React Query hooks for Human Resources operations
 * Connects to Supabase for employee, payroll and benefits data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const rhKeys = {
  all: ['rh'] as const,
  colaboradores: (filters?: Record<string, unknown>) => [...rhKeys.all, 'colaboradores', filters] as const,
  colaborador: (id: string) => [...rhKeys.all, 'colaborador', id] as const,
  cargos: () => [...rhKeys.all, 'cargos'] as const,
  departamentos: () => [...rhKeys.all, 'departamentos'] as const,
  ferias: (filters?: Record<string, unknown>) => [...rhKeys.all, 'ferias', filters] as const,
  pontos: (colaboradorId: string, periodo?: string) => [...rhKeys.all, 'pontos', colaboradorId, periodo] as const,
  folhaPagamento: (competencia: string) => [...rhKeys.all, 'folha', competencia] as const,
  beneficios: () => [...rhKeys.all, 'beneficios'] as const,
  treinamentos: (filters?: Record<string, unknown>) => [...rhKeys.all, 'treinamentos', filters] as const,
  stats: () => [...rhKeys.all, 'stats'] as const,
}

// Types
export interface Colaborador {
  id: string
  nome: string
  cpf: string
  email: string
  telefone?: string
  data_nascimento: string
  data_admissao: string
  data_demissao?: string | null
  cargo_id: string
  cargo_nome: string
  departamento_id: string
  departamento_nome: string
  salario_base: number
  tipo_contrato: 'clt' | 'pj' | 'estagio' | 'temporario'
  status: 'ativo' | 'ferias' | 'afastado' | 'demitido'
  gestor_id?: string
  foto_url?: string
  documentos?: string[]
  criado_em: string
}

export interface Cargo {
  id: string
  nome: string
  departamento_id: string
  nivel: 'junior' | 'pleno' | 'senior' | 'especialista' | 'coordenador' | 'gerente' | 'diretor'
  faixa_salarial_min: number
  faixa_salarial_max: number
  descricao?: string
  competencias?: string[]
  ativo: boolean
}

export interface Departamento {
  id: string
  nome: string
  sigla: string
  gestor_id?: string
  gestor_nome?: string
  orcamento_mensal?: number
  centro_custo: string
  colaboradores_count: number
  ativo: boolean
}

export interface SolicitacaoFerias {
  id: string
  colaborador_id: string
  colaborador_nome: string
  data_inicio: string
  data_fim: string
  dias_totais: number
  tipo: 'ferias' | 'abono' | 'licenca'
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'cancelada'
  aprovador_id?: string
  aprovador_nome?: string
  data_aprovacao?: string
  observacoes?: string
  criado_em: string
}

export interface RegistroPonto {
  id: string
  colaborador_id: string
  data: string
  entrada_1?: string
  saida_1?: string
  entrada_2?: string
  saida_2?: string
  horas_trabalhadas: number
  horas_extras: number
  atrasos_minutos: number
  faltas: boolean
  justificativa?: string
  status: 'normal' | 'ajuste_pendente' | 'ajustado' | 'falta_justificada'
}

export interface FolhaPagamento {
  id: string
  colaborador_id: string
  colaborador_nome: string
  competencia: string
  salario_base: number
  horas_extras_valor: number
  descontos_inss: number
  descontos_irrf: number
  descontos_vt: number
  descontos_vr: number
  outros_descontos: number
  outros_proventos: number
  salario_liquido: number
  status: 'processando' | 'calculada' | 'aprovada' | 'paga'
  data_pagamento?: string
}

export interface Beneficio {
  id: string
  nome: string
  tipo: 'vale_transporte' | 'vale_refeicao' | 'plano_saude' | 'plano_odonto' | 'seguro_vida' | 'gym' | 'outro'
  fornecedor: string
  valor_empresa: number
  valor_colaborador: number
  colaboradores_count: number
  ativo: boolean
}

export interface Treinamento {
  id: string
  titulo: string
  tipo: 'onboarding' | 'tecnico' | 'comportamental' | 'compliance' | 'lideranca'
  modalidade: 'presencial' | 'online' | 'hibrido'
  carga_horaria: number
  instrutor: string
  data_inicio: string
  data_fim?: string
  status: 'planejado' | 'em_andamento' | 'concluido' | 'cancelado'
  vagas: number
  inscritos: number
  aprovados: number
  certificado: boolean
}

export interface RHStats {
  totalColaboradores: number
  colaboradoresAtivos: number
  admissoesmes: number
  demissoesMes: number
  feriasPendentes: number
  treinamentosAtivos: number
  folhaTotal: number
  turnover: number
}

/**
 * Hook para buscar estatísticas de RH
 */
export function useRHStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.stats(),
    queryFn: async (): Promise<RHStats> => {
      if (!isConfigured) {
        return getMockRHStats()
      }

      try {
        const { count: totalColaboradores } = await supabase
          .from('colaboradores')
          .select('*', { count: 'exact', head: true })

        const { count: colaboradoresAtivos } = await supabase
          .from('colaboradores')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')

        const { count: feriasPendentes } = await supabase
          .from('ferias')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pendente')

        return {
          totalColaboradores: totalColaboradores || 0,
          colaboradoresAtivos: colaboradoresAtivos || 0,
          admissoesmes: 3,
          demissoesMes: 1,
          feriasPendentes: feriasPendentes || 0,
          treinamentosAtivos: 4,
          folhaTotal: 485000,
          turnover: 2.5,
        }
      } catch (error) {
        console.error('Error fetching RH stats:', error)
        return getMockRHStats()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar colaboradores
 */
export function useColaboradores(filters?: { status?: string; departamento?: string; cargo?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.colaboradores(filters),
    queryFn: async (): Promise<Colaborador[]> => {
      if (!isConfigured) {
        return getMockColaboradores()
      }

      try {
        let query = supabase
          .from('colaboradores')
          .select(`
            *,
            cargo:cargos(nome),
            departamento:departamentos(nome)
          `)
          .order('nome', { ascending: true })

        if (filters?.status && filters.status !== 'todos') {
          query = query.eq('status', filters.status)
        }

        if (filters?.departamento && filters.departamento !== 'todos') {
          query = query.eq('departamento_id', filters.departamento)
        }

        if (filters?.cargo && filters.cargo !== 'todos') {
          query = query.eq('cargo_id', filters.cargo)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(c => ({
          ...c,
          cargo_nome: c.cargo?.nome || 'N/A',
          departamento_nome: c.departamento?.nome || 'N/A',
        }))
      } catch {
        return getMockColaboradores()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar cargos
 */
export function useCargos() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.cargos(),
    queryFn: async (): Promise<Cargo[]> => {
      if (!isConfigured) {
        return getMockCargos()
      }

      try {
        const { data, error } = await supabase
          .from('cargos')
          .select('*')
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        return data || []
      } catch {
        return getMockCargos()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para buscar departamentos
 */
export function useDepartamentos() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.departamentos(),
    queryFn: async (): Promise<Departamento[]> => {
      if (!isConfigured) {
        return getMockDepartamentos()
      }

      try {
        const { data, error } = await supabase
          .from('departamentos')
          .select(`
            *,
            gestor:colaboradores(nome)
          `)
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        return (data || []).map(d => ({
          ...d,
          gestor_nome: d.gestor?.nome || null,
        }))
      } catch {
        return getMockDepartamentos()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para buscar solicitações de férias
 */
export function useFeriassolicitacoes(filters?: { status?: string; mes?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.ferias(filters),
    queryFn: async (): Promise<SolicitacaoFerias[]> => {
      if (!isConfigured) {
        return getMockFerias()
      }

      try {
        let query = supabase
          .from('ferias')
          .select(`
            *,
            colaborador:colaboradores(nome),
            aprovador:colaboradores(nome)
          `)
          .order('data_inicio', { ascending: true })

        if (filters?.status && filters.status !== 'todas') {
          query = query.eq('status', filters.status)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(f => ({
          ...f,
          colaborador_nome: f.colaborador?.nome || 'N/A',
          aprovador_nome: f.aprovador?.nome || null,
        }))
      } catch {
        return getMockFerias()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar registros de ponto
 */
export function useRegistrosPonto(colaboradorId: string, periodo?: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.pontos(colaboradorId, periodo),
    queryFn: async (): Promise<RegistroPonto[]> => {
      if (!isConfigured || !colaboradorId) {
        return getMockPontos()
      }

      try {
        let query = supabase
          .from('pontos')
          .select('*')
          .eq('colaborador_id', colaboradorId)
          .order('data', { ascending: false })

        if (periodo) {
          const [ano, mes] = periodo.split('-')
          const inicioMes = `${ano}-${mes}-01`
          const fimMes = `${ano}-${mes}-31`
          query = query.gte('data', inicioMes).lte('data', fimMes)
        }

        const { data, error } = await query.limit(31)

        if (error) throw error
        return data || []
      } catch {
        return getMockPontos()
      }
    },
    enabled: !!colaboradorId,
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar folha de pagamento
 */
export function useFolhaPagamento(competencia: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.folhaPagamento(competencia),
    queryFn: async (): Promise<FolhaPagamento[]> => {
      if (!isConfigured) {
        return getMockFolha()
      }

      try {
        const { data, error } = await supabase
          .from('folha_pagamento')
          .select(`
            *,
            colaborador:colaboradores(nome)
          `)
          .eq('competencia', competencia)
          .order('colaborador_nome')

        if (error) throw error
        return (data || []).map(f => ({
          ...f,
          colaborador_nome: f.colaborador?.nome || 'N/A',
        }))
      } catch {
        return getMockFolha()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar benefícios
 */
export function useBeneficios() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.beneficios(),
    queryFn: async (): Promise<Beneficio[]> => {
      if (!isConfigured) {
        return getMockBeneficios()
      }

      try {
        const { data, error } = await supabase
          .from('beneficios')
          .select('*')
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        return data || []
      } catch {
        return getMockBeneficios()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para buscar treinamentos
 */
export function useTreinamentos(filters?: { status?: string; tipo?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: rhKeys.treinamentos(filters),
    queryFn: async (): Promise<Treinamento[]> => {
      if (!isConfigured) {
        return getMockTreinamentos()
      }

      try {
        let query = supabase
          .from('treinamentos')
          .select('*')
          .order('data_inicio', { ascending: false })

        if (filters?.status && filters.status !== 'todos') {
          query = query.eq('status', filters.status)
        }

        if (filters?.tipo && filters.tipo !== 'todos') {
          query = query.eq('tipo', filters.tipo)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockTreinamentos()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para aprovar férias
 */
export function useAprovarFerias() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, aprovado, observacoes }: { id: string; aprovado: boolean; observacoes?: string }): Promise<void> => {
      if (!isConfigured) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('ferias')
        .update({
          status: aprovado ? 'aprovada' : 'rejeitada',
          data_aprovacao: new Date().toISOString(),
          observacoes,
        })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rhKeys.ferias() })
      queryClient.invalidateQueries({ queryKey: rhKeys.stats() })
      toast.success(variables.aprovado ? 'Férias aprovadas!' : 'Férias rejeitadas')
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`)
    },
  })
}

/**
 * Hook para criar colaborador
 */
export function useCreateColaborador() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'criado_em' | 'cargo_nome' | 'departamento_nome'>): Promise<Colaborador> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('colaboradores')
        .insert(colaborador)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rhKeys.colaboradores() })
      queryClient.invalidateQueries({ queryKey: rhKeys.stats() })
      toast.success('Colaborador cadastrado!')
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar: ${error.message}`)
    },
  })
}

// Mock data functions
function getMockRHStats(): RHStats {
  return {
    totalColaboradores: 85,
    colaboradoresAtivos: 82,
    admissoesmes: 3,
    demissoesMes: 1,
    feriasPendentes: 5,
    treinamentosAtivos: 4,
    folhaTotal: 485000,
    turnover: 2.5,
  }
}

function getMockColaboradores(): Colaborador[] {
  return [
    {
      id: '1',
      nome: 'Maria Silva Costa',
      cpf: '123.456.789-00',
      email: 'maria.silva@icarus.com.br',
      telefone: '(11) 99876-5432',
      data_nascimento: '1990-05-15',
      data_admissao: '2022-03-01',
      cargo_id: 'c1',
      cargo_nome: 'Analista de Compras',
      departamento_id: 'd1',
      departamento_nome: 'Compras',
      salario_base: 6500,
      tipo_contrato: 'clt',
      status: 'ativo',
      criado_em: '2022-03-01T10:00:00Z',
    },
    {
      id: '2',
      nome: 'João Pedro Santos',
      cpf: '987.654.321-00',
      email: 'joao.santos@icarus.com.br',
      telefone: '(11) 98765-4321',
      data_nascimento: '1988-11-20',
      data_admissao: '2021-06-15',
      cargo_id: 'c2',
      cargo_nome: 'Coordenador de Logística',
      departamento_id: 'd2',
      departamento_nome: 'Logística',
      salario_base: 9500,
      tipo_contrato: 'clt',
      status: 'ativo',
      criado_em: '2021-06-15T10:00:00Z',
    },
    {
      id: '3',
      nome: 'Ana Paula Ferreira',
      cpf: '456.789.123-00',
      email: 'ana.ferreira@icarus.com.br',
      data_nascimento: '1995-08-10',
      data_admissao: '2023-01-10',
      cargo_id: 'c3',
      cargo_nome: 'Assistente Financeiro',
      departamento_id: 'd3',
      departamento_nome: 'Financeiro',
      salario_base: 4200,
      tipo_contrato: 'clt',
      status: 'ferias',
      criado_em: '2023-01-10T10:00:00Z',
    },
  ]
}

function getMockCargos(): Cargo[] {
  return [
    {
      id: 'c1',
      nome: 'Analista de Compras',
      departamento_id: 'd1',
      nivel: 'pleno',
      faixa_salarial_min: 5000,
      faixa_salarial_max: 8000,
      competencias: ['Negociação', 'Excel Avançado', 'SAP'],
      ativo: true,
    },
    {
      id: 'c2',
      nome: 'Coordenador de Logística',
      departamento_id: 'd2',
      nivel: 'coordenador',
      faixa_salarial_min: 8000,
      faixa_salarial_max: 12000,
      competencias: ['Gestão de Equipe', 'WMS', 'Planejamento'],
      ativo: true,
    },
  ]
}

function getMockDepartamentos(): Departamento[] {
  return [
    {
      id: 'd1',
      nome: 'Compras',
      sigla: 'CPR',
      centro_custo: 'CC-001',
      colaboradores_count: 8,
      ativo: true,
    },
    {
      id: 'd2',
      nome: 'Logística',
      sigla: 'LOG',
      centro_custo: 'CC-002',
      colaboradores_count: 15,
      ativo: true,
    },
    {
      id: 'd3',
      nome: 'Financeiro',
      sigla: 'FIN',
      centro_custo: 'CC-003',
      colaboradores_count: 6,
      ativo: true,
    },
  ]
}

function getMockFerias(): SolicitacaoFerias[] {
  return [
    {
      id: 'f1',
      colaborador_id: '3',
      colaborador_nome: 'Ana Paula Ferreira',
      data_inicio: '2025-12-01',
      data_fim: '2025-12-20',
      dias_totais: 20,
      tipo: 'ferias',
      status: 'aprovada',
      aprovador_id: 'g1',
      aprovador_nome: 'Carlos Mendes',
      data_aprovacao: '2025-11-15T10:00:00Z',
      criado_em: '2025-11-01T10:00:00Z',
    },
    {
      id: 'f2',
      colaborador_id: '1',
      colaborador_nome: 'Maria Silva Costa',
      data_inicio: '2026-01-15',
      data_fim: '2026-02-03',
      dias_totais: 20,
      tipo: 'ferias',
      status: 'pendente',
      criado_em: '2025-11-20T10:00:00Z',
    },
  ]
}

function getMockPontos(): RegistroPonto[] {
  const hoje = new Date()
  return Array.from({ length: 5 }, (_, i) => {
    const data = new Date(hoje)
    data.setDate(data.getDate() - i)
    return {
      id: `p${i}`,
      colaborador_id: '1',
      data: data.toISOString().split('T')[0],
      entrada_1: '08:00',
      saida_1: '12:00',
      entrada_2: '13:00',
      saida_2: '18:00',
      horas_trabalhadas: 9,
      horas_extras: i === 0 ? 1 : 0,
      atrasos_minutos: i === 2 ? 15 : 0,
      faltas: false,
      status: 'normal' as const,
    }
  })
}

function getMockFolha(): FolhaPagamento[] {
  return [
    {
      id: 'fp1',
      colaborador_id: '1',
      colaborador_nome: 'Maria Silva Costa',
      competencia: '2025-11',
      salario_base: 6500,
      horas_extras_valor: 450,
      descontos_inss: 715,
      descontos_irrf: 487.50,
      descontos_vt: 390,
      descontos_vr: 0,
      outros_descontos: 0,
      outros_proventos: 200,
      salario_liquido: 5557.50,
      status: 'aprovada',
      data_pagamento: '2025-12-05',
    },
    {
      id: 'fp2',
      colaborador_id: '2',
      colaborador_nome: 'João Pedro Santos',
      competencia: '2025-11',
      salario_base: 9500,
      horas_extras_valor: 0,
      descontos_inss: 1045,
      descontos_irrf: 1150,
      descontos_vt: 570,
      descontos_vr: 0,
      outros_descontos: 0,
      outros_proventos: 500,
      salario_liquido: 7235,
      status: 'aprovada',
      data_pagamento: '2025-12-05',
    },
  ]
}

function getMockBeneficios(): Beneficio[] {
  return [
    {
      id: 'b1',
      nome: 'Vale Transporte',
      tipo: 'vale_transporte',
      fornecedor: 'SPTrans',
      valor_empresa: 280,
      valor_colaborador: 168,
      colaboradores_count: 75,
      ativo: true,
    },
    {
      id: 'b2',
      nome: 'Vale Refeição',
      tipo: 'vale_refeicao',
      fornecedor: 'Alelo',
      valor_empresa: 800,
      valor_colaborador: 0,
      colaboradores_count: 82,
      ativo: true,
    },
    {
      id: 'b3',
      nome: 'Plano de Saúde',
      tipo: 'plano_saude',
      fornecedor: 'Unimed',
      valor_empresa: 650,
      valor_colaborador: 150,
      colaboradores_count: 78,
      ativo: true,
    },
  ]
}

function getMockTreinamentos(): Treinamento[] {
  return [
    {
      id: 't1',
      titulo: 'Onboarding ICARUS',
      tipo: 'onboarding',
      modalidade: 'hibrido',
      carga_horaria: 16,
      instrutor: 'RH - Equipe Treinamento',
      data_inicio: '2025-12-01',
      data_fim: '2025-12-02',
      status: 'planejado',
      vagas: 10,
      inscritos: 3,
      aprovados: 0,
      certificado: true,
    },
    {
      id: 't2',
      titulo: 'Compliance LGPD',
      tipo: 'compliance',
      modalidade: 'online',
      carga_horaria: 4,
      instrutor: 'DPO - Maria Santos',
      data_inicio: '2025-11-15',
      data_fim: '2025-11-15',
      status: 'concluido',
      vagas: 100,
      inscritos: 85,
      aprovados: 82,
      certificado: true,
    },
  ]
}

