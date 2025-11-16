/**
 * Input validation utilities
 */

/**
 * Validate CNPJ format (Brazilian company registration)
 */
export const isValidCNPJ = (cnpj: string): boolean => {
  const cleaned = cnpj.replace(/[^\d]/g, '')

  if (cleaned.length !== 14) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  // CNPJ validation algorithm
  let sum = 0
  let pos = cleaned.length - 7
  for (let i = cleaned.length; i >= 1; i--) {
    sum += parseInt(cleaned.charAt(cleaned.length - i)) * pos--
    if (pos < 2) pos = 9
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(cleaned.charAt(12))) return false

  sum = 0
  pos = cleaned.length - 8
  for (let i = cleaned.length; i >= 1; i--) {
    sum += parseInt(cleaned.charAt(cleaned.length - i)) * pos--
    if (pos < 2) pos = 9
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (result !== parseInt(cleaned.charAt(13))) return false

  return true
}

/**
 * Validate CPF format (Brazilian individual registration)
 */
export const isValidCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/[^\d]/g, '')

  if (cleaned.length !== 11) return false
  if (/^(\d)\1+$/.test(cleaned)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i)
  }
  let remainder = 11 - (sum % 11)
  let checkDigit = remainder === 10 || remainder === 11 ? 0 : remainder

  if (checkDigit !== parseInt(cleaned.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i)
  }
  remainder = 11 - (sum % 11)
  checkDigit = remainder === 10 || remainder === 11 ? 0 : remainder

  if (checkDigit !== parseInt(cleaned.charAt(10))) return false

  return true
}

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Brazilian format)
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/[^\d]/g, '')
  return cleaned.length === 10 || cleaned.length === 11
}

/**
 * Validate date string (ISO format or DD/MM/YYYY)
 */
export const isValidDate = (date: string): boolean => {
  const dateObj = new Date(date)
  return !isNaN(dateObj.getTime())
}

/**
 * Validate number is positive
 */
export const isPositive = (value: number): boolean => {
  return value > 0
}

/**
 * Validate number is non-negative
 */
export const isNonNegative = (value: number): boolean => {
  return value >= 0
}

/**
 * Validate string is not empty
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0
}

/**
 * Validate string length is within range
 */
export const isLengthInRange = (value: string, min: number, max: number): boolean => {
  const length = value.trim().length
  return length >= min && length <= max
}

/**
 * Sanitize string input to prevent XSS
 * Note: This is a basic sanitizer. For production, use a library like DOMPurify
 */
export const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Validate and parse amount with maximum value check
 */
export const validateAmount = (
  amountStr: string,
  maxAmount?: number
): { valid: boolean; value: number | null; error?: string } => {
  if (!amountStr || amountStr.trim() === '') {
    return { valid: false, value: null, error: 'Valor não pode estar vazio' }
  }

  const cleaned = amountStr.replace(/[^\d,.-]/g, '')
  const normalized = cleaned.replace(',', '.')
  const parsed = parseFloat(normalized)

  if (isNaN(parsed)) {
    return { valid: false, value: null, error: 'Valor inválido' }
  }

  if (parsed <= 0) {
    return { valid: false, value: parsed, error: 'Valor deve ser maior que zero' }
  }

  if (maxAmount !== undefined && parsed > maxAmount) {
    return { valid: false, value: parsed, error: `Valor não pode exceder ${maxAmount}` }
  }

  return { valid: true, value: parsed }
}

/**
 * Validate and parse quantity
 */
export const validateQuantity = (
  quantityStr: string,
  maxQuantity?: number
): { valid: boolean; value: number | null; error?: string } => {
  if (!quantityStr || quantityStr.trim() === '') {
    return { valid: false, value: null, error: 'Quantidade não pode estar vazia' }
  }

  const parsed = parseInt(quantityStr, 10)

  if (isNaN(parsed)) {
    return { valid: false, value: null, error: 'Quantidade inválida' }
  }

  if (parsed <= 0) {
    return { valid: false, value: parsed, error: 'Quantidade deve ser maior que zero' }
  }

  if (!Number.isInteger(parsed)) {
    return { valid: false, value: parsed, error: 'Quantidade deve ser um número inteiro' }
  }

  if (maxQuantity !== undefined && parsed > maxQuantity) {
    return { valid: false, value: parsed, error: `Quantidade não pode exceder ${maxQuantity}` }
  }

  return { valid: true, value: parsed }
}
