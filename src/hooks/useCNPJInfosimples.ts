/**
 * Hook para consulta de CNPJ via Infosimples API
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Auto-preenche dados de fornecedores, clientes e hospitais
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

interface CNPJData {
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

interface UseCNPJInfosimplesReturn {
  search: (cnpj: string) => Promise<CNPJData | null>
  data: CNPJData | null
  isLoading: boolean
  error: string | null
  reset: () => void
}

export function useCNPJInfosimples(): UseCNPJInfosimplesReturn {
  const [data, setData] = useState<CNPJData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (cnpj: string): Promise<CNPJData | null> => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) {
      setError('CNPJ deve ter 14 dígitos')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/infosimples/cnpj?cnpj=${cnpjLimpo}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao consultar CNPJ')
      }

      const result = await response.json()
      
      if (result.situacao !== 'ATIVA') {
        toast.warning('Atenção', {
          description: `CNPJ com situação: ${result.situacao}`,
        })
      }

      setData(result)
      toast.success('CNPJ encontrado!', {
        description: result.razao_social,
      })
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      toast.error('Erro na consulta', { description: message })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { search, data, isLoading, error, reset }
}

/**
 * Hook para consulta de CRM via Infosimples/CFM
 */
interface MedicoData {
  nome: string
  crm: string
  uf: string
  especialidade: string
  situacao: string
  inscricao_data: string
}

export function useCFMInfosimples() {
  const [data, setData] = useState<MedicoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (crm: string, uf: string): Promise<MedicoData | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/infosimples/cfm?crm=${crm}&uf=${uf}`)
      
      if (!response.ok) {
        throw new Error('Médico não encontrado')
      }

      const result = await response.json()
      setData(result)
      toast.success('Médico encontrado!', { description: result.nome })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      toast.error('Erro na consulta CFM', { description: message })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { search, data, isLoading, error }
}

/**
 * Hook para consulta de Registro ANVISA
 */
interface ANVISAData {
  registro: string
  produto: string
  empresa: string
  classe_risco: 'I' | 'II' | 'III' | 'IV'
  situacao: string
  validade: string
  processo: string
}

export function useANVISAInfosimples() {
  const [data, setData] = useState<ANVISAData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (registro: string): Promise<ANVISAData | null> => {
    const registroLimpo = registro.replace(/\D/g, '')
    
    if (registroLimpo.length !== 13) {
      setError('Registro ANVISA deve ter 13 dígitos')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/infosimples/anvisa?registro=${registroLimpo}`)
      
      if (!response.ok) {
        throw new Error('Registro não encontrado')
      }

      const result = await response.json()
      
      if (result.situacao !== 'VÁLIDO') {
        toast.warning('Atenção ANVISA', {
          description: `Registro com situação: ${result.situacao}`,
        })
      }

      setData(result)
      toast.success('Registro ANVISA válido!', { description: result.produto })
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)
      toast.error('Erro na consulta ANVISA', { description: message })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { search, data, isLoading, error }
}

