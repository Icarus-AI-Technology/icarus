import React from 'react';
import { cn } from '@/lib/utils';

export interface NeomorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'inset' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * NeomorphicCard - Card Component with Premium 3D Neuromorphic Effects
 * 
 * Dark Glass Medical Design System - ICARUS v5.1
 * 
 * Variants:
 * - elevated: Raised effect for cards and containers (default)
 * - inset: Recessed effect for inputs and fields
 * - flat: Flat elevated effect for buttons
 */
export const NeomorphicCard = React.forwardRef<HTMLDivElement, NeomorphicCardProps>(
  ({ variant = 'elevated', padding = 'md', className, style, children, ...props }, ref) => {
    const paddingClasses = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      elevated: {
        background: '#15192B',
        borderRadius: '16px',
        boxShadow: '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.03)',
        transition: 'all 0.3s ease',
      },
      inset: {
        background: '#1A1F35',
        borderRadius: '12px',
        boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)',
        transition: 'all 0.3s ease',
      },
      flat: {
        background: '#15192B',
        borderRadius: '12px',
        boxShadow: '6px 6px 12px rgba(0,0,0,0.3), -4px -4px 10px rgba(255,255,255,0.03)',
      },
    };

    return (
      <div
        ref={ref}
        className={cn(
          paddingClasses[padding],
          'hover:translate-y-[-2px]',
          className
        )}
        style={{
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

NeomorphicCard.displayName = 'NeomorphicCard';
