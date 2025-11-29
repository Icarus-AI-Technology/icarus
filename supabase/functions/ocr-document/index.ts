/**
 * OCR Document - Edge Function
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Extrai texto de documentos usando Claude Vision + Tesseract fallback
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Anthropic from "npm:@anthropic-ai/sdk@0.24.0"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY")!,
})

interface OCRRequest {
  file_base64: string
  file_type: string // 'pdf' | 'image' | 'xml'
  extract_type: 'justificativa_medica' | 'dados_nfe' | 'pedido_medico' | 'geral'
  empresa_id: number
}

interface OCRResponse {
  success: boolean
  texto_extraido?: string
  dados_estruturados?: Record<string, unknown>
  justificativa_medica?: string
  erro?: string
}

serve(async (req: Request): Promise<Response> => {
  try {
    const { file_base64, file_type, extract_type, empresa_id }: OCRRequest = await req.json()

    if (!file_base64) {
      return jsonResponse({ success: false, erro: "Arquivo não fornecido" }, 400)
    }

    let textoExtraido = ""
    let dadosEstruturados: Record<string, unknown> = {}

    // Se for XML, parse direto
    if (file_type === 'xml') {
      const xmlContent = atob(file_base64)
      textoExtraido = xmlContent
      dadosEstruturados = parseXMLNFe(xmlContent)
    } else {
      // Para PDF e imagens, usar Claude Vision
      textoExtraido = await extrairTextoComClaude(file_base64, file_type)
    }

    // Se solicitado, gerar justificativa médica
    let justificativaMedica: string | undefined
    if (extract_type === 'justificativa_medica' || extract_type === 'pedido_medico') {
      justificativaMedica = await gerarJustificativaMedica(textoExtraido)
    }

    // Extrair dados estruturados conforme tipo
    if (extract_type === 'dados_nfe' && file_type !== 'xml') {
      dadosEstruturados = await extrairDadosNFe(textoExtraido)
    } else if (extract_type === 'pedido_medico') {
      dadosEstruturados = await extrairDadosPedidoMedico(textoExtraido)
    }

    // Salvar log
    await supabase.from("ocr_logs").insert({
      empresa_id,
      tipo_documento: file_type,
      tipo_extracao: extract_type,
      sucesso: true,
      caracteres_extraidos: textoExtraido.length,
    })

    return jsonResponse({
      success: true,
      texto_extraido: textoExtraido,
      dados_estruturados: dadosEstruturados,
      justificativa_medica: justificativaMedica,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("Erro OCR:", errorMessage)
    return jsonResponse({ success: false, erro: errorMessage }, 500)
  }
})

/**
 * Extrai texto usando Claude Vision
 */
async function extrairTextoComClaude(base64: string, fileType: string): Promise<string> {
  const mediaType = fileType === 'pdf' ? 'application/pdf' : 'image/jpeg'
  
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64,
            },
          },
          {
            type: "text",
            text: `Extraia TODO o texto visível deste documento. 
Se for um pedido médico, identifique: nome do paciente, médico, CRM, procedimento, materiais solicitados.
Se for uma NF-e, identifique: chave, CNPJ, produtos, valores, lotes, validades.
Retorne o texto de forma estruturada e organizada.`,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  return textContent?.type === 'text' ? textContent.text : ""
}

/**
 * Gera justificativa médica para convênio
 */
async function gerarJustificativaMedica(textoDocumento: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Com base no documento abaixo, gere uma JUSTIFICATIVA MÉDICA profissional para autorização de convênio.

A justificativa deve:
1. Ser técnica e objetiva
2. Mencionar o diagnóstico/CID quando disponível
3. Justificar a necessidade dos materiais OPME
4. Citar referências médicas quando aplicável
5. Ter tom profissional adequado para convênios

DOCUMENTO:
${textoDocumento}

JUSTIFICATIVA MÉDICA:`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  return textContent?.type === 'text' ? textContent.text : ""
}

/**
 * Extrai dados de NF-e do texto
 */
async function extrairDadosNFe(texto: string): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Extraia os seguintes dados da NF-e em formato JSON:
- chave_nfe (44 dígitos)
- cnpj_emitente
- razao_social_emitente
- data_emissao
- valor_total
- produtos (array com: codigo, descricao, quantidade, valor_unitario, lote, validade, registro_anvisa)

TEXTO DA NF-e:
${texto}

Retorne APENAS o JSON, sem explicações.`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  if (textContent?.type === 'text') {
    try {
      return JSON.parse(textContent.text)
    } catch {
      return { texto_bruto: textContent.text }
    }
  }
  return {}
}

/**
 * Extrai dados de pedido médico
 */
async function extrairDadosPedidoMedico(texto: string): Promise<Record<string, unknown>> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Extraia os seguintes dados do pedido médico em formato JSON:
- paciente_nome
- paciente_cpf
- medico_nome
- medico_crm
- medico_uf
- procedimento
- cid (código CID-10 se disponível)
- materiais_solicitados (array com: descricao, quantidade, especificacao)
- hospital
- data_procedimento
- urgencia (true/false)

TEXTO DO PEDIDO:
${texto}

Retorne APENAS o JSON, sem explicações.`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  if (textContent?.type === 'text') {
    try {
      return JSON.parse(textContent.text)
    } catch {
      return { texto_bruto: textContent.text }
    }
  }
  return {}
}

/**
 * Parse XML de NF-e
 */
function parseXMLNFe(xml: string): Record<string, unknown> {
  const getValue = (tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`))
    return match ? match[1] : ""
  }

  const produtos: Record<string, unknown>[] = []
  const detMatches = xml.matchAll(/<det[^>]*>([\s\S]*?)<\/det>/g)
  
  for (const match of detMatches) {
    const det = match[1]
    const getDetValue = (tag: string): string => {
      const m = det.match(new RegExp(`<${tag}>(.*?)</${tag}>`))
      return m ? m[1] : ""
    }

    produtos.push({
      codigo: getDetValue("cProd"),
      descricao: getDetValue("xProd"),
      ncm: getDetValue("NCM"),
      quantidade: parseFloat(getDetValue("qCom")) || 0,
      valor_unitario: parseFloat(getDetValue("vUnCom")) || 0,
      valor_total: parseFloat(getDetValue("vProd")) || 0,
      lote: getDetValue("nLote"),
      validade: getDetValue("dVal"),
    })
  }

  return {
    chave_nfe: getValue("chNFe"),
    numero: getValue("nNF"),
    serie: getValue("serie"),
    data_emissao: getValue("dhEmi"),
    cnpj_emitente: getValue("CNPJ"),
    razao_social_emitente: getValue("xNome"),
    valor_produtos: parseFloat(getValue("vProd")) || 0,
    valor_total: parseFloat(getValue("vNF")) || 0,
    produtos,
  }
}

function jsonResponse(data: OCRResponse, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

