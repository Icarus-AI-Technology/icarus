import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'soft' | 'pressed' | 'flat';
  elevation?: 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * NeuCard - Neumorphic Card Component
 *
 * A card component with neumorphic design system following ICARUS patterns.
 * Provides soft, pressed, and flat variants with different elevation levels.
 *
 * @example
 * // Soft card with medium elevation
 * <NeuCard variant="soft" elevation="medium" padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </NeuCard>
 *
 * @example
 * // Pressed card (inset effect)
 * <NeuCard variant="pressed" padding="md">
 *   <div>Pressed content</div>
 * </NeuCard>
 */
export const NeuCard = React.forwardRef<HTMLDivElement, NeuCardProps>(
  (
    {
      variant = 'soft',
      elevation = 'medium',
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      soft: {
        low: 'bg-gradient-to-br from-white to-gray-50 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.9)]',
        medium:
          'bg-gradient-to-br from-white to-gray-50 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]',
        high: 'bg-gradient-to-br from-white to-gray-50 shadow-[12px_12px_24px_rgba(0,0,0,0.12),-12px_-12px_24px_rgba(255,255,255,0.95)]',
      },
      pressed: {
        low: 'bg-gray-50 shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.9)]',
        medium:
          'bg-gray-50 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
        high: 'bg-gray-50 shadow-[inset_6px_6px_12px_rgba(0,0,0,0.12),inset_-6px_-6px_12px_rgba(255,255,255,0.95)]',
      },
      flat: {
        low: 'bg-white border border-gray-200',
        medium: 'bg-white border border-gray-300 shadow-sm',
        high: 'bg-white border border-gray-400 shadow-md',
      },
    };

    // Padding styles
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
      xl: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-2xl transition-all duration-200',
          variantClasses[variant][elevation],
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

NeuCard.displayName = 'NeuCard';
