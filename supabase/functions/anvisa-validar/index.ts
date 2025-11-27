/**
 * ICARUS v5.0 - ANVISA Validation Edge Function
 * 
 * Validação de registros ANVISA via InfoSimples API
 * Atualiza cache no banco de dados automaticamente
 * 
 * Conformidade: RDC 751/2022, RDC 16/2013, RDC 59/2008
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Configurações
const INFOSIMPLES_API_KEY = Deno.env.get('INFOSIMPLES_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Tipos
interface AnvisaRegistro {
  numero_registro: string
  nome_comercial: string
  nome_tecnico?: string
  titular: string
  cnpj_titular?: string
  situacao: 'ATIVO' | 'CANCELADO' | 'SUSPENSO' | 'CASSADO' | 'VENCIDO'
  valido_ate: string | null
  data_publicacao?: string
  classe_risco: 'I' | 'II' | 'III' | 'IV'
  tipo_produto?: string
  motivo_cancelamento?: string
  fabricante?: string
  pais_origem?: string
}

interface ValidacaoRequest {
  numero_registro: string
  produto_id?: string
  atualizar_cache?: boolean
}

interface BuscaRequest {
  termo: string
  limite?: number
}

/**
 * Consulta registro ANVISA via InfoSimples API
 */
async function consultarAnvisa(numeroRegistro: string): Promise<{
  sucesso: boolean
  registro?: AnvisaRegistro
  erro?: string
}> {
  if (!INFOSIMPLES_API_KEY) {
    return { sucesso: false, erro: 'INFOSIMPLES_API_KEY não configurada' }
  }

  const numeroLimpo = numeroRegistro.replace(/\D/g, '')

  if (!numeroLimpo || numeroLimpo.length < 8) {
    return { sucesso: false, erro: 'Número de registro inválido' }
  }

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/anvisa/registro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: INFOSIMPLES_API_KEY,
        numero_registro: numeroLimpo
      })
    })

    if (!response.ok) {
      return { sucesso: false, erro: `API error: ${response.status}` }
    }

    const data = await response.json()

    if (data.code !== 200 || !data.data || data.data.length === 0) {
      return { 
        sucesso: false, 
        erro: data.code_message || 'Registro não encontrado na ANVISA' 
      }
    }

    const registro = data.data[0] as AnvisaRegistro

    // Verifica se está vencido
    if (registro.valido_ate && registro.situacao === 'ATIVO') {
      const dataValidade = new Date(registro.valido_ate)
      if (dataValidade < new Date()) {
        registro.situacao = 'VENCIDO'
      }
    }

    return { sucesso: true, registro }

  } catch (error) {
    console.error('Erro ao consultar ANVISA:', error)
    return { 
      sucesso: false, 
      erro: error instanceof Error ? error.message : 'Erro interno' 
    }
  }
}

/**
 * Busca registros ANVISA por termo
 */
async function buscarAnvisa(termo: string, limite: number = 20): Promise<{
  sucesso: boolean
  registros: AnvisaRegistro[]
  erro?: string
}> {
  if (!INFOSIMPLES_API_KEY) {
    return { sucesso: false, registros: [], erro: 'INFOSIMPLES_API_KEY não configurada' }
  }

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/anvisa/busca', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: INFOSIMPLES_API_KEY,
        termo,
        limite
      })
    })

    if (!response.ok) {
      return { sucesso: false, registros: [], erro: `API error: ${response.status}` }
    }

    const data = await response.json()

    if (data.code !== 200) {
      return { sucesso: false, registros: [], erro: data.code_message }
    }

    return { sucesso: true, registros: data.data || [] }

  } catch (error) {
    console.error('Erro ao buscar ANVISA:', error)
    return { 
      sucesso: false, 
      registros: [], 
      erro: error instanceof Error ? error.message : 'Erro interno' 
    }
  }
}

// Handler principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    const url = new URL(req.url)
    const action = url.pathname.split('/').pop() // 'validar' ou 'buscar'

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body = await req.json()

    // Validação de registro específico
    if (action === 'validar' || !action || action === 'anvisa-validar') {
      const { numero_registro, produto_id, atualizar_cache = true } = body as ValidacaoRequest

      if (!numero_registro) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: 'numero_registro é obrigatório' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const resultado = await consultarAnvisa(numero_registro)
      const tempoResposta = Date.now() - startTime

      // Log da validação
      await supabase.from('anvisa_validacoes_log').insert({
        numero_registro,
        produto_id,
        sucesso: resultado.sucesso,
        situacao: resultado.registro?.situacao,
        valido: resultado.registro?.situacao === 'ATIVO',
        valido_ate: resultado.registro?.valido_ate,
        classe_risco: resultado.registro?.classe_risco,
        titular: resultado.registro?.titular,
        nome_comercial: resultado.registro?.nome_comercial,
        resposta_completa: resultado.registro,
        tempo_resposta_ms: tempoResposta,
        fonte: 'infosimples'
      })

      // Atualiza cache do produto se solicitado
      if (atualizar_cache && produto_id && resultado.registro) {
        await supabase.rpc('atualizar_cache_anvisa', {
          p_produto_id: produto_id,
          p_cache: resultado.registro,
          p_valido: resultado.registro.situacao === 'ATIVO',
          p_situacao: resultado.registro.situacao,
          p_valido_ate: resultado.registro.valido_ate,
          p_classe_risco: resultado.registro.classe_risco
        })
      }

      return new Response(
        JSON.stringify({
          sucesso: resultado.sucesso,
          registro: resultado.registro,
          erro: resultado.erro,
          tempo_ms: tempoResposta
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Busca por termo
    if (action === 'buscar') {
      const { termo, limite = 20 } = body as BuscaRequest

      if (!termo || termo.length < 3) {
        return new Response(
          JSON.stringify({ sucesso: false, erro: 'Termo deve ter pelo menos 3 caracteres' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const resultado = await buscarAnvisa(termo, limite)

      return new Response(
        JSON.stringify({
          sucesso: resultado.sucesso,
          total: resultado.registros.length,
          registros: resultado.registros,
          erro: resultado.erro,
          tempo_ms: Date.now() - startTime
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ sucesso: false, erro: 'Ação não reconhecida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na Edge Function ANVISA:', error)
    
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

