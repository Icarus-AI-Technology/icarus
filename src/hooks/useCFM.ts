/**
 * ICARUS v5.0 - Hook de Validação CFM
 * 
 * Hook React para validação de CRM médico em tempo real
 * Integra com InfoSimples API e Dark Glass Medical Design
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { cfm } from '@/lib/integrations/brasil-apis'
import type { CfmMedico } from '@/lib/integrations/types'
import { useSupabaseClient } from '@/hooks/useSupabase'

// Re-export types for compatibility
export type SituacaoCRM = CfmMedico['situacao']
export type RegistroCRM = CfmMedico
export interface MedicoInfo {
  crm: string
  uf: string
  nomeCompleto: string
  ativo: boolean
  situacao: SituacaoCRM
  especialidades: string[]
  dataVerificacao: Date
}

// ============================================
// TIPOS
// ============================================

export interface ValidacaoCRMResult {
  valido: boolean
  dados: RegistroCRM | null
  erro?: string
}

export interface UseCFMOptions {
  cacheAutomatico?: boolean
  moduloOrigem?: string
}

// ============================================
// HOOK PRINCIPAL
// ============================================

export function useCFM(options: UseCFMOptions = {}) {
  const { cacheAutomatico = true, moduloOrigem = 'medicos' } = options
  
  const supabase = useSupabaseClient()
  const [loading, setLoading] = useState(false)
  const [validando, setValidando] = useState<string | null>(null)
  const [ultimaValidacao, setUltimaValidacao] = useState<ValidacaoCRMResult | null>(null)

  /**
   * Valida um CRM e exibe feedback visual
   */
  const validar = useCallback(async (crm: string, uf: string): Promise<ValidacaoCRMResult> => {
    setLoading(true)
    setValidando(`${crm}/${uf}`)
    
    const startTime = Date.now()

    try {
      const medico = await cfm.consultarCrm(crm, uf)
      const tempoResposta = Date.now() - startTime

      if (!medico || medico.situacao === 'NAO_ENCONTRADO') {
        toast.error('CRM não encontrado no CFM', {
          description: 'Verifique o número e a UF'
        })

        const result: ValidacaoCRMResult = {
          valido: false,
          dados: null,
          erro: 'CRM não encontrado'
        }
        setUltimaValidacao(result)
        return result
      }

      const valido = medico.situacao === 'ATIVO'

      // Feedback visual com toast
      if (valido) {
        const especialidades = medico.especialidades?.join(', ') || ''
        toast.success(`CRM ATIVO - ${medico.nome}`, {
          description: especialidades || 'Médico generalista'
        })
      } else {
        toast.error(`CRM ${medico.situacao}`, {
          description: `${medico.nome} não pode atuar`
        })
      }

      // Salva log no Supabase
      if (supabase) {
        await supabase.from('cfm_validacoes_log').insert({
          crm,
          uf: uf.toUpperCase(),
          sucesso: true,
          situacao: medico.situacao,
          valido,
          nome_medico: medico.nome,
          especialidades: medico.especialidades,
          resposta_completa: medico,
          tempo_resposta_ms: tempoResposta,
          modulo_origem: moduloOrigem
        }).catch(console.error) // Não bloqueia se log falhar
      }

      const result: ValidacaoCRMResult = { valido, dados: medico }
      setUltimaValidacao(result)
      return result

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erro ao consultar CFM'
      toast.error('Erro na consulta CFM', {
        description: errorMsg
      })

      const result: ValidacaoCRMResult = {
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
   * Valida e atualiza cache no banco de dados (tabela medicos)
   */
  const validarEAtualizar = useCallback(async (
    medicoId: string,
    crm: string,
    uf: string
  ): Promise<ValidacaoCRMResult> => {
    const result = await validar(crm, uf)

    if (cacheAutomatico && result.dados && supabase) {
      try {
        await supabase
          .from('medicos')
          .update({
            cfm_cache: result.dados,
            cfm_valido: result.valido,
            cfm_situacao: result.dados.situacao,
            cfm_verificado_em: new Date().toISOString(),
            nome: result.dados.nome,
            especialidades: result.dados.especialidades || []
          })
          .eq('id', medicoId)
      } catch (error) {
        console.error('Erro ao atualizar cache CFM:', error)
      }
    }

    return result
  }, [validar, cacheAutomatico, supabase])

  /**
   * Verifica se CRM pode operar/prescrever
   */
  const verificarPermissao = useCallback(async (crm: string, uf: string): Promise<{
    podeAtuar: boolean
    motivo: string
    medico?: MedicoInfo
  }> => {
    const info = await cfm.verificarAtivo(crm, uf)
    
    if (!info.medico) {
      return {
        podeAtuar: false,
        motivo: 'CRM não encontrado no CFM'
      }
    }

    if (!info.ativo) {
      return {
        podeAtuar: false,
        motivo: `CRM com situação ${info.medico.situacao} - Não autorizado a atuar`,
        medico: {
          crm: info.medico.crm,
          uf: info.medico.uf,
          nomeCompleto: info.medico.nome,
          ativo: info.ativo,
          situacao: info.medico.situacao,
          especialidades: info.medico.especialidades || [],
          dataVerificacao: new Date()
        }
      }
    }

    return {
      podeAtuar: true,
      motivo: 'CRM ativo e regular no CFM',
      medico: {
        crm: info.medico.crm,
        uf: info.medico.uf,
        nomeCompleto: info.medico.nome,
        ativo: info.ativo,
        situacao: info.medico.situacao,
        especialidades: info.medico.especialidades || [],
        dataVerificacao: new Date()
      }
    }
  }, [])

  // Utilitários
  const getStatusColor = (situacao: SituacaoCRM): string => {
    const cores: Record<string, string> = {
      'ATIVO': '#10B981',
      'INATIVO': '#F59E0B',
      'SUSPENSO': '#EF4444',
      'CASSADO': '#EF4444',
      'CANCELADO': '#EF4444',
      'FALECIDO': '#64748B',
      'NAO_ENCONTRADO': '#64748B'
    }
    return cores[situacao] || cores.NAO_ENCONTRADO
  }

  const formatarCRM = (crm: string, uf: string): string => {
    return `CRM/${uf.toUpperCase()} ${crm.replace(/\D/g, '')}`
  }

  const podeAtuar = (situacao: SituacaoCRM): boolean => {
    return situacao === 'ATIVO'
  }

  return {
    // Estados
    loading,
    validando,
    ultimaValidacao,
    
    // Métodos principais
    validar,
    validarEAtualizar,
    verificarPermissao,
    
    // Utilitários
    getStatusColor,
    formatarCRM,
    podeAtuar
  }
}

export default useCFM

