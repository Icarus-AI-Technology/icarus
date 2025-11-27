/**
 * React Query hooks for IcarusBrain AI integration
 * Connects to Supabase Edge Functions for AI analysis
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/hooks/useSupabase'
import { toast } from 'sonner'

// Query keys
export const icarusBrainKeys = {
  all: ['icarus-brain'] as const,
  analysis: (type: string) => [...icarusBrainKeys.all, 'analysis', type] as const,
  job: (jobId: string) => [...icarusBrainKeys.all, 'job', jobId] as const,
  predictions: () => [...icarusBrainKeys.all, 'predictions'] as const,
  insights: (module: string) => [...icarusBrainKeys.all, 'insights', module] as const,
  chat: (sessionId: string) => [...icarusBrainKeys.all, 'chat', sessionId] as const,
}

// Types
export type AnalysisType = 
  | 'demanda'
  | 'inadimplencia'
  | 'churn'
  | 'recomendacao'
  | 'estoque'
  | 'precificacao'
  | 'sentiment'
  | 'anomalia'

export interface AIInsight {
  id: string
  type: 'info' | 'warning' | 'success' | 'alert'
  title: string
  description: string
  metric?: string
  trend?: 'up' | 'down' | 'stable'
  action?: {
    label: string
    href?: string
  }
  timestamp: string
}

export interface DemandPrediction {
  produto_id: string
  produto_nome: string
  demanda_atual: number
  demanda_prevista: number
  confianca: number
  periodo: number
  tendencia: 'crescente' | 'estavel' | 'decrescente'
  fatores: string[]
}

export interface ChurnPrediction {
  cliente_id: string
  cliente_nome: string
  score: number
  risco: 'alto' | 'medio' | 'baixo'
  motivos: string[]
  recomendacoes: string[]
}

export interface StockOptimization {
  produto_id: string
  produto_nome: string
  estoque_atual: number
  estoque_ideal: number
  ponto_pedido: number
  quantidade_sugerida: number
  economia_estimada: number
  urgencia: 'critica' | 'alta' | 'media' | 'baixa'
}

/**
 * Hook to fetch AI-generated insights for a module
 */
export function useAIInsights(module: string) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: icarusBrainKeys.insights(module),
    queryFn: async (): Promise<AIInsight[]> => {
      if (!isConfigured) {
        return getMockInsights(module)
      }

      try {
        const { data, error } = await supabase.functions.invoke('icarus-insights', {
          body: { module }
        })

        if (error) throw error
        return data?.insights || getMockInsights(module)
      } catch (err) {
        console.error('Error fetching AI insights:', err)
        return getMockInsights(module)
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  })
}

/**
 * Hook to fetch demand predictions
 */
export function useDemandPredictions(productIds?: string[]) {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...icarusBrainKeys.predictions(), 'demanda', productIds],
    queryFn: async (): Promise<DemandPrediction[]> => {
      if (!isConfigured) {
        return getMockDemandPredictions()
      }

      try {
        const { data, error } = await supabase.functions.invoke('icarus-brain', {
          body: {
            analysisType: 'demanda',
            data: { produtos: productIds, periodo: 30 }
          }
        })

        if (error) throw error
        return data?.predictions || getMockDemandPredictions()
      } catch (err) {
        console.error('Error fetching demand predictions:', err)
        return getMockDemandPredictions()
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  })
}

/**
 * Hook to fetch churn predictions
 */
export function useChurnPredictions() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...icarusBrainKeys.predictions(), 'churn'],
    queryFn: async (): Promise<ChurnPrediction[]> => {
      if (!isConfigured) {
        return getMockChurnPredictions()
      }

      try {
        const { data, error } = await supabase.functions.invoke('icarus-brain', {
          body: {
            analysisType: 'churn',
            data: {}
          }
        })

        if (error) throw error
        return data?.predictions || getMockChurnPredictions()
      } catch (err) {
        console.error('Error fetching churn predictions:', err)
        return getMockChurnPredictions()
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
  })
}

/**
 * Hook to fetch stock optimization suggestions
 */
export function useStockOptimization() {
  const { supabase, isConfigured } = useSupabase()

  return useQuery({
    queryKey: [...icarusBrainKeys.predictions(), 'estoque'],
    queryFn: async (): Promise<StockOptimization[]> => {
      if (!isConfigured) {
        return getMockStockOptimization()
      }

      try {
        const { data, error } = await supabase.functions.invoke('icarus-brain', {
          body: {
            analysisType: 'estoque',
            data: {}
          }
        })

        if (error) throw error
        return data?.suggestions || getMockStockOptimization()
      } catch (err) {
        console.error('Error fetching stock optimization:', err)
        return getMockStockOptimization()
      }
    },
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Mutation to run a custom AI analysis
 */
export function useRunAnalysis() {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { type: AnalysisType; data: Record<string, unknown> }) => {
      if (!isConfigured) {
        toast.info('Modo demonstração: análise simulada')
        return { jobId: 'demo-' + Date.now(), status: 'completed' }
      }

      const { data, error } = await supabase.functions.invoke('icarus-brain', {
        body: {
          analysisType: params.type,
          data: params.data
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.all })
      toast.success(`Análise iniciada! Job ID: ${data.jobId}`)
    },
    onError: (error) => {
      toast.error(`Erro na análise: ${error.message}`)
    },
  })
}

/**
 * Hook to chat with IcarusBrain AI assistant
 */
export function useAIChat(sessionId: string) {
  const { supabase, isConfigured } = useSupabase()
  const queryClient = useQueryClient()

  const sendMessage = useMutation({
    mutationFn: async (message: string) => {
      if (!isConfigured) {
        // Mock response for demo mode
        await new Promise(resolve => setTimeout(resolve, 1000))
        return {
          response: getMockChatResponse(message),
          timestamp: new Date().toISOString()
        }
      }

      const { data, error } = await supabase.functions.invoke('icarus-chat', {
        body: {
          sessionId,
          message,
          context: 'erp-opme'
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: icarusBrainKeys.chat(sessionId) })
    },
  })

  return {
    sendMessage: sendMessage.mutate,
    sendMessageAsync: sendMessage.mutateAsync,
    isLoading: sendMessage.isPending,
    error: sendMessage.error,
  }
}

// Mock data functions
function getMockInsights(module: string): AIInsight[] {
  const baseInsights: AIInsight[] = [
    {
      id: '1',
      type: 'success',
      title: 'Performance Acima da Média',
      description: `O módulo ${module} está operando 15% acima da média histórica`,
      metric: '+15%',
      trend: 'up',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      type: 'warning',
      title: 'Atenção Requerida',
      description: 'Detectamos 3 itens que precisam de revisão manual',
      metric: '3 itens',
      action: { label: 'Ver detalhes' },
      timestamp: new Date().toISOString()
    },
    {
      id: '3',
      type: 'info',
      title: 'Oportunidade Identificada',
      description: 'IA identificou potencial de otimização de 12% nos processos',
      metric: '12%',
      trend: 'up',
      action: { label: 'Analisar' },
      timestamp: new Date().toISOString()
    }
  ]

  return baseInsights
}

function getMockDemandPredictions(): DemandPrediction[] {
  return [
    {
      produto_id: '1',
      produto_nome: 'Prótese de Joelho Premium',
      demanda_atual: 12,
      demanda_prevista: 15,
      confianca: 0.87,
      periodo: 30,
      tendencia: 'crescente',
      fatores: ['Aumento de cirurgias agendadas', 'Sazonalidade']
    },
    {
      produto_id: '2',
      produto_nome: 'Stent Coronário DES',
      demanda_atual: 25,
      demanda_prevista: 22,
      confianca: 0.91,
      periodo: 30,
      tendencia: 'estavel',
      fatores: ['Demanda estável', 'Mercado saturado']
    },
    {
      produto_id: '3',
      produto_nome: 'Parafusos Pediculares',
      demanda_atual: 45,
      demanda_prevista: 52,
      confianca: 0.83,
      periodo: 30,
      tendencia: 'crescente',
      fatores: ['Novos contratos hospitalares', 'Expansão de mercado']
    },
    {
      produto_id: '4',
      produto_nome: 'Cage Intersomático PEEK',
      demanda_atual: 8,
      demanda_prevista: 6,
      confianca: 0.78,
      periodo: 30,
      tendencia: 'decrescente',
      fatores: ['Concorrência', 'Mudança de preferência médica']
    }
  ]
}

function getMockChurnPredictions(): ChurnPrediction[] {
  return [
    {
      cliente_id: '1',
      cliente_nome: 'Hospital Regional ABC',
      score: 0.72,
      risco: 'alto',
      motivos: ['Redução de pedidos 40%', 'Sem interação há 45 dias', 'Reclamação não resolvida'],
      recomendacoes: ['Agendar visita comercial urgente', 'Oferecer desconto de fidelidade', 'Resolver ticket #1234']
    },
    {
      cliente_id: '2',
      cliente_nome: 'Clínica São José',
      score: 0.45,
      risco: 'medio',
      motivos: ['Pagamentos atrasados', 'Concorrência ativa na região'],
      recomendacoes: ['Renegociar condições de pagamento', 'Apresentar novos produtos']
    },
    {
      cliente_id: '3',
      cliente_nome: 'Hospital Santa Casa',
      score: 0.15,
      risco: 'baixo',
      motivos: ['Cliente estável'],
      recomendacoes: ['Manter relacionamento', 'Oferecer programa de fidelidade']
    }
  ]
}

function getMockStockOptimization(): StockOptimization[] {
  return [
    {
      produto_id: '1',
      produto_nome: 'Prótese de Joelho Premium - M',
      estoque_atual: 5,
      estoque_ideal: 12,
      ponto_pedido: 8,
      quantidade_sugerida: 10,
      economia_estimada: 15000,
      urgencia: 'critica'
    },
    {
      produto_id: '2',
      produto_nome: 'Stent Coronário DES 3.0mm',
      estoque_atual: 18,
      estoque_ideal: 20,
      ponto_pedido: 15,
      quantidade_sugerida: 5,
      economia_estimada: 3000,
      urgencia: 'baixa'
    },
    {
      produto_id: '3',
      produto_nome: 'Kit Parafusos Pediculares',
      estoque_atual: 8,
      estoque_ideal: 15,
      ponto_pedido: 10,
      quantidade_sugerida: 10,
      economia_estimada: 8500,
      urgencia: 'alta'
    }
  ]
}

function getMockChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('estoque') || lowerMessage.includes('produto')) {
    return `📦 **Análise de Estoque**\n\nBaseado nos dados atuais:\n\n- **3 produtos** em estoque crítico\n- **5 produtos** próximos do ponto de pedido\n- **Valor total em estoque:** R$ 1.2M\n\n💡 **Recomendação:** Priorize a reposição de Próteses de Joelho Premium, com previsão de aumento de demanda de 25% nos próximos 30 dias.`
  }

  if (lowerMessage.includes('cirurgia') || lowerMessage.includes('procedimento')) {
    return `🏥 **Análise de Cirurgias**\n\nResumo das próximas 24 horas:\n\n- **12 cirurgias** agendadas\n- **8 confirmadas** com materiais reservados\n- **4 aguardando** confirmação de equipe\n\n⚠️ **Atenção:** A cirurgia CIR-2025-008 tem material consignado com validade próxima.`
  }

  if (lowerMessage.includes('financeiro') || lowerMessage.includes('faturamento') || lowerMessage.includes('receita')) {
    return `💰 **Análise Financeira**\n\nPerformance do mês:\n\n- **Faturamento:** R$ 450K (+12% vs mês anterior)\n- **Ticket médio:** R$ 22.5K\n- **Taxa de conversão:** 78%\n\n📈 **Tendência:** Crescimento consistente nos últimos 3 meses. Projeção para o trimestre é de R$ 1.5M.`
  }

  if (lowerMessage.includes('cliente') || lowerMessage.includes('crm') || lowerMessage.includes('hospital')) {
    return `👥 **Análise de Clientes**\n\nStatus atual:\n\n- **45 clientes ativos**\n- **3 em risco de churn** (IA detectou redução de engajamento)\n- **8 oportunidades** em pipeline\n\n🎯 **Ação recomendada:** Agendar visita ao Hospital Regional ABC - score de churn alto (72%).`
  }

  return `🤖 **IcarusBrain Assistente**\n\nEntendi sua pergunta sobre "${message}". \n\nPosso ajudar com:\n- 📦 Análise de estoque e previsão de demanda\n- 🏥 Gestão de cirurgias e agendamentos\n- 💰 Relatórios financeiros e KPIs\n- 👥 CRM e análise de clientes\n- 📊 Insights e recomendações de IA\n\nComo posso ajudar?`
}

