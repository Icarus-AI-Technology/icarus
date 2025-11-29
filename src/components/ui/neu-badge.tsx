import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface NeuBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  dot?: boolean;
  outline?: boolean;
}

/**
 * NeuBadge - Neumorphic Badge Component
 * Dark Glass Medical Design System
 *
 * A badge component with neumorphic design following ICARUS Dark Glass Medical patterns.
 * Supports multiple variants, sizes, icons, and dot indicators.
 */
export const NeuBadge = React.forwardRef<HTMLSpanElement, NeuBadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      icon: Icon,
      dot = false,
      outline = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles - Dark Glass Medical
    const variantClasses = {
      primary: outline
        ? 'bg-[#6366F1]/20 text-[#818CF8] border-[#6366F1]/30'
        : 'bg-[#6366F1] text-white',
      success: outline
        ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30'
        : 'bg-[#10B981] text-white',
      warning: outline
        ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] border-[#8b5cf6]/30'
        : 'bg-[#8b5cf6] text-white',
      danger: outline
        ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30'
        : 'bg-[#EF4444] text-white',
      info: outline
        ? 'bg-[#3B82F6]/20 text-[#3B82F6] border-[#3B82F6]/30'
        : 'bg-[#3B82F6] text-white',
      neutral: outline
        ? 'bg-[#64748B]/20 text-[#94A3B8] border-[#64748B]/30'
        : 'bg-[#64748B] text-white',
    };

    // Size styles
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs gap-1',
      md: 'px-2.5 py-1 text-sm gap-1.5',
      lg: 'px-3 py-1.5 text-base gap-2',
    };

    const iconSizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    const dotSizeClasses = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center font-medium rounded-lg',
          'shadow-[2px_2px_4px_rgba(0,0,0,0.3),-1px_-1px_3px_rgba(255,255,255,0.02)]',
          'transition-all duration-200',
          outline && 'border',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {dot && (
          <span
            className={cn(
              'rounded-full',
              outline ? variantClasses[variant].split(' ')[1] : 'bg-current opacity-80',
              dotSizeClasses[size]
            )}
          />
        )}
        {Icon && <Icon className={iconSizeClasses[size]} />}
        {children}
      </span>
    );
  }
);

NeuBadge.displayName = 'NeuBadge';
