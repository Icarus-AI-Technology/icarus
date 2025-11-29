// ============================================================================
// ICARUS v6.0 - Supabase Client Configuration
// PostgreSQL 16 + pgvector + Real-time
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ============================================================================
// CLIENT INSTANCES
// ============================================================================

// Browser client (with RLS)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Server client (bypasses RLS - use with caution)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// ============================================================================
// SESSION HELPERS
// ============================================================================

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

export async function getUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ============================================================================
// SET EMPRESA CONTEXT (for RLS)
// ============================================================================

export async function setEmpresaContext(
  client: SupabaseClient<Database>,
  empresaId: string,
  userId?: string
) {
  // Set app.current_empresa_id for RLS policies
  await client.rpc('set_config', {
    setting: 'app.current_empresa_id',
    value: empresaId,
    is_local: true,
  });

  if (userId) {
    await client.rpc('set_config', {
      setting: 'app.current_user_id',
      value: userId,
      is_local: true,
    });
  }
}

// ============================================================================
// TYPED QUERY HELPERS
// ============================================================================

// Generic query with empresa filter
export async function queryByEmpresa<T extends keyof Database['public']['Tables']>(
  table: T,
  empresaId: string,
  options?: {
    select?: string;
    filters?: Record<string, unknown>;
    orderBy?: { column: string; ascending?: boolean };
    limit?: number;
    offset?: number;
  }
) {
  let query = supabase
    .from(table)
    .select(options?.select || '*')
    .eq('empresa_id', empresaId);

  // Apply additional filters
  if (options?.filters) {
    for (const [key, value] of Object.entries(options.filters)) {
      if (value !== undefined && value !== null) {
        query = query.eq(key, value);
      }
    }
  }

  // Apply ordering
  if (options?.orderBy) {
    query = query.order(options.orderBy.column, {
      ascending: options.orderBy.ascending ?? true,
    });
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data, count };
}

// ============================================================================
// VECTOR SEARCH (pgvector HNSW)
// ============================================================================

export async function searchVectors(
  empresaId: string,
  queryEmbedding: number[],
  options?: {
    sourceType?: string;
    threshold?: number;
    limit?: number;
  }
) {
  const { data, error } = await supabase.rpc('search_vectors', {
    query_embedding: queryEmbedding,
    p_empresa_id: empresaId,
    p_source_type: options?.sourceType || null,
    match_threshold: options?.threshold || 0.7,
    match_count: options?.limit || 10,
  });

  if (error) throw error;
  return data;
}

// ============================================================================
// BLOCKCHAIN AUDIT LOG
// ============================================================================

export async function createAuditBlock(
  empresaId: string,
  userId: string | null,
  tabela: string,
  registroId: string,
  acao: 'INSERT' | 'UPDATE' | 'DELETE' | 'SELECT' | 'EXPORT',
  dadosAntes?: Record<string, unknown>,
  dadosDepois?: Record<string, unknown>,
  camposAlterados?: string[]
) {
  const client = supabaseAdmin || supabase;

  const { data, error } = await client.rpc('mine_audit_block', {
    p_empresa_id: empresaId,
    p_usuario_id: userId,
    p_tabela: tabela,
    p_registro_id: registroId,
    p_acao: acao,
    p_dados_antes: dadosAntes || null,
    p_dados_depois: dadosDepois || null,
    p_campos_alterados: camposAlterados || null,
    p_difficulty: 2,
  });

  if (error) throw error;
  return data;
}

export async function validateBlockchain(empresaId: string) {
  const { data, error } = await supabase.rpc('validate_blockchain', {
    p_empresa_id: empresaId,
  });

  if (error) throw error;
  return data;
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

export function subscribeToTable<T extends keyof Database['public']['Tables']>(
  table: T,
  empresaId: string,
  callback: (payload: {
    eventType: 'INSERT' | 'UPDATE' | 'DELETE';
    new: Database['public']['Tables'][T]['Row'] | null;
    old: Database['public']['Tables'][T]['Row'] | null;
  }) => void
) {
  return supabase
    .channel(`${table}_${empresaId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `empresa_id=eq.${empresaId}`,
      },
      (payload) => {
        callback({
          eventType: payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE',
          new: payload.new as Database['public']['Tables'][T]['Row'] | null,
          old: payload.old as Database['public']['Tables'][T]['Row'] | null,
        });
      }
    )
    .subscribe();
}

// ============================================================================
// STORAGE HELPERS
// ============================================================================

export async function uploadFile(
  bucket: string,
  path: string,
  file: File | Blob,
  options?: { contentType?: string; upsert?: boolean }
) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    contentType: options?.contentType,
    upsert: options?.upsert ?? false,
  });

  if (error) throw error;
  return data;
}

export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteFile(bucket: string, paths: string[]) {
  const { error } = await supabase.storage.from(bucket).remove(paths);
  if (error) throw error;
}

// ============================================================================
// EDGE FUNCTION CALLER
// ============================================================================

export async function invokeEdgeFunction<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>,
  options?: { headers?: Record<string, string> }
) {
  const { data, error } = await supabase.functions.invoke<T>(functionName, {
    body,
    headers: options?.headers,
  });

  if (error) throw error;
  return data;
}
