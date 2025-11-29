import type { AIMessageContent } from '@langchain/core/messages'

export type TariffPeriod = 'mes' | 'trimestre' | 'ano'

/**
 * Calcula a data inicial de acordo com o período solicitado.
 */
export function calculatePeriodStart(
  period: TariffPeriod = 'mes',
  referenceDate: Date = new Date()
): Date {
  const start = new Date(referenceDate)

  if (period === 'ano') {
    start.setFullYear(start.getFullYear() - 1)
    return start
  }

  if (period === 'trimestre') {
    start.setMonth(start.getMonth() - 3)
    return start
  }

  start.setMonth(start.getMonth() - 1)
  return start
}

/**
 * Normaliza datas para formato YYYY-MM-DD.
 */
export function formatDateISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Extrai texto de respostas do LLM independente do formato retornado.
 */
export function extractMessageText(
  content: string | AIMessageContent[] | null | undefined
): string {
  if (!content) {
    return ''
  }

  if (typeof content === 'string') {
    return content
  }

  return content
    .map(part => (part.type === 'text' ? part.text : ''))
    .join('\n')
    .trim()
}


