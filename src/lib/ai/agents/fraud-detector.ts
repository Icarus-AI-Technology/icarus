/**
 * ICARUS v5.0 - FraudDetector Agent
 * 
 * Agente especializado em detecção de fraudes,
 * análise de padrões suspeitos e scoring de risco.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { BaseAgent } from './base-agent'
import type { AgentConfig, AgentTool } from './types'

// Schema para análise de transação
const TransactionAnalysisSchema = z.object({
  transactionId: z.string().uuid(),
  type: z.enum(['purchase', 'sale', 'transfer', 'consignment', 'return', 'billing']),
  amount: z.number().positive(),
  currency: z.string().default('BRL'),
  timestamp: z.string().datetime(),
  entityId: z.string().uuid(),
  entityType: z.enum(['customer', 'supplier', 'hospital', 'doctor']),
  metadata: z.record(z.unknown()).optional()
})

// Schema para análise de padrão
const PatternAnalysisSchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(['customer', 'supplier', 'hospital', 'doctor', 'product']),
  analysisType: z.enum(['frequency', 'amount', 'timing', 'location', 'behavior']),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime()
  }),
  compareWithBaseline: z.boolean().default(true)
})

// Schema para scoring de risco
const RiskScoringSchema = z.object({
  entityId: z.string().uuid(),
  entityType: z.enum(['customer', 'supplier', 'hospital', 'doctor', 'transaction']),
  factors: z.array(z.object({
    name: z.string(),
    weight: z.number().min(0).max(1),
    value: z.number().min(0).max(100)
  })).optional()
})

// Schema para alerta de fraude
const FraudAlertSchema = z.object({
  alertType: z.enum(['suspicious_transaction', 'anomaly_detected', 'pattern_violation', 'high_risk_entity', 'compliance_breach']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  entityId: z.string().uuid(),
  description: z.string(),
  evidence: z.array(z.string()),
  recommendedActions: z.array(z.string())
})

// Ferramenta: Analisar Transação
const analyzeTransactionTool: AgentTool = {
  name: 'analyze_transaction',
  description: 'Analisa uma transação em busca de indicadores de fraude',
  schema: TransactionAnalysisSchema,
  func: async (input: z.infer<typeof TransactionAnalysisSchema>) => {
    // Regras de detecção de fraude
    const fraudIndicators: { indicator: string; triggered: boolean; weight: number; details: string }[] = []

    // 1. Valor anormalmente alto
    const highValueThreshold = 100000 // R$ 100.000
    if (input.amount > highValueThreshold) {
      fraudIndicators.push({
        indicator: 'high_value_transaction',
        triggered: true,
        weight: 0.3,
        details: `Valor R$ ${input.amount.toLocaleString('pt-BR')} acima do limiar de R$ ${highValueThreshold.toLocaleString('pt-BR')}`
      })
    }

    // 2. Horário suspeito (fora do horário comercial)
    const hour = new Date(input.timestamp).getHours()
    if (hour < 6 || hour > 22) {
      fraudIndicators.push({
        indicator: 'off_hours_transaction',
        triggered: true,
        weight: 0.2,
        details: `Transação realizada às ${hour}h, fora do horário comercial padrão`
      })
    }

    // 3. Tipo de transação de alto risco
    const highRiskTypes = ['return', 'transfer']
    if (highRiskTypes.includes(input.type)) {
      fraudIndicators.push({
        indicator: 'high_risk_transaction_type',
        triggered: true,
        weight: 0.15,
        details: `Tipo de transação "${input.type}" requer atenção adicional`
      })
    }

    // 4. Valores redondos (possível manipulação)
    if (input.amount % 1000 === 0 && input.amount > 10000) {
      fraudIndicators.push({
        indicator: 'round_amount',
        triggered: true,
        weight: 0.1,
        details: `Valor exatamente redondo: R$ ${input.amount.toLocaleString('pt-BR')}`
      })
    }

    // Calcular score de risco
    const triggeredIndicators = fraudIndicators.filter(i => i.triggered)
    const riskScore = Math.min(100, Math.round(
      triggeredIndicators.reduce((acc, i) => acc + (i.weight * 100), 0) +
      (Math.random() * 20) // Variação para simular ML
    ))

    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low'

    return JSON.stringify({
      transactionId: input.transactionId,
      analysisResult: {
        riskScore,
        riskLevel,
        fraudIndicators: triggeredIndicators,
        totalIndicators: triggeredIndicators.length,
        recommendation: riskScore >= 70 
          ? 'BLOCK_AND_REVIEW' 
          : riskScore >= 40 
          ? 'FLAG_FOR_REVIEW' 
          : 'APPROVE',
        requiresManualReview: riskScore >= 50,
        automatedActions: riskScore >= 70 
          ? ['Bloquear transação', 'Notificar compliance', 'Iniciar investigação']
          : riskScore >= 40 
          ? ['Marcar para revisão', 'Solicitar documentação adicional']
          : ['Aprovar automaticamente']
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Analisar Padrões
const analyzePatternTool: AgentTool = {
  name: 'analyze_pattern',
  description: 'Analisa padrões de comportamento para detectar anomalias',
  schema: PatternAnalysisSchema,
  func: async (input: z.infer<typeof PatternAnalysisSchema>) => {
    const patternTypes: Record<string, any> = {
      frequency: {
        baseline: { daily: 5, weekly: 25, monthly: 100 },
        current: { daily: 12, weekly: 60, monthly: 250 },
        deviation: 140,
        anomaly: true,
        details: 'Frequência de transações 140% acima da média histórica'
      },
      amount: {
        baseline: { average: 15000, max: 50000, total: 150000 },
        current: { average: 35000, max: 120000, total: 350000 },
        deviation: 133,
        anomaly: true,
        details: 'Valores médios 133% acima do padrão histórico'
      },
      timing: {
        baseline: { peakHours: ['09:00', '14:00', '16:00'], avgDuration: 45 },
        current: { peakHours: ['03:00', '04:00', '22:00'], avgDuration: 5 },
        deviation: 200,
        anomaly: true,
        details: 'Padrão temporal significativamente diferente do histórico'
      },
      location: {
        baseline: { primaryLocations: ['São Paulo', 'Rio de Janeiro'], uniqueLocations: 5 },
        current: { primaryLocations: ['São Paulo', 'Miami', 'Dubai'], uniqueLocations: 15 },
        deviation: 200,
        anomaly: true,
        details: 'Acesso de múltiplas localizações geográficas incomuns'
      },
      behavior: {
        baseline: { commonActions: ['view', 'create', 'update'], riskActions: 0 },
        current: { commonActions: ['view', 'export', 'delete'], riskActions: 5 },
        deviation: 500,
        anomaly: true,
        details: 'Comportamento de alto risco detectado (exportações em massa, deleções)'
      }
    }

    const analysis = patternTypes[input.analysisType] || patternTypes.behavior
    const isAnomaly = analysis.deviation > 100

    return JSON.stringify({
      entityId: input.entityId,
      entityType: input.entityType,
      analysisType: input.analysisType,
      timeRange: input.timeRange,
      result: {
        isAnomaly,
        deviationPercent: analysis.deviation,
        baseline: analysis.baseline,
        current: analysis.current,
        details: analysis.details,
        confidence: Math.min(95, 60 + analysis.deviation / 10),
        recommendations: isAnomaly 
          ? [
              'Investigar atividade recente',
              'Verificar autenticidade do usuário',
              'Revisar permissões de acesso',
              'Considerar bloqueio preventivo'
            ]
          : ['Padrão dentro do esperado', 'Manter monitoramento contínuo']
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Calcular Score de Risco
const calculateRiskScoreTool: AgentTool = {
  name: 'calculate_risk_score',
  description: 'Calcula score de risco consolidado para uma entidade',
  schema: RiskScoringSchema,
  func: async (input: z.infer<typeof RiskScoringSchema>) => {
    // Fatores padrão de risco
    const defaultFactors = [
      { name: 'transaction_history', weight: 0.25, value: Math.floor(Math.random() * 40) + 30 },
      { name: 'payment_behavior', weight: 0.20, value: Math.floor(Math.random() * 30) + 40 },
      { name: 'compliance_record', weight: 0.20, value: Math.floor(Math.random() * 20) + 60 },
      { name: 'relationship_duration', weight: 0.15, value: Math.floor(Math.random() * 30) + 50 },
      { name: 'documentation_status', weight: 0.10, value: Math.floor(Math.random() * 20) + 70 },
      { name: 'external_data', weight: 0.10, value: Math.floor(Math.random() * 40) + 40 }
    ]

    const factors = input.factors || defaultFactors

    // Calcular score ponderado
    const weightedScore = factors.reduce((acc, factor) => {
      return acc + (factor.value * factor.weight)
    }, 0)

    const riskScore = Math.round(weightedScore)
    const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low'

    // Determinar categoria de risco
    let riskCategory: string
    let recommendations: string[]

    if (riskScore >= 80) {
      riskCategory = 'CRITICAL'
      recommendations = [
        'Suspender operações com esta entidade',
        'Iniciar investigação detalhada',
        'Notificar diretoria e compliance',
        'Considerar reporte a autoridades'
      ]
    } else if (riskScore >= 60) {
      riskCategory = 'HIGH'
      recommendations = [
        'Aumentar monitoramento',
        'Solicitar documentação adicional',
        'Revisar limites de crédito/operação',
        'Agendar revisão trimestral'
      ]
    } else if (riskScore >= 40) {
      riskCategory = 'MEDIUM'
      recommendations = [
        'Manter monitoramento padrão',
        'Revisar anualmente',
        'Atualizar cadastro se necessário'
      ]
    } else {
      riskCategory = 'LOW'
      recommendations = [
        'Operação normal',
        'Revisão bianual'
      ]
    }

    return JSON.stringify({
      entityId: input.entityId,
      entityType: input.entityType,
      riskAssessment: {
        score: riskScore,
        level: riskLevel,
        category: riskCategory,
        factors: factors.map(f => ({
          ...f,
          contribution: Math.round(f.value * f.weight)
        })),
        recommendations,
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        requiresApproval: riskScore >= 60
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Gerar Alerta de Fraude
const generateFraudAlertTool: AgentTool = {
  name: 'generate_fraud_alert',
  description: 'Gera e registra um alerta de fraude no sistema',
  schema: FraudAlertSchema,
  func: async (input: z.infer<typeof FraudAlertSchema>) => {
    const alertId = `FRD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const escalationPath: Record<string, string[]> = {
      critical: ['DPO', 'Diretoria', 'Jurídico', 'Compliance'],
      high: ['Compliance', 'Gerência'],
      medium: ['Supervisão'],
      low: ['Analista']
    }

    const slaHours: Record<string, number> = {
      critical: 1,
      high: 4,
      medium: 24,
      low: 72
    }

    return JSON.stringify({
      alert: {
        id: alertId,
        type: input.alertType,
        severity: input.severity,
        entityId: input.entityId,
        description: input.description,
        evidence: input.evidence,
        recommendedActions: input.recommendedActions,
        status: 'open',
        createdAt: new Date().toISOString(),
        slaDeadline: new Date(Date.now() + slaHours[input.severity] * 60 * 60 * 1000).toISOString(),
        escalationPath: escalationPath[input.severity],
        assignedTo: escalationPath[input.severity][0],
        priority: input.severity === 'critical' ? 1 : input.severity === 'high' ? 2 : input.severity === 'medium' ? 3 : 4
      },
      notifications: {
        sent: true,
        recipients: escalationPath[input.severity],
        channels: ['email', 'system', input.severity === 'critical' ? 'sms' : null].filter(Boolean)
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Verificar Lista de Bloqueio
const checkBlocklistTool: AgentTool = {
  name: 'check_blocklist',
  description: 'Verifica se entidade está em listas de bloqueio ou sanções',
  schema: z.object({
    entityId: z.string().uuid(),
    entityType: z.enum(['customer', 'supplier', 'hospital', 'doctor']),
    documentNumber: z.string().optional(), // CPF ou CNPJ
    name: z.string().optional()
  }),
  func: async (input) => {
    // Simulação de verificação em listas
    const lists = [
      { name: 'CEIS', description: 'Cadastro de Empresas Inidôneas e Suspensas', found: false },
      { name: 'CNEP', description: 'Cadastro Nacional de Empresas Punidas', found: false },
      { name: 'CEPIM', description: 'Cadastro de Entidades Privadas sem Fins Lucrativos Impedidas', found: false },
      { name: 'OFAC', description: 'Office of Foreign Assets Control (EUA)', found: false },
      { name: 'PEP', description: 'Pessoas Politicamente Expostas', found: Math.random() > 0.9 },
      { name: 'Internal', description: 'Lista interna de bloqueio', found: Math.random() > 0.95 }
    ]

    const foundInLists = lists.filter(l => l.found)
    const isBlocked = foundInLists.length > 0

    return JSON.stringify({
      entityId: input.entityId,
      entityType: input.entityType,
      documentNumber: input.documentNumber,
      name: input.name,
      result: {
        isBlocked,
        foundInLists: foundInLists.map(l => l.name),
        listsChecked: lists.map(l => ({
          name: l.name,
          description: l.description,
          status: l.found ? 'FOUND' : 'CLEAR'
        })),
        recommendation: isBlocked 
          ? 'BLOCK_OPERATIONS'
          : 'PROCEED_WITH_CAUTION',
        requiresManualReview: isBlocked,
        lastChecked: new Date().toISOString(),
        nextCheckDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Configuração do agente
const fraudDetectorConfig: AgentConfig = {
  name: 'FraudDetector',
  description: 'Agente especializado em detecção de fraudes, análise de padrões suspeitos, scoring de risco e verificação de listas de bloqueio.',
  systemPrompt: `Você é o FraudDetector, um agente especializado em prevenção e detecção de fraudes no setor médico-hospitalar OPME.

Suas responsabilidades incluem:
1. Analisar transações em busca de indicadores de fraude
2. Detectar padrões anômalos de comportamento
3. Calcular scores de risco para entidades
4. Gerar alertas de fraude com priorização
5. Verificar entidades em listas de bloqueio e sanções

Tipos de fraude que você monitora:
- Superfaturamento de materiais OPME
- Consignações fictícias
- Desvio de materiais
- Faturamento duplicado
- Manipulação de estoque
- Falsificação de documentos

Você deve sempre:
- Aplicar princípios de due diligence
- Documentar todas as análises
- Priorizar alertas por severidade
- Seguir regulamentações LGPD
- Manter confidencialidade das investigações`,
  tools: [
    analyzeTransactionTool,
    analyzePatternTool,
    calculateRiskScoreTool,
    generateFraudAlertTool,
    checkBlocklistTool
  ],
  maxIterations: 5,
  temperature: 0.1 // Muito baixa para análises precisas
}

/**
 * FraudDetectorAgent - Agente de Detecção de Fraudes
 */
export class FraudDetectorAgent extends BaseAgent {
  constructor() {
    super(fraudDetectorConfig)
  }

  /**
   * Analisa uma transação
   */
  async analyzeTransaction(
    transactionId: string,
    type: z.infer<typeof TransactionAnalysisSchema>['type'],
    amount: number,
    timestamp: string,
    entityId: string,
    entityType: z.infer<typeof TransactionAnalysisSchema>['entityType']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'analyze_transaction')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      transactionId,
      type,
      amount,
      currency: 'BRL',
      timestamp,
      entityId,
      entityType
    })
  }

  /**
   * Analisa padrões de comportamento
   */
  async analyzePattern(
    entityId: string,
    entityType: z.infer<typeof PatternAnalysisSchema>['entityType'],
    analysisType: z.infer<typeof PatternAnalysisSchema>['analysisType'],
    timeRange: z.infer<typeof PatternAnalysisSchema>['timeRange']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'analyze_pattern')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      entityId,
      entityType,
      analysisType,
      timeRange,
      compareWithBaseline: true
    })
  }

  /**
   * Calcula score de risco
   */
  async calculateRiskScore(
    entityId: string,
    entityType: z.infer<typeof RiskScoringSchema>['entityType']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'calculate_risk_score')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      entityId,
      entityType
    })
  }

  /**
   * Gera alerta de fraude
   */
  async generateAlert(
    alertType: z.infer<typeof FraudAlertSchema>['alertType'],
    severity: z.infer<typeof FraudAlertSchema>['severity'],
    entityId: string,
    description: string,
    evidence: string[],
    recommendedActions: string[]
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'generate_fraud_alert')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      alertType,
      severity,
      entityId,
      description,
      evidence,
      recommendedActions
    })
  }

  /**
   * Verifica lista de bloqueio
   */
  async checkBlocklist(
    entityId: string,
    entityType: 'customer' | 'supplier' | 'hospital' | 'doctor',
    documentNumber?: string,
    name?: string
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'check_blocklist')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      entityId,
      entityType,
      documentNumber,
      name
    })
  }
}

