/**
 * IcarusBrain Justificativa - Edge Function
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Gera justificativas médicas profissionais para convênios
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

interface JustificativaRequest {
  itens: Array<{
    descricao: string
    registro_anvisa?: string
    quantidade?: number
    classe_risco?: string
  }>
  paciente?: string
  hospital?: string
  medico?: string
  procedimento?: string
  cid?: string
  convenio?: string
  empresa_id?: number
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
    const data: JustificativaRequest = await req.json()

    if (!data.itens || data.itens.length === 0) {
      return jsonResponse({ success: false, error: "Nenhum item fornecido" }, 400)
    }

    // Montar contexto para a IA
    const contexto = montarContexto(data)

    // Gerar justificativa com Claude
    const justificativa = await gerarJustificativa(contexto)

    // Salvar log
    if (data.empresa_id) {
      await supabase.from("justificativas_geradas").insert({
        empresa_id: data.empresa_id,
        qtd_itens: data.itens.length,
        convenio: data.convenio,
        hospital: data.hospital,
        sucesso: true,
      })
    }

    return jsonResponse({
      success: true,
      justificativa,
      metadata: {
        itens_processados: data.itens.length,
        timestamp: new Date().toISOString(),
      },
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("Erro justificativa:", errorMessage)
    return jsonResponse({ success: false, error: errorMessage }, 500)
  }
})

function montarContexto(data: JustificativaRequest): string {
  let contexto = "DADOS PARA JUSTIFICATIVA MÉDICA:\n\n"

  // Itens/Materiais
  contexto += "MATERIAIS OPME SOLICITADOS:\n"
  data.itens.forEach((item, idx) => {
    contexto += `${idx + 1}. ${item.descricao}`
    if (item.registro_anvisa) contexto += ` (ANVISA: ${item.registro_anvisa})`
    if (item.classe_risco) contexto += ` - Classe ${item.classe_risco}`
    if (item.quantidade) contexto += ` - Qtd: ${item.quantidade}`
    contexto += "\n"
  })

  // Dados adicionais
  if (data.paciente) contexto += `\nPACIENTE: ${data.paciente}`
  if (data.hospital) contexto += `\nHOSPITAL: ${data.hospital}`
  if (data.medico) contexto += `\nMÉDICO: ${data.medico}`
  if (data.procedimento) contexto += `\nPROCEDIMENTO: ${data.procedimento}`
  if (data.cid) contexto += `\nCID-10: ${data.cid}`
  if (data.convenio) contexto += `\nCONVÊNIO: ${data.convenio}`

  return contexto
}

async function gerarJustificativa(contexto: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 2048,
    system: `Você é um especialista em justificativas médicas para autorização de materiais OPME junto a operadoras de saúde (convênios).

REGRAS OBRIGATÓRIAS:
1. A justificativa deve ser PROFISSIONAL e TÉCNICA
2. Deve mencionar a NECESSIDADE CLÍNICA dos materiais
3. Deve citar BENEFÍCIOS para o paciente
4. Deve ser OBJETIVA (máximo 500 palavras)
5. Deve ter TOM FORMAL adequado para documentos médicos
6. Deve mencionar códigos ANVISA quando disponíveis
7. NÃO inventar dados clínicos não fornecidos
8. NÃO usar linguagem informal ou coloquial

ESTRUTURA RECOMENDADA:
- Indicação clínica
- Justificativa técnica para cada material
- Benefícios esperados
- Conclusão

Gere APENAS a justificativa, sem comentários adicionais.`,
    messages: [
      {
        role: "user",
        content: `${contexto}\n\nGere a justificativa médica profissional:`,
      },
    ],
  })

  const textContent = response.content.find(block => block.type === 'text')
  return textContent?.type === 'text' ? textContent.text : ""
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

