import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface NeomorphicIconBoxProps {
  icon: LucideIcon | React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  colorVariant?: 'cyan' | 'indigo' | 'green' | 'purple' | 'orange' | 'blue' | 'red' | 'yellow';
  className?: string;
}

/**
 * NeomorphicIconBox - Mini Card for Icons with Neuromorphic Effect
 * 
 * Dark Glass Medical Design System - ICARUS v5.1
 * 
 * Used in KPI Cards header section
 * - Dark background (#1A1F35) with inset shadow
 * - Only the icon is colored (no gradient backgrounds)
 */
export const NeomorphicIconBox: React.FC<NeomorphicIconBoxProps> = ({
  icon: Icon,
  size = 'md',
  colorVariant = 'indigo',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  // Icon colors only (background is always dark)
  const iconColors: Record<string, string> = {
    cyan: '#2DD4BF',
    indigo: '#6366F1',
    green: '#10B981',
    purple: '#8B5CF6',
    orange: '#F59E0B',
    blue: '#3B82F6',
    red: '#EF4444',
    yellow: '#F59E0B',
  };

  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    if (typeof Icon === 'function') {
      const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; style?: React.CSSProperties }>;
      return (
        <IconComponent 
          size={iconSizeMap[size]} 
          strokeWidth={2.5} 
          style={{ color: iconColors[colorVariant] }}
        />
      );
    }
    
    return null;
  };

  return (
    <div
      className={cn(
        'rounded-xl flex items-center justify-center flex-shrink-0',
        sizeMap[size],
        className
      )}
      style={{
        background: '#1A1F35',
        boxShadow: 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.02)',
      }}
    >
      {renderIcon()}
    </div>
  );
};

NeomorphicIconBox.displayName = 'NeomorphicIconBox';
