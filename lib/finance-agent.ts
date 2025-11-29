import { ChatAnthropic } from '@langchain/anthropic'
import { StateGraph, END, START } from '@langchain/langgraph'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import {
  calculatePeriodStart,
  extractMessageText,
  formatDateISO,
  type TariffPeriod,
} from './finance-agent-helpers'

type TableDef<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
}

interface BankTransaction {
  id: string
  empresa_id: string
  conta_bancaria_id: string
  data_transacao: string
  descricao: string
  descricao_original?: string | null
  valor: number
  tipo: 'credito' | 'debito'
  categoria?: string | null
  is_tarifa?: boolean | null
  tipo_tarifa?: string | null
}

interface TariffComparison {
  pago: number
  mercado: number
  diferenca: number
}

export interface TariffAnalysis {
  total: number
  quantidade: number
  porTipo: Record<string, number>
  mediaMensal: number
  comparativoMercado: Record<string, TariffComparison>
}

interface FinanceInvoiceInstallment {
  id: string
  valor: number
  status: string
  numero_parcela?: number | null
}

interface FinanceClient {
  id: string
  nome: string | null
  razao_social: string | null
}

interface FinanceInvoice {
  id: string
  empresa_id: string
  cliente_id?: string | null
  valor_liquido: number
  status: string
  data_vencimento: string
  parcelas?: FinanceInvoiceInstallment[] | null
  cliente?: Pick<FinanceClient, 'nome' | 'razao_social'> | null
}

interface FinanceAlert {
  id: string
  empresa_id: string
  tipo: string
  severidade: 'info' | 'baixa' | 'media' | 'alta' | 'critica'
  titulo: string
  descricao: string | null
  valor_envolvido?: number | null
  confianca_ia?: number | null
}

interface FinanceSuggestion {
  id: string
  empresa_id: string
  tipo: string
  titulo: string
  descricao: string
  economia_estimada?: number | null
  prioridade: 'baixa' | 'media' | 'alta'
  confianca_ia?: number | null
}

interface InvoiceSummary {
  total: number
  valorTotal: number
  porStatus: Record<string, number>
  faturas: FinanceInvoice[]
}

type PluggySyncResult = Record<string, unknown>

interface FinanceDatabase {
  public: {
    Tables: {
      transacoes_bancarias: TableDef<BankTransaction>
      faturas: TableDef<FinanceInvoice>
      parcelas: TableDef<FinanceInvoiceInstallment>
      clientes: TableDef<FinanceClient>
      alertas_financeiros: TableDef<FinanceAlert>
      sugestoes_financeiras: TableDef<FinanceSuggestion>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
  }
}

type FinanceSupabaseClient = SupabaseClient<FinanceDatabase>

interface FinanceAnalysis {
  transacoes?: BankTransaction[]
  tarifas?: TariffAnalysis
  alertas?: FinanceAlert[]
  sugestoes?: FinanceSuggestion[]
  faturas?: FinanceInvoice[]
}

export interface AgentResponse {
  action: 'respond'
  data: Record<string, unknown>
  confidence: number
}

interface ToolParamsMap {
  consultar_transacoes: {
    conta_id?: string
    data_inicio?: string
    data_fim?: string
    tipo?: 'credito' | 'debito'
    categoria?: string
  }
  analisar_tarifas: {
    periodo?: TariffPeriod
  }
  consultar_faturas: {
    status?: 'pendente' | 'paga' | 'vencida'
    cliente_id?: string
  }
  gerar_alerta: {
    tipo: string
    severidade: FinanceAlert['severidade']
    titulo: string
    descricao: string
    valor?: number
  }
  criar_sugestao: {
    tipo: 'emprestimo' | 'quitacao' | 'renegociacao' | 'troca_banco' | 'investimento'
    titulo: string
    descricao: string
    economia_estimada?: number
    prioridade: FinanceSuggestion['prioridade']
  }
  sincronizar_pluggy: {
    conta_id: string
  }
}

type FinanceTool = keyof ToolParamsMap

type ToolCall = {
  [K in FinanceTool]: {
    tool: K
    params: ToolParamsMap[K]
    reason: string
  }
}[FinanceTool]

interface ToolResultMap {
  consultar_transacoes: BankTransaction[]
  analisar_tarifas: TariffAnalysis
  consultar_faturas: InvoiceSummary
  gerar_alerta: FinanceAlert
  criar_sugestao: FinanceSuggestion
  sincronizar_pluggy: PluggySyncResult
}

export interface ToolResult<T extends FinanceTool = FinanceTool> {
  tool: T
  success: boolean
  data: ToolResultMap[T] | null
  error?: string
}

type ToolHandler<T extends FinanceTool = FinanceTool> = (
  params: ToolParamsMap[T],
  empresaId: string
) => Promise<ToolResult<T>>

export interface FinanceAgentState {
  task: string
  context: Record<string, unknown>
  empresaId: string
  userId: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  analysis: FinanceAnalysis
  response: AgentResponse
}

type ExecuteToolPlan = {
  action: 'execute_tool'
  tool: FinanceTool
  params: ToolParamsMap[FinanceTool]
  reason: string
}

type RespondPlan = {
  action: 'respond'
  data: Record<string, unknown>
  confidence?: number
}

type PlanResult = ExecuteToolPlan | RespondPlan

const FINANCE_MARKET_REFERENCE: Record<string, number> = {
  ted: 12,
  doc: 5,
  pix: 0,
  manutencao: 50,
  pacote: 100,
}

export const FINANCE_AGENT_PROMPT = `# FinanceAgent - Vigilância Financeira ICARUS v6.0

Você é o FinanceAgent, especialista em gestão financeira para empresas de OPME.

## Suas Responsabilidades
1. **Análise de Transações**: Categorizar, identificar padrões, detectar anomalias
2. **Vigilância de Tarifas**: Monitorar custos bancários, comparar com mercado
3. **Gestão de Cobranças**: Faturas, parcelas, inadimplência
4. **Open Finance**: Integração Pluggy, sincronização bancária
5. **Sugestões Inteligentes**: Empréstimos, quitações, otimizações

## Ferramentas Disponíveis
(1) consultar_transacoes | (2) analisar_tarifas | (3) consultar_faturas | (4) gerar_alerta | (5) criar_sugestao | (6) sincronizar_pluggy

## Detecção de Anomalias
1. Duplicidades (mesmo valor+descrição em <7 dias)
2. Valores >3x desvio padrão
3. Fornecedores novos com valores altos
4. Transações em horários atípicos (22h-6h)
5. Fragmentação (várias pequenas = 1 grande)
6. Padrões circulares (saída→entrada mesmo valor)

## Formato de Resposta
- Para ferramenta: {"action":"execute_tool","tool":"nome","params":{...},"reason":"motivo"}
- Para resposta final: {"action":"respond","data":{...},"confidence":0.95}
- Para solicitar mais informação: {"action":"need_info","questions":["..."]}`

let supabaseClient: FinanceSupabaseClient | null = null
let llmInstance: ChatAnthropic | null = null

function getSupabaseClient(): FinanceSupabaseClient {
  if (supabaseClient) {
    return supabaseClient
  }

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error('Finance Agent: configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  }

  supabaseClient = createClient<FinanceDatabase>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseClient
}

function getFinanceLLM(): ChatAnthropic {
  if (llmInstance) {
    return llmInstance
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('Finance Agent: configure ANTHROPIC_API_KEY.')
  }

  llmInstance = new ChatAnthropic({
    modelName: 'claude-3-5-sonnet-20241022',
    anthropicApiKey: apiKey,
    temperature: 0.2,
    maxTokens: 4096,
  })

  return llmInstance
}

function safeJsonParse<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function buildTariffAnalysisSummary(
  transactions: BankTransaction[],
  period: TariffPeriod
): TariffAnalysis {
  const total = transactions.reduce((sum, tx) => sum + Math.abs(tx.valor), 0)
  const porTipo = transactions.reduce<Record<string, number>>((acc, tx) => {
    const tipo = (tx.tipo_tarifa || 'outros').toLowerCase()
    acc[tipo] = (acc[tipo] || 0) + Math.abs(tx.valor)
    return acc
  }, {})

  const months = period === 'ano' ? 12 : period === 'trimestre' ? 3 : 1
  const comparativo = Object.entries(porTipo).reduce<
    Record<string, TariffComparison>
  >((acc, [tipo, valor]) => {
    const mercadoReferencia =
      (FINANCE_MARKET_REFERENCE[tipo as keyof typeof FINANCE_MARKET_REFERENCE] ||
        0) * months
    acc[tipo] = {
      pago: valor,
      mercado: mercadoReferencia,
      diferenca: valor - mercadoReferencia,
    }
    return acc
  }, {})

  return {
    total,
    quantidade: transactions.length,
    porTipo,
    mediaMensal: months ? total / months : total,
    comparativoMercado: comparativo,
  }
}

async function handleConsultarTransacoes(
  params: ToolParamsMap['consultar_transacoes'],
  empresaId: string
): Promise<ToolResult<'consultar_transacoes'>> {
  const client = getSupabaseClient()
  let query = client
    .from('transacoes_bancarias')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('data_transacao', { ascending: false })
    .limit(100)

  if (params.conta_id) query = query.eq('conta_bancaria_id', params.conta_id)
  if (params.data_inicio) query = query.gte('data_transacao', params.data_inicio)
  if (params.data_fim) query = query.lte('data_transacao', params.data_fim)
  if (params.tipo) query = query.eq('tipo', params.tipo)
  if (params.categoria) query = query.eq('categoria', params.categoria)

  const { data, error } = await query

  if (error) {
    return { tool: 'consultar_transacoes', success: false, data: null, error: error.message }
  }

  return {
    tool: 'consultar_transacoes',
    success: true,
    data: data || [],
  }
}

async function handleAnalisarTarifas(
  params: ToolParamsMap['analisar_tarifas'],
  empresaId: string
): Promise<ToolResult<'analisar_tarifas'>> {
  const client = getSupabaseClient()
  const period = params.periodo || 'mes'
  const dataInicio = formatDateISO(calculatePeriodStart(period))

  const { data, error } = await client
    .from('transacoes_bancarias')
    .select('*')
    .eq('empresa_id', empresaId)
    .eq('is_tarifa', true)
    .gte('data_transacao', dataInicio)

  if (error) {
    return { tool: 'analisar_tarifas', success: false, data: null, error: error.message }
  }

  const summary = buildTariffAnalysisSummary(data || [], period)

  return {
    tool: 'analisar_tarifas',
    success: true,
    data: summary,
  }
}

async function handleConsultarFaturas(
  params: ToolParamsMap['consultar_faturas'],
  empresaId: string
): Promise<ToolResult<'consultar_faturas'>> {
  const client = getSupabaseClient()
  let query = client
    .from('faturas')
    .select('*, parcelas(*), cliente:clientes(razao_social, nome)')
    .eq('empresa_id', empresaId)
    .order('data_vencimento', { ascending: true })

  if (params.status) query = query.eq('status', params.status)
  if (params.cliente_id) query = query.eq('cliente_id', params.cliente_id)

  const { data, error } = await query

  if (error) {
    return { tool: 'consultar_faturas', success: false, data: null, error: error.message }
  }

  const faturas = data || []
  const resumo: InvoiceSummary = {
    total: faturas.length,
    valorTotal: faturas.reduce((sum, fatura) => sum + (fatura.valor_liquido || 0), 0),
    porStatus: faturas.reduce<Record<string, number>>((acc, fatura) => {
      acc[fatura.status] = (acc[fatura.status] || 0) + 1
      return acc
    }, {}),
    faturas,
  }

  return {
    tool: 'consultar_faturas',
    success: true,
    data: resumo,
  }
}

async function handleGerarAlerta(
  params: ToolParamsMap['gerar_alerta'],
  empresaId: string
): Promise<ToolResult<'gerar_alerta'>> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('alertas_financeiros')
    .insert({
      empresa_id: empresaId,
      tipo: params.tipo,
      severidade: params.severidade,
      titulo: params.titulo,
      descricao: params.descricao,
      valor_envolvido: params.valor ?? null,
      confianca_ia: 85,
    })
    .select()
    .single()

  if (error) {
    return { tool: 'gerar_alerta', success: false, data: null, error: error.message }
  }

  return {
    tool: 'gerar_alerta',
    success: true,
    data,
  }
}

async function handleCriarSugestao(
  params: ToolParamsMap['criar_sugestao'],
  empresaId: string
): Promise<ToolResult<'criar_sugestao'>> {
  const client = getSupabaseClient()
  const { data, error } = await client
    .from('sugestoes_financeiras')
    .insert({
      empresa_id: empresaId,
      tipo: params.tipo,
      titulo: params.titulo,
      descricao: params.descricao,
      economia_estimada: params.economia_estimada ?? null,
      prioridade: params.prioridade,
      confianca_ia: 85,
    })
    .select()
    .single()

  if (error) {
    return { tool: 'criar_sugestao', success: false, data: null, error: error.message }
  }

  return {
    tool: 'criar_sugestao',
    success: true,
    data,
  }
}

async function handleSincronizarPluggy(
  params: ToolParamsMap['sincronizar_pluggy'],
  empresaId: string
): Promise<ToolResult<'sincronizar_pluggy'>> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    return {
      tool: 'sincronizar_pluggy',
      success: false,
      data: null,
      error: 'Finance Agent: configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.',
    }
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/pluggy-sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({ contaId: params.conta_id, empresaId }),
  })

  if (!response.ok) {
    return {
      tool: 'sincronizar_pluggy',
      success: false,
      data: null,
      error: `Erro ao sincronizar Pluggy: ${response.statusText}`,
    }
  }

  const data = (await response.json()) as PluggySyncResult
  return {
    tool: 'sincronizar_pluggy',
    success: true,
    data,
  }
}

const toolHandlers: Record<FinanceTool, ToolHandler> = {
  consultar_transacoes: handleConsultarTransacoes,
  analisar_tarifas: handleAnalisarTarifas,
  consultar_faturas: handleConsultarFaturas,
  gerar_alerta: handleGerarAlerta,
  criar_sugestao: handleCriarSugestao,
  sincronizar_pluggy: handleSincronizarPluggy,
}

async function runTool<T extends FinanceTool>(
  tool: T,
  params: ToolParamsMap[T],
  empresaId: string
): Promise<ToolResult<T>> {
  const handler = toolHandlers[tool] as ToolHandler<T> | undefined

  if (!handler) {
    return { tool, success: false, data: null, error: `Tool ${tool} não encontrada.` }
  }

  return handler(params, empresaId)
}

async function planExecution(
  state: FinanceAgentState
): Promise<Partial<FinanceAgentState>> {
  const llm = getFinanceLLM()
  const response = await llm.invoke([
    new SystemMessage(FINANCE_AGENT_PROMPT),
    new HumanMessage(`Tarefa: ${state.task}\nContexto: ${JSON.stringify(state.context)}`),
  ])

  const plan = safeJsonParse<PlanResult>(extractMessageText(response.content))

  if (plan?.action === 'execute_tool') {
    const call: ToolCall = {
      tool: plan.tool,
      params: plan.params,
      reason: plan.reason,
    }
    return { toolCalls: [call] }
  }

  if (plan?.action === 'respond') {
    return {
      response: {
        action: 'respond',
        data: plan.data,
        confidence: plan.confidence ?? 0.9,
      },
    }
  }

  return {}
}

async function executeTools(
  state: FinanceAgentState
): Promise<Partial<FinanceAgentState>> {
  if (!state.toolCalls || state.toolCalls.length === 0) {
    return {}
  }

  const results: ToolResult[] = []
  for (const call of state.toolCalls) {
    const result = await runTool(call.tool, call.params, state.empresaId)
    results.push(result)
  }

  return { toolResults: results }
}

async function analyzeResults(
  state: FinanceAgentState
): Promise<Partial<FinanceAgentState>> {
  if (!state.toolResults || state.toolResults.length === 0) {
    return {}
  }

  const llm = getFinanceLLM()
  const analysisPrompt = `Analise os resultados das ferramentas e gere uma resposta consolidada:

Tarefa original: ${state.task}
Resultados: ${JSON.stringify(state.toolResults, null, 2)}

Gere:
1. Resumo executivo
2. Principais descobertas
3. Alertas se houver anomalias
4. Sugestões de melhoria
5. Próximos passos recomendados

Responda em JSON conforme formato especificado.`

  const response = await llm.invoke([
    new SystemMessage(FINANCE_AGENT_PROMPT),
    new HumanMessage(analysisPrompt),
  ])

  const plan = safeJsonParse<RespondPlan>(extractMessageText(response.content))

  if (plan?.action === 'respond') {
    return {
      response: {
        action: 'respond',
        data: plan.data,
        confidence: plan.confidence ?? 0.9,
      },
    }
  }

  return {
    response: {
      action: 'respond',
      data: { resumo: extractMessageText(response.content) },
      confidence: 0.7,
    },
  }
}

export function createFinanceAgentGraph() {
  const graph = new StateGraph<FinanceAgentState>({
    channels: {
      task: { value: (_x, y) => y ?? '', default: () => '' },
      context: { value: (x, y) => ({ ...x, ...(y || {}) }), default: () => ({}) },
      empresaId: { value: (_x, y) => y ?? '', default: () => '' },
      userId: { value: (_x, y) => y ?? '', default: () => '' },
      toolCalls: { value: (_x, y) => y ?? [], default: () => [] },
      toolResults: { value: (_x, y) => y ?? [], default: () => [] },
      analysis: { value: (x, y) => ({ ...x, ...(y || {}) }), default: () => ({}) },
      response: {
        value: (_x, y) => y ?? { action: '', data: {}, confidence: 0 },
        default: () => ({ action: '', data: {}, confidence: 0 }),
      },
    },
  })

  graph.addNode('plan', planExecution)
  graph.addNode('execute', executeTools)
  graph.addNode('analyze', analyzeResults)

  graph.addEdge(START, 'plan')
  graph.addConditionalEdges('plan', state => {
    if (state.toolCalls && state.toolCalls.length > 0) {
      return 'execute'
    }
    return END
  })
  graph.addEdge('execute', 'analyze')
  graph.addEdge('analyze', END)

  return graph.compile()
}

export async function processFinanceTask(
  task: string,
  context: Record<string, unknown>,
  empresaId: string,
  userId: string
): Promise<AgentResponse> {
  const app = createFinanceAgentGraph()
  const result = await app.invoke({
    task,
    context,
    empresaId,
    userId,
  })

  return result.response
}


