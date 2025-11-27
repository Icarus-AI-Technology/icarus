/**
 * ICARUS v5.0 - Hook de Validação ANVISA
 * 
 * Hook React para validação em tempo real de registros ANVISA
 * Integra com InfoSimples API e Dark Glass Medical Design
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { anvisa } from '@/lib/integrations/anvisa'
import type { AnvisaRegistro } from '@/lib/integrations/types'
import { useSupabaseClient } from '@/hooks/useSupabase'

// Re-export types for compatibility
export type SituacaoAnvisa = AnvisaRegistro['situacao']
export type RegistroAnvisa = AnvisaRegistro

// ============================================
// TIPOS
// ============================================

export interface ValidacaoResult {
  valido: boolean
  dados: RegistroAnvisa | null
  erro?: string
}

export interface UseAnvisaOptions {
  cacheAutomatico?: boolean
  moduloOrigem?: string
}

export interface AnvisaStats {
  totalProdutos: number
  verificados: number
  validos: number
  invalidos: number
  pendentes: number
  vencendo30Dias: number
  vencendo90Dias: number
  percentualConformidade: number
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useAnvisa(options: UseAnvisaOptions = {}) {
  const { cacheAutomatico = true, moduloOrigem = 'geral' } = options
  
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [validando, setValidando] = useState<string | null>(null)
  const [ultimaValidacao, setUltimaValidacao] = useState<ValidacaoResult | null>(null)

  /**
   * Valida um registro ANVISA e exibe feedback visual
   */
  const validar = useCallback(async (numeroRegistro: string): Promise<ValidacaoResult> => {
    setLoading(true)
    setValidando(numeroRegistro)
    
    const startTime = Date.now()

    try {
      const resp = await anvisa.validar(numeroRegistro)
      const tempoResposta = Date.now() - startTime

      if (!resp.sucesso || !resp.registro) {
        toast.error('Registro não encontrado na ANVISA', {
          description: resp.mensagem || 'Verifique o número do registro'
        })

        const result: ValidacaoResult = {
          valido: false,
          dados: null,
          erro: resp.mensagem
        }
        setUltimaValidacao(result)
        return result
      }

      const { registro } = resp
      const valido = registro.situacao === 'ATIVO'

      // Feedback visual com toast
      if (valido) {
        if (registro.valido_ate) {
          const dataValidade = new Date(registro.valido_ate)
          const diasRestantes = Math.ceil((dataValidade.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          
          if (diasRestantes <= 30) {
            toast.warning(`Registro ATIVO - Vence em ${diasRestantes} dias`, {
              description: `Válido até ${dataValidade.toLocaleDateString('pt-BR')}`
            })
          } else {
            toast.success(`Registro ATIVO até ${dataValidade.toLocaleDateString('pt-BR')}`, {
              description: `Classe ${registro.classe_risco} • ${registro.titular}`
            })
          }
        } else {
          toast.success('Registro ATIVO (validade indeterminada)', {
            description: `Classe ${registro.classe_risco} • ${registro.titular}`
          })
        }
      } else {
        toast.error(`Registro ${registro.situacao}`, {
          description: registro.motivo_cancelamento || 'Registro não está ativo na ANVISA'
        })
      }

      // Salva log no Supabase
      if (supabase) {
        await supabase.from('anvisa_validacoes_log').insert({
          numero_registro: numeroRegistro,
          sucesso: resp.sucesso,
          situacao: registro.situacao,
          valido,
          valido_ate: registro.valido_ate,
          classe_risco: registro.classe_risco,
          titular: registro.titular,
          nome_comercial: registro.nome_comercial,
          resposta_completa: registro,
          tempo_resposta_ms: tempoResposta,
          modulo_origem: moduloOrigem
        })
      }

      const result: ValidacaoResult = { valido, dados: registro }
      setUltimaValidacao(result)
      return result

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao consultar ANVISA'
      toast.error('Erro na consulta ANVISA', {
        description: errorMsg
      })

      const result: ValidacaoResult = {
        valido: false,
        dados: null,
        erro: errorMsg
      }
      setUltimaValidacao(result)
      return result
    } finally {
      setLoading(false)
      setValidando(null)
    }
  }, [supabase, moduloOrigem])

  /**
   * Valida e atualiza cache no banco de dados
   */
  const validarEAtualizar = useCallback(async (
    produtoId: string,
    numeroRegistro: string
  ): Promise<ValidacaoResult> => {
    const result = await validar(numeroRegistro)

    if (cacheAutomatico && result.dados && supabase) {
      try {
        await supabase.rpc('atualizar_cache_anvisa', {
          p_produto_id: produtoId,
          p_cache: result.dados,
          p_valido: result.valido,
          p_situacao: result.dados.situacao,
          p_valido_ate: result.dados.valido_ate,
          p_classe_risco: result.dados.classe_risco
        })
      } catch (error) {
        console.error('Erro ao atualizar cache ANVISA:', error)
      }
    }

    return result
  }, [validar, cacheAutomatico, supabase])

  /**
   * Busca registros ANVISA por termo
   */
  const buscar = useCallback(async (termo: string) => {
    setLoading(true)
    try {
      const resultado = await anvisa.buscar(termo)
      return resultado.registros
    } catch {
      toast.error('Erro ao buscar registros ANVISA')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Obtém estatísticas de conformidade ANVISA
   */
  const obterEstatisticas = useCallback(async (): Promise<AnvisaStats | null> => {
    if (!supabase) return null

    try {
      const { data, error } = await supabase.rpc('estatisticas_anvisa')
      
      if (error) throw error
      if (!data || data.length === 0) return null

      const stats = data[0]
      return {
        totalProdutos: stats.total_produtos,
        verificados: stats.verificados,
        validos: stats.validos,
        invalidos: stats.invalidos,
        pendentes: stats.pendentes,
        vencendo30Dias: stats.vencendo_30_dias,
        vencendo90Dias: stats.vencendo_90_dias,
        percentualConformidade: stats.percentual_conformidade
      }
    } catch (error) {
      console.error('Erro ao obter estatísticas ANVISA:', error)
      return null
    }
  }, [supabase])

  /**
   * Obtém produtos com registro vencendo
   */
  const obterVencendo = useCallback(async (dias: number = 90) => {
    if (!supabase) return []

    try {
      const { data, error } = await supabase.rpc('verificar_registros_vencendo', {
        p_dias: dias
      })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao obter registros vencendo:', error)
      return []
    }
  }, [supabase])

  /**
   * Obtém alertas não resolvidos
   */
  const obterAlertas = useCallback(async () => {
    if (!supabase) return []

    try {
      const { data, error } = await supabase
        .from('anvisa_alertas')
        .select('*')
        .eq('resolvido', false)
        .order('severidade', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Erro ao obter alertas ANVISA:', error)
      return []
    }
  }, [supabase])

  /**
   * Resolve um alerta
   */
  const resolverAlerta = useCallback(async (alertaId: string) => {
    if (!supabase) return false

    try {
      const { error } = await supabase
        .from('anvisa_alertas')
        .update({
          resolvido: true,
          resolvido_em: new Date().toISOString()
        })
        .eq('id', alertaId)
      
      if (error) throw error
      toast.success('Alerta resolvido')
      return true
    } catch {
      toast.error('Erro ao resolver alerta')
      return false
    }
  }, [supabase])

  // Utilitários do módulo anvisa
  const getStatusColor = anvisa.getStatusColor
  const getClasseRiscoLabel = anvisa.getClasseRiscoLabel
  const formatarNumero = anvisa.formatarNumero

  return {
    // Estados
    loading,
    validando,
    ultimaValidacao,
    
    // Métodos principais
    validar,
    validarEAtualizar,
    buscar,
    
    // Estatísticas e alertas
    obterEstatisticas,
    obterVencendo,
    obterAlertas,
    resolverAlerta,
    
    // Utilitários
    getStatusColor,
    getClasseRiscoLabel,
    formatarNumero
  }
}

export default useAnvisa

