import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { AIMessage } from '@langchain/core/messages'

const mockInvoke = vi.fn()
const cacheGetMock = vi.fn()
const cacheSetMock = vi.fn()
const chatbotInsertMock = vi.fn().mockResolvedValue({ data: null, error: null })

const empresasQuery = {
  select: vi.fn(() => empresasQuery),
  eq: vi.fn(() => empresasQuery),
  single: vi.fn().mockResolvedValue({
    data: { nome_fantasia: 'Clínica Orion' },
    error: null,
  }),
}

const supabaseFromMock = vi.fn((table: string) => {
  if (table === 'empresas') {
    return empresasQuery
  }

  if (table === 'chatbot_mensagens') {
    return {
      insert: chatbotInsertMock,
    }
  }

  throw new Error(`Tabela inesperada: ${table}`)
})

const supabaseClientMock = {
  from: supabaseFromMock,
}

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}))

vi.mock('@/lib/supabase', () => ({
  supabase: supabaseClientMock,
  supabaseAdmin: supabaseClientMock,
}))

vi.mock('@/lib/redis', () => ({
  cacheService: {
    get: cacheGetMock,
    set: cacheSetMock,
  },
  CacheKeys: {
    empresa: (id: string) => `empresa:${id}`,
  },
  CacheTTL: {
    empresa: 3600,
  },
}))

const originalEnv = { ...process.env }
const originalFetch = globalThis.fetch
const fetchMock = vi.fn()

describe('processUserMessage', () => {
  beforeEach(() => {
    mockInvoke.mockReset()
    cacheGetMock.mockReset()
    cacheSetMock.mockReset()
    chatbotInsertMock.mockClear()
    empresasQuery.select.mockClear()
    empresasQuery.eq.mockClear()
    empresasQuery.single.mockClear()
    supabaseFromMock.mockClear()
    fetchMock.mockReset()

    cacheGetMock.mockResolvedValue(null)
    cacheSetMock.mockResolvedValue(true)

    process.env.SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'

    globalThis.fetch = fetchMock as unknown as typeof fetch
  })

  afterAll(() => {
    process.env = originalEnv
    globalThis.fetch = originalFetch
  })

  it('retorna resposta direta quando o orquestrador decide responder', async () => {
    mockInvoke.mockResolvedValueOnce(
      new AIMessage(
        JSON.stringify({
          action: 'respond',
          message: 'Tudo certo por aqui ✅',
          suggestions: ['Consultar painel financeiro'],
        })
      )
    )

    const { processUserMessage } = await import('@/lib/langchain')

    const resposta = await processUserMessage('Oi?', 'empresa-1', 'usuario-1', 'sessao-1')

    expect(resposta).toBe('Tudo certo por aqui ✅')
    expect(cacheGetMock).toHaveBeenCalledWith('empresa:empresa-1')
    expect(cacheSetMock).toHaveBeenCalledWith(
      'empresa:empresa-1',
      { nome_fantasia: 'Clínica Orion' },
      3600
    )
    expect(chatbotInsertMock).toHaveBeenCalledTimes(1)
    const payload = chatbotInsertMock.mock.calls[0][0]
    expect(Array.isArray(payload)).toBe(true)
    expect(payload).toHaveLength(2)
  })

  it('delegates solicitações e sintetiza o retorno dos agentes', async () => {
    mockInvoke
      .mockResolvedValueOnce(
        new AIMessage(
          JSON.stringify({
            action: 'delegate',
            agent: 'operations',
            task: 'Verificar estoque crítico',
            priority: 'high',
          })
        )
      )
      .mockResolvedValueOnce(new AIMessage('Resumo final das operações 📊'))

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ sucesso: true }),
    })

    const { processUserMessage } = await import('@/lib/langchain')

    const resposta = await processUserMessage(
      'Como está o estoque crítico?',
      'empresa-99',
      'usuario-77',
      'sessao-abc'
    )

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.supabase.co/functions/v1/agent-operations')
    expect(init).toBeDefined()
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body.task).toBe('Verificar estoque crítico')
    expect(body.priority).toBe('high')
    expect(resposta).toBe('Resumo final das operações 📊')
  })
})

