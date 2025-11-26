import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User, Minimize2, Maximize2, X, Sparkles, RefreshCw,
  Package, Calendar, DollarSign, Truck, ShieldCheck, TrendingUp,
  BarChart3, Settings, ThumbsUp, ThumbsDown,
  Mic, MicOff, ChevronRight, Loader2
} from 'lucide-react';
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
  feedback?: 'positive' | 'negative' | null;
}

interface SuggestionCategory {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  suggestions: string[];
}

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'estoque',
    title: 'Gestão de Estoque',
    icon: Package,
    color: '#10B981',
    suggestions: [
      'Quais produtos estão em falta?',
      'Mostre itens com validade próxima',
      'Crie um pedido de compra automático',
      'Analise o giro de estoque'
    ]
  },
  {
    id: 'financeiro',
    title: 'Financeiro',
    icon: DollarSign,
    color: '#F59E0B',
    suggestions: [
      'Qual o fluxo de caixa desta semana?',
      'Mostre clientes inadimplentes',
      'Gere um boleto para o cliente',
      'Previsão de receita do mês'
    ]
  },
  {
    id: 'cirurgias',
    title: 'Cirurgias',
    icon: Calendar,
    color: '#EF4444',
    suggestions: [
      'Gere justificativa médica',
      'Valide requisitos ANVISA/TUSS',
      'Reserve materiais para cirurgia',
      'Calcule custo estimado'
    ]
  },
  {
    id: 'vendas',
    title: 'Vendas e CRM',
    icon: TrendingUp,
    color: '#8B5CF6',
    suggestions: [
      'Quais leads têm maior chance de fechar?',
      'Crie uma proposta comercial',
      'Mostre oportunidades abertas',
      'Análise de funil de vendas'
    ]
  },
  {
    id: 'logistica',
    title: 'Logística',
    icon: Truck,
    color: '#3B82F6',
    suggestions: [
      'Otimize rota para entregas',
      'Rastreie a entrega',
      'Qual transportadora tem melhor SLA?',
      'Calcule frete para destino'
    ]
  },
  {
    id: 'compliance',
    title: 'Compliance',
    icon: ShieldCheck,
    color: '#14B8A6',
    suggestions: [
      'Status de compliance ANVISA',
      'Documentos vencendo este mês',
      'Gere relatório de auditoria',
      'Há recalls ativos?'
    ]
  },
  {
    id: 'analytics',
    title: 'Analytics',
    icon: BarChart3,
    color: '#EC4899',
    suggestions: [
      'Análise de churn dos últimos 3 meses',
      'Previsão de demanda trimestral',
      'Segmentação de clientes',
      'Correlação preço e volume'
    ]
  },
  {
    id: 'geral',
    title: 'Ajuda Geral',
    icon: Settings,
    color: '#6366F1',
    suggestions: [
      'Ver alertas ativos',
      'Tour pelo sistema',
      'Configurar preferências',
      'Atalhos de teclado'
    ]
  }
];

const QUICK_COMMANDS = [
  { command: '/estoque', description: 'Consultar estoque' },
  { command: '/faturamento', description: 'Acessar faturamento' },
  { command: '/cirurgias', description: 'Ver cirurgias agendadas' },
  { command: '/alertas', description: 'Listar alertas ativos' },
  { command: '/ajuda', description: 'Ver comandos disponíveis' }
];

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
  const [showCategories, setShowCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCommands, setShowCommands] = useState(false);
  const [isListening, setIsListening] = useState(false);
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

  // Show command suggestions when typing /
  useEffect(() => {
    setShowCommands(input.startsWith('/'));
  }, [input]);

  // Hide categories when there are messages
  useEffect(() => {
    if (messages.length > 0) {
      setShowCategories(false);
    }
  }, [messages.length]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setShowCommands(false);
    setShowCategories(false);

    await sendMessage(messageText);
  }, [input, isLoading, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setShowCommands(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setSelectedCategory(null);
    inputRef.current?.focus();
  };

  const handleCommandClick = (command: string) => {
    setInput(command + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const handleVoiceToggle = () => {
    // Placeholder for voice functionality
    setIsListening(!isListening);
    // TODO: Implement Web Speech API
  };

  const handleFeedback = (_messageId: string, _feedback: 'positive' | 'negative') => {
    // TODO: Send feedback to backend
    console.log('Feedback:', _messageId, _feedback);
  };

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
        'bg-[#15192B]',
        'border border-[#252B44]',
        'rounded-2xl overflow-hidden',
        'transition-all duration-300',
        isMinimized ? 'w-80 h-14' : 'w-[420px] h-[600px]'
      )}
      style={{
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(99, 102, 241, 0.15)'
      }}
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
            <h3 className="font-semibold text-sm">ICARUS AI Assistant</h3>
            {!isMinimized && (
              <p className="text-xs text-white/70">14 Agentes • Online</p>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#15192B]">
            {/* Welcome Message with Categories */}
            {messages.length === 0 && showCategories && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                      boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-1">
                    Olá! Sou o ICARUS AI Assistant
                  </h4>
                  <p className="text-sm text-[#94A3B8] mb-2">
                    Seu copiloto inteligente para gestão OPME
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Selecione uma categoria ou digite sua pergunta
                  </p>
                </div>

                {/* Category Grid */}
                {!selectedCategory ? (
                  <div className="grid grid-cols-2 gap-2">
                    {SUGGESTION_CATEGORIES.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex items-center gap-2 p-3 rounded-xl bg-[#1A1F35] hover:bg-[#252B44] transition-all text-left group"
                          style={{
                            boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02)'
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                          </div>
                          <span className="text-xs text-[#94A3B8] group-hover:text-white transition-colors">
                            {category.title}
                          </span>
                          <ChevronRight className="w-3 h-3 text-[#64748B] ml-auto group-hover:text-white transition-colors" />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Selected Category Suggestions
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white transition-colors"
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                      Voltar às categorias
                    </button>
                    {SUGGESTION_CATEGORIES.find(c => c.id === selectedCategory)?.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 rounded-xl bg-[#1A1F35] hover:bg-[#252B44] text-sm text-[#94A3B8] hover:text-white transition-all"
                        style={{
                          boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02)'
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
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
                      ? 'bg-[#1A1F35]'
                      : 'bg-[#6366F1]/20'
                  )}
                  style={{
                    boxShadow: message.role === 'user' 
                      ? 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(255,255,255,0.02)'
                      : 'none'
                  }}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-[#94A3B8]" />
                  ) : (
                    <Bot className="w-4 h-4 text-[#6366F1]" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex flex-col max-w-[75%]">
                  <div
                    className={cn(
                      'rounded-2xl px-4 py-2.5',
                      message.role === 'user'
                        ? 'bg-[#6366F1] text-white rounded-tr-sm'
                        : 'bg-[#1A1F35] text-white rounded-tl-sm'
                    )}
                    style={{
                      boxShadow: message.role === 'assistant' 
                        ? '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02)'
                        : '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Actions */}
                    {message.actions && message.actions.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {message.actions.map((action, idx) => (
                          <a
                            key={idx}
                            href={action.link || '#'}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                          >
                            {action.label}
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Feedback & Timestamp */}
                  <div className={cn(
                    'flex items-center gap-2 mt-1 px-1',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}>
                    <p className="text-[10px] text-[#64748B]">
                      {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    
                    {/* Feedback buttons for assistant messages */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleFeedback(message.id, 'positive')}
                          className={cn(
                            'p-1 rounded hover:bg-[#1A1F35] transition-colors',
                            message.feedback === 'positive' ? 'text-green-400' : 'text-[#64748B]'
                          )}
                          title="Resposta útil"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'negative')}
                          className={cn(
                            'p-1 rounded hover:bg-[#1A1F35] transition-colors',
                            message.feedback === 'negative' ? 'text-red-400' : 'text-[#64748B]'
                          )}
                          title="Resposta não útil"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-[#6366F1]/20 flex items-center justify-center">
                  <Loader2 className="w-4 h-4 text-[#6366F1] animate-spin" />
                </div>
                <div 
                  className="bg-[#1A1F35] rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{
                    boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#94A3B8]">Analisando</span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#6366F1] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-[#2DD4BF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={scrollRef} />
          </div>

          {/* Command Suggestions Popup */}
          {showCommands && (
            <div 
              className="absolute bottom-[72px] left-3 right-3 bg-[#1A1F35] rounded-xl p-2 border border-[#252B44]"
              style={{
                boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.3)'
              }}
            >
              <p className="text-xs text-[#64748B] px-2 py-1">Comandos rápidos</p>
              {QUICK_COMMANDS.filter(cmd => cmd.command.includes(input.toLowerCase())).map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCommandClick(cmd.command)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-[#252B44] transition-colors text-left"
                >
                  <code className="text-xs text-[#6366F1] bg-[#6366F1]/10 px-1.5 py-0.5 rounded">{cmd.command}</code>
                  <span className="text-xs text-[#94A3B8]">{cmd.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="p-3 border-t border-[#252B44] bg-[#15192B]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={cn(
                  'p-2.5 rounded-xl transition-all',
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-[#1A1F35] text-[#94A3B8] hover:text-white'
                )}
                style={{
                  boxShadow: 'inset 2px 2px 4px rgba(0,0,0,0.3), inset -1px -1px 2px rgba(255,255,255,0.02)'
                }}
                title={isListening ? 'Parar gravação' : 'Usar voz'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite ou use / para comandos..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-[#1A1F35] text-white placeholder-[#64748B] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(255,255,255,0.02)'
                }}
              />
              
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2.5 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  boxShadow: '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02), 0 4px 12px rgba(99, 102, 241, 0.3)'
                }}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Footer Info */}
            <div className="flex items-center justify-between mt-2 px-1">
              <p className="text-[10px] text-[#64748B]">
                {sessionId ? `Sessão: ${sessionId.slice(0, 8)}...` : 'Nova sessão'}
              </p>
              <p className="text-[10px] text-[#64748B]">
                Ctrl+K para abrir • Esc para fechar
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWidget;
