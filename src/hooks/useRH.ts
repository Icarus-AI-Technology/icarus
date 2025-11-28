/**
 * ICARUS v5.0 - Hook para Módulo de RH
 * 
 * Hook para gerenciamento de dados de Recursos Humanos.
 * 
 * @version 1.0.0
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { toast } from 'sonner'

// ============ TIPOS ============

export interface Colaborador {
  id: string
  nome: string
  cpf: string
  email: string
  telefone?: string
  cargo: string
  departamento: string
  dataAdmissao: string
  dataDemissao?: string
  salario: number
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado'
  tipo: 'clt' | 'pj' | 'estagiario' | 'temporario'
  gestor_id?: string
  created_at?: string
  updated_at?: string
}

export interface Departamento {
  id: string
  nome: string
  descricao?: string
  gestor_id?: string
  orcamento?: number
  headcount: number
}

export interface FolhaPagamento {
  id: string
  colaborador_id: string
  competencia: string
  salario_base: number
  horas_extras: number
  descontos: number
  inss: number
  irrf: number
  fgts: number
  vale_transporte: number
  vale_refeicao: number
  outros_beneficios: number
  salario_liquido: number
  status: 'calculado' | 'aprovado' | 'pago'
}

export interface PrestadorPJ {
  id: string
  razao_social: string
  nome_fantasia?: string
  cnpj: string
  email: string
  telefone?: string
  servico: string
  valor_mensal: number
  data_inicio: string
  data_fim?: string
  status: 'ativo' | 'inativo' | 'suspenso'
}

// ============ QUERIES ============

/**
 * Hook para listar colaboradores
 */
export function useColaboradores(filters?: { status?: string; departamento?: string }) {
  return useQuery({
    queryKey: ['colaboradores', filters],
    queryFn: async () => {
      let query = supabase
        .from('colaboradores')
        .select('*')
        .order('nome')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.departamento) {
        query = query.eq('departamento', filters.departamento)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Colaborador[]
    },
  })
}

/**
 * Hook para obter um colaborador
 */
export function useColaborador(id: string) {
  return useQuery({
    queryKey: ['colaborador', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Colaborador
    },
    enabled: !!id,
  })
}

/**
 * Hook para listar departamentos
 */
export function useDepartamentos() {
  return useQuery({
    queryKey: ['departamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .order('nome')

      if (error) throw error
      return data as Departamento[]
    },
  })
}

/**
 * Hook para listar folha de pagamento
 */
export function useFolhaPagamento(competencia: string) {
  return useQuery({
    queryKey: ['folha_pagamento', competencia],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('folha_pagamento')
        .select('*, colaboradores(nome, cpf, cargo)')
        .eq('competencia', competencia)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as (FolhaPagamento & { colaboradores: { nome: string; cpf: string; cargo: string } })[]
    },
  })
}

/**
 * Hook para listar prestadores PJ
 */
export function usePrestadoresPJ(filters?: { status?: string }) {
  return useQuery({
    queryKey: ['prestadores_pj', filters],
    queryFn: async () => {
      let query = supabase
        .from('prestadores_pj')
        .select('*')
        .order('razao_social')

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query

      if (error) throw error
      return data as PrestadorPJ[]
    },
  })
}

// ============ MUTATIONS ============

/**
 * Hook para criar colaborador
 */
export function useCreateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (colaborador: Omit<Colaborador, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('colaboradores')
        .insert(colaborador)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      toast.success('Colaborador cadastrado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar colaborador: ${error.message}`)
    },
  })
}

/**
 * Hook para atualizar colaborador
 */
export function useUpdateColaborador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Colaborador> & { id: string }) => {
      const { data, error } = await supabase
        .from('colaboradores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] })
      queryClient.invalidateQueries({ queryKey: ['colaborador', variables.id] })
      toast.success('Colaborador atualizado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar colaborador: ${error.message}`)
    },
  })
}

/**
 * Hook para criar prestador PJ
 */
export function useCreatePrestadorPJ() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prestador: Omit<PrestadorPJ, 'id'>) => {
      const { data, error } = await supabase
        .from('prestadores_pj')
        .insert(prestador)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestadores_pj'] })
      toast.success('Prestador PJ cadastrado com sucesso!')
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar prestador: ${error.message}`)
    },
  })
}

/**
 * Hook para calcular folha de pagamento
 */
export function useCalcularFolha() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (competencia: string) => {
      // Buscar colaboradores ativos
      const { data: colaboradores, error: colabError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('status', 'ativo')
        .eq('tipo', 'clt')

      if (colabError) throw colabError

      // Calcular folha para cada colaborador
      const folhas = colaboradores.map(colab => {
        const salarioBase = colab.salario
        const inss = calcularINSS(salarioBase)
        const irrf = calcularIRRF(salarioBase - inss)
        const fgts = salarioBase * 0.08
        const vt = salarioBase * 0.06
        const vr = 0 // Definir valor fixo ou por cargo
        
        return {
          colaborador_id: colab.id,
          competencia,
          salario_base: salarioBase,
          horas_extras: 0,
          descontos: vt,
          inss,
          irrf,
          fgts,
          vale_transporte: vt,
          vale_refeicao: vr,
          outros_beneficios: 0,
          salario_liquido: salarioBase - inss - irrf - vt,
          status: 'calculado',
        }
      })

      // Inserir folhas
      const { error } = await supabase
        .from('folha_pagamento')
        .upsert(folhas, { onConflict: 'colaborador_id,competencia' })

      if (error) throw error

      return { count: folhas.length }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['folha_pagamento'] })
      toast.success(`Folha calculada para ${data.count} colaboradores!`)
    },
    onError: (error) => {
      toast.error(`Erro ao calcular folha: ${error.message}`)
    },
  })
}

// ============ FUNÇÕES AUXILIARES ============

/**
 * Calcula INSS com base na tabela 2024
 */
function calcularINSS(salario: number): number {
  const faixas = [
    { limite: 1412.00, aliquota: 0.075 },
    { limite: 2666.68, aliquota: 0.09 },
    { limite: 4000.03, aliquota: 0.12 },
    { limite: 7786.02, aliquota: 0.14 },
  ]

  let inss = 0
  let salarioRestante = salario

  for (let i = 0; i < faixas.length; i++) {
    const faixa = faixas[i]
    const faixaAnterior = i > 0 ? faixas[i - 1].limite : 0
    const baseCalculo = Math.min(salarioRestante, faixa.limite - faixaAnterior)

    if (baseCalculo > 0) {
      inss += baseCalculo * faixa.aliquota
      salarioRestante -= baseCalculo
    }

    if (salarioRestante <= 0) break
  }

  return Math.round(inss * 100) / 100
}

/**
 * Calcula IRRF com base na tabela 2024
 */
function calcularIRRF(baseCalculo: number): number {
  const faixas = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
  ]

  for (const faixa of faixas) {
    if (baseCalculo <= faixa.limite) {
      const irrf = baseCalculo * faixa.aliquota - faixa.deducao
      return Math.max(0, Math.round(irrf * 100) / 100)
    }
  }

  return 0
}

// ============ ESTATÍSTICAS ============

/**
 * Hook para estatísticas de RH
 */
export function useRHStats() {
  return useQuery({
    queryKey: ['rh_stats'],
    queryFn: async () => {
      // Buscar colaboradores
      const { data: colaboradores } = await supabase
        .from('colaboradores')
        .select('status, tipo, salario')

      if (!colaboradores) return null

      const ativos = colaboradores.filter(c => c.status === 'ativo')
      const clt = colaboradores.filter(c => c.tipo === 'clt')
      const totalSalarios = ativos.reduce((sum, c) => sum + (c.salario || 0), 0)

      return {
        totalColaboradores: colaboradores.length,
        colaboradoresAtivos: ativos.length,
        colaboradoresCLT: clt.length,
        folhaMensal: totalSalarios,
        turnover: 0, // Calcular baseado em demissões
      }
    },
  })
}

// ============ HOOK AGREGADOR ============

/**
 * Hook agregador para gestão de RH
 * Retorna todos os hooks de RH em um único objeto
 */
export function useRH() {
  const colaboradores = useColaboradores()
  const departamentos = useDepartamentos()
  const prestadoresPJ = usePrestadoresPJ()
  const stats = useRHStats()
  const createColaborador = useCreateColaborador()
  const updateColaborador = useUpdateColaborador()
  const createPrestadorPJ = useCreatePrestadorPJ()
  const calcularFolha = useCalcularFolha()

  return {
    colaboradores,
    departamentos,
    prestadoresPJ,
    stats,
    // Mutations
    createColaborador,
    updateColaborador,
    createPrestadorPJ,
    calcularFolha,
    // Status de carregamento
    isLoading: colaboradores.isLoading || departamentos.isLoading || 
               prestadoresPJ.isLoading || stats.isLoading,
    // Erros
    errors: [
      colaboradores.error,
      departamentos.error,
      prestadoresPJ.error,
      stats.error,
    ].filter(Boolean),
  }
}

// ============ EXPORT DEFAULT ============

export default {
  useColaboradores,
  useColaborador,
  useDepartamentos,
  useFolhaPagamento,
  usePrestadoresPJ,
  useCreateColaborador,
  useUpdateColaborador,
  useCreatePrestadorPJ,
  useCalcularFolha,
  useRHStats,
  useRH,
}

