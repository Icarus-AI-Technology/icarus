/**
 * useWebSocketContext - Hook para acessar o contexto WebSocket
 * 
 * Separado do provider para evitar warnings de fast refresh.
 * 
 * @example
 * ```tsx
 * const { sendMessage, isConnected, notifications } = useWebSocketContext();
 * ```
 */

import { useContext } from 'react';
import WebSocketContext from '@/contexts/WebSocketContext';

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  
  return context;
}

/**
 * useOptionalWebSocket - Hook opcional que não lança erro se não estiver no provider
 */
export function useOptionalWebSocket() {
  return useContext(WebSocketContext);
}

export default useWebSocketContext;

