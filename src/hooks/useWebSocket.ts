/**
 * useWebSocket - Hook para comunicação WebSocket em tempo real
 * 
 * Features:
 * - Conexão automática com reconexão
 * - Estado de conexão reativo
 * - Fila de mensagens quando offline
 * - Suporte a Supabase Edge Functions
 * 
 * @example
 * ```tsx
 * const { messages, sendMessage, isConnected, connectionState } = useWebSocket({
 *   url: 'wss://your-project.supabase.co/functions/v1/chat',
 *   onMessage: (data) => console.log('Received:', data),
 *   autoReconnect: true,
 * });
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error';

export interface WebSocketMessage<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: string;
}

export interface UseWebSocketOptions {
  /** URL do WebSocket (Supabase Edge Function ou outro endpoint) */
  url: string;
  /** Callback quando uma mensagem é recebida */
  onMessage?: (message: WebSocketMessage) => void;
  /** Callback quando a conexão é estabelecida */
  onOpen?: () => void;
  /** Callback quando a conexão é fechada */
  onClose?: () => void;
  /** Callback quando ocorre um erro */
  onError?: (error: Event) => void;
  /** Habilitar reconexão automática (default: true) */
  autoReconnect?: boolean;
  /** Intervalo de reconexão em ms (default: 3000) */
  reconnectInterval?: number;
  /** Número máximo de tentativas de reconexão (default: 5) */
  maxReconnectAttempts?: number;
  /** Habilitar heartbeat para manter conexão viva (default: true) */
  enableHeartbeat?: boolean;
  /** Intervalo de heartbeat em ms (default: 30000) */
  heartbeatInterval?: number;
}

export interface UseWebSocketReturn<T = unknown> {
  /** Lista de mensagens recebidas */
  messages: WebSocketMessage<T>[];
  /** Função para enviar mensagem */
  sendMessage: (type: string, data: unknown) => void;
  /** Estado da conexão */
  connectionState: ConnectionState;
  /** Se está conectado */
  isConnected: boolean;
  /** Se está reconectando */
  isReconnecting: boolean;
  /** Última mensagem recebida */
  lastMessage: WebSocketMessage<T> | null;
  /** Reconectar manualmente */
  reconnect: () => void;
  /** Desconectar */
  disconnect: () => void;
  /** Limpar mensagens */
  clearMessages: () => void;
}

export function useWebSocket<T = unknown>(
  options: UseWebSocketOptions
): UseWebSocketReturn<T> {
  const {
    url,
    onMessage,
    onOpen,
    onClose,
    onError,
    autoReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    enableHeartbeat = true,
    heartbeatInterval = 30000,
  } = options;

  const [messages, setMessages] = useState<WebSocketMessage<T>[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [lastMessage, setLastMessage] = useState<WebSocketMessage<T> | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const messageQueueRef = useRef<{ type: string; data: unknown }[]>([]);

  // Gerar ID único para mensagens
  const generateMessageId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  // Conectar ao WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;
        
        // Enviar mensagens na fila
        while (messageQueueRef.current.length > 0) {
          const queued = messageQueueRef.current.shift();
          if (queued) {
            ws.send(JSON.stringify({
              id: generateMessageId(),
              type: queued.type,
              data: queued.data,
              timestamp: new Date().toISOString(),
            }));
          }
        }

        // Iniciar heartbeat
        if (enableHeartbeat) {
          heartbeatIntervalRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
            }
          }, heartbeatInterval);
        }

        onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WebSocketMessage<T>;
          
          // Ignorar pongs
          if (message.type === 'pong') return;

          setMessages((prev) => [...prev, message]);
          setLastMessage(message);
          onMessage?.(message);
        } catch {
          console.error('Failed to parse WebSocket message:', event.data);
        }
      };

      ws.onclose = () => {
        setConnectionState('disconnected');
        
        // Limpar heartbeat
        if (heartbeatIntervalRef.current) {
          clearInterval(heartbeatIntervalRef.current);
        }

        // Tentar reconectar
        if (autoReconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
          setConnectionState('reconnecting');
          reconnectAttemptsRef.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * reconnectAttemptsRef.current);
        }

        onClose?.();
      };

      ws.onerror = (error) => {
        setConnectionState('error');
        onError?.(error);
      };

      wsRef.current = ws;
    } catch (error) {
      setConnectionState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [
    url,
    autoReconnect,
    reconnectInterval,
    maxReconnectAttempts,
    enableHeartbeat,
    heartbeatInterval,
    generateMessageId,
    onOpen,
    onClose,
    onError,
    onMessage,
  ]);

  // Desconectar
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevenir reconexão
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState('disconnected');
  }, [maxReconnectAttempts]);

  // Reconectar manualmente
  const reconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Enviar mensagem
  const sendMessage = useCallback((type: string, data: unknown) => {
    const message = {
      id: generateMessageId(),
      type,
      data,
      timestamp: new Date().toISOString(),
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      // Adicionar à fila se não estiver conectado
      messageQueueRef.current.push({ type, data });
    }
  }, [generateMessageId]);

  // Limpar mensagens
  const clearMessages = useCallback(() => {
    setMessages([]);
    setLastMessage(null);
  }, []);

  // Conectar ao montar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    messages,
    sendMessage,
    connectionState,
    isConnected: connectionState === 'connected',
    isReconnecting: connectionState === 'reconnecting',
    lastMessage,
    reconnect,
    disconnect,
    clearMessages,
  };
}

export default useWebSocket;

