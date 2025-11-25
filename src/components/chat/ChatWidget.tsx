import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, X, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatSession } from '@/hooks/useChatSession';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  actions?: Array<{
    type: string;
    label: string;
    link?: string;
  }>;
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left';
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function ChatWidget({
  position = 'bottom-right',
  defaultOpen = false,
  onClose
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    sessionId,
    messages,
    sendMessage,
    isLoading,
    resetSession
  } = useChatSession();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');

    await sendMessage(messageText);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
  };

  const suggestions = [
    'Como cadastrar um produto?',
    'Qual o estoque atual?',
    'Como agendar cirurgia?',
    'Validar registro ANVISA',
  ];

  // FAB Button (when closed)
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-[500]',
          positionClasses[position],
          'group relative',
          'w-14 h-14 rounded-full',
          'flex items-center justify-center',
          'bg-primary-500 text-white',
          'transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-primary-500/50',
          'shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)]',
          'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.15)]',
          'active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]'
        )}
        style={{ backgroundColor: '#6366F1' }}
        aria-label="Abrir assistente virtual"
      >
        <Bot className="w-6 h-6" />
        <span
          className={cn(
            'absolute inset-0 rounded-full',
            'animate-ping opacity-20'
          )}
          style={{ backgroundColor: '#6366F1' }}
        />
      </button>
    );
  }

  // Chat Panel
  return (
    <div
      className={cn(
        'fixed z-[500]',
        positionClasses[position],
        'flex flex-col',
        'bg-white dark:bg-gray-900',
        'border border-gray-200 dark:border-gray-700',
        'rounded-2xl overflow-hidden',
        'shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.8)]',
        'dark:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.05)]',
        'transition-all duration-300',
        isMinimized ? 'w-80 h-14' : 'w-96 h-[520px]'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between',
          'px-4 py-3',
          'bg-gradient-to-r from-primary-500 to-primary-600',
          'text-white'
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Assistente ICARUS</h3>
            {!isMinimized && (
              <p className="text-xs text-white/70">Online - Pronto para ajudar</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={resetSession}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Nova conversa"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title={isMinimized ? 'Expandir' : 'Minimizar'}
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-500" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Ola! Sou o assistente do ICARUS
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Como posso ajudar voce hoje?
                </p>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setInput(suggestion);
                        inputRef.current?.focus();
                      }}
                      className={cn(
                        'px-3 py-1.5 text-xs',
                        'bg-gray-100 dark:bg-gray-800',
                        'text-gray-700 dark:text-gray-300',
                        'rounded-full',
                        'hover:bg-primary-100 hover:text-primary-700',
                        'dark:hover:bg-primary-900/30 dark:hover:text-primary-400',
                        'transition-colors'
                      )}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message List */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3',
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                    message.role === 'user'
                      ? 'bg-gray-200 dark:bg-gray-700'
                      : 'bg-primary-100 dark:bg-primary-900/30'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary-500" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-tl-sm'
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {/* Actions */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action, idx) => (
                        <a
                          key={idx}
                          href={action.link || '#'}
                          className={cn(
                            'inline-flex items-center gap-1',
                            'px-2 py-1 text-xs',
                            'bg-white/20 rounded',
                            'hover:bg-white/30 transition-colors'
                          )}
                        >
                          {action.label}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Timestamp */}
                  <p
                    className={cn(
                      'text-[10px] mt-1',
                      message.role === 'user' ? 'text-white/60' : 'text-gray-400'
                    )}
                  >
                    {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-500 animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className={cn(
                  'flex-1 px-4 py-2.5',
                  'bg-gray-100 dark:bg-gray-800',
                  'text-gray-900 dark:text-white',
                  'placeholder-gray-500 dark:placeholder-gray-400',
                  'rounded-xl',
                  'text-sm',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'shadow-[inset_2px_2px_4px_rgba(0,0,0,0.06),inset_-2px_-2px_4px_rgba(255,255,255,0.5)]',
                  'dark:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2),inset_-2px_-2px_4px_rgba(255,255,255,0.05)]'
                )}
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className={cn(
                  'p-2.5 rounded-xl',
                  'bg-primary-500 text-white',
                  'hover:bg-primary-600',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'transition-colors',
                  'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.1)]'
                )}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Session indicator */}
            {sessionId && (
              <p className="text-[10px] text-gray-400 mt-2 text-center">
                Sessao: {sessionId.slice(0, 8)}...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWidget;
