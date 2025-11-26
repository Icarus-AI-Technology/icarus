import { useState, useMemo, useCallback } from 'react'

interface UseFiltersOptions<T> {
  data: T[]
  searchFields: (keyof T)[]
  filterFields?: {
    field: keyof T
    value: string
    defaultValue?: string
  }[]
}

interface UseFiltersReturn<T> {
  filteredData: T[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  filters: Record<string, string>
  setFilter: (field: string, value: string) => void
  resetFilters: () => void
}

/**
 * Custom hook for managing search and filter state
 * Automatically filters data based on search term and filter values
 * Uses useMemo for performance optimization
 */
export function useFilters<T extends Record<string, unknown>>({
  data,
  searchFields,
  filterFields = []
}: UseFiltersOptions<T>): UseFiltersReturn<T> {
  const [searchTerm, setSearchTerm] = useState('')

  const initialFilters = useMemo(() => {
    const filters: Record<string, string> = {}
    filterFields.forEach(({ field, defaultValue }) => {
      filters[String(field)] = defaultValue || 'all'
    })
    return filters
  }, [filterFields])

  const [filters, setFilters] = useState<Record<string, string>>(initialFilters)

  const setFilter = useCallback((field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setSearchTerm('')
    setFilters(initialFilters)
  }, [initialFilters])

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search filter
      const matchesSearch = searchTerm === '' || searchFields.some(field => {
        const value = item[field]
        if (value === null || value === undefined) return false

        return String(value).toLowerCase().includes(searchTerm.toLowerCase())
      })

      if (!matchesSearch) return false

      // Additional filters
      for (const { field } of filterFields) {
        const filterValue = filters[String(field)]
        if (filterValue && filterValue !== 'all' && item[field] !== filterValue) {
          return false
        }
      }

      return true
    })
  }, [data, searchTerm, searchFields, filters, filterFields])

  return {
    filteredData,
    searchTerm,
    setSearchTerm,
    filters,
    setFilter,
    resetFilters
  }
}
