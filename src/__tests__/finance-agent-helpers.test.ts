import { describe, expect, it } from 'vitest'
import type { AIMessageContent } from '@langchain/core/messages'

import {
  calculatePeriodStart,
  extractMessageText,
  formatDateISO,
} from '../../lib/finance-agent-helpers'

describe('calculatePeriodStart', () => {
  const reference = new Date('2025-12-10T00:00:00Z')

  it('retorna um mês anterior por padrão', () => {
    const result = calculatePeriodStart(undefined, reference)
    expect(formatDateISO(result)).toBe('2025-11-10')
  })

  it('retorna três meses para trimestre', () => {
    const result = calculatePeriodStart('trimestre', reference)
    expect(formatDateISO(result)).toBe('2025-09-10')
  })

  it('retorna um ano para período anual', () => {
    const result = calculatePeriodStart('ano', reference)
    expect(formatDateISO(result)).toBe('2024-12-10')
  })
})

describe('extractMessageText', () => {
  it('mantém texto simples', () => {
    expect(extractMessageText('teste')).toBe('teste')
  })

  it('concatena blocos textuais do LLM', () => {
    const content: AIMessageContent[] = [
      { type: 'text', text: 'Parte 1' },
      { type: 'text', text: 'Parte 2' },
    ]

    expect(extractMessageText(content)).toBe('Parte 1\nParte 2')
  })

  it('retorna string vazia quando indefinido', () => {
    expect(extractMessageText(undefined)).toBe('')
  })
})


