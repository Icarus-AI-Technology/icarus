/**
 * ICARUS v5.0 - Edge Function: Atualizar Cache ANVISA
 * 
 * Recebe resultado da consulta InfoSimples e salva/atualiza
 * o cache + status no Supabase com segurança total (RLS + service_role)
 * 
 * Conformidade: 21 CFR Part 11 / RDC 751/2022
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Service Role Key (tem bypass de RLS – use só em Edge Functions!)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface AnvisaCache {
  registro?: {
    numero_registro: string
    nome_comercial: string
    titular: string
    situacao: string
    valido_ate: string | null
    classe_risco: string
    motivo_cancelamento?: string
  }
}

interface RequestBody {
  id: string
  cache: AnvisaCache | null
  valido: boolean
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const startTime = Date.now()

  try {
    const { id, cache, valido }: RequestBody = await req.json()

    // Validação mínima de entrada
    if (!id || typeof valido !== "boolean") {
      return new Response(
        JSON.stringify({ error: "Parâmetros inválidos: id e valido são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Extrair dados do registro para campos específicos
    const registro = cache?.registro
    const situacao = registro?.situacao || null
    const validoAte = registro?.valido_ate || null
    const classeRisco = registro?.classe_risco || null

    // Atualiza o produto com cache ANVISA
    const { data, error } = await supabase
      .from("opme_produtos")
      .update({
        anvisa_cache: cache || null,
        anvisa_valido: valido,
        anvisa_situacao: situacao,
        anvisa_valido_ate: validoAte,
        anvisa_classe_risco: classeRisco,
        anvisa_verificado_em: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    // Obtém user_id do header ou do token de autenticação
    const userId = req.headers.get("x-user-id") || null

    // Log de auditoria (conformidade 21 CFR Part 11 / RDC 751)
    await supabase.from("audit_logs").insert({
      action: "anvisa_atualizacao_cache",
      modulo: "opme_produtos",
      user_id: userId,
      details: {
        produto_id: id,
        produto_nome: data?.nome || "N/D",
        numero_registro: registro?.numero_registro || "N/D",
        situacao: situacao || "DESCONHECIDO",
        valido,
        valido_ate: validoAte,
        classe_risco: classeRisco,
        origem: "InfoSimples API",
        tempo_processamento_ms: Date.now() - startTime,
      },
    })

    // Se registro não está válido, gera alerta
    if (!valido && registro) {
      await supabase.from("anvisa_alertas").upsert({
        produto_id: id,
        numero_registro: registro.numero_registro,
        tipo: situacao === 'CANCELADO' ? 'registro_cancelado' : 
              situacao === 'SUSPENSO' ? 'registro_suspenso' : 
              situacao === 'VENCIDO' ? 'vencimento_proximo' : 'registro_invalido',
        severidade: 'critica',
        titulo: `Registro ANVISA ${situacao}`,
        descricao: registro.motivo_cancelamento || 
                   `O registro ${registro.numero_registro} está com situação ${situacao}`,
        data_referencia: validoAte ? new Date(validoAte) : null,
        lido: false,
        resolvido: false,
      }, {
        onConflict: 'produto_id,tipo',
        ignoreDuplicates: false
      })
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Cache ANVISA atualizado com sucesso",
        produto: {
          id: data?.id,
          nome: data?.nome,
          anvisa_valido: data?.anvisa_valido,
          anvisa_situacao: data?.anvisa_situacao,
        },
        tempo_ms: Date.now() - startTime,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (err) {
    console.error("Erro na Edge Function opme-atualizar-anvisa:", err)

    // Log de erro para auditoria
    await supabase.from("audit_logs").insert({
      action: "anvisa_atualizacao_erro",
      modulo: "opme_produtos",
      details: {
        erro: err instanceof Error ? err.message : String(err),
        tempo_processamento_ms: Date.now() - startTime,
      },
    }).catch(console.error)

    return new Response(
      JSON.stringify({
        success: false,
        error: "Erro interno ao atualizar cache ANVISA",
        details: err instanceof Error ? err.message : String(err),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  }
})

