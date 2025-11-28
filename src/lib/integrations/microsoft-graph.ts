/**
 * ICARUS v5.0 - Microsoft Graph API Integration
 * 
 * Integração com Microsoft Graph API para sincronização
 * de calendário de cirurgias com Outlook em tempo real.
 * 
 * Funcionalidades:
 * - Autenticação OAuth 2.0 com Azure AD
 * - Criar/atualizar/excluir eventos no Outlook
 * - Webhooks para notificações em tempo real
 * - Sincronização bidirecional
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'

// ============ TIPOS ============

export interface MicrosoftGraphConfig {
  clientId: string
  tenantId: string
  redirectUri: string
  scopes: string[]
}

export interface OutlookEvent {
  id?: string
  subject: string
  body: {
    contentType: 'HTML' | 'Text'
    content: string
  }
  start: {
    dateTime: string
    timeZone: string
  }
  end: {
    dateTime: string
    timeZone: string
  }
  location?: {
    displayName: string
    address?: {
      street?: string
      city?: string
      state?: string
      postalCode?: string
    }
  }
  attendees?: Array<{
    emailAddress: {
      address: string
      name: string
    }
    type: 'required' | 'optional' | 'resource'
  }>
  categories?: string[]
  importance?: 'low' | 'normal' | 'high'
  sensitivity?: 'normal' | 'personal' | 'private' | 'confidential'
  showAs?: 'free' | 'tentative' | 'busy' | 'oof' | 'workingElsewhere' | 'unknown'
  isReminderOn?: boolean
  reminderMinutesBeforeStart?: number
  extensions?: Record<string, unknown>
}

export interface GraphSubscription {
  id: string
  resource: string
  changeType: string
  clientState: string
  notificationUrl: string
  expirationDateTime: string
}

export interface CirurgiaParaEvento {
  id: string
  numero: string
  paciente: string
  medico: {
    nome: string
    email?: string
  }
  hospital: {
    nome: string
    endereco?: string
  }
  procedimento: string
  dataAgendada: string
  horaInicio: string
  horaFim?: string
  materiais: string[]
  observacoes?: string
  responsaveis: Array<{
    nome: string
    email: string
    tipo: 'medico' | 'logistica' | 'comercial'
  }>
}

// ============ CONFIGURAÇÃO ============

const GRAPH_API_BASE = 'https://graph.microsoft.com/v1.0'
const GRAPH_API_BETA = 'https://graph.microsoft.com/beta'

const DEFAULT_CONFIG: MicrosoftGraphConfig = {
  clientId: import.meta.env.VITE_AZURE_CLIENT_ID || '',
  tenantId: import.meta.env.VITE_AZURE_TENANT_ID || '',
  redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scopes: [
    'User.Read',
    'Calendars.ReadWrite',
    'Calendars.ReadWrite.Shared',
    'Mail.Send',
  ],
}

// ============ TOKEN MANAGEMENT ============

interface TokenCache {
  accessToken: string
  refreshToken: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

/**
 * Obtém URL de autorização OAuth 2.0
 */
export function getAuthorizationUrl(config: MicrosoftGraphConfig = DEFAULT_CONFIG): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_mode: 'query',
    state: crypto.randomUUID(),
  })

  return `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/authorize?${params.toString()}`
}

/**
 * Troca código de autorização por tokens
 */
export async function exchangeCodeForTokens(
  code: string,
  config: MicrosoftGraphConfig = DEFAULT_CONFIG
): Promise<TokenCache> {
  const response = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        scope: config.scopes.join(' '),
        code,
        redirect_uri: config.redirectUri,
        grant_type: 'authorization_code',
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Token exchange failed: ${error.error_description || error.error}`)
  }

  const data = await response.json()
  
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  }

  // Salvar no localStorage para persistência
  localStorage.setItem('ms_graph_tokens', JSON.stringify(tokenCache))

  return tokenCache
}

/**
 * Renova access token usando refresh token
 */
export async function refreshAccessToken(
  config: MicrosoftGraphConfig = DEFAULT_CONFIG
): Promise<string> {
  // Tentar carregar do cache
  if (!tokenCache) {
    const stored = localStorage.getItem('ms_graph_tokens')
    if (stored) {
      tokenCache = JSON.parse(stored)
    }
  }

  if (!tokenCache?.refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(
    `https://login.microsoftonline.com/${config.tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        scope: config.scopes.join(' '),
        refresh_token: tokenCache.refreshToken,
        grant_type: 'refresh_token',
      }),
    }
  )

  if (!response.ok) {
    // Token inválido, limpar cache
    tokenCache = null
    localStorage.removeItem('ms_graph_tokens')
    throw new Error('Token refresh failed')
  }

  const data = await response.json()
  
  tokenCache = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || tokenCache.refreshToken,
    expiresAt: Date.now() + (data.expires_in * 1000),
  }

  localStorage.setItem('ms_graph_tokens', JSON.stringify(tokenCache))

  return tokenCache.accessToken
}

/**
 * Obtém access token válido (renova se necessário)
 */
export async function getAccessToken(): Promise<string> {
  // Carregar do cache
  if (!tokenCache) {
    const stored = localStorage.getItem('ms_graph_tokens')
    if (stored) {
      tokenCache = JSON.parse(stored)
    }
  }

  if (!tokenCache) {
    throw new Error('Not authenticated with Microsoft Graph')
  }

  // Verificar se expirou (com margem de 5 minutos)
  if (tokenCache.expiresAt < Date.now() + 300000) {
    return refreshAccessToken()
  }

  return tokenCache.accessToken
}

/**
 * Verifica se está autenticado
 */
export function isAuthenticated(): boolean {
  if (!tokenCache) {
    const stored = localStorage.getItem('ms_graph_tokens')
    if (stored) {
      tokenCache = JSON.parse(stored)
    }
  }
  return !!tokenCache?.accessToken
}

/**
 * Logout - limpa tokens
 */
export function logout(): void {
  tokenCache = null
  localStorage.removeItem('ms_graph_tokens')
}

// ============ GRAPH API CALLS ============

/**
 * Chamada genérica à Graph API
 */
async function graphApiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  useBeta = false
): Promise<T> {
  const token = await getAccessToken()
  const baseUrl = useBeta ? GRAPH_API_BETA : GRAPH_API_BASE

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    logger.error('Graph API error:', error)
    throw new Error(error.error?.message || 'Graph API call failed')
  }

  // Algumas chamadas retornam 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  return response.json()
}

// ============ CALENDAR OPERATIONS ============

/**
 * Lista eventos do calendário
 */
export async function listCalendarEvents(
  startDateTime: string,
  endDateTime: string,
  calendarId = 'me'
): Promise<OutlookEvent[]> {
  const params = new URLSearchParams({
    startDateTime,
    endDateTime,
    $orderby: 'start/dateTime',
    $top: '100',
  })

  const result = await graphApiCall<{ value: OutlookEvent[] }>(
    `/${calendarId}/calendar/calendarView?${params.toString()}`
  )

  return result.value
}

/**
 * Cria evento no calendário
 */
export async function createCalendarEvent(
  event: OutlookEvent,
  calendarId = 'me'
): Promise<OutlookEvent> {
  return graphApiCall<OutlookEvent>(
    `/${calendarId}/calendar/events`,
    {
      method: 'POST',
      body: JSON.stringify(event),
    }
  )
}

/**
 * Atualiza evento no calendário
 */
export async function updateCalendarEvent(
  eventId: string,
  event: Partial<OutlookEvent>,
  calendarId = 'me'
): Promise<OutlookEvent> {
  return graphApiCall<OutlookEvent>(
    `/${calendarId}/calendar/events/${eventId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(event),
    }
  )
}

/**
 * Exclui evento do calendário
 */
export async function deleteCalendarEvent(
  eventId: string,
  calendarId = 'me'
): Promise<void> {
  await graphApiCall<void>(
    `/${calendarId}/calendar/events/${eventId}`,
    {
      method: 'DELETE',
    }
  )
}

// ============ CIRURGIA → EVENTO ============

/**
 * Converte cirurgia para evento do Outlook
 */
export function cirurgiaToOutlookEvent(cirurgia: CirurgiaParaEvento): OutlookEvent {
  // Calcular hora de fim (se não fornecida, assumir 2 horas)
  const horaFim = cirurgia.horaFim || (() => {
    const [h, m] = cirurgia.horaInicio.split(':').map(Number)
    const endHour = h + 2
    return `${endHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  })()

  // Montar corpo do evento com detalhes da cirurgia
  const bodyContent = `
    <h2>Cirurgia #${cirurgia.numero}</h2>
    <p><strong>Paciente:</strong> ${cirurgia.paciente}</p>
    <p><strong>Procedimento:</strong> ${cirurgia.procedimento}</p>
    <p><strong>Médico:</strong> ${cirurgia.medico.nome}</p>
    <p><strong>Hospital:</strong> ${cirurgia.hospital.nome}</p>
    ${cirurgia.hospital.endereco ? `<p><strong>Endereço:</strong> ${cirurgia.hospital.endereco}</p>` : ''}
    
    <h3>Materiais OPME</h3>
    <ul>
      ${cirurgia.materiais.map(m => `<li>${m}</li>`).join('')}
    </ul>
    
    ${cirurgia.observacoes ? `<h3>Observações</h3><p>${cirurgia.observacoes}</p>` : ''}
    
    <hr>
    <p><em>Evento gerado automaticamente pelo ICARUS ERP</em></p>
  `

  // Montar lista de participantes
  const attendees = cirurgia.responsaveis.map(r => ({
    emailAddress: {
      address: r.email,
      name: r.nome,
    },
    type: 'required' as const,
  }))

  // Adicionar médico se tiver email
  if (cirurgia.medico.email) {
    attendees.push({
      emailAddress: {
        address: cirurgia.medico.email,
        name: cirurgia.medico.nome,
      },
      type: 'required' as const,
    })
  }

  return {
    subject: `[CIRURGIA] ${cirurgia.procedimento} - ${cirurgia.paciente}`,
    body: {
      contentType: 'HTML',
      content: bodyContent,
    },
    start: {
      dateTime: `${cirurgia.dataAgendada}T${cirurgia.horaInicio}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: `${cirurgia.dataAgendada}T${horaFim}:00`,
      timeZone: 'America/Sao_Paulo',
    },
    location: {
      displayName: cirurgia.hospital.nome,
      address: cirurgia.hospital.endereco ? {
        street: cirurgia.hospital.endereco,
      } : undefined,
    },
    attendees,
    categories: ['Cirurgia', 'OPME'],
    importance: 'high',
    showAs: 'busy',
    isReminderOn: true,
    reminderMinutesBeforeStart: 60 * 24, // 1 dia antes
    extensions: {
      icarus_cirurgia_id: cirurgia.id,
      icarus_numero: cirurgia.numero,
    },
  }
}

/**
 * Sincroniza cirurgia com Outlook
 */
export async function syncCirurgiaToOutlook(
  cirurgia: CirurgiaParaEvento,
  existingEventId?: string
): Promise<OutlookEvent> {
  const event = cirurgiaToOutlookEvent(cirurgia)

  if (existingEventId) {
    logger.info(`Atualizando evento ${existingEventId} no Outlook`)
    return updateCalendarEvent(existingEventId, event)
  } else {
    logger.info(`Criando novo evento no Outlook para cirurgia ${cirurgia.numero}`)
    return createCalendarEvent(event)
  }
}

// ============ WEBHOOKS / SUBSCRIPTIONS ============

/**
 * Cria subscription para notificações de calendário
 */
export async function createCalendarSubscription(
  notificationUrl: string,
  expirationMinutes = 4230 // Máximo ~3 dias
): Promise<GraphSubscription> {
  const expirationDateTime = new Date(
    Date.now() + expirationMinutes * 60 * 1000
  ).toISOString()

  return graphApiCall<GraphSubscription>(
    '/subscriptions',
    {
      method: 'POST',
      body: JSON.stringify({
        changeType: 'created,updated,deleted',
        notificationUrl,
        resource: '/me/events',
        expirationDateTime,
        clientState: crypto.randomUUID(),
      }),
    }
  )
}

/**
 * Renova subscription existente
 */
export async function renewSubscription(
  subscriptionId: string,
  expirationMinutes = 4230
): Promise<GraphSubscription> {
  const expirationDateTime = new Date(
    Date.now() + expirationMinutes * 60 * 1000
  ).toISOString()

  return graphApiCall<GraphSubscription>(
    `/subscriptions/${subscriptionId}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        expirationDateTime,
      }),
    }
  )
}

/**
 * Exclui subscription
 */
export async function deleteSubscription(subscriptionId: string): Promise<void> {
  await graphApiCall<void>(
    `/subscriptions/${subscriptionId}`,
    {
      method: 'DELETE',
    }
  )
}

// ============ HOOK REACT ============

import { useState, useEffect, useCallback } from 'react'

export interface UseMicrosoftGraphReturn {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: () => void
  logout: () => void
  createEvent: (cirurgia: CirurgiaParaEvento) => Promise<OutlookEvent>
  updateEvent: (eventId: string, cirurgia: CirurgiaParaEvento) => Promise<OutlookEvent>
  deleteEvent: (eventId: string) => Promise<void>
  listEvents: (startDate: string, endDate: string) => Promise<OutlookEvent[]>
}

export function useMicrosoftGraph(): UseMicrosoftGraphReturn {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Verificar autenticação ao montar
  useEffect(() => {
    setAuthenticated(isAuthenticated())
  }, [])

  // Processar callback de autenticação
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    
    if (code) {
      setIsLoading(true)
      exchangeCodeForTokens(code)
        .then(() => {
          setAuthenticated(true)
          // Limpar URL
          window.history.replaceState({}, document.title, window.location.pathname)
        })
        .catch((err) => {
          setError(err.message)
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [])

  const login = useCallback(() => {
    window.location.href = getAuthorizationUrl()
  }, [])

  const handleLogout = useCallback(() => {
    logout()
    setAuthenticated(false)
  }, [])

  const createEvent = useCallback(async (cirurgia: CirurgiaParaEvento) => {
    setIsLoading(true)
    setError(null)
    try {
      return await syncCirurgiaToOutlook(cirurgia)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar evento'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateEvent = useCallback(async (eventId: string, cirurgia: CirurgiaParaEvento) => {
    setIsLoading(true)
    setError(null)
    try {
      return await syncCirurgiaToOutlook(cirurgia, eventId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar evento'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteEventHandler = useCallback(async (eventId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await deleteCalendarEvent(eventId)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao excluir evento'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const listEvents = useCallback(async (startDate: string, endDate: string) => {
    setIsLoading(true)
    setError(null)
    try {
      return await listCalendarEvents(startDate, endDate)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao listar eventos'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isAuthenticated: authenticated,
    isLoading,
    error,
    login,
    logout: handleLogout,
    createEvent,
    updateEvent,
    deleteEvent: deleteEventHandler,
    listEvents,
  }
}

export default {
  getAuthorizationUrl,
  exchangeCodeForTokens,
  refreshAccessToken,
  getAccessToken,
  isAuthenticated,
  logout,
  listCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  cirurgiaToOutlookEvent,
  syncCirurgiaToOutlook,
  createCalendarSubscription,
  renewSubscription,
  deleteSubscription,
  useMicrosoftGraph,
}

