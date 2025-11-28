/**
 * Schema de Validação - Empresas (Distribuidoras OPME)
 * 
 * ICARUS v5.1 - Conformidade ANVISA + LGPD
 */

import { z } from 'zod'

// ============================================
// ENUMS
// ============================================

export const EmpresaStatus = ['ativo', 'inativo', 'suspenso'] as const
export type EmpresaStatusType = typeof EmpresaStatus[number]

export const EstadosBrasileiros = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const
export type EstadoBrasileiroType = typeof EstadosBrasileiros[number]

// ============================================
// REGEX VALIDAÇÕES
// ============================================

const CNPJ_REGEX = /^\d{14}$/
const CEP_REGEX = /^\d{8}$/
const TELEFONE_REGEX = /^\d{10,11}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ============================================
// SCHEMAS ZOD
// ============================================

export const insertEmpresaSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  
  razao_social: z
    .string()
    .max(200, 'Razão social deve ter no máximo 200 caracteres')
    .nullable()
    .optional(),
  
  cnpj: z
    .string()
    .regex(CNPJ_REGEX, 'CNPJ deve ter 14 dígitos numéricos')
    .transform(val => val.replace(/\D/g, '')),
  
  inscricao_estadual: z
    .string()
    .max(20, 'Inscrição estadual deve ter no máximo 20 caracteres')
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
    .regex(CEP_REGEX, 'CEP deve ter 8 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  telefone: z
    .string()
    .regex(TELEFONE_REGEX, 'Telefone deve ter 10 ou 11 dígitos')
    .nullable()
    .optional()
    .transform(val => val?.replace(/\D/g, '')),
  
  email: z
    .string()
    .email('Email inválido')
    .nullable()
    .optional(),
  
  site: z
    .string()
    .url('URL inválida')
    .nullable()
    .optional(),
  
  status: z
    .enum(EmpresaStatus)
    .default('ativo'),
  
  configuracoes: z
    .record(z.unknown())
    .default({}),
})

export const selectEmpresaSchema = insertEmpresaSchema.extend({
  id: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export const updateEmpresaSchema = insertEmpresaSchema.partial()

// ============================================
// TYPES
// ============================================

export type Empresa = z.infer<typeof selectEmpresaSchema>
export type NovaEmpresa = z.infer<typeof insertEmpresaSchema>
export type UpdateEmpresa = z.infer<typeof updateEmpresaSchema>

// ============================================
// HELPERS
// ============================================

export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '')
  if (cleaned.length !== 14) return false
  if (/^(\d)\1+$/.test(cleaned)) return false
  
  let sum = 0
  let weight = 5
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  let digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cleaned[12]) !== digit) return false
  
  sum = 0
  weight = 6
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleaned[i]) * weight
    weight = weight === 2 ? 9 : weight - 1
  }
  digit = 11 - (sum % 11)
  if (digit > 9) digit = 0
  if (parseInt(cleaned[13]) !== digit) return false
  
  return true
}

export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '')
  return cleaned.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

