import React from 'react';
import { cn } from '@/lib/utils';

export interface NeuInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * NeuInput - Neumorphic Input Component
 * Dark Glass Medical Design System
 *
 * An input component with neumorphic design system following ICARUS patterns.
 * Supports labels, error messages, and helper text.
 */
export const NeuInput = React.forwardRef<HTMLInputElement, NeuInputProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      disabled,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
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
            className
          )}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p
            id={`${props.id}-error`}
            className="mt-1.5 text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-1.5 text-sm text-slate-500 dark:text-slate-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
