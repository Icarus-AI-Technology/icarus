/**
 * ICARUS v5.0 - Human-in-the-Loop (HITL) System
 * 
 * Sistema para intervenção humana em decisões críticas de IA.
 * Implementa workflow de aprovação para ações de alto risco.
 * 
 * Casos de uso:
 * - Aprovação de alterações em dados regulatórios
 * - Validação de previsões de alto impacto
 * - Confirmação de ações automáticas críticas
 * - Revisão de detecção de fraudes
 * - Liberação de pedidos acima de threshold
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'
import { supabase } from '@/lib/config/supabase-client'

// ============ TIPOS ============

export type HITLDecisionType = 
  | 'regulatory_change'
  | 'high_value_order'
  | 'fraud_detection'
  | 'stock_adjustment'
  | 'ai_prediction'
  | 'compliance_alert'
  | 'financial_approval'
  | 'contract_modification'

export type HITLStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'escalated'
  | 'expired'
  | 'auto_approved'

export type HITLPriority = 'low' | 'medium' | 'high' | 'critical'

export interface HITLRequest {
  id: string
  type: HITLDecisionType
  title: string
  description: string
  priority: HITLPriority
  status: HITLStatus
  requestedBy: string
  requestedAt: string
  expiresAt?: string
  context: HITLContext
  aiRecommendation?: AIRecommendation
  decision?: HITLDecision
  metadata?: Record<string, unknown>
}

export interface HITLContext {
  module: string
  entityId?: string
  entityType?: string
  originalData?: Record<string, unknown>
  proposedData?: Record<string, unknown>
  impactAssessment?: ImpactAssessment
  relatedDocuments?: string[]
}

export interface AIRecommendation {
  action: 'approve' | 'reject' | 'review'
  confidence: number
  reasoning: string
  riskScore: number
  factors: string[]
}

export interface ImpactAssessment {
  financialImpact?: number
  complianceRisk?: 'low' | 'medium' | 'high'
  operationalImpact?: string
  affectedEntities?: number
}

export interface HITLDecision {
  status: 'approved' | 'rejected'
  decidedBy: string
  decidedAt: string
  comments?: string
  conditions?: string[]
  auditTrail: AuditEntry[]
}

export interface AuditEntry {
  timestamp: string
  action: string
  userId: string
  details?: string
}

export interface HITLConfig {
  autoApproveThreshold?: number  // Confiança mínima para auto-aprovação
  expirationHours?: number       // Horas até expirar
  escalationHours?: number       // Horas até escalar
  notifyChannels?: string[]      // Canais de notificação
  requireMFA?: boolean           // Requer MFA para aprovar
}

export interface HITLStats {
  pending: number
  approved: number
  rejected: number
  escalated: number
  avgDecisionTime: number
  approvalRate: number
}

// ============ CONFIGURAÇÃO ============

const DEFAULT_CONFIG: HITLConfig = {
  autoApproveThreshold: 0.95,   // 95% confiança para auto-aprovação
  expirationHours: 24,          // 24 horas para expirar
  escalationHours: 4,           // 4 horas para escalar
  notifyChannels: ['email', 'push'],
  requireMFA: true,
}

// Thresholds por tipo de decisão
const DECISION_THRESHOLDS: Record<HITLDecisionType, { minConfidence: number; requireApproval: boolean }> = {
  regulatory_change: { minConfidence: 0.99, requireApproval: true },
  high_value_order: { minConfidence: 0.90, requireApproval: true },
  fraud_detection: { minConfidence: 0.85, requireApproval: true },
  stock_adjustment: { minConfidence: 0.92, requireApproval: false },
  ai_prediction: { minConfidence: 0.88, requireApproval: false },
  compliance_alert: { minConfidence: 0.95, requireApproval: true },
  financial_approval: { minConfidence: 0.90, requireApproval: true },
  contract_modification: { minConfidence: 0.95, requireApproval: true },
}

// ============ CLASSE PRINCIPAL ============

class HITLManager {
  private config: HITLConfig
  private pendingRequests: Map<string, HITLRequest> = new Map()

  constructor(config: HITLConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  /**
   * Cria uma nova solicitação HITL
   */
  async createRequest(
    type: HITLDecisionType,
    title: string,
    description: string,
    context: HITLContext,
    aiRecommendation?: AIRecommendation,
    priority: HITLPriority = 'medium'
  ): Promise<HITLRequest> {
    const id = crypto.randomUUID()
    const now = new Date()
    
    const request: HITLRequest = {
      id,
      type,
      title,
      description,
      priority,
      status: 'pending',
      requestedBy: 'system',
      requestedAt: now.toISOString(),
      expiresAt: this.config.expirationHours 
        ? new Date(now.getTime() + this.config.expirationHours * 60 * 60 * 1000).toISOString()
        : undefined,
      context,
      aiRecommendation,
    }

    // Verificar se pode auto-aprovar
    if (await this.canAutoApprove(request)) {
      request.status = 'auto_approved'
      request.decision = {
        status: 'approved',
        decidedBy: 'system',
        decidedAt: now.toISOString(),
        comments: 'Auto-aprovado com base na confiança da IA',
        auditTrail: [{
          timestamp: now.toISOString(),
          action: 'auto_approved',
          userId: 'system',
          details: `Confiança: ${aiRecommendation?.confidence ?? 0}`,
        }],
      }
      logger.info('HITL request auto-approved', { id, type, confidence: aiRecommendation?.confidence })
    } else {
      // Salvar como pendente
      this.pendingRequests.set(id, request)
      
      // Notificar aprovadores
      await this.notifyApprovers(request)
      
      logger.info('HITL request created', { id, type, priority })
    }

    // Persistir no banco
    await this.persistRequest(request)

    return request
  }

  /**
   * Verifica se pode auto-aprovar
   */
  private async canAutoApprove(request: HITLRequest): Promise<boolean> {
    const threshold = DECISION_THRESHOLDS[request.type]
    
    // Se requer aprovação obrigatória, não auto-aprovar
    if (threshold.requireApproval) {
      return false
    }

    // Verificar confiança da IA
    if (!request.aiRecommendation) {
      return false
    }

    const confidence = request.aiRecommendation.confidence
    const minConfidence = Math.max(
      threshold.minConfidence,
      this.config.autoApproveThreshold ?? 0.95
    )

    // Verificar se a recomendação é aprovar
    if (request.aiRecommendation.action !== 'approve') {
      return false
    }

    // Verificar score de risco
    if (request.aiRecommendation.riskScore > 0.3) {
      return false
    }

    return confidence >= minConfidence
  }

  /**
   * Aprova uma solicitação
   */
  async approve(
    requestId: string,
    userId: string,
    comments?: string,
    conditions?: string[]
  ): Promise<HITLRequest> {
    const request = await this.getRequest(requestId)
    
    if (!request) {
      throw new Error(`HITL request not found: ${requestId}`)
    }

    if (request.status !== 'pending' && request.status !== 'escalated') {
      throw new Error(`Cannot approve request with status: ${request.status}`)
    }

    const now = new Date().toISOString()
    
    request.status = 'approved'
    request.decision = {
      status: 'approved',
      decidedBy: userId,
      decidedAt: now,
      comments,
      conditions,
      auditTrail: [
        ...(request.decision?.auditTrail ?? []),
        {
          timestamp: now,
          action: 'approved',
          userId,
          details: comments,
        },
      ],
    }

    this.pendingRequests.delete(requestId)
    await this.persistRequest(request)

    logger.info('HITL request approved', { id: requestId, userId })

    // Executar ação aprovada
    await this.executeApprovedAction(request)

    return request
  }

  /**
   * Rejeita uma solicitação
   */
  async reject(
    requestId: string,
    userId: string,
    reason: string
  ): Promise<HITLRequest> {
    const request = await this.getRequest(requestId)
    
    if (!request) {
      throw new Error(`HITL request not found: ${requestId}`)
    }

    if (request.status !== 'pending' && request.status !== 'escalated') {
      throw new Error(`Cannot reject request with status: ${request.status}`)
    }

    const now = new Date().toISOString()
    
    request.status = 'rejected'
    request.decision = {
      status: 'rejected',
      decidedBy: userId,
      decidedAt: now,
      comments: reason,
      auditTrail: [
        ...(request.decision?.auditTrail ?? []),
        {
          timestamp: now,
          action: 'rejected',
          userId,
          details: reason,
        },
      ],
    }

    this.pendingRequests.delete(requestId)
    await this.persistRequest(request)

    logger.info('HITL request rejected', { id: requestId, userId, reason })

    return request
  }

  /**
   * Escala uma solicitação
   */
  async escalate(
    requestId: string,
    userId: string,
    reason: string
  ): Promise<HITLRequest> {
    const request = await this.getRequest(requestId)
    
    if (!request) {
      throw new Error(`HITL request not found: ${requestId}`)
    }

    const now = new Date().toISOString()
    
    request.status = 'escalated'
    request.priority = 'critical'
    
    if (!request.decision) {
      request.decision = {
        status: 'approved', // Placeholder
        decidedBy: '',
        decidedAt: '',
        auditTrail: [],
      }
    }
    
    request.decision.auditTrail.push({
      timestamp: now,
      action: 'escalated',
      userId,
      details: reason,
    })

    await this.persistRequest(request)

    // Notificar gestores
    await this.notifyEscalation(request, reason)

    logger.warn('HITL request escalated', { id: requestId, userId, reason })

    return request
  }

  /**
   * Obtém uma solicitação
   */
  async getRequest(requestId: string): Promise<HITLRequest | null> {
    // Verificar cache local
    const cached = this.pendingRequests.get(requestId)
    if (cached) {
      return cached
    }

    // Buscar no banco
    const { data, error } = await supabase
      .from('hitl_requests')
      .select('*')
      .eq('id', requestId)
      .single()

    if (error || !data) {
      return null
    }

    return data as HITLRequest
  }

  /**
   * Lista solicitações pendentes
   */
  async getPendingRequests(
    type?: HITLDecisionType,
    priority?: HITLPriority
  ): Promise<HITLRequest[]> {
    let query = supabase
      .from('hitl_requests')
      .select('*')
      .in('status', ['pending', 'escalated'])
      .order('priority', { ascending: false })
      .order('requestedAt', { ascending: true })

    if (type) {
      query = query.eq('type', type)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching pending HITL requests', error)
      return []
    }

    return data as HITLRequest[]
  }

  /**
   * Obtém estatísticas
   */
  async getStats(): Promise<HITLStats> {
    const { data, error } = await supabase
      .from('hitl_requests')
      .select('status, requestedAt, decision')

    if (error || !data) {
      return {
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0,
        avgDecisionTime: 0,
        approvalRate: 0,
      }
    }

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      escalated: 0,
      totalDecisionTime: 0,
      decisionCount: 0,
    }

    for (const request of data) {
      switch (request.status) {
        case 'pending':
          stats.pending++
          break
        case 'approved':
        case 'auto_approved':
          stats.approved++
          if (request.decision?.decidedAt) {
            const requestedAt = new Date(request.requestedAt).getTime()
            const decidedAt = new Date(request.decision.decidedAt).getTime()
            stats.totalDecisionTime += decidedAt - requestedAt
            stats.decisionCount++
          }
          break
        case 'rejected':
          stats.rejected++
          if (request.decision?.decidedAt) {
            const requestedAt = new Date(request.requestedAt).getTime()
            const decidedAt = new Date(request.decision.decidedAt).getTime()
            stats.totalDecisionTime += decidedAt - requestedAt
            stats.decisionCount++
          }
          break
        case 'escalated':
          stats.escalated++
          break
      }
    }

    const total = stats.approved + stats.rejected
    
    return {
      pending: stats.pending,
      approved: stats.approved,
      rejected: stats.rejected,
      escalated: stats.escalated,
      avgDecisionTime: stats.decisionCount > 0 
        ? stats.totalDecisionTime / stats.decisionCount / 1000 / 60 // em minutos
        : 0,
      approvalRate: total > 0 ? stats.approved / total : 0,
    }
  }

  /**
   * Persiste solicitação no banco
   */
  private async persistRequest(request: HITLRequest): Promise<void> {
    const { error } = await supabase
      .from('hitl_requests')
      .upsert(request)

    if (error) {
      logger.error('Error persisting HITL request', error)
    }
  }

  /**
   * Notifica aprovadores
   */
  private async notifyApprovers(request: HITLRequest): Promise<void> {
    // Implementar integração com sistema de notificações
    logger.info('Notifying approvers', { 
      requestId: request.id, 
      type: request.type,
      priority: request.priority,
    })

    // TODO: Integrar com NotificacoesInteligentes
  }

  /**
   * Notifica escalação
   */
  private async notifyEscalation(request: HITLRequest, reason: string): Promise<void> {
    logger.warn('Escalation notification', {
      requestId: request.id,
      type: request.type,
      reason,
    })

    // TODO: Integrar com NotificacoesInteligentes (urgente)
  }

  /**
   * Executa ação aprovada
   */
  private async executeApprovedAction(request: HITLRequest): Promise<void> {
    logger.info('Executing approved action', {
      requestId: request.id,
      type: request.type,
    })

    // TODO: Implementar execução baseada no tipo
    // Cada tipo de decisão tem sua própria lógica de execução
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const hitlManager = new HITLManager()

// ============ HOOK REACT ============

import { useState, useCallback, useEffect } from 'react'

export interface UseHITLReturn {
  pendingRequests: HITLRequest[]
  stats: HITLStats | null
  isLoading: boolean
  error: string | null
  createRequest: (
    type: HITLDecisionType,
    title: string,
    description: string,
    context: HITLContext,
    aiRecommendation?: AIRecommendation,
    priority?: HITLPriority
  ) => Promise<HITLRequest>
  approve: (requestId: string, comments?: string, conditions?: string[]) => Promise<void>
  reject: (requestId: string, reason: string) => Promise<void>
  escalate: (requestId: string, reason: string) => Promise<void>
  refresh: () => Promise<void>
}

export function useHITL(userId: string): UseHITLReturn {
  const [pendingRequests, setPendingRequests] = useState<HITLRequest[]>([])
  const [stats, setStats] = useState<HITLStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [requests, statsData] = await Promise.all([
        hitlManager.getPendingRequests(),
        hitlManager.getStats(),
      ])
      setPendingRequests(requests)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createRequest = useCallback(async (
    type: HITLDecisionType,
    title: string,
    description: string,
    context: HITLContext,
    aiRecommendation?: AIRecommendation,
    priority?: HITLPriority
  ) => {
    const request = await hitlManager.createRequest(
      type, title, description, context, aiRecommendation, priority
    )
    await refresh()
    return request
  }, [refresh])

  const approve = useCallback(async (
    requestId: string,
    comments?: string,
    conditions?: string[]
  ) => {
    await hitlManager.approve(requestId, userId, comments, conditions)
    await refresh()
  }, [userId, refresh])

  const reject = useCallback(async (requestId: string, reason: string) => {
    await hitlManager.reject(requestId, userId, reason)
    await refresh()
  }, [userId, refresh])

  const escalate = useCallback(async (requestId: string, reason: string) => {
    await hitlManager.escalate(requestId, userId, reason)
    await refresh()
  }, [userId, refresh])

  useEffect(() => {
    refresh()
  }, [refresh])

  return {
    pendingRequests,
    stats,
    isLoading,
    error,
    createRequest,
    approve,
    reject,
    escalate,
    refresh,
  }
}

// ============ EXPORTS ============

export default {
  hitlManager,
  useHITL,
}

