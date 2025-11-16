import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
})

export interface PredictParams {
  produto_id?: string
  cliente_id?: string
  dias?: number
  contexto?: string
  usuario_id?: string
  [key: string]: any
}

export interface PredictResult {
  valores?: number[]
  confidence?: number
  score?: number
  risco?: 'baixo' | 'medio' | 'alto'
  resposta?: string
  acoes?: any[]
  [key: string]: any
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
  async recommend(tipo: string, params: PredictParams): Promise<any[]> {
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
Preveja a demanda para o produto ${params.produto_id} nos próximos ${params.dias || 30} dias.
Retorne um JSON com: { valores: number[], confidence: number }
`

      case 'analise_inadimplencia':
        return `
Analise o risco de inadimplência do cliente ${params.cliente_id}.
Retorne um JSON com: { score: number, risco: 'baixo' | 'medio' | 'alto' }
`

      case 'recomendacao_produtos':
        return `
Recomende produtos para o cliente ${params.cliente_id}.
Limite: ${params.limite || 5} produtos.
Retorne um JSON com: { items: Array<{ id, nome, razao }> }
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
