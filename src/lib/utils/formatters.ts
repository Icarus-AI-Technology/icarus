/**
 * Utility functions for formatting values across the application
 */

/**
 * Format number as Brazilian currency (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0
  }).format(value)
}

/**
 * Format number as Brazilian currency with decimal places
 */
export const formatCurrencyDetailed = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format date string to Brazilian locale (DD/MM/YYYY)
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  return dateObj.toLocaleDateString('pt-BR')
}

/**
 * Format datetime string to Brazilian locale with time
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (isNaN(dateObj.getTime())) {
    return '-'
  }

  return dateObj.toLocaleString('pt-BR')
}

/**
 * Format percentage with specified decimal places
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Parse currency input string to number
 * Safely handles invalid inputs
 */
export const parseCurrency = (value: string): number | null => {
  if (!value || value.trim() === '') return null

  const cleaned = value.replace(/[^\d,.-]/g, '')
  const normalized = cleaned.replace(',', '.')
  const parsed = parseFloat(normalized)

  return isNaN(parsed) ? null : parsed
}

/**
 * Parse integer input string to number
 * Safely handles invalid inputs
 */
export const parseInteger = (value: string): number | null => {
  if (!value || value.trim() === '') return null

  const parsed = parseInt(value, 10)

  return isNaN(parsed) ? null : parsed
}

/**
 * Validate if a number is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Calculate days between two dates
 */
export const daysBetween = (date1: Date | string, date2: Date | string): number => {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2

  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Calculate days overdue from a due date
 * Returns positive number for overdue, negative for future, 0 for today
 */
export const daysOverdue = (dueDate: Date | string): number => {
  const due = typeof dueDate === 'string' ? new Date(dueDate) : dueDate
  const today = new Date()

  const diffTime = today.getTime() - due.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}
