import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  iconColor?: string;
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
 * Dark Glass Medical Design System - ICARUS v5.1
 * 
 * Features:
 * - Neumorphic 3D design with proper dark/light mode support
 * - Colored icon backgrounds based on iconColor prop
 * - Different variants (default, primary, success, warning, danger)
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = '#6366F1',
  trend,
  variant = 'default',
  className = '',
}) => {
  const { isDark } = useTheme();

  const isColoredVariant = variant !== 'default';

  // Background colors based on variant
  const variantBackgrounds: Record<string, string> = {
    default: isDark ? '#15192B' : '#FFFFFF',
    primary: '#6366F1',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
  };

  // Shadow styles
  const cardShadow = isDark 
    ? '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.02)'
    : '6px 6px 12px rgba(0,0,0,0.08), -4px -4px 10px rgba(255,255,255,0.9)';

  // Icon box styles
  const iconBoxBg = isColoredVariant 
    ? 'rgba(255,255,255,0.2)' 
    : (isDark ? '#1A1F35' : '#F1F5F9');

  const iconBoxShadow = isColoredVariant 
    ? 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.1)'
    : (isDark 
        ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
        : 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.8)'
      );

  // Icon color - white for colored variants, custom color otherwise
  const finalIconColor = isColoredVariant ? '#FFFFFF' : iconColor;

  return (
    <div
      className={cn(
        'rounded-2xl p-6 transition-all duration-300 hover:translate-y-[-2px]',
        className
      )}
      style={{
        backgroundColor: variantBackgrounds[variant],
        boxShadow: cardShadow,
      }}
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
          >
            <Icon 
              size={22} 
              strokeWidth={2.5} 
              style={{ color: finalIconColor }}
            />
          </div>
        )}
        <h4
          className={cn(
            'text-sm font-medium',
            isColoredVariant 
              ? 'text-white/80' 
              : (isDark ? 'text-[#94A3B8]' : 'text-slate-500')
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
            isColoredVariant 
              ? 'text-white' 
              : (isDark ? 'text-white' : 'text-slate-900')
          )}
        >
          {value}
        </div>

        {trend && (
          <div className="flex items-center gap-2">
            {trend.direction === 'up' && (
              <TrendingUp size={16} className={isColoredVariant ? 'text-white/80' : 'text-green-500'} />
            )}
            {trend.direction === 'down' && (
              <TrendingDown size={16} className={isColoredVariant ? 'text-white/80' : 'text-red-500'} />
            )}
            {trend.direction === 'stable' && (
              <Minus size={16} className={isColoredVariant ? 'text-white/80' : 'text-gray-500'} />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isColoredVariant 
                  ? 'text-white/90'
                  : (trend.direction === 'up' && 'text-green-600'),
                !isColoredVariant && trend.direction === 'down' && 'text-red-600',
                !isColoredVariant && trend.direction === 'stable' && 'text-gray-600'
              )}
            >
              {trend.direction === 'up' ? '+' : trend.direction === 'down' ? '-' : ''}
              {trend.value}
              {typeof trend.value === 'number' && trend.value !== Math.floor(trend.value) ? '' : '%'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

KPICard.displayName = 'KPICard';
