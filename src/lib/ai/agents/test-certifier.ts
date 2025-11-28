/**
 * ICARUS v5.0 - TestCertifier Agent
 * 
 * Agente responsável por certificar testes de conformidade,
 * validar certificações ANVISA/ISO e gerenciar auditorias.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'
import { BaseAgent } from './base-agent'
import type { AgentState, AgentTool, AgentConfig } from './types'

// Schema para validação de certificação
const CertificationSchema = z.object({
  certificationType: z.enum(['ANVISA', 'ISO_13485', 'ISO_9001', 'RDC_59', 'RDC_16', 'CFM', 'CUSTOM']),
  entityId: z.string().uuid(),
  entityType: z.enum(['product', 'supplier', 'process', 'professional']),
  documentNumber: z.string().optional(),
  expirationDate: z.string().optional(),
  scope: z.string().optional()
})

// Schema para teste de conformidade
const ComplianceTestSchema = z.object({
  testType: z.enum(['regulatory', 'quality', 'safety', 'traceability', 'documentation']),
  targetModule: z.string(),
  criteria: z.array(z.string()),
  severity: z.enum(['critical', 'major', 'minor']).default('major')
})

// Schema para auditoria
const AuditSchema = z.object({
  auditType: z.enum(['internal', 'external', 'surveillance', 'certification']),
  scope: z.array(z.string()),
  standard: z.string(),
  findings: z.array(z.object({
    type: z.enum(['conformity', 'non_conformity', 'observation', 'opportunity']),
    description: z.string(),
    evidence: z.string().optional(),
    corrective_action: z.string().optional()
  })).optional()
})

// Ferramenta: Validar Certificação
const validateCertificationTool: AgentTool = {
  name: 'validate_certification',
  description: 'Valida uma certificação ANVISA, ISO ou outra norma regulatória',
  schema: CertificationSchema,
  func: async (input: z.infer<typeof CertificationSchema>) => {
    // Simulação de validação via APIs externas
    const validationRules: Record<string, (doc: string) => boolean> = {
      ANVISA: (doc) => /^\d{11}$/.test(doc.replace(/\D/g, '')),
      ISO_13485: (doc) => /^ISO-\d{4}-\d{6}$/.test(doc),
      ISO_9001: (doc) => /^ISO-9001-\d{6}$/.test(doc),
      RDC_59: (doc) => doc.length >= 5,
      RDC_16: (doc) => doc.length >= 5,
      CFM: (doc) => /^[A-Z]{2}\d{4,6}$/.test(doc.toUpperCase()),
      CUSTOM: () => true
    }

    const isValid = input.documentNumber 
      ? validationRules[input.certificationType]?.(input.documentNumber) ?? false
      : false

    const expirationStatus = input.expirationDate
      ? new Date(input.expirationDate) > new Date() ? 'valid' : 'expired'
      : 'unknown'

    return JSON.stringify({
      status: isValid ? 'valid' : 'invalid',
      certificationType: input.certificationType,
      entityId: input.entityId,
      entityType: input.entityType,
      documentNumber: input.documentNumber,
      expirationStatus,
      validatedAt: new Date().toISOString(),
      recommendations: isValid 
        ? ['Certificação válida. Agende renovação com 90 dias de antecedência.']
        : ['Certificação inválida ou expirada. Providencie renovação imediata.']
    }, null, 2)
  }
}

// Ferramenta: Executar Teste de Conformidade
const runComplianceTestTool: AgentTool = {
  name: 'run_compliance_test',
  description: 'Executa um teste de conformidade regulatória em um módulo específico',
  schema: ComplianceTestSchema,
  func: async (input: z.infer<typeof ComplianceTestSchema>) => {
    // Simulação de testes de conformidade
    const testResults = input.criteria.map((criterion, index) => ({
      criterion,
      passed: Math.random() > 0.2, // 80% de chance de passar
      score: Math.floor(Math.random() * 30) + 70, // Score entre 70-100
      evidence: `Evidência coletada para ${criterion}`,
      timestamp: new Date().toISOString()
    }))

    const overallScore = testResults.reduce((acc, r) => acc + r.score, 0) / testResults.length
    const passedCount = testResults.filter(r => r.passed).length
    const failedCount = testResults.length - passedCount

    return JSON.stringify({
      testType: input.testType,
      targetModule: input.targetModule,
      severity: input.severity,
      results: testResults,
      summary: {
        totalCriteria: testResults.length,
        passed: passedCount,
        failed: failedCount,
        overallScore: Math.round(overallScore),
        status: failedCount === 0 ? 'PASSED' : input.severity === 'critical' && failedCount > 0 ? 'FAILED' : 'PASSED_WITH_OBSERVATIONS'
      },
      executedAt: new Date().toISOString(),
      recommendations: failedCount > 0 
        ? ['Revisar critérios não atendidos', 'Implementar ações corretivas', 'Agendar re-teste']
        : ['Manter documentação atualizada', 'Agendar próxima auditoria']
    }, null, 2)
  }
}

// Ferramenta: Gerar Relatório de Auditoria
const generateAuditReportTool: AgentTool = {
  name: 'generate_audit_report',
  description: 'Gera um relatório completo de auditoria de conformidade',
  schema: AuditSchema,
  func: async (input: z.infer<typeof AuditSchema>) => {
    const findings = input.findings || [
      { type: 'conformity', description: 'Processos documentados adequadamente', evidence: 'SOPs revisados' },
      { type: 'observation', description: 'Oportunidade de melhoria em rastreabilidade', evidence: 'Logs de sistema' },
      { type: 'non_conformity', description: 'Certificação de fornecedor próxima do vencimento', corrective_action: 'Solicitar renovação' }
    ]

    const conformities = findings.filter(f => f.type === 'conformity').length
    const nonConformities = findings.filter(f => f.type === 'non_conformity').length
    const observations = findings.filter(f => f.type === 'observation').length
    const opportunities = findings.filter(f => f.type === 'opportunity').length

    return JSON.stringify({
      auditReport: {
        type: input.auditType,
        standard: input.standard,
        scope: input.scope,
        date: new Date().toISOString(),
        auditor: 'ICARUS AI TestCertifier',
        findings,
        summary: {
          conformities,
          nonConformities,
          observations,
          opportunities,
          overallStatus: nonConformities === 0 ? 'APPROVED' : nonConformities <= 2 ? 'APPROVED_WITH_CONDITIONS' : 'NOT_APPROVED'
        },
        nextAuditDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        actionPlan: nonConformities > 0 ? {
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          responsibleTeam: 'Quality Assurance',
          actions: findings
            .filter(f => f.type === 'non_conformity')
            .map(f => f.corrective_action || 'Definir ação corretiva')
        } : null
      }
    }, null, 2)
  }
}

// Ferramenta: Verificar Conformidade ANVISA
const checkAnvisaComplianceTool: AgentTool = {
  name: 'check_anvisa_compliance',
  description: 'Verifica conformidade com regulamentações ANVISA específicas para OPME',
  schema: z.object({
    productId: z.string().uuid(),
    registrationNumber: z.string(),
    checkType: z.enum(['registration', 'traceability', 'recall', 'adverse_event']).default('registration')
  }),
  func: async (input) => {
    // Simulação de consulta à API ANVISA
    const anvisaData = {
      registration: {
        number: input.registrationNumber,
        status: 'VALID',
        expirationDate: '2026-12-31',
        productClass: 'III',
        riskClass: 'Alto Risco',
        manufacturer: 'Fabricante OPME S.A.',
        technicalResponsible: 'Dr. Responsável Técnico'
      },
      traceability: {
        required: true,
        implemented: true,
        lastUpdate: new Date().toISOString(),
        batchesTracked: 150,
        patientsLinked: 89
      },
      recalls: [],
      adverseEvents: []
    }

    return JSON.stringify({
      productId: input.productId,
      checkType: input.checkType,
      anvisaData,
      complianceStatus: {
        isCompliant: true,
        score: 95,
        lastVerification: new Date().toISOString(),
        nextVerificationDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
      },
      recommendations: [
        'Manter documentação de rastreabilidade atualizada',
        'Monitorar eventos adversos continuamente',
        'Renovar registro com 6 meses de antecedência'
      ]
    }, null, 2)
  }
}

// Configuração do agente
const testCertifierConfig: AgentConfig = {
  name: 'TestCertifier',
  description: 'Agente especializado em certificação de testes, validação de conformidade regulatória (ANVISA, ISO, RDC) e gestão de auditorias para produtos OPME.',
  systemPrompt: `Você é o TestCertifier, um agente especializado em conformidade regulatória para o setor médico-hospitalar.

Suas responsabilidades incluem:
1. Validar certificações ANVISA, ISO 13485, ISO 9001, RDC 59, RDC 16 e CFM
2. Executar testes de conformidade em módulos do sistema
3. Gerar relatórios de auditoria detalhados
4. Verificar conformidade específica ANVISA para produtos OPME
5. Recomendar ações corretivas para não-conformidades

Você deve sempre:
- Seguir rigorosamente as normas regulatórias brasileiras
- Documentar todas as verificações realizadas
- Priorizar a segurança do paciente
- Manter rastreabilidade completa
- Alertar sobre certificações próximas do vencimento`,
  tools: [
    validateCertificationTool,
    runComplianceTestTool,
    generateAuditReportTool,
    checkAnvisaComplianceTool
  ],
  maxIterations: 5,
  temperature: 0.3 // Baixa temperatura para respostas mais precisas
}

/**
 * TestCertifierAgent - Agente de Certificação e Testes
 */
export class TestCertifierAgent extends BaseAgent {
  constructor() {
    super(testCertifierConfig)
  }

  /**
   * Valida uma certificação específica
   */
  async validateCertification(
    certificationType: z.infer<typeof CertificationSchema>['certificationType'],
    entityId: string,
    entityType: z.infer<typeof CertificationSchema>['entityType'],
    documentNumber?: string,
    expirationDate?: string
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'validate_certification')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      certificationType,
      entityId,
      entityType,
      documentNumber,
      expirationDate
    })
  }

  /**
   * Executa teste de conformidade em um módulo
   */
  async runComplianceTest(
    testType: z.infer<typeof ComplianceTestSchema>['testType'],
    targetModule: string,
    criteria: string[],
    severity?: z.infer<typeof ComplianceTestSchema>['severity']
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'run_compliance_test')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      testType,
      targetModule,
      criteria,
      severity
    })
  }

  /**
   * Gera relatório de auditoria
   */
  async generateAuditReport(
    auditType: z.infer<typeof AuditSchema>['auditType'],
    scope: string[],
    standard: string
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'generate_audit_report')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      auditType,
      scope,
      standard
    })
  }

  /**
   * Verifica conformidade ANVISA de um produto
   */
  async checkAnvisaCompliance(
    productId: string,
    registrationNumber: string,
    checkType?: 'registration' | 'traceability' | 'recall' | 'adverse_event'
  ): Promise<string> {
    const tool = this.tools.find(t => t.name === 'check_anvisa_compliance')
    if (!tool) throw new Error('Tool not found')
    
    return tool.func({
      productId,
      registrationNumber,
      checkType
    })
  }
}

