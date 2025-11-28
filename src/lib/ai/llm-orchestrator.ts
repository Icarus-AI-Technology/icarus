/**
 * ICARUS v5.0 - LLM Orchestrator
 * 
 * Orquestrador de múltiplos provedores de LLM com fallback automático.
 * Garante alta disponibilidade e resiliência para operações críticas.
 * 
 * Provedores suportados:
 * - Anthropic Claude 3.5 Sonnet (preferencial para raciocínio regulatório)
 * - OpenAI GPT-4o (fallback principal)
 * - OpenAI GPT-4o-mini (fallback econômico)
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 * @compliance RDC 59/751/188 ANVISA
 */

import { supabase } from '@/lib/config/supabase-client'

// ============ TIPOS ============

export interface LLMProvider {
  name: 'claude' | 'openai' | 'openai-mini'
  model: string
  priority: number
  maxTokens: number
  temperature: number
  isAvailable: boolean
  lastError?: string
  lastErrorTime?: Date
  avgLatencyMs?: number
  costPer1kTokens: number
}

export interface LLMRequest {
  prompt: string
  systemPrompt?: string
  maxTokens?: number
  temperature?: number
  tools?: LLMTool[]
  preferredProvider?: LLMProvider['name']
  context?: Record<string, unknown>
}

export interface LLMResponse {
  success: boolean
  content: string
  provider: LLMProvider['name']
  model: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    estimatedCost: number
  }
  latencyMs: number
  toolCalls?: LLMToolCall[]
  error?: string
}

export interface LLMTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface LLMToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface LLMMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  avgLatencyMs: number
  totalCost: number
  providerUsage: Record<string, number>
}

// ============ CONFIGURAÇÃO DE PROVEDORES ============

const DEFAULT_PROVIDERS: LLMProvider[] = [
  {
    name: 'claude',
    model: 'claude-3-5-sonnet-20241022',
    priority: 1,
    maxTokens: 4096,
    temperature: 0,
    isAvailable: true,
    costPer1kTokens: 0.003, // $3/1M input, $15/1M output
  },
  {
    name: 'openai',
    model: 'gpt-4o',
    priority: 2,
    maxTokens: 4096,
    temperature: 0,
    isAvailable: true,
    costPer1kTokens: 0.005, // $5/1M input, $15/1M output
  },
  {
    name: 'openai-mini',
    model: 'gpt-4o-mini',
    priority: 3,
    maxTokens: 4096,
    temperature: 0,
    isAvailable: true,
    costPer1kTokens: 0.00015, // $0.15/1M input, $0.60/1M output
  },
]

// Tempo de cooldown após erro (5 minutos)
const ERROR_COOLDOWN_MS = 5 * 60 * 1000

// ============ CLASSE PRINCIPAL ============

export class LLMOrchestrator {
  private providers: LLMProvider[]
  private metrics: LLMMetrics

  constructor(customProviders?: LLMProvider[]) {
    this.providers = customProviders || [...DEFAULT_PROVIDERS]
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatencyMs: 0,
      totalCost: 0,
      providerUsage: {},
    }
  }

  /**
   * Invoca o LLM com fallback automático
   */
  async invoke(request: LLMRequest): Promise<LLMResponse> {
    const startTime = Date.now()
    this.metrics.totalRequests++

    // Ordenar provedores por prioridade, respeitando preferência
    const sortedProviders = this.getSortedProviders(request.preferredProvider)

    for (const provider of sortedProviders) {
      // Verificar disponibilidade
      if (!this.isProviderAvailable(provider)) {
        continue
      }

      try {
        const response = await this.callProvider(provider, request)
        
        if (response.success) {
          // Atualizar métricas de sucesso
          this.updateMetrics(provider, response, true)
          return response
        }
      } catch (error) {
        // Marcar provider como indisponível temporariamente
        this.markProviderError(provider, error instanceof Error ? error.message : 'Unknown error')
        continue
      }
    }

    // Todos os provedores falharam
    this.metrics.failedRequests++
    
    return {
      success: false,
      content: '',
      provider: 'claude',
      model: '',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0, estimatedCost: 0 },
      latencyMs: Date.now() - startTime,
      error: 'Todos os provedores de LLM falharam. Tente novamente mais tarde.',
    }
  }

  /**
   * Chama um provedor específico
   */
  private async callProvider(
    provider: LLMProvider,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const startTime = Date.now()

    switch (provider.name) {
      case 'claude':
        return this.callAnthropic(provider, request, startTime)
      case 'openai':
      case 'openai-mini':
        return this.callOpenAI(provider, request, startTime)
      default:
        throw new Error(`Provider desconhecido: ${provider.name}`)
    }
  }

  /**
   * Chama Anthropic Claude via Edge Function
   */
  private async callAnthropic(
    provider: LLMProvider,
    request: LLMRequest,
    startTime: number
  ): Promise<LLMResponse> {
    const { data, error } = await supabase.functions.invoke('llm-anthropic', {
      body: {
        model: provider.model,
        max_tokens: request.maxTokens || provider.maxTokens,
        temperature: request.temperature ?? provider.temperature,
        system: request.systemPrompt || this.getDefaultSystemPrompt(),
        messages: [{ role: 'user', content: request.prompt }],
        tools: request.tools?.map(t => ({
          name: t.function.name,
          description: t.function.description,
          input_schema: t.function.parameters,
        })),
      },
    })

    if (error) {
      throw new Error(`Anthropic API error: ${error.message}`)
    }

    const latencyMs = Date.now() - startTime
    const content = data.content?.find((b: { type: string }) => b.type === 'text')?.text || ''
    const toolCalls = data.content
      ?.filter((b: { type: string }) => b.type === 'tool_use')
      ?.map((b: { id: string; name: string; input: Record<string, unknown> }) => ({
        id: b.id,
        name: b.name,
        arguments: b.input,
      }))

    // Estimar tokens (Anthropic não retorna exato na resposta)
    const promptTokens = Math.ceil(request.prompt.length / 4)
    const completionTokens = Math.ceil(content.length / 4)

    return {
      success: true,
      content,
      provider: provider.name,
      model: provider.model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
        estimatedCost: ((promptTokens + completionTokens) / 1000) * provider.costPer1kTokens,
      },
      latencyMs,
      toolCalls,
    }
  }

  /**
   * Chama OpenAI via Edge Function
   */
  private async callOpenAI(
    provider: LLMProvider,
    request: LLMRequest,
    startTime: number
  ): Promise<LLMResponse> {
    const { data, error } = await supabase.functions.invoke('llm-openai', {
      body: {
        model: provider.model,
        max_tokens: request.maxTokens || provider.maxTokens,
        temperature: request.temperature ?? provider.temperature,
        messages: [
          { role: 'system', content: request.systemPrompt || this.getDefaultSystemPrompt() },
          { role: 'user', content: request.prompt },
        ],
        tools: request.tools,
        tool_choice: request.tools ? 'auto' : undefined,
      },
    })

    if (error) {
      throw new Error(`OpenAI API error: ${error.message}`)
    }

    const latencyMs = Date.now() - startTime
    const message = data.choices?.[0]?.message
    const content = message?.content || ''
    const toolCalls = message?.tool_calls?.map((tc: { id: string; function: { name: string; arguments: string } }) => ({
      id: tc.id,
      name: tc.function.name,
      arguments: JSON.parse(tc.function.arguments),
    }))

    return {
      success: true,
      content,
      provider: provider.name,
      model: provider.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        estimatedCost: ((data.usage?.total_tokens || 0) / 1000) * provider.costPer1kTokens,
      },
      latencyMs,
      toolCalls,
    }
  }

  /**
   * Retorna providers ordenados por prioridade
   */
  private getSortedProviders(preferredProvider?: LLMProvider['name']): LLMProvider[] {
    return [...this.providers].sort((a, b) => {
      // Preferência do usuário tem prioridade máxima
      if (preferredProvider) {
        if (a.name === preferredProvider) return -1
        if (b.name === preferredProvider) return 1
      }
      return a.priority - b.priority
    })
  }

  /**
   * Verifica se provider está disponível
   */
  private isProviderAvailable(provider: LLMProvider): boolean {
    if (!provider.isAvailable) return false

    // Verificar cooldown após erro
    if (provider.lastErrorTime) {
      const timeSinceError = Date.now() - provider.lastErrorTime.getTime()
      if (timeSinceError < ERROR_COOLDOWN_MS) {
        return false
      }
      // Resetar disponibilidade após cooldown
      provider.isAvailable = true
      provider.lastError = undefined
      provider.lastErrorTime = undefined
    }

    return true
  }

  /**
   * Marca provider como indisponível após erro
   */
  private markProviderError(provider: LLMProvider, error: string): void {
    provider.isAvailable = false
    provider.lastError = error
    provider.lastErrorTime = new Date()
  }

  /**
   * Atualiza métricas após chamada
   */
  private updateMetrics(
    provider: LLMProvider,
    response: LLMResponse,
    success: boolean
  ): void {
    if (success) {
      this.metrics.successfulRequests++
    } else {
      this.metrics.failedRequests++
    }

    // Atualizar latência média
    const totalLatency = this.metrics.avgLatencyMs * (this.metrics.totalRequests - 1) + response.latencyMs
    this.metrics.avgLatencyMs = totalLatency / this.metrics.totalRequests

    // Atualizar custo total
    this.metrics.totalCost += response.usage.estimatedCost

    // Atualizar uso por provider
    this.metrics.providerUsage[provider.name] = (this.metrics.providerUsage[provider.name] || 0) + 1

    // Atualizar latência média do provider
    provider.avgLatencyMs = provider.avgLatencyMs
      ? (provider.avgLatencyMs + response.latencyMs) / 2
      : response.latencyMs
  }

  /**
   * Retorna system prompt padrão para contexto ICARUS
   */
  private getDefaultSystemPrompt(): string {
    return `Você é um assistente especializado em distribuição de dispositivos médicos OPME no Brasil.

REGULAMENTAÇÕES QUE VOCÊ CONHECE:
- RDC 16/2013: Boas Práticas de Fabricação de Produtos Médicos
- RDC 59/2008: Rastreabilidade de produtos para saúde
- RDC 751/2022: Registro de dispositivos médicos
- IN 13/2009: Certificação de Boas Práticas
- RDC 185/2001: Registro de produtos

SUAS CAPACIDADES:
1. Consultar estoque disponível por região e depósito
2. Verificar lotes próximos do vencimento (FEFO)
3. Buscar produtos no catálogo com filtros regulatórios ANVISA
4. Consultar cirurgias agendadas e produtos necessários
5. Rastrear histórico completo de lotes

REGRAS:
- Sempre considere temperatura controlada para produtos que exigem cadeia fria
- Priorize lotes com vencimento mais próximo (FEFO)
- Verifique registro ANVISA válido antes de sugerir produtos
- Considere tempo de transporte para entregas regionais
- Responda SEMPRE em português brasileiro`
  }

  /**
   * Retorna métricas atuais
   */
  getMetrics(): LLMMetrics {
    return { ...this.metrics }
  }

  /**
   * Retorna status dos providers
   */
  getProvidersStatus(): Array<{
    name: string
    model: string
    isAvailable: boolean
    avgLatencyMs?: number
    lastError?: string
  }> {
    return this.providers.map(p => ({
      name: p.name,
      model: p.model,
      isAvailable: this.isProviderAvailable(p),
      avgLatencyMs: p.avgLatencyMs,
      lastError: p.lastError,
    }))
  }

  /**
   * Health check de todos os providers
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {}

    for (const provider of this.providers) {
      try {
        const response = await this.callProvider(provider, {
          prompt: 'Responda apenas "OK" para confirmar que está funcionando.',
          maxTokens: 10,
        })
        results[provider.name] = response.success
      } catch {
        results[provider.name] = false
      }
    }

    return results
  }

  /**
   * Reset de métricas
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatencyMs: 0,
      totalCost: 0,
      providerUsage: {},
    }
  }

  /**
   * Reset de status dos providers
   */
  resetProviders(): void {
    for (const provider of this.providers) {
      provider.isAvailable = true
      provider.lastError = undefined
      provider.lastErrorTime = undefined
    }
  }
}

// ============ INSTÂNCIA SINGLETON ============

let orchestratorInstance: LLMOrchestrator | null = null

export function getLLMOrchestrator(): LLMOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new LLMOrchestrator()
  }
  return orchestratorInstance
}

// ============ HOOK PARA REACT ============

export function useLLMOrchestrator() {
  const orchestrator = getLLMOrchestrator()

  return {
    invoke: orchestrator.invoke.bind(orchestrator),
    getMetrics: orchestrator.getMetrics.bind(orchestrator),
    getProvidersStatus: orchestrator.getProvidersStatus.bind(orchestrator),
    healthCheck: orchestrator.healthCheck.bind(orchestrator),
    resetMetrics: orchestrator.resetMetrics.bind(orchestrator),
    resetProviders: orchestrator.resetProviders.bind(orchestrator),
  }
}

export default LLMOrchestrator

