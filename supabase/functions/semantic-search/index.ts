/**
 * ICARUS v5.0 - Semantic Search Edge Function
 * 
 * Busca semântica com pgvector para catálogo de dispositivos médicos
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SearchRequest {
  query: string
  match_count?: number
  match_threshold?: number
  filtro_anvisa_valido?: boolean
  filtro_classe_risco?: string[]
  filtro_vencimento_apos?: string
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    throw new Error(`OpenAI API error: ${await response.text()}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body: SearchRequest = await req.json()

    if (!body.query) {
      return new Response(
        JSON.stringify({ error: 'Query é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gera embedding da query
    const queryEmbedding = await generateEmbedding(body.query)

    // Busca semântica via RPC
    const { data, error } = await supabase.rpc('busca_semantica_catalogo', {
      query_embedding: queryEmbedding,
      match_threshold: body.match_threshold || 0.6,
      match_count: body.match_count || 10,
      filtro_anvisa_valido: body.filtro_anvisa_valido ?? null,
      filtro_classe_risco: body.filtro_classe_risco ?? null,
      filtro_vencimento_apos: body.filtro_vencimento_apos ?? null
    })

    if (error) {
      console.error('Erro na busca:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        query: body.query,
        resultados: data || [],
        total: data?.length || 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

