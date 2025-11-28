/**
 * ICARUS v5.0 - Máscaras e Validações
 * 
 * Sistema completo de máscaras automáticas e validações em tempo real
 * para campos de formulário conforme padrões brasileiros.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

// ============ MÁSCARAS ============

export const MASKS = {
  CPF: '000.000.000-00',
  CNPJ: '00.000.000/0000-00',
  TELEFONE: '(00) 00000-0000',
  TELEFONE_FIXO: '(00) 0000-0000',
  CEP: '00000-000',
  DATA: '00/00/0000',
  HORA: '00:00',
  DATA_HORA: '00/00/0000 00:00',
  MOEDA: 'R$ #.##0,00',
  PORCENTAGEM: '##0,00%',
  PLACA: 'AAA-0A00',
  PLACA_MERCOSUL: 'AAA0A00',
  CRM: '00000-AA',
  ANVISA: '00000000000',
  CARTAO: '0000 0000 0000 0000',
  AGENCIA: '0000',
  CONTA: '00000-0',
  IE: '000.000.000.000',
  PIS: '000.00000.00-0',
} as const

// ============ FUNÇÕES DE MÁSCARA ============

/**
 * Aplica máscara de CPF
 */
export function maskCPF(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  return numbers
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

/**
 * Aplica máscara de CNPJ
 */
export function maskCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 14)
  return numbers
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/**
 * Aplica máscara de CPF ou CNPJ automaticamente
 */
export function maskCPFCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 11) {
    return maskCPF(value)
  }
  return maskCNPJ(value)
}

/**
 * Aplica máscara de telefone (celular ou fixo)
 */
export function maskTelefone(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 10) {
    // Telefone fixo
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  // Celular
  return numbers
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

/**
 * Aplica máscara de CEP
 */
export function maskCEP(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  return numbers.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

/**
 * Aplica máscara de data
 */
export function maskData(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 8)
  return numbers
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
}

/**
 * Aplica máscara de moeda brasileira
 */
export function maskMoeda(value: string | number): string {
  const num = typeof value === 'string' 
    ? parseFloat(value.replace(/\D/g, '')) / 100 
    : value
  
  if (isNaN(num)) return 'R$ 0,00'
  
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Aplica máscara de porcentagem
 */
export function maskPorcentagem(value: string | number): string {
  const num = typeof value === 'string'
    ? parseFloat(value.replace(/\D/g, '')) / 100
    : value
  
  if (isNaN(num)) return '0,00%'
  
  return `${num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
}

/**
 * Aplica máscara de placa de veículo
 */
export function maskPlaca(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
  if (clean.length <= 3) return clean
  if (clean.length <= 4) return `${clean.slice(0, 3)}-${clean.slice(3)}`
  return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`
}

/**
 * Aplica máscara de CRM
 */
export function maskCRM(value: string): string {
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
  const numbers = clean.replace(/[^0-9]/g, '').slice(0, 5)
  const letters = clean.replace(/[^A-Z]/g, '').slice(0, 2)
  if (numbers.length === 0) return ''
  if (letters.length === 0) return numbers
  return `${numbers}-${letters}`
}

/**
 * Aplica máscara de registro ANVISA
 */
export function maskANVISA(value: string): string {
  return value.replace(/\D/g, '').slice(0, 11)
}

/**
 * Aplica máscara de cartão de crédito
 */
export function maskCartao(value: string): string {
  const numbers = value.replace(/\D/g, '').slice(0, 16)
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

// ============ VALIDAÇÕES ============

/**
 * Valida CPF com dígitos verificadores
 */
export function validateCPF(cpf: string): boolean {
  const numbers = cpf.replace(/\D/g, '')
  
  if (numbers.length !== 11) return false
  if (/^(\d)\1+$/.test(numbers)) return false // Todos dígitos iguais
  
  // Validação do primeiro dígito
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i)
  }
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(numbers[9])) return false
  
  // Validação do segundo dígito
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i)
  }
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(numbers[10])) return false
  
  return true
}

/**
 * Valida CNPJ com dígitos verificadores
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = cnpj.replace(/\D/g, '')
  
  if (numbers.length !== 14) return false
  if (/^(\d)\1+$/.test(numbers)) return false
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  // Primeiro dígito
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i]
  }
  let digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(numbers[12])) return false
  
  // Segundo dígito
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i]
  }
  digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(numbers[13])) return false
  
  return true
}

/**
 * Valida email com regex avançado
 */
export function validateEmail(email: string): boolean {
  const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return regex.test(email)
}

/**
 * Valida telefone brasileiro
 */
export function validateTelefone(telefone: string): boolean {
  const numbers = telefone.replace(/\D/g, '')
  // DDD válido (11-99) + 8 ou 9 dígitos
  if (numbers.length < 10 || numbers.length > 11) return false
  const ddd = parseInt(numbers.slice(0, 2))
  if (ddd < 11 || ddd > 99) return false
  // Celular deve começar com 9
  if (numbers.length === 11 && numbers[2] !== '9') return false
  return true
}

/**
 * Valida CEP
 */
export function validateCEP(cep: string): boolean {
  const numbers = cep.replace(/\D/g, '')
  return numbers.length === 8
}

/**
 * Valida CRM
 */
export function validateCRM(crm: string): boolean {
  const clean = crm.replace(/[^A-Z0-9]/gi, '')
  // Formato: 5 números + 2 letras (UF)
  const regex = /^\d{4,6}[A-Z]{2}$/i
  return regex.test(clean)
}

/**
 * Valida código ANVISA
 */
export function validateANVISA(codigo: string): boolean {
  const numbers = codigo.replace(/\D/g, '')
  // Código ANVISA tem 11 dígitos
  return numbers.length === 11
}

// ============ FORMATADORES ============

/**
 * Converte para UPPERCASE (nomes)
 */
export function toUpperCase(value: string): string {
  return value.toUpperCase()
}

/**
 * Converte para lowercase (emails)
 */
export function toLowerCase(value: string): string {
  return value.toLowerCase()
}

/**
 * Remove espaços extras e trim
 */
export function normalizeSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

/**
 * Remove caracteres especiais, mantém apenas números
 */
export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Remove caracteres especiais, mantém letras e números
 */
export function alphanumeric(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '')
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalize(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// ============ AUTO-CORREÇÃO ============

export interface AutoCorrectResult {
  value: string
  wasChanged: boolean
  changeType?: 'uppercase' | 'lowercase' | 'trim' | 'format' | 'normalize'
  message?: string
}

/**
 * Auto-corrige nome (UPPERCASE, trim, normaliza espaços)
 */
export function autoCorrectNome(value: string): AutoCorrectResult {
  const original = value
  const corrected = normalizeSpaces(toUpperCase(value))
  return {
    value: corrected,
    wasChanged: original !== corrected,
    changeType: 'uppercase',
    message: original !== corrected ? 'Nome convertido para maiúsculas' : undefined,
  }
}

/**
 * Auto-corrige email (lowercase, trim)
 */
export function autoCorrectEmail(value: string): AutoCorrectResult {
  const original = value
  const corrected = toLowerCase(value.trim())
  return {
    value: corrected,
    wasChanged: original !== corrected,
    changeType: 'lowercase',
    message: original !== corrected ? 'Email convertido para minúsculas' : undefined,
  }
}

/**
 * Auto-corrige CPF (remove caracteres, valida)
 */
export function autoCorrectCPF(value: string): AutoCorrectResult {
  const masked = maskCPF(value)
  const isValid = validateCPF(masked)
  return {
    value: masked,
    wasChanged: value !== masked,
    changeType: 'format',
    message: !isValid && masked.length === 14 ? 'CPF inválido' : undefined,
  }
}

/**
 * Auto-corrige CNPJ (remove caracteres, valida)
 */
export function autoCorrectCNPJ(value: string): AutoCorrectResult {
  const masked = maskCNPJ(value)
  const isValid = validateCNPJ(masked)
  return {
    value: masked,
    wasChanged: value !== masked,
    changeType: 'format',
    message: !isValid && masked.length === 18 ? 'CNPJ inválido' : undefined,
  }
}

/**
 * Auto-corrige telefone
 */
export function autoCorrectTelefone(value: string): AutoCorrectResult {
  const masked = maskTelefone(value)
  const numbers = value.replace(/\D/g, '')
  const isValid = validateTelefone(masked)
  return {
    value: masked,
    wasChanged: value !== masked,
    changeType: 'format',
    message: !isValid && numbers.length >= 10 ? 'Telefone inválido' : undefined,
  }
}

/**
 * Auto-corrige CEP
 */
export function autoCorrectCEP(value: string): AutoCorrectResult {
  const masked = maskCEP(value)
  const isValid = validateCEP(masked)
  return {
    value: masked,
    wasChanged: value !== masked,
    changeType: 'format',
    message: !isValid && masked.length === 9 ? 'CEP inválido' : undefined,
  }
}

// ============ TIPOS ============

export type MaskType = keyof typeof MASKS

export interface FieldValidation {
  isValid: boolean
  message?: string
  wasAutoCorrected?: boolean
}

export default {
  MASKS,
  maskCPF,
  maskCNPJ,
  maskCPFCNPJ,
  maskTelefone,
  maskCEP,
  maskData,
  maskMoeda,
  maskPorcentagem,
  maskPlaca,
  maskCRM,
  maskANVISA,
  maskCartao,
  validateCPF,
  validateCNPJ,
  validateEmail,
  validateTelefone,
  validateCEP,
  validateCRM,
  validateANVISA,
  autoCorrectNome,
  autoCorrectEmail,
  autoCorrectCPF,
  autoCorrectCNPJ,
  autoCorrectTelefone,
  autoCorrectCEP,
}

