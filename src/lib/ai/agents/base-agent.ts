/**
 * ICARUS v5.0 - Base Agent Class
 * 
 * Classe base para todos os agentes tutores do sistema.
 * Implementa o padrão LangGraph com memory persistente e tools Zod-validadas.
 * 
 * Fluxo: Input → RAG (pgvector) → LLM → Ação → Log → Feedback Loop
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { supabase } from '@/lib/config/supabase-client'
import { getLLMOrchestrator, type LLMResponse } from '../llm-orchestrator'
import {
  type AgentType,
  type AgentConfig,
  type AgentState,
  type AgentInput,
  type AgentOutput,
  type AgentMessage,
  type AgentEvent,
  type AgentEventHandler,
  type RAGASMetrics,
  AGENT_CONFIGS,
} from './types'

// ============ CLASSE BASE ============

export abstract class BaseAgent {
  protected config: AgentConfig
  protected state: AgentState | null = null
  protected eventHandlers: AgentEventHandler[] = []
  protected llmOrchestrator = getLLMOrchestrator()

  constructor(agentType: AgentType) {
    const baseConfig = AGENT_CONFIGS[agentType]
    this.config = {
      type: agentType,
      ...baseConfig,
    }
  }

  // ============ MÉTODOS PÚBLICOS ============

  /**
   * Processa uma mensagem do usuário
   */
  async process(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now()
    const sessionId = input.sessionId || crypto.randomUUID()

    try {
      // Emitir evento de início
      await this.emitEvent({
        type: 'started',
        agentType: this.config.type,
        sessionId,
        timestamp: new Date().toISOString(),
        data: { input },
      })

      // Carregar ou criar estado da sessão
      this.state = await this.loadOrCreateState(sessionId, input.userId)

      // Adicionar mensagem do usuário ao histórico
      const userMessage = this.createMessage('user', input.message)
      this.state.messages.push(userMessage)

      // Atualizar contexto com dados do módulo
      if (input.moduleContext) {
        this.state.context = {
          ...this.state.context,
          ...input.moduleContext,
        }
      }

      // Buscar contexto RAG se habilitado
      let ragContext = ''
      if (this.config.enableRAG) {
        ragContext = await this.retrieveRAGContext(input.message)
      }

      // Construir prompt com contexto
      const fullPrompt = this.buildPrompt(input.message, ragContext)

      // Chamar LLM
      const llmResponse = await this.callLLM(fullPrompt)

      // Processar resposta
      const processedResponse = await this.processLLMResponse(llmResponse)

      // Verificar se precisa de aprovação humana (HITL)
      const requiresHumanApproval = this.checkHITLRequired(processedResponse)

      if (requiresHumanApproval) {
        await this.emitEvent({
          type: 'hitl_required',
          agentType: this.config.type,
          sessionId,
          timestamp: new Date().toISOString(),
          data: { response: processedResponse },
        })
        this.state.status = 'waiting_human'
      } else {
        this.state.status = 'completed'
      }

      // Adicionar resposta ao histórico
      const assistantMessage = this.createMessage('assistant', processedResponse.content)
      if (llmResponse.toolCalls) {
        assistantMessage.toolCalls = llmResponse.toolCalls.map(tc => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
        }))
      }
      this.state.messages.push(assistantMessage)

      // Salvar estado
      await this.saveState()

      // Logar ação
      await this.logAction('response_generated', {
        sessionId,
        response: processedResponse.content.substring(0, 500),
        toolsUsed: this.state.toolsUsed,
      })

      // Emitir evento de conclusão
      await this.emitEvent({
        type: 'completed',
        agentType: this.config.type,
        sessionId,
        timestamp: new Date().toISOString(),
        data: { processingTimeMs: Date.now() - startTime },
      })

      return {
        sessionId,
        response: processedResponse.content,
        toolsUsed: this.state.toolsUsed,
        structuredData: processedResponse.structuredData,
        suggestions: processedResponse.suggestions,
        nextActions: processedResponse.nextActions,
        requiresHumanApproval,
        confidence: processedResponse.confidence,
        processingTimeMs: Date.now() - startTime,
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      await this.emitEvent({
        type: 'error',
        agentType: this.config.type,
        sessionId,
        timestamp: new Date().toISOString(),
        data: { error: errorMessage },
      })

      if (this.state) {
        this.state.status = 'error'
        this.state.error = errorMessage
        await this.saveState()
      }

      throw error
    }
  }

  /**
   * Registra um handler de eventos
   */
  onEvent(handler: AgentEventHandler): void {
    this.eventHandlers.push(handler)
  }

  /**
   * Retorna configuração do agente
   */
  getConfig(): AgentConfig {
    return { ...this.config }
  }

  /**
   * Retorna estado atual
   */
  getState(): AgentState | null {
    return this.state ? { ...this.state } : null
  }

  // ============ MÉTODOS ABSTRATOS ============

  /**
   * Processa ferramentas específicas do agente
   */
  protected abstract processTools(toolCalls: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>): Promise<Array<{
    id: string
    name: string
    result: unknown
  }>>

  /**
   * Valida entrada específica do agente
   */
  protected abstract validateInput(input: AgentInput): Promise<boolean>

  // ============ MÉTODOS PROTEGIDOS ============

  /**
   * Carrega ou cria estado da sessão
   */
  protected async loadOrCreateState(sessionId: string, userId?: string): Promise<AgentState> {
    if (!this.config.enableMemory) {
      return this.createNewState(sessionId, userId)
    }

    try {
      const { data, error } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .eq('agent_type', this.config.type)
        .single()

      if (error || !data) {
        return this.createNewState(sessionId, userId)
      }

      return {
        sessionId: data.session_id,
        agentType: data.agent_type,
        status: data.status,
        messages: data.messages || [],
        context: data.context || {},
        toolsUsed: data.tools_used || [],
        startedAt: data.started_at,
        completedAt: data.completed_at,
        error: data.error,
      }
    } catch {
      return this.createNewState(sessionId, userId)
    }
  }

  /**
   * Cria novo estado
   */
  protected createNewState(sessionId: string, _userId?: string): AgentState {
    return {
      sessionId,
      agentType: this.config.type,
      status: 'processing',
      messages: [],
      context: {},
      toolsUsed: [],
      startedAt: new Date().toISOString(),
    }
  }

  /**
   * Salva estado no banco
   */
  protected async saveState(): Promise<void> {
    if (!this.state || !this.config.enableMemory) return

    try {
      await supabase
        .from('agent_sessions')
        .upsert({
          session_id: this.state.sessionId,
          agent_type: this.state.agentType,
          status: this.state.status,
          messages: this.state.messages,
          context: this.state.context,
          tools_used: this.state.toolsUsed,
          started_at: this.state.startedAt,
          completed_at: this.state.completedAt,
          error: this.state.error,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'session_id,agent_type',
        })
    } catch (error) {
      console.error('Error saving agent state:', error)
    }
  }

  /**
   * Busca contexto RAG via pgvector
   */
  protected async retrieveRAGContext(query: string): Promise<string> {
    try {
      const { data, error } = await supabase.functions.invoke('semantic-search', {
        body: {
          query,
          match_count: 5,
          match_threshold: 0.6,
        },
      })

      if (error || !data?.resultados) {
        return ''
      }

      // Formatar contexto
      return data.resultados
        .map((r: { nome: string; descricao: string; similarity: number }) => 
          `[${r.nome}]: ${r.descricao} (relevância: ${(r.similarity * 100).toFixed(0)}%)`
        )
        .join('\n')

    } catch {
      return ''
    }
  }

  /**
   * Constrói prompt completo
   */
  protected buildPrompt(userMessage: string, ragContext: string): string {
    let prompt = ''

    // Adicionar contexto RAG se disponível
    if (ragContext) {
      prompt += `CONTEXTO RELEVANTE:\n${ragContext}\n\n`
    }

    // Adicionar histórico de mensagens (últimas 10)
    if (this.state && this.state.messages.length > 0) {
      const recentMessages = this.state.messages.slice(-10)
      prompt += 'HISTÓRICO DA CONVERSA:\n'
      for (const msg of recentMessages) {
        prompt += `${msg.role.toUpperCase()}: ${msg.content}\n`
      }
      prompt += '\n'
    }

    // Adicionar contexto do módulo
    if (this.state?.context && Object.keys(this.state.context).length > 0) {
      prompt += `CONTEXTO DO MÓDULO:\n${JSON.stringify(this.state.context, null, 2)}\n\n`
    }

    // Adicionar mensagem do usuário
    prompt += `MENSAGEM DO USUÁRIO:\n${userMessage}`

    return prompt
  }

  /**
   * Chama o LLM via orquestrador
   */
  protected async callLLM(prompt: string): Promise<LLMResponse> {
    return this.llmOrchestrator.invoke({
      prompt,
      systemPrompt: this.config.systemPrompt,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      preferredProvider: this.config.llmProvider,
    })
  }

  /**
   * Processa resposta do LLM
   */
  protected async processLLMResponse(response: LLMResponse): Promise<{
    content: string
    structuredData?: Record<string, unknown>
    suggestions?: string[]
    nextActions?: Array<{
      id: string
      type: 'navigate' | 'fill_form' | 'submit' | 'validate' | 'alert' | 'log'
      target?: string
      data?: Record<string, unknown>
      description: string
    }>
    confidence: number
  }> {
    const content = response.content
    let structuredData: Record<string, unknown> | undefined
    const suggestions: string[] = []
    const nextActions: Array<{
      id: string
      type: 'navigate' | 'fill_form' | 'submit' | 'validate' | 'alert' | 'log'
      target?: string
      data?: Record<string, unknown>
      description: string
    }> = []

    // Processar tool calls se houver
    if (response.toolCalls && response.toolCalls.length > 0) {
      const toolResults = await this.processTools(response.toolCalls)
      
      // Adicionar tools usadas ao estado
      if (this.state) {
        for (const tc of response.toolCalls) {
          if (!this.state.toolsUsed.includes(tc.name)) {
            this.state.toolsUsed.push(tc.name)
          }
        }
      }

      // Emitir eventos de tools
      for (const result of toolResults) {
        await this.emitEvent({
          type: 'tool_completed',
          agentType: this.config.type,
          sessionId: this.state?.sessionId || '',
          timestamp: new Date().toISOString(),
          data: { tool: result.name, result: result.result },
        })
      }

      // Incluir resultados das tools na resposta
      structuredData = {
        toolResults,
      }
    }

    // Tentar extrair JSON estruturado da resposta
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1])
        structuredData = { ...structuredData, ...parsed }
        
        // Extrair sugestões se houver
        if (parsed.suggestions) {
          suggestions.push(...parsed.suggestions)
        }
        
        // Extrair próximas ações se houver
        if (parsed.nextActions) {
          nextActions.push(...parsed.nextActions)
        }
      }
    } catch {
      // Ignorar erros de parsing JSON
    }

    // Calcular confiança baseada na resposta
    const confidence = this.calculateConfidence(response)

    return {
      content,
      structuredData,
      suggestions,
      nextActions,
      confidence,
    }
  }

  /**
   * Verifica se precisa de aprovação humana (HITL)
   */
  protected checkHITLRequired(response: {
    content: string
    confidence: number
  }): boolean {
    if (!this.config.enableHITL) return false

    // Verificar se confiança está abaixo do threshold
    if (response.confidence < (1 - this.config.hitlThreshold)) {
      return true
    }

    // Verificar palavras-chave que indicam incerteza
    const uncertaintyKeywords = [
      'não tenho certeza',
      'pode ser',
      'talvez',
      'preciso confirmar',
      'verificar com',
      'não encontrei',
    ]

    return uncertaintyKeywords.some(keyword => 
      response.content.toLowerCase().includes(keyword)
    )
  }

  /**
   * Calcula confiança da resposta
   */
  protected calculateConfidence(response: LLMResponse): number {
    let confidence = 0.8 // Base

    // Aumentar se usou tools
    if (response.toolCalls && response.toolCalls.length > 0) {
      confidence += 0.1
    }

    // Diminuir se resposta muito curta
    if (response.content.length < 100) {
      confidence -= 0.1
    }

    // Diminuir se teve erro
    if (response.error) {
      confidence -= 0.3
    }

    return Math.max(0, Math.min(1, confidence))
  }

  /**
   * Cria mensagem formatada
   */
  protected createMessage(
    role: 'user' | 'assistant' | 'system' | 'tool',
    content: string
  ): AgentMessage {
    return {
      id: crypto.randomUUID(),
      agentType: this.config.type,
      role,
      content,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Emite evento para handlers
   */
  protected async emitEvent(event: AgentEvent): Promise<void> {
    for (const handler of this.eventHandlers) {
      try {
        await handler(event)
      } catch (error) {
        console.error('Event handler error:', error)
      }
    }
  }

  /**
   * Loga ação no audit log
   */
  protected async logAction(action: string, data: Record<string, unknown>): Promise<void> {
    try {
      await supabase.from('audit_logs').insert({
        action,
        agent_type: this.config.type,
        data,
        timestamp: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Error logging action:', error)
    }
  }

  /**
   * Avalia resposta com métricas RAGAS
   */
  protected async evaluateWithRAGAS(
    question: string,
    answer: string,
    contexts: string[]
  ): Promise<RAGASMetrics> {
    // Implementação simplificada de métricas RAGAS
    // Em produção, usar biblioteca RAGAS completa

    const faithfulness = this.calculateFaithfulness(answer, contexts)
    const answerRelevancy = this.calculateAnswerRelevancy(question, answer)
    const contextPrecision = this.calculateContextPrecision(question, contexts)
    const contextRecall = contexts.length > 0 ? 0.8 : 0.2

    const overallScore = (
      faithfulness * 0.3 +
      answerRelevancy * 0.3 +
      contextPrecision * 0.2 +
      contextRecall * 0.2
    )

    return {
      faithfulness,
      answerRelevancy,
      contextPrecision,
      contextRecall,
      overallScore,
    }
  }

  private calculateFaithfulness(answer: string, contexts: string[]): number {
    if (contexts.length === 0) return 0.5
    
    // Verificar se resposta contém informações do contexto
    const contextWords = contexts.join(' ').toLowerCase().split(/\s+/)
    const answerWords = answer.toLowerCase().split(/\s+/)
    
    const overlap = answerWords.filter(w => contextWords.includes(w)).length
    return Math.min(1, overlap / answerWords.length + 0.3)
  }

  private calculateAnswerRelevancy(question: string, answer: string): number {
    // Verificar se resposta aborda a pergunta
    const questionWords = question.toLowerCase().split(/\s+/)
    const answerWords = answer.toLowerCase().split(/\s+/)
    
    const overlap = questionWords.filter(w => answerWords.includes(w)).length
    return Math.min(1, overlap / questionWords.length + 0.4)
  }

  private calculateContextPrecision(question: string, contexts: string[]): number {
    if (contexts.length === 0) return 0
    
    // Verificar relevância do contexto para a pergunta
    const questionWords = question.toLowerCase().split(/\s+/)
    
    let totalRelevance = 0
    for (const context of contexts) {
      const contextWords = context.toLowerCase().split(/\s+/)
      const overlap = questionWords.filter(w => contextWords.includes(w)).length
      totalRelevance += overlap / questionWords.length
    }
    
    return Math.min(1, totalRelevance / contexts.length + 0.3)
  }
}

export default BaseAgent

