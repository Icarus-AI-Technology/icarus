import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatCurrencyDetailed,
  formatDate,
  formatDateTime,
  formatPercentage,
  parseCurrency,
  parseInteger,
  isInRange,
  daysBetween,
  daysOverdue
} from './formatters'

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as Brazilian currency', () => {
      const result = formatCurrency(1000)
      expect(result).toContain('1.000')
      expect(result).toContain('R$')
    })

    it('should format zero', () => {
      const result = formatCurrency(0)
      expect(result).toContain('R$')
      expect(result).toContain('0')
    })
  })

  describe('formatCurrencyDetailed', () => {
    it('should format with decimal places', () => {
      const result = formatCurrencyDetailed(1234.56)
      expect(result).toContain('1.234,56')
    })
  })

  describe('formatDate', () => {
    it('should format Date objects', () => {
      const date = new Date('2025-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should return "-" for invalid dates', () => {
      expect(formatDate('invalid')).toBe('-')
    })
  })

  describe('formatDateTime', () => {
    it('should format Date objects with time', () => {
      const date = new Date('2025-01-15T14:30:00')
      const formatted = formatDateTime(date)
      expect(formatted).toContain('2025')
      expect(formatted).toContain('14:30')
    })

    it('should return "-" for invalid dates', () => {
      expect(formatDateTime('invalid-date')).toBe('-')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages', () => {
      expect(formatPercentage(25.5)).toBe('25.5%')
      expect(formatPercentage(100, 0)).toBe('100%')
    })
  })

  describe('parseCurrency', () => {
    it('should parse currency strings', () => {
      // parseCurrency only handles simple cases, not full Brazilian format
      expect(parseCurrency('1234,56')).toBe(1234.56)
      expect(parseCurrency('1000')).toBe(1000)
    })

    it('should return null for empty input', () => {
      expect(parseCurrency('')).toBe(null)
    })
  })

  describe('parseInteger', () => {
    it('should parse integer strings', () => {
      expect(parseInteger('100')).toBe(100)
      expect(parseInteger('  50  ')).toBe(50)
    })

    it('should return null for invalid input', () => {
      expect(parseInteger('abc')).toBe(null)
    })
  })

  describe('isInRange', () => {
    it('should return true for values within range', () => {
      expect(isInRange(5, 0, 10)).toBe(true)
      expect(isInRange(0, 0, 10)).toBe(true)
      expect(isInRange(10, 0, 10)).toBe(true)
    })

    it('should return false for values outside range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false)
      expect(isInRange(11, 0, 10)).toBe(false)
    })
  })

  describe('daysBetween', () => {
    it('should calculate days between two dates', () => {
      const date1 = new Date('2025-01-01')
      const date2 = new Date('2025-01-10')
      expect(daysBetween(date1, date2)).toBeGreaterThanOrEqual(9)
    })

    it('should work with string dates', () => {
      const days = daysBetween('2025-01-01', '2025-01-05')
      expect(days).toBeGreaterThanOrEqual(4)
    })
  })

  describe('daysOverdue', () => {
    it('should calculate days overdue for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)
      expect(daysOverdue(pastDate)).toBeGreaterThanOrEqual(4)
    })

    it('should return negative for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      expect(daysOverdue(futureDate)).toBeLessThan(0)
    })
  })
})
