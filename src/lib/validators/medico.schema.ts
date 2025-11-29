/**
 * Schema de Validação - Médicos
 * 
 * ICARUS v5.1 - Conformidade CFM/CRM
 */

import { z } from 'zod'
import { EstadosBrasileiros } from './empresa.schema'

// ============================================
// ENUMS
// ============================================

export const MedicoStatus = ['ativo', 'inativo'] as const
export type MedicoStatusType = typeof MedicoStatus[number]

export const EspecialidadesMedicas = [
  'Cirurgia Vascular',
  'Cardiologia',
  'Cirurgia Cardíaca',
  'Hemodinâmica',
  'Eletrofisiologia',
  'Arritmologia',
  'Neurocirurgia',
  'Ortopedia',
  'Urologia',
  'Ginecologia',
  'Gastroenterologia',
  'Cirurgia Geral',
  'Cirurgia Torácica',
  'Anestesiologia',
  'Radiologia Intervencionista',
  'Outra'
] as const
export type EspecialidadeMedicaType = typeof EspecialidadesMedicas[number]

// ============================================
// REGEX VALIDAÇÕES
// ============================================

const CRM_REGEX = /^\d{4,8}$/
const CPF_REGEX = /^\d{11}$/

// ============================================
// SCHEMAS ZOD
// ============================================

export const insertMedicoSchema = z.object({
  empresa_id: z
    .string()
    .uuid('ID da empresa inválido')
    .nullable()
    .optional(),
  
  hospital_id: z
    .string()
    .uuid('ID do hospital inválido')
    .nullable()
    .optional(),
  
  nome_completo: z
    .string()
    .min(5, 'Nome deve ter no mínimo 5 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  crm: z
    .string()
    .regex(CRM_REGEX, 'CRM deve ter entre 4 e 8 dígitos')
    .describe('Número do CRM'),
  
  crm_estado: z
    .enum(EstadosBrasileiros, {
      required_error: 'Estado do CRM é obrigatório',
    })
    .describe('UF do CRM'),
  
  cpf: z
    .string()
    .regex(CPF_REGEX, 'CPF deve ter 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  especialidade: z
    .string()
    .max(100, 'Especialidade deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  subespecialidade: z
    .string()
    .max(100, 'Subespecialidade deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  telefone: z
    .string()
    .regex(/^\d{10,11}$/, 'Telefone deve ter 10 ou 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  celular: z
    .string()
    .regex(/^\d{11}$/, 'Celular deve ter 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  email: z
    .string()
    .email('Email inválido')
    .nullable()
    .optional(),
  
  data_nascimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .nullable()
    .optional(),
  
  endereco: z
    .string()
    .max(300, 'Endereço deve ter no máximo 300 caracteres')
    .nullable()
    .optional(),
  
  cidade: z
    .string()
    .max(100, 'Cidade deve ter no máximo 100 caracteres')
    .nullable()
    .optional(),
  
  estado: z
    .enum(EstadosBrasileiros)
    .nullable()
    .optional(),
  
  cep: z
    .string()
    .regex(/^\d{8}$/, 'CEP deve ter 8 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  // Dados bancários
  banco: z.string().max(50).nullable().optional(),
  agencia: z.string().max(10).nullable().optional(),
  conta: z.string().max(20).nullable().optional(),
  pix: z.string().max(100).nullable().optional(),
  
  status: z.enum(MedicoStatus).default('ativo'),
  
  observacoes: z
    .string()
    .max(1000, 'Observações devem ter no máximo 1000 caracteres')
    .nullable()
    .optional(),
})

export const selectMedicoSchema = insertMedicoSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const updateMedicoSchema = insertMedicoSchema.partial()

// ============================================
// TYPES
// ============================================

export type Medico = z.infer<typeof selectMedicoSchema>
export type NovoMedico = z.infer<typeof insertMedicoSchema>
export type UpdateMedico = z.infer<typeof updateMedicoSchema>

// ============================================
// HELPERS
// ============================================

export function formatCRM(crm: string, estado: string): string {
  return `CRM ${crm}/${estado}`
}

export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '')
  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cleaned[9]) !== digit) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cleaned[10]) !== digit) return false
  
  return true
}

