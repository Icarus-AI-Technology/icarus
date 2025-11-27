import { useSupabaseCRUD } from './useSupabaseCRUD'

/**
 * Hook para Audit Logs
 */
export function useAuditLogs() {
  return useSupabaseCRUD({
    tableName: 'audit_logs',
    queryKey: ['audit-logs'],
    select: '*, usuario:usuarios(*)',
    orderBy: { column: 'timestamp', ascending: false }
  })
}

/**
 * Hook para Notificações
 */
export function useNotificacoes() {
  return useSupabaseCRUD({
    tableName: 'notificacoes',
    queryKey: ['notificacoes'],
    select: '*, usuario:usuarios(*)',
    orderBy: { column: 'created_at', ascending: false }
  })
}

/**
 * Hook para Workflows
 */
export function useWorkflows() {
  return useSupabaseCRUD({
    tableName: 'workflows',
    queryKey: ['workflows'],
    orderBy: { column: 'created_at', ascending: false }
  })
}

/**
 * Hook para Métricas de IA
 */
export function useMetricasIA() {
  return useSupabaseCRUD({
    tableName: 'metricas_ia',
    queryKey: ['metricas-ia'],
    orderBy: { column: 'timestamp', ascending: false }
  })
}

/**
 * Hook para Conversas do Chatbot
 */
export function useConversasChatbot() {
  return useSupabaseCRUD({
    tableName: 'chatbot_conversations',
    queryKey: ['chatbot-conversations'],
    select: '*, usuario:usuarios(*)',
    orderBy: { column: 'created_at', ascending: false }
  })
}

