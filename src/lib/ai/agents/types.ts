/**
 * ICARUS v5.0 - Tipos para Sistema de Agentes Tutores
 * 
 * Definições de tipos para o framework de agentes LangGraph
 * com memory persistente e tools Zod-validadas.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'

// ============ TIPOS BASE ============

export type AgentType = 
  | 'training-tutor'
  | 'test-certifier'
  | 'error-predictor'
  | 'auto-corrector'
  | 'user-guide'
  | 'log-auditor'
  | 'secretary'

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error' | 'waiting_human'

export type AgentPriority = 'low' | 'medium' | 'high' | 'critical'

// ============ SCHEMAS ZOD ============

export const AgentMessageSchema = z.object({
  id: z.string().uuid(),
  agentType: z.enum(['training-tutor', 'test-certifier', 'error-predictor', 'auto-corrector', 'user-guide', 'log-auditor', 'secretary']),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  toolCalls: z.array(z.object({
    id: z.string(),
    name: z.string(),
    arguments: z.record(z.unknown()),
    result: z.unknown().optional(),
  })).optional(),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime(),
})

export const AgentStateSchema = z.object({
  sessionId: z.string().uuid(),
  agentType: z.enum(['training-tutor', 'test-certifier', 'error-predictor', 'auto-corrector', 'user-guide', 'log-auditor', 'secretary']),
  status: z.enum(['idle', 'processing', 'completed', 'error', 'waiting_human']),
  messages: z.array(AgentMessageSchema),
  context: z.record(z.unknown()),
  toolsUsed: z.array(z.string()),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime().optional(),
  error: z.string().optional(),
})

export const AgentToolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.record(z.unknown()),
  handler: z.function().args(z.record(z.unknown())).returns(z.promise(z.unknown())),
})

export const AgentConfigSchema = z.object({
  type: z.enum(['training-tutor', 'test-certifier', 'error-predictor', 'auto-corrector', 'user-guide', 'log-auditor', 'secretary']),
  name: z.string(),
  description: z.string(),
  systemPrompt: z.string(),
  tools: z.array(z.string()),
  llmProvider: z.enum(['claude', 'openai', 'openai-mini']).default('claude'),
  temperature: z.number().min(0).max(2).default(0),
  maxTokens: z.number().min(100).max(8192).default(4096),
  enableMemory: z.boolean().default(true),
  enableRAG: z.boolean().default(true),
  enableHITL: z.boolean().default(false),
  hitlThreshold: z.number().min(0).max(1).default(0.05),
})

// ============ TIPOS INFERIDOS ============

export type AgentMessage = z.infer<typeof AgentMessageSchema>
export type AgentState = z.infer<typeof AgentStateSchema>
export type AgentTool = z.infer<typeof AgentToolSchema>
export type AgentConfig = z.infer<typeof AgentConfigSchema>

// ============ INTERFACES ============

export interface AgentInput {
  message: string
  sessionId?: string
  userId?: string
  context?: Record<string, unknown>
  moduleContext?: {
    module: string
    subModule?: string
    action?: string
    data?: Record<string, unknown>
  }
}

export interface AgentOutput {
  sessionId: string
  response: string
  toolsUsed: string[]
  structuredData?: Record<string, unknown>
  suggestions?: string[]
  nextActions?: AgentAction[]
  requiresHumanApproval: boolean
  confidence: number
  processingTimeMs: number
}

export interface AgentAction {
  id: string
  type: 'navigate' | 'fill_form' | 'submit' | 'validate' | 'alert' | 'log'
  target?: string
  data?: Record<string, unknown>
  description: string
}

export interface AgentMemory {
  sessionId: string
  userId?: string
  messages: AgentMessage[]
  context: Record<string, unknown>
  createdAt: string
  updatedAt: string
  expiresAt?: string
}

export interface AgentMetrics {
  agentType: AgentType
  totalSessions: number
  avgProcessingTimeMs: number
  successRate: number
  hitlRate: number
  toolUsageCount: Record<string, number>
  errorCount: number
  lastUpdated: string
}

// ============ EVENTOS ============

export interface AgentEvent {
  type: 'started' | 'tool_called' | 'tool_completed' | 'response_generated' | 'error' | 'hitl_required' | 'completed'
  agentType: AgentType
  sessionId: string
  timestamp: string
  data?: Record<string, unknown>
}

export type AgentEventHandler = (event: AgentEvent) => void | Promise<void>

// ============ FEEDBACK ============

export interface AgentFeedback {
  sessionId: string
  rating: 1 | 2 | 3 | 4 | 5
  helpful: boolean
  comment?: string
  corrections?: string
  timestamp: string
}

// ============ RAGAS METRICS ============

export interface RAGASMetrics {
  faithfulness: number      // 0-1: Resposta fiel ao contexto
  answerRelevancy: number   // 0-1: Relevância da resposta
  contextPrecision: number  // 0-1: Precisão do contexto recuperado
  contextRecall: number     // 0-1: Recall do contexto
  overallScore: number      // 0-1: Score geral
}

// ============ CONFIGURAÇÕES DE AGENTES ============

export const AGENT_CONFIGS: Record<AgentType, Omit<AgentConfig, 'type'>> = {
  'training-tutor': {
    name: 'Training Tutor',
    description: 'Treina módulos via simulações e gera datasets sintéticos para fine-tuning',
    systemPrompt: `Você é o Training Tutor do ICARUS, especializado em treinamento de módulos de ERP médico-hospitalar.

SUAS RESPONSABILIDADES:
1. Criar simulações de cenários regulatórios (RDC 59, RDC 751, etc.)
2. Gerar datasets sintéticos para validação de conhecimento
3. Avaliar respostas de outros agentes
4. Identificar gaps de conhecimento e sugerir melhorias

MÓDULOS QUE VOCÊ TREINA:
- Estoque IA: Rastreabilidade, FEFO, alertas de vencimento
- Cirurgias: Agendamento, materiais, conformidade ANVISA
- Financeiro: Faturamento, NF-e, inadimplência

REGRAS:
- Sempre cite a regulamentação relevante (RDC, IN, etc.)
- Gere cenários realistas baseados em dados do setor OPME
- Avalie com métricas objetivas (precisão, recall, F1)
- Responda em português brasileiro`,
    tools: ['generate_scenario', 'evaluate_response', 'create_dataset', 'search_regulations'],
    llmProvider: 'claude',
    temperature: 0.3,
    maxTokens: 4096,
    enableMemory: true,
    enableRAG: true,
    enableHITL: false,
    hitlThreshold: 0.05,
  },

  'test-certifier': {
    name: 'Test Certifier',
    description: 'Executa testes E2E, certifica conformidade ISO 42001 AIMS e gera relatórios',
    systemPrompt: `Você é o Test Certifier do ICARUS, especializado em certificação e testes de qualidade.

SUAS RESPONSABILIDADES:
1. Executar e validar testes E2E (Playwright)
2. Certificar conformidade com ISO 42001 AIMS
3. Gerar relatórios de auditoria automáticos
4. Validar mocks de NF-e e integrações

CERTIFICAÇÕES QUE VOCÊ VALIDA:
- ISO 42001: AI Management System
- RDC 751/2022: Registro de dispositivos médicos
- LGPD: Proteção de dados pessoais
- WCAG 2.1 AA: Acessibilidade

REGRAS:
- Documente todos os testes executados
- Gere evidências para auditoria
- Classifique severidade de falhas (crítica, alta, média, baixa)
- Responda em português brasileiro`,
    tools: ['run_test', 'validate_compliance', 'generate_report', 'check_accessibility'],
    llmProvider: 'openai',
    temperature: 0,
    maxTokens: 4096,
    enableMemory: true,
    enableRAG: true,
    enableHITL: true,
    hitlThreshold: 0.1,
  },

  'error-predictor': {
    name: 'Error Predictor',
    description: 'Prediz falhas e envia alertas proativos usando ML e análise de padrões',
    systemPrompt: `Você é o Error Predictor do ICARUS, especializado em predição de falhas e alertas proativos.

SUAS RESPONSABILIDADES:
1. Predizer riscos de vencimento de lotes (RDC 59)
2. Identificar padrões de inadimplência
3. Detectar anomalias em operações
4. Enviar alertas proativos antes de falhas

TIPOS DE PREDIÇÃO:
- Estoque: Vencimento de lotes, ruptura, excesso
- Financeiro: Inadimplência, glosas, atrasos
- Cirurgias: Falta de materiais, conflitos de agenda
- Compliance: Vencimento de registros ANVISA

REGRAS:
- Use dados históricos para predições
- Classifique urgência (crítica, alta, média, baixa)
- Sugira ações preventivas específicas
- Responda em português brasileiro`,
    tools: ['predict_expiration', 'analyze_patterns', 'detect_anomaly', 'send_alert'],
    llmProvider: 'claude',
    temperature: 0.1,
    maxTokens: 4096,
    enableMemory: true,
    enableRAG: true,
    enableHITL: false,
    hitlThreshold: 0.05,
  },

  'auto-corrector': {
    name: 'Auto Corrector',
    description: 'Corrige erros em tempo real e re-treina modelos via feedback',
    systemPrompt: `Você é o Auto Corrector do ICARUS, especializado em correção automática de erros.

SUAS RESPONSABILIDADES:
1. Validar e corrigir inputs de NF-e
2. Corrigir erros de digitação em cadastros
3. Normalizar dados inconsistentes
4. Re-treinar modelos com feedback de correções

TIPOS DE CORREÇÃO:
- NF-e: Validação de XML, campos obrigatórios, cálculos
- Cadastros: CPF/CNPJ, CRM, CNES, códigos ANVISA
- Estoque: Lotes, validades, quantidades
- Financeiro: Valores, datas, parcelas

REGRAS:
- Sempre explique a correção feita
- Mantenha log de todas as correções
- Peça confirmação para correções críticas
- Responda em português brasileiro`,
    tools: ['validate_nfe', 'correct_input', 'normalize_data', 'log_correction'],
    llmProvider: 'claude',
    temperature: 0,
    maxTokens: 2048,
    enableMemory: true,
    enableRAG: false,
    enableHITL: true,
    hitlThreshold: 0.2,
  },

  'user-guide': {
    name: 'User Guide',
    description: 'Orienta usuários com passos guiados e onboarding interativo',
    systemPrompt: `Você é o User Guide do ICARUS, especializado em orientação e onboarding de usuários.

SUAS RESPONSABILIDADES:
1. Guiar usuários em tarefas complexas passo a passo
2. Explicar funcionalidades do sistema
3. Fornecer onboarding interativo para novos usuários
4. Responder dúvidas sobre o sistema

MÓDULOS QUE VOCÊ ORIENTA:
- Dashboard: KPIs, ações rápidas, navegação
- Cadastros: Médicos, hospitais, pacientes, convênios
- Estoque: Movimentações, rastreabilidade, alertas
- Cirurgias: Agendamento, materiais, faturamento
- Financeiro: Contas, NF-e, conciliação

REGRAS:
- Use linguagem simples e direta
- Forneça exemplos práticos
- Indique atalhos e dicas úteis
- Responda em português brasileiro`,
    tools: ['get_help', 'show_tutorial', 'explain_feature', 'navigate_to'],
    llmProvider: 'claude',
    temperature: 0.5,
    maxTokens: 2048,
    enableMemory: true,
    enableRAG: true,
    enableHITL: false,
    hitlThreshold: 0.05,
  },

  'log-auditor': {
    name: 'Log Auditor',
    description: 'Grava ações em logs imutáveis e fornece dashboard para admins',
    systemPrompt: `Você é o Log Auditor do ICARUS, especializado em auditoria e logging de ações.

SUAS RESPONSABILIDADES:
1. Registrar todas as ações de usuários e sistema
2. Manter logs imutáveis para compliance
3. Gerar dashboards de auditoria para admins
4. Detectar atividades suspeitas

TIPOS DE LOG:
- Ações de usuário: Login, CRUD, downloads
- Ações de sistema: Jobs, integrações, erros
- Ações de IA: Consultas, respostas, correções
- Compliance: Alterações em dados sensíveis

REGRAS:
- Logs são imutáveis após gravação
- Inclua timestamp, usuário, IP, ação, dados
- Classifique severidade de eventos
- Responda em português brasileiro`,
    tools: ['log_action', 'query_logs', 'generate_audit_report', 'detect_suspicious'],
    llmProvider: 'openai-mini',
    temperature: 0,
    maxTokens: 2048,
    enableMemory: false,
    enableRAG: false,
    enableHITL: false,
    hitlThreshold: 0.05,
  },
}

export default {
  AgentMessageSchema,
  AgentStateSchema,
  AgentToolSchema,
  AgentConfigSchema,
  AGENT_CONFIGS,
}

