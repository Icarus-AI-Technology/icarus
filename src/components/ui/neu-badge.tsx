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
 *
 * A badge component with neumorphic design following ICARUS Dark Glass Medical patterns.
 * Supports multiple variants, sizes, icons, and dot indicators.
 *
 * @example
 * // Basic badge
 * <NeuBadge variant="success">Ativo</NeuBadge>
 *
 * @example
 * // Badge with icon
 * <NeuBadge variant="primary" icon={Check} size="md">
 *   Aprovado
 * </NeuBadge>
 *
 * @example
 * // Badge with dot indicator
 * <NeuBadge variant="warning" dot>
 *   Pendente
 * </NeuBadge>
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
    // Variant styles
    const variantClasses = {
      primary: outline
        ? 'bg-primary-50 text-primary-700 border-primary-200'
        : 'bg-primary-500 text-white',
      success: outline
        ? 'bg-success-50 text-success-700 border-success-200'
        : 'bg-success-500 text-white',
      warning: outline
        ? 'bg-warning-50 text-warning-700 border-warning-200'
        : 'bg-warning-500 text-white',
      danger: outline
        ? 'bg-danger-50 text-danger-700 border-danger-200'
        : 'bg-danger-500 text-white',
      info: outline
        ? 'bg-blue-50 text-blue-700 border-blue-200'
        : 'bg-blue-500 text-white',
      neutral: outline
        ? 'bg-gray-50 text-gray-700 border-gray-200'
        : 'bg-gray-500 text-white',
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
          'shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.7)]',
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
