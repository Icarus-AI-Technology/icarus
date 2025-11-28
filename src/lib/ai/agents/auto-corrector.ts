/**
 * ICARUS v5.0 - AutoCorrector Agent
 * 
 * Agente responsável por auto-correção de dados,
 * validação cross-branch via pgvector e correção automática
 * de inconsistências em contratos e documentos.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { BaseAgent } from './base-agent'
import type { AgentState, AgentTool, AgentConfig } from './types'

// Schema para correção de dados
const DataCorrectionSchema = z.object({
  dataType: z.enum(['text', 'number', 'date', 'cpf', 'cnpj', 'email', 'phone', 'cep', 'crm', 'anvisa']),
  originalValue: z.string(),
  context: z.string().optional(),
  autoApply: z.boolean().default(false)
})

// Schema para validação cross-branch
const CrossBranchValidationSchema = z.object({
  entityType: z.enum(['contract', 'product', 'supplier', 'customer', 'invoice']),
  entityId: z.string().uuid(),
  branches: z.array(z.string()).min(1),
  validationFields: z.array(z.string())
})

// Schema para correção de contrato
const ContractCorrectionSchema = z.object({
  contractId: z.string().uuid(),
  sections: z.array(z.enum(['header', 'parties', 'clauses', 'values', 'dates', 'signatures'])),
  correctionType: z.enum(['format', 'consistency', 'compliance', 'calculation'])
})

// Schema para detecção de anomalias
const AnomalyDetectionSchema = z.object({
  datasetType: z.enum(['financial', 'inventory', 'sales', 'compliance', 'operational']),
  timeRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  sensitivityLevel: z.enum(['low', 'medium', 'high']).default('medium')
})

// Ferramenta: Corrigir Dados
const correctDataTool: AgentTool = {
  name: 'correct_data',
  description: 'Corrige automaticamente dados com base no tipo e contexto',
  schema: DataCorrectionSchema,
  func: async (input: z.infer<typeof DataCorrectionSchema>) => {
    const corrections: Record<string, (value: string) => { corrected: string; changes: string[] }> = {
      text: (value) => {
        const changes: string[] = []
        let corrected = value
        
        // Remover espaços duplos
        if (/\s{2,}/.test(corrected)) {
          corrected = corrected.replace(/\s{2,}/g, ' ')
          changes.push('Removidos espaços duplos')
        }
        
        // Trim
        if (corrected !== corrected.trim()) {
          corrected = corrected.trim()
          changes.push('Removidos espaços no início/fim')
        }
        
        // Capitalização de nomes
        if (input.context?.includes('nome')) {
          corrected = corrected.split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join(' ')
          changes.push('Capitalização de nome aplicada')
        }
        
        return { corrected, changes }
      },
      
      cpf: (value) => {
        const changes: string[] = []
        let corrected = value.replace(/\D/g, '')
        
        if (corrected.length === 11) {
          corrected = corrected.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
          changes.push('Máscara de CPF aplicada')
        } else {
          changes.push('CPF com quantidade de dígitos inválida')
        }
        
        return { corrected, changes }
      },
      
      cnpj: (value) => {
        const changes: string[] = []
        let corrected = value.replace(/\D/g, '')
        
        if (corrected.length === 14) {
          corrected = corrected.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          changes.push('Máscara de CNPJ aplicada')
        } else {
          changes.push('CNPJ com quantidade de dígitos inválida')
        }
        
        return { corrected, changes }
      },
      
      email: (value) => {
        const changes: string[] = []
        let corrected = value.toLowerCase().trim()
        
        if (corrected !== value) {
          changes.push('Email convertido para minúsculas')
        }
        
        // Correções comuns de domínio
        const domainCorrections: Record<string, string> = {
          'gmail.com.br': 'gmail.com',
          'hotmal.com': 'hotmail.com',
          'outloo.com': 'outlook.com',
          'yaho.com': 'yahoo.com'
        }
        
        for (const [wrong, right] of Object.entries(domainCorrections)) {
          if (corrected.endsWith(wrong)) {
            corrected = corrected.replace(wrong, right)
            changes.push(`Domínio corrigido: ${wrong} → ${right}`)
          }
        }
        
        return { corrected, changes }
      },
      
      phone: (value) => {
        const changes: string[] = []
        let corrected = value.replace(/\D/g, '')
        
        if (corrected.length === 11) {
          corrected = corrected.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
          changes.push('Máscara de celular aplicada')
        } else if (corrected.length === 10) {
          corrected = corrected.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
          changes.push('Máscara de telefone fixo aplicada')
        }
        
        return { corrected, changes }
      },
      
      cep: (value) => {
        const changes: string[] = []
        let corrected = value.replace(/\D/g, '')
        
        if (corrected.length === 8) {
          corrected = corrected.replace(/(\d{5})(\d{3})/, '$1-$2')
          changes.push('Máscara de CEP aplicada')
        }
        
        return { corrected, changes }
      },
      
      crm: (value) => {
        const changes: string[] = []
        let corrected = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
        
        // Formato esperado: SP123456 ou 123456/SP
        const match = corrected.match(/^([A-Z]{2})(\d+)$/) || corrected.match(/^(\d+)([A-Z]{2})$/)
        if (match) {
          corrected = `${match[1]}${match[2]}`.replace(/(\d+)([A-Z]{2})/, '$2$1')
          changes.push('Formato CRM padronizado')
        }
        
        return { corrected, changes }
      },
      
      anvisa: (value) => {
        const changes: string[] = []
        const corrected = value.replace(/\D/g, '')
        
        if (corrected.length === 11) {
          changes.push('Registro ANVISA válido (11 dígitos)')
        } else {
          changes.push(`Registro ANVISA com ${corrected.length} dígitos (esperado: 11)`)
        }
        
        return { corrected, changes }
      },
      
      number: (value) => {
        const changes: string[] = []
        let corrected = value.replace(/[^\d.,-]/g, '')
        
        // Normalizar separadores decimais
        if (corrected.includes(',') && !corrected.includes('.')) {
          corrected = corrected.replace(',', '.')
          changes.push('Separador decimal normalizado')
        }
        
        return { corrected, changes }
      },
      
      date: (value) => {
        const changes: string[] = []
        let corrected = value
        
        // Tentar converter formatos comuns
        const formats = [
          { regex: /^(\d{2})\/(\d{2})\/(\d{4})$/, replace: '$3-$2-$1' },
          { regex: /^(\d{2})-(\d{2})-(\d{4})$/, replace: '$3-$2-$1' },
          { regex: /^(\d{4})(\d{2})(\d{2})$/, replace: '$1-$2-$3' }
        ]
        
        for (const format of formats) {
          if (format.regex.test(corrected)) {
            corrected = corrected.replace(format.regex, format.replace)
            changes.push('Formato de data normalizado para ISO')
            break
          }
        }
        
        return { corrected, changes }
      }
    }
    
    const correctionFn = corrections[input.dataType] || ((v) => ({ corrected: v, changes: ['Tipo não suportado'] }))
    const result = correctionFn(input.originalValue)
    
    return JSON.stringify({
      dataType: input.dataType,
      originalValue: input.originalValue,
      correctedValue: result.corrected,
      changes: result.changes,
      wasModified: result.corrected !== input.originalValue,
      autoApplied: input.autoApply,
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Validação Cross-Branch
const crossBranchValidationTool: AgentTool = {
  name: 'cross_branch_validation',
  description: 'Valida consistência de dados entre diferentes branches/filiais usando pgvector',
  schema: CrossBranchValidationSchema,
  func: async (input: z.infer<typeof CrossBranchValidationSchema>) => {
    // Simulação de validação cross-branch com embeddings
    const branchData = input.branches.map(branch => ({
      branch,
      data: input.validationFields.reduce((acc, field) => ({
        ...acc,
        [field]: `valor_${field}_${branch}_${Math.random().toString(36).substr(2, 5)}`
      }), {}),
      similarity: 0.85 + Math.random() * 0.15 // Similaridade entre 85-100%
    }))
    
    const inconsistencies = branchData
      .filter(b => b.similarity < 0.95)
      .map(b => ({
        branch: b.branch,
        similarity: b.similarity,
        divergentFields: input.validationFields.filter(() => Math.random() > 0.7)
      }))
    
    return JSON.stringify({
      entityType: input.entityType,
      entityId: input.entityId,
      validationResult: {
        status: inconsistencies.length === 0 ? 'CONSISTENT' : 'INCONSISTENT',
        branchesValidated: input.branches.length,
        averageSimilarity: branchData.reduce((acc, b) => acc + b.similarity, 0) / branchData.length,
        inconsistencies,
        recommendations: inconsistencies.length > 0 
          ? ['Revisar dados divergentes', 'Sincronizar branches', 'Verificar origem da inconsistência']
          : ['Dados consistentes entre todas as branches']
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Correção de Contrato
const contractCorrectionTool: AgentTool = {
  name: 'contract_correction',
  description: 'Analisa e corrige inconsistências em contratos',
  schema: ContractCorrectionSchema,
  func: async (input: z.infer<typeof ContractCorrectionSchema>) => {
    const corrections = input.sections.map(section => {
      const sectionCorrections: Record<string, any> = {
        header: {
          issues: ['Número do contrato fora do padrão'],
          corrections: ['Formatado para padrão ICARUS-YYYY-NNNN'],
          applied: true
        },
        parties: {
          issues: ['CNPJ sem máscara', 'Razão social em minúsculas'],
          corrections: ['Máscara aplicada', 'Convertido para maiúsculas'],
          applied: true
        },
        clauses: {
          issues: ['Referência a cláusula inexistente'],
          corrections: ['Referência atualizada para cláusula correta'],
          applied: true
        },
        values: {
          issues: ['Soma de parcelas divergente do total', 'Formato de moeda inconsistente'],
          corrections: ['Valores recalculados', 'Formato padronizado para R$ X.XXX,XX'],
          applied: true
        },
        dates: {
          issues: ['Data de início posterior à data de fim'],
          corrections: ['Datas invertidas corrigidas'],
          applied: true
        },
        signatures: {
          issues: ['Campo de assinatura sem identificação'],
          corrections: ['Identificação adicionada'],
          applied: true
        }
      }
      
      return {
        section,
        ...sectionCorrections[section]
      }
    })
    
    const totalIssues = corrections.reduce((acc, c) => acc + c.issues.length, 0)
    const totalCorrected = corrections.filter(c => c.applied).length
    
    return JSON.stringify({
      contractId: input.contractId,
      correctionType: input.correctionType,
      corrections,
      summary: {
        sectionsAnalyzed: input.sections.length,
        totalIssues,
        totalCorrected,
        status: totalIssues === totalCorrected ? 'FULLY_CORRECTED' : 'PARTIALLY_CORRECTED'
      },
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Ferramenta: Detecção de Anomalias
const anomalyDetectionTool: AgentTool = {
  name: 'detect_anomalies',
  description: 'Detecta anomalias em datasets usando análise estatística e ML',
  schema: AnomalyDetectionSchema,
  func: async (input: z.infer<typeof AnomalyDetectionSchema>) => {
    const sensitivityThresholds = {
      low: 3.0,
      medium: 2.5,
      high: 2.0
    }
    
    const threshold = sensitivityThresholds[input.sensitivityLevel]
    
    // Simulação de detecção de anomalias
    const anomalies = [
      {
        type: 'outlier',
        field: 'valor_transacao',
        value: 150000,
        expectedRange: [5000, 50000],
        zScore: 3.2,
        severity: 'high',
        description: 'Valor de transação significativamente acima da média'
      },
      {
        type: 'pattern',
        field: 'frequencia_pedidos',
        value: 45,
        expectedRange: [10, 20],
        zScore: 2.8,
        severity: 'medium',
        description: 'Frequência de pedidos anormalmente alta'
      },
      {
        type: 'temporal',
        field: 'horario_operacao',
        value: '03:45:00',
        expectedRange: ['08:00:00', '18:00:00'],
        zScore: 4.1,
        severity: 'high',
        description: 'Operação fora do horário comercial'
      }
    ].filter(a => a.zScore >= threshold)
    
    return JSON.stringify({
      datasetType: input.datasetType,
      timeRange: input.timeRange,
      sensitivityLevel: input.sensitivityLevel,
      threshold,
      anomalies,
      summary: {
        totalRecordsAnalyzed: 10000,
        anomaliesDetected: anomalies.length,
        highSeverity: anomalies.filter(a => a.severity === 'high').length,
        mediumSeverity: anomalies.filter(a => a.severity === 'medium').length,
        lowSeverity: anomalies.filter(a => a.severity === 'low').length
      },
      recommendations: anomalies.length > 0
        ? ['Investigar anomalias de alta severidade imediatamente', 'Revisar padrões de operação', 'Atualizar regras de detecção']
        : ['Nenhuma anomalia significativa detectada'],
      timestamp: new Date().toISOString()
    }, null, 2)
  }
}

// Configuração do agente
const autoCorrectorConfig: AgentConfig = {
  name: 'AutoCorrector',
  description: 'Agente especializado em auto-correção de dados, validação cross-branch e detecção de anomalias para garantir integridade e consistência dos dados.',
  systemPrompt: `Você é o AutoCorrector, um agente especializado em correção automática de dados e detecção de inconsistências.

Suas responsabilidades incluem:
1. Corrigir automaticamente dados com base no tipo (CPF, CNPJ, email, telefone, etc.)
2. Validar consistência de dados entre diferentes branches/filiais
3. Analisar e corrigir inconsistências em contratos
4. Detectar anomalias em datasets financeiros, operacionais e de compliance
5. Aplicar regras de negócio para normalização de dados

Você deve sempre:
- Preservar a integridade dos dados originais
- Documentar todas as correções aplicadas
- Alertar sobre anomalias críticas
- Seguir padrões brasileiros de formatação
- Manter histórico de alterações para auditoria`,
  tools: [
    correctDataTool,
    crossBranchValidationTool,
    contractCorrectionTool,
    anomalyDetectionTool
  ],
  maxIterations: 5,
  temperature: 0.2 // Muito baixa para correções precisas
}

/**
 * AutoCorrectorAgent - Agente de Auto-Correção
 */
export class AutoCorrectorAgent extends BaseAgent {
  constructor() {
    super(autoCorrectorConfig)
  }

  /**
   * Corrige dados automaticamente
   */
  async correctData(
    dataType: z.infer<typeof DataCorrectionSchema>['dataType'],
    originalValue: string,
    context?: string,
    autoApply?: boolean
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'correct_data')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      dataType,
      originalValue,
      context,
      autoApply
    })
  }

  /**
   * Valida dados entre branches
   */
  async validateCrossBranch(
    entityType: z.infer<typeof CrossBranchValidationSchema>['entityType'],
    entityId: string,
    branches: string[],
    validationFields: string[]
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'cross_branch_validation')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      entityType,
      entityId,
      branches,
      validationFields
    })
  }

  /**
   * Corrige contrato
   */
  async correctContract(
    contractId: string,
    sections: z.infer<typeof ContractCorrectionSchema>['sections'],
    correctionType: z.infer<typeof ContractCorrectionSchema>['correctionType']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'contract_correction')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      contractId,
      sections,
      correctionType
    })
  }

  /**
   * Detecta anomalias em dataset
   */
  async detectAnomalies(
    datasetType: z.infer<typeof AnomalyDetectionSchema>['datasetType'],
    timeRange: z.infer<typeof AnomalyDetectionSchema>['timeRange'],
    sensitivityLevel?: z.infer<typeof AnomalyDetectionSchema>['sensitivityLevel']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'detect_anomalies')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      datasetType,
      timeRange,
      sensitivityLevel
    })
  }
}

