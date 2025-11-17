import React from 'react';
import { cn } from '@/lib/utils';

export interface NeomorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'inset' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * NeomorphicCard - Card Component with Premium 3D Neuromorphic Effects
 * 
 * OraclusX Design System - ICARUS v5.0
 * 
 * Variants:
 * - elevated: Raised effect for cards and containers (default)
 * - inset: Recessed effect for inputs and fields
 * - flat: Flat elevated effect for buttons
 * 
 * @example
 * <NeomorphicCard variant="elevated" padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </NeomorphicCard>
 */
export const NeomorphicCard = React.forwardRef<HTMLDivElement, NeomorphicCardProps>(
  ({ variant = 'elevated', padding = 'md', className, children, ...props }, ref) => {
    const variantClasses = {
      elevated: cn(
        'bg-[var(--surface-raised)]',
        'rounded-2xl',
        'shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]',
        'transition-all duration-300',
        'hover:shadow-[12px_12px_24px_var(--shadow-dark),-12px_-12px_24px_var(--shadow-light)]',
        'hover:-translate-y-0.5'
      ),
      inset: cn(
        'bg-[var(--surface-inset)]',
        'rounded-xl',
        'shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]',
        'transition-all duration-300',
        'focus-within:shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light),0_0_0_3px_rgba(99,102,241,0.1)]',
        'focus-within:outline-none'
      ),
      flat: cn(
        'bg-[var(--surface-raised)]',
        'rounded-xl',
        'shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]'
      ),
    };

    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeomorphicCard.displayName = 'NeomorphicCard';

