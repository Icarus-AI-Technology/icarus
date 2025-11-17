import React from 'react';
import { cn } from '@/lib/utils';
import { NeomorphicCard } from './NeomorphicCard';
import { NeomorphicIconBox } from './NeomorphicIconBox';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  className?: string;
}

/**
 * KPICard - Standard KPI Card Component
 * 
 * OraclusX Design System - ICARUS v5.0
 * 
 * Standard KPI card following the official specification:
 * - Fixed height: 140px (desktop/tablet), 160px (mobile)
 * - Padding: 24px (p-6)
 * - Border radius: 16px (rounded-2xl)
 * - Neuromorphic elevated effect
 * 
 * @example
 * <KPICard
 *   title="Médicos Cirurgiões"
 *   value="847"
 *   icon={Stethoscope}
 *   trend={{ value: 15, direction: 'up' }}
 *   variant="default"
 * />
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  _value,
  icon,
  trend,
  variant = 'default',
  className = '',
}) => {
  const variantClasses = {
    default: 'bg-[var(--surface-raised)]',
    primary: 'bg-[#6366F1] text-white', // Background indigo + texto branco
    success: 'bg-[#10B981] text-white',
    warning: 'bg-[#F59E0B] text-white',
    danger: 'bg-[#EF4444] text-white',
  };

  const isColoredVariant = variant !== 'default';

  return (
    <NeomorphicCard
      variant="elevated"
      padding="lg"
      className={cn(
        variantClasses[variant],
        className
      )}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-3">
        {icon && (
          <NeomorphicIconBox
            icon={icon}
            colorVariant={variant === 'primary' ? 'indigo' : 'cyan'}
            size="md"
          />
        )}
        <h4
          className={cn(
            'text-sm font-medium',
            isColoredVariant ? 'text-white/80' : 'text-[var(--text-tertiary)]'
          )}
        >
          {title}
        </h4>
      </div>

      {/* Content Section */}
      <div className="space-y-2">
        <div
          className={cn(
            'text-3xl font-bold',
            isColoredVariant ? 'text-white' : 'text-[var(--text-primary)]'
          )}
        >
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            {trend.direction === 'up' && (
              <TrendingUp size={16} className="text-green-500" />
            )}
            {trend.direction === 'down' && (
              <TrendingDown size={16} className="text-red-500" />
            )}
            {trend.direction === 'stable' && (
              <Minus size={16} className="text-gray-500" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                trend.direction === 'up' && 'text-green-600',
                trend.direction === 'down' && 'text-red-600',
                trend.direction === 'stable' && 'text-gray-600',
                isColoredVariant && 'text-white/90'
              )}
            >
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {trend.value}
              {typeof trend.value === 'number' && trend.value !== Math.floor(trend.value) ? '' : '%'}
            </span>
          </div>
        )}
      </div>
    </NeomorphicCard>
  );
};

KPICard.displayName = 'KPICard';

