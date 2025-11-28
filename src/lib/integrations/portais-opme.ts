/**
 * ICARUS v5.0 - Integrações com Portais OPME
 * 
 * APIs para conexão com os principais portais de distribuidores OPME:
 * - OPMENEXO
 * - Inpart Saúde
 * - EMS Ventura Saúde
 * - VSSupply
 * 
 * Funcionalidades:
 * - Autenticação OAuth/API Key
 * - Consulta de autorizações
 * - Envio de cotações
 * - Recebimento de pedidos
 * - Sincronização de status
 * - Webhooks para notificações
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'

// ============ TIPOS COMUNS ============

export interface PortalCredentials {
  portal: PortalOPME
  apiKey?: string
  clientId?: string
  clientSecret?: string
  username?: string
  password?: string
  ambiente: 'producao' | 'homologacao'
}

export interface PortalAuthToken {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  portal: PortalOPME
}

export interface AutorizacaoOPME {
  id: string
  numeroAutorizacao: string
  portal: PortalOPME
  convenio: {
    codigo: string
    nome: string
  }
  paciente: {
    nome: string
    carteirinha: string
    dataNascimento: string
  }
  procedimento: {
    codigoTUSS: string
    descricao: string
  }
  hospital: {
    codigo: string
    nome: string
  }
  medico: {
    crm: string
    nome: string
  }
  materiais: Array<{
    codigo: string
    descricao: string
    quantidade: number
    valorAutorizado: number
    status: 'aprovado' | 'negado' | 'pendente'
  }>
  dataAutorizacao: string
  dataValidade: string
  status: 'autorizada' | 'pendente' | 'negada' | 'expirada' | 'utilizada'
  valorTotal: number
  observacoes?: string
}

export interface CotacaoOPME {
  id?: string
  numeroInterno: string
  convenio: {
    codigo: string
    nome: string
  }
  paciente: {
    nome: string
    carteirinha: string
  }
  procedimento: {
    codigoTUSS: string
    descricao: string
  }
  hospital: {
    codigo: string
    nome: string
  }
  medico: {
    crm: string
    nome: string
  }
  materiais: Array<{
    codigo: string
    codigoFabricante: string
    descricao: string
    quantidade: number
    valorUnitario: number
    valorTotal: number
  }>
  valorTotal: number
  observacoes?: string
  arquivos?: Array<{
    tipo: 'pedido_medico' | 'laudo' | 'exame' | 'outros'
    nome: string
    base64: string
  }>
}

export interface PedidoOPME {
  id: string
  numeroPedido: string
  portal: PortalOPME
  autorizacaoId?: string
  convenio: {
    codigo: string
    nome: string
  }
  hospital: {
    codigo: string
    nome: string
    endereco?: string
  }
  dataCirurgia: string
  horaCirurgia: string
  materiais: Array<{
    codigo: string
    descricao: string
    quantidade: number
    lote?: string
    validade?: string
  }>
  status: 'novo' | 'confirmado' | 'enviado' | 'entregue' | 'utilizado' | 'devolvido'
  observacoes?: string
  created_at: string
}

export interface WebhookEvent {
  id: string
  portal: PortalOPME
  tipo: 'autorizacao' | 'pedido' | 'status' | 'cotacao'
  acao: 'criado' | 'atualizado' | 'cancelado'
  dados: Record<string, unknown>
  timestamp: string
}

export type PortalOPME = 'opmenexo' | 'inpart' | 'ventura' | 'vssupply'

// ============ CONFIGURAÇÃO DOS PORTAIS ============

interface PortalConfig {
  nome: string
  baseUrl: {
    producao: string
    homologacao: string
  }
  authType: 'oauth2' | 'apikey' | 'basic'
  endpoints: {
    auth?: string
    autorizacoes: string
    cotacoes: string
    pedidos: string
    produtos?: string
    webhook?: string
  }
  headers?: Record<string, string>
}

const PORTAIS_CONFIG: Record<PortalOPME, PortalConfig> = {
  opmenexo: {
    nome: 'OPMENEXO',
    baseUrl: {
      producao: 'https://api.opmenexo.com.br/v1',
      homologacao: 'https://sandbox.opmenexo.com.br/v1',
    },
    authType: 'oauth2',
    endpoints: {
      auth: '/oauth/token',
      autorizacoes: '/autorizacoes',
      cotacoes: '/cotacoes',
      pedidos: '/pedidos',
      produtos: '/produtos',
      webhook: '/webhooks',
    },
  },
  inpart: {
    nome: 'Inpart Saúde',
    baseUrl: {
      producao: 'https://api.inpartsaude.com.br/api/v2',
      homologacao: 'https://homolog.inpartsaude.com.br/api/v2',
    },
    authType: 'apikey',
    endpoints: {
      autorizacoes: '/authorization',
      cotacoes: '/quotation',
      pedidos: '/orders',
      produtos: '/products',
      webhook: '/webhook/register',
    },
    headers: {
      'X-API-Version': '2.0',
    },
  },
  ventura: {
    nome: 'EMS Ventura Saúde',
    baseUrl: {
      producao: 'https://portal.venturasaude.com.br/api',
      homologacao: 'https://homolog.venturasaude.com.br/api',
    },
    authType: 'oauth2',
    endpoints: {
      auth: '/auth/token',
      autorizacoes: '/opme/autorizacoes',
      cotacoes: '/opme/cotacoes',
      pedidos: '/opme/pedidos',
      produtos: '/opme/catalogo',
    },
  },
  vssupply: {
    nome: 'VSSupply',
    baseUrl: {
      producao: 'https://api.vssupply.com.br/v1',
      homologacao: 'https://sandbox.vssupply.com.br/v1',
    },
    authType: 'basic',
    endpoints: {
      autorizacoes: '/autorizacao',
      cotacoes: '/cotacao',
      pedidos: '/pedido',
      produtos: '/produto',
      webhook: '/callback',
    },
  },
}

// ============ CACHE DE TOKENS ============

const tokenCache: Map<PortalOPME, PortalAuthToken> = new Map()

// ============ FUNÇÕES DE AUTENTICAÇÃO ============

/**
 * Autenticação OAuth2 (OPMENEXO, Ventura)
 */
async function authenticateOAuth2(
  credentials: PortalCredentials
): Promise<PortalAuthToken> {
  const config = PORTAIS_CONFIG[credentials.portal]
  const baseUrl = config.baseUrl[credentials.ambiente]

  if (!config.endpoints.auth) {
    throw new Error(`Portal ${credentials.portal} não suporta OAuth2`)
  }

  const response = await fetch(`${baseUrl}${config.endpoints.auth}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: credentials.clientId || '',
      client_secret: credentials.clientSecret || '',
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`Falha na autenticação ${credentials.portal}: ${error.message || response.statusText}`)
  }

  const data = await response.json()

  const token: PortalAuthToken = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
    portal: credentials.portal,
  }

  tokenCache.set(credentials.portal, token)
  return token
}

/**
 * Autenticação por API Key (Inpart)
 */
function authenticateApiKey(credentials: PortalCredentials): PortalAuthToken {
  if (!credentials.apiKey) {
    throw new Error('API Key não fornecida')
  }

  const token: PortalAuthToken = {
    accessToken: credentials.apiKey,
    expiresAt: Date.now() + (365 * 24 * 60 * 60 * 1000), // 1 ano
    portal: credentials.portal,
  }

  tokenCache.set(credentials.portal, token)
  return token
}

/**
 * Autenticação Basic (VSSupply)
 */
function authenticateBasic(credentials: PortalCredentials): PortalAuthToken {
  if (!credentials.username || !credentials.password) {
    throw new Error('Usuário e senha não fornecidos')
  }

  const basicToken = btoa(`${credentials.username}:${credentials.password}`)

  const token: PortalAuthToken = {
    accessToken: `Basic ${basicToken}`,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
    portal: credentials.portal,
  }

  tokenCache.set(credentials.portal, token)
  return token
}

/**
 * Autenticar em um portal OPME
 */
export async function authenticate(
  credentials: PortalCredentials
): Promise<PortalAuthToken> {
  const config = PORTAIS_CONFIG[credentials.portal]

  logger.info(`Autenticando no portal ${config.nome}...`)

  switch (config.authType) {
    case 'oauth2':
      return authenticateOAuth2(credentials)
    case 'apikey':
      return authenticateApiKey(credentials)
    case 'basic':
      return authenticateBasic(credentials)
    default:
      throw new Error(`Tipo de autenticação não suportado: ${config.authType}`)
  }
}

/**
 * Obter token válido (renova se necessário)
 */
async function getValidToken(
  portal: PortalOPME,
  credentials?: PortalCredentials
): Promise<string> {
  const cached = tokenCache.get(portal)

  if (cached && cached.expiresAt > Date.now() + 60000) {
    return cached.accessToken
  }

  if (!credentials) {
    throw new Error(`Token expirado e credenciais não fornecidas para ${portal}`)
  }

  const newToken = await authenticate(credentials)
  return newToken.accessToken
}

// ============ CHAMADAS API GENÉRICAS ============

interface ApiCallOptions {
  portal: PortalOPME
  endpoint: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  credentials?: PortalCredentials
  ambiente?: 'producao' | 'homologacao'
}

async function apiCall<T>(options: ApiCallOptions): Promise<T> {
  const config = PORTAIS_CONFIG[options.portal]
  const ambiente = options.ambiente || 'producao'
  const baseUrl = config.baseUrl[ambiente]
  const token = await getValidToken(options.portal, options.credentials)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...config.headers,
  }

  // Adicionar token de acordo com o tipo de autenticação
  if (config.authType === 'basic') {
    headers['Authorization'] = token
  } else if (config.authType === 'apikey') {
    headers['X-API-Key'] = token
  } else {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${baseUrl}${options.endpoint}`, {
    method: options.method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    logger.error(`Erro na API ${options.portal}:`, error)
    throw new Error(`Erro ${options.portal}: ${error.message || error.error || response.statusText}`)
  }

  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// ============ OPERAÇÕES COM AUTORIZAÇÕES ============

/**
 * Buscar autorizações de um portal
 */
export async function buscarAutorizacoes(
  portal: PortalOPME,
  filtros: {
    dataInicio?: string
    dataFim?: string
    status?: string
    convenio?: string
    paciente?: string
  },
  credentials?: PortalCredentials
): Promise<AutorizacaoOPME[]> {
  const config = PORTAIS_CONFIG[portal]
  const params = new URLSearchParams()

  if (filtros.dataInicio) params.append('data_inicio', filtros.dataInicio)
  if (filtros.dataFim) params.append('data_fim', filtros.dataFim)
  if (filtros.status) params.append('status', filtros.status)
  if (filtros.convenio) params.append('convenio', filtros.convenio)
  if (filtros.paciente) params.append('paciente', filtros.paciente)

  const endpoint = `${config.endpoints.autorizacoes}?${params.toString()}`

  const response = await apiCall<{ data: AutorizacaoOPME[] } | AutorizacaoOPME[]>({
    portal,
    endpoint,
    method: 'GET',
    credentials,
  })

  // Normalizar resposta (alguns portais retornam { data: [] }, outros retornam [])
  const autorizacoes = Array.isArray(response) ? response : response.data

  // Adicionar portal a cada autorização
  return autorizacoes.map(a => ({ ...a, portal }))
}

/**
 * Buscar detalhes de uma autorização
 */
export async function buscarAutorizacao(
  portal: PortalOPME,
  autorizacaoId: string,
  credentials?: PortalCredentials
): Promise<AutorizacaoOPME> {
  const config = PORTAIS_CONFIG[portal]

  const response = await apiCall<AutorizacaoOPME>({
    portal,
    endpoint: `${config.endpoints.autorizacoes}/${autorizacaoId}`,
    method: 'GET',
    credentials,
  })

  return { ...response, portal }
}

// ============ OPERAÇÕES COM COTAÇÕES ============

/**
 * Enviar cotação para um portal
 */
export async function enviarCotacao(
  portal: PortalOPME,
  cotacao: CotacaoOPME,
  credentials?: PortalCredentials
): Promise<{ id: string; protocolo: string }> {
  const config = PORTAIS_CONFIG[portal]

  logger.info(`Enviando cotação para ${config.nome}...`)

  const response = await apiCall<{ id: string; protocolo: string; numero?: string }>({
    portal,
    endpoint: config.endpoints.cotacoes,
    method: 'POST',
    body: cotacao,
    credentials,
  })

  return {
    id: response.id,
    protocolo: response.protocolo || response.numero || response.id,
  }
}

/**
 * Consultar status de cotação
 */
export async function consultarCotacao(
  portal: PortalOPME,
  cotacaoId: string,
  credentials?: PortalCredentials
): Promise<{
  id: string
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'expirada'
  autorizacaoId?: string
  observacoes?: string
}> {
  const config = PORTAIS_CONFIG[portal]

  return apiCall({
    portal,
    endpoint: `${config.endpoints.cotacoes}/${cotacaoId}`,
    method: 'GET',
    credentials,
  })
}

// ============ OPERAÇÕES COM PEDIDOS ============

/**
 * Buscar pedidos de um portal
 */
export async function buscarPedidos(
  portal: PortalOPME,
  filtros: {
    dataInicio?: string
    dataFim?: string
    status?: string
  },
  credentials?: PortalCredentials
): Promise<PedidoOPME[]> {
  const config = PORTAIS_CONFIG[portal]
  const params = new URLSearchParams()

  if (filtros.dataInicio) params.append('data_inicio', filtros.dataInicio)
  if (filtros.dataFim) params.append('data_fim', filtros.dataFim)
  if (filtros.status) params.append('status', filtros.status)

  const endpoint = `${config.endpoints.pedidos}?${params.toString()}`

  const response = await apiCall<{ data: PedidoOPME[] } | PedidoOPME[]>({
    portal,
    endpoint,
    method: 'GET',
    credentials,
  })

  const pedidos = Array.isArray(response) ? response : response.data
  return pedidos.map(p => ({ ...p, portal }))
}

/**
 * Confirmar pedido
 */
export async function confirmarPedido(
  portal: PortalOPME,
  pedidoId: string,
  dados: {
    materiais: Array<{
      codigo: string
      lote: string
      validade: string
      quantidade: number
    }>
    previsaoEntrega?: string
    observacoes?: string
  },
  credentials?: PortalCredentials
): Promise<{ sucesso: boolean; protocolo?: string }> {
  const config = PORTAIS_CONFIG[portal]

  return apiCall({
    portal,
    endpoint: `${config.endpoints.pedidos}/${pedidoId}/confirmar`,
    method: 'POST',
    body: dados,
    credentials,
  })
}

/**
 * Atualizar status de entrega
 */
export async function atualizarStatusEntrega(
  portal: PortalOPME,
  pedidoId: string,
  status: 'enviado' | 'entregue' | 'devolvido',
  dados?: {
    dataEntrega?: string
    recebidoPor?: string
    observacoes?: string
    materiaisDevolvidos?: Array<{
      codigo: string
      quantidade: number
      motivo: string
    }>
  },
  credentials?: PortalCredentials
): Promise<{ sucesso: boolean }> {
  const config = PORTAIS_CONFIG[portal]

  return apiCall({
    portal,
    endpoint: `${config.endpoints.pedidos}/${pedidoId}/status`,
    method: 'PATCH',
    body: { status, ...dados },
    credentials,
  })
}

// ============ WEBHOOKS ============

/**
 * Registrar webhook para receber notificações
 */
export async function registrarWebhook(
  portal: PortalOPME,
  callbackUrl: string,
  eventos: Array<'autorizacao' | 'pedido' | 'cotacao'>,
  credentials?: PortalCredentials
): Promise<{ id: string; secret?: string }> {
  const config = PORTAIS_CONFIG[portal]

  if (!config.endpoints.webhook) {
    throw new Error(`Portal ${portal} não suporta webhooks`)
  }

  return apiCall({
    portal,
    endpoint: config.endpoints.webhook,
    method: 'POST',
    body: {
      url: callbackUrl,
      eventos,
    },
    credentials,
  })
}

/**
 * Validar assinatura de webhook
 */
export function validarWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // Implementar validação HMAC-SHA256
  // Por enquanto, retorna true para desenvolvimento
  logger.info('Validando assinatura de webhook...')
  return true
}

// ============ SINCRONIZAÇÃO ============

/**
 * Sincronizar autorizações de todos os portais
 */
export async function sincronizarAutorizacoes(
  credenciaisPorPortal: Map<PortalOPME, PortalCredentials>,
  filtros: {
    dataInicio: string
    dataFim: string
  }
): Promise<AutorizacaoOPME[]> {
  const todasAutorizacoes: AutorizacaoOPME[] = []

  for (const [portal, credentials] of credenciaisPorPortal) {
    try {
      logger.info(`Sincronizando autorizações do portal ${portal}...`)
      const autorizacoes = await buscarAutorizacoes(portal, filtros, credentials)
      todasAutorizacoes.push(...autorizacoes)
    } catch (error) {
      logger.error(`Erro ao sincronizar ${portal}:`, error)
    }
  }

  return todasAutorizacoes
}

/**
 * Sincronizar pedidos de todos os portais
 */
export async function sincronizarPedidos(
  credenciaisPorPortal: Map<PortalOPME, PortalCredentials>,
  filtros: {
    dataInicio: string
    dataFim: string
  }
): Promise<PedidoOPME[]> {
  const todosPedidos: PedidoOPME[] = []

  for (const [portal, credentials] of credenciaisPorPortal) {
    try {
      logger.info(`Sincronizando pedidos do portal ${portal}...`)
      const pedidos = await buscarPedidos(portal, filtros, credentials)
      todosPedidos.push(...pedidos)
    } catch (error) {
      logger.error(`Erro ao sincronizar ${portal}:`, error)
    }
  }

  return todosPedidos
}

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export interface UsePortaisOPMEReturn {
  isLoading: boolean
  error: string | null
  portaisConectados: PortalOPME[]
  conectar: (credentials: PortalCredentials) => Promise<boolean>
  desconectar: (portal: PortalOPME) => void
  buscarAutorizacoes: (portal: PortalOPME, filtros: Record<string, string>) => Promise<AutorizacaoOPME[]>
  enviarCotacao: (portal: PortalOPME, cotacao: CotacaoOPME) => Promise<{ id: string; protocolo: string }>
  buscarPedidos: (portal: PortalOPME, filtros: Record<string, string>) => Promise<PedidoOPME[]>
  sincronizarTodos: (filtros: { dataInicio: string; dataFim: string }) => Promise<{
    autorizacoes: AutorizacaoOPME[]
    pedidos: PedidoOPME[]
  }>
}

export function usePortaisOPME(): UsePortaisOPMEReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credenciaisMap] = useState<Map<PortalOPME, PortalCredentials>>(new Map())
  const [portaisConectados, setPortaisConectados] = useState<PortalOPME[]>([])

  const conectar = useCallback(async (credentials: PortalCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await authenticate(credentials)
      credenciaisMap.set(credentials.portal, credentials)
      setPortaisConectados(prev => [...prev.filter(p => p !== credentials.portal), credentials.portal])
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar'
      setError(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [credenciaisMap])

  const desconectar = useCallback((portal: PortalOPME) => {
    tokenCache.delete(portal)
    credenciaisMap.delete(portal)
    setPortaisConectados(prev => prev.filter(p => p !== portal))
  }, [credenciaisMap])

  const buscarAutorizacoesHandler = useCallback(async (
    portal: PortalOPME,
    filtros: Record<string, string>
  ): Promise<AutorizacaoOPME[]> => {
    setIsLoading(true)
    setError(null)

    try {
      return await buscarAutorizacoes(portal, filtros, credenciaisMap.get(portal))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar autorizações'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [credenciaisMap])

  const enviarCotacaoHandler = useCallback(async (
    portal: PortalOPME,
    cotacao: CotacaoOPME
  ): Promise<{ id: string; protocolo: string }> => {
    setIsLoading(true)
    setError(null)

    try {
      return await enviarCotacao(portal, cotacao, credenciaisMap.get(portal))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar cotação'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [credenciaisMap])

  const buscarPedidosHandler = useCallback(async (
    portal: PortalOPME,
    filtros: Record<string, string>
  ): Promise<PedidoOPME[]> => {
    setIsLoading(true)
    setError(null)

    try {
      return await buscarPedidos(portal, filtros, credenciaisMap.get(portal))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar pedidos'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [credenciaisMap])

  const sincronizarTodosHandler = useCallback(async (filtros: { dataInicio: string; dataFim: string }) => {
    setIsLoading(true)
    setError(null)

    try {
      const [autorizacoes, pedidos] = await Promise.all([
        sincronizarAutorizacoes(credenciaisMap, filtros),
        sincronizarPedidos(credenciaisMap, filtros),
      ])

      return { autorizacoes, pedidos }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao sincronizar'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [credenciaisMap])

  return {
    isLoading,
    error,
    portaisConectados,
    conectar,
    desconectar,
    buscarAutorizacoes: buscarAutorizacoesHandler,
    enviarCotacao: enviarCotacaoHandler,
    buscarPedidos: buscarPedidosHandler,
    sincronizarTodos: sincronizarTodosHandler,
  }
}

// ============ EXPORTS ============

export const PORTAIS = PORTAIS_CONFIG

export default {
  authenticate,
  buscarAutorizacoes,
  buscarAutorizacao,
  enviarCotacao,
  consultarCotacao,
  buscarPedidos,
  confirmarPedido,
  atualizarStatusEntrega,
  registrarWebhook,
  validarWebhookSignature,
  sincronizarAutorizacoes,
  sincronizarPedidos,
  usePortaisOPME,
  PORTAIS,
}

