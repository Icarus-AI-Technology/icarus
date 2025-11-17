import Anthropic from '@anthropic-ai/sdk'

/**
 * IcarusBrain - AI Service Integration
 *
 * Provides 12 AI services for predictive analytics, insights, and recommendations
 * Uses Claude Sonnet 4.5 for advanced AI capabilities
 */

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
})

export type AIServiceType =
  | 'demanda'           // Demand forecasting
  | 'inadimplencia'     // Delinquency score
  | 'produtos'          // Product recommendations
  | 'estoque'           // Inventory optimization
  | 'sentimento'        // Sentiment analysis
  | 'anomalias'         // Anomaly detection
  | 'precificacao'      // Dynamic pricing
  | 'churn'             // Churn prediction
  | 'lead-scoring'      // Lead qualification
  | 'credito'           // Credit management
  | 'roteamento'        // Intelligent routing
  | 'assistente'        // Virtual assistant

export interface PredictParams extends Record<string, unknown> {
  produto_id?: string
  cliente_id?: string
  dias?: number
  periodo?: number
  limite?: number
  contexto?: string
  usuario_id?: string
  tipo?: 'cross-sell' | 'up-sell' | 'similar'
}

export interface ActionItem {
  descricao: string
  prioridade?: 'baixa' | 'media' | 'alta'
  prazo?: string
}

export interface RecommendationItem {
  produto_id?: string
  nome?: string
  score?: number
  motivo?: string
  tipo?: string
}

export interface PredictResult extends Record<string, unknown> {
  valores?: number[]
  previsoes?: Array<{ data: string; quantidade: number; confianca: number }>
  confidence?: number
  score?: number
  risco?: 'baixo' | 'medio' | 'alto'
  resposta?: string
  acoes?: ActionItem[]
  items?: RecommendationItem[]
  fatores?: Array<{ fator: string; impacto: number }>
  recomendacao?: string
  tendencia?: 'alta' | 'baixa' | 'estavel'
}

class IcarusBrain {
  /**
   * Realiza previsões usando IA
   */
  async predict(tipo: string, params: PredictParams): Promise<PredictResult> {
    const prompt = this.buildPrompt(tipo, params)

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text)
        } catch {
          return { resposta: content.text }
        }
      }

      return { resposta: 'Erro ao processar resposta' }
    } catch (error) {
      console.error('Erro IcarusBrain:', error)
      throw error
    }
  }

  /**
   * Analisa dados usando IA
   */
  async analyze(tipo: string, params: PredictParams): Promise<PredictResult> {
    return this.predict(`analise_${tipo}`, params)
  }

  /**
   * Gera recomendações usando IA
   */
  async recommend(tipo: string, params: PredictParams): Promise<RecommendationItem[]> {
    const result = await this.predict(`recomendacao_${tipo}`, params)
    return result.items || []
  }

  /**
   * Chat com assistente IA
   */
  async chat(mensagem: string, params: PredictParams = {}): Promise<PredictResult> {
    const prompt = `
Contexto: ${params.contexto || 'geral'}
Usuário: ${params.usuario_id || 'desconhecido'}

Mensagem do usuário: ${mensagem}

Responda de forma clara e objetiva. Se houver ações sugeridas, inclua no campo "acoes".
Retorne um JSON com os campos: resposta (string) e opcionalmente acoes (array).
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        try {
          return JSON.parse(content.text)
        } catch {
          return { resposta: content.text, acoes: [] }
        }
      }

      return { resposta: 'Erro ao processar resposta', acoes: [] }
    } catch (error) {
      console.error('Erro IcarusBrain chat:', error)
      throw error
    }
  }

  private buildPrompt(tipo: string, params: PredictParams): string {
    switch (tipo) {
      case 'demanda':
        return `
Preveja a demanda para o produto ${params.produto_id} nos próximos ${params.dias || params.periodo || 30} dias.
Retorne um JSON com: {
  valores: number[],
  confidence: number,
  tendencia: 'alta' | 'baixa' | 'estavel',
  previsoes: Array<{ data: string, quantidade: number, confianca: number }>
}
`

      case 'analise_inadimplencia':
        return `
Analise o risco de inadimplência do cliente ${params.cliente_id}.
Retorne um JSON com: {
  score: number (0-100),
  risco: 'baixo' | 'medio' | 'alto',
  fatores: Array<{ fator: string, impacto: number }>,
  recomendacao: string
}
`

      case 'recomendacao_produtos':
        return `
Recomende produtos para o cliente ${params.cliente_id}.
Tipo: ${params.tipo || 'cross-sell'}
Limite: ${params.limite || 5} produtos.
Retorne um JSON com: {
  items: Array<{
    produto_id: string,
    nome: string,
    score: number,
    motivo: string,
    tipo: string
  }>
}
`

      case 'analise_estoque':
        return `
Analise o estoque e sugira otimizações.
Produto: ${params.produto_id || 'todos'}
Retorne um JSON com sugestões de reposição e otimização.
`

      case 'analise_sentimento':
        return `
Analise o sentimento do feedback/texto fornecido.
Retorne um JSON com: { score: number, sentimento: 'positivo' | 'neutro' | 'negativo' }
`

      default:
        return `
Tipo de análise: ${tipo}
Parâmetros: ${JSON.stringify(params)}

Retorne um JSON apropriado para este tipo de análise.
`
    }
  }
}

export const icarusBrain = new IcarusBrain()
