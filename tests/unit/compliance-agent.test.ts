import { describe, it, expect, vi, beforeEach } from 'vitest'

type SupabaseTable = 'rastreabilidade_opme' | 'consentimentos' | 'lgpd_solicitacoes' | 'audit_log_blockchain'

const supabaseData: Record<SupabaseTable, unknown[]> = {
  rastreabilidade_opme: [],
  consentimentos: [],
  lgpd_solicitacoes: [],
  audit_log_blockchain: [],
}

const mockInvoke = vi.fn()

function resetSupabaseData() {
  (Object.keys(supabaseData) as SupabaseTable[]).forEach(key => {
    supabaseData[key] = []
  })
}

function createQuery(table: SupabaseTable) {
  const builder: any = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    gte: vi.fn(() => builder),
    lte: vi.fn(() => builder),
    order: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    insert: vi.fn((payload: unknown) => {
      const rows = Array.isArray(payload) ? payload : [payload]
      supabaseData[table] = [...supabaseData[table], ...rows]
      return {
        select: () => ({
          single: async () => ({ data: rows[0], error: null }),
        }),
      }
    }),
    single: vi.fn(async () => ({
      data: supabaseData[table][0] ?? null,
      error: null,
    })),
    then: (resolve: (value: { data: unknown; error: unknown }) => void) =>
      resolve({ data: supabaseData[table], error: null }),
    catch: () => builder,
  }
  return builder
}

const supabaseMock = {
  from: vi.fn((table: string) => createQuery(table as SupabaseTable)),
  rpc: vi.fn(async (fnName: string) => {
    if (fnName === 'validate_blockchain') {
      return { data: [{ valid: true, total_blocks: 1 }], error: null }
    }
    return { data: null, error: null }
  }),
  functions: {
    invoke: vi.fn(async () => ({ data: { resultados: [] }, error: null })),
  },
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => supabaseMock),
}))

vi.mock('@langchain/anthropic', () => ({
  ChatAnthropic: vi.fn().mockImplementation(() => ({
    invoke: mockInvoke,
  })),
}))

describe('ComplianceAgent - processComplianceTask', () => {
  beforeEach(() => {
    vi.resetModules()
    mockInvoke.mockReset()
    resetSupabaseData()
    process.env.SUPABASE_URL = 'https://tests.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-key'
  })

  it('executa ferramenta e retorna resposta consolidada quando a análise é conforme', async () => {
    supabaseData.rastreabilidade_opme.push({
      id: 'rast-1',
      empresa_id: 'empresa-1',
      numero_lote: 'L123',
      registro_anvisa: '123456',
      data_implante: '2025-01-01',
      paciente_iniciais: 'J.S.',
      medico_crm: '12345',
      medico_crm_uf: 'SP',
      hospital_cnes: '1234567',
      hash_registro: 'hash',
    })

    mockInvoke
      .mockResolvedValueOnce({
        content: JSON.stringify({
          action: 'execute_tool',
          tool: 'validar_rastreabilidade',
          params: { rastreabilidade_id: 'rast-1' },
          reason: 'Verificar lote crítico',
        }),
      })
      .mockResolvedValueOnce({
        content: JSON.stringify({
          data: {
            status_compliance: 'conforme',
            resumo: 'Tudo certo',
            verificacoes: [],
            pendencias: [],
            recomendacoes: [],
          },
          confidence: 0.95,
        }),
      })

    const { processComplianceTask } = await import('../../lib/ai/compliance-agent')

    const result = await processComplianceTask(
      'Validar lote',
      {},
      'empresa-1',
      'usuario-1'
    )

    expect(result.action).toBe('respond')
    expect(result.data).toMatchObject({
      status_compliance: 'conforme',
      resumo: 'Tudo certo',
    })
  })

  it('retorna alerta quando o planejador identifica violação crítica', async () => {
    mockInvoke.mockResolvedValueOnce({
      content: JSON.stringify({
        action: 'alert',
        regulation: 'LGPD',
        severity: 'critical',
        message: 'Consentimento ausente',
        action_required: 'Registrar consentimento válido',
      }),
    })

    const { processComplianceTask } = await import('../../lib/ai/compliance-agent')

    const result = await processComplianceTask(
      'Verificar consentimento',
      {},
      'empresa-1',
      'usuario-1'
    )

    expect(result.action).toBe('alert')
    expect(result.data).toMatchObject({
      regulation: 'LGPD',
      action_required: 'Registrar consentimento válido',
    })
  })
})

