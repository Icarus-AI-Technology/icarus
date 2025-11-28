/**
 * ICARUS v5.0 - LGPD Compliance Module
 * 
 * Módulo de conformidade com a Lei Geral de Proteção de Dados (LGPD).
 * Gerencia consentimentos, direitos do titular e tratamento de dados.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { LGPD_LEGAL_BASES, LGPD_DATA_SUBJECT_RIGHTS, LGPD_SENSITIVE_DATA_CATEGORIES } from './constants'

// ============ SCHEMAS ============

export const DataSubjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').optional(),
  phone: z.string().optional(),
  type: z.enum(['patient', 'employee', 'customer', 'supplier', 'other']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
})

export const ConsentSchema = z.object({
  id: z.string().uuid(),
  dataSubjectId: z.string().uuid(),
  purpose: z.string().min(10, 'Propósito é obrigatório'),
  legalBasis: z.enum(['consent', 'legal_obligation', 'public_policy', 'research', 'contract', 'legal_process', 'life_protection', 'health_protection', 'legitimate_interest', 'credit_protection']),
  dataCategories: z.array(z.string()),
  sensitiveData: z.boolean().default(false),
  thirdPartySharing: z.boolean().default(false),
  thirdParties: z.array(z.string()).optional(),
  retentionPeriod: z.string(),
  consentedAt: z.string().datetime(),
  expiresAt: z.string().datetime().optional(),
  revokedAt: z.string().datetime().optional(),
  status: z.enum(['active', 'expired', 'revoked']),
  evidence: z.object({
    type: z.enum(['digital_signature', 'checkbox', 'verbal', 'written', 'other']),
    ipAddress: z.string().optional(),
    userAgent: z.string().optional(),
    documentUrl: z.string().optional()
  })
})

export const DataSubjectRequestSchema = z.object({
  id: z.string().uuid(),
  dataSubjectId: z.string().uuid(),
  requestType: z.enum(['confirmation', 'access', 'correction', 'anonymization', 'portability', 'deletion', 'sharing_info', 'consent_info', 'revocation']),
  description: z.string().optional(),
  requestedAt: z.string().datetime(),
  deadline: z.string().datetime(),
  respondedAt: z.string().datetime().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'rejected']),
  response: z.string().optional(),
  attachments: z.array(z.string()).optional()
})

export const DataProcessingActivitySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Nome é obrigatório'),
  description: z.string().min(10, 'Descrição é obrigatória'),
  purpose: z.string().min(10, 'Propósito é obrigatório'),
  legalBasis: z.enum(['consent', 'legal_obligation', 'public_policy', 'research', 'contract', 'legal_process', 'life_protection', 'health_protection', 'legitimate_interest', 'credit_protection']),
  dataCategories: z.array(z.string()),
  sensitiveData: z.boolean().default(false),
  dataSubjectTypes: z.array(z.string()),
  dataRetentionPeriod: z.string(),
  securityMeasures: z.array(z.string()),
  thirdPartySharing: z.boolean().default(false),
  thirdParties: z.array(z.object({
    name: z.string(),
    country: z.string(),
    purpose: z.string(),
    contractType: z.string()
  })).optional(),
  internationalTransfer: z.boolean().default(false),
  transferCountries: z.array(z.string()).optional(),
  dpoApproval: z.boolean().default(false),
  riskAssessment: z.enum(['low', 'medium', 'high']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  status: z.enum(['draft', 'active', 'suspended', 'terminated'])
})

export const DataBreachSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5, 'Título é obrigatório'),
  description: z.string().min(20, 'Descrição é obrigatória'),
  discoveredAt: z.string().datetime(),
  occurredAt: z.string().datetime().optional(),
  affectedDataCategories: z.array(z.string()),
  affectedDataSubjects: z.number().int().min(0),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  cause: z.enum(['hacking', 'malware', 'human_error', 'system_failure', 'theft', 'unauthorized_access', 'other']),
  containmentActions: z.array(z.string()),
  notifiedAnpd: z.boolean().default(false),
  anpdNotificationDate: z.string().datetime().optional(),
  anpdProtocol: z.string().optional(),
  notifiedDataSubjects: z.boolean().default(false),
  dataSubjectNotificationDate: z.string().datetime().optional(),
  status: z.enum(['detected', 'contained', 'investigating', 'resolved', 'closed']),
  lessonsLearned: z.string().optional(),
  preventiveMeasures: z.array(z.string()).optional()
})

// ============ TYPES ============

export type DataSubject = z.infer<typeof DataSubjectSchema>
export type Consent = z.infer<typeof ConsentSchema>
export type DataSubjectRequest = z.infer<typeof DataSubjectRequestSchema>
export type DataProcessingActivity = z.infer<typeof DataProcessingActivitySchema>
export type DataBreach = z.infer<typeof DataBreachSchema>

// ============ CONSENT MANAGEMENT ============

/**
 * Verifica se consentimento está válido
 */
export function isConsentValid(consent: Consent): boolean {
  if (consent.status !== 'active') return false
  if (consent.revokedAt) return false
  if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) return false
  return true
}

/**
 * Calcula dias até expiração do consentimento
 */
export function daysUntilConsentExpiration(consent: Consent): number | null {
  if (!consent.expiresAt) return null
  const expDate = new Date(consent.expiresAt)
  const today = new Date()
  const diffTime = expDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Obtém base legal por ID
 */
export function getLegalBasis(id: string) {
  return LGPD_LEGAL_BASES.find(lb => lb.id === id)
}

/**
 * Obtém direito do titular por ID
 */
export function getDataSubjectRight(id: string) {
  return LGPD_DATA_SUBJECT_RIGHTS.find(r => r.id === id)
}

/**
 * Verifica se dados são sensíveis
 */
export function containsSensitiveData(dataCategories: string[]): boolean {
  return dataCategories.some(cat => 
    LGPD_SENSITIVE_DATA_CATEGORIES.some(sensitive => 
      cat.toLowerCase().includes(sensitive.toLowerCase())
    )
  )
}

// ============ DATA SUBJECT REQUESTS ============

/**
 * Calcula prazo legal para resposta (15 dias úteis)
 */
export function calculateRequestDeadline(requestDate: Date): Date {
  const deadline = new Date(requestDate)
  let businessDays = 0
  
  while (businessDays < 15) {
    deadline.setDate(deadline.getDate() + 1)
    const dayOfWeek = deadline.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++
    }
  }
  
  return deadline
}

/**
 * Verifica se prazo está vencido
 */
export function isRequestOverdue(request: DataSubjectRequest): boolean {
  if (request.status === 'completed' || request.status === 'rejected') return false
  return new Date(request.deadline) < new Date()
}

/**
 * Obtém tempo restante para resposta
 */
export function getTimeRemaining(request: DataSubjectRequest): {
  days: number
  hours: number
  isOverdue: boolean
} {
  const deadline = new Date(request.deadline)
  const now = new Date()
  const diffMs = deadline.getTime() - now.getTime()
  const isOverdue = diffMs < 0
  const absDiffMs = Math.abs(diffMs)
  
  return {
    days: Math.floor(absDiffMs / (1000 * 60 * 60 * 24)),
    hours: Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    isOverdue
  }
}

// ============ COMPLIANCE ASSESSMENT ============

export interface LGPDComplianceResult {
  isCompliant: boolean
  overallScore: number
  categories: {
    name: string
    score: number
    status: 'compliant' | 'partial' | 'non_compliant'
    findings: string[]
  }[]
  recommendations: string[]
  risks: {
    description: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    mitigation: string
  }[]
}

/**
 * Avalia conformidade LGPD
 */
export async function assessLGPDCompliance(
  consents: Consent[],
  requests: DataSubjectRequest[],
  activities: DataProcessingActivity[],
  breaches: DataBreach[]
): Promise<LGPDComplianceResult> {
  const categories: LGPDComplianceResult['categories'] = []
  const recommendations: string[] = []
  const risks: LGPDComplianceResult['risks'] = []

  // 1. Avaliação de Consentimentos
  const activeConsents = consents.filter(c => isConsentValid(c))
  const expiredConsents = consents.filter(c => c.status === 'expired')
  const nearExpirationConsents = consents.filter(c => {
    const days = daysUntilConsentExpiration(c)
    return days !== null && days > 0 && days <= 30
  })

  const consentScore = consents.length > 0 
    ? Math.round((activeConsents.length / consents.length) * 100)
    : 100

  const consentFindings: string[] = []
  if (expiredConsents.length > 0) {
    consentFindings.push(`${expiredConsents.length} consentimentos expirados`)
  }
  if (nearExpirationConsents.length > 0) {
    consentFindings.push(`${nearExpirationConsents.length} consentimentos próximos do vencimento`)
  }

  categories.push({
    name: 'Gestão de Consentimentos',
    score: consentScore,
    status: consentScore >= 90 ? 'compliant' : consentScore >= 70 ? 'partial' : 'non_compliant',
    findings: consentFindings
  })

  // 2. Avaliação de Solicitações de Titulares
  const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'in_progress')
  const overdueRequests = requests.filter(r => isRequestOverdue(r))
  const completedRequests = requests.filter(r => r.status === 'completed')

  const requestScore = requests.length > 0
    ? Math.round(((completedRequests.length / requests.length) * 70) + (overdueRequests.length === 0 ? 30 : 0))
    : 100

  const requestFindings: string[] = []
  if (overdueRequests.length > 0) {
    requestFindings.push(`${overdueRequests.length} solicitações com prazo vencido`)
    risks.push({
      description: 'Solicitações de titulares com prazo vencido',
      severity: 'high',
      mitigation: 'Priorizar atendimento imediato das solicitações pendentes'
    })
  }
  if (pendingRequests.length > 5) {
    requestFindings.push(`${pendingRequests.length} solicitações pendentes`)
  }

  categories.push({
    name: 'Direitos do Titular',
    score: requestScore,
    status: requestScore >= 90 ? 'compliant' : requestScore >= 70 ? 'partial' : 'non_compliant',
    findings: requestFindings
  })

  // 3. Avaliação de Atividades de Tratamento
  const activeActivities = activities.filter(a => a.status === 'active')
  const activitiesWithDPO = activeActivities.filter(a => a.dpoApproval)
  const activitiesWithRisk = activeActivities.filter(a => a.riskAssessment)
  const highRiskActivities = activeActivities.filter(a => a.riskAssessment === 'high')

  const activityScore = activeActivities.length > 0
    ? Math.round(
        ((activitiesWithDPO.length / activeActivities.length) * 40) +
        ((activitiesWithRisk.length / activeActivities.length) * 30) +
        ((highRiskActivities.length === 0 ? 30 : 15))
      )
    : 100

  const activityFindings: string[] = []
  if (activitiesWithDPO.length < activeActivities.length) {
    activityFindings.push(`${activeActivities.length - activitiesWithDPO.length} atividades sem aprovação do DPO`)
  }
  if (activitiesWithRisk.length < activeActivities.length) {
    activityFindings.push(`${activeActivities.length - activitiesWithRisk.length} atividades sem avaliação de risco`)
  }
  if (highRiskActivities.length > 0) {
    activityFindings.push(`${highRiskActivities.length} atividades de alto risco`)
  }

  categories.push({
    name: 'Registro de Tratamento',
    score: activityScore,
    status: activityScore >= 90 ? 'compliant' : activityScore >= 70 ? 'partial' : 'non_compliant',
    findings: activityFindings
  })

  // 4. Avaliação de Incidentes
  const openBreaches = breaches.filter(b => b.status !== 'closed')
  const unreportedBreaches = breaches.filter(b => 
    b.severity === 'critical' || b.severity === 'high'
  ).filter(b => !b.notifiedAnpd)

  const breachScore = breaches.length > 0
    ? Math.round(
        ((breaches.filter(b => b.status === 'closed').length / breaches.length) * 50) +
        (unreportedBreaches.length === 0 ? 50 : 0)
      )
    : 100

  const breachFindings: string[] = []
  if (openBreaches.length > 0) {
    breachFindings.push(`${openBreaches.length} incidentes em aberto`)
  }
  if (unreportedBreaches.length > 0) {
    breachFindings.push(`${unreportedBreaches.length} incidentes graves não notificados à ANPD`)
    risks.push({
      description: 'Incidentes de segurança graves não notificados à ANPD',
      severity: 'critical',
      mitigation: 'Notificar ANPD imediatamente conforme Art. 48 da LGPD'
    })
  }

  categories.push({
    name: 'Gestão de Incidentes',
    score: breachScore,
    status: breachScore >= 90 ? 'compliant' : breachScore >= 70 ? 'partial' : 'non_compliant',
    findings: breachFindings
  })

  // Calcular score geral
  const overallScore = Math.round(
    categories.reduce((acc, cat) => acc + cat.score, 0) / categories.length
  )

  // Gerar recomendações
  const nonCompliantCategories = categories.filter(c => c.status === 'non_compliant')
  const partialCategories = categories.filter(c => c.status === 'partial')

  if (nonCompliantCategories.length > 0) {
    recommendations.push(`Priorizar conformidade em: ${nonCompliantCategories.map(c => c.name).join(', ')}`)
  }
  if (partialCategories.length > 0) {
    recommendations.push(`Melhorar conformidade em: ${partialCategories.map(c => c.name).join(', ')}`)
  }
  if (nearExpirationConsents.length > 0) {
    recommendations.push('Renovar consentimentos próximos do vencimento')
  }
  if (overdueRequests.length > 0) {
    recommendations.push('Atender solicitações de titulares com prazo vencido')
  }

  return {
    isCompliant: overallScore >= 80,
    overallScore,
    categories,
    recommendations,
    risks
  }
}

// ============ DATA MAPPING ============

/**
 * Gera relatório de mapeamento de dados
 */
export function generateDataMappingReport(
  activities: DataProcessingActivity[]
): {
  totalActivities: number
  byLegalBasis: Record<string, number>
  byDataCategory: Record<string, number>
  sensitiveDataActivities: number
  internationalTransfers: number
  thirdPartySharing: number
  highRiskActivities: number
} {
  const byLegalBasis = activities.reduce((acc, a) => {
    acc[a.legalBasis] = (acc[a.legalBasis] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const byDataCategory = activities.reduce((acc, a) => {
    a.dataCategories.forEach(cat => {
      acc[cat] = (acc[cat] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  return {
    totalActivities: activities.length,
    byLegalBasis,
    byDataCategory,
    sensitiveDataActivities: activities.filter(a => a.sensitiveData).length,
    internationalTransfers: activities.filter(a => a.internationalTransfer).length,
    thirdPartySharing: activities.filter(a => a.thirdPartySharing).length,
    highRiskActivities: activities.filter(a => a.riskAssessment === 'high').length
  }
}

// ============ EXPORTS ============

export default {
  DataSubjectSchema,
  ConsentSchema,
  DataSubjectRequestSchema,
  DataProcessingActivitySchema,
  DataBreachSchema,
  isConsentValid,
  daysUntilConsentExpiration,
  getLegalBasis,
  getDataSubjectRight,
  containsSensitiveData,
  calculateRequestDeadline,
  isRequestOverdue,
  getTimeRemaining,
  assessLGPDCompliance,
  generateDataMappingReport,
  LGPD_LEGAL_BASES,
  LGPD_DATA_SUBJECT_RIGHTS,
  LGPD_SENSITIVE_DATA_CATEGORIES
}

