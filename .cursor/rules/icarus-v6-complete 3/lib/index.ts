// ============================================================================
// ICARUS v6.0 - CONSOLIDATED LIB (hooks, utils, supabase, redis)
// ============================================================================

// ==================== lib/utils.ts ====================
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(date: string | Date, format: 'short' | 'long' | 'iso' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (format === 'iso') return d.toISOString();
  return d.toLocaleDateString('pt-BR', format === 'long' ? { day: '2-digit', month: 'long', year: 'numeric' } : undefined);
}

export function formatCNPJ(cnpj: string): string {
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

export function formatCPF(cpf: string): string {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
}

export function debounce<T extends (...args: any[]) => any>(fn: T, ms: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => fn(...args), ms); };
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== lib/supabase.ts ====================
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true },
  global: { headers: { 'x-client-info': 'icarus-v6' } },
});

export async function setEmpresaContext(empresaId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    await supabase.rpc('set_config', { setting_name: 'app.current_empresa_id', setting_value: empresaId });
  }
}

// ==================== lib/redis.ts ====================
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const CACHE_TTL = {
  SESSION: 3600,        // 1 hora
  EMPRESA: 86400,       // 24 horas
  INFOSIMPLES: 604800,  // 7 dias
  EMBEDDING: 2592000,   // 30 dias
  CHAT_CONTEXT: 1800,   // 30 min
  SALDO: 300,           // 5 min
  TRANSACOES: 3600,     // 1 hora
} as const;

export async function cacheGet<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

export async function cacheSet<T>(key: string, value: T, ttl: number): Promise<void> {
  await redis.setex(key, ttl, value);
}

export async function cacheDelete(key: string): Promise<void> {
  await redis.del(key);
}

export async function queryWithCache<T>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const data = await fetcher();
  await cacheSet(key, data, ttl);
  return data;
}

// ==================== hooks/useSupabase.ts ====================
import { useEffect, useState, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return { user, session, loading, signIn, signOut };
}

export function useQuery<T>(table: string, options?: { select?: string; filter?: Record<string, any>; orderBy?: string; limit?: number }) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from(table).select(options?.select || '*');
      if (options?.filter) Object.entries(options.filter).forEach(([k, v]) => { query = query.eq(k, v); });
      if (options?.orderBy) query = query.order(options.orderBy, { ascending: false });
      if (options?.limit) query = query.limit(options.limit);
      const { data, error } = await query;
      if (error) throw error;
      setData(data as T[]);
    } catch (e) { setError(e as Error); }
    finally { setLoading(false); }
  }, [table, options]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export function useRealtime<T>(table: string, callback: (payload: T) => void) {
  useEffect(() => {
    const channel = supabase.channel(`realtime:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, (payload) => callback(payload.new as T))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [table, callback]);
}

// ==================== hooks/useIcarusBrain.ts ====================
import { useState, useCallback, useRef } from 'react';

interface Message { role: 'user' | 'assistant' | 'system'; content: string; timestamp: Date; }
interface IcarusBrainState { messages: Message[]; loading: boolean; error: string | null; sessionId: string | null; }

export function useIcarusBrain(empresaId: string) {
  const [state, setState] = useState<IcarusBrainState>({ messages: [], loading: false, error: null, sessionId: null });
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    setState(s => ({ ...s, loading: true, error: null, messages: [...s.messages, { role: 'user', content, timestamp: new Date() }] }));
    
    try {
      abortRef.current = new AbortController();
      const response = await fetch('/api/icarus-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, empresaId, sessionId: state.sessionId }),
        signal: abortRef.current.signal,
      });
      
      if (!response.ok) throw new Error('Erro ao processar mensagem');
      const data = await response.json();
      
      setState(s => ({
        ...s,
        loading: false,
        sessionId: data.sessionId,
        messages: [...s.messages, { role: 'assistant', content: data.response, timestamp: new Date() }],
      }));
    } catch (e) {
      if ((e as Error).name !== 'AbortError') {
        setState(s => ({ ...s, loading: false, error: (e as Error).message }));
      }
    }
  }, [empresaId, state.sessionId]);

  const cancel = useCallback(() => { abortRef.current?.abort(); setState(s => ({ ...s, loading: false })); }, []);
  const clear = useCallback(() => { setState({ messages: [], loading: false, error: null, sessionId: null }); }, []);

  return { ...state, sendMessage, cancel, clear };
}

// ==================== hooks/useFinancialAudit.ts ====================
export function useFinancialAudit(empresaId: string) {
  const [auditResult, setAuditResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const runAudit = useCallback(async (contaBancariaId: string, startDate: string, endDate: string) => {
    setLoading(true);
    setProgress(0);
    try {
      const response = await fetch('/api/financial-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresaId, contaBancariaId, startDate, endDate }),
      });
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        const lines = text.split('\n').filter(l => l.startsWith('data: '));
        for (const line of lines) {
          const data = JSON.parse(line.slice(6));
          if (data.progress) setProgress(data.progress);
          if (data.result) setAuditResult(data.result);
        }
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [empresaId]);

  return { auditResult, loading, progress, runAudit };
}

// ==================== hooks/useEstoque.ts ====================
export function useEstoque(empresaId: string) {
  const { data: produtos, loading, refetch } = useQuery<any>('vw_estoque', { filter: { empresa_id: empresaId } });
  
  const alertas = produtos?.filter((p: any) => p.status_estoque !== 'normal') || [];
  const criticos = alertas.filter((p: any) => p.status_estoque === 'sem_estoque' || p.status_estoque === 'proximo_vencimento');
  
  return { produtos, alertas, criticos, loading, refetch };
}

// ==================== hooks/useCirurgias.ts ====================
export function useCirurgias(empresaId: string, filters?: { status?: string; dataInicio?: string; dataFim?: string }) {
  const [cirurgias, setCirurgias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      setLoading(true);
      let query = supabase.from('cirurgias').select(`*, hospital:hospitais(*), medico:medicos(*), materiais:cirurgia_materiais(*, produto:produtos(*))`).eq('empresa_id', empresaId);
      if (filters?.status) query = query.eq('status', filters.status);
      if (filters?.dataInicio) query = query.gte('data_agendamento', filters.dataInicio);
      if (filters?.dataFim) query = query.lte('data_agendamento', filters.dataFim);
      const { data } = await query.order('data_agendamento', { ascending: true });
      setCirurgias(data || []);
      setLoading(false);
    }
    fetch();
  }, [empresaId, filters]);

  const hoje = cirurgias.filter(c => c.data_agendamento === new Date().toISOString().split('T')[0]);
  const pendentes = cirurgias.filter(c => ['agendada', 'confirmada', 'material_pendente'].includes(c.status));

  return { cirurgias, hoje, pendentes, loading };
}

// ==================== hooks/usePluggy.ts ====================
export function usePluggy(empresaId: string) {
  const [contas, setContas] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  const connect = useCallback(async () => {
    const response = await fetch('/api/pluggy/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ empresaId }) });
    const { connectUrl } = await response.json();
    window.open(connectUrl, '_blank', 'width=500,height=600');
  }, [empresaId]);

  const sync = useCallback(async (contaId: string) => {
    setSyncing(true);
    try {
      await fetch('/api/pluggy/sync', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ empresaId, contaId }) });
    } finally { setSyncing(false); }
  }, [empresaId]);

  useEffect(() => {
    supabase.from('contas_bancarias').select('*').eq('empresa_id', empresaId).then(({ data }) => setContas(data || []));
  }, [empresaId]);

  return { contas, connect, sync, syncing };
}

export { supabase, redis, CACHE_TTL };
