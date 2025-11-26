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
  defaultOpen?: boolean;
  onClose?: () => void;
}

export function ChatWidget({
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
        className="fixed bottom-8 right-8 z-[9999] w-16 h-16 rounded-full bg-[#6366F1] text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:shadow-[0_8px_32px_rgba(99,102,241,0.5)] transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#6366F1]/50"
        aria-label="Abrir assistente virtual"
      >
        <Bot className="w-7 h-7" />
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-30" />
      </button>
    );
  }

  // Chat Panel
  return (
    <div
      className={cn(
        'fixed bottom-8 right-8 z-[9999]',
        'flex flex-col',
        'bg-white dark:bg-[#15192B]',
        'border border-gray-200 dark:border-[#252B44]',
        'rounded-2xl overflow-hidden',
        'shadow-2xl',
        'transition-all duration-300',
        isMinimized ? 'w-80 h-14' : 'w-96 h-[520px]'
      )}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 text-white"
        style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#6366F1]" />
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-[#15192B]">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#6366F1]" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Olá! Sou o assistente do ICARUS
                </h4>
                <p className="text-sm text-gray-500 dark:text-[#94A3B8] mb-4">
                  Como posso ajudar você hoje?
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
                      className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-[#1A1F35] text-gray-700 dark:text-[#94A3B8] rounded-full hover:bg-[#6366F1]/10 hover:text-[#6366F1] transition-colors"
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
                      ? 'bg-gray-200 dark:bg-[#1A1F35]'
                      : 'bg-[#6366F1]/10'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-gray-600 dark:text-[#94A3B8]" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#6366F1]" />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5',
                    message.role === 'user'
                      ? 'bg-[#6366F1] text-white rounded-tr-sm'
                      : 'bg-gray-100 dark:bg-[#1A1F35] text-gray-900 dark:text-white rounded-tl-sm'
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
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-white/20 rounded hover:bg-white/30 transition-colors"
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
                      message.role === 'user' ? 'text-white/60' : 'text-gray-400 dark:text-[#64748B]'
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
                <div className="w-8 h-8 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-[#6366F1] animate-pulse" />
                </div>
                <div className="bg-gray-100 dark:bg-[#1A1F35] rounded-2xl rounded-tl-sm px-4 py-3">
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
          <div className="p-3 border-t border-gray-200 dark:border-[#252B44] bg-white dark:bg-[#15192B]">
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
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-[#1A1F35] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-[#64748B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Session indicator */}
            {sessionId && (
              <p className="text-[10px] text-gray-400 dark:text-[#64748B] mt-2 text-center">
                Sessão: {sessionId.slice(0, 8)}...
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWidget;
