import { icarusBrain } from '@/lib/ai/icarus-brain'
import type { PredictParams, PredictResult } from '@/lib/ai/icarus-brain'

/**
 * Hook para acessar serviços de IA do ICARUS Brain
 *
 * @example
 * ```tsx
 * const { predict, analyze, recommend, chat } = useIcarusBrain()
 *
 * // Previsão de demanda
 * const forecast = await predict('demanda', {
 *   produto_id: '123',
 *   dias: 30
 * })
 *
 * // Análise de inadimplência
 * const score = await analyze('inadimplencia', {
 *   cliente_id: '456'
 * })
 *
 * // Recomendação de produtos
 * const produtos = await recommend('produtos', {
 *   cliente_id: '789',
 *   limite: 5,
 *   tipo: 'cross-sell'
 * })
 *
 * // Chat
 * const response = await chat('Qual o status do estoque?', {
 *   contexto: 'estoque'
 * })
 * ```
 */
export function useIcarusBrain() {
  return {
    predict: (tipo: string, params: PredictParams): Promise<PredictResult> =>
      icarusBrain.predict(tipo, params),

    analyze: (tipo: string, params: PredictParams): Promise<PredictResult> =>
      icarusBrain.analyze(tipo, params),

    recommend: (tipo: string, params: PredictParams): Promise<any[]> =>
      icarusBrain.recommend(tipo, params),

    chat: (mensagem: string, params?: PredictParams): Promise<PredictResult> =>
      icarusBrain.chat(mensagem, params),
  }
}
