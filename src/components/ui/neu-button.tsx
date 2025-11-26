import React from 'react';
import { cn } from '@/lib/utils';
import type { Icon3DProps } from './icon-3d';

export interface NeuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'soft' | 'pressed' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactElement<Icon3DProps>;
  iconPosition?: 'left' | 'right';
  confirmDialog?: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  };
}

/**
 * NeuButton - Neumorphic Button Component
 *
 * A button component with neumorphic design system following ICARUS patterns.
 * Supports multiple variants, sizes, loading states, and 3D icons.
 *
 * @example
 * // Primary button with icon
 * <NeuButton
 *   variant="soft"
 *   icon={<Icon3D name="save" />}
 *   iconPosition="left"
 *   loading={isSaving}
 *   onClick={handleSave}
 * >
 *   Salvar
 * </NeuButton>
 *
 * @example
 * // Danger button with confirmation
 * <NeuButton
 *   variant="danger"
 *   confirmDialog={{
 *     title: "Confirmar exclusão",
 *     message: "Esta ação não pode ser desfeita"
 *   }}
 *   onClick={handleDelete}
 * >
 *   Deletar
 * </NeuButton>
 */
export const NeuButton = React.forwardRef<HTMLButtonElement, NeuButtonProps>(
  (
    {
      variant = 'soft',
      size = 'md',
      loading = false,
      icon,
      iconPosition = 'left',
      confirmDialog,
      className,
      children,
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (confirmDialog && !loading) {
        // In production, this would show a modal dialog
        const confirmed = window.confirm(
          `${confirmDialog.title}\n\n${confirmDialog.message}`
        );
        if (!confirmed) return;
      }
      onClick?.(e);
    };

    // Variant styles
    const variantClasses = {
      primary:
        'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.15)]',
      secondary:
        'bg-gray-100 text-gray-700 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.9)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,1)]',
      soft: 'bg-gradient-to-br from-white to-gray-50 text-gray-800 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,1)]',
      pressed:
        'bg-gray-50 text-gray-700 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
      danger:
        'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.1)] hover:shadow-[6px_6px_12px_rgba(0,0,0,0.2),-6px_-6px_12px_rgba(255,255,255,0.15)]',
    };

    // Size styles
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm gap-2 rounded-lg',
      md: 'px-4 py-2 text-base gap-2 rounded-xl',
      lg: 'px-6 py-3 text-lg gap-3 rounded-xl',
      xl: 'px-8 py-4 text-xl gap-4 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium',
          'transition-all duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        disabled={disabled || loading}
        onClick={handleClick}
        {...props}
      >
        {loading && (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
        )}
        {!loading && icon && iconPosition === 'left' && icon}
        {children}
        {!loading && icon && iconPosition === 'right' && icon}
      </button>
    );
  }
);

NeuButton.displayName = 'NeuButton';
