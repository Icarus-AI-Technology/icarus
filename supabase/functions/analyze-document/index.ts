/**
 * Analyze Document - Edge Function para Chatbot
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Analisa documentos anexados e gera justificativa médica
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

interface DocumentAnalysis {
  tipo_documento: string
  dados_extraidos: Record<string, unknown>
  justificativa_medica?: string
  resumo: string
  acoes_sugeridas: string[]
}

interface AnalyzeRequest {
  files: Array<{
    name: string
    type: 'pdf' | 'image' | 'xml'
    base64: string
  }>
  prompt?: string
  gerar_justificativa: boolean
  empresa_id: number
  session_id: string
}

serve(async (req: Request): Promise<Response> => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    })
  }

  try {
    const { files, prompt, gerar_justificativa, empresa_id, session_id }: AnalyzeRequest = await req.json()

    if (!files || files.length === 0) {
      return jsonResponse({ success: false, error: "Nenhum arquivo fornecido" }, 400)
    }

    const analyses: DocumentAnalysis[] = []

    for (const file of files) {
      let analysis: DocumentAnalysis

      if (file.type === 'xml') {
        // Parse XML diretamente
        analysis = await analyzeXML(file.base64, file.name)
      } else {
        // Usar Claude Vision para PDF/imagens
        analysis = await analyzeWithVision(file.base64, file.type, file.name, prompt)
      }

      // Gerar justificativa médica se solicitado
      if (gerar_justificativa && analysis.dados_extraidos) {
        analysis.justificativa_medica = await gerarJustificativaMedica(analysis)
      }

      analyses.push(analysis)
    }

    // Salvar análise no histórico
    await supabase.from("chat_analyses").insert({
      session_id,
      empresa_id,
      arquivos_analisados: files.length,
      tipos_documentos: [...new Set(analyses.map(a => a.tipo_documento))],
      gerou_justificativa: gerar_justificativa,
    })

    // Gerar resposta consolidada para o chat
    const resposta = gerarRespostaChat(analyses, gerar_justificativa)

    return jsonResponse({
      success: true,
      analyses,
      resposta,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("Erro analyze-document:", errorMessage)
    return jsonResponse({ success: false, error: errorMessage }, 500)
  }
})

/**
 * Analisa documento com Claude Vision
 */
async function analyzeWithVision(
  base64: string, 
  type: 'pdf' | 'image', 
  filename: string,
  userPrompt?: string
): Promise<DocumentAnalysis> {
  const mediaType = type === 'pdf' ? 'application/pdf' : 'image/jpeg'
  
  const systemPrompt = `Você é um especialista em análise de documentos médicos e OPME.
Analise o documento e extraia:
1. Tipo do documento (pedido médico, NF-e, autorização, laudo, etc.)
2. Dados relevantes (paciente, médico, CRM, materiais, valores, etc.)
3. Resumo em 2-3 frases
4. Ações sugeridas para o usuário

Retorne em formato JSON estruturado.`

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 4096,
    system: systemPrompt,
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
            text: userPrompt || `Analise este documento: ${filename}`,
          },
        ],
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  const text = textContent?.type === 'text' ? textContent.text : '{}'

  try {
    // Tentar extrair JSON da resposta
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        tipo_documento: parsed.tipo_documento || 'Documento',
        dados_extraidos: parsed.dados_extraidos || parsed,
        resumo: parsed.resumo || 'Documento analisado com sucesso',
        acoes_sugeridas: parsed.acoes_sugeridas || ['Revisar dados extraídos'],
      }
    }
  } catch {
    // Fallback se não for JSON
  }

  return {
    tipo_documento: 'Documento',
    dados_extraidos: { texto_bruto: text },
    resumo: text.substring(0, 200),
    acoes_sugeridas: ['Revisar análise'],
  }
}

/**
 * Analisa XML de NF-e
 */
async function analyzeXML(base64: string, filename: string): Promise<DocumentAnalysis> {
  const xml = atob(base64)
  
  const getValue = (tag: string): string => {
    const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`))
    return match ? match[1] : ""
  }

  // Detectar tipo de XML
  const isNFe = xml.includes('<NFe') || xml.includes('<nfeProc')
  
  if (isNFe) {
    // Parse NF-e
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
        quantidade: parseFloat(getDetValue("qCom")) || 0,
        valor_unitario: parseFloat(getDetValue("vUnCom")) || 0,
        lote: getDetValue("nLote"),
        validade: getDetValue("dVal"),
      })
    }

    return {
      tipo_documento: 'NF-e',
      dados_extraidos: {
        chave: getValue("chNFe"),
        numero: getValue("nNF"),
        emitente: {
          cnpj: getValue("CNPJ"),
          razao_social: getValue("xNome"),
        },
        valor_total: parseFloat(getValue("vNF")) || 0,
        data_emissao: getValue("dhEmi"),
        produtos,
      },
      resumo: `NF-e ${getValue("nNF")} de ${getValue("xNome")} - ${produtos.length} itens`,
      acoes_sugeridas: [
        'Importar para estoque',
        'Gerar conta a pagar',
        'Verificar lotes e validades',
      ],
    }
  }

  // XML genérico
  return {
    tipo_documento: 'XML',
    dados_extraidos: { conteudo: xml.substring(0, 1000) },
    resumo: `Arquivo XML: ${filename}`,
    acoes_sugeridas: ['Analisar conteúdo manualmente'],
  }
}

/**
 * Gera justificativa médica para convênio
 */
async function gerarJustificativaMedica(analysis: DocumentAnalysis): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    system: `Você é um especialista em justificativas médicas para autorização de convênios.
Gere uma justificativa profissional, técnica e objetiva que:
1. Seja adequada para envio a operadoras de saúde
2. Justifique a necessidade dos materiais OPME
3. Mencione códigos quando disponíveis (CID, TUSS)
4. Tenha tom formal e técnico
5. Seja clara e direta`,
    messages: [
      {
        role: "user",
        content: `Com base nos dados extraídos abaixo, gere uma justificativa médica profissional:

TIPO: ${analysis.tipo_documento}
DADOS: ${JSON.stringify(analysis.dados_extraidos, null, 2)}
RESUMO: ${analysis.resumo}

JUSTIFICATIVA MÉDICA:`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  return textContent?.type === 'text' ? textContent.text : ""
}

/**
 * Gera resposta formatada para o chat
 */
function gerarRespostaChat(analyses: DocumentAnalysis[], comJustificativa: boolean): string {
  let resposta = `📄 **Análise de ${analyses.length} documento(s) concluída!**\n\n`

  for (const analysis of analyses) {
    resposta += `### ${analysis.tipo_documento}\n`
    resposta += `${analysis.resumo}\n\n`

    if (analysis.acoes_sugeridas.length > 0) {
      resposta += `**Ações sugeridas:**\n`
      analysis.acoes_sugeridas.forEach(acao => {
        resposta += `• ${acao}\n`
      })
      resposta += '\n'
    }

    if (comJustificativa && analysis.justificativa_medica) {
      resposta += `---\n\n**📋 Justificativa Médica Gerada:**\n\n`
      resposta += `${analysis.justificativa_medica}\n\n`
      resposta += `*Copie esta justificativa para o campo "Informações Complementares" da NF-e*\n`
    }
  }

  return resposta
}

function jsonResponse(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}

