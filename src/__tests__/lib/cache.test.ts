/**
 * ICARUS v5.0 - Testes do Sistema de Cache
 * 
 * Testes unitários para o sistema de cache Redis/Local.
 * 
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock do logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}))

// Importar após mock
import {
  cacheManager,
  embeddingCache,
  searchCache,
  dashboardCache,
} from '@/lib/cache/redis-cache'

describe('CacheManager', () => {
  beforeEach(async () => {
    // Limpar cache antes de cada teste
    await cacheManager.clear()
  })

  describe('get/set', () => {
    it('deve armazenar e recuperar valor do cache', async () => {
      const testData = { name: 'Test Product', price: 100 }
      
      await cacheManager.set('product', 'test-1', testData)
      const result = await cacheManager.get<typeof testData>('product', 'test-1')
      
      expect(result).toEqual(testData)
    })

    it('deve retornar null para chave inexistente', async () => {
      const result = await cacheManager.get('product', 'non-existent')
      
      expect(result).toBeNull()
    })

    it('deve respeitar TTL customizado', async () => {
      const testData = { value: 'test' }
      
      // Definir com TTL de 1 segundo
      await cacheManager.set('dashboard', 'ttl-test', testData, 1)
      
      // Deve existir imediatamente
      let result = await cacheManager.get('dashboard', 'ttl-test')
      expect(result).toEqual(testData)
      
      // Aguardar TTL expirar
      await new Promise(resolve => setTimeout(resolve, 1100))
      
      // Deve ter expirado
      result = await cacheManager.get('dashboard', 'ttl-test')
      expect(result).toBeNull()
    })
  })

  describe('delete', () => {
    it('deve remover valor do cache', async () => {
      const testData = { id: 1 }
      
      await cacheManager.set('product', 'delete-test', testData)
      await cacheManager.delete('product', 'delete-test')
      
      const result = await cacheManager.get('product', 'delete-test')
      expect(result).toBeNull()
    })
  })

  describe('invalidatePattern', () => {
    it('deve invalidar múltiplas chaves por padrão', async () => {
      await cacheManager.set('search_result', 'query1', { results: [] })
      await cacheManager.set('search_result', 'query2', { results: [] })
      await cacheManager.set('product', 'prod1', { name: 'Product' })
      
      await cacheManager.invalidatePattern('search_result', '*')
      
      const search1 = await cacheManager.get('search_result', 'query1')
      const search2 = await cacheManager.get('search_result', 'query2')
      const product = await cacheManager.get('product', 'prod1')
      
      expect(search1).toBeNull()
      expect(search2).toBeNull()
      expect(product).not.toBeNull() // Não deve ser afetado
    })
  })

  describe('getOrSet', () => {
    it('deve executar função e cachear resultado quando não existe', async () => {
      const fetchFn = vi.fn().mockResolvedValue({ data: 'fetched' })
      
      const result = await cacheManager.getOrSet('product', 'fetch-test', fetchFn)
      
      expect(result).toEqual({ data: 'fetched' })
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })

    it('deve retornar cache sem executar função quando existe', async () => {
      const cachedData = { data: 'cached' }
      await cacheManager.set('product', 'cached-test', cachedData)
      
      const fetchFn = vi.fn().mockResolvedValue({ data: 'fetched' })
      
      const result = await cacheManager.getOrSet('product', 'cached-test', fetchFn)
      
      expect(result).toEqual(cachedData)
      expect(fetchFn).not.toHaveBeenCalled()
    })
  })

  describe('getStats', () => {
    it('deve retornar estatísticas corretas', async () => {
      // Criar alguns hits e misses
      await cacheManager.set('product', 'stats-test', { value: 1 })
      await cacheManager.get('product', 'stats-test') // hit
      await cacheManager.get('product', 'stats-test') // hit
      await cacheManager.get('product', 'non-existent') // miss
      
      const stats = cacheManager.getStats()
      
      expect(stats.hits).toBeGreaterThanOrEqual(2)
      expect(stats.misses).toBeGreaterThanOrEqual(1)
      expect(stats.totalKeys).toBeGreaterThanOrEqual(1)
      expect(stats.hitRate).toBeGreaterThan(0)
    })
  })
})

describe('EmbeddingCache', () => {
  beforeEach(async () => {
    await cacheManager.clear()
  })

  describe('hashText', () => {
    it('deve gerar hash consistente para o mesmo texto', () => {
      const text = 'Prótese de quadril cimentada'
      const hash1 = embeddingCache.hashText(text)
      const hash2 = embeddingCache.hashText(text)
      
      expect(hash1).toBe(hash2)
    })

    it('deve gerar hashes diferentes para textos diferentes', () => {
      const hash1 = embeddingCache.hashText('Texto 1')
      const hash2 = embeddingCache.hashText('Texto 2')
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('get/set', () => {
    it('deve armazenar e recuperar embedding', async () => {
      const text = 'Parafuso cortical 3.5mm'
      const embedding = Array(1536).fill(0).map(() => Math.random())
      
      await embeddingCache.set(text, embedding)
      const result = await embeddingCache.get(text)
      
      expect(result).toEqual(embedding)
    })
  })

  describe('getOrGenerate', () => {
    it('deve gerar e cachear embedding quando não existe', async () => {
      const text = 'Novo produto OPME'
      const mockEmbedding = Array(1536).fill(0.5)
      const generateFn = vi.fn().mockResolvedValue(mockEmbedding)
      
      const result = await embeddingCache.getOrGenerate(text, generateFn)
      
      expect(result).toEqual(mockEmbedding)
      expect(generateFn).toHaveBeenCalledWith(text)
      
      // Segunda chamada deve usar cache
      const result2 = await embeddingCache.getOrGenerate(text, generateFn)
      expect(result2).toEqual(mockEmbedding)
      expect(generateFn).toHaveBeenCalledTimes(1) // Não deve chamar novamente
    })
  })
})

describe('SearchCache', () => {
  beforeEach(async () => {
    await cacheManager.clear()
  })

  describe('generateKey', () => {
    it('deve gerar chave consistente', () => {
      const key1 = searchCache.generateKey('prótese quadril', { categoria: 'ortopedia' })
      const key2 = searchCache.generateKey('prótese quadril', { categoria: 'ortopedia' })
      
      expect(key1).toBe(key2)
    })

    it('deve gerar chaves diferentes para filtros diferentes', () => {
      const key1 = searchCache.generateKey('prótese', { categoria: 'ortopedia' })
      const key2 = searchCache.generateKey('prótese', { categoria: 'cardiologia' })
      
      expect(key1).not.toBe(key2)
    })
  })

  describe('get/set', () => {
    it('deve armazenar e recuperar resultado de busca', async () => {
      const query = 'implante dental'
      const results = [{ id: '1', nome: 'Implante A' }]
      
      await searchCache.set(query, results, 1)
      const cached = await searchCache.get(query)
      
      expect(cached?.results).toEqual(results)
      expect(cached?.totalCount).toBe(1)
      expect(cached?.query).toBe(query)
    })
  })

  describe('invalidate', () => {
    it('deve invalidar cache de busca', async () => {
      await searchCache.set('query1', [{ id: '1' }], 1)
      await searchCache.set('query2', [{ id: '2' }], 1)
      
      await searchCache.invalidate('*')
      
      const result1 = await searchCache.get('query1')
      const result2 = await searchCache.get('query2')
      
      expect(result1).toBeNull()
      expect(result2).toBeNull()
    })
  })
})

describe('DashboardCache', () => {
  beforeEach(async () => {
    await cacheManager.clear()
  })

  describe('KPIs', () => {
    it('deve armazenar e recuperar KPIs', async () => {
      const kpis = {
        cirurgiasHoje: 12,
        faturamento: 150000,
        estoqueCritico: 5,
      }
      
      await dashboardCache.setKPIs(kpis)
      const result = await dashboardCache.getKPIs()
      
      expect(result).toEqual(kpis)
    })
  })

  describe('Stats', () => {
    it('deve armazenar e recuperar estatísticas', async () => {
      const stats = {
        vendas: [100, 150, 200],
        periodo: '7d',
      }
      
      await dashboardCache.setStats('vendas', stats)
      const result = await dashboardCache.getStats('vendas')
      
      expect(result).toEqual(stats)
    })
  })

  describe('invalidate', () => {
    it('deve invalidar todo o cache de dashboard', async () => {
      await dashboardCache.setKPIs({ total: 100 })
      await dashboardCache.setStats('vendas', { data: [] })
      
      await dashboardCache.invalidate()
      
      const kpis = await dashboardCache.getKPIs()
      const stats = await dashboardCache.getStats('vendas')
      
      expect(kpis).toBeNull()
      expect(stats).toBeNull()
    })
  })
})

