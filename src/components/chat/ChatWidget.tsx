import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Send, Bot, User, Minimize2, Maximize2, X, Sparkles, RefreshCw,
  Package, Calendar, DollarSign, Truck, ShieldCheck, TrendingUp,
  BarChart3, Settings, ThumbsUp, ThumbsDown,
  Mic, MicOff, ChevronRight, Loader2, History, Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatSession } from '@/hooks/useChatSession';
import { ChatResponseCard, parseMessageContent, type ActionData, type ChatCardData } from './ChatResponseCard';
import { ChatAttachments, AttachButton, type AttachedFile } from './ChatAttachments';
import { useTheme } from '@/hooks/useTheme';

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
    color: '#8b5cf6',
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
  const [showAttachments, setShowAttachments] = useState(false);
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isDark } = useTheme();

  const {
    sessionId,
    messages,
    sendMessage,
    sendFeedback,
    isLoading,
    resetSession,
    loadHistory
  } = useChatSession();

  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Neumorphic styles based on theme
  const neuStyles = {
    background: isDark ? '#15192B' : '#F3F4F6',
    cardBg: isDark ? '#1A1F35' : '#FFFFFF',
    cardHoverBg: isDark ? '#252B44' : '#E5E7EB',
    textPrimary: isDark ? '#FFFFFF' : '#111827',
    textSecondary: isDark ? '#94A3B8' : '#4B5563',
    textMuted: isDark ? '#64748B' : '#6B7280',
    border: isDark ? '#252B44' : '#D1D5DB',
    // Neumorphic shadows
    shadowElevated: isDark 
      ? '6px 6px 12px rgba(0,0,0,0.4), -4px -4px 10px rgba(255,255,255,0.02)'
      : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)',
    shadowInset: isDark
      ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
      : 'inset 3px 3px 6px rgba(0,0,0,0.08), inset -3px -3px 6px rgba(255,255,255,0.8)',
    shadowHover: isDark
      ? '8px 8px 16px rgba(0,0,0,0.5), -6px -6px 14px rgba(255,255,255,0.03)'
      : '8px 8px 16px rgba(0,0,0,0.12), -6px -6px 14px rgba(255,255,255,0.95)',
  };

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

  // Handlers para anexos
  const handleAttach = useCallback((files: AttachedFile[]) => {
    setAttachments(prev => [...prev, ...files]);
  }, []);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleSend = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const messageText = input.trim();
    setInput('');
    setShowCommands(false);
    setShowCategories(false);
    setShowAttachments(false);

    // Incluir anexos na mensagem se houver
    if (attachments.length > 0) {
      const attachmentData = attachments.map(a => ({
        name: a.file.name,
        type: a.type,
        base64: a.base64,
        mimeType: a.file.type,
      }));
      
      // Enviar mensagem com anexos
      await sendMessage(messageText || 'Analise os documentos anexados', { attachments: attachmentData });
      setAttachments([]); // Limpar anexos após envio
    } else {
      await sendMessage(messageText);
    }
  }, [input, isLoading, sendMessage, attachments]);

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

  const handleFeedback = async (messageId: string, feedback: 'positive' | 'negative') => {
    await sendFeedback(messageId, feedback);
  };

  const handleLoadHistory = async () => {
    if (historyLoaded || isLoadingHistory) return;
    setIsLoadingHistory(true);
    await loadHistory();
    setHistoryLoaded(true);
    setIsLoadingHistory(false);
    setShowCategories(false);
  };

  const handleActionClick = (action: ActionData) => {
    if (action.link) {
      window.location.href = action.link;
    }
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
        'rounded-2xl overflow-hidden',
        'transition-all duration-300',
        isMinimized ? 'w-80 h-14' : 'w-[420px] h-[600px]'
      )}
      style={{
        backgroundColor: neuStyles.background,
        border: `1px solid ${neuStyles.border}`,
        boxShadow: isDark 
          ? '0 16px 48px rgba(0, 0, 0, 0.5), 0 8px 24px rgba(99, 102, 241, 0.2)'
          : '0 16px 48px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(99, 102, 241, 0.1)'
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
          {/* Load History Button */}
          {sessionId && !historyLoaded && (
            <button
              onClick={handleLoadHistory}
              disabled={isLoadingHistory}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
              title="Carregar histórico"
            >
              {isLoadingHistory ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <History className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={() => {
              resetSession();
              setHistoryLoaded(false);
              setShowCategories(true);
            }}
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
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4"
            style={{ backgroundColor: neuStyles.background }}
          >
            {/* Welcome Message with Categories */}
            {messages.length === 0 && showCategories && (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1, #8B5CF6, #2DD4BF)',
                      boxShadow: isDark 
                        ? '0 8px 24px rgba(99, 102, 241, 0.4)' 
                        : '0 8px 24px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold mb-1" style={{ color: neuStyles.textPrimary }}>
                    Olá! Sou o ICARUS AI Assistant
                  </h4>
                  <p className="text-sm mb-2" style={{ color: neuStyles.textSecondary }}>
                    Seu copiloto inteligente para gestão OPME
                  </p>
                  <p className="text-xs" style={{ color: neuStyles.textMuted }}>
                    Selecione uma categoria ou digite sua pergunta
                  </p>
                </div>

                {/* Category Grid - Neumorphic 3D */}
                {!selectedCategory ? (
                  <div className="grid grid-cols-2 gap-3">
                    {SUGGESTION_CATEGORIES.map((category) => {
                      const IconComponent = category.icon;
                      return (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className="flex items-center gap-2 p-3 rounded-xl transition-all duration-200 text-left group hover:scale-[1.02] active:scale-[0.98]"
                          style={{
                            backgroundColor: neuStyles.cardBg,
                            boxShadow: neuStyles.shadowElevated,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.boxShadow = neuStyles.shadowHover;
                            e.currentTarget.style.backgroundColor = neuStyles.cardHoverBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.boxShadow = neuStyles.shadowElevated;
                            e.currentTarget.style.backgroundColor = neuStyles.cardBg;
                          }}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ 
                              backgroundColor: `${category.color}${isDark ? '20' : '15'}`,
                              boxShadow: isDark 
                                ? 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -1px -1px 2px rgba(255,255,255,0.02)'
                                : 'inset 2px 2px 4px rgba(0,0,0,0.05), inset -1px -1px 2px rgba(255,255,255,0.5)'
                            }}
                          >
                            <IconComponent className="w-4 h-4" style={{ color: category.color }} />
                          </div>
                          <span 
                            className="text-xs transition-colors flex-1"
                            style={{ color: neuStyles.textSecondary }}
                          >
                            {category.title}
                          </span>
                          <ChevronRight 
                            className="w-3 h-3 ml-auto transition-transform group-hover:translate-x-0.5" 
                            style={{ color: neuStyles.textMuted }} 
                          />
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  // Selected Category Suggestions - Neumorphic 3D
                  <div className="space-y-3">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="flex items-center gap-2 text-xs transition-colors hover:opacity-80"
                      style={{ color: neuStyles.textSecondary }}
                    >
                      <ChevronRight className="w-3 h-3 rotate-180" />
                      Voltar às categorias
                    </button>
                    {SUGGESTION_CATEGORIES.find(c => c.id === selectedCategory)?.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full text-left p-3 rounded-xl text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                        style={{
                          backgroundColor: neuStyles.cardBg,
                          color: neuStyles.textSecondary,
                          boxShadow: neuStyles.shadowElevated,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = neuStyles.shadowHover;
                          e.currentTarget.style.backgroundColor = neuStyles.cardHoverBg;
                          e.currentTarget.style.color = neuStyles.textPrimary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = neuStyles.shadowElevated;
                          e.currentTarget.style.backgroundColor = neuStyles.cardBg;
                          e.currentTarget.style.color = neuStyles.textSecondary;
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
                    'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0'
                  )}
                  style={{
                    backgroundColor: message.role === 'user' 
                      ? neuStyles.cardBg 
                      : isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                    boxShadow: message.role === 'user' 
                      ? neuStyles.shadowInset
                      : 'none'
                  }}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" style={{ color: neuStyles.textSecondary }} />
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
                        ? 'rounded-tr-sm'
                        : 'rounded-tl-sm'
                    )}
                    style={{
                      backgroundColor: message.role === 'user' ? '#6366F1' : neuStyles.cardBg,
                      color: message.role === 'user' ? '#FFFFFF' : neuStyles.textPrimary,
                      boxShadow: message.role === 'assistant' 
                        ? neuStyles.shadowElevated
                        : '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                  >
                    {/* Parse content for structured data */}
                    {(() => {
                      const { text, cards } = parseMessageContent(message.content);
                      return (
                        <>
                          <p className="text-sm whitespace-pre-wrap">{text}</p>
                          {/* Render interactive cards */}
                          {cards.map((card: ChatCardData, idx: number) => (
                            <ChatResponseCard 
                              key={idx} 
                              card={card} 
                              onAction={handleActionClick}
                            />
                          ))}
                        </>
                      );
                    })()}

                    {/* Actions from API response */}
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
                    <p className="text-[10px]" style={{ color: neuStyles.textMuted }}>
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
                          className="p-1 rounded transition-colors"
                          style={{ 
                            color: message.feedback === 'positive' ? '#10B981' : neuStyles.textMuted,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = neuStyles.cardBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Resposta útil"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleFeedback(message.id, 'negative')}
                          className="p-1 rounded transition-colors"
                          style={{ 
                            color: message.feedback === 'negative' ? '#EF4444' : neuStyles.textMuted,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = neuStyles.cardBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
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
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)' }}
                >
                  <Loader2 className="w-4 h-4 text-[#6366F1] animate-spin" />
                </div>
                <div 
                  className="rounded-2xl rounded-tl-sm px-4 py-3"
                  style={{
                    backgroundColor: neuStyles.cardBg,
                    boxShadow: neuStyles.shadowElevated
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: neuStyles.textSecondary }}>Analisando</span>
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

          {/* Command Suggestions Popup - Neumorphic */}
          {showCommands && (
            <div 
              className="absolute bottom-[72px] left-3 right-3 rounded-xl p-2"
              style={{
                backgroundColor: neuStyles.cardBg,
                border: `1px solid ${neuStyles.border}`,
                boxShadow: isDark 
                  ? '0 -8px 24px rgba(0, 0, 0, 0.4)' 
                  : '0 -8px 24px rgba(0, 0, 0, 0.1)'
              }}
            >
              <p className="text-xs px-2 py-1" style={{ color: neuStyles.textMuted }}>Comandos rápidos</p>
              {QUICK_COMMANDS.filter(cmd => cmd.command.includes(input.toLowerCase())).map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => handleCommandClick(cmd.command)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-left"
                  style={{ color: neuStyles.textSecondary }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = neuStyles.cardHoverBg;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <code 
                    className="text-xs px-1.5 py-0.5 rounded"
                    style={{ 
                      color: '#6366F1', 
                      backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.08)' 
                    }}
                  >
                    {cmd.command}
                  </code>
                  <span className="text-xs">{cmd.description}</span>
                </button>
              ))}
            </div>
          )}

          {/* Attachments Panel */}
          {showAttachments && (
            <div 
              className="p-3 border-t"
              style={{ 
                borderColor: neuStyles.border,
                backgroundColor: neuStyles.background 
              }}
            >
              <ChatAttachments
                attachments={attachments}
                onAttach={handleAttach}
                onRemove={handleRemoveAttachment}
                disabled={isLoading}
                maxFiles={5}
                maxSizeMB={10}
              />
            </div>
          )}

          {/* Input Area - Neumorphic */}
          <div 
            className="p-3"
            style={{ 
              borderTop: `1px solid ${neuStyles.border}`,
              backgroundColor: neuStyles.background 
            }}
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              {/* Attach Button */}
              <button
                type="button"
                onClick={() => setShowAttachments(!showAttachments)}
                className={cn(
                  'p-2.5 rounded-xl transition-all relative',
                  showAttachments && 'ring-2 ring-violet-500'
                )}
                style={{
                  backgroundColor: attachments.length > 0 ? 'rgba(139, 92, 246, 0.2)' : neuStyles.cardBg,
                  color: attachments.length > 0 ? '#8B5CF6' : neuStyles.textSecondary,
                  boxShadow: neuStyles.shadowInset
                }}
                title="Anexar documentos (PDF, XML, imagens)"
              >
                <Paperclip className="w-5 h-5" />
                {attachments.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-violet-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">
                    {attachments.length}
                  </span>
                )}
              </button>

              {/* Voice Button */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={cn(
                  'p-2.5 rounded-xl transition-all',
                  isListening && 'animate-pulse'
                )}
                style={{
                  backgroundColor: isListening ? '#EF4444' : neuStyles.cardBg,
                  color: isListening ? '#FFFFFF' : neuStyles.textSecondary,
                  boxShadow: neuStyles.shadowInset
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
                placeholder={attachments.length > 0 ? "Descreva o que deseja analisar..." : "Digite ou use / para comandos..."}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: neuStyles.cardBg,
                  color: neuStyles.textPrimary,
                  boxShadow: neuStyles.shadowInset,
                }}
              />
              
              <button
                type="submit"
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                className="p-2.5 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  boxShadow: isDark 
                    ? '4px 4px 8px rgba(0,0,0,0.3), -2px -2px 4px rgba(255,255,255,0.02), 0 4px 12px rgba(99, 102, 241, 0.3)'
                    : '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.8), 0 4px 12px rgba(99, 102, 241, 0.2)'
                }}
                title="Enviar mensagem"
                aria-label="Enviar mensagem"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>

            {/* Footer Info */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="flex items-center gap-2">
                <p className="text-[10px]" style={{ color: neuStyles.textMuted }}>
                  {sessionId ? `Sessão: ${sessionId.slice(0, 8)}...` : 'Nova sessão'}
                </p>
                {historyLoaded && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-green-400">
                    <History className="w-2.5 h-2.5" />
                    Histórico
                  </span>
                )}
              </div>
              <p className="text-[10px]" style={{ color: neuStyles.textMuted }}>
                Ctrl+K • Esc
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatWidget;
