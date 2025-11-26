/**
 * WebSocketContext - Contexto global para WebSocket
 * 
 * Provê conexão WebSocket compartilhada em toda a aplicação.
 * 
 * @example
 * ```tsx
 * // No App.tsx
 * <WebSocketProvider url="wss://your-project.supabase.co/functions/v1/realtime">
 *   <App />
 * </WebSocketProvider>
 * 
 * // Em qualquer componente
 * const { sendMessage, isConnected, notifications } = useWebSocketContext();
 * ```
 */

import React, { createContext, useCallback, useMemo, useState } from 'react';
import { useWebSocket, type WebSocketMessage, type ConnectionState } from '@/hooks/useWebSocket';

// Tipos de notificação
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: Record<string, unknown>;
}

// Tipos de mensagem do sistema
export type SystemMessageType = 
  | 'notification'
  | 'chat'
  | 'alert'
  | 'update'
  | 'sync'
  | 'icarus_brain_result';

interface WebSocketContextValue {
  // Estado da conexão
  connectionState: ConnectionState;
  isConnected: boolean;
  isReconnecting: boolean;
  
  // Mensagens e notificações
  messages: WebSocketMessage[];
  notifications: Notification[];
  unreadCount: number;
  
  // Ações
  sendMessage: (type: string, data: unknown) => void;
  sendChatMessage: (message: string, roomId?: string) => void;
  requestIcarusBrainAnalysis: (type: string, data: unknown) => void;
  
  // Notificações
  markNotificationAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  
  // Controle de conexão
  reconnect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

interface WebSocketProviderProps {
  children: React.ReactNode;
  /** URL do WebSocket endpoint */
  url?: string;
  /** Callback quando uma notificação é recebida */
  onNotification?: (notification: Notification) => void;
}

export function WebSocketProvider({ 
  children, 
  url,
  onNotification,
}: WebSocketProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // URL padrão para Supabase Edge Function
  const wsUrl = url || `${import.meta.env.VITE_SUPABASE_URL?.replace('https://', 'wss://')}/functions/v1/realtime`;

  // Handler de mensagens
  const handleMessage = useCallback((message: WebSocketMessage) => {
    if (message.type === 'notification') {
      const notification: Notification = {
        id: message.id,
        type: (message.data as { type?: 'info' | 'success' | 'warning' | 'error' })?.type || 'info',
        title: (message.data as { title?: string })?.title || 'Notificação',
        message: (message.data as { message?: string })?.message || '',
        timestamp: message.timestamp,
        read: false,
        data: message.data as Record<string, unknown>,
      };
      
      setNotifications((prev) => [notification, ...prev]);
      onNotification?.(notification);
    }
  }, [onNotification]);

  const {
    messages,
    sendMessage,
    connectionState,
    isConnected,
    isReconnecting,
    reconnect,
    disconnect,
  } = useWebSocket({
    url: wsUrl,
    onMessage: handleMessage,
    autoReconnect: true,
    maxReconnectAttempts: 10,
  });

  // Enviar mensagem de chat
  const sendChatMessage = useCallback((message: string, roomId?: string) => {
    sendMessage('chat', {
      message,
      roomId: roomId || 'general',
      userId: 'current-user', // TODO: Pegar do auth context
    });
  }, [sendMessage]);

  // Solicitar análise do IcarusBrain
  const requestIcarusBrainAnalysis = useCallback((type: string, data: unknown) => {
    sendMessage('icarus_brain_request', {
      analysisType: type,
      data,
      requestedAt: new Date().toISOString(),
    });
  }, [sendMessage]);

  // Marcar notificação como lida
  const markNotificationAsRead = useCallback((id: string) => {
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  // Limpar notificações
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Contar não lidas
  const unreadCount = useMemo(() => 
    notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value = useMemo<WebSocketContextValue>(() => ({
    connectionState,
    isConnected,
    isReconnecting,
    messages,
    notifications,
    unreadCount,
    sendMessage,
    sendChatMessage,
    requestIcarusBrainAnalysis,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect,
    disconnect,
  }), [
    connectionState,
    isConnected,
    isReconnecting,
    messages,
    notifications,
    unreadCount,
    sendMessage,
    sendChatMessage,
    requestIcarusBrainAnalysis,
    markNotificationAsRead,
    markAllAsRead,
    clearNotifications,
    reconnect,
    disconnect,
  ]);

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export default WebSocketContext;

