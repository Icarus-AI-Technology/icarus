import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ChatbotFabProps {
  onClick?: () => void;
  open?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  color?: string;
  badge?: number;
  tooltip?: string;
}

/**
 * ChatbotFab - Chatbot Floating Action Button
 *
 * A floating action button for the ICARUS chatbot with neumorphic design.
 * Positioned in bottom-right corner by default with primary color (#6366F1).
 *
 * @example
 * // Basic FAB
 * <ChatbotFab onClick={() => setShowChat(true)} />
 *
 * @example
 * // FAB with badge and custom position
 * <ChatbotFab
 *   open={isChatOpen}
 *   onClick={toggleChat}
 *   badge={3}
 *   position="bottom-left"
 *   tooltip="Assistente Virtual ICARUS"
 * />
 */
export const ChatbotFab = React.forwardRef<HTMLButtonElement, ChatbotFabProps>(
  (
    {
      onClick,
      open = false,
      position = 'bottom-right',
      color = '#6366F1',
      badge,
      tooltip = 'Assistente Virtual',
    },
    ref
  ) => {
    const positionClasses = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6',
    };

    return (
      <div className={cn('fixed z-[500]', positionClasses[position])}>
        {/* Tooltip */}
        {tooltip && !open && (
          <div
            className={cn(
              'absolute bottom-full mb-2 right-0',
              'px-3 py-2 rounded-lg',
              'bg-gray-900 text-white text-sm whitespace-nowrap',
              'opacity-0 pointer-events-none transition-opacity',
              'group-hover:opacity-100'
            )}
          >
            {tooltip}
          </div>
        )}

        {/* FAB Button */}
        <button
          ref={ref}
          onClick={onClick}
          className={cn(
            'group relative',
            'w-14 h-14 rounded-full',
            'flex items-center justify-center',
            'transition-all duration-300',
            'focus:outline-none focus:ring-4 focus:ring-primary-500/50',
            'shadow-[8px_8px_16px_rgba(0,0,0,0.2),-8px_-8px_16px_rgba(255,255,255,0.1)]',
            'hover:shadow-[12px_12px_24px_rgba(0,0,0,0.3),-12px_-12px_24px_rgba(255,255,255,0.15)]',
            'active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]',
            open && 'rotate-90'
          )}
          style={{ backgroundColor: color }}
          aria-label={open ? 'Fechar chat' : 'Abrir chat'}
          title={tooltip}
        >
          {/* Icon */}
          <div className="relative">
            {open ? (
              <X className="w-6 h-6 text-white" strokeWidth={2.5} />
            ) : (
              <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
            )}

            {/* Badge */}
            {badge && badge > 0 && !open && (
              <span
                className={cn(
                  'absolute -top-1 -right-1',
                  'min-w-[18px] h-[18px] px-1',
                  'flex items-center justify-center',
                  'text-xs font-bold text-white',
                  'bg-red-500 rounded-full',
                  'shadow-[2px_2px_4px_rgba(0,0,0,0.3)]',
                  'animate-pulse'
                )}
              >
                {badge > 9 ? '9+' : badge}
              </span>
            )}
          </div>

          {/* Ripple Effect */}
          {!open && (
            <span
              className={cn(
                'absolute inset-0 rounded-full',
                'animate-ping opacity-20'
              )}
              style={{ backgroundColor: color }}
            />
          )}
        </button>
      </div>
    );
  }
);

ChatbotFab.displayName = 'ChatbotFab';
