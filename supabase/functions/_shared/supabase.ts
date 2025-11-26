/**
 * ICARUS v5.0 - Shared Supabase Client
 *
 * Provides authenticated Supabase client for Edge Functions
 */

import { createClient, SupabaseClient, User } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

/**
 * Create a Supabase client with service role (admin access)
 * Use for operations that need to bypass RLS
 */
export function createServiceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Create a Supabase client with user's JWT token
 * Respects RLS policies
 */
export function createUserClient(authHeader: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

/**
 * Verify user authentication from request
 * Returns user if authenticated, null otherwise
 */
export async function verifyAuth(req: Request): Promise<{
  user: User | null;
  error: string | null;
  supabase: SupabaseClient;
}> {
  const authHeader = req.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: 'Missing or invalid Authorization header',
      supabase: createServiceClient(),
    };
  }

  const token = authHeader.replace('Bearer ', '');

  // Create client with user token
  const supabase = createUserClient(authHeader);

  // Verify token
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return {
      user: null,
      error: error?.message || 'Invalid token',
      supabase,
    };
  }

  return {
    user,
    error: null,
    supabase,
  };
}

/**
 * Get user's empresa_id from perfis table
 */
export async function getUserEmpresaId(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('perfis')
    .select('empresa_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user empresa_id:', error);
    return null;
  }

  return data.empresa_id;
}

/**
 * Get user's profile with empresa details
 */
export async function getUserProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  id: string;
  nome_completo: string;
  email: string;
  cargo: string;
  empresa_id: string;
  empresa_nome?: string;
} | null> {
  const { data, error } = await supabase
    .from('perfis')
    .select(`
      id,
      nome_completo,
      email,
      cargo,
      empresa_id,
      empresas (
        nome
      )
    `)
    .eq('id', userId)
    .single();

  if (error || !data) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: data.id,
    nome_completo: data.nome_completo,
    email: data.email,
    cargo: data.cargo,
    empresa_id: data.empresa_id,
    empresa_nome: (data.empresas as { nome: string } | null)?.nome,
  };
}

/**
 * Rate limiting using Supabase
 * Returns true if request is allowed, false if rate limited
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  identifier: string,
  windowMs = 60000,
  maxRequests = 100
): Promise<boolean> {
  const now = Date.now();
  const windowStart = new Date(now - windowMs).toISOString();

  // Count recent requests (this is a simple implementation)
  // For production, consider using a dedicated rate limiting service
  const { count, error } = await supabase
    .from('chatbot_metricas')
    .select('*', { count: 'exact', head: true })
    .eq('empresa_id', identifier)
    .gte('criado_em', windowStart);

  if (error) {
    console.error('Rate limit check error:', error);
    // Allow request on error (fail open)
    return true;
  }

  return (count || 0) < maxRequests;
}
