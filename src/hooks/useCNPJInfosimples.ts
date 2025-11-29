/**
 * Hooks para consulta de dados cadastrais via APIs Públicas
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * 
 * APIs utilizadas (verificadas via MCP EXA 2024-11-29):
 * 
 * CNPJ:
 * - CNPJA Open API - https://open.cnpja.com (gratuita, sem autenticação)
 * - BrasilAPI - https://brasilapi.com.br (gratuita, sem autenticação)
 * 
 * CFM/CRM:
 * - Infosimples CFM - https://infosimples.com/consultas/cfm-cadastro/ (PAGA)
 * - Portal CFM - https://portal.cfm.org.br/busca-medicos/ (manual)
 * 
 * ANVISA:
 * - Portal ANVISA - https://consultas.anvisa.gov.br/#/saude/ (manual)
 */

import { useState, useCallback } from 'react'
import { toast } from 'sonner'

// ==================== CNPJ ====================

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

/**
 * Normaliza resposta da CNPJA Open API para formato padrão
 */
function normalizeCNPJAResponse(data: Record<string, unknown>): CNPJData {
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
 * Normaliza resposta da BrasilAPI para formato padrão
 */
function normalizeBrasilAPIResponse(data: Record<string, unknown>): CNPJData {
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

export function useCNPJInfosimples(): UseCNPJInfosimplesReturn {
  const [data, setData] = useState<CNPJData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (cnpj: string): Promise<CNPJData | null> => {
    const cnpjLimpo = cnpj.replace(/\D/g, '')
    
    if (cnpjLimpo.length !== 14) {
      setError('CNPJ deve ter 14 dígitos')
      toast.error('CNPJ inválido', { description: 'CNPJ deve ter 14 dígitos' })
      return null
    }

    setIsLoading(true)
    setError(null)

    // Tentar CNPJA Open API primeiro (mais completa e rápida)
    try {
      const cnpjaResponse = await fetch(`https://open.cnpja.com/office/${cnpjLimpo}`, {
        headers: { 'Accept': 'application/json' }
      })
      
      if (cnpjaResponse.ok) {
        const cnpjaData = await cnpjaResponse.json()
        const normalizedData = normalizeCNPJAResponse(cnpjaData)
        
        if (normalizedData.situacao !== 'ATIVA' && normalizedData.situacao !== 'Ativa') {
          toast.warning('Atenção', {
            description: `CNPJ com situação: ${normalizedData.situacao}`,
          })
        }

        setData(normalizedData)
        toast.success('CNPJ encontrado!', {
          description: normalizedData.razao_social,
        })
        
        return normalizedData
      }
    } catch {
      console.warn('CNPJA API falhou, tentando BrasilAPI...')
    }

    // Fallback para BrasilAPI
    try {
      const brasilResponse = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`)
      
      if (brasilResponse.ok) {
        const brasilData = await brasilResponse.json()
        const normalizedData = normalizeBrasilAPIResponse(brasilData)
        
        if (!normalizedData.situacao.includes('ATIVA')) {
          toast.warning('Atenção', {
            description: `CNPJ com situação: ${normalizedData.situacao}`,
          })
        }

        setData(normalizedData)
        toast.success('CNPJ encontrado!', {
          description: normalizedData.razao_social,
        })
        
        return normalizedData
      }
      
      throw new Error('CNPJ não encontrado nas bases públicas')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao consultar CNPJ'
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

// ==================== CFM/CRM ====================

interface MedicoData {
  nome: string
  crm: string
  uf: string
  especialidade: string
  situacao: string
  inscricao_data: string
}

// Estados brasileiros válidos
const ESTADOS_VALIDOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

export function useCFMInfosimples() {
  const [data, setData] = useState<MedicoData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (crm: string, uf: string): Promise<MedicoData | null> => {
    setIsLoading(true)
    setError(null)

    // Validação do UF
    const ufUpper = uf.toUpperCase()
    if (!ESTADOS_VALIDOS.includes(ufUpper as typeof ESTADOS_VALIDOS[number])) {
      setError('UF inválido')
      toast.error('UF inválido', { description: 'Selecione um estado válido' })
      setIsLoading(false)
      return null
    }

    // Validação do CRM (4-8 dígitos)
    const crmLimpo = crm.replace(/\D/g, '')
    if (crmLimpo.length < 4 || crmLimpo.length > 8) {
      setError('CRM deve ter entre 4 e 8 dígitos')
      toast.error('CRM inválido', { description: 'CRM deve ter entre 4 e 8 dígitos' })
      setIsLoading(false)
      return null
    }

    try {
      // Tentar Edge Function do Supabase (Infosimples CFM)
      // Endpoint: supabase functions/infosimples-cfm
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
      const response = await fetch(`${supabaseUrl}/functions/v1/infosimples-cfm?crm=${crmLimpo}&uf=${ufUpper}`)
      
      if (response.ok) {
        const result = await response.json()
        const medicoData: MedicoData = {
          nome: result.nome || result.nome_razao_social || '',
          crm: crmLimpo,
          uf: ufUpper,
          especialidade: result.especialidade || result.especialidades || '',
          situacao: result.situacao || 'ATIVO',
          inscricao_data: result.inscricao_data || result.normalizado_inscricao_data || '',
        }
        
        setData(medicoData)
        toast.success('Médico encontrado!', { description: medicoData.nome })
        return medicoData
      }
    } catch {
      console.warn('API CFM não disponível, usando fallback...')
    }

    // Fallback: Mostrar link para consulta manual no portal CFM
    const cfmUrl = `https://portal.cfm.org.br/busca-medicos/?uf=${ufUpper}&crm=${crmLimpo}`
    
    toast.info('Consulta CFM', {
      description: `Para verificar o CRM ${ufUpper}-${crmLimpo}, acesse o portal oficial do CFM.`,
      action: {
        label: 'Abrir Portal',
        onClick: () => window.open(cfmUrl, '_blank'),
      },
      duration: 10000,
    })

    // Retorna dados parciais para preenchimento manual
    const placeholderData: MedicoData = {
      nome: '',
      crm: crmLimpo,
      uf: ufUpper,
      especialidade: '',
      situacao: 'Verificar no portal CFM',
      inscricao_data: '',
    }

    setData(placeholderData)
    setIsLoading(false)
    
    return placeholderData
  }, [])

  /**
   * Abre o portal CFM em nova aba
   */
  const openCFMPortal = useCallback((crm: string, uf: string) => {
    const crmLimpo = crm.replace(/\D/g, '')
    const url = `https://portal.cfm.org.br/busca-medicos/?uf=${uf.toUpperCase()}&crm=${crmLimpo}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  return { search, data, isLoading, error, openCFMPortal }
}

// ==================== ANVISA ====================

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
    
    // Validação: Registro ANVISA tem 13 dígitos
    if (registroLimpo.length !== 13) {
      setError('Registro ANVISA deve ter 13 dígitos')
      toast.error('Registro inválido', { description: 'Registro ANVISA deve ter 13 dígitos' })
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      // Tentar API via Edge Function do Supabase (se configurada com Infosimples)
      const response = await fetch(`/api/anvisa/consultar?registro=${registroLimpo}`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.situacao !== 'VÁLIDO' && result.situacao !== 'Válido') {
          toast.warning('Atenção ANVISA', {
            description: `Registro com situação: ${result.situacao}`,
          })
        }

        setData(result)
        toast.success('Registro ANVISA válido!', { description: result.produto })
        return result
      }
    } catch {
      console.warn('API ANVISA não disponível, usando fallback...')
    }

    // Fallback: Mostrar link para consulta manual no portal ANVISA
    const anvisaUrl = `https://consultas.anvisa.gov.br/#/saude/`
    
    toast.info('Consulta ANVISA', {
      description: `Para verificar o registro ${registroLimpo}, acesse o portal oficial da ANVISA.`,
      action: {
        label: 'Abrir Portal',
        onClick: () => window.open(anvisaUrl, '_blank'),
      },
      duration: 10000,
    })

    // Retorna dados parciais para preenchimento manual
    const placeholderData: ANVISAData = {
      registro: registroLimpo,
      produto: '',
      empresa: '',
      classe_risco: 'I',
      situacao: 'Verificar no portal ANVISA',
      validade: '',
      processo: '',
    }

    setData(placeholderData)
    setIsLoading(false)
    
    return placeholderData
  }, [])

  /**
   * Abre o portal ANVISA em nova aba
   */
  const openANVISAPortal = useCallback(() => {
    window.open('https://consultas.anvisa.gov.br/#/saude/', '_blank', 'noopener,noreferrer')
  }, [])

  return { search, data, isLoading, error, openANVISAPortal }
}
