// ============================================================================
// ICARUS v6.0 - Custom React Hooks
// Supabase, IcarusBrain, Real-time
// ============================================================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  supabase, 
  subscribeToTable, 
  queryByEmpresa, 
  searchVectors,
  invokeEdgeFunction 
} from '@/lib/supabase';
import type { Database } from '@/types/database';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ============================================================================
// useSupabaseQuery - Generic data fetching with caching
// ============================================================================

interface UseSupabaseQueryOptions<T> {
  table: keyof Database['public']['Tables'];
  empresaId: string;
  select?: string;
  filters?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
}

interface UseSupabaseQueryResult<T> {
  data: T[] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  count: number | null;
}

export function useSupabaseQuery<T>({
  table,
  empresaId,
  select,
  filters,
  orderBy,
  limit,
  enabled = true,
  refetchOnWindowFocus = false,
}: UseSupabaseQueryOptions<T>): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [count, setCount] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled || !empresaId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await queryByEmpresa(table, empresaId, {
        select,
        filters,
        orderBy,
        limit,
      });
      setData(result.data as T[]);
      setCount(result.count);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [table, empresaId, select, JSON.stringify(filters), JSON.stringify(orderBy), limit, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (refetchOnWindowFocus) {
      const handleFocus = () => fetchData();
      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [refetchOnWindowFocus, fetchData]);

  return { data, loading, error, refetch: fetchData, count };
}

// ============================================================================
// useSupabaseRealtime - Real-time subscriptions
// ============================================================================

interface UseRealtimeOptions<T> {
  table: keyof Database['public']['Tables'];
  empresaId: string;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T, old: T) => void;
  onDelete?: (old: T) => void;
  enabled?: boolean;
}

export function useSupabaseRealtime<T>({
  table,
  empresaId,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseRealtimeOptions<T>) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!enabled || !empresaId) return;

    channelRef.current = subscribeToTable(table, empresaId, (payload) => {
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload.new as T);
          break;
        case 'UPDATE':
          onUpdate?.(payload.new as T, payload.old as T);
          break;
        case 'DELETE':
          onDelete?.(payload.old as T);
          break;
      }
    });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, empresaId, enabled, onInsert, onUpdate, onDelete]);
}

// ============================================================================
// useAuth - Authentication hook
// ============================================================================

interface User {
  id: string;
  email: string;
  empresa_id: string;
  nome: string;
  perfil: {
    nome: string;
    is_admin: boolean;
    permissoes: Record<string, unknown>;
  };
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        await loadUserData(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await loadUserData(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (authId: string) => {
    const { data } = await supabase
      .from('usuarios')
      .select(`
        id, nome, email, empresa_id,
        perfil:perfis(nome, is_admin, permissoes)
      `)
      .eq('auth_id', authId)
      .single();

    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        empresa_id: data.empresa_id,
        nome: data.nome,
        perfil: data.perfil as User['perfil'],
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasPermission = (permission: string): boolean => {
    if (!user?.perfil) return false;
    if (user.perfil.is_admin) return true;
    const perms = user.perfil.permissoes;
    return perms?.all === true || perms?.[permission] === true;
  };

  return { user, loading, signIn, signOut, hasPermission };
}

// ============================================================================
// useIcarusBrain - Chatbot hook
// ============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolsUsed?: string[];
}

interface UseIcarusBrainOptions {
  empresaId: string;
  userId: string;
  contexto?: 'geral' | 'financeiro' | 'estoque' | 'cirurgias' | 'compliance';
}

export function useIcarusBrain({ empresaId, userId, contexto = 'geral' }: UseIcarusBrainOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);
    setError(null);

    try {
      const response = await invokeEdgeFunction<{
        sessao_id: string;
        resposta: string;
        tools_used: string[];
      }>('icarus-brain', {
        empresa_id: empresaId,
        user_id: userId,
        sessao_id: sessionId,
        mensagem: content,
        contexto,
      });

      if (response) {
        setSessionId(response.sessao_id);

        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.resposta,
          timestamp: new Date(),
          toolsUsed: response.tools_used,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to send message'));
    } finally {
      setLoading(false);
    }
  }, [empresaId, userId, sessionId, contexto]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSessionId(null);
  }, []);

  return {
    messages,
    loading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
  };
}

// ============================================================================
// useSemanticSearch - Vector search hook
// ============================================================================

interface SearchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export function useSemanticSearch(empresaId: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const search = useCallback(async (
    query: string,
    options?: { sourceType?: string; threshold?: number; limit?: number }
  ) => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate embedding via edge function
      const embeddingResponse = await invokeEdgeFunction<{ embedding: number[] }>(
        'generate-embedding',
        { text: query }
      );

      if (!embeddingResponse?.embedding) {
        throw new Error('Failed to generate embedding');
      }

      // Search vectors
      const searchResults = await searchVectors(
        empresaId,
        embeddingResponse.embedding,
        options
      );

      setResults(searchResults as SearchResult[]);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
    } finally {
      setLoading(false);
    }
  }, [empresaId]);

  return { results, loading, error, search };
}

// ============================================================================
// useFinancialAlerts - Real-time financial alerts
// ============================================================================

interface FinancialAlert {
  id: string;
  tipo: string;
  severidade: 'info' | 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  valor_envolvido: number;
  status: string;
  criado_em: string;
}

export function useFinancialAlerts(empresaId: string) {
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial fetch
  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('alertas_financeiros')
        .select('*')
        .eq('empresa_id', empresaId)
        .in('status', ['novo', 'em_analise'])
        .order('criado_em', { ascending: false })
        .limit(50);

      if (data) {
        setAlerts(data as FinancialAlert[]);
      }
      setLoading(false);
    };

    fetchAlerts();
  }, [empresaId]);

  // Real-time subscription
  useSupabaseRealtime<FinancialAlert>({
    table: 'alertas_financeiros',
    empresaId,
    onInsert: (alert) => {
      setAlerts((prev) => [alert, ...prev]);
    },
    onUpdate: (alert) => {
      setAlerts((prev) =>
        prev.map((a) => (a.id === alert.id ? alert : a))
      );
    },
    onDelete: (alert) => {
      setAlerts((prev) => prev.filter((a) => a.id !== alert.id));
    },
  });

  const resolveAlert = async (alertId: string, notas: string) => {
    await supabase
      .from('alertas_financeiros')
      .update({
        status: 'resolvido',
        resolvido_em: new Date().toISOString(),
        resolucao_notas: notas,
      })
      .eq('id', alertId);
  };

  const dismissAlert = async (alertId: string) => {
    await supabase
      .from('alertas_financeiros')
      .update({ status: 'ignorado' })
      .eq('id', alertId);
  };

  const criticalCount = alerts.filter((a) => a.severidade === 'critica').length;
  const highCount = alerts.filter((a) => a.severidade === 'alta').length;

  return {
    alerts,
    loading,
    criticalCount,
    highCount,
    resolveAlert,
    dismissAlert,
  };
}

// ============================================================================
// useEstoqueAlerts - Stock alerts hook
// ============================================================================

interface EstoqueAlert {
  produto_id: string;
  codigo: string;
  nome: string;
  quantidade_disponivel: number;
  estoque_minimo: number;
  proxima_validade: string;
  status_estoque: string;
}

export function useEstoqueAlerts(empresaId: string) {
  const [alerts, setAlerts] = useState<EstoqueAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data } = await supabase
        .from('vw_estoque')
        .select('*')
        .eq('empresa_id', empresaId)
        .in('status_estoque', ['sem_estoque', 'estoque_baixo', 'proximo_vencimento']);

      if (data) {
        setAlerts(data as EstoqueAlert[]);
      }
      setLoading(false);
    };

    fetchAlerts();
  }, [empresaId]);

  const semEstoque = alerts.filter((a) => a.status_estoque === 'sem_estoque');
  const estoqueBaixo = alerts.filter((a) => a.status_estoque === 'estoque_baixo');
  const proximoVencimento = alerts.filter((a) => a.status_estoque === 'proximo_vencimento');

  return {
    alerts,
    loading,
    semEstoque,
    estoqueBaixo,
    proximoVencimento,
  };
}
