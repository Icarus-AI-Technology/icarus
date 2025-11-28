/**
 * ICARUS v5.0 - ANVISA Compliance Module
 * 
 * Módulo de conformidade com regulamentações ANVISA para OPME.
 * Inclui validação de registros, rastreabilidade e tecnovigilância.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { ANVISA_PRODUCT_CLASSES, ANVISA_REGULATIONS, NCM_ISENCOES_OPME } from './constants'

// ============ SCHEMAS ============

export const AnvisaRegistrationSchema = z.object({
  registrationNumber: z.string().regex(/^\d{11}$/, 'Registro ANVISA deve ter 11 dígitos'),
  productName: z.string().min(3, 'Nome do produto é obrigatório'),
  productClass: z.enum(['I', 'II', 'III', 'IV']),
  manufacturer: z.string().min(3, 'Fabricante é obrigatório'),
  technicalResponsible: z.string().optional(),
  expirationDate: z.string().datetime(),
  status: z.enum(['active', 'suspended', 'cancelled', 'expired']),
  ncmCode: z.string().optional()
})

export const TraceabilityRecordSchema = z.object({
  productId: z.string().uuid(),
  batchNumber: z.string().min(1, 'Número do lote é obrigatório'),
  serialNumber: z.string().optional(),
  manufacturingDate: z.string().datetime(),
  expirationDate: z.string().datetime(),
  patientId: z.string().uuid().optional(),
  surgeryId: z.string().uuid().optional(),
  implantDate: z.string().datetime().optional(),
  hospitalId: z.string().uuid().optional(),
  doctorId: z.string().uuid().optional(),
  status: z.enum(['in_stock', 'reserved', 'implanted', 'returned', 'recalled', 'expired'])
})

export const AdverseEventSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  eventType: z.enum(['death', 'serious_injury', 'malfunction', 'other']),
  severity: z.enum(['critical', 'serious', 'moderate', 'minor']),
  description: z.string().min(10, 'Descrição é obrigatória'),
  occurredAt: z.string().datetime(),
  reportedAt: z.string().datetime(),
  reportedBy: z.string(),
  patientId: z.string().uuid().optional(),
  hospitalId: z.string().uuid().optional(),
  status: z.enum(['reported', 'investigating', 'resolved', 'closed']),
  anvisaNotified: z.boolean().default(false),
  anvisaProtocol: z.string().optional()
})

export const RecallSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
  batchNumbers: z.array(z.string()),
  reason: z.string().min(10, 'Motivo é obrigatório'),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']),
  initiatedAt: z.string().datetime(),
  anvisaNotified: z.boolean().default(false),
  anvisaProtocol: z.string().optional(),
  affectedUnits: z.number().int().min(0),
  recoveredUnits: z.number().int().min(0).default(0),
  status: z.enum(['initiated', 'in_progress', 'completed', 'closed'])
})

// ============ TYPES ============

export type AnvisaRegistration = z.infer<typeof AnvisaRegistrationSchema>
export type TraceabilityRecord = z.infer<typeof TraceabilityRecordSchema>
export type AdverseEvent = z.infer<typeof AdverseEventSchema>
export type Recall = z.infer<typeof RecallSchema>

// ============ VALIDATION FUNCTIONS ============

/**
 * Valida número de registro ANVISA
 */
export function validateAnvisaRegistration(registrationNumber: string): boolean {
  // Remove caracteres não numéricos
  const cleanNumber = registrationNumber.replace(/\D/g, '')
  
  // Deve ter exatamente 11 dígitos
  if (cleanNumber.length !== 11) {
    return false
  }
  
  // Primeiro dígito indica o tipo de registro
  const firstDigit = parseInt(cleanNumber[0])
  if (![1, 2, 8].includes(firstDigit)) {
    return false
  }
  
  return true
}

/**
 * Valida código NCM para isenções OPME
 */
export function validateNCMIsencao(ncmCode: string): boolean {
  const cleanCode = ncmCode.replace(/\D/g, '')
  return NCM_ISENCOES_OPME.some(item => 
    item.ncm.replace(/\D/g, '') === cleanCode
  )
}

/**
 * Verifica se produto está dentro da validade
 */
export function isProductValid(expirationDate: string): boolean {
  return new Date(expirationDate) > new Date()
}

/**
 * Calcula dias até o vencimento
 */
export function daysUntilExpiration(expirationDate: string): number {
  const expDate = new Date(expirationDate)
  const today = new Date()
  const diffTime = expDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Determina classe de risco do produto
 */
export function getProductRiskClass(productClass: keyof typeof ANVISA_PRODUCT_CLASSES) {
  return ANVISA_PRODUCT_CLASSES[productClass]
}

/**
 * Verifica se evento adverso requer notificação imediata
 */
export function requiresImmediateNotification(event: AdverseEvent): boolean {
  return event.eventType === 'death' || 
         event.eventType === 'serious_injury' ||
         event.severity === 'critical'
}

// ============ COMPLIANCE CHECKS ============

export interface AnvisaComplianceResult {
  isCompliant: boolean
  score: number
  checks: {
    name: string
    passed: boolean
    message: string
    regulation?: string
  }[]
  recommendations: string[]
}

/**
 * Executa verificação completa de conformidade ANVISA
 */
export async function checkAnvisaCompliance(
  registration: AnvisaRegistration,
  traceabilityRecords: TraceabilityRecord[]
): Promise<AnvisaComplianceResult> {
  const checks: AnvisaComplianceResult['checks'] = []
  const recommendations: string[] = []

  // Check 1: Registro válido
  const registrationValid = validateAnvisaRegistration(registration.registrationNumber)
  checks.push({
    name: 'Registro ANVISA',
    passed: registrationValid,
    message: registrationValid 
      ? 'Número de registro válido' 
      : 'Número de registro inválido',
    regulation: ANVISA_REGULATIONS.RDC_751_2022.number
  })

  // Check 2: Status do registro
  const statusActive = registration.status === 'active'
  checks.push({
    name: 'Status do Registro',
    passed: statusActive,
    message: statusActive 
      ? 'Registro ativo' 
      : `Registro ${registration.status}`,
    regulation: ANVISA_REGULATIONS.RDC_751_2022.number
  })

  // Check 3: Validade do registro
  const registrationNotExpired = isProductValid(registration.expirationDate)
  checks.push({
    name: 'Validade do Registro',
    passed: registrationNotExpired,
    message: registrationNotExpired 
      ? `Válido até ${new Date(registration.expirationDate).toLocaleDateString('pt-BR')}` 
      : 'Registro expirado',
    regulation: ANVISA_REGULATIONS.RDC_751_2022.number
  })

  if (!registrationNotExpired) {
    recommendations.push('Providenciar renovação do registro ANVISA')
  }

  // Check 4: Rastreabilidade
  const hasTraceability = traceabilityRecords.length > 0
  checks.push({
    name: 'Rastreabilidade',
    passed: hasTraceability,
    message: hasTraceability 
      ? `${traceabilityRecords.length} registros de rastreabilidade` 
      : 'Sem registros de rastreabilidade',
    regulation: ANVISA_REGULATIONS.RDC_59_2000.number
  })

  if (!hasTraceability) {
    recommendations.push('Implementar sistema de rastreabilidade completo')
  }

  // Check 5: Lotes com validade próxima
  const nearExpirationRecords = traceabilityRecords.filter(
    r => daysUntilExpiration(r.expirationDate) <= 90 && daysUntilExpiration(r.expirationDate) > 0
  )
  const noNearExpiration = nearExpirationRecords.length === 0
  checks.push({
    name: 'Lotes Próximos ao Vencimento',
    passed: noNearExpiration,
    message: noNearExpiration 
      ? 'Nenhum lote próximo ao vencimento' 
      : `${nearExpirationRecords.length} lotes com vencimento em até 90 dias`,
    regulation: ANVISA_REGULATIONS.RDC_59_2000.number
  })

  if (!noNearExpiration) {
    recommendations.push('Priorizar uso de lotes com vencimento próximo (FEFO)')
  }

  // Check 6: Lotes expirados
  const expiredRecords = traceabilityRecords.filter(
    r => daysUntilExpiration(r.expirationDate) <= 0 && r.status === 'in_stock'
  )
  const noExpiredInStock = expiredRecords.length === 0
  checks.push({
    name: 'Lotes Expirados em Estoque',
    passed: noExpiredInStock,
    message: noExpiredInStock 
      ? 'Nenhum lote expirado em estoque' 
      : `CRÍTICO: ${expiredRecords.length} lotes expirados em estoque`,
    regulation: ANVISA_REGULATIONS.RDC_59_2000.number
  })

  if (!noExpiredInStock) {
    recommendations.push('URGENTE: Segregar e descartar lotes expirados')
  }

  // Check 7: NCM válido para isenção
  const ncmValid = registration.ncmCode ? validateNCMIsencao(registration.ncmCode) : true
  checks.push({
    name: 'NCM para Isenção',
    passed: ncmValid,
    message: ncmValid 
      ? 'NCM válido para isenção fiscal' 
      : 'NCM não elegível para isenção',
    regulation: 'Convênio ICMS 01/99'
  })

  // Calcular score
  const passedChecks = checks.filter(c => c.passed).length
  const score = Math.round((passedChecks / checks.length) * 100)

  return {
    isCompliant: score >= 80,
    score,
    checks,
    recommendations
  }
}

// ============ REPORT GENERATORS ============

/**
 * Gera relatório de rastreabilidade para ANVISA
 */
export function generateTraceabilityReport(
  records: TraceabilityRecord[],
  startDate: Date,
  endDate: Date
): {
  period: { start: string; end: string }
  totalRecords: number
  byStatus: Record<string, number>
  implants: number
  returns: number
  recalls: number
  expirations: number
} {
  const filteredRecords = records.filter(r => {
    const date = new Date(r.manufacturingDate)
    return date >= startDate && date <= endDate
  })

  const byStatus = filteredRecords.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    totalRecords: filteredRecords.length,
    byStatus,
    implants: filteredRecords.filter(r => r.status === 'implanted').length,
    returns: filteredRecords.filter(r => r.status === 'returned').length,
    recalls: filteredRecords.filter(r => r.status === 'recalled').length,
    expirations: filteredRecords.filter(r => r.status === 'expired').length
  }
}

/**
 * Gera relatório de tecnovigilância
 */
export function generateTechnovigilanceReport(
  events: AdverseEvent[],
  startDate: Date,
  endDate: Date
): {
  period: { start: string; end: string }
  totalEvents: number
  byType: Record<string, number>
  bySeverity: Record<string, number>
  notifiedToAnvisa: number
  pendingNotification: number
  averageResolutionDays: number
} {
  const filteredEvents = events.filter(e => {
    const date = new Date(e.occurredAt)
    return date >= startDate && date <= endDate
  })

  const byType = filteredEvents.reduce((acc, e) => {
    acc[e.eventType] = (acc[e.eventType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const bySeverity = filteredEvents.reduce((acc, e) => {
    acc[e.severity] = (acc[e.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const resolvedEvents = filteredEvents.filter(e => e.status === 'resolved' || e.status === 'closed')
  const totalResolutionDays = resolvedEvents.reduce((acc, e) => {
    const reported = new Date(e.reportedAt)
    const resolved = new Date() // Simplificado
    return acc + Math.ceil((resolved.getTime() - reported.getTime()) / (1000 * 60 * 60 * 24))
  }, 0)

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString()
    },
    totalEvents: filteredEvents.length,
    byType,
    bySeverity,
    notifiedToAnvisa: filteredEvents.filter(e => e.anvisaNotified).length,
    pendingNotification: filteredEvents.filter(e => !e.anvisaNotified && requiresImmediateNotification(e)).length,
    averageResolutionDays: resolvedEvents.length > 0 
      ? Math.round(totalResolutionDays / resolvedEvents.length) 
      : 0
  }
}

// ============ EXPORTS ============

export default {
  AnvisaRegistrationSchema,
  TraceabilityRecordSchema,
  AdverseEventSchema,
  RecallSchema,
  validateAnvisaRegistration,
  validateNCMIsencao,
  isProductValid,
  daysUntilExpiration,
  getProductRiskClass,
  requiresImmediateNotification,
  checkAnvisaCompliance,
  generateTraceabilityReport,
  generateTechnovigilanceReport
}

