/**
 * Edge Function: Consulta CFM via Infosimples API
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Consulta cadastro de médicos no CFM (Conselho Federal de Medicina)
 * 
 * API Infosimples: https://infosimples.com/consultas/cfm-cadastro/
 * 
 * Parâmetros:
 * - inscricao: Número do CRM (4-8 dígitos)
 * - uf: Estado do CRM (2 letras)
 * 
 * Dados retornados:
 * - nome, inscricao, situacao, especialidade, inscricao_data, etc.
 * 
 * Verificado via MCP EXA em 2024-11-29
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const INFOSIMPLES_TOKEN = Deno.env.get('INFOSIMPLES_TOKEN')
const INFOSIMPLES_API_URL = 'https://api.infosimples.com/api/v2/consultas/cfm/cadastro'

interface CFMResponse {
  code: number
  code_message: string
  data: {
    nome: string
    inscricao: string
    inscricao_tipo: string
    inscricao_data: string
    normalizado_inscricao_data: string
    situacao: string
    especialidade: string
    especialidade_lista: string[]
    endereco: string
    endereco_uf: string
    telefone: string
    ano_formatura: string
    instituicao_graduacao: string
    outras_inscricoes: Array<{
      inscricao: string
      uf: string
      tipo: string
      situacao: string
    }>
  }[]
  header: Record<string, unknown>
  errors: string[]
  site_receipts: string[]
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const crm = url.searchParams.get('crm') || url.searchParams.get('inscricao')
    const uf = url.searchParams.get('uf')

    // Validação de parâmetros
    if (!crm || !uf) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros obrigatórios: crm e uf' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validação do CRM (4-8 dígitos)
    const crmLimpo = crm.replace(/\D/g, '')
    if (crmLimpo.length < 4 || crmLimpo.length > 8) {
      return new Response(
        JSON.stringify({ error: 'CRM deve ter entre 4 e 8 dígitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validação do UF
    const ufUpper = uf.toUpperCase()
    const estadosValidos = [
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
      'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
      'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ]
    
    if (!estadosValidos.includes(ufUpper)) {
      return new Response(
        JSON.stringify({ error: 'UF inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verificar se token Infosimples está configurado
    if (!INFOSIMPLES_TOKEN) {
      console.warn('INFOSIMPLES_TOKEN não configurado, retornando dados simulados')
      
      // Retornar dados simulados para desenvolvimento
      return new Response(
        JSON.stringify({
          nome: `Dr. Médico Teste (CRM ${ufUpper}-${crmLimpo})`,
          inscricao: crmLimpo,
          inscricao_tipo: 'Principal',
          inscricao_data: '01/01/2010',
          situacao: 'Ativo',
          especialidade: 'Cirurgia Vascular',
          uf: ufUpper,
          _simulado: true,
          _mensagem: 'Configure INFOSIMPLES_TOKEN para consulta real'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Chamada real para Infosimples API
    const infosimplesParams = new URLSearchParams({
      token: INFOSIMPLES_TOKEN,
      inscricao: crmLimpo,
      uf: ufUpper,
      timeout: '300',
    })

    const response = await fetch(`${INFOSIMPLES_API_URL}?${infosimplesParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`Infosimples API error: ${response.status}`)
    }

    const result: CFMResponse = await response.json()

    // Verificar se encontrou dados
    if (result.code !== 200 || !result.data || result.data.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Médico não encontrado',
          code: result.code,
          message: result.code_message,
          errors: result.errors
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Retornar primeiro resultado
    const medico = result.data[0]
    
    return new Response(
      JSON.stringify({
        nome: medico.nome,
        inscricao: medico.inscricao,
        inscricao_tipo: medico.inscricao_tipo,
        inscricao_data: medico.inscricao_data,
        normalizado_inscricao_data: medico.normalizado_inscricao_data,
        situacao: medico.situacao,
        especialidade: medico.especialidade,
        especialidade_lista: medico.especialidade_lista,
        endereco: medico.endereco,
        endereco_uf: medico.endereco_uf,
        telefone: medico.telefone,
        ano_formatura: medico.ano_formatura,
        instituicao_graduacao: medico.instituicao_graduacao,
        outras_inscricoes: medico.outras_inscricoes,
        uf: ufUpper,
        crm: crmLimpo,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na consulta CFM:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao consultar CFM',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

