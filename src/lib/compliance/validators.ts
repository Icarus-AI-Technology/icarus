/**
 * ICARUS v5.0 - Compliance Validators
 * 
 * Validadores centralizados para conformidade regulatória.
 * Inclui CPF, CNPJ, CRM, ANVISA, etc.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { z } from 'zod'

// ============ CPF VALIDATION ============

/**
 * Valida CPF brasileiro
 */
export function isValidCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCPF)) return false

  // Valida primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleanCPF[9])) return false

  // Valida segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10) remainder = 0
  if (remainder !== parseInt(cleanCPF[10])) return false

  return true
}

// ============ CNPJ VALIDATION ============

/**
 * Valida CNPJ brasileiro
 */
export function isValidCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/\D/g, '')

  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cleanCNPJ)) return false

  // Valida primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i]
  }
  let remainder = sum % 11
  const digit1 = remainder < 2 ? 0 : 11 - remainder
  if (digit1 !== parseInt(cleanCNPJ[12])) return false

  // Valida segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i]
  }
  remainder = sum % 11
  const digit2 = remainder < 2 ? 0 : 11 - remainder
  if (digit2 !== parseInt(cleanCNPJ[13])) return false

  return true
}

// ============ CRM VALIDATION ============

/**
 * Valida CRM (Conselho Regional de Medicina)
 * Formato: UF + 4 a 6 dígitos (ex: SP123456)
 */
export function isValidCRM(crm: string): boolean {
  const cleanCRM = crm.toUpperCase().replace(/[^A-Z0-9]/g, '')
  
  // Extrai UF e número
  const match = cleanCRM.match(/^([A-Z]{2})(\d{4,6})$/)
  if (!match) return false

  const [, uf, number] = match

  // Lista de UFs válidas
  const validUFs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
    'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
    'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  if (!validUFs.includes(uf)) return false

  // Número deve estar entre 1 e 999999
  const numValue = parseInt(number)
  if (numValue < 1 || numValue > 999999) return false

  return true
}

// ============ CNES VALIDATION ============

/**
 * Valida CNES (Cadastro Nacional de Estabelecimentos de Saúde)
 * Formato: 7 dígitos
 */
export function isValidCNES(cnes: string): boolean {
  const cleanCNES = cnes.replace(/\D/g, '')
  
  if (cleanCNES.length !== 7) return false
  if (/^(\d)\1+$/.test(cleanCNES)) return false
  
  return true
}

// ============ ANVISA VALIDATION ============

/**
 * Valida número de registro ANVISA
 * Formato: 11 dígitos, começando com 1, 2 ou 8
 */
export function isValidAnvisaRegistration(registration: string): boolean {
  const cleanReg = registration.replace(/\D/g, '')
  
  if (cleanReg.length !== 11) return false
  
  const firstDigit = parseInt(cleanReg[0])
  if (![1, 2, 8].includes(firstDigit)) return false
  
  return true
}

// ============ EMAIL VALIDATION ============

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// ============ PHONE VALIDATION ============

/**
 * Valida telefone brasileiro
 * Aceita fixo (10 dígitos) e celular (11 dígitos)
 */
export function isValidPhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '')
  
  // Fixo: 10 dígitos (DDD + 8 dígitos)
  // Celular: 11 dígitos (DDD + 9 + 8 dígitos)
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false
  
  // DDD válido (11 a 99)
  const ddd = parseInt(cleanPhone.substring(0, 2))
  if (ddd < 11 || ddd > 99) return false
  
  // Se celular, deve começar com 9
  if (cleanPhone.length === 11 && cleanPhone[2] !== '9') return false
  
  return true
}

// ============ CEP VALIDATION ============

/**
 * Valida CEP brasileiro
 * Formato: 8 dígitos
 */
export function isValidCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '')
  
  if (cleanCEP.length !== 8) return false
  if (/^(\d)\1+$/.test(cleanCEP)) return false
  
  return true
}

// ============ DATE VALIDATION ============

/**
 * Valida data no formato brasileiro (DD/MM/YYYY)
 */
export function isValidBrazilianDate(date: string): boolean {
  const match = date.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (!match) return false

  const [, day, month, year] = match
  const d = parseInt(day)
  const m = parseInt(month)
  const y = parseInt(year)

  if (m < 1 || m > 12) return false
  if (d < 1 || d > 31) return false
  if (y < 1900 || y > 2100) return false

  // Verifica dias por mês
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  
  // Ano bissexto
  if (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) {
    daysInMonth[1] = 29
  }

  if (d > daysInMonth[m - 1]) return false

  return true
}

// ============ NCM VALIDATION ============

/**
 * Valida código NCM
 * Formato: 8 dígitos
 */
export function isValidNCM(ncm: string): boolean {
  const cleanNCM = ncm.replace(/\D/g, '')
  return cleanNCM.length === 8
}

// ============ GTIN/EAN VALIDATION ============

/**
 * Valida código GTIN/EAN (código de barras)
 * Aceita EAN-8, EAN-13 e GTIN-14
 */
export function isValidGTIN(gtin: string): boolean {
  const cleanGTIN = gtin.replace(/\D/g, '')
  
  if (![8, 13, 14].includes(cleanGTIN.length)) return false
  
  // Calcula dígito verificador
  let sum = 0
  const length = cleanGTIN.length
  
  for (let i = 0; i < length - 1; i++) {
    const digit = parseInt(cleanGTIN[i])
    const multiplier = (length - 1 - i) % 2 === 0 ? 1 : 3
    sum += digit * multiplier
  }
  
  const checkDigit = (10 - (sum % 10)) % 10
  
  return checkDigit === parseInt(cleanGTIN[length - 1])
}

// ============ ZOD SCHEMAS ============

export const CPFSchema = z.string().refine(isValidCPF, {
  message: 'CPF inválido'
})

export const CNPJSchema = z.string().refine(isValidCNPJ, {
  message: 'CNPJ inválido'
})

export const CRMSchema = z.string().refine(isValidCRM, {
  message: 'CRM inválido. Formato esperado: UF + 4 a 6 dígitos (ex: SP123456)'
})

export const CNESSchema = z.string().refine(isValidCNES, {
  message: 'CNES inválido. Deve ter 7 dígitos'
})

export const AnvisaRegistrationSchema = z.string().refine(isValidAnvisaRegistration, {
  message: 'Registro ANVISA inválido. Deve ter 11 dígitos e começar com 1, 2 ou 8'
})

export const EmailSchema = z.string().refine(isValidEmail, {
  message: 'Email inválido'
})

export const PhoneSchema = z.string().refine(isValidPhone, {
  message: 'Telefone inválido. Use DDD + número (10 ou 11 dígitos)'
})

export const CEPSchema = z.string().refine(isValidCEP, {
  message: 'CEP inválido. Deve ter 8 dígitos'
})

export const NCMSchema = z.string().refine(isValidNCM, {
  message: 'NCM inválido. Deve ter 8 dígitos'
})

export const GTINSchema = z.string().refine(isValidGTIN, {
  message: 'GTIN/EAN inválido'
})

// ============ COMPOUND VALIDATORS ============

/**
 * Valida documento (CPF ou CNPJ)
 */
export function isValidDocument(document: string): boolean {
  const cleanDoc = document.replace(/\D/g, '')
  
  if (cleanDoc.length === 11) {
    return isValidCPF(cleanDoc)
  } else if (cleanDoc.length === 14) {
    return isValidCNPJ(cleanDoc)
  }
  
  return false
}

export const DocumentSchema = z.string().refine(isValidDocument, {
  message: 'Documento inválido (CPF ou CNPJ)'
})

// ============ FORMATTERS ============

/**
 * Formata CPF
 */
export function formatCPF(cpf: string): string {
  const clean = cpf.replace(/\D/g, '')
  if (clean.length !== 11) return cpf
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

/**
 * Formata CNPJ
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/\D/g, '')
  if (clean.length !== 14) return cnpj
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/**
 * Formata CRM
 */
export function formatCRM(crm: string): string {
  const clean = crm.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const match = clean.match(/^([A-Z]{2})(\d+)$/)
  if (!match) return crm
  return `${match[1]} ${match[2]}`
}

/**
 * Formata telefone
 */
export function formatPhone(phone: string): string {
  const clean = phone.replace(/\D/g, '')
  if (clean.length === 10) {
    return clean.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  } else if (clean.length === 11) {
    return clean.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

/**
 * Formata CEP
 */
export function formatCEP(cep: string): string {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return cep
  return clean.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Formata NCM
 */
export function formatNCM(ncm: string): string {
  const clean = ncm.replace(/\D/g, '')
  if (clean.length !== 8) return ncm
  return clean.replace(/(\d{4})(\d{2})(\d{2})/, '$1.$2.$3')
}

// ============ EXPORTS ============

export default {
  // Validators
  isValidCPF,
  isValidCNPJ,
  isValidCRM,
  isValidCNES,
  isValidAnvisaRegistration,
  isValidEmail,
  isValidPhone,
  isValidCEP,
  isValidBrazilianDate,
  isValidNCM,
  isValidGTIN,
  isValidDocument,
  
  // Zod Schemas
  CPFSchema,
  CNPJSchema,
  CRMSchema,
  CNESSchema,
  AnvisaRegistrationSchema,
  EmailSchema,
  PhoneSchema,
  CEPSchema,
  NCMSchema,
  GTINSchema,
  DocumentSchema,
  
  // Formatters
  formatCPF,
  formatCNPJ,
  formatCRM,
  formatPhone,
  formatCEP,
  formatNCM
}

