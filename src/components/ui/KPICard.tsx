import React from 'react';
import { cn } from '@/lib/utils';
import { NeomorphicCard } from './NeomorphicCard';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon | React.ReactNode;
  iconColor?: string; // Direct color for icon
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
 * Standard KPI card following the official specification:
 * - Fixed height: 140px (desktop/tablet), 160px (mobile)
 * - Padding: 24px (p-6)
 * - Border radius: 16px (rounded-2xl)
 * - Neuromorphic elevated effect
 * - Colored icons via iconColor prop
 * 
 * @example
 * <KPICard
 *   title="Médicos Cirurgiões"
 *   value="847"
 *   icon={Stethoscope}
 *   iconColor="#2DD4BF"
 *   trend={{ value: 15, direction: 'up' }}
 *   variant="default"
 * />
 */
export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon,
  iconColor,
  trend,
  variant = 'default',
  className = '',
}) => {
  const { isDark } = useTheme();

  const variantClasses = {
    default: isDark ? 'bg-[#15192B]' : 'bg-white',
    primary: 'bg-[#6366F1] text-white', // Background indigo + texto branco
    success: 'bg-[#10B981] text-white',
    warning: 'bg-[#F59E0B] text-white',
    danger: 'bg-[#EF4444] text-white',
  };

  const isColoredVariant = variant !== 'default';

  // Default icon colors by variant if not provided
  const defaultIconColors: Record<string, string> = {
    default: '#6366F1',
    primary: '#FFFFFF',
    success: '#FFFFFF',
    warning: '#FFFFFF',
    danger: '#FFFFFF',
  };

  const finalIconColor = isColoredVariant 
    ? '#FFFFFF' 
    : (iconColor || defaultIconColors[variant]);

  const renderIcon = () => {
    if (!icon) return null;
    
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    if (typeof icon === 'function') {
      const IconComponent = icon as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
      return (
        <IconComponent 
          size={22} 
          strokeWidth={2.5} 
          style={{ color: finalIconColor }}
        />
      );
    }
    
    return null;
  };

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
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isColoredVariant 
                ? 'rgba(255,255,255,0.15)' 
                : (isDark ? '#1A1F35' : '#F1F5F9'),
              boxShadow: isColoredVariant 
                ? 'inset 2px 2px 4px rgba(0,0,0,0.2), inset -2px -2px 4px rgba(255,255,255,0.1)'
                : (isDark 
                    ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)'
                    : 'inset 2px 2px 4px rgba(0,0,0,0.05), inset -2px -2px 4px rgba(255,255,255,0.8)'
                  ),
            }}
          >
            {renderIcon()}
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
    </NeomorphicCard>
  );
};

KPICard.displayName = 'KPICard';
