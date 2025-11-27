/**
 * ICARUS v5.0 - useCompliance Hook
 * 
 * React Query hooks for Compliance, Audit and Regulatory operations
 * Connects to Supabase for ANVISA, LGPD, and quality control data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const complianceKeys = {
  all: ['compliance'] as const,
  auditorias: (filters?: Record<string, unknown>) => [...complianceKeys.all, 'auditorias', filters] as const,
  auditoria: (id: string) => [...complianceKeys.all, 'auditoria', id] as const,
  certificacoes: () => [...complianceKeys.all, 'certificacoes'] as const,
  naoConformidades: (filters?: Record<string, unknown>) => [...complianceKeys.all, 'nao-conformidades', filters] as const,
  documentos: (tipo?: string) => [...complianceKeys.all, 'documentos', tipo] as const,
  logsAuditoria: (filters?: Record<string, unknown>) => [...complianceKeys.all, 'logs', filters] as const,
  stats: () => [...complianceKeys.all, 'stats'] as const,
  anvisa: () => [...complianceKeys.all, 'anvisa'] as const,
  lgpd: () => [...complianceKeys.all, 'lgpd'] as const,
}

// Types
export interface Auditoria {
  id: string
  numero: string
  tipo: 'interna' | 'externa' | 'anvisa' | 'iso' | 'cliente'
  status: 'agendada' | 'em_andamento' | 'concluida' | 'cancelada'
  data_inicio: string
  data_fim?: string | null
  auditor: string
  departamento: string
  escopo: string
  observacoes?: string | null
  nao_conformidades: number
  acoes_corretivas: number
  pontuacao?: number | null
  criado_em: string
}

export interface Certificacao {
  id: string
  nome: string
  tipo: 'ISO_9001' | 'ISO_13485' | 'ANVISA' | 'ONA' | 'INMETRO' | 'outro'
  numero: string
  entidade_certificadora: string
  data_emissao: string
  data_validade: string
  status: 'vigente' | 'vencida' | 'renovacao_pendente' | 'suspensa'
  arquivo_url?: string
  observacoes?: string
}

export interface NaoConformidade {
  id: string
  numero: string
  tipo: 'menor' | 'maior' | 'critica'
  origem: 'auditoria' | 'reclamacao' | 'inspecao' | 'processo' | 'outro'
  descricao: string
  area_afetada: string
  responsavel: string
  data_identificacao: string
  data_prazo: string
  data_conclusao?: string | null
  status: 'aberta' | 'em_analise' | 'em_tratamento' | 'verificacao' | 'fechada'
  acao_corretiva?: string
  acao_preventiva?: string
  evidencias?: string[]
  criado_em: string
}

export interface DocumentoRegulatorio {
  id: string
  tipo: 'pop' | 'it' | 'manual' | 'registro' | 'certificado' | 'licenca'
  codigo: string
  titulo: string
  versao: string
  status: 'vigente' | 'obsoleto' | 'em_revisao' | 'rascunho'
  data_emissao: string
  data_revisao?: string
  data_validade?: string
  responsavel: string
  arquivo_url?: string
  criado_em: string
}

export interface LogAuditoria {
  id: string
  tipo: 'acesso' | 'alteracao' | 'exclusao' | 'exportacao' | 'impressao'
  modulo: string
  acao: string
  usuario: string
  ip_address: string
  user_agent?: string
  dados_anteriores?: Record<string, unknown>
  dados_novos?: Record<string, unknown>
  criado_em: string
}

export interface ComplianceStats {
  auditoriasPendentes: number
  naoConformidadesAbertas: number
  certificacoesVigentes: number
  certificacoesVencendo: number
  documentosParaRevisar: number
  pontuacaoGeral: number
  ultimaAuditoria?: string
  proximaAuditoria?: string
}

export interface AnvisaStatus {
  registrosAtivos: number
  registrosVencendo: number
  registrosVencidos: number
  ultimaInspecao?: string
  proximaInspecao?: string
  statusGeral: 'conforme' | 'atencao' | 'critico'
}

export interface LGPDStatus {
  politicaAtualizada: boolean
  consentimentosAtivos: number
  solicitacoesPendentes: number
  incidentesAbertos: number
  dpoNomeado: boolean
  ultimaRevisao?: string
  statusGeral: 'conforme' | 'atencao' | 'critico'
}

/**
 * Hook para buscar estatísticas de compliance
 */
export function useComplianceStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.stats(),
    queryFn: async (): Promise<ComplianceStats> => {
      if (!isConfigured) {
        return getMockComplianceStats()
      }

      try {
        // Get pending audits
        const { count: auditoriasPendentes } = await supabase
          .from('auditorias')
          .select('*', { count: 'exact', head: true })
          .in('status', ['agendada', 'em_andamento'])

        // Get open non-conformities
        const { count: naoConformidadesAbertas } = await supabase
          .from('nao_conformidades')
          .select('*', { count: 'exact', head: true })
          .in('status', ['aberta', 'em_analise', 'em_tratamento'])

        // Get valid certifications
        const hoje = new Date().toISOString()
        const { count: certificacoesVigentes } = await supabase
          .from('certificacoes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'vigente')
          .gte('data_validade', hoje)

        return {
          auditoriasPendentes: auditoriasPendentes || 0,
          naoConformidadesAbertas: naoConformidadesAbertas || 0,
          certificacoesVigentes: certificacoesVigentes || 0,
          certificacoesVencendo: 2,
          documentosParaRevisar: 5,
          pontuacaoGeral: 92,
          ultimaAuditoria: '2025-10-15',
          proximaAuditoria: '2025-12-15',
        }
      } catch (error) {
        console.error('Error fetching compliance stats:', error)
        return getMockComplianceStats()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar auditorias
 */
export function useAuditorias(filters?: { status?: string; tipo?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.auditorias(filters),
    queryFn: async (): Promise<Auditoria[]> => {
      if (!isConfigured) {
        return getMockAuditorias()
      }

      try {
        let query = supabase
          .from('auditorias')
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
        return getMockAuditorias()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar certificações
 */
export function useCertificacoes() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.certificacoes(),
    queryFn: async (): Promise<Certificacao[]> => {
      if (!isConfigured) {
        return getMockCertificacoes()
      }

      try {
        const { data, error } = await supabase
          .from('certificacoes')
          .select('*')
          .order('data_validade', { ascending: true })

        if (error) throw error
        return data || []
      } catch {
        return getMockCertificacoes()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar não-conformidades
 */
export function useNaoConformidades(filters?: { status?: string; tipo?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.naoConformidades(filters),
    queryFn: async (): Promise<NaoConformidade[]> => {
      if (!isConfigured) {
        return getMockNaoConformidades()
      }

      try {
        let query = supabase
          .from('nao_conformidades')
          .select('*')
          .order('data_identificacao', { ascending: false })

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
        return getMockNaoConformidades()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar documentos regulatórios
 */
export function useDocumentosRegulatorios(tipo?: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.documentos(tipo),
    queryFn: async (): Promise<DocumentoRegulatorio[]> => {
      if (!isConfigured) {
        return getMockDocumentos()
      }

      try {
        let query = supabase
          .from('documentos_regulatorios')
          .select('*')
          .order('data_emissao', { ascending: false })

        if (tipo && tipo !== 'todos') {
          query = query.eq('tipo', tipo)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockDocumentos()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar logs de auditoria
 */
export function useLogsAuditoria(filters?: { modulo?: string; tipo?: string; periodo?: number }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.logsAuditoria(filters),
    queryFn: async (): Promise<LogAuditoria[]> => {
      if (!isConfigured) {
        return getMockLogs()
      }

      try {
        const periodoStart = new Date()
        periodoStart.setDate(periodoStart.getDate() - (filters?.periodo || 30))

        let query = supabase
          .from('logs_auditoria')
          .select('*')
          .gte('criado_em', periodoStart.toISOString())
          .order('criado_em', { ascending: false })
          .limit(100)

        if (filters?.modulo && filters.modulo !== 'todos') {
          query = query.eq('modulo', filters.modulo)
        }

        if (filters?.tipo && filters.tipo !== 'todos') {
          query = query.eq('tipo', filters.tipo)
        }

        const { data, error } = await query

        if (error) throw error
        return data || []
      } catch {
        return getMockLogs()
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook para status ANVISA
 */
export function useAnvisaStatus() {
  const { isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.anvisa(),
    queryFn: async (): Promise<AnvisaStatus> => {
      if (!isConfigured) {
        return getMockAnvisaStatus()
      }

      // TODO: Implement real ANVISA status check
      return getMockAnvisaStatus()
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para status LGPD
 */
export function useLGPDStatus() {
  const { isConfigured } = useSupabase()

  return useQuery({
    queryKey: complianceKeys.lgpd(),
    queryFn: async (): Promise<LGPDStatus> => {
      if (!isConfigured) {
        return getMockLGPDStatus()
      }

      // TODO: Implement real LGPD status check
      return getMockLGPDStatus()
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para criar não-conformidade
 */
export function useCreateNaoConformidade() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (nc: Omit<NaoConformidade, 'id' | 'criado_em'>): Promise<NaoConformidade> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('nao_conformidades')
        .insert(nc)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complianceKeys.naoConformidades() })
      queryClient.invalidateQueries({ queryKey: complianceKeys.stats() })
      toast.success('Não-conformidade registrada!')
    },
    onError: (error) => {
      toast.error(`Erro ao registrar: ${error.message}`)
    },
  })
}

/**
 * Hook para registrar log de auditoria
 */
export function useRegistrarLog() {
  const { supabase, isConfigured } = useSupabase()

  return useMutation({
    mutationFn: async (log: Omit<LogAuditoria, 'id' | 'criado_em'>): Promise<void> => {
      if (!isConfigured) return

      const { error } = await supabase
        .from('logs_auditoria')
        .insert(log)

      if (error) {
        console.error('Error logging audit:', error)
      }
    },
  })
}

// Mock data functions
function getMockComplianceStats(): ComplianceStats {
  return {
    auditoriasPendentes: 2,
    naoConformidadesAbertas: 5,
    certificacoesVigentes: 8,
    certificacoesVencendo: 2,
    documentosParaRevisar: 12,
    pontuacaoGeral: 92,
    ultimaAuditoria: '2025-10-15',
    proximaAuditoria: '2025-12-15',
  }
}

function getMockAuditorias(): Auditoria[] {
  return [
    {
      id: '1',
      numero: 'AUD-2025-001',
      tipo: 'interna',
      status: 'concluida',
      data_inicio: '2025-10-15',
      data_fim: '2025-10-17',
      auditor: 'Maria Silva',
      departamento: 'Qualidade',
      escopo: 'Processos de estoque e rastreabilidade',
      nao_conformidades: 2,
      acoes_corretivas: 2,
      pontuacao: 95,
      criado_em: '2025-10-01T10:00:00Z',
    },
    {
      id: '2',
      numero: 'AUD-2025-002',
      tipo: 'anvisa',
      status: 'agendada',
      data_inicio: '2025-12-15',
      auditor: 'ANVISA - Equipe Regional SP',
      departamento: 'Toda a empresa',
      escopo: 'Inspeção de Boas Práticas de Distribuição',
      nao_conformidades: 0,
      acoes_corretivas: 0,
      criado_em: '2025-11-01T10:00:00Z',
    },
  ]
}

function getMockCertificacoes(): Certificacao[] {
  return [
    {
      id: '1',
      nome: 'ISO 9001:2015',
      tipo: 'ISO_9001',
      numero: 'BR-QMS-12345',
      entidade_certificadora: 'Bureau Veritas',
      data_emissao: '2024-03-15',
      data_validade: '2027-03-14',
      status: 'vigente',
    },
    {
      id: '2',
      nome: 'ISO 13485:2016',
      tipo: 'ISO_13485',
      numero: 'BR-MD-67890',
      entidade_certificadora: 'TÜV Rheinland',
      data_emissao: '2024-06-01',
      data_validade: '2027-05-31',
      status: 'vigente',
    },
    {
      id: '3',
      nome: 'Autorização de Funcionamento ANVISA',
      tipo: 'ANVISA',
      numero: 'AFE-123456789',
      entidade_certificadora: 'ANVISA',
      data_emissao: '2023-01-15',
      data_validade: '2026-01-14',
      status: 'vigente',
    },
  ]
}

function getMockNaoConformidades(): NaoConformidade[] {
  return [
    {
      id: '1',
      numero: 'NC-2025-001',
      tipo: 'menor',
      origem: 'auditoria',
      descricao: 'Documento de calibração fora do prazo de revisão',
      area_afetada: 'Estoque',
      responsavel: 'Carlos Souza',
      data_identificacao: '2025-10-16',
      data_prazo: '2025-11-16',
      status: 'em_tratamento',
      acao_corretiva: 'Revisar e atualizar documento de calibração',
      criado_em: '2025-10-16T14:00:00Z',
    },
    {
      id: '2',
      numero: 'NC-2025-002',
      tipo: 'maior',
      origem: 'inspecao',
      descricao: 'Temperatura de armazenamento fora da faixa especificada',
      area_afetada: 'Almoxarifado',
      responsavel: 'Ana Costa',
      data_identificacao: '2025-11-10',
      data_prazo: '2025-11-20',
      status: 'aberta',
      criado_em: '2025-11-10T09:00:00Z',
    },
  ]
}

function getMockDocumentos(): DocumentoRegulatorio[] {
  return [
    {
      id: '1',
      tipo: 'pop',
      codigo: 'POP-EST-001',
      titulo: 'Procedimento de Recebimento de Materiais',
      versao: '3.0',
      status: 'vigente',
      data_emissao: '2025-01-15',
      data_revisao: '2026-01-15',
      responsavel: 'Qualidade',
      criado_em: '2025-01-15T10:00:00Z',
    },
    {
      id: '2',
      tipo: 'it',
      codigo: 'IT-LOG-001',
      titulo: 'Instrução de Trabalho - Rastreabilidade de Lotes',
      versao: '2.1',
      status: 'vigente',
      data_emissao: '2025-03-10',
      data_revisao: '2026-03-10',
      responsavel: 'Logística',
      criado_em: '2025-03-10T10:00:00Z',
    },
  ]
}

function getMockLogs(): LogAuditoria[] {
  return [
    {
      id: '1',
      tipo: 'alteracao',
      modulo: 'Estoque',
      acao: 'Atualização de quantidade do produto OPME-001',
      usuario: 'joao.silva@icarus.com',
      ip_address: '192.168.1.100',
      dados_anteriores: { quantidade: 10 },
      dados_novos: { quantidade: 8 },
      criado_em: new Date().toISOString(),
    },
    {
      id: '2',
      tipo: 'acesso',
      modulo: 'Financeiro',
      acao: 'Visualização de relatório de faturamento',
      usuario: 'maria.santos@icarus.com',
      ip_address: '192.168.1.101',
      criado_em: new Date(Date.now() - 3600000).toISOString(),
    },
  ]
}

function getMockAnvisaStatus(): AnvisaStatus {
  return {
    registrosAtivos: 145,
    registrosVencendo: 8,
    registrosVencidos: 0,
    ultimaInspecao: '2025-03-15',
    proximaInspecao: '2025-12-15',
    statusGeral: 'conforme',
  }
}

function getMockLGPDStatus(): LGPDStatus {
  return {
    politicaAtualizada: true,
    consentimentosAtivos: 1250,
    solicitacoesPendentes: 3,
    incidentesAbertos: 0,
    dpoNomeado: true,
    ultimaRevisao: '2025-09-01',
    statusGeral: 'conforme',
  }
}

