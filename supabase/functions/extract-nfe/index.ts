/**
 * ICARUS v5.0 - NF-e Extraction Edge Function
 * 
 * Extração automática de NF-e com Claude Vision + OCR Fallback
 * Processa XMLs e PDFs de notas fiscais de dispositivos médicos
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Tipos
interface NFEItem {
  codigo: string
  descricao: string
  ncm: string
  cfop: string
  unidade: string
  quantidade: number
  valor_unitario: number
  valor_total: number
  lote?: string
  validade?: string
  registro_anvisa?: string
}

interface NFEExtracao {
  numero_nfe: string
  serie: string
  data_emissao: string
  data_entrada?: string
  chave_acesso?: string
  emitente: {
    cnpj: string
    razao_social: string
    inscricao_estadual?: string
    endereco?: string
    cidade?: string
    uf?: string
  }
  destinatario: {
    cnpj: string
    razao_social: string
    inscricao_estadual?: string
    endereco?: string
    cidade?: string
    uf?: string
  }
  itens: NFEItem[]
  total: {
    base_calculo: number
    valor_icms: number
    valor_produtos: number
    valor_frete: number
    valor_nfe: number
  }
  informacoes_complementares?: string
  confianca: number
  metodo_extracao: 'xml' | 'vision' | 'ocr'
}

interface ExtractionRequest {
  tipo: 'xml' | 'pdf' | 'imagem'
  conteudo: string
  nome_arquivo?: string
}

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')
const _OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseNFEXML(xmlContent: string): NFEExtracao {
  const getTag = (xml: string, tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i'))
    return match ? match[1].trim() : ''
  }

  const getAllTags = (xml: string, tag: string): string[] => {
    const matches = xml.matchAll(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'gi'))
    return Array.from(matches).map(m => m[1])
  }

  const emit = getAllTags(xmlContent, 'emit')[0] || ''
  const dest = getAllTags(xmlContent, 'dest')[0] || ''
  const infNFe = getAllTags(xmlContent, 'infNFe')[0] || ''

  const detItems = getAllTags(xmlContent, 'det')
  const itens: NFEItem[] = detItems.map(det => {
    const prod = getAllTags(det, 'prod')[0] || ''
    const rastro = getAllTags(det, 'rastro')[0] || ''
    
    return {
      codigo: getTag(prod, 'cProd'),
      descricao: getTag(prod, 'xProd'),
      ncm: getTag(prod, 'NCM'),
      cfop: getTag(prod, 'CFOP'),
      unidade: getTag(prod, 'uCom'),
      quantidade: parseFloat(getTag(prod, 'qCom')) || 0,
      valor_unitario: parseFloat(getTag(prod, 'vUnCom')) || 0,
      valor_total: parseFloat(getTag(prod, 'vProd')) || 0,
      lote: getTag(rastro, 'nLote') || undefined,
      validade: getTag(rastro, 'dVal') || undefined,
      registro_anvisa: getTag(prod, 'cProdANVISA') || undefined
    }
  })

  const total = getAllTags(xmlContent, 'total')[0] || ''
  const icmsTot = getAllTags(total, 'ICMSTot')[0] || ''

  return {
    numero_nfe: getTag(infNFe, 'nNF'),
    serie: getTag(infNFe, 'serie'),
    data_emissao: getTag(infNFe, 'dhEmi').split('T')[0],
    data_entrada: getTag(infNFe, 'dhSaiEnt')?.split('T')[0],
    chave_acesso: infNFe.match(/Id="NFe(\d{44})"/)?.[1],
    emitente: {
      cnpj: getTag(emit, 'CNPJ'),
      razao_social: getTag(emit, 'xNome'),
      inscricao_estadual: getTag(emit, 'IE'),
      endereco: `${getTag(emit, 'xLgr')}, ${getTag(emit, 'nro')}`,
      cidade: getTag(emit, 'xMun'),
      uf: getTag(emit, 'UF')
    },
    destinatario: {
      cnpj: getTag(dest, 'CNPJ'),
      razao_social: getTag(dest, 'xNome'),
      inscricao_estadual: getTag(dest, 'IE'),
      endereco: `${getTag(dest, 'xLgr')}, ${getTag(dest, 'nro')}`,
      cidade: getTag(dest, 'xMun'),
      uf: getTag(dest, 'UF')
    },
    itens,
    total: {
      base_calculo: parseFloat(getTag(icmsTot, 'vBC')) || 0,
      valor_icms: parseFloat(getTag(icmsTot, 'vICMS')) || 0,
      valor_produtos: parseFloat(getTag(icmsTot, 'vProd')) || 0,
      valor_frete: parseFloat(getTag(icmsTot, 'vFrete')) || 0,
      valor_nfe: parseFloat(getTag(icmsTot, 'vNF')) || 0
    },
    informacoes_complementares: getTag(xmlContent, 'infCpl'),
    confianca: 1.0,
    metodo_extracao: 'xml'
  }
}

async function extractWithVision(base64Content: string, mediaType: string): Promise<NFEExtracao> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY não configurada')
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8192,
      system: 'Extraia dados de NF-e. Retorne JSON com: numero_nfe, serie, data_emissao, emitente{cnpj, razao_social}, destinatario{cnpj, razao_social}, itens[{codigo, descricao, ncm, cfop, unidade, quantidade, valor_unitario, valor_total, lote, validade, registro_anvisa}], total{base_calculo, valor_icms, valor_produtos, valor_frete, valor_nfe}',
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Content } },
          { type: 'text', text: 'Extraia dados desta NF-e. Retorne APENAS JSON.' }
        ]
      }]
    }),
  })

  const data = await response.json()
  const textContent = data.content?.find((b: { type: string }) => b.type === 'text')?.text || '{}'
  const parsed = JSON.parse(textContent.replace(/```json\s*|\s*```/g, ''))

  return {
    ...parsed,
    confianca: 0.85,
    metodo_extracao: 'vision'
  }
}

async function processNFE(supabase: ReturnType<typeof createClient>, request: ExtractionRequest): Promise<NFEExtracao> {
  if (request.tipo === 'xml') {
    return parseNFEXML(request.conteudo)
  }
  return extractWithVision(request.conteudo, request.tipo === 'pdf' ? 'application/pdf' : 'image/png')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    const body: ExtractionRequest = await req.json()

    if (!body.tipo || !body.conteudo) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios faltando' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const extracao = await processNFE(supabase, body)

    return new Response(JSON.stringify({ success: true, extracao }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

