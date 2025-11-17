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
 * OraclusX Design System - ICARUS v5.0
 * 
 * Used in KPI Cards header section
 * 
 * @example
 * <NeomorphicIconBox 
 *   icon={Stethoscope} 
 *   colorVariant="cyan" 
 *   size="md" 
 * />
 */
export const NeomorphicIconBox: React.FC<NeomorphicIconBoxProps> = ({
  icon: Icon,
  size = 'md',
  colorVariant = 'indigo',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8 min-w-[2rem] min-h-[2rem]',
    md: 'w-10 h-10 min-w-[2.5rem] min-h-[2.5rem]',
    lg: 'w-14 h-14 min-w-[3.5rem] min-h-[3.5rem]',
  };

  const iconSizeMap = {
    sm: 16,
    md: 20,
    lg: 28,
  };

  // Color variants for light mode
  const colorVariants = {
    cyan: 'bg-[#E0F2FE] text-[#0EA5E9]',
    indigo: 'bg-[#E0E7FF] text-[#6366F1]',
    green: 'bg-[#D1FAE5] text-[#10B981]',
    purple: 'bg-[#EDE9FE] text-[#8B5CF6]',
    orange: 'bg-[#FFEDD5] text-[#F59E0B]',
    blue: 'bg-[#DBEAFE] text-[#3B82F6]',
    red: 'bg-[#FEE2E2] text-[#EF4444]',
    yellow: 'bg-[#FEF9C3] text-[#F59E0B]',
  };

  // Dark mode: uniform blue background
  const darkModeClasses = 'dark:bg-[#1e293b] dark:text-white dark:shadow-[-6px_-6px_12px_rgba(51,65,85,0.4),6px_6px_12px_rgba(0,0,0,0.6)]';

  const renderIcon = () => {
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    if (typeof Icon === 'function') {
      const IconComponent = Icon as React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }>;
      return <IconComponent size={iconSizeMap[size]} strokeWidth={2} className="stroke-current" />;
    }
    
    return null;
  };

  return (
    <div
      className={cn(
        'rounded-[10px]',
        'flex items-center justify-center',
        'bg-[var(--surface-raised)]',
        'shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]',
        'transition-all duration-300',
        sizeMap[size],
        colorVariants[colorVariant],
        darkModeClasses,
        className
      )}
    >
      {renderIcon()}
    </div>
  );
};

NeomorphicIconBox.displayName = 'NeomorphicIconBox';

