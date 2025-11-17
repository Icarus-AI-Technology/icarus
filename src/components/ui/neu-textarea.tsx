import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: 'none' | 'vertical' | 'horizontal' | 'both';
  showCharCount?: boolean;
  maxLength?: number;
}

/**
 * NeuTextarea - Neumorphic Textarea Component
 *
 * A textarea component with neumorphic design following ICARUS OraclusX patterns.
 * Supports labels, character count, validation, and resizing options.
 *
 * @example
 * // Basic textarea
 * <NeuTextarea
 *   label="Observações"
 *   placeholder="Digite suas observações..."
 *   rows={4}
 * />
 *
 * @example
 * // Textarea with character count
 * <NeuTextarea
 *   label="Descrição"
 *   placeholder="Descreva o produto..."
 *   maxLength={500}
 *   showCharCount
 *   error={errors.descricao}
 * />
 */
export const NeuTextarea = React.forwardRef<
  HTMLTextAreaElement,
  NeuTextareaProps
>(
  (
    {
      label,
      error,
      helperText,
      resize = 'vertical',
      showCharCount = false,
      maxLength,
      className,
      disabled,
      rows = 4,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const currentLength =
      typeof value === 'string' ? value.length : value?.toString().length || 0;

    const resizeClasses = {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    };

    return (
      <div className="w-full">
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={ref}
          rows={rows}
          value={value}
          maxLength={maxLength}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl',
            'bg-gray-50 text-gray-900',
            'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
            'border border-transparent',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError &&
              'border-red-300 focus:ring-red-500 shadow-[inset_4px_4px_8px_rgba(239,68,68,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
            resizeClasses[resize],
            className
          )}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error
              ? `${props.id}-error`
              : helperText
              ? `${props.id}-helper`
              : undefined
          }
          {...props}
        />

        {/* Character Count / Helper / Error */}
        <div className="flex items-center justify-between mt-1.5">
          <div className="flex-1">
            {error && (
              <p id={`${props.id}-error`} className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${props.id}-helper`} className="text-sm text-gray-500">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <div
              className={cn(
                'text-sm',
                currentLength > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
              )}
            >
              {currentLength} / {maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

NeuTextarea.displayName = 'NeuTextarea';
