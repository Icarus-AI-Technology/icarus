import React from 'react';
import { cn } from '@/lib/utils';

export interface Icon3DProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Icon3D Component
 *
 * Simulates 3D icons with neumorphic effects.
 * In production, this would integrate with react-3d-icons or similar library.
 *
 * @example
 * <Icon3D name="save" size="md" />
 */
export function Icon3D({ name, size = 'md', className }: Icon3DProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-lg',
        'bg-gradient-to-br from-white to-gray-100',
        'shadow-[2px_2px_4px_rgba(0,0,0,0.1),-2px_-2px_4px_rgba(255,255,255,0.9)]',
        sizeClasses[size],
        className
      )}
      role="img"
      aria-label={`${name} icon`}
    >
      <span className="text-xs font-medium text-gray-600">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
