import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'soft' | 'pressed' | 'flat' | 'elevated';
  elevation?: 'low' | 'medium' | 'high';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * NeuCard - Neumorphic Card Component
 *
 * A card component with neumorphic design system following ICARUS Dark Glass Medical patterns.
 * Automatically adapts to dark/light mode using CSS variables.
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
    // Use CSS classes that respect dark/light mode from index.css
    const variantClasses = {
      soft: {
        low: 'neu-soft',
        medium: 'neu-soft',
        high: 'neu-elevated',
      },
      pressed: {
        low: 'neu-pressed',
        medium: 'neu-pressed',
        high: 'neu-pressed',
      },
      flat: {
        low: 'bg-theme-card',
        medium: 'bg-theme-card shadow-sm',
        high: 'bg-theme-card shadow-md',
      },
      elevated: {
        low: 'neu-elevated',
        medium: 'neu-elevated',
        high: 'neu-elevated',
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
