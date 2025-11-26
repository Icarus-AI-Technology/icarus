/**
 * ICARUS v5.0 - Shared CORS Configuration
 *
 * SECURITY: Configure ALLOWED_ORIGINS for production!
 * Do NOT use '*' in production environments.
 */

// Allowed origins for CORS
// Add your production domains here
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://icarus.app',
  'https://app.icarus.com.br',
  'https://icarus-ai.vercel.app',
  Deno.env.get('FRONTEND_URL'),
].filter(Boolean) as string[];

/**
 * Get CORS headers for a request
 * Returns origin-specific headers if the request origin is allowed
 */
export function getCorsHeaders(req: Request): HeadersInit {
  const origin = req.headers.get('Origin') || '';

  // Check if origin is allowed
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0] || 'https://icarus.app';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Default CORS headers (for development/fallback)
 * WARNING: Do not use in production without proper origin validation
 */
export const corsHeaders: HeadersInit = {
  'Access-Control-Allow-Origin': Deno.env.get('FRONTEND_URL') || 'https://icarus.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-request-id',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

/**
 * Handle CORS preflight request
 */
export function handleCorsPreflightRequest(req: Request): Response {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

/**
 * Create JSON response with CORS headers
 */
export function jsonResponse(
  data: unknown,
  req: Request,
  status = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...getCorsHeaders(req),
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Create error response with CORS headers
 */
export function errorResponse(
  message: string,
  req: Request,
  status = 500,
  requestId?: string
): Response {
  return new Response(
    JSON.stringify({
      error: message,
      requestId: requestId || crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    }),
    {
      status,
      headers: {
        ...getCorsHeaders(req),
        'Content-Type': 'application/json',
      },
    }
  );
}
