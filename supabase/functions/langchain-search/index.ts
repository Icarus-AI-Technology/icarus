/**
 * ICARUS v5.0 - LangChain Semantic Search Edge Function
 * 
 * Implementa busca semântica em catálogo médico com filtros regulatórios
 * Equivalente ao SelfQueryRetriever do LangChain
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Tipos
interface SearchRequest {
  query: string
  filters?: {
    registro_anvisa_valido?: boolean
    classe_risco?: string[]
    controlado_anvisa?: boolean
    vencimento_apos?: string
    temperatura_controlada?: boolean
  }
  match_threshold?: number
  match_count?: number
}

interface SearchResult {
  id: string
  produto_id: string
  conteudo_texto: string
  similarity: number
  registro_anvisa_valido: boolean
  numero_registro_anvisa: string
  classe_risco: string
  controlado_anvisa: boolean
  vencimento_lote: string
  temperatura_controlada: boolean
  ncm: string
  fabricante: string
}

// Configurações
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Gera embedding usando OpenAI text-embedding-3-large
 */
async function generateEmbedding(text: string): Promise<number[]> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY não configurada')
  }

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-large',
      input: text,
      dimensions: 1536
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

/**
 * Analisa a query do usuário para extrair filtros automaticamente
 * Equivalente ao SelfQueryRetriever
 */
async function parseQueryFilters(query: string): Promise<{
  searchQuery: string
  extractedFilters: SearchRequest['filters']
}> {
  if (!OPENAI_API_KEY) {
    return { searchQuery: query, extractedFilters: {} }
  }

  const systemPrompt = `Você é um assistente especializado em dispositivos médicos OPME no Brasil.
Analise a consulta do usuário e extraia:
1. A query de busca semântica (o que o usuário está procurando)
2. Filtros regulatórios que podem ser aplicados

Filtros disponíveis:
- registro_anvisa_valido: boolean (se mencionar "registro válido", "ANVISA válido")
- classe_risco: array de strings ["I", "II", "III", "IV"] (se mencionar classe de risco)
- controlado_anvisa: boolean (se mencionar "controlado", "especial", "classe III/IV")
- vencimento_apos: string ISO date (se mencionar data de vencimento mínima)
- temperatura_controlada: boolean (se mencionar "temperatura controlada", "refrigerado", "cadeia fria")

Responda APENAS em JSON válido no formato:
{
  "searchQuery": "query de busca semântica",
  "filters": {
    // apenas os filtros detectados
  }
}`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      console.error('Erro ao analisar query:', await response.text())
      return { searchQuery: query, extractedFilters: {} }
    }

    const data = await response.json()
    const parsed = JSON.parse(data.choices[0].message.content)
    
    return {
      searchQuery: parsed.searchQuery || query,
      extractedFilters: parsed.filters || {}
    }
  } catch (error) {
    console.error('Erro ao parsear filtros:', error)
    return { searchQuery: query, extractedFilters: {} }
  }
}

/**
 * Executa busca semântica no catálogo médico
 */
async function semanticSearch(
  supabase: ReturnType<typeof createClient>,
  embedding: number[],
  filters: SearchRequest['filters'],
  matchThreshold: number,
  matchCount: number
): Promise<SearchResult[]> {
  const { data, error } = await supabase.rpc('busca_semantica_catalogo', {
    query_embedding: embedding,
    match_threshold: matchThreshold,
    match_count: matchCount,
    filtro_anvisa_valido: filters?.registro_anvisa_valido ?? null,
    filtro_classe_risco: filters?.classe_risco ?? null,
    filtro_controlado: filters?.controlado_anvisa ?? null,
    filtro_vencimento_apos: filters?.vencimento_apos ?? null,
    filtro_temperatura_controlada: filters?.temperatura_controlada ?? null
  })

  if (error) {
    console.error('Erro na busca semântica:', error)
    throw error
  }

  return data || []
}

// Handler principal
Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    const body: SearchRequest = await req.json()
    const { query, filters, match_threshold = 0.7, match_count = 10 } = body

    if (!query) {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 1. Analisar query para extrair filtros automaticamente (SelfQueryRetriever)
    const { searchQuery, extractedFilters } = await parseQueryFilters(query)
    
    // Combinar filtros explícitos com extraídos
    const combinedFilters = {
      ...extractedFilters,
      ...filters // Filtros explícitos têm precedência
    }

    // 2. Gerar embedding da query
    const embedding = await generateEmbedding(searchQuery)

    // 3. Executar busca semântica com filtros
    const results = await semanticSearch(
      supabase,
      embedding,
      combinedFilters,
      match_threshold,
      match_count
    )

    // 4. Logar execução da ferramenta
    await supabase.from('ai_agent_tools_log').insert({
      tool_name: 'busca_semantica_catalogo',
      tool_input: { query, filters: combinedFilters },
      tool_output: { count: results.length, filters_applied: combinedFilters },
      success: true,
      execution_time_ms: 0 // TODO: calcular tempo real
    })

    return new Response(
      JSON.stringify({
        success: true,
        query_original: query,
        query_processada: searchQuery,
        filtros_aplicados: combinedFilters,
        resultados: results,
        total: results.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na busca semântica:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Erro interno do servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

