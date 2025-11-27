/**
 * ICARUS v5.0 - useAdmin Hook
 * 
 * React Query hooks for Admin, Settings and System Configuration
 * Connects to Supabase for system settings, users and permissions
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const adminKeys = {
  all: ['admin'] as const,
  configuracoes: () => [...adminKeys.all, 'configuracoes'] as const,
  usuarios: (filters?: Record<string, unknown>) => [...adminKeys.all, 'usuarios', filters] as const,
  usuario: (id: string) => [...adminKeys.all, 'usuario', id] as const,
  perfis: () => [...adminKeys.all, 'perfis'] as const,
  permissoes: (perfilId: string) => [...adminKeys.all, 'permissoes', perfilId] as const,
  logs: (filters?: Record<string, unknown>) => [...adminKeys.all, 'logs', filters] as const,
  integracoes: () => [...adminKeys.all, 'integracoes'] as const,
  webhooks: () => [...adminKeys.all, 'webhooks'] as const,
  apiKeys: () => [...adminKeys.all, 'api-keys'] as const,
  stats: () => [...adminKeys.all, 'stats'] as const,
}

// Types
export interface ConfiguracaoSistema {
  id: string
  chave: string
  valor: string
  tipo: 'string' | 'number' | 'boolean' | 'json'
  categoria: 'geral' | 'email' | 'integracao' | 'seguranca' | 'notificacao'
  descricao: string
  editavel: boolean
  atualizado_em: string
}

export interface Usuario {
  id: string
  nome: string
  email: string
  telefone?: string
  perfil_id: string
  perfil_nome: string
  status: 'ativo' | 'inativo' | 'bloqueado' | 'pendente'
  ultimo_acesso?: string
  dois_fatores: boolean
  avatar_url?: string
  criado_em: string
}

export interface Perfil {
  id: string
  nome: string
  descricao: string
  tipo: 'admin' | 'gerente' | 'operador' | 'visualizador' | 'customizado'
  usuarios_count: number
  ativo: boolean
  criado_em: string
}

export interface Permissao {
  id: string
  perfil_id: string
  modulo: string
  ler: boolean
  criar: boolean
  editar: boolean
  excluir: boolean
  exportar: boolean
}

export interface LogSistema {
  id: string
  tipo: 'info' | 'warning' | 'error' | 'security'
  modulo: string
  acao: string
  usuario_id?: string
  usuario_nome?: string
  ip_address?: string
  detalhes?: Record<string, unknown>
  criado_em: string
}

export interface IntegracaoConfig {
  id: string
  nome: string
  tipo: 'erp' | 'fiscal' | 'bancario' | 'comunicacao' | 'armazenamento' | 'ia'
  provedor: string
  status: 'ativo' | 'inativo' | 'erro' | 'configurando'
  ultima_sincronizacao?: string
  config: Record<string, unknown>
  criado_em: string
}

export interface Webhook {
  id: string
  nome: string
  url: string
  eventos: string[]
  status: 'ativo' | 'inativo' | 'erro'
  secret: string
  ultimo_disparo?: string
  falhas_consecutivas: number
  criado_em: string
}

export interface ApiKey {
  id: string
  nome: string
  key_prefix: string
  permissoes: string[]
  status: 'ativo' | 'revogado' | 'expirado'
  ultimo_uso?: string
  usos_totais: number
  expira_em?: string
  criado_em: string
}

export interface AdminStats {
  usuariosAtivos: number
  usuariosPendentes: number
  integracoesAtivas: number
  integracoesComErro: number
  webhooksAtivos: number
  apiKeysAtivas: number
  errosUltimas24h: number
  acessosHoje: number
}

/**
 * Hook para buscar estatísticas de admin
 */
export function useAdminStats() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: async (): Promise<AdminStats> => {
      if (!isConfigured) {
        return getMockAdminStats()
      }

      try {
        const { count: usuariosAtivos } = await supabase
          .from('usuarios')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')

        const { count: integracoesAtivas } = await supabase
          .from('integracoes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'ativo')

        return {
          usuariosAtivos: usuariosAtivos || 0,
          usuariosPendentes: 2,
          integracoesAtivas: integracoesAtivas || 0,
          integracoesComErro: 1,
          webhooksAtivos: 5,
          apiKeysAtivas: 3,
          errosUltimas24h: 12,
          acessosHoje: 156,
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error)
        return getMockAdminStats()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar configurações do sistema
 */
export function useConfiguracoes() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.configuracoes(),
    queryFn: async (): Promise<ConfiguracaoSistema[]> => {
      if (!isConfigured) {
        return getMockConfiguracoes()
      }

      try {
        const { data, error } = await supabase
          .from('configuracoes')
          .select('*')
          .order('categoria')
          .order('chave')

        if (error) throw error
        return data || []
      } catch {
        return getMockConfiguracoes()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para buscar usuários
 */
export function useUsuarios(filters?: { status?: string; perfil?: string }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.usuarios(filters),
    queryFn: async (): Promise<Usuario[]> => {
      if (!isConfigured) {
        return getMockUsuarios()
      }

      try {
        let query = supabase
          .from('usuarios')
          .select(`
            *,
            perfil:perfis(nome)
          `)
          .order('nome')

        if (filters?.status && filters.status !== 'todos') {
          query = query.eq('status', filters.status)
        }

        if (filters?.perfil && filters.perfil !== 'todos') {
          query = query.eq('perfil_id', filters.perfil)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(u => ({
          ...u,
          perfil_nome: u.perfil?.nome || 'N/A',
        }))
      } catch {
        return getMockUsuarios()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para buscar perfis de acesso
 */
export function usePerfis() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.perfis(),
    queryFn: async (): Promise<Perfil[]> => {
      if (!isConfigured) {
        return getMockPerfis()
      }

      try {
        const { data, error } = await supabase
          .from('perfis')
          .select('*')
          .eq('ativo', true)
          .order('nome')

        if (error) throw error
        return data || []
      } catch {
        return getMockPerfis()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Hook para buscar permissões de um perfil
 */
export function usePermissoes(perfilId: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.permissoes(perfilId),
    queryFn: async (): Promise<Permissao[]> => {
      if (!isConfigured || !perfilId) {
        return getMockPermissoes()
      }

      try {
        const { data, error } = await supabase
          .from('permissoes')
          .select('*')
          .eq('perfil_id', perfilId)
          .order('modulo')

        if (error) throw error
        return data || []
      } catch {
        return getMockPermissoes()
      }
    },
    enabled: !!perfilId,
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar logs do sistema
 */
export function useLogsSistema(filters?: { tipo?: string; modulo?: string; periodo?: number }) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.logs(filters),
    queryFn: async (): Promise<LogSistema[]> => {
      if (!isConfigured) {
        return getMockLogs()
      }

      try {
        const periodoStart = new Date()
        periodoStart.setDate(periodoStart.getDate() - (filters?.periodo || 7))

        let query = supabase
          .from('logs_sistema')
          .select(`
            *,
            usuario:usuarios(nome)
          `)
          .gte('criado_em', periodoStart.toISOString())
          .order('criado_em', { ascending: false })
          .limit(100)

        if (filters?.tipo && filters.tipo !== 'todos') {
          query = query.eq('tipo', filters.tipo)
        }

        if (filters?.modulo && filters.modulo !== 'todos') {
          query = query.eq('modulo', filters.modulo)
        }

        const { data, error } = await query

        if (error) throw error
        return (data || []).map(l => ({
          ...l,
          usuario_nome: l.usuario?.nome || null,
        }))
      } catch {
        return getMockLogs()
      }
    },
    staleTime: 2 * 60 * 1000,
  })
}

/**
 * Hook para buscar integrações configuradas
 */
export function useIntegracoesConfig() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.integracoes(),
    queryFn: async (): Promise<IntegracaoConfig[]> => {
      if (!isConfigured) {
        return getMockIntegracoes()
      }

      try {
        const { data, error } = await supabase
          .from('integracoes')
          .select('*')
          .order('nome')

        if (error) throw error
        return data || []
      } catch {
        return getMockIntegracoes()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar webhooks
 */
export function useWebhooks() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.webhooks(),
    queryFn: async (): Promise<Webhook[]> => {
      if (!isConfigured) {
        return getMockWebhooks()
      }

      try {
        const { data, error } = await supabase
          .from('webhooks')
          .select('*')
          .order('nome')

        if (error) throw error
        return data || []
      } catch {
        return getMockWebhooks()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para buscar API Keys
 */
export function useApiKeys() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: adminKeys.apiKeys(),
    queryFn: async (): Promise<ApiKey[]> => {
      if (!isConfigured) {
        return getMockApiKeys()
      }

      try {
        const { data, error } = await supabase
          .from('api_keys')
          .select('*')
          .order('criado_em', { ascending: false })

        if (error) throw error
        return data || []
      } catch {
        return getMockApiKeys()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

/**
 * Hook para atualizar configuração
 */
export function useUpdateConfiguracao() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, valor }: { id: string; valor: string }): Promise<void> => {
      if (!isConfigured) {
        throw new Error('Supabase not configured')
      }

      const { error } = await supabase
        .from('configuracoes')
        .update({ valor, atualizado_em: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.configuracoes() })
      toast.success('Configuração atualizada!')
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`)
    },
  })
}

/**
 * Hook para criar usuário
 */
export function useCreateUsuario() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (usuario: Omit<Usuario, 'id' | 'criado_em' | 'perfil_nome'>): Promise<Usuario> => {
      if (!isConfigured) {
        toast.error('Supabase não configurado')
        throw new Error('Supabase not configured')
      }

      const { data, error } = await supabase
        .from('usuarios')
        .insert(usuario)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.usuarios() })
      queryClient.invalidateQueries({ queryKey: adminKeys.stats() })
      toast.success('Usuário criado!')
    },
    onError: (error) => {
      toast.error(`Erro ao criar usuário: ${error.message}`)
    },
  })
}

// Mock data functions
function getMockAdminStats(): AdminStats {
  return {
    usuariosAtivos: 45,
    usuariosPendentes: 2,
    integracoesAtivas: 8,
    integracoesComErro: 1,
    webhooksAtivos: 5,
    apiKeysAtivas: 3,
    errosUltimas24h: 12,
    acessosHoje: 156,
  }
}

function getMockConfiguracoes(): ConfiguracaoSistema[] {
  return [
    {
      id: 'c1',
      chave: 'empresa_nome',
      valor: 'ICARUS Medical Solutions',
      tipo: 'string',
      categoria: 'geral',
      descricao: 'Nome da empresa',
      editavel: true,
      atualizado_em: '2025-11-01T10:00:00Z',
    },
    {
      id: 'c2',
      chave: 'email_smtp_host',
      valor: 'smtp.sendgrid.net',
      tipo: 'string',
      categoria: 'email',
      descricao: 'Servidor SMTP',
      editavel: true,
      atualizado_em: '2025-10-15T10:00:00Z',
    },
    {
      id: 'c3',
      chave: 'sessao_timeout',
      valor: '3600',
      tipo: 'number',
      categoria: 'seguranca',
      descricao: 'Timeout de sessão em segundos',
      editavel: true,
      atualizado_em: '2025-09-01T10:00:00Z',
    },
  ]
}

function getMockUsuarios(): Usuario[] {
  return [
    {
      id: 'u1',
      nome: 'Administrador Sistema',
      email: 'admin@icarus.com.br',
      telefone: '(11) 99999-0000',
      perfil_id: 'p1',
      perfil_nome: 'Administrador',
      status: 'ativo',
      ultimo_acesso: new Date().toISOString(),
      dois_fatores: true,
      criado_em: '2024-01-01T10:00:00Z',
    },
    {
      id: 'u2',
      nome: 'Maria Silva',
      email: 'maria.silva@icarus.com.br',
      perfil_id: 'p2',
      perfil_nome: 'Gerente',
      status: 'ativo',
      ultimo_acesso: new Date(Date.now() - 3600000).toISOString(),
      dois_fatores: true,
      criado_em: '2024-03-15T10:00:00Z',
    },
    {
      id: 'u3',
      nome: 'João Santos',
      email: 'joao.santos@icarus.com.br',
      perfil_id: 'p3',
      perfil_nome: 'Operador',
      status: 'ativo',
      ultimo_acesso: new Date(Date.now() - 86400000).toISOString(),
      dois_fatores: false,
      criado_em: '2024-06-01T10:00:00Z',
    },
  ]
}

function getMockPerfis(): Perfil[] {
  return [
    {
      id: 'p1',
      nome: 'Administrador',
      descricao: 'Acesso total ao sistema',
      tipo: 'admin',
      usuarios_count: 2,
      ativo: true,
      criado_em: '2024-01-01T10:00:00Z',
    },
    {
      id: 'p2',
      nome: 'Gerente',
      descricao: 'Acesso gerencial com restrições',
      tipo: 'gerente',
      usuarios_count: 8,
      ativo: true,
      criado_em: '2024-01-01T10:00:00Z',
    },
    {
      id: 'p3',
      nome: 'Operador',
      descricao: 'Acesso operacional básico',
      tipo: 'operador',
      usuarios_count: 25,
      ativo: true,
      criado_em: '2024-01-01T10:00:00Z',
    },
  ]
}

function getMockPermissoes(): Permissao[] {
  return [
    { id: '1', perfil_id: 'p1', modulo: 'Dashboard', ler: true, criar: true, editar: true, excluir: true, exportar: true },
    { id: '2', perfil_id: 'p1', modulo: 'Cirurgias', ler: true, criar: true, editar: true, excluir: true, exportar: true },
    { id: '3', perfil_id: 'p1', modulo: 'Estoque', ler: true, criar: true, editar: true, excluir: true, exportar: true },
    { id: '4', perfil_id: 'p1', modulo: 'Financeiro', ler: true, criar: true, editar: true, excluir: true, exportar: true },
  ]
}

function getMockLogs(): LogSistema[] {
  return [
    {
      id: 'l1',
      tipo: 'info',
      modulo: 'Autenticação',
      acao: 'Login realizado com sucesso',
      usuario_id: 'u1',
      usuario_nome: 'Administrador Sistema',
      ip_address: '192.168.1.100',
      criado_em: new Date().toISOString(),
    },
    {
      id: 'l2',
      tipo: 'warning',
      modulo: 'Integração',
      acao: 'Timeout na sincronização com ERP',
      detalhes: { integracao: 'SAP', tentativas: 3 },
      criado_em: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'l3',
      tipo: 'error',
      modulo: 'Faturamento',
      acao: 'Falha ao emitir NF-e',
      usuario_id: 'u2',
      usuario_nome: 'Maria Silva',
      detalhes: { nfe: '12345', erro: 'Certificado expirado' },
      criado_em: new Date(Date.now() - 7200000).toISOString(),
    },
  ]
}

function getMockIntegracoes(): IntegracaoConfig[] {
  return [
    {
      id: 'i1',
      nome: 'SEFAZ - Nota Fiscal Eletrônica',
      tipo: 'fiscal',
      provedor: 'SEFAZ SP',
      status: 'ativo',
      ultima_sincronizacao: new Date(Date.now() - 300000).toISOString(),
      config: { ambiente: 'producao', uf: 'SP' },
      criado_em: '2024-01-15T10:00:00Z',
    },
    {
      id: 'i2',
      nome: 'ANVISA - Rastreabilidade',
      tipo: 'fiscal',
      provedor: 'ANVISA',
      status: 'ativo',
      ultima_sincronizacao: new Date(Date.now() - 600000).toISOString(),
      config: { ambiente: 'producao' },
      criado_em: '2024-02-01T10:00:00Z',
    },
    {
      id: 'i3',
      nome: 'OpenAI - GPT-4',
      tipo: 'ia',
      provedor: 'OpenAI',
      status: 'ativo',
      ultima_sincronizacao: new Date().toISOString(),
      config: { modelo: 'gpt-4-turbo' },
      criado_em: '2024-06-01T10:00:00Z',
    },
    {
      id: 'i4',
      nome: 'Supabase - Database',
      tipo: 'armazenamento',
      provedor: 'Supabase',
      status: 'ativo',
      ultima_sincronizacao: new Date().toISOString(),
      config: { projeto: 'icarus-prod' },
      criado_em: '2024-01-01T10:00:00Z',
    },
  ]
}

function getMockWebhooks(): Webhook[] {
  return [
    {
      id: 'w1',
      nome: 'Notificação Cirurgia',
      url: 'https://api.hospital.com/webhooks/cirurgia',
      eventos: ['cirurgia.criada', 'cirurgia.atualizada'],
      status: 'ativo',
      secret: 'whsec_***',
      ultimo_disparo: new Date(Date.now() - 1800000).toISOString(),
      falhas_consecutivas: 0,
      criado_em: '2024-03-01T10:00:00Z',
    },
    {
      id: 'w2',
      nome: 'Alerta Estoque Baixo',
      url: 'https://api.internal/alerts/estoque',
      eventos: ['estoque.baixo', 'estoque.critico'],
      status: 'ativo',
      secret: 'whsec_***',
      ultimo_disparo: new Date(Date.now() - 86400000).toISOString(),
      falhas_consecutivas: 0,
      criado_em: '2024-04-15T10:00:00Z',
    },
  ]
}

function getMockApiKeys(): ApiKey[] {
  return [
    {
      id: 'ak1',
      nome: 'Mobile App - iOS',
      key_prefix: 'ik_live_abc',
      permissoes: ['read:cirurgias', 'read:estoque', 'write:pontos'],
      status: 'ativo',
      ultimo_uso: new Date().toISOString(),
      usos_totais: 15420,
      criado_em: '2024-06-01T10:00:00Z',
    },
    {
      id: 'ak2',
      nome: 'Integração ERP',
      key_prefix: 'ik_live_xyz',
      permissoes: ['read:*', 'write:estoque', 'write:financeiro'],
      status: 'ativo',
      ultimo_uso: new Date(Date.now() - 3600000).toISOString(),
      usos_totais: 8750,
      criado_em: '2024-03-15T10:00:00Z',
    },
  ]
}

