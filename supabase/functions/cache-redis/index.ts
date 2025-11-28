/**
 * ICARUS v5.0 - Redis Cache Edge Function
 * 
 * Edge Function para operações de cache Redis.
 * Permite cache distribuído para múltiplas instâncias do frontend.
 * 
 * Endpoints:
 * - GET /cache/:type/:id - Obtém valor do cache
 * - POST /cache/:type/:id - Define valor no cache
 * - DELETE /cache/:type/:id - Remove valor do cache
 * - POST /cache/invalidate - Invalida cache por padrão
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { connect } from 'https://deno.land/x/redis@v0.29.0/mod.ts'

// Configuração CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

// Tipos de cache permitidos
const ALLOWED_CACHE_TYPES = [
  'embedding',
  'search_result',
  'product',
  'user_session',
  'ai_response',
  'regulatory',
  'dashboard',
]

// TTLs padrão por tipo (em segundos)
const DEFAULT_TTLS: Record<string, number> = {
  embedding: 86400 * 7,      // 7 dias
  search_result: 300,        // 5 minutos
  product: 3600,             // 1 hora
  user_session: 86400,       // 24 horas
  ai_response: 1800,         // 30 minutos
  regulatory: 86400,         // 24 horas
  dashboard: 60,             // 1 minuto
}

// Conexão Redis (lazy initialization)
let redisClient: Awaited<ReturnType<typeof connect>> | null = null

async function getRedisClient() {
  if (!redisClient) {
    const redisUrl = Deno.env.get('REDIS_URL')
    
    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable not set')
    }

    // Parse Redis URL
    const url = new URL(redisUrl)
    
    redisClient = await connect({
      hostname: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      db: parseInt(url.pathname.slice(1)) || 0,
    })
  }
  
  return redisClient
}

// Função para gerar chave formatada
function formatKey(type: string, id: string): string {
  return `icarus:${type}:${id}`
}

// Handler principal
serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const pathParts = url.pathname.split('/').filter(Boolean)
    
    // Remover 'cache-redis' do path se presente
    if (pathParts[0] === 'cache-redis') {
      pathParts.shift()
    }

    // Rota: /cache/:type/:id
    if (pathParts[0] === 'cache') {
      const type = pathParts[1]
      const id = pathParts[2]

      // Validar tipo de cache
      if (type && !ALLOWED_CACHE_TYPES.includes(type)) {
        return new Response(
          JSON.stringify({ error: `Invalid cache type: ${type}` }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      const redis = await getRedisClient()

      // GET - Obter valor do cache
      if (req.method === 'GET' && type && id) {
        const key = formatKey(type, id)
        const value = await redis.get(key)
        
        if (value === null) {
          return new Response(
            JSON.stringify({ hit: false, data: null }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        return new Response(
          JSON.stringify({ hit: true, data: JSON.parse(value) }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // POST - Definir valor no cache
      if (req.method === 'POST' && type && id) {
        const body = await req.json()
        const { data, ttl } = body

        if (data === undefined) {
          return new Response(
            JSON.stringify({ error: 'Missing data in request body' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const key = formatKey(type, id)
        const effectiveTTL = ttl ?? DEFAULT_TTLS[type] ?? 3600

        await redis.setex(key, effectiveTTL, JSON.stringify(data))

        return new Response(
          JSON.stringify({ success: true, key, ttl: effectiveTTL }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // DELETE - Remover valor do cache
      if (req.method === 'DELETE' && type && id) {
        const key = formatKey(type, id)
        const deleted = await redis.del(key)

        return new Response(
          JSON.stringify({ success: true, deleted: deleted > 0 }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // POST /cache/invalidate - Invalidar por padrão
      if (req.method === 'POST' && type === 'invalidate') {
        const body = await req.json()
        const { pattern } = body

        if (!pattern) {
          return new Response(
            JSON.stringify({ error: 'Missing pattern in request body' }),
            { 
              status: 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          )
        }

        const keys = await redis.keys(`icarus:${pattern}`)
        let deletedCount = 0

        for (const key of keys) {
          await redis.del(key)
          deletedCount++
        }

        return new Response(
          JSON.stringify({ success: true, deletedCount }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Rota: /stats - Estatísticas do cache
    if (pathParts[0] === 'stats' && req.method === 'GET') {
      const redis = await getRedisClient()
      
      const info = await redis.info('memory')
      const dbSize = await redis.dbsize()
      
      // Contar keys por tipo
      const keysByType: Record<string, number> = {}
      for (const type of ALLOWED_CACHE_TYPES) {
        const keys = await redis.keys(`icarus:${type}:*`)
        keysByType[type] = keys.length
      }

      return new Response(
        JSON.stringify({
          totalKeys: dbSize,
          keysByType,
          memoryInfo: info,
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Rota: /health - Health check
    if (pathParts[0] === 'health' && req.method === 'GET') {
      try {
        const redis = await getRedisClient()
        await redis.ping()
        
        return new Response(
          JSON.stringify({ status: 'healthy', redis: 'connected' }),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      } catch (error) {
        return new Response(
          JSON.stringify({ status: 'unhealthy', redis: 'disconnected', error: error.message }),
          { 
            status: 503, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    }

    // Rota não encontrada
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Cache Redis error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

