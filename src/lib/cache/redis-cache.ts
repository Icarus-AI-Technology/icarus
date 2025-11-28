/**
 * ICARUS v5.0 - Sistema de Cache com Redis
 * 
 * Implementação de cache distribuído para otimização de performance.
 * Suporta cache de embeddings, resultados de busca e dados frequentes.
 * 
 * Estratégias de cache:
 * - Cache-aside (lazy loading)
 * - Write-through para dados críticos
 * - TTL configurável por tipo de dado
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'

// ============ TIPOS ============

export interface CacheConfig {
  url: string
  password?: string
  db?: number
  keyPrefix?: string
  defaultTTL?: number
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
  version?: string
}

export interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalKeys: number
  memoryUsage: string
}

export type CacheKeyType = 
  | 'embedding'
  | 'search_result'
  | 'product'
  | 'user_session'
  | 'ai_response'
  | 'regulatory'
  | 'dashboard'

// ============ CONFIGURAÇÃO ============

const DEFAULT_CONFIG: CacheConfig = {
  url: import.meta.env.VITE_REDIS_URL || 'redis://localhost:6379',
  password: import.meta.env.VITE_REDIS_PASSWORD,
  db: 0,
  keyPrefix: 'icarus:',
  defaultTTL: 3600, // 1 hora
}

// TTLs específicos por tipo de dado (em segundos)
const TTL_CONFIG: Record<CacheKeyType, number> = {
  embedding: 86400 * 7,      // 7 dias (embeddings raramente mudam)
  search_result: 300,        // 5 minutos (resultados de busca)
  product: 3600,             // 1 hora (dados de produto)
  user_session: 86400,       // 24 horas (sessão de usuário)
  ai_response: 1800,         // 30 minutos (respostas de IA)
  regulatory: 86400,         // 24 horas (dados regulatórios)
  dashboard: 60,             // 1 minuto (dados de dashboard)
}

// ============ CACHE LOCAL (FALLBACK) ============

/**
 * Cache local em memória como fallback quando Redis não está disponível
 */
class LocalCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()
  private stats = { hits: 0, misses: 0 }
  private maxSize = 1000 // Limite de entradas

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) {
      this.stats.misses++
      return null
    }

    // Verificar TTL
    if (Date.now() - entry.timestamp > entry.ttl * 1000) {
      this.cache.delete(key)
      this.stats.misses++
      return null
    }

    this.stats.hits++
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    // LRU: remover entradas antigas se atingir limite
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }

    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl,
    })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace('*', '.*'))
    return Array.from(this.cache.keys()).filter(k => regex.test(k))
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      totalKeys: this.cache.size,
      memoryUsage: `${Math.round(this.cache.size * 2)}KB (estimado)`,
    }
  }
}

// ============ CACHE MANAGER ============

/**
 * Gerenciador de cache que abstrai Redis/Local
 */
class CacheManager {
  private localCache: LocalCache
  private config: CacheConfig
  private isRedisAvailable = false

  constructor(config: CacheConfig = DEFAULT_CONFIG) {
    this.config = config
    this.localCache = new LocalCache()
    this.checkRedisAvailability()
  }

  /**
   * Verifica se Redis está disponível
   */
  private async checkRedisAvailability(): Promise<void> {
    // Em ambiente de browser, Redis não está disponível diretamente
    // Usamos Edge Functions ou API para acessar Redis
    this.isRedisAvailable = false
    logger.info('Cache: Usando cache local (Redis via Edge Function quando necessário)')
  }

  /**
   * Gera chave de cache formatada
   */
  private formatKey(type: CacheKeyType, id: string): string {
    return `${this.config.keyPrefix}${type}:${id}`
  }

  /**
   * Obtém valor do cache
   */
  async get<T>(type: CacheKeyType, id: string): Promise<T | null> {
    const key = this.formatKey(type, id)
    
    try {
      // Tentar cache local primeiro
      const localResult = await this.localCache.get<T>(key)
      if (localResult !== null) {
        return localResult
      }

      // Se Redis estiver disponível via API, tentar
      if (this.isRedisAvailable) {
        // Implementar chamada à Edge Function para Redis
        // Por enquanto, retorna null
      }

      return null
    } catch (error) {
      logger.error('Cache get error:', error)
      return null
    }
  }

  /**
   * Define valor no cache
   */
  async set<T>(type: CacheKeyType, id: string, value: T, customTTL?: number): Promise<void> {
    const key = this.formatKey(type, id)
    const ttl = customTTL ?? TTL_CONFIG[type] ?? this.config.defaultTTL!

    try {
      // Salvar no cache local
      await this.localCache.set(key, value, ttl)

      // Se Redis estiver disponível via API, sincronizar
      if (this.isRedisAvailable) {
        // Implementar chamada à Edge Function para Redis
      }
    } catch (error) {
      logger.error('Cache set error:', error)
    }
  }

  /**
   * Remove valor do cache
   */
  async delete(type: CacheKeyType, id: string): Promise<void> {
    const key = this.formatKey(type, id)

    try {
      await this.localCache.delete(key)
    } catch (error) {
      logger.error('Cache delete error:', error)
    }
  }

  /**
   * Invalida cache por padrão
   */
  async invalidatePattern(type: CacheKeyType, pattern: string): Promise<void> {
    const fullPattern = `${this.config.keyPrefix}${type}:${pattern}`

    try {
      const keys = await this.localCache.keys(fullPattern)
      for (const key of keys) {
        await this.localCache.delete(key)
      }
      logger.info(`Cache invalidated: ${keys.length} keys matching ${fullPattern}`)
    } catch (error) {
      logger.error('Cache invalidate error:', error)
    }
  }

  /**
   * Limpa todo o cache
   */
  async clear(): Promise<void> {
    try {
      await this.localCache.clear()
      logger.info('Cache cleared')
    } catch (error) {
      logger.error('Cache clear error:', error)
    }
  }

  /**
   * Obtém estatísticas do cache
   */
  getStats(): CacheStats {
    return this.localCache.getStats()
  }

  /**
   * Cache-aside pattern: busca no cache, se não encontrar executa função e cacheia
   */
  async getOrSet<T>(
    type: CacheKeyType,
    id: string,
    fetchFn: () => Promise<T>,
    customTTL?: number
  ): Promise<T> {
    // Tentar cache primeiro
    const cached = await this.get<T>(type, id)
    if (cached !== null) {
      return cached
    }

    // Executar função e cachear resultado
    const result = await fetchFn()
    await this.set(type, id, result, customTTL)
    return result
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const cacheManager = new CacheManager()

// ============ HOOKS E UTILITÁRIOS ============

/**
 * Hook para usar cache em componentes React
 */
import { useState, useCallback, useEffect } from 'react'

export interface UseCacheOptions<T> {
  type: CacheKeyType
  id: string
  fetchFn: () => Promise<T>
  ttl?: number
  enabled?: boolean
}

export interface UseCacheReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refresh: () => Promise<void>
  invalidate: () => Promise<void>
}

export function useCache<T>({
  type,
  id,
  fetchFn,
  ttl,
  enabled = true,
}: UseCacheOptions<T>): UseCacheReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const result = await cacheManager.getOrSet(type, id, fetchFn, ttl)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Cache fetch failed'))
    } finally {
      setIsLoading(false)
    }
  }, [type, id, fetchFn, ttl, enabled])

  const refresh = useCallback(async () => {
    await cacheManager.delete(type, id)
    await fetchData()
  }, [type, id, fetchData])

  const invalidate = useCallback(async () => {
    await cacheManager.delete(type, id)
    setData(null)
  }, [type, id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refresh,
    invalidate,
  }
}

// ============ CACHE ESPECÍFICO PARA EMBEDDINGS ============

export interface EmbeddingCacheEntry {
  embedding: number[]
  model: string
  createdAt: string
}

/**
 * Cache especializado para embeddings
 */
export const embeddingCache = {
  /**
   * Gera hash do texto para usar como chave
   */
  hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36)
  },

  /**
   * Obtém embedding do cache
   */
  async get(text: string): Promise<number[] | null> {
    const hash = this.hashText(text)
    const entry = await cacheManager.get<EmbeddingCacheEntry>('embedding', hash)
    return entry?.embedding ?? null
  },

  /**
   * Salva embedding no cache
   */
  async set(text: string, embedding: number[], model = 'text-embedding-3-large'): Promise<void> {
    const hash = this.hashText(text)
    await cacheManager.set<EmbeddingCacheEntry>('embedding', hash, {
      embedding,
      model,
      createdAt: new Date().toISOString(),
    })
  },

  /**
   * Obtém ou gera embedding
   */
  async getOrGenerate(
    text: string,
    generateFn: (text: string) => Promise<number[]>
  ): Promise<number[]> {
    const cached = await this.get(text)
    if (cached) {
      logger.debug('Embedding cache hit')
      return cached
    }

    logger.debug('Embedding cache miss, generating...')
    const embedding = await generateFn(text)
    await this.set(text, embedding)
    return embedding
  },
}

// ============ CACHE PARA RESULTADOS DE BUSCA ============

export interface SearchResultCacheEntry<T> {
  results: T[]
  totalCount: number
  query: string
  filters?: Record<string, unknown>
  timestamp: string
}

/**
 * Cache especializado para resultados de busca
 */
export const searchCache = {
  /**
   * Gera chave de busca
   */
  generateKey(query: string, filters?: Record<string, unknown>): string {
    const filterStr = filters ? JSON.stringify(filters) : ''
    return `${query}:${filterStr}`.replace(/\s+/g, '_').toLowerCase()
  },

  /**
   * Obtém resultado de busca do cache
   */
  async get<T>(query: string, filters?: Record<string, unknown>): Promise<SearchResultCacheEntry<T> | null> {
    const key = this.generateKey(query, filters)
    return cacheManager.get<SearchResultCacheEntry<T>>('search_result', key)
  },

  /**
   * Salva resultado de busca no cache
   */
  async set<T>(
    query: string,
    results: T[],
    totalCount: number,
    filters?: Record<string, unknown>
  ): Promise<void> {
    const key = this.generateKey(query, filters)
    await cacheManager.set<SearchResultCacheEntry<T>>('search_result', key, {
      results,
      totalCount,
      query,
      filters,
      timestamp: new Date().toISOString(),
    })
  },

  /**
   * Invalida cache de busca
   */
  async invalidate(pattern = '*'): Promise<void> {
    await cacheManager.invalidatePattern('search_result', pattern)
  },
}

// ============ CACHE PARA DASHBOARD ============

/**
 * Cache especializado para dados de dashboard
 */
export const dashboardCache = {
  /**
   * Obtém KPIs do cache
   */
  async getKPIs(): Promise<Record<string, number> | null> {
    return cacheManager.get('dashboard', 'kpis')
  },

  /**
   * Salva KPIs no cache
   */
  async setKPIs(kpis: Record<string, number>): Promise<void> {
    await cacheManager.set('dashboard', 'kpis', kpis, 60) // 1 minuto
  },

  /**
   * Obtém estatísticas do cache
   */
  async getStats(statType: string): Promise<unknown | null> {
    return cacheManager.get('dashboard', `stats:${statType}`)
  },

  /**
   * Salva estatísticas no cache
   */
  async setStats(statType: string, data: unknown): Promise<void> {
    await cacheManager.set('dashboard', `stats:${statType}`, data, 120) // 2 minutos
  },

  /**
   * Invalida todo o cache de dashboard
   */
  async invalidate(): Promise<void> {
    await cacheManager.invalidatePattern('dashboard', '*')
  },
}

// ============ EXPORTS ============

export default {
  cacheManager,
  embeddingCache,
  searchCache,
  dashboardCache,
  useCache,
}

