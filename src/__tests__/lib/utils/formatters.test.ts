/**
 * Unit tests for formatters utility functions
 */

import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate, daysOverdue } from '@/lib/utils/formatters'

describe('formatCurrency', () => {
  it('should format positive values as Brazilian currency', () => {
    expect(formatCurrency(1000)).toMatch(/R\$\s*1\.000/)
    expect(formatCurrency(1500.50)).toMatch(/R\$\s*1\.500/)
    expect(formatCurrency(2500.75)).toMatch(/R\$\s*2\.500/)
  })

  it('should format large values correctly', () => {
    expect(formatCurrency(45000)).toMatch(/R\$\s*45\.000/)
    expect(formatCurrency(125000)).toMatch(/R\$\s*125\.000/)
    expect(formatCurrency(1000000)).toMatch(/R\$\s*1\.000\.000/)
  })

  it('should handle zero value', () => {
    expect(formatCurrency(0)).toMatch(/R\$\s*0/)
  })

  it('should handle negative values', () => {
    expect(formatCurrency(-500)).toMatch(/-R\$\s*500/)
    expect(formatCurrency(-1500)).toMatch(/-R\$\s*1\.500/)
  })

  it('should handle decimal values', () => {
    // formatCurrency can show decimals depending on Intl.NumberFormat behavior
    const result1 = formatCurrency(1234.56)
    expect(result1).toMatch(/R\$\s1\.234/)
    const result2 = formatCurrency(99.99)
    expect(result2).toMatch(/R\$\s99/)
  })

  it('should handle very small values', () => {
    const result1 = formatCurrency(0.01)
    expect(result1).toMatch(/R\$\s0/)
    const result2 = formatCurrency(0.99)
    expect(result2).toMatch(/R\$\s0/)
  })
})

describe('formatDate', () => {
  it('should format ISO date strings to Brazilian format', () => {
    expect(formatDate('2025-01-15')).toBe('15/01/2025')
    expect(formatDate('2025-12-31')).toBe('31/12/2025')
    expect(formatDate('2025-06-20')).toBe('20/06/2025')
  })

  it('should format ISO datetime strings to Brazilian format', () => {
    expect(formatDate('2025-01-15T10:30:00')).toBe('15/01/2025')
    expect(formatDate('2025-01-15T10:30:00Z')).toBe('15/01/2025')
    expect(formatDate('2025-01-15T10:30:00.000Z')).toBe('15/01/2025')
  })

  it('should handle different month values', () => {
    expect(formatDate('2025-01-01')).toBe('01/01/2025')
    expect(formatDate('2025-02-28')).toBe('28/02/2025')
    expect(formatDate('2025-03-15')).toBe('15/03/2025')
  })

  it('should return "-" for invalid date strings', () => {
    expect(formatDate('invalid-date')).toBe('-')
    expect(formatDate('not a date')).toBe('-')
    expect(formatDate('')).toBe('-')
  })

  it('should return "-" for invalid inputs', () => {
    // formatDate expects string or Date, passing invalid will throw
    // Test with invalid date strings instead
    expect(formatDate('not-a-date')).toBe('-')
    expect(formatDate('invalid')).toBe('-')
  })

  it('should handle edge case dates', () => {
    expect(formatDate('2000-01-01')).toBe('01/01/2000')
    expect(formatDate('2099-12-31')).toBe('31/12/2099')
  })
})

describe('daysOverdue', () => {
  it('should calculate days overdue for past dates', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 5)
    expect(daysOverdue(pastDate.toISOString())).toBe(5)
  })

  it('should calculate days overdue for 1 day ago', () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    expect(daysOverdue(yesterday.toISOString())).toBe(1)
  })

  it('should return negative for future dates', () => {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 3)
    expect(daysOverdue(futureDate.toISOString())).toBeLessThan(0)
  })

  it('should return 0 for today', () => {
    const today = new Date()
    const result = daysOverdue(today.toISOString())
    expect(result).toBe(0)
  })

  it('should handle ISO datetime strings', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 10)
    expect(daysOverdue(pastDate.toISOString())).toBe(10)
  })

  it('should calculate correctly for large overdue periods', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30)
    expect(daysOverdue(pastDate.toISOString())).toBe(30)
  })

  it('should handle dates from previous months', () => {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 2)
    const days = daysOverdue(pastDate.toISOString())
    expect(days).toBeGreaterThan(50) // At least 2 months = ~60 days
  })
})
