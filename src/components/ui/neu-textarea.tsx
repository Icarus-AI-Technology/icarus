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
 * Dark Glass Medical Design System
 *
 * A textarea component with neumorphic design following ICARUS Dark Glass Medical patterns.
 * Supports labels, character count, validation, and resizing options.
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
          <label className="block text-sm font-medium text-[#94A3B8] mb-2">
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
            'bg-[#1A1F35] text-white',
            'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]',
            'border border-transparent',
            'transition-all duration-200',
            'placeholder:text-[#64748B]',
            'focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError &&
              'border-red-500/50 focus:ring-red-500 shadow-[inset_4px_4px_8px_rgba(239,68,68,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.02)]',
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
              <p id={`${props.id}-error`} className="text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
            {helperText && !error && (
              <p id={`${props.id}-helper`} className="text-sm text-[#64748B]">
                {helperText}
              </p>
            )}
          </div>

          {showCharCount && maxLength && (
            <div
              className={cn(
                'text-sm',
                currentLength > maxLength * 0.9 ? 'text-pink-400' : 'text-[#64748B]'
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
