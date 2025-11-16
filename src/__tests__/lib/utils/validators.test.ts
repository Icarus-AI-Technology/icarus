/**
 * Unit tests for validators utility functions
 */

import { describe, it, expect } from 'vitest'
import { validateAmount, validateQuantity, isValidCNPJ } from '@/lib/utils/validators'

describe('validateAmount', () => {
  it('should validate positive amounts within limit', () => {
    const result = validateAmount('100', 500)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(100)
    expect(result.error).toBeUndefined()
  })

  it('should validate decimal amounts', () => {
    const result = validateAmount('150.50', 500)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(150.50)
  })

  it('should validate amount at maximum limit', () => {
    const result = validateAmount('500', 500)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(500)
  })

  it('should reject empty values', () => {
    const result = validateAmount('', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor não pode estar vazio')
  })

  it('should reject negative values', () => {
    const result = validateAmount('-50', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor deve ser maior que zero')
  })

  it('should reject zero values', () => {
    const result = validateAmount('0', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor deve ser maior que zero')
  })

  it('should reject values exceeding maximum', () => {
    const result = validateAmount('600', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor não pode exceder 500')
  })

  it('should reject non-numeric values', () => {
    const result = validateAmount('abc', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor inválido')
  })

  it('should handle values with commas', () => {
    const result = validateAmount('150,50', 500)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(150.50)
  })

  it('should handle large maximum values', () => {
    const result = validateAmount('50000', 100000)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(50000)
  })

  it('should reject amounts slightly exceeding maximum', () => {
    const result = validateAmount('500.01', 500)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Valor não pode exceder 500')
  })
})

describe('validateQuantity', () => {
  it('should validate positive integer quantities', () => {
    const result = validateQuantity('5', 10)
    expect(result.valid).toBe(true)
    expect(result.value).toBe(5)
    expect(result.error).toBeUndefined()
  })

  it('should validate quantity equal to available stock', () => {
    const result = validateQuantity('10', 10)
    expect(result.valid).toBe(true)
  })

  it('should reject empty quantity', () => {
    const result = validateQuantity('', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade não pode estar vazia')
  })

  it('should reject zero quantity', () => {
    const result = validateQuantity('0', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade deve ser maior que zero')
  })

  it('should reject negative quantities', () => {
    const result = validateQuantity('-5', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade deve ser maior que zero')
  })

  it('should reject quantities exceeding available stock', () => {
    const result = validateQuantity('15', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade não pode exceder 10')
  })

  it('should validate single unit', () => {
    const result = validateQuantity('1', 100)
    expect(result.valid).toBe(true)
  })

  it('should handle large available stock', () => {
    const result = validateQuantity('500', 1000)
    expect(result.valid).toBe(true)
  })

  it('should reject quantity exceeding by one', () => {
    const result = validateQuantity('11', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade não pode exceder 10')
  })

  it('should reject non-numeric values', () => {
    const result = validateQuantity('abc', 10)
    expect(result.valid).toBe(false)
    expect(result.error).toBe('Quantidade inválida')
  })
})

describe('isValidCNPJ', () => {
  it('should reject invalid CNPJ with wrong check digits', () => {
    expect(isValidCNPJ('11.222.333/0001-00')).toBe(false)
    expect(isValidCNPJ('11.222.333/0001-99')).toBe(false)
  })

  it('should reject CNPJ with all same digits', () => {
    expect(isValidCNPJ('11.111.111/1111-11')).toBe(false)
    expect(isValidCNPJ('00.000.000/0000-00')).toBe(false)
    expect(isValidCNPJ('99.999.999/9999-99')).toBe(false)
  })

  it('should reject CNPJ with incorrect length', () => {
    expect(isValidCNPJ('11.222.333/0001')).toBe(false)
    expect(isValidCNPJ('11.222.333')).toBe(false)
    expect(isValidCNPJ('123')).toBe(false)
  })

  it('should reject empty CNPJ', () => {
    expect(isValidCNPJ('')).toBe(false)
  })

  it('should reject CNPJ with letters', () => {
    expect(isValidCNPJ('11.222.333/0001-AA')).toBe(false)
    expect(isValidCNPJ('ABC.DEF.GHI/JKLM-NO')).toBe(false)
  })

  it('should reject sequential digits', () => {
    expect(isValidCNPJ('12.345.678/9012-34')).toBe(false)
  })

  it('should handle string input gracefully', () => {
    // Just test that it doesn't crash on various inputs
    expect(typeof isValidCNPJ('some random string')).toBe('boolean')
    expect(typeof isValidCNPJ('12345')).toBe('boolean')
  })
})
