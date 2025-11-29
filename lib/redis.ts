// ============================================================================
// ICARUS v6.0 - Redis Cache Service (Upstash)
// Distributed caching for high-performance operations
// ============================================================================

import { Redis } from '@upstash/redis';

// ============================================================================
// REDIS CLIENT
// ============================================================================

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============================================================================
// CACHE KEYS STRUCTURE
// ============================================================================

export const CacheKeys = {
  // Session & Auth
  session: (userId: string) => `session:${userId}`,
  userPermissions: (userId: string) => `permissions:${userId}`,
  
  // Empresa data
  empresa: (empresaId: string) => `empresa:${empresaId}`,
  empresaConfig: (empresaId: string) => `empresa:${empresaId}:config`,
  
  // InfoSimples cache
  infosimples: (tipo: string, id: string) => `infosimples:${tipo}:${id}`,
  cnpj: (cnpj: string) => `infosimples:cnpj:${cnpj}`,
  cpf: (cpf: string) => `infosimples:cpf:${cpf}`,
  crm: (crm: string, uf: string) => `infosimples:crm:${crm}:${uf}`,
  anvisa: (registro: string) => `infosimples:anvisa:${registro}`,
  
  // Embeddings
  embedding: (hash: string) => `embedding:${hash}`,
  
  // Chat context
  chatContext: (sessionId: string) => `chat:context:${sessionId}`,
  chatHistory: (sessionId: string) => `chat:history:${sessionId}`,
  
  // Financial
  saldo: (contaId: string) => `saldo:${contaId}`,
  transacoes: (contaId: string, date: string) => `transacoes:${contaId}:${date}`,
  analiseFinanceira: (empresaId: string, mes: string) => `analise:${empresaId}:${mes}`,
  
  // Estoque
  estoque: (empresaId: string, produtoId: string) => `estoque:${empresaId}:${produtoId}`,
  estoqueTotal: (empresaId: string) => `estoque:${empresaId}:total`,
  
  // Cirurgias
  cirurgiasDia: (empresaId: string, date: string) => `cirurgias:${empresaId}:${date}`,
  
  // Rate limiting
  rateLimit: (key: string) => `ratelimit:${key}`,
} as const;

// ============================================================================
// TTL CONFIGURATION (in seconds)
// ============================================================================

export const CacheTTL = {
  session: 3600,           // 1 hora
  empresa: 86400,          // 24 horas
  infosimples: 604800,     // 7 dias
  embedding: 2592000,      // 30 dias
  chatContext: 1800,       // 30 minutos
  chatHistory: 86400,      // 24 horas
  saldo: 300,              // 5 minutos
  transacoes: 3600,        // 1 hora
  estoque: 600,            // 10 minutos
  cirurgias: 300,          // 5 minutos
  rateLimit: 3600,         // 1 hora
} as const;

// ============================================================================
// CACHE SERVICE
// ============================================================================

export class CacheService {
  // Generic get with type safety
  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get<T>(key);
      return data;
    } catch (error) {
      console.error(`Cache GET error for key ${key}:`, error);
      return null;
    }
  }

  // Generic set with TTL
  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Cache SET error for key ${key}:`, error);
      return false;
    }
  }

  // Delete key
  async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DEL error for key ${key}:`, error);
      return false;
    }
  }

  // Delete multiple keys by pattern
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      console.error(`Cache DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  // Get remaining TTL
  async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      console.error(`Cache TTL error for key ${key}:`, error);
      return -1;
    }
  }

  // Increment counter
  async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      console.error(`Cache INCR error for key ${key}:`, error);
      return 0;
    }
  }

  // Get or fetch pattern
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number
  ): Promise<T> {
    // Try cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const fresh = await fetcher();
    
    // Store in cache
    await this.set(key, fresh, ttlSeconds);
    
    return fresh;
  }

  // Hash operations
  async hset(key: string, field: string, value: unknown): Promise<boolean> {
    try {
      await redis.hset(key, { [field]: value });
      return true;
    } catch (error) {
      console.error(`Cache HSET error:`, error);
      return false;
    }
  }

  async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      return await redis.hget<T>(key, field);
    } catch (error) {
      console.error(`Cache HGET error:`, error);
      return null;
    }
  }

  async hgetall<T extends Record<string, unknown>>(key: string): Promise<T | null> {
    try {
      return await redis.hgetall<T>(key);
    } catch (error) {
      console.error(`Cache HGETALL error:`, error);
      return null;
    }
  }

  // List operations (for chat history)
  async lpush(key: string, ...values: unknown[]): Promise<number> {
    try {
      return await redis.lpush(key, ...values);
    } catch (error) {
      console.error(`Cache LPUSH error:`, error);
      return 0;
    }
  }

  async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      return await redis.lrange<T>(key, start, stop);
    } catch (error) {
      console.error(`Cache LRANGE error:`, error);
      return [];
    }
  }

  async ltrim(key: string, start: number, stop: number): Promise<boolean> {
    try {
      await redis.ltrim(key, start, stop);
      return true;
    } catch (error) {
      console.error(`Cache LTRIM error:`, error);
      return false;
    }
  }
}

// ============================================================================
// RATE LIMITER
// ============================================================================

export class RateLimiter {
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  async checkLimit(
    identifier: string,
    maxRequests: number,
    windowSeconds: number
  ): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
    const key = CacheKeys.rateLimit(identifier);
    
    const current = await this.cache.incr(key);
    
    // Set expiry on first request
    if (current === 1) {
      await redis.expire(key, windowSeconds);
    }

    const ttl = await this.cache.ttl(key);
    const remaining = Math.max(0, maxRequests - current);
    const allowed = current <= maxRequests;

    return {
      allowed,
      remaining,
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  }
}

// ============================================================================
// SPECIALIZED CACHE FUNCTIONS
// ============================================================================

const cacheService = new CacheService();

// InfoSimples cache
export async function getCachedInfoSimples<T>(
  tipo: string,
  identificador: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = CacheKeys.infosimples(tipo, identificador);
  return cacheService.getOrFetch(key, fetcher, CacheTTL.infosimples);
}

// Embedding cache
export async function getCachedEmbedding(
  contentHash: string,
  generator: () => Promise<number[]>
): Promise<number[]> {
  const key = CacheKeys.embedding(contentHash);
  return cacheService.getOrFetch(key, generator, CacheTTL.embedding);
}

// Chat context cache
export async function getChatContext(sessionId: string): Promise<string | null> {
  const key = CacheKeys.chatContext(sessionId);
  return cacheService.get<string>(key);
}

export async function setChatContext(
  sessionId: string,
  context: string
): Promise<boolean> {
  const key = CacheKeys.chatContext(sessionId);
  return cacheService.set(key, context, CacheTTL.chatContext);
}

// Chat history (last N messages)
export async function addChatMessage(
  sessionId: string,
  message: { role: string; content: string }
): Promise<void> {
  const key = CacheKeys.chatHistory(sessionId);
  await cacheService.lpush(key, JSON.stringify(message));
  await cacheService.ltrim(key, 0, 49); // Keep last 50 messages
  await redis.expire(key, CacheTTL.chatHistory);
}

export async function getChatHistory(
  sessionId: string,
  limit: number = 20
): Promise<Array<{ role: string; content: string }>> {
  const key = CacheKeys.chatHistory(sessionId);
  const messages = await cacheService.lrange<string>(key, 0, limit - 1);
  return messages.map((m) => JSON.parse(m));
}

// Financial cache
export async function getCachedSaldo(
  contaId: string,
  fetcher: () => Promise<number>
): Promise<number> {
  const key = CacheKeys.saldo(contaId);
  return cacheService.getOrFetch(key, fetcher, CacheTTL.saldo);
}

export async function invalidateSaldo(contaId: string): Promise<void> {
  await cacheService.del(CacheKeys.saldo(contaId));
}

// Estoque cache
export async function getCachedEstoque<T>(
  empresaId: string,
  produtoId: string,
  fetcher: () => Promise<T>
): Promise<T> {
  const key = CacheKeys.estoque(empresaId, produtoId);
  return cacheService.getOrFetch(key, fetcher, CacheTTL.estoque);
}

export async function invalidateEstoque(
  empresaId: string,
  produtoId?: string
): Promise<void> {
  if (produtoId) {
    await cacheService.del(CacheKeys.estoque(empresaId, produtoId));
  } else {
    await cacheService.delPattern(`estoque:${empresaId}:*`);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { cacheService, redis };
