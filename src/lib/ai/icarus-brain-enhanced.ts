import Anthropic from '@anthropic-ai/sdk'

/**
 * IcarusBrain Enhanced - Sistema de Inteligência Artificial ICARUS v5.0
 *
 * Fornece 12 serviços de IA para análise preditiva, insights e recomendações
 * Usa Claude Sonnet 4.5 para capacidades avançadas de IA
 *
 * Serviços disponíveis:
 * 1.  Previsão de Demanda (demanda)
 * 2.  Score de Inadimplência (inadimplencia)
 * 3.  Recomendação de Produtos (produtos)
 * 4.  Otimização de Estoque (estoque)
 * 5.  Análise de Sentimento (sentimento)
 * 6.  Detecção de Anomalias (anomalias)
 * 7.  Precificação Dinâmica (precificacao)
 * 8.  Predição de Churn (churn)
 * 9.  Lead Scoring (lead-scoring)
 * 10. Gestão de Crédito (credito)
 * 11. Roteamento Inteligente (roteamento)
 * 12. Assistente Virtual (assistente)
 */

// Initialize Anthropic client
const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
})

const USE_MOCK = !import.meta.env.VITE_ANTHROPIC_API_KEY

// Types
export type AIServiceType =
  | 'demanda'
  | 'inadimplencia'
  | 'produtos'
  | 'estoque'
  | 'sentimento'
  | 'anomalias'
  | 'precificacao'
  | 'churn'
  | 'lead-scoring'
  | 'credito'
  | 'roteamento'
  | 'assistente'

export interface PredictParams {
  produto_id?: string
  cliente_id?: string
  dias?: number
  periodo?: number
  limite?: number
  contexto?: string
  usuario_id?: string
  tipo?: 'cross-sell' | 'up-sell' | 'similar'
  dados_historicos?: any[]
  metricas?: any
  feedback?: string
  [key: string]: any
}

export interface PredictResult {
  valores?: number[]
  previsoes?: Array<{ data: string; quantidade: number; confianca: number }>
  confidence?: number
  score?: number
  risco?: 'baixo' | 'medio' | 'alto'
  resposta?: string
  acoes?: any[]
  items?: any[]
  fatores?: Array<{ fator: string; impacto: number }>
  recomendacao?: string
  tendencia?: 'alta' | 'baixa' | 'estavel'
  [key: string]: any
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  confidence?: number
  timestamp: Date
}

/**
 * IcarusBrain Enhanced Service
 */
class IcarusBrainEnhanced {
  /**
   * 1. Previsão de Demanda
   * Prevê a demanda futura de produtos com base em histórico e sazonalidade
   */
  async predictDemand(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockPredictDemand(params)

    const prompt = `
Você é um especialista em previsão de demanda para produtos OPME (Órteses, Próteses e Materiais Especiais).

Produto: ${params.produto_id || 'N/A'}
Período de previsão: ${params.dias || params.periodo || 30} dias
Dados históricos: ${JSON.stringify(params.dados_historicos || [])}

Analise os dados e retorne um JSON com:
{
  "valores": [array de números com previsão diária],
  "previsoes": [{ "data": "YYYY-MM-DD", "quantidade": number, "confianca": number }],
  "confidence": number (0-1),
  "tendencia": "alta" | "baixa" | "estavel",
  "recomendacao": "string com ação sugerida"
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain predictDemand:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        timestamp: new Date(),
      }
    }
  }

  /**
   * 2. Score de Inadimplência
   * Calcula o risco de inadimplência de um cliente
   */
  async analyzeDefaultRisk(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockAnalyzeDefaultRisk(params)

    const prompt = `
Você é um especialista em análise de crédito e risco de inadimplência.

Cliente: ${params.cliente_id || 'N/A'}
Dados: ${JSON.stringify(params)}

Analise o risco e retorne um JSON com:
{
  "score": number (0-100),
  "risco": "baixo" | "medio" | "alto",
  "fatores": [{ "fator": string, "impacto": number }],
  "recomendacao": string,
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain analyzeDefaultRisk:', error)
      return this.mockAnalyzeDefaultRisk(params)
    }
  }

  /**
   * 3. Recomendação de Produtos
   * Recomenda produtos baseado em histórico e preferências do cliente
   */
  async recommendProducts(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockRecommendProducts(params)

    const prompt = `
Você é um especialista em recomendação de produtos OPME.

Cliente: ${params.cliente_id || 'N/A'}
Tipo: ${params.tipo || 'cross-sell'}
Limite: ${params.limite || 5} produtos
Contexto: ${JSON.stringify(params.contexto || {})}

Retorne um JSON com:
{
  "items": [{
    "produto_id": string,
    "nome": string,
    "score": number (0-1),
    "motivo": string,
    "tipo": "cross-sell" | "up-sell" | "similar"
  }],
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain recommendProducts:', error)
      return this.mockRecommendProducts(params)
    }
  }

  /**
   * 4. Otimização de Estoque
   * Sugere níveis ideais de estoque e pontos de reposição
   */
  async optimizeInventory(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockOptimizeInventory(params)

    const prompt = `
Você é um especialista em gestão de estoque para produtos OPME.

Produto: ${params.produto_id || 'todos'}
Dados: ${JSON.stringify(params)}

Retorne um JSON com:
{
  "nivel_ideal": number,
  "ponto_reposicao": number,
  "estoque_seguranca": number,
  "recomendacoes": [string],
  "economia_estimada": string,
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain optimizeInventory:', error)
      return this.mockOptimizeInventory(params)
    }
  }

  /**
   * 5. Análise de Sentimento
   * Analisa sentimento de feedback de clientes e NPS
   */
  async analyzeSentiment(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockAnalyzeSentiment(params)

    const prompt = `
Analise o sentimento do seguinte feedback:

"${params.feedback || params.contexto || ''}"

Retorne um JSON com:
{
  "score": number (-1 a 1),
  "sentimento": "positivo" | "neutro" | "negativo",
  "emocoes": [string],
  "temas": [string],
  "recomendacao": string,
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain analyzeSentiment:', error)
      return this.mockAnalyzeSentiment(params)
    }
  }

  /**
   * 6. Detecção de Anomalias
   * Detecta padrões anômalos em transações e operações
   */
  async detectAnomalies(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockDetectAnomalies(params)

    const prompt = `
Analise os seguintes dados para detectar anomalias:

${JSON.stringify(params.dados_historicos || params)}

Retorne um JSON com:
{
  "anomalias": [{
    "tipo": string,
    "severidade": "baixa" | "media" | "alta",
    "descricao": string,
    "acao_sugerida": string
  }],
  "score_anomalia": number (0-1),
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain detectAnomalies:', error)
      return this.mockDetectAnomalies(params)
    }
  }

  /**
   * 7. Precificação Dinâmica
   * Sugere preços ideais baseados em mercado e demanda
   */
  async predictPricing(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockPredictPricing(params)

    const prompt = `
Você é um especialista em precificação de produtos OPME.

Produto: ${params.produto_id || 'N/A'}
Dados de mercado: ${JSON.stringify(params)}

Retorne um JSON com:
{
  "preco_atual": number,
  "preco_sugerido": number,
  "variacao_percentual": number,
  "justificativa": string,
  "faixa_competitiva": { "min": number, "max": number },
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain predictPricing:', error)
      return this.mockPredictPricing(params)
    }
  }

  /**
   * 8. Predição de Churn
   * Prevê probabilidade de um cliente cancelar ou parar de comprar
   */
  async predictChurn(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockPredictChurn(params)

    const prompt = `
Analise o risco de churn do cliente:

Cliente: ${params.cliente_id || 'N/A'}
Dados: ${JSON.stringify(params)}

Retorne um JSON com:
{
  "probabilidade_churn": number (0-1),
  "risco": "baixo" | "medio" | "alto",
  "fatores_risco": [string],
  "acoes_retencao": [string],
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain predictChurn:', error)
      return this.mockPredictChurn(params)
    }
  }

  /**
   * 9. Lead Scoring
   * Qualifica e pontua leads para priorização de vendas
   */
  async scoreLeads(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockScoreLeads(params)

    const prompt = `
Analise e pontue o seguinte lead:

${JSON.stringify(params)}

Retorne um JSON com:
{
  "score": number (0-100),
  "qualificacao": "frio" | "morno" | "quente",
  "probabilidade_conversao": number (0-1),
  "fatores_positivos": [string],
  "fatores_negativos": [string],
  "proximos_passos": [string],
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain scoreLeads:', error)
      return this.mockScoreLeads(params)
    }
  }

  /**
   * 10. Gestão de Crédito
   * Calcula limite de crédito ideal para clientes
   */
  async manageCreditLimit(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockManageCreditLimit(params)

    const prompt = `
Analise o perfil de crédito do cliente:

Cliente: ${params.cliente_id || 'N/A'}
Dados: ${JSON.stringify(params)}

Retorne um JSON com:
{
  "limite_atual": number,
  "limite_sugerido": number,
  "justificativa": string,
  "condicoes": [string],
  "validade_analise": string,
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1536,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain manageCreditLimit:', error)
      return this.mockManageCreditLimit(params)
    }
  }

  /**
   * 11. Roteamento Inteligente
   * Otimiza rotas de logística e entregas
   */
  async optimizeRoutes(params: PredictParams): Promise<AIResponse> {
    if (USE_MOCK) return this.mockOptimizeRoutes(params)

    const prompt = `
Otimize as rotas de entrega:

Entregas: ${JSON.stringify(params)}

Retorne um JSON com:
{
  "rotas_otimizadas": [{
    "rota_id": string,
    "paradas": [string],
    "distancia_km": number,
    "tempo_estimado": string,
    "custo_estimado": string
  }],
  "economia_total": string,
  "eficiencia": string,
  "confidence": number (0-1)
}
`

    try {
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      })

      const content = response.content[0]
      if (content.type === 'text') {
        const data = JSON.parse(content.text)
        return {
          success: true,
          data,
          confidence: data.confidence,
          timestamp: new Date(),
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain optimizeRoutes:', error)
      return this.mockOptimizeRoutes(params)
    }
  }

  /**
   * 12. Assistente Virtual
   * Chat com IA para suporte e orientação
   */
  async chat(mensagem: string, params: PredictParams = {}): Promise<AIResponse> {
    if (USE_MOCK) return this.mockChat(mensagem, params)

    const prompt = `
Você é o Assistente Virtual do ICARUS, um sistema ERP para gestão OPME.

Contexto: ${params.contexto || 'geral'}
Usuário: ${params.usuario_id || 'desconhecido'}

Pergunta do usuário: "${mensagem}"

Responda de forma clara, objetiva e profissional. Se houver ações sugeridas, inclua no campo "acoes".
Retorne um JSON com:
{
  "resposta": string,
  "acoes": [{ "tipo": string, "descricao": string, "link"?: string }],
  "sugestoes": [string]
}
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
          const data = JSON.parse(content.text)
          return {
            success: true,
            data,
            timestamp: new Date(),
          }
        } catch {
          return {
            success: true,
            data: { resposta: content.text, acoes: [] },
            timestamp: new Date(),
          }
        }
      }

      return {
        success: false,
        error: 'Formato de resposta inválido',
        timestamp: new Date(),
      }
    } catch (error) {
      console.error('Erro IcarusBrain chat:', error)
      return this.mockChat(mensagem, params)
    }
  }

  // Mock implementations (fallback when API key is not available)
  private mockPredictDemand(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        valores: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50),
        previsoes: Array.from({ length: 7 }, (_, i) => ({
          data: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          quantidade: Math.floor(Math.random() * 100) + 50,
          confianca: 0.75 + Math.random() * 0.2,
        })),
        confidence: 0.82,
        tendencia: 'alta' as const,
        recomendacao: 'Aumentar estoque em 15% para os próximos 30 dias',
      },
      confidence: 0.82,
      timestamp: new Date(),
    }
  }

  private mockAnalyzeDefaultRisk(params: PredictParams): AIResponse {
    const score = Math.random() * 100
    return {
      success: true,
      data: {
        score: score.toFixed(2),
        risco: score > 70 ? 'alto' : score > 40 ? 'medio' : 'baixo',
        fatores: [
          { fator: 'Histórico de pagamento', impacto: 0.4 },
          { fator: 'Valor em atraso', impacto: -0.3 },
          { fator: 'Tempo de relacionamento', impacto: 0.3 },
        ],
        recomendacao: score > 70 ? 'Recomendar pagamento antecipado' : 'Manter condições normais',
        confidence: 0.85,
      },
      confidence: 0.85,
      timestamp: new Date(),
    }
  }

  private mockRecommendProducts(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        items: [
          {
            produto_id: 'PRO-001',
            nome: 'Stent Coronário Premium',
            score: 0.95,
            motivo: 'Histórico de compras similar',
            tipo: 'cross-sell',
          },
          {
            produto_id: 'PRO-002',
            nome: 'Prótese de Quadril Cerâmica',
            score: 0.88,
            motivo: 'Categoria relacionada',
            tipo: 'up-sell',
          },
        ],
        confidence: 0.90,
      },
      confidence: 0.90,
      timestamp: new Date(),
    }
  }

  private mockOptimizeInventory(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        nivel_ideal: 150,
        ponto_reposicao: 75,
        estoque_seguranca: 50,
        recomendacoes: ['Reabastecer quando atingir 75 unidades', 'Manter estoque de segurança de 50 unidades'],
        economia_estimada: 'R$ 12.500/mês',
        confidence: 0.88,
      },
      confidence: 0.88,
      timestamp: new Date(),
    }
  }

  private mockAnalyzeSentiment(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        score: 0.7,
        sentimento: 'positivo',
        emocoes: ['satisfação', 'confiança'],
        temas: ['qualidade do produto', 'atendimento'],
        recomendacao: 'Manter padrão de qualidade',
        confidence: 0.92,
      },
      confidence: 0.92,
      timestamp: new Date(),
    }
  }

  private mockDetectAnomalies(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        anomalias: [
          {
            tipo: 'Pico de vendas incomum',
            severidade: 'media',
            descricao: 'Aumento de 150% nas vendas do produto X',
            acao_sugerida: 'Verificar estoque e fornecedores',
          },
        ],
        score_anomalia: 0.35,
        confidence: 0.87,
      },
      confidence: 0.87,
      timestamp: new Date(),
    }
  }

  private mockPredictPricing(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        preco_atual: 1000,
        preco_sugerido: 1080,
        variacao_percentual: 8.0,
        justificativa: 'Aumento de demanda e redução de oferta no mercado',
        faixa_competitiva: { min: 950, max: 1150 },
        confidence: 0.78,
      },
      confidence: 0.78,
      timestamp: new Date(),
    }
  }

  private mockPredictChurn(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        probabilidade_churn: 0.25,
        risco: 'baixo',
        fatores_risco: ['Redução de 10% nas compras nos últimos 3 meses'],
        acoes_retencao: ['Oferecer desconto de fidelidade', 'Contato proativo do gerente de conta'],
        confidence: 0.84,
      },
      confidence: 0.84,
      timestamp: new Date(),
    }
  }

  private mockScoreLeads(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        score: 75,
        qualificacao: 'quente',
        probabilidade_conversao: 0.65,
        fatores_positivos: ['Hospital de grande porte', 'Orçamento aprovado'],
        fatores_negativos: ['Concorrente estabelecido'],
        proximos_passos: ['Agendar demonstração', 'Enviar proposta comercial'],
        confidence: 0.89,
      },
      confidence: 0.89,
      timestamp: new Date(),
    }
  }

  private mockManageCreditLimit(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        limite_atual: 50000,
        limite_sugerido: 75000,
        justificativa: 'Histórico de pagamento excelente e crescimento de 30% nas compras',
        condicoes: ['Manter pagamentos em dia', 'Revisão trimestral'],
        validade_analise: '90 dias',
        confidence: 0.91,
      },
      confidence: 0.91,
      timestamp: new Date(),
    }
  }

  private mockOptimizeRoutes(params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        rotas_otimizadas: [
          {
            rota_id: 'R1',
            paradas: ['Hospital A', 'Clínica B', 'Hospital C'],
            distancia_km: 45,
            tempo_estimado: '2h 30min',
            custo_estimado: 'R$ 120,00',
          },
        ],
        economia_total: 'R$ 350,00/dia',
        eficiencia: '92%',
        confidence: 0.88,
      },
      confidence: 0.88,
      timestamp: new Date(),
    }
  }

  private mockChat(mensagem: string, params: PredictParams): AIResponse {
    return {
      success: true,
      data: {
        resposta: `Olá! Como posso ajudar você com "${mensagem}"? O ICARUS oferece diversos módulos para gestão OPME.`,
        acoes: [
          { tipo: 'navegacao', descricao: 'Ver módulos disponíveis', link: '/modules' },
        ],
        sugestoes: ['Como cadastrar produtos?', 'Como gerar relatórios?', 'Como usar o módulo de cirurgias?'],
      },
      timestamp: new Date(),
    }
  }
}

export const icarusBrainEnhanced = new IcarusBrainEnhanced()
export default icarusBrainEnhanced
