/**
 * ICARUS v6.0 - Operations Agent (LangGraph)
 * Gestão de cirurgias, estoque e rastreabilidade OPME
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"
import { StateGraph, START, END } from "npm:@langchain/langgraph@0.0.26"
import { ChatAnthropic } from "npm:@langchain/anthropic@0.3.0"
import { HumanMessage, SystemMessage } from "npm:@langchain/core@0.3.0/messages"
import { z } from "npm:zod@3.23.8"
import type { Database } from "../../../src/lib/supabase/types.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type, x-client-info",
}

type DbClient = SupabaseClient<Database>

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")!

const supabase = createClient<Database>(supabaseUrl, supabaseKey)

const operationsLLM = new ChatAnthropic({
  modelName: "claude-3-5-sonnet-20241022",
  anthropicApiKey: anthropicKey,
  temperature: 0.2,
  maxTokens: 4096,
})

const CIRURGIA_STATUS = [
  "agendada",
  "confirmada",
  "em_preparacao",
  "material_pendente",
  "em_andamento",
  "concluida",
  "cancelada",
  "adiada",
] as const

const ESTOQUE_STATUS = [
  "normal",
  "estoque_baixo",
  "sem_estoque",
  "proximo_vencimento",
] as const

const CONSUMO_TIPOS = ["consumo", "devolucao", "perda"] as const

type CirurgiaStatus = (typeof CIRURGIA_STATUS)[number]
type EstoqueStatus = (typeof ESTOQUE_STATUS)[number]
type ConsumoTipo = (typeof CONSUMO_TIPOS)[number]

const requestSchema = z.object({
  task: z.string().min(3),
  context: z.record(z.unknown()).default({}),
  empresa_id: z.string().uuid(),
  user_id: z.string().uuid(),
})

const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()

const consultarCirurgiasSchema = z.object({
  data_inicio: dateString,
  data_fim: dateString,
  status: z.enum(CIRURGIA_STATUS).optional(),
  hospital_id: z.string().uuid().optional(),
  medico_id: z.string().uuid().optional(),
})

const consultarEstoqueSchema = z.object({
  produto_id: z.string().uuid().optional(),
  categoria_id: z.string().uuid().optional(),
  status: z.enum(ESTOQUE_STATUS).optional(),
  apenas_criticos: z.boolean().optional(),
})

const consultarLotesSchema = z.object({
  produto_id: z.string().uuid().optional(),
  numero_lote: z.string().optional(),
  vencimento_ate: dateString,
  status: z.enum(["disponivel", "reservado", "consumido", "bloqueado", "vencido", "quarentena"] as const).optional(),
})

const reservarMaterialSchema = z.object({
  cirurgia_id: z.string().uuid(),
  lote_id: z.string().uuid(),
  quantidade: z.number().int().positive(),
})

const registrarConsumoSchema = z.object({
  cirurgia_id: z.string().uuid(),
  lote_id: z.string().uuid(),
  quantidade: z.number().int().positive(),
  tipo: z.enum(CONSUMO_TIPOS),
})

const registrarRastreabilidadeSchema = z.object({
  cirurgia_id: z.string().uuid(),
  lote_id: z.string().uuid(),
  paciente_iniciais: z.string().min(2).max(5),
  local_implante: z.string().min(2).max(120).optional(),
})

const atualizarStatusSchema = z.object({
  cirurgia_id: z.string().uuid(),
  status: z.enum(CIRURGIA_STATUS),
  observacao: z.string().max(500).optional(),
})

const gerarAlertaEstoqueSchema = z.object({
  produto_id: z.string().uuid(),
  tipo: z.enum(["estoque_baixo", "sem_estoque", "proximo_vencimento", "vencido"] as const),
  mensagem: z.string().min(10).max(280),
})

type ToolSchema =
  | typeof consultarCirurgiasSchema
  | typeof consultarEstoqueSchema
  | typeof consultarLotesSchema
  | typeof reservarMaterialSchema
  | typeof registrarConsumoSchema
  | typeof registrarRastreabilidadeSchema
  | typeof atualizarStatusSchema
  | typeof gerarAlertaEstoqueSchema

const toolSchemas: Record<OperationsToolName, ToolSchema> = {
  consultar_cirurgias: consultarCirurgiasSchema,
  consultar_estoque: consultarEstoqueSchema,
  consultar_lotes: consultarLotesSchema,
  reservar_material: reservarMaterialSchema,
  registrar_consumo: registrarConsumoSchema,
  registrar_rastreabilidade: registrarRastreabilidadeSchema,
  atualizar_status_cirurgia: atualizarStatusSchema,
  gerar_alerta_estoque: gerarAlertaEstoqueSchema,
}

const OPERATIONS_AGENT_PROMPT = `
Você é o OperationsAgent do ICARUS v6.0. Avalie a tarefa e decida:
1. {"action":"execute_tool","tool":"consultar_estoque","params":{...},"reason":"..."}
2. {"action":"respond","data":{...},"confidence":0.9}
Retorne SEMPRE JSON válido.`.trim()

interface AgentResponse {
  action: "respond"
  data: Record<string, unknown>
  confidence: number
}

interface ToolCall {
  tool: OperationsToolName
  params: Record<string, unknown>
  reason: string
}

interface ToolResult<TName extends OperationsToolName = OperationsToolName> {
  tool: TName
  success: boolean
  data: ToolOutputs[TName] | null
  error?: string
}

interface OperationsAgentState {
  task: string
  context: Record<string, unknown>
  empresaId: string
  userId: string
  toolCalls: ToolCall[]
  toolResults: ToolResult[]
  response: AgentResponse
}

type OperationsToolName =
  | "consultar_cirurgias"
  | "consultar_estoque"
  | "consultar_lotes"
  | "reservar_material"
  | "registrar_consumo"
  | "registrar_rastreabilidade"
  | "atualizar_status_cirurgia"
  | "gerar_alerta_estoque"

interface CirurgiaResumo {
  total: number
  porStatus: Record<CirurgiaStatus, number>
  hoje: number
  cirurgias: unknown[]
}

interface EstoqueResumo {
  total_produtos: number
  criticos: number
  sem_estoque: number
  proximo_vencimento: number
  produtos: unknown[]
}

interface LoteResumo {
  lotes: unknown[]
  total: number
}

interface ReservaMaterial {
  id: string
  lote_id: string
  cirurgia_id: string
  quantidade: number
  data_expiracao: string | null
}

interface ConsumoRegistro {
  id: string
  quantidade: number
  tipo: ConsumoTipo
}

interface RastreabilidadeRegistro {
  id: string
  numero_lote: string
  registro_anvisa: string | null
  hash_registro: string
}

interface CirurgiaAtualizada {
  id: string
  status: CirurgiaStatus
  observacoes: string | null
}

interface AlertaEstoque {
  produto: { id: string; nome: string; codigo: string }
  tipo: string
  mensagem: string
  criado_em: string
}

type ToolOutputs = {
  consultar_cirurgias: CirurgiaResumo
  consultar_estoque: EstoqueResumo
  consultar_lotes: LoteResumo
  reservar_material: ReservaMaterial
  registrar_consumo: ConsumoRegistro
  registrar_rastreabilidade: RastreabilidadeRegistro
  atualizar_status_cirurgia: CirurgiaAtualizada
  gerar_alerta_estoque: AlertaEstoque
}

const operationsGraph = createOperationsAgentGraph()

serve(async (req: Request): Promise<Response> => handleRequest(req))

async function handleRequest(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders })
  try {
    const payload = requestSchema.parse(await req.json())
    const result = await processOperationsTask(payload)
    return jsonResponse({ success: true, ...result })
  } catch (error) {
    const message = error instanceof z.ZodError ? error.errors : (error as Error).message
    return jsonResponse({ success: false, error: message }, 400)
  }
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

async function processOperationsTask(input: z.infer<typeof requestSchema>): Promise<AgentResponse> {
  const state: OperationsAgentState = {
    task: input.task,
    context: input.context,
    empresaId: input.empresa_id,
    userId: input.user_id,
    toolCalls: [],
    toolResults: [],
    response: { action: "respond", data: { resumo: "Sem plano" }, confidence: 0.5 },
  }
  const result = await operationsGraph.invoke(state)
  return result.response
}

function createOperationsAgentGraph() {
  const graph = new StateGraph<OperationsAgentState>({
    channels: {
      task: { value: (_, v) => v || "", default: () => "" },
      context: { value: (x, y) => ({ ...x, ...y }), default: () => ({}) },
      empresaId: { value: (_, v) => v || "", default: () => "" },
      userId: { value: (_, v) => v || "", default: () => "" },
      toolCalls: { value: (x = [], y = []) => [...x, ...y], default: () => [] },
      toolResults: { value: (x = [], y = []) => [...x, ...y], default: () => [] },
      response: { value: (_, v) => v, default: () => ({ action: "respond", data: {}, confidence: 0.5 }) },
    },
  })
  graph.addNode("plan", planExecution)
  graph.addNode("execute", executeTools)
  graph.addNode("analyze", analyzeResults)
  graph.addEdge(START, "plan")
  graph.addConditionalEdges("plan", routePlan)
  graph.addEdge("execute", "analyze")
  graph.addEdge("analyze", END)
  return graph.compile()
}

function routePlan(state: OperationsAgentState) {
  return state.toolCalls.length > 0 ? "execute" : END
}

async function planExecution(state: OperationsAgentState) {
  const plan = await callPlanner(state)
  if (plan?.action === "execute_tool") {
    return {
      toolCalls: [
        {
          tool: plan.tool as OperationsToolName,
          params: plan.params || {},
          reason: plan.reason || "Sem justificativa",
        },
      ],
    }
  }
  if (plan?.action === "respond") {
    return {
      response: {
        action: "respond",
        data: plan.data || { resumo: "Sem dados" },
        confidence: plan.confidence ?? 0.8,
      },
    }
  }
  return {}
}

async function callPlanner(state: OperationsAgentState) {
  const response = await operationsLLM.invoke([
    new SystemMessage(OPERATIONS_AGENT_PROMPT),
    new HumanMessage(`Tarefa: ${state.task}\nContexto: ${JSON.stringify(state.context)}`),
  ])
  return safeJson(response.content)
}

async function executeTools(state: OperationsAgentState) {
  const results: ToolResult[] = []
  for (const call of state.toolCalls) {
    const result = await executeTool(call, state.empresaId, state.userId, supabase)
    results.push(result)
  }
  return { toolResults: results }
}

async function analyzeResults(state: OperationsAgentState) {
  if (state.toolResults.length === 0) {
    return {
      response: {
        action: "respond",
        data: { resumo: "Nenhuma ação necessária" },
        confidence: 0.7,
      },
    }
  }
  const summary = await summarizeResults(state)
  return { response: summary }
}

async function summarizeResults(state: OperationsAgentState): Promise<AgentResponse> {
  const prompt = `Tarefa: ${state.task}\nResultados:${JSON.stringify(state.toolResults)}`
  const response = await operationsLLM.invoke([
    new SystemMessage(OPERATIONS_AGENT_PROMPT),
    new HumanMessage(`Resuma resultados em JSON. ${prompt}`),
  ])
  const parsed = safeJson(response.content)
  if (parsed?.data) {
    return { action: "respond", data: parsed.data, confidence: parsed.confidence ?? 0.85 }
  }
  return {
    action: "respond",
    data: { resumo: response.content },
    confidence: 0.65,
  }
}

async function executeTool(
  call: ToolCall,
  empresaId: string,
  userId: string,
  client: DbClient
): Promise<ToolResult> {
  try {
    const schema = toolSchemas[call.tool]
    const params = schema.parse(call.params)
    const data = await toolExecutors[call.tool](params as never, empresaId, userId, client)
    return { tool: call.tool, success: true, data }
  } catch (error) {
    console.error(`[OperationsAgent] Tool ${call.tool} failed`, error)
    return {
      tool: call.tool,
      success: false,
      data: null,
      error: error instanceof z.ZodError ? JSON.stringify(error.errors) : (error as Error).message,
    }
  }
}

type ToolExecutor<T extends OperationsToolName> = (
  params: z.infer<(typeof toolSchemas)[T]>,
  empresaId: string,
  userId: string,
  client: DbClient
) => Promise<ToolOutputs[T]>

const toolExecutors: Record<OperationsToolName, ToolExecutor<any>> = {
  consultar_cirurgias: consultarCirurgias,
  consultar_estoque: consultarEstoque,
  consultar_lotes: consultarLotes,
  reservar_material: reservarMaterial,
  registrar_consumo: registrarConsumo,
  registrar_rastreabilidade: registrarRastreabilidade,
  atualizar_status_cirurgia: atualizarStatusCirurgia,
  gerar_alerta_estoque: gerarAlertaEstoque,
}

async function consultarCirurgias(
  params: z.infer<typeof consultarCirurgiasSchema>,
  empresaId: string,
  _userId: string,
  client: DbClient
): Promise<CirurgiaResumo> {
  const rows = await fetchCirurgiaRows(params, empresaId, client)
  return buildCirurgiaResumo(rows)
}

async function fetchCirurgiaRows(
  params: z.infer<typeof consultarCirurgiasSchema>,
  empresaId: string,
  client: DbClient
) {
  let query = client
    .from("cirurgias")
    .select(
      `*,hospital:hospitais(id,nome,cnes),medico:medicos(id,nome,crm,crm_uf),
       materiais:cirurgia_materiais(id,quantidade_solicitada,quantidade_utilizada,
       produto:produtos(id,nome,codigo),lote:lotes(id,numero_lote,data_validade))`
    )
    .eq("empresa_id", empresaId)
    .is("excluido_em", null)
  if (params.data_inicio) query = query.gte("data_agendamento", params.data_inicio)
  if (params.data_fim) query = query.lte("data_agendamento", params.data_fim)
  if (params.status) query = query.eq("status", params.status)
  if (params.hospital_id) query = query.eq("hospital_id", params.hospital_id)
  if (params.medico_id) query = query.eq("medico_id", params.medico_id)
  const { data } = await query.order("data_agendamento", { ascending: true })
  return data || []
}

function buildCirurgiaResumo(rows: unknown[]): CirurgiaResumo {
  const porStatus = createStatusMap()
  rows.forEach((row) => {
    const status = ((row as { status?: string }).status as CirurgiaStatus) || "agendada"
    porStatus[status] = (porStatus[status] || 0) + 1
  })
  const hoje = rows.filter((row) => (row as { data_agendamento?: string }).data_agendamento === todayIso()).length
  return { total: rows.length, porStatus, hoje, cirurgias: rows }
}

function createStatusMap(): Record<CirurgiaStatus, number> {
  return {
    agendada: 0,
    confirmada: 0,
    em_preparacao: 0,
    material_pendente: 0,
    em_andamento: 0,
    concluida: 0,
    cancelada: 0,
    adiada: 0,
  }
}

async function consultarEstoque(
  params: z.infer<typeof consultarEstoqueSchema>,
  empresaId: string,
  _userId: string,
  client: DbClient
): Promise<EstoqueResumo> {
  const produtos = await fetchEstoqueProdutos(params, empresaId, client)
  return summarizeEstoque(produtos)
}

async function fetchEstoqueProdutos(
  params: z.infer<typeof consultarEstoqueSchema>,
  empresaId: string,
  client: DbClient
) {
  let query = client.from("vw_estoque").select("*").eq("empresa_id", empresaId)
  if (params.produto_id) query = query.eq("produto_id", params.produto_id)
  if (params.categoria_id) query = query.eq("categoria_id", params.categoria_id)
  if (params.status) query = query.eq("status_estoque", params.status)
  if (params.apenas_criticos) query = query.neq("status_estoque", "normal")
  const { data } = await query
  return data || []
}

function summarizeEstoque(produtos: Array<{ status_estoque?: string }>): EstoqueResumo {
  const criticos = produtos.filter((p) => p.status_estoque !== "normal")
  const semEstoque = produtos.filter((p) => p.status_estoque === "sem_estoque")
  const vencimento = produtos.filter((p) => p.status_estoque === "proximo_vencimento")
  return {
    total_produtos: produtos.length,
    criticos: criticos.length,
    sem_estoque: semEstoque.length,
    proximo_vencimento: vencimento.length,
    produtos,
  }
}

async function consultarLotes(
  params: z.infer<typeof consultarLotesSchema>,
  empresaId: string,
  _userId: string,
  client: DbClient
): Promise<LoteResumo> {
  const lotes = await fetchLotesData(params, empresaId, client)
  return { lotes, total: lotes.length }
}

async function fetchLotesData(
  params: z.infer<typeof consultarLotesSchema>,
  empresaId: string,
  client: DbClient
) {
  let query = client
    .from("lotes")
    .select("*,produto:produtos(id,nome,codigo,registro_anvisa)")
    .eq("empresa_id", empresaId)
  if (params.produto_id) query = query.eq("produto_id", params.produto_id)
  if (params.numero_lote) query = query.eq("numero_lote", params.numero_lote)
  if (params.vencimento_ate) query = query.lte("data_validade", params.vencimento_ate)
  if (params.status) query = query.eq("status", params.status)
  const { data } = await query.order("data_validade", { ascending: true })
  return data || []
}

async function reservarMaterial(
  params: z.infer<typeof reservarMaterialSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
): Promise<ReservaMaterial> {
  const lote = await loadLoteBasico(params.lote_id, empresaId, client)
  ensureReservaDisponivel(lote, params.quantidade)
  const reserva = await criarReserva(params, empresaId, userId, client)
  await atualizarReservaLote(lote, params.quantidade, client)
  return reserva
}

async function loadLoteBasico(loteId: string, empresaId: string, client: DbClient) {
  const { data } = await client
    .from("lotes")
    .select("id,quantidade_atual,quantidade_reservada")
    .eq("id", loteId)
    .eq("empresa_id", empresaId)
    .single()
  if (!data) throw new Error("Lote indisponível")
  return data
}

function ensureReservaDisponivel(
  lote: { quantidade_atual: number; quantidade_reservada: number },
  quantidade: number
) {
  if (lote.quantidade_atual - lote.quantidade_reservada < quantidade) {
    throw new Error("Quantidade indisponível para reserva")
  }
}

async function criarReserva(
  params: z.infer<typeof reservarMaterialSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
) {
  const { data } = await client
    .from("reservas_material")
    .insert({
      empresa_id: empresaId,
      lote_id: params.lote_id,
      cirurgia_id: params.cirurgia_id,
      quantidade: params.quantidade,
      usuario_id: userId,
      data_expiracao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select("id,lote_id,cirurgia_id,quantidade,data_expiracao")
    .single()
  return data!
}

async function atualizarReservaLote(
  lote: { id: string; quantidade_reservada: number },
  quantidade: number,
  client: DbClient
) {
  await client
    .from("lotes")
    .update({ quantidade_reservada: lote.quantidade_reservada + quantidade })
    .eq("id", lote.id)
}

async function registrarConsumo(
  params: z.infer<typeof registrarConsumoSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
): Promise<ConsumoRegistro> {
  const lote = await carregarLoteCompleto(params.lote_id, empresaId, client)
  const consumo = await inserirConsumo(params, empresaId, userId, client)
  await atualizarLoteAposConsumo(lote, params, client)
  await registrarMovimentacaoConsumo(lote, params, userId, empresaId, client)
  return consumo
}

async function carregarLoteCompleto(loteId: string, empresaId: string, client: DbClient) {
  const { data } = await client.from("lotes").select("*").eq("id", loteId).eq("empresa_id", empresaId).single()
  if (!data) throw new Error("Lote não encontrado")
  return data
}

async function inserirConsumo(
  params: z.infer<typeof registrarConsumoSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
) {
  const { data } = await client
    .from("consumo_materiais")
    .insert({
      empresa_id: empresaId,
      cirurgia_id: params.cirurgia_id,
      lote_id: params.lote_id,
      quantidade: params.quantidade,
      tipo: params.tipo,
      usuario_id: userId,
    })
    .select("id,quantidade,tipo")
    .single()
  return data!
}

async function atualizarLoteAposConsumo(
  lote: { id: string; quantidade_atual: number; quantidade_reservada: number },
  params: z.infer<typeof registrarConsumoSchema>,
  client: DbClient
) {
  const novaQuantidade =
    params.tipo === "consumo" ? lote.quantidade_atual - params.quantidade : lote.quantidade_atual + params.quantidade
  await client
    .from("lotes")
    .update({
      quantidade_atual: novaQuantidade,
      quantidade_reservada: Math.max(0, lote.quantidade_reservada - params.quantidade),
    })
    .eq("id", params.lote_id)
}

async function registrarMovimentacaoConsumo(
  lote: { quantidade_atual: number },
  params: z.infer<typeof registrarConsumoSchema>,
  userId: string,
  empresaId: string,
  client: DbClient
) {
  const quantidadePosterior =
    params.tipo === "consumo" ? lote.quantidade_atual - params.quantidade : lote.quantidade_atual + params.quantidade
  await client.from("movimentacoes_estoque").insert({
    empresa_id: empresaId,
    lote_id: params.lote_id,
    usuario_id: userId,
    tipo: params.tipo,
    quantidade: params.quantidade,
    quantidade_anterior: lote.quantidade_atual,
    quantidade_posterior: quantidadePosterior,
    documento_tipo: "cirurgia",
    documento_id: params.cirurgia_id,
  })
}

async function registrarRastreabilidade(
  params: z.infer<typeof registrarRastreabilidadeSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
): Promise<RastreabilidadeRegistro> {
  const [cirurgia, lote] = await Promise.all([
    carregarCirurgiaDetalhada(params.cirurgia_id, empresaId, client),
    carregarLoteDetalhado(params.lote_id, empresaId, client),
  ])
  const registro = await inserirRastreabilidade(params, empresaId, cirurgia, lote, client)
  await registrarAuditLog(registro.id, empresaId, userId, client)
  return registro
}

async function carregarCirurgiaDetalhada(cirurgiaId: string, empresaId: string, client: DbClient) {
  const { data } = await client
    .from("cirurgias")
    .select("id,data_realizacao,hospital:hospitais(nome,cnes),medico:medicos(nome,crm,crm_uf)")
    .eq("id", cirurgiaId)
    .eq("empresa_id", empresaId)
    .single()
  if (!data) throw new Error("Cirurgia não encontrada")
  return data
}

async function carregarLoteDetalhado(loteId: string, empresaId: string, client: DbClient) {
  const { data } = await client
    .from("lotes")
    .select("*,produto:produtos(id,nome,registro_anvisa,fabricante_nome)")
    .eq("id", loteId)
    .eq("empresa_id", empresaId)
    .single()
  if (!data) throw new Error("Lote não encontrado")
  return data
}

async function inserirRastreabilidade(
  params: z.infer<typeof registrarRastreabilidadeSchema>,
  empresaId: string,
  cirurgia: {
    data_realizacao: string | null
    hospital: { nome: string | null; cnes: string | null } | null
    medico: { nome: string | null; crm: string | null; crm_uf: string | null } | null
  },
  lote: {
    produto_id: string
    numero_lote: string
    numero_serie: string | null
    produto: { registro_anvisa?: string | null; nome?: string | null; fabricante_nome?: string | null } | null
  },
  client: DbClient
) {
  const { data } = await client
    .from("rastreabilidade_opme")
    .insert({
      empresa_id: empresaId,
      cirurgia_id: params.cirurgia_id,
      produto_id: lote.produto_id,
      lote_id: params.lote_id,
      numero_lote: lote.numero_lote,
      numero_serie: lote.numero_serie,
      registro_anvisa: lote.produto?.registro_anvisa,
      nome_produto: lote.produto?.nome || "",
      fabricante: lote.produto?.fabricante_nome || "N/A",
      data_implante: cirurgia.data_realizacao || todayIso(),
      local_implante: params.local_implante || cirurgia.hospital?.nome || "Hospital não informado",
      paciente_iniciais: params.paciente_iniciais,
      medico_nome: cirurgia.medico?.nome || "N/A",
      medico_crm: cirurgia.medico?.crm || "N/A",
      medico_crm_uf: cirurgia.medico?.crm_uf || "NA",
      hospital_nome: cirurgia.hospital?.nome || "N/A",
      hospital_cnes: cirurgia.hospital?.cnes,
    })
    .select("id,numero_lote,registro_anvisa,hash_registro")
    .single()
  return data!
}

async function registrarAuditLog(registroId: string, empresaId: string, userId: string, client: DbClient) {
  await client.rpc("mine_audit_block", {
    p_empresa_id: empresaId,
    p_usuario_id: userId,
    p_tabela: "rastreabilidade_opme",
    p_registro_id: registroId,
    p_acao: "INSERT",
    p_dados_depois: { id: registroId },
  })
}

async function atualizarStatusCirurgia(
  params: z.infer<typeof atualizarStatusSchema>,
  empresaId: string,
  userId: string,
  client: DbClient
): Promise<CirurgiaAtualizada> {
  const observacoesAtuais = await buscarObservacoes(params.cirurgia_id, empresaId, client)
  const merged = mergeObservacoes(observacoesAtuais, params.observacao, userId)
  return atualizarStatus(params, empresaId, merged, userId, client)
}

async function buscarObservacoes(cirurgiaId: string, empresaId: string, client: DbClient) {
  const { data } = await client
    .from("cirurgias")
    .select("observacoes")
    .eq("id", cirurgiaId)
    .eq("empresa_id", empresaId)
    .single()
  if (!data) throw new Error("Cirurgia não encontrada")
  return data.observacoes || ""
}

function mergeObservacoes(atual: string, nova: string | undefined, userId: string) {
  if (!nova) return atual
  const marker = `[${new Date().toISOString()} - ${userId}] ${nova}`
  return atual ? `${atual}\n${marker}` : marker
}

async function atualizarStatus(
  params: z.infer<typeof atualizarStatusSchema>,
  empresaId: string,
  observacoes: string,
  userId: string,
  client: DbClient
) {
  const { data } = await client
    .from("cirurgias")
    .update({ status: params.status, observacoes, atualizado_por: userId })
    .eq("id", params.cirurgia_id)
    .eq("empresa_id", empresaId)
    .select("id,status,observacoes")
    .single()
  return data!
}

async function gerarAlertaEstoque(
  params: z.infer<typeof gerarAlertaEstoqueSchema>,
  empresaId: string,
  _userId: string,
  client: DbClient
): Promise<AlertaEstoque> {
  const produto = await carregarProdutoBasico(params.produto_id, empresaId, client)
  return {
    produto,
    tipo: params.tipo,
    mensagem: params.mensagem,
    criado_em: new Date().toISOString(),
  }
}

async function carregarProdutoBasico(produtoId: string, empresaId: string, client: DbClient) {
  const { data } = await client
    .from("produtos")
    .select("id,nome,codigo")
    .eq("id", produtoId)
    .eq("empresa_id", empresaId)
    .single()
  if (!data) throw new Error("Produto não encontrado")
  return data
}

function todayIso(): string {
  return new Date().toISOString().split("T")[0]
}

function safeJson<T>(raw: unknown): T | null {
  if (typeof raw !== "string") return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}


