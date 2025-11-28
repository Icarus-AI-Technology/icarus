/**
 * ICARUS v5.0 - ISO 42001 AIMS Compliance Module
 * 
 * Módulo de conformidade com ISO/IEC 42001:2023
 * AI Management System (AIMS) para gestão de sistemas de IA.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { ISO_42001_CLAUSES, ISO_42001_CONTROLS, COMPLIANCE_STATUS, RISK_LEVELS } from './constants'

// ============ SCHEMAS ============

export const AISystemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, 'Nome do sistema é obrigatório'),
  description: z.string().min(10, 'Descrição é obrigatória'),
  purpose: z.string().min(10, 'Propósito é obrigatório'),
  type: z.enum(['predictive', 'generative', 'classification', 'recommendation', 'automation', 'other']),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low']),
  dataTypes: z.array(z.string()),
  stakeholders: z.array(z.string()),
  deploymentDate: z.string().datetime().optional(),
  lastReviewDate: z.string().datetime().optional(),
  status: z.enum(['development', 'testing', 'production', 'deprecated', 'retired'])
})

export const AIImpactAssessmentSchema = z.object({
  id: z.string().uuid(),
  aiSystemId: z.string().uuid(),
  assessmentDate: z.string().datetime(),
  assessor: z.string(),
  impacts: z.array(z.object({
    category: z.enum(['human_rights', 'safety', 'privacy', 'fairness', 'transparency', 'accountability', 'environmental']),
    description: z.string(),
    likelihood: z.enum(['very_likely', 'likely', 'possible', 'unlikely', 'rare']),
    severity: z.enum(['catastrophic', 'major', 'moderate', 'minor', 'negligible']),
    riskScore: z.number().min(0).max(100),
    mitigations: z.array(z.string())
  })),
  overallRiskScore: z.number().min(0).max(100),
  recommendation: z.enum(['approve', 'approve_with_conditions', 'reject', 'further_review']),
  nextReviewDate: z.string().datetime()
})

export const AIControlSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  implementation: z.enum(['implemented', 'partial', 'not_implemented', 'not_applicable']),
  evidence: z.array(z.string()),
  lastReviewDate: z.string().datetime(),
  responsiblePerson: z.string(),
  notes: z.string().optional()
})

export const AIAuditSchema = z.object({
  id: z.string().uuid(),
  aiSystemId: z.string().uuid(),
  auditType: z.enum(['internal', 'external', 'certification']),
  auditDate: z.string().datetime(),
  auditor: z.string(),
  scope: z.array(z.string()),
  findings: z.array(z.object({
    id: z.string(),
    type: z.enum(['conformity', 'minor_nc', 'major_nc', 'observation', 'opportunity']),
    clause: z.string(),
    description: z.string(),
    evidence: z.string().optional(),
    correctiveAction: z.string().optional(),
    dueDate: z.string().datetime().optional(),
    status: z.enum(['open', 'in_progress', 'closed', 'verified'])
  })),
  conclusion: z.enum(['passed', 'passed_with_conditions', 'failed']),
  nextAuditDate: z.string().datetime()
})

export const AIMetricsSchema = z.object({
  aiSystemId: z.string().uuid(),
  period: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  performance: z.object({
    accuracy: z.number().min(0).max(100).optional(),
    precision: z.number().min(0).max(100).optional(),
    recall: z.number().min(0).max(100).optional(),
    f1Score: z.number().min(0).max(100).optional(),
    latencyMs: z.number().min(0).optional(),
    throughput: z.number().min(0).optional()
  }),
  fairness: z.object({
    demographicParity: z.number().min(0).max(1).optional(),
    equalizedOdds: z.number().min(0).max(1).optional(),
    calibration: z.number().min(0).max(1).optional()
  }),
  reliability: z.object({
    uptime: z.number().min(0).max(100),
    errorRate: z.number().min(0).max(100),
    mttr: z.number().min(0).optional() // Mean Time To Recovery
  }),
  usage: z.object({
    totalRequests: z.number().int().min(0),
    uniqueUsers: z.number().int().min(0),
    peakLoad: z.number().min(0)
  })
})

// ============ TYPES ============

export type AISystem = z.infer<typeof AISystemSchema>
export type AIImpactAssessment = z.infer<typeof AIImpactAssessmentSchema>
export type AIControl = z.infer<typeof AIControlSchema>
export type AIAudit = z.infer<typeof AIAuditSchema>
export type AIMetrics = z.infer<typeof AIMetricsSchema>

// ============ RISK ASSESSMENT ============

export interface RiskMatrix {
  likelihood: number // 1-5
  severity: number // 1-5
  riskScore: number // 1-25
  riskLevel: keyof typeof RISK_LEVELS
}

const LIKELIHOOD_MAP = {
  'very_likely': 5,
  'likely': 4,
  'possible': 3,
  'unlikely': 2,
  'rare': 1
}

const SEVERITY_MAP = {
  'catastrophic': 5,
  'major': 4,
  'moderate': 3,
  'minor': 2,
  'negligible': 1
}

/**
 * Calcula score de risco baseado em likelihood e severity
 */
export function calculateRiskScore(
  likelihood: keyof typeof LIKELIHOOD_MAP,
  severity: keyof typeof SEVERITY_MAP
): RiskMatrix {
  const likelihoodScore = LIKELIHOOD_MAP[likelihood]
  const severityScore = SEVERITY_MAP[severity]
  const riskScore = likelihoodScore * severityScore

  let riskLevel: keyof typeof RISK_LEVELS
  if (riskScore >= 20) {
    riskLevel = 'CRITICAL'
  } else if (riskScore >= 12) {
    riskLevel = 'HIGH'
  } else if (riskScore >= 6) {
    riskLevel = 'MEDIUM'
  } else {
    riskLevel = 'LOW'
  }

  return {
    likelihood: likelihoodScore,
    severity: severityScore,
    riskScore,
    riskLevel
  }
}

// ============ COMPLIANCE ASSESSMENT ============

export interface ISO42001ComplianceResult {
  isCompliant: boolean
  overallScore: number
  clauseScores: {
    clause: number
    title: string
    score: number
    status: keyof typeof COMPLIANCE_STATUS
    findings: string[]
  }[]
  controlScores: {
    controlId: string
    name: string
    score: number
    status: keyof typeof COMPLIANCE_STATUS
  }[]
  recommendations: string[]
  nextActions: string[]
}

/**
 * Avalia conformidade com ISO 42001
 */
export async function assessISO42001Compliance(
  aiSystems: AISystem[],
  controls: AIControl[],
  audits: AIAudit[]
): Promise<ISO42001ComplianceResult> {
  const clauseScores: ISO42001ComplianceResult['clauseScores'] = []
  const recommendations: string[] = []
  const nextActions: string[] = []

  // Avaliar cada cláusula
  for (const [clauseNum, clauseData] of Object.entries(ISO_42001_CLAUSES)) {
    const clauseNumber = parseInt(clauseNum)
    let clauseScore = 0
    const findings: string[] = []

    // Cláusula 4: Contexto
    if (clauseNumber === 4) {
      const hasAISystems = aiSystems.length > 0
      const hasDocumentation = aiSystems.every(s => s.description && s.purpose)
      clauseScore = hasAISystems && hasDocumentation ? 100 : hasAISystems ? 70 : 0
      if (!hasAISystems) findings.push('Nenhum sistema de IA documentado')
      if (!hasDocumentation) findings.push('Documentação incompleta dos sistemas')
    }

    // Cláusula 5: Liderança
    if (clauseNumber === 5) {
      const hasResponsibles = controls.every(c => c.responsiblePerson)
      clauseScore = hasResponsibles ? 100 : 60
      if (!hasResponsibles) findings.push('Responsáveis não definidos para todos os controles')
    }

    // Cláusula 6: Planejamento
    if (clauseNumber === 6) {
      const hasRiskAssessment = aiSystems.every(s => s.riskLevel)
      const hasReviewDates = aiSystems.every(s => s.lastReviewDate)
      clauseScore = hasRiskAssessment && hasReviewDates ? 100 : hasRiskAssessment ? 75 : 50
      if (!hasRiskAssessment) findings.push('Avaliação de risco incompleta')
      if (!hasReviewDates) findings.push('Datas de revisão não definidas')
    }

    // Cláusula 7: Apoio
    if (clauseNumber === 7) {
      const hasEvidence = controls.filter(c => c.evidence.length > 0).length
      const evidenceRatio = controls.length > 0 ? hasEvidence / controls.length : 0
      clauseScore = Math.round(evidenceRatio * 100)
      if (evidenceRatio < 0.8) findings.push('Evidências insuficientes para controles')
    }

    // Cláusula 8: Operação
    if (clauseNumber === 8) {
      const productionSystems = aiSystems.filter(s => s.status === 'production')
      const hasImpactAssessment = productionSystems.length > 0
      clauseScore = hasImpactAssessment ? 90 : 50
      if (!hasImpactAssessment) findings.push('Sistemas em produção sem avaliação de impacto')
    }

    // Cláusula 9: Avaliação de Desempenho
    if (clauseNumber === 9) {
      const recentAudits = audits.filter(a => {
        const auditDate = new Date(a.auditDate)
        const oneYearAgo = new Date()
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
        return auditDate >= oneYearAgo
      })
      clauseScore = recentAudits.length > 0 ? 100 : 40
      if (recentAudits.length === 0) findings.push('Nenhuma auditoria realizada no último ano')
    }

    // Cláusula 10: Melhoria
    if (clauseNumber === 10) {
      const closedFindings = audits.flatMap(a => a.findings).filter(f => f.status === 'closed' || f.status === 'verified')
      const totalFindings = audits.flatMap(a => a.findings).length
      const closureRate = totalFindings > 0 ? closedFindings.length / totalFindings : 1
      clauseScore = Math.round(closureRate * 100)
      if (closureRate < 0.8) findings.push('Taxa de fechamento de não conformidades abaixo de 80%')
    }

    let status: keyof typeof COMPLIANCE_STATUS
    if (clauseScore >= 90) status = 'COMPLIANT'
    else if (clauseScore >= 70) status = 'PARTIAL'
    else if (clauseScore > 0) status = 'NON_COMPLIANT'
    else status = 'NOT_APPLICABLE'

    clauseScores.push({
      clause: clauseNumber,
      title: clauseData.title,
      score: clauseScore,
      status,
      findings
    })
  }

  // Avaliar controles
  const controlScores: ISO42001ComplianceResult['controlScores'] = controls.map(control => {
    let score = 0
    let status: keyof typeof COMPLIANCE_STATUS

    switch (control.implementation) {
      case 'implemented':
        score = 100
        status = 'COMPLIANT'
        break
      case 'partial':
        score = 60
        status = 'PARTIAL'
        break
      case 'not_implemented':
        score = 0
        status = 'NON_COMPLIANT'
        break
      default:
        score = 0
        status = 'NOT_APPLICABLE'
    }

    return {
      controlId: control.id,
      name: control.name,
      score,
      status
    }
  })

  // Calcular score geral
  const clauseAvg = clauseScores.reduce((acc, c) => acc + c.score, 0) / clauseScores.length
  const controlAvg = controlScores.length > 0 
    ? controlScores.reduce((acc, c) => acc + c.score, 0) / controlScores.length 
    : 0
  const overallScore = Math.round((clauseAvg * 0.6) + (controlAvg * 0.4))

  // Gerar recomendações
  const nonCompliantClauses = clauseScores.filter(c => c.status === 'NON_COMPLIANT')
  const partialClauses = clauseScores.filter(c => c.status === 'PARTIAL')

  if (nonCompliantClauses.length > 0) {
    recommendations.push(`Priorizar conformidade nas cláusulas: ${nonCompliantClauses.map(c => c.clause).join(', ')}`)
  }
  if (partialClauses.length > 0) {
    recommendations.push(`Completar implementação nas cláusulas: ${partialClauses.map(c => c.clause).join(', ')}`)
  }

  // Gerar próximas ações
  const openFindings = audits.flatMap(a => a.findings).filter(f => f.status === 'open')
  if (openFindings.length > 0) {
    nextActions.push(`Tratar ${openFindings.length} não conformidades abertas`)
  }

  const systemsWithoutReview = aiSystems.filter(s => {
    if (!s.lastReviewDate) return true
    const lastReview = new Date(s.lastReviewDate)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    return lastReview < sixMonthsAgo
  })
  if (systemsWithoutReview.length > 0) {
    nextActions.push(`Revisar ${systemsWithoutReview.length} sistemas de IA sem revisão recente`)
  }

  return {
    isCompliant: overallScore >= 80,
    overallScore,
    clauseScores,
    controlScores,
    recommendations,
    nextActions
  }
}

// ============ IMPACT ASSESSMENT ============

/**
 * Cria template de avaliação de impacto de IA
 */
export function createImpactAssessmentTemplate(aiSystem: AISystem): Partial<AIImpactAssessment> {
  const categories = [
    'human_rights',
    'safety',
    'privacy',
    'fairness',
    'transparency',
    'accountability',
    'environmental'
  ] as const

  return {
    aiSystemId: aiSystem.id,
    assessmentDate: new Date().toISOString(),
    impacts: categories.map(category => ({
      category,
      description: '',
      likelihood: 'possible' as const,
      severity: 'moderate' as const,
      riskScore: 0,
      mitigations: []
    })),
    overallRiskScore: 0,
    recommendation: 'further_review' as const,
    nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  }
}

// ============ METRICS TRACKING ============

/**
 * Avalia métricas de sistema de IA
 */
export function evaluateAIMetrics(metrics: AIMetrics): {
  performance: 'excellent' | 'good' | 'acceptable' | 'poor'
  reliability: 'excellent' | 'good' | 'acceptable' | 'poor'
  fairness: 'excellent' | 'good' | 'acceptable' | 'poor'
  recommendations: string[]
} {
  const recommendations: string[] = []

  // Avaliar performance
  let performanceScore = 0
  if (metrics.performance.accuracy && metrics.performance.accuracy >= 95) performanceScore += 25
  else if (metrics.performance.accuracy && metrics.performance.accuracy >= 85) performanceScore += 15
  if (metrics.performance.f1Score && metrics.performance.f1Score >= 90) performanceScore += 25
  else if (metrics.performance.f1Score && metrics.performance.f1Score >= 80) performanceScore += 15
  if (metrics.performance.latencyMs && metrics.performance.latencyMs <= 100) performanceScore += 25
  else if (metrics.performance.latencyMs && metrics.performance.latencyMs <= 500) performanceScore += 15

  const performance = performanceScore >= 60 ? 'excellent' : performanceScore >= 40 ? 'good' : performanceScore >= 20 ? 'acceptable' : 'poor'

  if (performance === 'poor') {
    recommendations.push('Otimizar performance do modelo de IA')
  }

  // Avaliar reliability
  let reliabilityScore = 0
  if (metrics.reliability.uptime >= 99.9) reliabilityScore += 40
  else if (metrics.reliability.uptime >= 99) reliabilityScore += 25
  if (metrics.reliability.errorRate <= 0.1) reliabilityScore += 30
  else if (metrics.reliability.errorRate <= 1) reliabilityScore += 15
  if (metrics.reliability.mttr && metrics.reliability.mttr <= 30) reliabilityScore += 30
  else if (metrics.reliability.mttr && metrics.reliability.mttr <= 60) reliabilityScore += 15

  const reliability = reliabilityScore >= 80 ? 'excellent' : reliabilityScore >= 50 ? 'good' : reliabilityScore >= 30 ? 'acceptable' : 'poor'

  if (reliability === 'poor') {
    recommendations.push('Melhorar confiabilidade e disponibilidade do sistema')
  }

  // Avaliar fairness
  let fairnessScore = 0
  if (metrics.fairness.demographicParity && metrics.fairness.demographicParity >= 0.95) fairnessScore += 35
  else if (metrics.fairness.demographicParity && metrics.fairness.demographicParity >= 0.8) fairnessScore += 20
  if (metrics.fairness.equalizedOdds && metrics.fairness.equalizedOdds >= 0.95) fairnessScore += 35
  else if (metrics.fairness.equalizedOdds && metrics.fairness.equalizedOdds >= 0.8) fairnessScore += 20
  if (metrics.fairness.calibration && metrics.fairness.calibration >= 0.9) fairnessScore += 30
  else if (metrics.fairness.calibration && metrics.fairness.calibration >= 0.8) fairnessScore += 15

  const fairness = fairnessScore >= 80 ? 'excellent' : fairnessScore >= 50 ? 'good' : fairnessScore >= 30 ? 'acceptable' : 'poor'

  if (fairness === 'poor' || fairness === 'acceptable') {
    recommendations.push('Revisar métricas de fairness e implementar mitigações de viés')
  }

  return {
    performance,
    reliability,
    fairness,
    recommendations
  }
}

// ============ EXPORTS ============

export default {
  AISystemSchema,
  AIImpactAssessmentSchema,
  AIControlSchema,
  AIAuditSchema,
  AIMetricsSchema,
  calculateRiskScore,
  assessISO42001Compliance,
  createImpactAssessmentTemplate,
  evaluateAIMetrics,
  ISO_42001_CLAUSES,
  ISO_42001_CONTROLS
}

