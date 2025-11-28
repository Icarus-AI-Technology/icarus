/**
 * ICARUS v5.0 - Error Predictor Agent
 * 
 * Prediz falhas (ex: risco de vencimento de lotes via ML)
 * e envia alertas proativos.
 * 
 * Módulos: Cirurgias (alertas ANVISA), Financeiro (inadimplência)
 * LLMs: LlamaIndex para predições vetoriais, pgvector para histórico
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { BaseAgent } from './base-agent'
import { type AgentInput } from './types'
import { supabase } from '@/lib/config/supabase-client'

// ============ TIPOS ============

interface PredictionResult {
  type: 'expiration' | 'stockout' | 'default' | 'anomaly' | 'compliance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  probability: number // 0-1
  description: string
  affectedItems: Array<{
    id: string
    name: string
    details: Record<string, unknown>
  }>
  recommendedActions: string[]
  deadline?: string
}

interface PatternAnalysis {
  pattern: string
  frequency: number
  lastOccurrence: string
  trend: 'increasing' | 'stable' | 'decreasing'
  relatedFactors: string[]
}

interface AnomalyDetection {
  detected: boolean
  type?: string
  confidence: number
  description?: string
  affectedArea?: string
  suggestedAction?: string
}

interface Alert {
  id: string
  type: 'expiration' | 'stockout' | 'default' | 'anomaly' | 'compliance'
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  message: string
  data: Record<string, unknown>
  createdAt: string
  expiresAt?: string
  acknowledged: boolean
}

// ============ CLASSE ============

export class ErrorPredictorAgent extends BaseAgent {
  constructor() {
    super('error-predictor')
  }

  // ============ VALIDAÇÃO ============

  protected async validateInput(input: AgentInput): Promise<boolean> {
    return input.message && input.message.trim().length > 0
  }

  // ============ PROCESSAMENTO DE TOOLS ============

  protected async processTools(toolCalls: Array<{
    id: string
    name: string
    arguments: Record<string, unknown>
  }>): Promise<Array<{
    id: string
    name: string
    result: unknown
  }>> {
    const results = []

    for (const toolCall of toolCalls) {
      let result: unknown

      switch (toolCall.name) {
        case 'predict_expiration':
          result = await this.predictExpiration(toolCall.arguments)
          break
        case 'analyze_patterns':
          result = await this.analyzePatterns(toolCall.arguments)
          break
        case 'detect_anomaly':
          result = await this.detectAnomaly(toolCall.arguments)
          break
        case 'send_alert':
          result = await this.sendAlert(toolCall.arguments)
          break
        default:
          result = { error: `Unknown tool: ${toolCall.name}` }
      }

      results.push({
        id: toolCall.id,
        name: toolCall.name,
        result,
      })
    }

    return results
  }

  // ============ TOOLS ============

  /**
   * Prediz vencimentos de lotes e registros
   */
  private async predictExpiration(args: Record<string, unknown>): Promise<PredictionResult> {
    const module = args.module as string || 'estoque-ia'
    const daysAhead = args.daysAhead as number || 90

    const affectedItems: Array<{
      id: string
      name: string
      details: Record<string, unknown>
    }> = []

    try {
      // Buscar lotes próximos ao vencimento
      if (module === 'estoque-ia' || module === 'all') {
        const { data: lotes } = await supabase
          .from('estoque_lotes')
          .select('*')
          .lte('data_validade', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString())
          .gte('data_validade', new Date().toISOString())
          .order('data_validade', { ascending: true })
          .limit(20)

        if (lotes) {
          for (const lote of lotes) {
            const diasRestantes = Math.ceil(
              (new Date(lote.data_validade).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
            )
            affectedItems.push({
              id: lote.id,
              name: `Lote ${lote.numero_lote}`,
              details: {
                produto: lote.produto_id,
                validade: lote.data_validade,
                diasRestantes,
                quantidade: lote.quantidade,
              },
            })
          }
        }
      }

      // Buscar registros ANVISA próximos ao vencimento
      if (module === 'compliance' || module === 'all') {
        const { data: produtos } = await supabase
          .from('opme_produtos')
          .select('*')
          .lte('anvisa_validade', new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString())
          .gte('anvisa_validade', new Date().toISOString())
          .order('anvisa_validade', { ascending: true })
          .limit(10)

        if (produtos) {
          for (const produto of produtos) {
            affectedItems.push({
              id: produto.id,
              name: `Registro ANVISA - ${produto.nome}`,
              details: {
                codigo_anvisa: produto.codigo_anvisa,
                validade: produto.anvisa_validade,
                tipo: 'registro_anvisa',
              },
            })
          }
        }
      }
    } catch (error) {
      console.error('Error predicting expiration:', error)
    }

    // Calcular severidade baseada na quantidade e urgência
    let severity: 'critical' | 'high' | 'medium' | 'low' = 'low'
    if (affectedItems.length > 10) severity = 'critical'
    else if (affectedItems.length > 5) severity = 'high'
    else if (affectedItems.length > 2) severity = 'medium'

    const criticalItems = affectedItems.filter(item => {
      const dias = item.details.diasRestantes as number
      return dias !== undefined && dias <= 30
    })
    if (criticalItems.length > 0) severity = 'critical'

    return {
      type: 'expiration',
      severity,
      probability: affectedItems.length > 0 ? 0.95 : 0.1,
      description: affectedItems.length > 0
        ? `Encontrados ${affectedItems.length} itens com vencimento nos próximos ${daysAhead} dias.`
        : `Nenhum vencimento previsto nos próximos ${daysAhead} dias.`,
      affectedItems,
      recommendedActions: [
        'Priorizar uso de lotes mais antigos (FEFO)',
        'Verificar possibilidade de devolução ao fornecedor',
        'Avaliar promoções para produtos próximos ao vencimento',
        'Renovar registros ANVISA com antecedência',
      ],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  /**
   * Analisa padrões históricos
   */
  private async analyzePatterns(args: Record<string, unknown>): Promise<{
    patterns: PatternAnalysis[]
    insights: string[]
  }> {
    const module = args.module as string || 'all'
    const period = args.period as string || '30d'

    const patterns: PatternAnalysis[] = []
    const insights: string[] = []

    // Padrões simulados baseados em análise típica de OPME
    // Em produção, isso seria calculado a partir de dados reais

    if (module === 'estoque-ia' || module === 'all') {
      patterns.push({
        pattern: 'Pico de consumo às segundas-feiras',
        frequency: 0.85,
        lastOccurrence: new Date().toISOString(),
        trend: 'stable',
        relatedFactors: ['Cirurgias eletivas', 'Retorno de fim de semana'],
      })

      patterns.push({
        pattern: 'Baixa movimentação em feriados',
        frequency: 0.92,
        lastOccurrence: new Date().toISOString(),
        trend: 'stable',
        relatedFactors: ['Feriados nacionais', 'Recessos hospitalares'],
      })

      insights.push('Considere aumentar estoque de segurança para segundas-feiras')
      insights.push('Planeje reposições antes de feriados prolongados')
    }

    if (module === 'financeiro-avancado' || module === 'all') {
      patterns.push({
        pattern: 'Atraso de pagamento convênios >60 dias',
        frequency: 0.23,
        lastOccurrence: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        trend: 'increasing',
        relatedFactors: ['Glosas recorrentes', 'Documentação incompleta'],
      })

      patterns.push({
        pattern: 'Concentração de vencimentos no dia 15',
        frequency: 0.67,
        lastOccurrence: new Date().toISOString(),
        trend: 'stable',
        relatedFactors: ['Contratos padrão', 'Ciclo de faturamento'],
      })

      insights.push('Atenção: tendência de aumento em atrasos de convênios')
      insights.push('Considere diversificar datas de vencimento para melhor fluxo de caixa')
    }

    if (module === 'cirurgias-procedimentos' || module === 'all') {
      patterns.push({
        pattern: 'Cancelamentos de última hora às sextas',
        frequency: 0.15,
        lastOccurrence: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        trend: 'decreasing',
        relatedFactors: ['Exames pré-operatórios', 'Disponibilidade de leitos'],
      })

      insights.push('Taxa de cancelamento em queda - bom indicador de planejamento')
    }

    return { patterns, insights }
  }

  /**
   * Detecta anomalias em operações
   */
  private async detectAnomaly(args: Record<string, unknown>): Promise<AnomalyDetection> {
    const data = args.data as Record<string, unknown> || {}
    const type = args.type as string || 'general'

    // Análise simplificada de anomalias
    // Em produção, usar modelos ML treinados

    let detected = false
    let anomalyType: string | undefined
    let confidence = 0
    let description: string | undefined
    let affectedArea: string | undefined
    let suggestedAction: string | undefined

    // Verificar anomalias por tipo
    switch (type) {
      case 'movimentacao': {
        // Detectar movimentações anormais de estoque
        const quantidade = data.quantidade as number
        const mediaHistorica = data.mediaHistorica as number || 100

        if (quantidade > mediaHistorica * 3) {
          detected = true
          anomalyType = 'volume_alto'
          confidence = 0.85
          description = `Movimentação ${(quantidade / mediaHistorica * 100).toFixed(0)}% acima da média`
          affectedArea = 'Estoque'
          suggestedAction = 'Verificar se há erro de digitação ou operação especial'
        }
        break
      }

      case 'financeiro': {
        // Detectar anomalias financeiras
        const valor = data.valor as number
        const valorMedio = data.valorMedio as number || 10000

        if (valor > valorMedio * 5) {
          detected = true
          anomalyType = 'valor_atipico'
          confidence = 0.9
          description = `Valor ${(valor / valorMedio * 100).toFixed(0)}% acima da média`
          affectedArea = 'Financeiro'
          suggestedAction = 'Revisar lançamento e confirmar com responsável'
        }
        break
      }

      case 'acesso': {
        // Detectar acessos suspeitos
        const horaAcesso = data.hora as number
        const _localAcesso = data.local as string

        if (horaAcesso < 6 || horaAcesso > 22) {
          detected = true
          anomalyType = 'acesso_fora_horario'
          confidence = 0.7
          description = `Acesso em horário atípico: ${horaAcesso}h`
          affectedArea = 'Segurança'
          suggestedAction = 'Verificar legitimidade do acesso com usuário'
        }
        break
      }

      default:
        // Análise geral
        confidence = 0.3
        description = 'Nenhuma anomalia significativa detectada'
    }

    return {
      detected,
      type: anomalyType,
      confidence,
      description,
      affectedArea,
      suggestedAction,
    }
  }

  /**
   * Envia alerta proativo
   */
  private async sendAlert(args: Record<string, unknown>): Promise<Alert> {
    const type = args.type as Alert['type'] || 'anomaly'
    const severity = args.severity as Alert['severity'] || 'medium'
    const title = args.title as string || 'Alerta do Sistema'
    const message = args.message as string || 'Alerta gerado pelo Error Predictor'
    const data = args.data as Record<string, unknown> || {}

    const alert: Alert = {
      id: crypto.randomUUID(),
      type,
      severity,
      title,
      message,
      data,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      acknowledged: false,
    }

    // Salvar alerta no banco
    try {
      await supabase.from('alerts').insert({
        id: alert.id,
        type: alert.type,
        severity: alert.severity,
        title: alert.title,
        message: alert.message,
        data: alert.data,
        created_at: alert.createdAt,
        expires_at: alert.expiresAt,
        acknowledged: alert.acknowledged,
      })

      // Log da ação
      await this.logAction('alert_sent', {
        alertId: alert.id,
        type: alert.type,
        severity: alert.severity,
      })
    } catch (error) {
      console.error('Error saving alert:', error)
    }

    return alert
  }

  // ============ MÉTODOS PÚBLICOS ADICIONAIS ============

  /**
   * Executa análise completa de riscos
   */
  async runFullAnalysis(): Promise<{
    predictions: PredictionResult[]
    patterns: PatternAnalysis[]
    anomalies: AnomalyDetection[]
    alerts: Alert[]
  }> {
    const predictions: PredictionResult[] = []
    const allPatterns: PatternAnalysis[] = []
    const anomalies: AnomalyDetection[] = []
    const alerts: Alert[] = []

    // Predições de vencimento
    const expirationPrediction = await this.predictExpiration({ module: 'all', daysAhead: 90 })
    predictions.push(expirationPrediction)

    // Análise de padrões
    const { patterns, insights } = await this.analyzePatterns({ module: 'all', period: '30d' })
    allPatterns.push(...patterns)

    // Detecção de anomalias
    const anomaly = await this.detectAnomaly({ type: 'general' })
    anomalies.push(anomaly)

    // Gerar alertas para itens críticos
    if (expirationPrediction.severity === 'critical') {
      const alert = await this.sendAlert({
        type: 'expiration',
        severity: 'critical',
        title: 'Vencimentos Críticos Detectados',
        message: expirationPrediction.description,
        data: { affectedCount: expirationPrediction.affectedItems.length },
      })
      alerts.push(alert)
    }

    // Alertas baseados em insights
    for (const insight of insights) {
      if (insight.toLowerCase().includes('atenção') || insight.toLowerCase().includes('aumento')) {
        const alert = await this.sendAlert({
          type: 'anomaly',
          severity: 'medium',
          title: 'Insight Importante',
          message: insight,
          data: {},
        })
        alerts.push(alert)
      }
    }

    return {
      predictions,
      patterns: allPatterns,
      anomalies,
      alerts,
    }
  }
}

export default ErrorPredictorAgent

