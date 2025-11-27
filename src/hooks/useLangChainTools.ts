/**
 * ICARUS v5.0 - Hook de Integração LangChain
 * 
 * Conecta o frontend com as Edge Functions de IA:
 * - Busca semântica no catálogo médico
 * - Agente reativo com ferramentas
 * - Extração de NF-e
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

import { useState, useCallback } from 'react'
import { useSupabaseClient } from './useSupabase'

// ============ TIPOS ============

export interface SearchResult {
  id: string
  nome: string
  descricao: string
  codigo_anvisa: string
  fabricante: string
  classe_risco: string
  similarity: number
  estoque_disponivel?: number
  preco_unitario?: number
}

export interface AgentResponse {
  success: boolean
  resposta: string
  ferramentas_usadas: string[]
  dados_estruturados?: Record<string, unknown>
  error?: string
}

export interface NFEExtracao {
  numero_nfe: string
  serie: string
  data_emissao: string
  emitente: {
    cnpj: string
    razao_social: string
  }
  destinatario: {
    cnpj: string
    razao_social: string
  }
  itens: NFEItem[]
  total: {
    valor_nfe: number
    valor_icms: number
    valor_produtos: number
  }
  confianca: number
  metodo_extracao: 'xml' | 'vision' | 'ocr'
}

export interface NFEItem {
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

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  tools_used?: string[]
  structured_data?: Record<string, unknown>
}

// ============ HOOK PRINCIPAL ============

export function useLangChainTools() {
  const supabase = useSupabaseClient()
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])

  /**
   * Busca semântica no catálogo de produtos médicos
   */
  const searchCatalog = useCallback(async (
    query: string,
    options?: {
      limit?: number
      threshold?: number
      anvisaValido?: boolean
      classeRisco?: ('I' | 'II' | 'III' | 'IV')[]
      vencimentoApos?: string
    }
  ): Promise<SearchResult[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('semantic-search', {
        body: {
          query,
          match_count: options?.limit || 10,
          match_threshold: options?.threshold || 0.6,
          filtro_anvisa_valido: options?.anvisaValido,
          filtro_classe_risco: options?.classeRisco,
          filtro_vencimento_apos: options?.vencimentoApos
        }
      })

      if (fnError) throw fnError

      return data?.resultados || []
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na busca semântica'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  /**
   * Envia mensagem para o agente reativo com ferramentas
   */
  const sendToAgent = useCallback(async (
    mensagem: string,
    contexto?: Record<string, unknown>
  ): Promise<AgentResponse> => {
    setLoading(true)
    setError(null)

    // Adiciona mensagem do usuário ao histórico
    const userMessage: ChatMessage = {
      role: 'user',
      content: mensagem,
      timestamp: new Date()
    }
    setChatHistory(prev => [...prev, userMessage])

    try {
      const { data, error: fnError } = await supabase.functions.invoke('langchain-agent', {
        body: {
          mensagem,
          usuario_id: (await supabase.auth.getUser()).data.user?.id,
          contexto
        }
      })

      if (fnError) throw fnError

      // Adiciona resposta do assistente ao histórico
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data?.resposta || 'Sem resposta',
        timestamp: new Date(),
        tools_used: data?.ferramentas_usadas,
        structured_data: data?.dados_estruturados
      }
      setChatHistory(prev => [...prev, assistantMessage])

      return {
        success: true,
        resposta: data?.resposta || '',
        ferramentas_usadas: data?.ferramentas_usadas || [],
        dados_estruturados: data?.dados_estruturados
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao processar mensagem'
      setError(message)

      // Adiciona mensagem de erro ao histórico
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `Erro: ${message}`,
        timestamp: new Date()
      }
      setChatHistory(prev => [...prev, errorMessage])

      return {
        success: false,
        resposta: '',
        ferramentas_usadas: [],
        error: message
      }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  /**
   * Extrai dados de NF-e (XML, PDF ou imagem)
   */
  const extractNFE = useCallback(async (
    file: File
  ): Promise<NFEExtracao | null> => {
    setLoading(true)
    setError(null)

    try {
      // Determina o tipo de arquivo
      let tipo: 'xml' | 'pdf' | 'imagem'
      if (file.name.endsWith('.xml') || file.type === 'text/xml' || file.type === 'application/xml') {
        tipo = 'xml'
      } else if (file.type === 'application/pdf') {
        tipo = 'pdf'
      } else if (file.type.startsWith('image/')) {
        tipo = 'imagem'
      } else {
        throw new Error('Tipo de arquivo não suportado. Use XML, PDF ou imagem.')
      }

      // Lê o arquivo
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (tipo === 'xml') {
            resolve(reader.result as string)
          } else {
            // Para PDF e imagem, usa base64
            const base64 = (reader.result as string).split(',')[1]
            resolve(base64)
          }
        }
        reader.onerror = reject
        
        if (tipo === 'xml') {
          reader.readAsText(file)
        } else {
          reader.readAsDataURL(file)
        }
      })

      const { data, error: fnError } = await supabase.functions.invoke('extract-nfe', {
        body: {
          tipo,
          conteudo: content,
          nome_arquivo: file.name
        }
      })

      if (fnError) throw fnError

      return data?.extracao || null
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro na extração de NF-e'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  /**
   * Consulta estoque disponível por região
   */
  const checkStock = useCallback(async (
    produtoId?: string,
    regiao?: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul'
  ) => {
    return sendToAgent(
      `Qual o estoque disponível${produtoId ? ` do produto ${produtoId}` : ''}${regiao ? ` na região ${regiao}` : ''}?`,
      { tool_hint: 'estoque_disponivel' }
    )
  }, [sendToAgent])

  /**
   * Verifica lotes próximos do vencimento
   */
  const checkExpiration = useCallback(async (
    produtoId?: string,
    vencimentoMinimo?: string
  ) => {
    return sendToAgent(
      `Quais lotes estão próximos do vencimento${produtoId ? ` para o produto ${produtoId}` : ''}${vencimentoMinimo ? ` com validade após ${vencimentoMinimo}` : ''}?`,
      { tool_hint: 'previsao_vencimento_lote' }
    )
  }, [sendToAgent])

  /**
   * Verifica cirurgias agendadas
   */
  const checkSurgeries = useCallback(async (
    data?: string,
    hospital?: string,
    procedimento?: string
  ) => {
    const filters = []
    if (data) filters.push(`na data ${data}`)
    if (hospital) filters.push(`no hospital ${hospital}`)
    if (procedimento) filters.push(`do tipo ${procedimento}`)
    
    return sendToAgent(
      `Quais cirurgias estão agendadas${filters.length ? ' ' + filters.join(', ') : ''}?`,
      { tool_hint: 'verificar_cirurgia_agendada' }
    )
  }, [sendToAgent])

  /**
   * Rastreia histórico de lote
   */
  const traceLot = useCallback(async (
    numeroLote: string
  ) => {
    return sendToAgent(
      `Mostre a rastreabilidade completa do lote ${numeroLote}`,
      { tool_hint: 'rastreabilidade_lote' }
    )
  }, [sendToAgent])

  /**
   * Limpa histórico de chat
   */
  const clearHistory = useCallback(() => {
    setChatHistory([])
  }, [])

  return {
    // Estado
    loading,
    error,
    chatHistory,
    
    // Métodos principais
    searchCatalog,
    sendToAgent,
    extractNFE,
    
    // Atalhos para ferramentas
    checkStock,
    checkExpiration,
    checkSurgeries,
    traceLot,
    
    // Utilitários
    clearHistory,
    setError
  }
}

// ============ HOOK SIMPLIFICADO PARA CHAT ============

export function useChatWithTools() {
  const {
    loading,
    error,
    chatHistory,
    sendToAgent,
    clearHistory
  } = useLangChainTools()

  const [input, setInput] = useState('')

  const sendMessage = useCallback(async (message?: string) => {
    const msg = message || input
    if (!msg.trim() || loading) return null

    setInput('')
    return sendToAgent(msg)
  }, [input, loading, sendToAgent])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }, [sendMessage])

  return {
    input,
    setInput,
    loading,
    error,
    chatHistory,
    sendMessage,
    handleKeyDown,
    clearHistory
  }
}

export default useLangChainTools

