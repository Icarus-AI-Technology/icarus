import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
  /** @deprecated Use iconColor instead */
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'default' | 'info';
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  className?: string;
}

/**
 * KPICard - Standard KPI Card Component
 * 
 * Dark Glass Medical Design System - ICARUS v5.1
 * 
 * Features:
 * - Neumorphic 3D design with consistent dark/light backgrounds
 * - Colored icons via iconColor prop
 * - All cards follow the same neumorphic pattern
 */
// Variant to color mapping
const variantColors: Record<string, string> = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#8b5cf6',
  danger: '#EF4444',
  default: '#6366F1',
  info: '#3B82F6',
};

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  variant,
  trend,
  className = '',
}) => {
  const { isDark } = useTheme();
  
  // Determine icon color: use explicit iconColor, or derive from variant, or default
  const resolvedIconColor = iconColor || (variant ? variantColors[variant] : '#6366F1');

  // Neumorphic card styles - consistent for all cards
  const cardBg = isDark ? '#15192B' : '#FFFFFF';
  const cardShadow = isDark 
    ? '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.02)'
    : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)';

  // Neumorphic icon box styles
  const iconBoxBg = isDark ? '#1A1F35' : '#F1F5F9';
  const iconBoxShadow = isDark 
    ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
    : 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.8)';

  // Text colors
  const titleColor = isDark ? '#94A3B8' : '#64748B';
  const valueColor = isDark ? '#FFFFFF' : '#0F172A';

  return (
    <article
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]',
        className
      )}
      style={{
        backgroundColor: cardBg,
        boxShadow: cardShadow,
      }}
      role="group"
      aria-labelledby={`kpi-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      {/* Header Section */}
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: iconBoxBg,
              boxShadow: iconBoxShadow,
            }}
            aria-hidden="true"
          >
            <Icon 
              size={22} 
              strokeWidth={2.5} 
              style={{ color: resolvedIconColor }}
            />
          </div>
        )}
        <h4
          id={`kpi-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
          className="text-sm font-medium"
          style={{ color: titleColor }}
        >
          {title}
        </h4>
      </div>

      {/* Content Section */}
      <div className="space-y-2">
        <div
          className="text-3xl font-bold"
          style={{ color: valueColor }}
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
                trend.direction === 'up' && 'text-green-500',
                trend.direction === 'down' && 'text-red-500',
                trend.direction === 'stable' && 'text-gray-500'
              )}
            >
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {trend.value}%
            </span>
          </div>
        )}
      </div>
    </article>
  );
};

KPICard.displayName = 'KPICard';
