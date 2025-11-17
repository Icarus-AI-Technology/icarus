import { useState } from 'react'
import { useSupabase } from './useSupabase'

export interface LeadFormData {
  nome: string
  empresa: string
  email: string
  telefone: string
  cargo: string
  numeroColaboradores: string
  principalDesafio: string
  interesseIA: string
  mensagem?: string
}

export interface LeadData extends LeadFormData {
  status?: string
  origem?: string
  user_agent?: string
  ip_address?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
}

export function useLeads() {
  const { supabase } = useSupabase()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createLead = async (formData: LeadFormData): Promise<boolean> => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Get URL parameters for UTM tracking
      const urlParams = new URLSearchParams(window.location.search)
      
      // Prepare lead data with metadata
      const leadData: LeadData = {
        ...formData,
        numero_colaboradores: formData.numeroColaboradores,
        principal_desafio: formData.principalDesafio,
        interesse_ia: formData.interesseIA,
        status: 'novo',
        origem: 'landing_page',
        user_agent: navigator.userAgent,
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
      }

      // Insert lead into Supabase
      const { data, error: supabaseError } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single()

      if (supabaseError) {
        console.error('Supabase error:', supabaseError)
        setError('Erro ao salvar os dados. Tente novamente.')
        return false
      }

      // Call Edge Function to send email notification
      try {
        const { error: emailError } = await supabase.functions.invoke('send-lead-email', {
          body: {
            leadId: data.id,
            ...leadData,
          },
        })

        if (emailError) {
          console.error('Email notification error:', emailError)
          // Don't fail the whole operation if email fails
          // The lead is already saved
        }
      } catch (emailErr) {
        console.error('Error calling email function:', emailErr)
        // Continue - lead is saved even if email fails
      }

      return true
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('Erro inesperado. Tente novamente.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const getLeads = async (filters?: {
    status?: string
    limit?: number
    offset?: number
  }) => {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.limit) {
        query = query.limit(filters.limit)
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        )
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) {
        throw supabaseError
      }

      return data
    } catch (err) {
      console.error('Error fetching leads:', err)
      return []
    }
  }

  const updateLeadStatus = async (
    leadId: string,
    status: 'novo' | 'contatado' | 'qualificado' | 'convertido' | 'perdido'
  ) => {
    try {
      const updateData: any = { status }
      
      if (status === 'contatado') {
        updateData.contatado_em = new Date().toISOString()
      }

      const { error: supabaseError } = await supabase
        .from('leads')
        .update(updateData)
        .eq('id', leadId)

      if (supabaseError) {
        throw supabaseError
      }

      return true
    } catch (err) {
      console.error('Error updating lead status:', err)
      return false
    }
  }

  return {
    createLead,
    getLeads,
    updateLeadStatus,
    isSubmitting,
    error,
  }
}

