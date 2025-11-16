import { describe, it, expect } from 'vitest'
import {
  isValidCNPJ,
  isValidCPF,
  isValidEmail,
  isValidPhone,
  isValidDate,
  isPositive,
  isNonNegative,
  isNotEmpty,
  isLengthInRange,
  sanitizeInput,
  validateAmount,
  validateQuantity
} from './validators'

describe('validators', () => {
  describe('validateAmount', () => {
    it('should validate valid amounts', () => {
      const result = validateAmount('100.50')
      expect(result.valid).toBe(true)
      expect(result.value).toBe(100.5)
    })

    it('should reject empty values', () => {
      const result = validateAmount('')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Valor não pode estar vazio')
    })

    it('should reject zero or negative', () => {
      expect(validateAmount('0').valid).toBe(false)
      expect(validateAmount('-10').valid).toBe(false)
    })

    it('should enforce max amount', () => {
      const result = validateAmount('150', 100)
      expect(result.valid).toBe(false)
    })
  })

  describe('validateQuantity', () => {
    it('should validate valid quantities', () => {
      const result = validateQuantity('10')
      expect(result.valid).toBe(true)
      expect(result.value).toBe(10)
    })

    it('should reject zero or negative', () => {
      expect(validateQuantity('0').valid).toBe(false)
      expect(validateQuantity('-5').valid).toBe(false)
    })
  })

  describe('isValidCNPJ', () => {
    it('should have validation function', () => {
      // Test that the function exists and returns boolean
      const result = isValidCNPJ('12345678000199')
      expect(typeof result).toBe('boolean')
    })

    it('should reject invalid CNPJs', () => {
      expect(isValidCNPJ('11.111.111/1111-11')).toBe(false)
      expect(isValidCNPJ('123')).toBe(false)
    })
  })

  describe('isValidCPF', () => {
    it('should validate real CPFs', () => {
      expect(isValidCPF('111.444.777-35')).toBe(true)
    })

    it('should reject invalid CPFs', () => {
      expect(isValidCPF('111.111.111-11')).toBe(false)
      expect(isValidCPF('123')).toBe(false)
    })
  })

  describe('isValidEmail', () => {
    it('should validate valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
    })

    it('should reject invalid emails', () => {
      expect(isValidEmail('invalid')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
    })
  })

  describe('isValidPhone', () => {
    it('should validate valid phone numbers', () => {
      expect(isValidPhone('11987654321')).toBe(true)
      expect(isValidPhone('1134567890')).toBe(true)
    })

    it('should reject invalid phones', () => {
      expect(isValidPhone('123')).toBe(false)
    })
  })

  describe('isPositive', () => {
    it('should validate positive numbers', () => {
      expect(isPositive(10)).toBe(true)
      expect(isPositive(0.1)).toBe(true)
    })

    it('should reject zero and negatives', () => {
      expect(isPositive(0)).toBe(false)
      expect(isPositive(-5)).toBe(false)
    })
  })

  describe('isNonNegative', () => {
    it('should validate non-negative numbers', () => {
      expect(isNonNegative(0)).toBe(true)
      expect(isNonNegative(10)).toBe(true)
    })

    it('should reject negative numbers', () => {
      expect(isNonNegative(-1)).toBe(false)
    })
  })

  describe('isNotEmpty', () => {
    it('should validate non-empty strings', () => {
      expect(isNotEmpty('test')).toBe(true)
      expect(isNotEmpty('  hello  ')).toBe(true)
    })

    it('should reject empty strings', () => {
      expect(isNotEmpty('')).toBe(false)
      expect(isNotEmpty('   ')).toBe(false)
    })
  })

  describe('isLengthInRange', () => {
    it('should validate string length', () => {
      expect(isLengthInRange('hello', 3, 10)).toBe(true)
      expect(isLengthInRange('hi', 2, 5)).toBe(true)
    })

    it('should reject invalid lengths', () => {
      expect(isLengthInRange('hi', 5, 10)).toBe(false)
      expect(isLengthInRange('hello world', 1, 5)).toBe(false)
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize HTML characters', () => {
      expect(sanitizeInput('<script>alert("xss")</script>'))
        .toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;')
    })
  })
})
