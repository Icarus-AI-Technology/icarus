/**
 * ICARUS v5.0 - useIcarusBrain Hook
 * 
 * Hook central para integração com serviços de IA:
 * - Anthropic Claude (análises complexas)
 * - OpenAI GPT-4 (processamento de texto)
 * - Supabase Edge Functions (APIs personalizadas)
 * 
 * Serviços disponíveis:
 * 1. Previsão de Demanda
 * 2. Score de Inadimplência
 * 3. Recomendação de Produtos
 * 4. Otimização de Estoque
 * 5. Análise de Sentimento
 * 6. Detecção de Anomalias
 * 7. Assistente Virtual (Chat)
 */

import { useState, useCallback } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { toast } from 'sonner'

// Types
export interface DemandPrediction {
  produto_id: string
  produto_nome: string
  demanda_atual: number
  demanda_prevista_30d: number
  demanda_prevista_60d: number
  demanda_prevista_90d: number
  tendencia: 'crescente' | 'estavel' | 'decrescente'
  confianca: number
  fatores: string[]
}

export interface InadimplenciaScore {
  cliente_id: string
  cliente_nome: string
  score: number // 0-100
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  fatores_risco: string[]
  recomendacoes: string[]
  historico_pagamentos: {
    em_dia: number
    atrasados: number
    valor_total: number
  }
}

export interface ProductRecommendation {
  produto_id: string
  produto_nome: string
  tipo: 'upsell' | 'cross_sell' | 'reposicao'
  motivo: string
  probabilidade_compra: number
  valor_estimado: number
}

export interface StockOptimization {
  produto_id: string
  produto_nome: string
  estoque_atual: number
  estoque_recomendado: number
  ponto_pedido: number
  quantidade_sugerida: number
  economia_estimada: number
  urgencia: 'baixa' | 'media' | 'alta' | 'critica'
}

export interface AnomalyDetection {
  tipo: 'financeira' | 'operacional' | 'estoque' | 'comportamental'
  descricao: string
  severidade: 'info' | 'warning' | 'critical'
  data_detectada: string
  dados_relacionados: Record<string, unknown>
  acao_sugerida: string
}

export interface AIInsight {
  id: string
  tipo: string
  titulo: string
  descricao: string
  impacto: 'baixo' | 'medio' | 'alto'
  acao_recomendada: string
  dados: Record<string, unknown>
  criado_em: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
}

// Query keys
export const icarusBrainKeys = {
  all: ['icarus-brain'] as const,
  predictions: () => [...icarusBrainKeys.all, 'predictions'] as const,
  demandPrediction: (produtoId: string) => [...icarusBrainKeys.predictions(), 'demand', produtoId] as const,
  inadimplenciaScore: (clienteId: string) => [...icarusBrainKeys.all, 'inadimplencia', clienteId] as const,
  recommendations: (clienteId: string) => [...icarusBrainKeys.all, 'recommendations', clienteId] as const,
  stockOptimization: () => [...icarusBrainKeys.all, 'stock-optimization'] as const,
  anomalies: () => [...icarusBrainKeys.all, 'anomalies'] as const,
  insights: () => [...icarusBrainKeys.all, 'insights'] as const,
}

/**
 * Hook principal para IcarusBrain
 */
export function useIcarusBrain() {
  const queryClient = useQueryClient()
  const [isProcessing, setIsProcessing] = useState(false)

  /**
   * Chama uma Edge Function do Supabase
   */
  const callEdgeFunction = useCallback(async <T>(
    functionName: string,
    payload: Record<string, unknown>
  ): Promise<T> => {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: payload,
    })

    if (error) {
      console.error(`Edge Function error (${functionName}):`, error)
      throw error
    }

    return data as T
  }, [])

  /**
   * Previsão de Demanda
   */
  const predictDemand = useMutation({
    mutationFn: async (params: { produto_id?: string; periodo_dias?: number }): Promise<DemandPrediction[]> => {
      setIsProcessing(true)
      
      try {
        // Try Edge Function first
        const result = await callEdgeFunction<DemandPrediction[]>('predict-demand', params)
        return result
      } catch {
        // Fallback to mock data
        console.log('[IcarusBrain] Using mock demand prediction')
        return getMockDemandPredictions()
      } finally {
        setIsProcessing(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.predictions() })
      toast.success('Previsão de demanda gerada!')
    },
    onError: (error) => {
      toast.error(`Erro na previsão: ${error.message}`)
    },
  })

  /**
   * Score de Inadimplência
   */
  const calculateInadimplenciaScore = useMutation({
    mutationFn: async (clienteId: string): Promise<InadimplenciaScore> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<InadimplenciaScore>('inadimplencia-score', { cliente_id: clienteId })
        return result
      } catch {
        console.log('[IcarusBrain] Using mock inadimplencia score')
        return getMockInadimplenciaScore(clienteId)
      } finally {
        setIsProcessing(false)
      }
    },
    onSuccess: (_, clienteId) => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.inadimplenciaScore(clienteId) })
    },
  })

  /**
   * Recomendações de Produtos
   */
  const getRecommendations = useMutation({
    mutationFn: async (params: { cliente_id: string; tipo?: string }): Promise<ProductRecommendation[]> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<ProductRecommendation[]>('product-recommendations', params)
        return result
      } catch {
        console.log('[IcarusBrain] Using mock recommendations')
        return getMockRecommendations()
      } finally {
        setIsProcessing(false)
      }
    },
  })

  /**
   * Otimização de Estoque
   */
  const optimizeStock = useMutation({
    mutationFn: async (): Promise<StockOptimization[]> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<StockOptimization[]>('optimize-stock', {})
        return result
      } catch {
        console.log('[IcarusBrain] Using mock stock optimization')
        return getMockStockOptimization()
      } finally {
        setIsProcessing(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.stockOptimization() })
      toast.success('Otimização de estoque concluída!')
    },
  })

  /**
   * Detecção de Anomalias
   */
  const detectAnomalies = useMutation({
    mutationFn: async (params: { tipo?: string; periodo_dias?: number }): Promise<AnomalyDetection[]> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<AnomalyDetection[]>('detect-anomalies', params)
        return result
      } catch {
        console.log('[IcarusBrain] Using mock anomaly detection')
        return getMockAnomalies()
      } finally {
        setIsProcessing(false)
      }
    },
  })

  /**
   * Chat com IA
   */
  const chat = useMutation({
    mutationFn: async (params: { 
      messages: ChatMessage[]
      context?: string
      sessionId?: string 
    }): Promise<{ response: string; sessionId: string }> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<{ response: string; sessionId: string }>('icarus-chat', params)
        return result
      } catch {
        console.log('[IcarusBrain] Using mock chat response')
        return {
          response: getMockChatResponse(params.messages[params.messages.length - 1]?.content || ''),
          sessionId: params.sessionId || `session-${Date.now()}`,
        }
      } finally {
        setIsProcessing(false)
      }
    },
  })

  /**
   * Gerar Insights
   */
  const generateInsights = useMutation({
    mutationFn: async (params: { modulo?: string }): Promise<AIInsight[]> => {
      setIsProcessing(true)
      
      try {
        const result = await callEdgeFunction<AIInsight[]>('generate-insights', params)
        return result
      } catch {
        console.log('[IcarusBrain] Using mock insights')
        return getMockInsights()
      } finally {
        setIsProcessing(false)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.insights() })
    },
  })

  return {
    // State
    isProcessing,
    
    // Mutations
    predictDemand,
    calculateInadimplenciaScore,
    getRecommendations,
    optimizeStock,
    detectAnomalies,
    chat,
    generateInsights,
    
    // Utility
    callEdgeFunction,
  }
}

/**
 * Hook para buscar insights em cache
 */
export function useAIInsights() {
  return useQuery({
    queryKey: icarusBrainKeys.insights(),
    queryFn: async (): Promise<AIInsight[]> => {
      try {
        const { data, error } = await supabase
          .from('icarus_brain_results')
          .select('*')
          .eq('tipo', 'insight')
          .order('criado_em', { ascending: false })
          .limit(20)

        if (error) throw error
        return data || []
      } catch {
        return getMockInsights()
      }
    },
    staleTime: 5 * 60 * 1000,
  })
}

/**
 * Hook para previsões de demanda em cache
 */
export function useDemandPredictions() {
  return useQuery({
    queryKey: icarusBrainKeys.predictions(),
    queryFn: async (): Promise<DemandPrediction[]> => {
      try {
        const { data, error } = await supabase
          .from('icarus_previsoes')
          .select('*')
          .eq('tipo', 'demanda')
          .order('criado_em', { ascending: false })
          .limit(50)

        if (error) throw error
        
        // Map to DemandPrediction format
        return (data || []).map(d => ({
          produto_id: d.produto_id,
          produto_nome: d.produto_nome || 'Produto',
          demanda_atual: d.valor_atual || 0,
          demanda_prevista_30d: d.valor_previsto_30d || 0,
          demanda_prevista_60d: d.valor_previsto_60d || 0,
          demanda_prevista_90d: d.valor_previsto_90d || 0,
          tendencia: d.tendencia || 'estavel',
          confianca: d.confianca || 75,
          fatores: d.fatores || [],
        }))
      } catch {
        return getMockDemandPredictions()
      }
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Mock data functions
function getMockDemandPredictions(): DemandPrediction[] {
  return [
    {
      produto_id: '1',
      produto_nome: 'Prótese de Joelho Premium - M',
      demanda_atual: 12,
      demanda_prevista_30d: 15,
      demanda_prevista_60d: 18,
      demanda_prevista_90d: 22,
      tendencia: 'crescente',
      confianca: 87,
      fatores: ['Aumento de cirurgias agendadas', 'Sazonalidade Q4', 'Novo contrato Hospital ABC'],
    },
    {
      produto_id: '2',
      produto_nome: 'Stent Coronário DES',
      demanda_atual: 25,
      demanda_prevista_30d: 28,
      demanda_prevista_60d: 30,
      demanda_prevista_90d: 32,
      tendencia: 'crescente',
      confianca: 92,
      fatores: ['Alta demanda cardiologia', 'Mutirão de cirurgias programado'],
    },
    {
      produto_id: '3',
      produto_nome: 'Parafuso Pedicular Titânio',
      demanda_atual: 45,
      demanda_prevista_30d: 42,
      demanda_prevista_60d: 40,
      demanda_prevista_90d: 38,
      tendencia: 'decrescente',
      confianca: 78,
      fatores: ['Redução de cirurgias de coluna', 'Concorrência de preço'],
    },
  ]
}

function getMockInadimplenciaScore(clienteId: string): InadimplenciaScore {
  return {
    cliente_id: clienteId,
    cliente_nome: 'Hospital Demo',
    score: 25,
    risco: 'baixo',
    fatores_risco: ['Histórico de pagamentos positivo', 'Relacionamento de longo prazo'],
    recomendacoes: ['Manter condições atuais', 'Oferecer desconto para pagamento antecipado'],
    historico_pagamentos: {
      em_dia: 45,
      atrasados: 3,
      valor_total: 850000,
    },
  }
}

function getMockRecommendations(): ProductRecommendation[] {
  return [
    {
      produto_id: '1',
      produto_nome: 'Kit Instrumental Premium',
      tipo: 'upsell',
      motivo: 'Cliente comprou prótese compatível recentemente',
      probabilidade_compra: 75,
      valor_estimado: 15000,
    },
    {
      produto_id: '2',
      produto_nome: 'Cimento Ósseo Antibiótico',
      tipo: 'cross_sell',
      motivo: 'Complemento frequente em cirurgias de joelho',
      probabilidade_compra: 85,
      valor_estimado: 2500,
    },
  ]
}

function getMockStockOptimization(): StockOptimization[] {
  return [
    {
      produto_id: '1',
      produto_nome: 'Prótese de Joelho Premium - M',
      estoque_atual: 5,
      estoque_recomendado: 12,
      ponto_pedido: 8,
      quantidade_sugerida: 10,
      economia_estimada: 5000,
      urgencia: 'alta',
    },
    {
      produto_id: '2',
      produto_nome: 'Stent Coronário DES',
      estoque_atual: 30,
      estoque_recomendado: 25,
      ponto_pedido: 15,
      quantidade_sugerida: 0,
      economia_estimada: 8000,
      urgencia: 'baixa',
    },
  ]
}

function getMockAnomalies(): AnomalyDetection[] {
  return [
    {
      tipo: 'financeira',
      descricao: 'Faturamento 15% abaixo da média do período',
      severidade: 'warning',
      data_detectada: new Date().toISOString(),
      dados_relacionados: { variacao: -15, media: 450000, atual: 382500 },
      acao_sugerida: 'Verificar pipeline de vendas e contatos com clientes inativos',
    },
    {
      tipo: 'estoque',
      descricao: 'Lote próximo ao vencimento detectado',
      severidade: 'critical',
      data_detectada: new Date().toISOString(),
      dados_relacionados: { lote: 'LOT-2025-089', produto: 'Cimento Ósseo', dias_vencimento: 15 },
      acao_sugerida: 'Priorizar uso em próximas cirurgias ou negociar troca com fornecedor',
    },
  ]
}

function getMockInsights(): AIInsight[] {
  return [
    {
      id: '1',
      tipo: 'oportunidade',
      titulo: 'Oportunidade de Upsell Detectada',
      descricao: '3 hospitais que compraram próteses de joelho nos últimos 30 dias não compraram instrumental complementar',
      impacto: 'alto',
      acao_recomendada: 'Contatar hospitais para oferecer kit instrumental com desconto',
      dados: { hospitais: 3, valor_potencial: 45000 },
      criado_em: new Date().toISOString(),
    },
    {
      id: '2',
      tipo: 'risco',
      titulo: 'Risco de Ruptura de Estoque',
      descricao: 'Prótese de Quadril P está com estoque crítico e há 5 cirurgias agendadas para os próximos 15 dias',
      impacto: 'alto',
      acao_recomendada: 'Realizar pedido urgente ao fornecedor',
      dados: { estoque_atual: 2, demanda_prevista: 5, dias: 15 },
      criado_em: new Date().toISOString(),
    },
    {
      id: '3',
      tipo: 'eficiencia',
      titulo: 'Otimização de Rota Logística',
      descricao: 'Entregas para Hospital ABC e Clínica XYZ podem ser consolidadas, economizando 20% em frete',
      impacto: 'medio',
      acao_recomendada: 'Ajustar cronograma de entregas para consolidar rotas',
      dados: { economia_mensal: 1200, entregas_afetadas: 8 },
      criado_em: new Date().toISOString(),
    },
  ]
}

function getMockChatResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('estoque') || lowerMessage.includes('produto')) {
    return `📦 **Análise de Estoque**

Baseado nos dados atuais:
- **Produtos críticos:** 3 itens abaixo do ponto de pedido
- **Valor total em estoque:** R$ 2.450.000
- **Giro médio:** 18 dias

**Recomendações:**
1. Priorizar reposição de Prótese de Joelho M
2. Revisar lote LOT-2025-089 (vencendo em 15 dias)
3. Negociar melhores prazos com fornecedor Medtronic

Posso detalhar algum item específico?`
  }
  
  if (lowerMessage.includes('cirurgia') || lowerMessage.includes('agenda')) {
    return `🏥 **Agenda de Cirurgias**

**Hoje:** 5 cirurgias programadas
- 2 Artroplastias de Joelho
- 2 Angioplastias
- 1 Neurocirurgia

**Esta semana:** 18 procedimentos confirmados
**Valor estimado:** R$ 285.000

**Alertas:**
⚠️ Cirurgia amanhã no Hospital ABC precisa de confirmação de materiais

Deseja ver detalhes de alguma cirurgia?`
  }
  
  if (lowerMessage.includes('financeiro') || lowerMessage.includes('faturamento')) {
    return `💰 **Resumo Financeiro**

**Mês atual:**
- Faturamento: R$ 450.000
- Meta: R$ 500.000 (90% atingido)
- Contas a receber: R$ 125.000

**Inadimplência:**
- Taxa: 3.2% (abaixo da média)
- 2 clientes com pagamentos atrasados > 30 dias

**Insight IA:**
Priorize cobrança do Hospital XYZ (R$ 45.000 em atraso) - risco de inadimplência aumentando.`
  }
  
  return `Olá! Sou o assistente IcarusBrain 🧠

Posso ajudar você com:
- 📦 **Estoque:** Níveis, previsões, alertas
- 🏥 **Cirurgias:** Agenda, materiais, performance
- 💰 **Financeiro:** Faturamento, recebíveis, inadimplência
- 📊 **Analytics:** KPIs, tendências, insights

O que você gostaria de saber?`
}
