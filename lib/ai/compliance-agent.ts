// ============================================================================
// ICARUS v6.0 - Compliance Agent (LangGraph Workflow)
// Regras: ANVISA RDC 665/2022 + LGPD + Blockchain Audit
// ============================================================================

import { ChatAnthropic } from '@langchain/anthropic'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { StateGraph, START, END } from '@langchain/langgraph'
import { createClient } from '@supabase/supabase-js'

// ============================================================================
// Types (minimal slices of Supabase schema used by este agente)
// ============================================================================

type Nullable<T> = T | null

interface RastreabilidadeRecord {
  id: string
  empresa_id: string
  numero_lote: string
  registro_anvisa: string
  data_implante: string
  paciente_iniciais: string
  medico_crm: string
  medico_crm_uf: string
  hospital_cnes: Nullable<string>
  hash_registro: string
}

interface ConsentimentoRecord {
  id: string
  empresa_id: string
  tipo_titular: 'paciente' | 'cliente' | 'fornecedor' | 'medico'
  titular_id: string
  titular_documento: Nullable<string>
  titular_nome: Nullable<string>
  finalidade: string
  dados_coletados: Nullable<string[]>
  aceito: boolean
  revogado: boolean
  validade_dias: Nullable<number>
  expira_em: Nullable<string>
  criado_em: string
}

interface LgpdSolicitacaoRecord {
  id: string
  empresa_id: string
  tipo:
    | 'acesso'
    | 'correcao'
    | 'exclusao'
    | 'portabilidade'
    | 'revogacao_consentimento'
    | 'oposicao'
    | 'informacao'
  status:
    | 'pendente'
    | 'em_analise'
    | 'aguardando_documentos'
    | 'em_execucao'
    | 'concluida'
    | 'recusada'
  prazo_resposta: string
  criado_em: string
}

interface AuditLogRecord {
  id: string
  empresa_id: string
  tabela: string
  registro_id: string
  acao: string
  usuario_id: Nullable<string>
  block_index: number
  criado_em: string
}

interface BlockchainStatus {
  valid: boolean
  total_blocks: number
  invalid_block: Nullable<number>
  error_message: string
}

interface ComplianceReport {
  tipo: 'rastreabilidade' | 'lgpd' | 'auditoria' | 'completo'
  periodo: { inicio: string; fim: string }
  gerado_em: string
  empresa_id: string
  rastreabilidade?: {
    total_implantes: number
    por_hospital: Record<string, number>
  }
  lgpd?: {
    consentimentos_ativos: number
    solicitacoes_pendentes: number
  }
  auditoria?: {
    blockchain_valida: boolean
    total_blocos: number
  }
}

interface ComplianceAgentState {
  task: string
  context: Record<string, unknown>
  empresaId: string
  userId: string
  toolCalls: ComplianceToolCall[]
  toolResults: ComplianceToolResult[]
  violations: ComplianceViolation[]
  response: AgentResponse
}

type ComplianceToolName =
  | 'validar_rastreabilidade'
  | 'validar_blockchain'
  | 'consultar_audit_log'
  | 'consultar_consentimentos'
  | 'registrar_consentimento'
  | 'consultar_solicitacoes_lgpd'
  | 'criar_solicitacao_lgpd'
  | 'consultar_anvisa'
  | 'gerar_relatorio_compliance'
  | 'log_acesso_dados'

interface ComplianceToolCall {
  tool: ComplianceToolName
  params: Record<string, unknown>
  reason: string
}

interface ComplianceToolResult {
  tool: ComplianceToolName
  success: boolean
  data: unknown
  error?: string
}

interface ComplianceViolation {
  regulation: 'ANVISA' | 'LGPD' | 'AUDIT'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  action_required: string
}

interface AgentResponse {
  action: 'respond' | 'alert'
  data: Record<string, unknown>
  confidence: number
}

interface ToolHandlerContext {
  empresaId: string
  userId: string
}

type ToolHandler = (
  params: Record<string, unknown>,
  ctx: ToolHandlerContext
) => Promise<unknown>

// ============================================================================
// Environment + Supabase client (lazy init para evitar custos desnecessários)
// ============================================================================

const buildSupabaseClient = () => {
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.VITE_SUPABASE_URL
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'ComplianceAgent: SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios'
    )
  }

  return createClient(url, serviceKey)
}

const supabase = buildSupabaseClient()

// ============================================================================
// Prompt + LLM
// ============================================================================

export const COMPLIANCE_AGENT_PROMPT = `# ComplianceAgent - Conformidade ICARUS v6.0

Você é o ComplianceAgent, responsável por garantir ANVISA RDC 665/2022, LGPD e auditoria blockchain.

REGRAS:
- Nunca ignore uma violação crítica
- Sempre cite a regulamentação aplicável
- Exija base legal antes de acessar dados pessoais
- Utilize as ferramentas fornecidas para obter evidências

FORMATO:
- execute_tool → chama ferramenta específica
- respond → relatório consolidado
- alert → violações críticas com severidade`

const complianceLLM = new ChatAnthropic({
  modelName: 'claude-3-5-sonnet-20241022',
  temperature: 0.1,
  maxTokens: 4096,
})

// ============================================================================
// Utility helpers (todos ≤25 linhas)
// ============================================================================

const ensureString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const parseNumber = (value: unknown, fallback = 0): number =>
  typeof value === 'number' ? value : fallback

const hasTruthyValue = (values: unknown[]): boolean =>
  values.some(value => Boolean(value))

const mapChecks = (record: RastreabilidadeRecord) => ({
  numero_lote: Boolean(record.numero_lote),
  registro_anvisa: Boolean(record.registro_anvisa),
  data_implante: Boolean(record.data_implante),
  paciente_iniciais: Boolean(record.paciente_iniciais),
  medico_crm: Boolean(record.medico_crm && record.medico_crm_uf),
  hospital_cnes: Boolean(record.hospital_cnes),
  hash_registro: Boolean(record.hash_registro),
})

const summarizeChecks = (checks: Record<string, boolean>) =>
  Object.entries(checks)
    .filter(([, ok]) => !ok)
    .map(([field]) => field)

const calculateConsentStatus = (records: ConsentimentoRecord[]) => {
  const ativos = records.filter(r => r.aceito && !r.revogado)
  const revogados = records.filter(r => r.revogado)
  const proximos = records.filter(r => {
    if (!r.expira_em) return false
    return new Date(r.expira_em).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 30
  })
  return { ativos, revogados, proximos }
}

const buildReportPeriod = (context: Record<string, unknown>) => {
  const periodo = context?.periodo as Record<string, string> | undefined
  return {
    inicio: periodo?.inicio || new Date().toISOString().slice(0, 10),
    fim: periodo?.fim || new Date().toISOString().slice(0, 10),
  }
}

const safeJsonParse = <T>(raw: unknown): T | null => {
  if (typeof raw !== 'string') return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

const buildToolResult = (
  tool: ComplianceToolName,
  success: boolean,
  data: unknown,
  error?: string
): ComplianceToolResult => ({ tool, success, data, error })

// ============================================================================
// Supabase fetchers (≤25 linhas cada)
// ============================================================================

const fetchRastreabilidade = async (
  params: Record<string, unknown>,
  empresaId: string
): Promise<RastreabilidadeRecord[]> => {
  if (
    !hasTruthyValue([
      params.rastreabilidade_id,
      params.numero_lote,
      params.registro_anvisa,
    ])
  ) {
    throw new Error('Informe id, numero_lote ou registro_anvisa para rastreabilidade')
  }

  let query = supabase
    .from<RastreabilidadeRecord>('rastreabilidade_opme')
    .select('*')
    .eq('empresa_id', empresaId)

  if (params.rastreabilidade_id) {
    query = query.eq('id', params.rastreabilidade_id as string)
  }
  if (params.numero_lote) {
    query = query.eq('numero_lote', params.numero_lote as string)
  }
  if (params.registro_anvisa) {
    query = query.eq('registro_anvisa', params.registro_anvisa as string)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

const fetchBlockchainStatus = async (empresaId: string): Promise<BlockchainStatus> => {
  const { data, error } = await supabase.rpc('validate_blockchain', {
    p_empresa_id: empresaId,
  })
  if (error) throw new Error(error.message)
  const first = Array.isArray(data) ? (data[0] as BlockchainStatus) : data
  return first || { valid: false, total_blocks: 0, invalid_block: null, error_message: 'Sem dados' }
}

const fetchAuditLogs = async (
  params: Record<string, unknown>,
  empresaId: string
): Promise<AuditLogRecord[]> => {
  let query = supabase
    .from<AuditLogRecord>('audit_log_blockchain')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('block_index', { ascending: false })
    .limit(100)

  const filters: Record<string, keyof AuditLogRecord> = {
    tabela: 'tabela',
    registro_id: 'registro_id',
    usuario_id: 'usuario_id',
  }

  Object.entries(filters).forEach(([paramKey, column]) => {
    if (params[paramKey]) {
      query = query.eq(column, params[paramKey] as string)
    }
  })

  if (params.data_inicio) {
    query = query.gte('criado_em', params.data_inicio as string)
  }
  if (params.data_fim) {
    query = query.lte('criado_em', params.data_fim as string)
  }
  if (params.acao) {
    query = query.eq('acao', params.acao as string)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

const fetchConsentimentos = async (
  params: Record<string, unknown>,
  empresaId: string
): Promise<ConsentimentoRecord[]> => {
  let query = supabase
    .from<ConsentimentoRecord>('consentimentos')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })

  if (params.tipo_titular) {
    query = query.eq('tipo_titular', params.tipo_titular as string)
  }
  if (params.titular_documento) {
    query = query.eq('titular_documento', params.titular_documento as string)
  }
  if (params.apenas_ativos) {
    query = query.eq('aceito', true).eq('revogado', false)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

const fetchSolicitacoesLGPD = async (
  params: Record<string, unknown>,
  empresaId: string
): Promise<LgpdSolicitacaoRecord[]> => {
  let query = supabase
    .from<LgpdSolicitacaoRecord>('lgpd_solicitacoes')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('criado_em', { ascending: false })

  if (params.status) {
    query = query.eq('status', params.status as string)
  }
  if (params.tipo) {
    query = query.eq('tipo', params.tipo as string)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return data ?? []
}

// ============================================================================
// Tool handlers
// ============================================================================

const validarRastreabilidade: ToolHandler = async (params, ctx) => {
  const registros = await fetchRastreabilidade(params, ctx.empresaId)
  const registrosFormatados = registros.map(record => {
    const checks = mapChecks(record)
    return {
      id: record.id,
      numero_lote: record.numero_lote,
      conforme: Object.values(checks).every(Boolean),
      checks,
      pendencias: summarizeChecks(checks),
    }
  })

  return {
    total: registros.length,
    conformes: registrosFormatados.filter(r => r.conforme).length,
    nao_conformes: registrosFormatados.filter(r => !r.conforme).length,
    registros: registrosFormatados,
  }
}

const validarBlockchain: ToolHandler = async (_params, ctx) => {
  const status = await fetchBlockchainStatus(ctx.empresaId)
  return status
}

const consultarAuditLog: ToolHandler = async (params, ctx) => {
  const logs = await fetchAuditLogs(params, ctx.empresaId)
  return { total: logs.length, logs }
}

const consultarConsentimentos: ToolHandler = async (params, ctx) => {
  const consentimentos = await fetchConsentimentos(params, ctx.empresaId)
  const resumo = calculateConsentStatus(consentimentos)
  return {
    total: consentimentos.length,
    ativos: resumo.ativos.length,
    revogados: resumo.revogados.length,
    proximos_vencimento: resumo.proximos.length,
    consentimentos,
  }
}

const registrarConsentimento: ToolHandler = async (params, ctx) => {
  const validadeDias = parseNumber(params.validade_dias, 0)
  const expira_em = validadeDias
    ? new Date(Date.now() + validadeDias * 86400000).toISOString().slice(0, 10)
    : null

  const payload = {
    empresa_id: ctx.empresaId,
    tipo_titular: ensureString(params.tipo_titular),
    titular_id: ensureString(params.titular_id),
    titular_documento: params.titular_documento ?? null,
    titular_nome: params.titular_nome ?? null,
    finalidade: ensureString(params.finalidade),
    dados_coletados: (params.dados_coletados as string[]) || [],
    aceito: params.aceito !== false,
    validade_dias: validadeDias || null,
    expira_em,
  }

  const { data, error } = await supabase
    .from('consentimentos')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  await supabase.rpc('mine_audit_block', {
    p_empresa_id: ctx.empresaId,
    p_usuario_id: ctx.userId || null,
    p_tabela: 'consentimentos',
    p_registro_id: data.id,
    p_acao: 'INSERT',
    p_dados_depois: data,
  })

  return data
}

const consultarSolicitacoes: ToolHandler = async (params, ctx) => {
  const solicitacoes = await fetchSolicitacoesLGPD(params, ctx.empresaId)
  const hoje = new Date().toISOString().slice(0, 10)
  const atrasadas = solicitacoes.filter(
    s => s.prazo_resposta < hoje && !['concluida', 'recusada'].includes(s.status)
  )

  return {
    total: solicitacoes.length,
    pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
    atrasadas: atrasadas.length,
    solicitacoes,
  }
}

const criarSolicitacao: ToolHandler = async (params, ctx) => {
  const prazo = new Date()
  prazo.setDate(prazo.getDate() + 15)

  const { data, error } = await supabase
    .from('lgpd_solicitacoes')
    .insert({
      empresa_id: ctx.empresaId,
      tipo: ensureString(params.tipo),
      solicitante_nome: ensureString(params.solicitante_nome),
      solicitante_documento: ensureString(params.solicitante_documento),
      solicitante_email: params.solicitante_email ?? null,
      descricao: ensureString(params.descricao),
      prazo_resposta: prazo.toISOString().slice(0, 10),
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data
}

const consultarAnvisa: ToolHandler = async (params, ctx) => {
  const endpoint = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!endpoint || !serviceKey) {
    throw new Error('Edge Function integration-hub indisponível (env ausente)')
  }

  const response = await fetch(`${endpoint}/functions/v1/integration-hub`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      action: params.tipo === 'empresa' ? 'anvisa_empresa' : 'anvisa_produto',
      params: {
        registro: params.registro || params.registro_anvisa,
        cnpj: params.cnpj,
      },
      empresaId: ctx.empresaId,
    }),
  })

  if (!response.ok) {
    throw new Error(`Integração ANVISA falhou: ${response.statusText}`)
  }
  return response.json()
}

const gerarRelatorio: ToolHandler = async (params, ctx) => {
  const periodo = {
    inicio: ensureString(params.periodo_inicio, '1900-01-01'),
    fim: ensureString(params.periodo_fim, '2100-12-31'),
  }

  const [rastreabilidade, consentimentos, solicitacoes, blockchain] = await Promise.all([
    supabase
      .from<RastreabilidadeRecord>('rastreabilidade_opme')
      .select('hospital_nome')
      .eq('empresa_id', ctx.empresaId)
      .gte('data_implante', periodo.inicio)
      .lte('data_implante', periodo.fim),
    fetchConsentimentos({}, ctx.empresaId),
    fetchSolicitacoesLGPD({}, ctx.empresaId),
    fetchBlockchainStatus(ctx.empresaId),
  ])

  const porHospital = (rastreabilidade.data || []).reduce<Record<string, number>>(
    (acc, item) => {
      const key = item.hospital_nome || 'Não informado'
      acc[key] = (acc[key] || 0) + 1
      return acc
    },
    {}
  )

  const relatorio: ComplianceReport = {
    tipo: (params.tipo as ComplianceReport['tipo']) || 'completo',
    periodo,
    gerado_em: new Date().toISOString(),
    empresa_id: ctx.empresaId,
  }

  if (relatorio.tipo === 'rastreabilidade' || relatorio.tipo === 'completo') {
    relatorio.rastreabilidade = {
      total_implantes: rastreabilidade.data?.length || 0,
      por_hospital: porHospital,
    }
  }

  if (relatorio.tipo === 'lgpd' || relatorio.tipo === 'completo') {
    const consentSummary = calculateConsentStatus(consentimentos)
    relatorio.lgpd = {
      consentimentos_ativos: consentSummary.ativos.length,
      solicitacoes_pendentes: solicitacoes.filter(s => s.status === 'pendente').length,
    }
  }

  if (relatorio.tipo === 'auditoria' || relatorio.tipo === 'completo') {
    relatorio.auditoria = {
      blockchain_valida: blockchain.valid,
      total_blocos: blockchain.total_blocks,
    }
  }

  return relatorio
}

const logAcessoDados: ToolHandler = async (params, ctx) => {
  const { data, error } = await supabase
    .from('lgpd_audit_log')
    .insert({
      empresa_id: ctx.empresaId,
      usuario_id: ctx.userId || null,
      tipo_dado: ensureString(params.tipo_dado),
      acao: ensureString(params.acao),
      registro_id: ensureString(params.registro_id),
      tabela_origem: ensureString(params.tabela_origem),
      finalidade: ensureString(params.finalidade),
      base_legal: ensureString(params.base_legal),
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return data
}

const TOOL_HANDLERS: Record<ComplianceToolName, ToolHandler> = {
  validar_rastreabilidade: validarRastreabilidade,
  validar_blockchain: validarBlockchain,
  consultar_audit_log: consultarAuditLog,
  consultar_consentimentos: consultarConsentimentos,
  registrar_consentimento: registrarConsentimento,
  consultar_solicitacoes_lgpd: consultarSolicitacoes,
  criar_solicitacao_lgpd: criarSolicitacao,
  consultar_anvisa: consultarAnvisa,
  gerar_relatorio_compliance: gerarRelatorio,
  log_acesso_dados: logAcessoDados,
}

// ============================================================================
// LangGraph Nodes
// ============================================================================

const interpretPlan = (raw: unknown) => safeJsonParse<Record<string, unknown>>(raw) || {}

const planExecution = async (
  state: ComplianceAgentState
): Promise<Partial<ComplianceAgentState>> => {
  const response = await complianceLLM.invoke([
    new SystemMessage(COMPLIANCE_AGENT_PROMPT),
    new HumanMessage(`Tarefa: ${state.task}\nContexto: ${JSON.stringify(state.context)}`),
  ])

  const plan = interpretPlan(response.content)
  if (plan.action === 'execute_tool') {
    const call: ComplianceToolCall = {
      tool: plan.tool as ComplianceToolName,
      params: (plan.params as Record<string, unknown>) || {},
      reason: ensureString(plan.reason, 'Sem justificativa registrada'),
    }
    return { toolCalls: [call] }
  }

  if (plan.action === 'alert') {
    const violation: ComplianceViolation = {
      regulation: (plan.regulation as ComplianceViolation['regulation']) || 'AUDIT',
      severity: (plan.severity as ComplianceViolation['severity']) || 'error',
      message: ensureString(plan.message, 'Violação não documentada'),
      action_required: ensureString(plan.action_required, 'Providenciar ação corretiva'),
    }
    return { violations: [violation] }
  }

  if (plan.action === 'respond') {
    return {
      response: {
        action: 'respond',
        data: (plan.data as Record<string, unknown>) || {},
        confidence: parseNumber(plan.confidence, 0.9),
      },
    }
  }

  return {}
}

const runToolCall = async (
  call: ComplianceToolCall,
  ctx: ToolHandlerContext
): Promise<ComplianceToolResult> => {
  const handler = TOOL_HANDLERS[call.tool]
  if (!handler) {
    return buildToolResult(call.tool, false, null, 'Ferramenta não encontrada')
  }

  try {
    const data = await handler(call.params, ctx)
    return buildToolResult(call.tool, true, data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    return buildToolResult(call.tool, false, null, message)
  }
}

const executeTools = async (
  state: ComplianceAgentState
): Promise<Partial<ComplianceAgentState>> => {
  if (!state.toolCalls.length) return {}
  const ctx: ToolHandlerContext = { empresaId: state.empresaId, userId: state.userId }
  const results = await Promise.all(state.toolCalls.map(call => runToolCall(call, ctx)))
  return { toolResults: results }
}

const analyzeCompliance = (results: ComplianceToolResult[]) => {
  const alerts = results.filter(r => !r.success)
  const resumo = alerts.map(a => `${a.tool}: ${a.error}`).join('\n')
  return {
    status_compliance: alerts.length ? 'alerta' : 'conforme',
    resumo: alerts.length ? resumo : 'Todos os controles executados com sucesso.',
    verificacoes: results.map(r => ({
      tool: r.tool,
      sucesso: r.success,
    })),
    pendencias: alerts.map(a => a.tool),
    recomendacoes: alerts.length
      ? ['Investigar pendências listadas e executar plano corretivo.']
      : ['Manter monitoramento contínuo e registrar evidências.'],
  }
}

const checkCompliance = async (
  state: ComplianceAgentState
): Promise<Partial<ComplianceAgentState>> => {
  if (!state.toolResults.length) return {}
  const analysis = analyzeCompliance(state.toolResults)

  return {
    response: {
      action: 'respond',
      data: analysis,
      confidence: analysis.status_compliance === 'conforme' ? 0.95 : 0.8,
    },
  }
}

// ============================================================================
// Graph factory + executor
// ============================================================================

export function createComplianceAgentGraph() {
  const graph = new StateGraph<ComplianceAgentState>({
    channels: {
      task: { value: (_x, y) => y ?? '', default: () => '' },
      context: { value: (x, y) => ({ ...x, ...(y || {}) }), default: () => ({}) },
      empresaId: { value: (_x, y) => y ?? '', default: () => '' },
      userId: { value: (_x, y) => y ?? '', default: () => '' },
      toolCalls: {
        value: (x, y) => [...(x || []), ...(y || [])],
        default: () => [],
      },
      toolResults: {
        value: (x, y) => [...(x || []), ...(y || [])],
        default: () => [],
      },
      violations: {
        value: (x, y) => [...(x || []), ...(y || [])],
        default: () => [],
      },
      response: {
        value: (_x, y) => y || { action: 'respond', data: {}, confidence: 0 },
        default: () => ({ action: 'respond', data: {}, confidence: 0 }),
      },
    },
  })

  graph.addNode('plan', planExecution)
  graph.addNode('execute', executeTools)
  graph.addNode('check', checkCompliance)

  graph.addEdge(START, 'plan')
  graph.addConditionalEdges('plan', state => {
    if (state.violations.length) return END
    if (state.toolCalls.length) return 'execute'
    return END
  })
  graph.addEdge('execute', 'check')
  graph.addEdge('check', END)

  return graph.compile()
}

export async function processComplianceTask(
  task: string,
  context: Record<string, unknown>,
  empresaId: string,
  userId: string
): Promise<AgentResponse> {
  const graph = createComplianceAgentGraph()
  const result = await graph.invoke({
    task,
    context,
    empresaId,
    userId,
    toolCalls: [],
    toolResults: [],
    violations: [],
    response: { action: 'respond', data: {}, confidence: 0 },
  })

  if (result.violations.length) {
    return {
      action: 'alert',
      data: {
        severity: result.violations[0].severity,
        regulation: result.violations[0].regulation,
        message: result.violations[0].message,
        action_required: result.violations[0].action_required,
      },
      confidence: 0.9,
    }
  }

  return result.response
}


