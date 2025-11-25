// Supabase Edge Function para Agente de Compliance ICARUS
// Deploy: npx supabase functions deploy agent-compliance

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface ComplianceCheckRequest {
  tipo: 'produto' | 'cirurgia' | 'lote' | 'processo'
  dados: Record<string, unknown>
  empresaId?: string
}

interface ComplianceIssue {
  codigo: string
  severidade: 'alta' | 'media' | 'baixa'
  descricao: string
  regulamentacao: string
  recomendacao: string
}

interface ComplianceResponse {
  conforme: boolean
  score: number
  problemas: ComplianceIssue[]
  alertas: string[]
  aprovado: boolean
  timestamp: string
}

const COMPLIANCE_RULES = `
# Regras de Compliance ANVISA para OPME

## RDC 16/2013 - Boas Praticas de Fabricacao e Distribuicao
1. Rastreabilidade obrigatoria de lotes
2. Registro de validade de produtos
3. Cadeia de custodia documentada
4. Capacidade de recall em ate 72 horas
5. Controle de temperatura quando aplicavel

## RDC 665/2022 - Implantes
1. Numero de serie obrigatorio para implantes
2. Registro minimizado do paciente (iniciais apenas - LGPD)
3. Vinculacao obrigatoria com cirurgia
4. Documentacao mantida por no minimo 5 anos
5. Certificado de conformidade do fabricante

## RDC 546/2021 - Registro de Dispositivos Medicos
1. Registro ANVISA valido e nao vencido
2. Classificacao de risco correta (I, II, III, IV)
3. Enquadramento regulatorio adequado
4. Responsavel tecnico identificado

## LGPD - Protecao de Dados
1. Dados de paciente minimizados (iniciais apenas)
2. Consentimento documentado quando necessario
3. Audit log de acessos a dados sensiveis
4. Direito de exclusao respeitado apos periodo regulatorio
`

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { tipo, dados, empresaId } = await req.json() as ComplianceCheckRequest

    let response: ComplianceResponse

    // Try OpenAI for advanced analysis if available
    if (OPENAI_API_KEY) {
      response = await analyzeWithAI(tipo, dados)
    } else {
      // Fallback to rule-based analysis
      response = analyzeWithRules(tipo, dados)
    }

    // Save compliance check to database
    try {
      await supabase
        .from('agentes_ia_compliance')
        .insert({
          empresa_id: empresaId,
          tipo_verificacao: tipo,
          dados_entrada: dados,
          resultado: response,
          score: response.score,
          conforme: response.conforme,
        })
    } catch (dbError) {
      console.error('Database error:', dbError)
    }

    return new Response(JSON.stringify(response), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error)

    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Erro interno',
      conforme: false,
      score: 0,
      problemas: [{
        codigo: 'ERR-001',
        severidade: 'alta',
        descricao: 'Erro ao processar verificacao de compliance',
        regulamentacao: 'N/A',
        recomendacao: 'Tente novamente ou contate o suporte',
      }],
      alertas: ['Verificacao de compliance falhou'],
      aprovado: false,
      timestamp: new Date().toISOString(),
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      status: 500,
    })
  }
})

async function analyzeWithAI(tipo: string, dados: Record<string, unknown>): Promise<ComplianceResponse> {
  const prompt = `Voce e um especialista em compliance regulatorio para dispositivos medicos no Brasil.

Analise os seguintes dados quanto a conformidade com as regulamentacoes:

TIPO DE VERIFICACAO: ${tipo}
DADOS: ${JSON.stringify(dados, null, 2)}

REGRAS DE REFERENCIA:
${COMPLIANCE_RULES}

Responda APENAS com um JSON valido no seguinte formato (sem markdown, sem explicacoes):
{
  "conforme": boolean,
  "score": number (0-100),
  "problemas": [
    {
      "codigo": "string (ex: RDC16-001)",
      "severidade": "alta" | "media" | "baixa",
      "descricao": "string",
      "regulamentacao": "string (ex: RDC 16/2013)",
      "recomendacao": "string"
    }
  ],
  "alertas": ["string"],
  "aprovado": boolean
}`

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'Voce e um especialista em compliance regulatorio ANVISA. Responda apenas com JSON valido.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 2000,
    }),
  })

  if (!openaiResponse.ok) {
    throw new Error('OpenAI API error')
  }

  const data = await openaiResponse.json()
  const content = data.choices?.[0]?.message?.content || ''

  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Invalid response format')
  }

  const result = JSON.parse(jsonMatch[0])

  return {
    ...result,
    timestamp: new Date().toISOString(),
  }
}

function analyzeWithRules(tipo: string, dados: Record<string, unknown>): ComplianceResponse {
  const problemas: ComplianceIssue[] = []
  const alertas: string[] = []
  let score = 100

  switch (tipo) {
    case 'produto':
      // Check ANVISA registration
      if (!dados.registro_anvisa) {
        problemas.push({
          codigo: 'RDC546-001',
          severidade: 'alta',
          descricao: 'Produto sem registro ANVISA',
          regulamentacao: 'RDC 546/2021',
          recomendacao: 'Cadastrar numero de registro ANVISA valido',
        })
        score -= 30
      }

      // Check expiration
      if (dados.data_validade) {
        const validade = new Date(dados.data_validade as string)
        const hoje = new Date()
        const diasRestantes = Math.floor((validade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))

        if (diasRestantes < 0) {
          problemas.push({
            codigo: 'RDC16-001',
            severidade: 'alta',
            descricao: 'Produto com validade vencida',
            regulamentacao: 'RDC 16/2013',
            recomendacao: 'Remover produto do estoque e iniciar processo de descarte',
          })
          score -= 40
        } else if (diasRestantes < 30) {
          alertas.push(`Produto vence em ${diasRestantes} dias`)
          score -= 10
        } else if (diasRestantes < 90) {
          alertas.push(`Produto vence em ${diasRestantes} dias - considerar promocao`)
          score -= 5
        }
      }
      break

    case 'lote':
      // Check lot number
      if (!dados.numero_lote) {
        problemas.push({
          codigo: 'RDC16-002',
          severidade: 'alta',
          descricao: 'Lote sem numero de identificacao',
          regulamentacao: 'RDC 16/2013',
          recomendacao: 'Identificar lote com numero unico',
        })
        score -= 25
      }

      // Check serial for implants
      if (dados.tipo_produto === 'implante' && !dados.numero_serie) {
        problemas.push({
          codigo: 'RDC665-001',
          severidade: 'alta',
          descricao: 'Implante sem numero de serie',
          regulamentacao: 'RDC 665/2022',
          recomendacao: 'Registrar numero de serie do implante',
        })
        score -= 30
      }

      // Check quantity
      if (dados.quantidade_disponivel === 0) {
        alertas.push('Lote com estoque zerado')
      }
      break

    case 'cirurgia':
      // Check patient data minimization (LGPD)
      if (dados.paciente_nome && (dados.paciente_nome as string).length > 5) {
        problemas.push({
          codigo: 'LGPD-001',
          severidade: 'media',
          descricao: 'Dados do paciente nao minimizados',
          regulamentacao: 'LGPD',
          recomendacao: 'Usar apenas iniciais do paciente (max 5 caracteres)',
        })
        score -= 15
      }

      // Check required fields
      if (!dados.medico_id) {
        problemas.push({
          codigo: 'RDC665-002',
          severidade: 'alta',
          descricao: 'Cirurgia sem medico responsavel',
          regulamentacao: 'RDC 665/2022',
          recomendacao: 'Vincular medico responsavel a cirurgia',
        })
        score -= 20
      }

      if (!dados.hospital_id) {
        problemas.push({
          codigo: 'RDC665-003',
          severidade: 'alta',
          descricao: 'Cirurgia sem hospital definido',
          regulamentacao: 'RDC 665/2022',
          recomendacao: 'Definir hospital onde sera realizada a cirurgia',
        })
        score -= 20
      }
      break

    case 'processo':
      // Generic process compliance
      if (!dados.responsavel) {
        alertas.push('Processo sem responsavel definido')
        score -= 10
      }

      if (!dados.data_inicio) {
        alertas.push('Processo sem data de inicio')
        score -= 5
      }
      break
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score))

  // Determine if approved
  const hasHighSeverity = problemas.some(p => p.severidade === 'alta')
  const aprovado = !hasHighSeverity && score >= 70

  return {
    conforme: problemas.length === 0,
    score,
    problemas,
    alertas,
    aprovado,
    timestamp: new Date().toISOString(),
  }
}
