/**
 * ICARUS v5.0 - Compliance Hooks
 * 
 * React hooks para funcionalidades de compliance.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/config/supabase-client'
import { toast } from 'sonner'

import {
  checkAnvisaCompliance,
  type AnvisaRegistration,
  type TraceabilityRecord,
  type AdverseEvent,
  type AnvisaComplianceResult
} from './anvisa'

import {
  assessISO42001Compliance,
  type AISystem,
  type AIControl,
  type AIAudit,
  type ISO42001ComplianceResult
} from './iso-42001'

import {
  assessLGPDCompliance,
  type Consent,
  type DataSubjectRequest,
  type DataProcessingActivity,
  type DataBreach,
  type LGPDComplianceResult
} from './lgpd'

import {
  isValidCPF,
  isValidCNPJ,
  isValidCRM,
  isValidAnvisaRegistration,
  isValidEmail,
  isValidPhone,
  isValidCEP,
  formatCPF,
  formatCNPJ,
  formatCRM,
  formatPhone,
  formatCEP
} from './validators'

// ============ ANVISA COMPLIANCE HOOK ============

export interface UseAnvisaComplianceResult {
  compliance: AnvisaComplianceResult | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useAnvisaCompliance(
  registration: AnvisaRegistration | null,
  traceabilityRecords: TraceabilityRecord[]
): UseAnvisaComplianceResult {
  const [compliance, setCompliance] = useState<AnvisaComplianceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkCompliance = useCallback(async () => {
    if (!registration) {
      setCompliance(null)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await checkAnvisaCompliance(registration, traceabilityRecords)
      setCompliance(result)
    } catch (e) {
      setError(e as Error)
      toast.error('Erro ao verificar conformidade ANVISA')
    } finally {
      setIsLoading(false)
    }
  }, [registration, traceabilityRecords])

  useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  return {
    compliance,
    isLoading,
    error,
    refresh: checkCompliance
  }
}

// ============ ISO 42001 COMPLIANCE HOOK ============

export interface UseISO42001ComplianceResult {
  compliance: ISO42001ComplianceResult | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useISO42001Compliance(
  aiSystems: AISystem[],
  controls: AIControl[],
  audits: AIAudit[]
): UseISO42001ComplianceResult {
  const [compliance, setCompliance] = useState<ISO42001ComplianceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkCompliance = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await assessISO42001Compliance(aiSystems, controls, audits)
      setCompliance(result)
    } catch (e) {
      setError(e as Error)
      toast.error('Erro ao verificar conformidade ISO 42001')
    } finally {
      setIsLoading(false)
    }
  }, [aiSystems, controls, audits])

  useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  return {
    compliance,
    isLoading,
    error,
    refresh: checkCompliance
  }
}

// ============ LGPD COMPLIANCE HOOK ============

export interface UseLGPDComplianceResult {
  compliance: LGPDComplianceResult | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useLGPDCompliance(
  consents: Consent[],
  requests: DataSubjectRequest[],
  activities: DataProcessingActivity[],
  breaches: DataBreach[]
): UseLGPDComplianceResult {
  const [compliance, setCompliance] = useState<LGPDComplianceResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const checkCompliance = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await assessLGPDCompliance(consents, requests, activities, breaches)
      setCompliance(result)
    } catch (e) {
      setError(e as Error)
      toast.error('Erro ao verificar conformidade LGPD')
    } finally {
      setIsLoading(false)
    }
  }, [consents, requests, activities, breaches])

  useEffect(() => {
    checkCompliance()
  }, [checkCompliance])

  return {
    compliance,
    isLoading,
    error,
    refresh: checkCompliance
  }
}

// ============ VALIDATION HOOK ============

export type ValidationType = 'cpf' | 'cnpj' | 'crm' | 'anvisa' | 'email' | 'phone' | 'cep'

export interface UseValidationResult {
  value: string
  formattedValue: string
  isValid: boolean | null
  error: string | null
  onChange: (value: string) => void
  validate: () => boolean
  reset: () => void
}

export function useValidation(
  type: ValidationType,
  initialValue: string = ''
): UseValidationResult {
  const [value, setValue] = useState(initialValue)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validators: Record<ValidationType, (v: string) => boolean> = {
    cpf: isValidCPF,
    cnpj: isValidCNPJ,
    crm: isValidCRM,
    anvisa: isValidAnvisaRegistration,
    email: isValidEmail,
    phone: isValidPhone,
    cep: isValidCEP
  }

  const formatters: Record<ValidationType, (v: string) => string> = {
    cpf: formatCPF,
    cnpj: formatCNPJ,
    crm: formatCRM,
    anvisa: (v) => v,
    email: (v) => v.toLowerCase(),
    phone: formatPhone,
    cep: formatCEP
  }

  const errorMessages: Record<ValidationType, string> = {
    cpf: 'CPF inválido',
    cnpj: 'CNPJ inválido',
    crm: 'CRM inválido (formato: UF123456)',
    anvisa: 'Registro ANVISA inválido (11 dígitos)',
    email: 'Email inválido',
    phone: 'Telefone inválido',
    cep: 'CEP inválido (8 dígitos)'
  }

  const formattedValue = useMemo(() => {
    return formatters[type](value)
  }, [value, type])

  const onChange = useCallback((newValue: string) => {
    setValue(newValue)
    setIsValid(null)
    setError(null)
  }, [])

  const validate = useCallback(() => {
    const validator = validators[type]
    const valid = validator(value)
    setIsValid(valid)
    setError(valid ? null : errorMessages[type])
    return valid
  }, [value, type])

  const reset = useCallback(() => {
    setValue('')
    setIsValid(null)
    setError(null)
  }, [])

  return {
    value,
    formattedValue,
    isValid,
    error,
    onChange,
    validate,
    reset
  }
}

// ============ CONSENT MANAGEMENT HOOK ============

export interface UseConsentManagementResult {
  consents: Consent[]
  isLoading: boolean
  error: Error | null
  createConsent: (consent: Omit<Consent, 'id'>) => Promise<void>
  revokeConsent: (consentId: string) => Promise<void>
  refreshConsents: () => void
}

export function useConsentManagement(dataSubjectId?: string): UseConsentManagementResult {
  const queryClient = useQueryClient()

  const { data: consents = [], isLoading, error, refetch } = useQuery({
    queryKey: ['consents', dataSubjectId],
    queryFn: async () => {
      let query = supabase.from('consents').select('*')
      
      if (dataSubjectId) {
        query = query.eq('data_subject_id', dataSubjectId)
      }
      
      const { data, error } = await query.order('consented_at', { ascending: false })
      
      if (error) throw error
      return data as Consent[]
    },
    enabled: true
  })

  const createMutation = useMutation({
    mutationFn: async (consent: Omit<Consent, 'id'>) => {
      const { data, error } = await supabase
        .from('consents')
        .insert(consent)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] })
      toast.success('Consentimento registrado com sucesso')
    },
    onError: (error) => {
      toast.error(`Erro ao registrar consentimento: ${error.message}`)
    }
  })

  const revokeMutation = useMutation({
    mutationFn: async (consentId: string) => {
      const { error } = await supabase
        .from('consents')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString()
        })
        .eq('id', consentId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] })
      toast.success('Consentimento revogado com sucesso')
    },
    onError: (error) => {
      toast.error(`Erro ao revogar consentimento: ${error.message}`)
    }
  })

  return {
    consents,
    isLoading,
    error: error as Error | null,
    createConsent: createMutation.mutateAsync,
    revokeConsent: revokeMutation.mutateAsync,
    refreshConsents: refetch
  }
}

// ============ DATA SUBJECT REQUESTS HOOK ============

export interface UseDataSubjectRequestsResult {
  requests: DataSubjectRequest[]
  pendingCount: number
  overdueCount: number
  isLoading: boolean
  error: Error | null
  createRequest: (request: Omit<DataSubjectRequest, 'id'>) => Promise<void>
  updateRequest: (requestId: string, updates: Partial<DataSubjectRequest>) => Promise<void>
  refreshRequests: () => void
}

export function useDataSubjectRequests(dataSubjectId?: string): UseDataSubjectRequestsResult {
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading, error, refetch } = useQuery({
    queryKey: ['data_subject_requests', dataSubjectId],
    queryFn: async () => {
      let query = supabase.from('data_subject_requests').select('*')
      
      if (dataSubjectId) {
        query = query.eq('data_subject_id', dataSubjectId)
      }
      
      const { data, error } = await query.order('requested_at', { ascending: false })
      
      if (error) throw error
      return data as DataSubjectRequest[]
    },
    enabled: true
  })

  const pendingCount = useMemo(() => {
    return requests.filter(r => r.status === 'pending' || r.status === 'in_progress').length
  }, [requests])

  const overdueCount = useMemo(() => {
    return requests.filter(r => {
      if (r.status === 'completed' || r.status === 'rejected') return false
      return new Date(r.deadline) < new Date()
    }).length
  }, [requests])

  const createMutation = useMutation({
    mutationFn: async (request: Omit<DataSubjectRequest, 'id'>) => {
      const { data, error } = await supabase
        .from('data_subject_requests')
        .insert(request)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data_subject_requests'] })
      toast.success('Solicitação registrada com sucesso')
    },
    onError: (error) => {
      toast.error(`Erro ao registrar solicitação: ${error.message}`)
    }
  })

  const updateMutation = useMutation({
    mutationFn: async ({ requestId, updates }: { requestId: string; updates: Partial<DataSubjectRequest> }) => {
      const { error } = await supabase
        .from('data_subject_requests')
        .update(updates)
        .eq('id', requestId)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data_subject_requests'] })
      toast.success('Solicitação atualizada com sucesso')
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar solicitação: ${error.message}`)
    }
  })

  return {
    requests,
    pendingCount,
    overdueCount,
    isLoading,
    error: error as Error | null,
    createRequest: createMutation.mutateAsync,
    updateRequest: (requestId, updates) => updateMutation.mutateAsync({ requestId, updates }),
    refreshRequests: refetch
  }
}

// ============ COMPLIANCE DASHBOARD HOOK ============

export interface ComplianceDashboardData {
  anvisa: {
    score: number
    status: 'compliant' | 'partial' | 'non_compliant'
    alerts: number
  }
  iso42001: {
    score: number
    status: 'compliant' | 'partial' | 'non_compliant'
    alerts: number
  }
  lgpd: {
    score: number
    status: 'compliant' | 'partial' | 'non_compliant'
    alerts: number
  }
  overall: {
    score: number
    status: 'compliant' | 'partial' | 'non_compliant'
    totalAlerts: number
  }
}

export interface UseComplianceDashboardResult {
  data: ComplianceDashboardData | null
  isLoading: boolean
  error: Error | null
  refresh: () => void
}

export function useComplianceDashboard(): UseComplianceDashboardResult {
  const [data, setData] = useState<ComplianceDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Em produção, isso buscaria dados reais do Supabase
      // Por enquanto, retorna dados mock
      const mockData: ComplianceDashboardData = {
        anvisa: {
          score: 92,
          status: 'compliant',
          alerts: 3
        },
        iso42001: {
          score: 85,
          status: 'partial',
          alerts: 5
        },
        lgpd: {
          score: 88,
          status: 'partial',
          alerts: 2
        },
        overall: {
          score: 88,
          status: 'partial',
          totalAlerts: 10
        }
      }

      setData(mockData)
    } catch (e) {
      setError(e as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  return {
    data,
    isLoading,
    error,
    refresh: fetchDashboardData
  }
}

// ============ EXPORTS ============

export default {
  useAnvisaCompliance,
  useISO42001Compliance,
  useLGPDCompliance,
  useValidation,
  useConsentManagement,
  useDataSubjectRequests,
  useComplianceDashboard
}

