// Supabase Edge Function para GPT Researcher ICARUS
// Deploy: npx supabase functions deploy gpt-researcher
// Updated: 2025-11-25 - Security fixes applied

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

// Import shared utilities
import { getCorsHeaders, handleCorsPreflightRequest, jsonResponse, errorResponse } from '../_shared/cors.ts'
import { validatePromptSecurity } from '../_shared/validation.ts'
import { verifyAuth, getUserEmpresaId } from '../_shared/supabase.ts'

// Secrets configuradas no Supabase Dashboard
const OPENAI_API_KEY = Deno.env.get('OPENAI_MEDICAL_MODEL')
const BRAVE_SEARCH_API_KEY = Deno.env.get('BRAVE_SEARCH_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = { windowMs: 60000, maxRequests: 10 } // More restrictive for research

// Zod Schema for input validation
const ResearchRequestSchema = z.object({
  query: z.string().min(1, 'Query nao pode ser vazia').max(1000, 'Query muito longa'),
  maxSources: z.number().int().min(1).max(10).default(5),
  language: z.string().max(10).default('pt-BR'),
  empresaId: z.string().uuid().optional(),
})

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface ResearchResponse {
  id: string
  query: string
  sources: SearchResult[]
  synthesis: string
  timestamp: string
}

/**
 * Check rate limit for a user
 */
function checkRateLimit(identifier: string): boolean {
  const now = Date.now()
  const record = rateLimitStore.get(identifier)

  if (!record || record.resetAt < now) {
    rateLimitStore.set(identifier, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return true
  }

  if (record.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  record.count++
  return true
}

serve(async (req) => {
  const requestId = crypto.randomUUID()

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req)
  }

  try {
    // 1. Verify authentication
    const { user, error: authError, supabase } = await verifyAuth(req)
    if (authError || !user) {
      console.warn('Auth failed:', { requestId, error: authError })
      return errorResponse('Nao autorizado', req, 401, requestId)
    }

    // 2. Check rate limit
    if (!checkRateLimit(user.id)) {
      console.warn('Rate limit exceeded:', { requestId, userId: user.id })
      return new Response(
        JSON.stringify({ error: 'Muitas requisicoes. Tente novamente em 1 minuto.', requestId }),
        {
          status: 429,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      )
    }

    // 3. Parse and validate input
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return errorResponse('JSON invalido', req, 400, requestId)
    }

    const parseResult = ResearchRequestSchema.safeParse(body)
    if (!parseResult.success) {
      console.warn('Validation error:', { requestId, errors: parseResult.error.errors })
      return new Response(
        JSON.stringify({
          error: 'Erro de validacao',
          details: parseResult.error.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
          requestId,
        }),
        {
          status: 400,
          headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
        }
      )
    }

    const { query, maxSources, language } = parseResult.data

    // 4. Security: Check for prompt injection in query
    const securityCheck = validatePromptSecurity(query)
    if (!securityCheck.valid) {
      console.warn('Prompt injection attempt:', { requestId, userId: user.id, reason: securityCheck.reason })
      return errorResponse('Query invalida', req, 400, requestId)
    }

    // 5. Get user's empresa_id
    const empresaId = parseResult.data.empresaId || await getUserEmpresaId(supabase, user.id)

    // Generate search queries
    const searchQueries = await generateSearchQueries(query)

    // Search the web
    let allResults: SearchResult[] = []

    if (BRAVE_SEARCH_API_KEY) {
      // Use Brave Search API
      for (const searchQuery of searchQueries) {
        const results = await searchBrave(searchQuery)
        allResults = [...allResults, ...results]
      }
    } else {
      // Mock results for development
      allResults = getMockSearchResults(query)
    }

    // Deduplicate and limit results
    const uniqueResults = deduplicateResults(allResults).slice(0, maxSources)

    // Synthesize results
    const synthesis = await synthesizeResults(query, uniqueResults, language)

    // Generate unique ID
    const researchId = crypto.randomUUID()

    // Save research to database
    const serviceClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    try {
      await serviceClient
        .from('chatbot_pesquisas_gpt')
        .insert({
          id: researchId,
          empresa_id: empresaId,
          query,
          resultados: uniqueResults,
          sintese: synthesis,
          idioma: language,
          num_fontes: uniqueResults.length,
        })
    } catch (dbError) {
      console.error('Database error:', { requestId, error: dbError instanceof Error ? dbError.message : 'unknown' })
    }

    const response: ResearchResponse = {
      id: researchId,
      query,
      sources: uniqueResults,
      synthesis,
      timestamp: new Date().toISOString(),
    }

    return jsonResponse(response, req, 200)

  } catch (error) {
    console.error('Unhandled error:', {
      requestId,
      error: error instanceof Error ? { name: error.name, message: error.message } : 'unknown',
    })

    return new Response(JSON.stringify({
      error: 'Erro interno do servidor',
      id: requestId,
      query: '',
      sources: [],
      synthesis: 'Nao foi possivel realizar a pesquisa. Por favor, tente novamente.',
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    })
  }
})

async function generateSearchQueries(query: string): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [query]
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Gere 3 queries de busca otimizadas para pesquisar sobre o tema.
Retorne APENAS as queries, uma por linha, sem numeracao ou explicacoes.
Foque em termos tecnicos e especificos do setor de dispositivos medicos OPME.`
          },
          { role: 'user', content: query }
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
    })

    if (!response.ok) {
      return [query]
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''
    const queries = content.split('\n').filter((q: string) => q.trim().length > 0)

    return queries.length > 0 ? queries.slice(0, 3) : [query]
  } catch {
    return [query]
  }
}

async function searchBrave(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&safesearch=moderate`,
      {
        headers: {
          'X-Subscription-Token': BRAVE_SEARCH_API_KEY!,
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      console.error('Brave Search API error:', await response.text())
      return []
    }

    const data = await response.json()

    return (data.web?.results || []).map((r: { title: string; url: string; description: string }) => ({
      title: r.title,
      url: r.url,
      snippet: r.description,
    }))
  } catch (error) {
    console.error('Brave Search error:', error)
    return []
  }
}

async function synthesizeResults(
  query: string,
  results: SearchResult[],
  language: string
): Promise<string> {
  if (results.length === 0) {
    return 'Nao foram encontrados resultados relevantes para sua pesquisa.'
  }

  if (!OPENAI_API_KEY) {
    return `Encontrados ${results.length} resultados para "${query}":\n\n` +
      results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`).join('\n\n')
  }

  const sourcesText = results
    .map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet}\nFonte: ${r.url}`)
    .join('\n\n')

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
            content: `Voce e um pesquisador especializado em dispositivos medicos e OPME.
Sintetize as informacoes das fontes fornecidas para responder a pergunta do usuario.

REGRAS:
- Responda em ${language}
- Cite as fontes usando [numero]
- Seja objetivo e factual
- Se houver contradicoes entre fontes, mencione
- Inclua uma secao de "Fontes" no final com os links
- Foque em informacoes relevantes para o setor de saude`
          },
          {
            role: 'user',
            content: `PERGUNTA: ${query}\n\nFONTES:\n${sourcesText}`
          }
        ],
        temperature: 0.5,
        max_tokens: 1500,
      }),
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content || 'Nao foi possivel sintetizar os resultados.'
  } catch {
    return `Encontrados ${results.length} resultados para "${query}":\n\n` +
      results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.snippet}`).join('\n\n')
  }
}

function deduplicateResults(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>()
  return results.filter(r => {
    const key = r.url.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function getMockSearchResults(query: string): SearchResult[] {
  const mockResults: SearchResult[] = [
    {
      title: 'ANVISA - Dispositivos Medicos',
      url: 'https://www.gov.br/anvisa/pt-br/assuntos/produtos-para-saude/dispositivos-medicos',
      snippet: 'Informacoes sobre regulamentacao de dispositivos medicos no Brasil, incluindo OPME e implantes.',
    },
    {
      title: 'RDC 665/2022 - Implantes',
      url: 'https://www.in.gov.br/web/dou/-/resolucao-rdc-n-665',
      snippet: 'Resolucao que estabelece requisitos minimos de identificacao e rastreabilidade de implantes.',
    },
    {
      title: 'Boas Praticas de Distribuicao - OPME',
      url: 'https://www.gov.br/anvisa/pt-br/assuntos/regulamentacao/legislacao',
      snippet: 'Guia de boas praticas para distribuidoras de materiais especiais e implantes.',
    },
    {
      title: 'Mercado de OPME no Brasil',
      url: 'https://www.anahp.com.br/',
      snippet: 'Analise do mercado brasileiro de orteses, proteses e materiais especiais.',
    },
    {
      title: 'Rastreabilidade de Dispositivos Medicos',
      url: 'https://www.gov.br/anvisa/pt-br/assuntos/produtos-para-saude',
      snippet: 'Requisitos para rastreabilidade de dispositivos medicos conforme RDC 16/2013.',
    },
  ]

  const queryLower = query.toLowerCase()
  const filtered = mockResults.filter(r =>
    r.title.toLowerCase().includes(queryLower) ||
    r.snippet.toLowerCase().includes(queryLower) ||
    queryLower.includes('opme') ||
    queryLower.includes('anvisa') ||
    queryLower.includes('dispositivo')
  )

  return filtered.length > 0 ? filtered : mockResults.slice(0, 3)
}
