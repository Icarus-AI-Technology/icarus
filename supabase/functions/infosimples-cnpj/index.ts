/**
 * Edge Function: Consulta CNPJ via APIs Públicas
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Consulta dados cadastrais de empresas via CNPJ
 * 
 * APIs utilizadas (em ordem de prioridade):
 * 1. CNPJA Open API - https://open.cnpja.com (gratuita, sem autenticação)
 * 2. BrasilAPI - https://brasilapi.com.br (gratuita, sem autenticação)
 * 3. Infosimples (se token configurado) - https://infosimples.com
 * 
 * Verificado via MCP EXA em 2024-11-29
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

const INFOSIMPLES_TOKEN = Deno.env.get('INFOSIMPLES_TOKEN')

interface CNPJResponse {
  cnpj: string
  razao_social: string
  nome_fantasia: string | null
  situacao: string
  data_situacao: string
  logradouro: string
  numero: string
  complemento: string | null
  bairro: string
  municipio: string
  uf: string
  cep: string
  telefone: string | null
  email: string | null
  atividade_principal: string
  natureza_juridica: string
  capital_social: number
}

/**
 * Normaliza resposta da CNPJA Open API
 */
function normalizeCNPJAResponse(data: Record<string, unknown>): CNPJResponse {
  const company = data.company as Record<string, unknown> || {}
  const address = data.address as Record<string, unknown> || {}
  const phones = (data.phones as Record<string, unknown>[]) || []
  const emails = (data.emails as Record<string, unknown>[]) || []
  const mainActivity = (data.mainActivity as Record<string, unknown>) || {}
  const status = data.status as Record<string, unknown> || {}
  
  return {
    cnpj: (data.taxId as string) || '',
    razao_social: (company.name as string) || '',
    nome_fantasia: (data.alias as string) || null,
    situacao: (status.text as string) || 'DESCONHECIDA',
    data_situacao: (status.date as string) || '',
    logradouro: (address.street as string) || '',
    numero: (address.number as string) || '',
    complemento: (address.details as string) || null,
    bairro: (address.district as string) || '',
    municipio: (address.city as string) || '',
    uf: (address.state as string) || '',
    cep: (address.zip as string) || '',
    telefone: phones.length > 0 ? `(${(phones[0].area as string) || ''}) ${(phones[0].number as string) || ''}` : null,
    email: emails.length > 0 ? (emails[0].address as string) : null,
    atividade_principal: (mainActivity.text as string) || '',
    natureza_juridica: ((data.nature as Record<string, unknown>)?.text as string) || '',
    capital_social: (company.equity as number) || 0,
  }
}

/**
 * Normaliza resposta da BrasilAPI
 */
function normalizeBrasilAPIResponse(data: Record<string, unknown>): CNPJResponse {
  return {
    cnpj: (data.cnpj as string) || '',
    razao_social: (data.razao_social as string) || '',
    nome_fantasia: (data.nome_fantasia as string) || null,
    situacao: (data.descricao_situacao_cadastral as string) || 'DESCONHECIDA',
    data_situacao: (data.data_situacao_cadastral as string) || '',
    logradouro: (data.logradouro as string) || '',
    numero: (data.numero as string) || '',
    complemento: (data.complemento as string) || null,
    bairro: (data.bairro as string) || '',
    municipio: (data.municipio as string) || '',
    uf: (data.uf as string) || '',
    cep: (data.cep as string) || '',
    telefone: (data.ddd_telefone_1 as string) || null,
    email: (data.email as string) || null,
    atividade_principal: (data.cnae_fiscal_descricao as string) || '',
    natureza_juridica: (data.natureza_juridica as string) || '',
    capital_social: parseFloat((data.capital_social as string) || '0') || 0,
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const cnpj = url.searchParams.get('cnpj')

    // Validação de parâmetros
    if (!cnpj) {
      return new Response(
        JSON.stringify({ error: 'Parâmetro obrigatório: cnpj' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Limpar CNPJ
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) {
      return new Response(
        JSON.stringify({ error: 'CNPJ deve ter 14 dígitos' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Tentar CNPJA Open API primeiro (mais completa e rápida)
    try {
      const cnpjaResponse = await fetch(`https://open.cnpja.com/office/${cnpjLimpo}`, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (cnpjaResponse.ok) {
        const cnpjaData = await cnpjaResponse.json()
        const normalizedData = normalizeCNPJAResponse(cnpjaData)
        
        return new Response(
          JSON.stringify({
            ...normalizedData,
            _fonte: 'CNPJA Open API'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (error) {
      console.warn('CNPJA API falhou:', error)
    }

    // Fallback para BrasilAPI
    try {
      const brasilResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      
      if (brasilResponse.ok) {
        const brasilData = await brasilResponse.json()
        const normalizedData = normalizeBrasilAPIResponse(brasilData)
        
        return new Response(
          JSON.stringify({
            ...normalizedData,
            _fonte: 'BrasilAPI'
          }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } catch (error) {
      console.warn('BrasilAPI falhou:', error)
    }

    // Se Infosimples estiver configurado, usar como último recurso
    if (INFOSIMPLES_TOKEN) {
      try {
        const infosimplesParams = new URLSearchParams({
          token: INFOSIMPLES_TOKEN,
          cnpj: cnpjLimpo,
          timeout: '300',
        })

        const response = await fetch(
          `https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj?${infosimplesParams}`,
          { headers: { 'Accept': 'application/json' } }
        )

        if (response.ok) {
          const result = await response.json()
          
          if (result.code === 200 && result.data && result.data.length > 0) {
            const empresa = result.data[0]
            
            return new Response(
              JSON.stringify({
                cnpj: empresa.normalizado_cnpj || cnpjLimpo,
                razao_social: empresa.razao_social,
                nome_fantasia: empresa.nome_fantasia,
                situacao: empresa.situacao_cadastral,
                data_situacao: empresa.situacao_cadastral_data,
                logradouro: empresa.endereco_logradouro,
                numero: empresa.endereco_numero,
                complemento: empresa.endereco_complemento,
                bairro: empresa.endereco_bairro,
                municipio: empresa.endereco_municipio,
                uf: empresa.endereco_uf,
                cep: empresa.endereco_cep,
                telefone: empresa.telefone,
                email: empresa.email,
                atividade_principal: empresa.atividade_economica,
                natureza_juridica: empresa.natureza_juridica,
                capital_social: empresa.normalizado_capital_social || 0,
                _fonte: 'Infosimples'
              }),
              { 
                status: 200, 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
              }
            )
          }
        }
      } catch (error) {
        console.warn('Infosimples API falhou:', error)
      }
    }

    // Nenhuma API funcionou
    return new Response(
      JSON.stringify({ 
        error: 'CNPJ não encontrado',
        message: 'Não foi possível consultar o CNPJ em nenhuma das APIs disponíveis'
      }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na consulta CNPJ:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao consultar CNPJ',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

