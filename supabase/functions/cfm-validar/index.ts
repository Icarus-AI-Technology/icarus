/**
 * ICARUS v5.0 - CFM Validation Edge Function
 * 
 * Validação de CRM médico via InfoSimples API
 * Verifica registro, situação e especialidades
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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Tipos
interface RegistroCRM {
  crm: string
  uf: string
  nome_completo: string
  situacao: string
  data_inscricao?: string
  especialidades: Array<{
    nome: string
    rqe?: string
  }>
  endereco_profissional?: string
  telefone?: string
}

interface ValidacaoRequest {
  crm: string
  uf: string
  medico_id?: string
  atualizar_cache?: boolean
}

/**
 * Consulta CRM via InfoSimples API
 */
async function consultarCFM(crm: string, uf: string): Promise<{
  sucesso: boolean
  medico?: RegistroCRM
  erro?: string
}> {
  if (!INFOSIMPLES_API_KEY) {
    return { sucesso: false, erro: 'INFOSIMPLES_API_KEY não configurada' }
  }

  const crmLimpo = crm.replace(/\D/g, '')
  const ufUpper = uf.toUpperCase()

  if (!crmLimpo || crmLimpo.length < 4) {
    return { sucesso: false, erro: 'Número de CRM inválido' }
  }

  try {
    const response = await fetch('https://api.infosimples.com/api/v2/consultas/cfm/crm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: INFOSIMPLES_API_KEY,
        crm: crmLimpo,
        uf: ufUpper
      })
    })

    if (!response.ok) {
      return { sucesso: false, erro: `API error: ${response.status}` }
    }

    const data = await response.json()

    if (data.code !== 200 || !data.data || data.data.length === 0) {
      return { 
        sucesso: false, 
        erro: data.code_message || 'CRM não encontrado no CFM' 
      }
    }

    return { sucesso: true, medico: data.data[0] }

  } catch (error) {
    console.error('Erro ao consultar CFM:', error)
    return { 
      sucesso: false, 
      erro: error instanceof Error ? error.message : 'Erro interno' 
    }
  }
}

// Handler principal
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const { crm, uf, medico_id, atualizar_cache = true }: ValidacaoRequest = await req.json()

    if (!crm || !uf) {
      return new Response(
        JSON.stringify({ sucesso: false, erro: 'CRM e UF são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resultado = await consultarCFM(crm, uf)
    const tempoResposta = Date.now() - startTime

    // Log da validação
    await supabase.from('cfm_validacoes_log').insert({
      crm,
      uf: uf.toUpperCase(),
      medico_id,
      sucesso: resultado.sucesso,
      situacao: resultado.medico?.situacao,
      valido: resultado.medico?.situacao === 'ATIVO',
      nome_medico: resultado.medico?.nome_completo,
      especialidades: resultado.medico?.especialidades,
      resposta_completa: resultado.medico,
      tempo_resposta_ms: tempoResposta,
      fonte: 'infosimples'
    })

    // Atualiza cache do médico se solicitado
    if (atualizar_cache && medico_id && resultado.medico) {
      await supabase
        .from('medicos')
        .update({
          cfm_cache: resultado.medico,
          cfm_valido: resultado.medico.situacao === 'ATIVO',
          cfm_situacao: resultado.medico.situacao,
          cfm_verificado_em: new Date().toISOString(),
          nome: resultado.medico.nome_completo,
          especialidades: resultado.medico.especialidades?.map(e => e.nome) || []
        })
        .eq('id', medico_id)

      // Log de auditoria
      await supabase.from('audit_logs').insert({
        action: 'cfm_validacao_medico',
        modulo: 'medicos',
        user_id: req.headers.get('x-user-id'),
        details: {
          medico_id,
          crm,
          uf,
          situacao: resultado.medico.situacao,
          valido: resultado.medico.situacao === 'ATIVO',
          tempo_ms: tempoResposta
        }
      })
    }

    return new Response(
      JSON.stringify({
        sucesso: resultado.sucesso,
        valido: resultado.medico?.situacao === 'ATIVO',
        medico: resultado.medico ? {
          crm: resultado.medico.crm,
          uf: resultado.medico.uf,
          nome_completo: resultado.medico.nome_completo,
          situacao: resultado.medico.situacao,
          especialidades: resultado.medico.especialidades,
          pode_atuar: resultado.medico.situacao === 'ATIVO'
        } : null,
        erro: resultado.erro,
        tempo_ms: tempoResposta
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Erro na Edge Function CFM:', error)
    
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: error instanceof Error ? error.message : 'Erro interno do servidor'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

