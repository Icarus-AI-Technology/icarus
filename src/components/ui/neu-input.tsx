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
 *
 * An input component with neumorphic design system following ICARUS patterns.
 * Supports labels, error messages, and helper text.
 *
 * @example
 * // Basic input with label
 * <NeuInput
 *   label="Nome do Produto"
 *   placeholder="Ex: Prótese de Joelho"
 *   type="text"
 * />
 *
 * @example
 * // Input with error
 * <NeuInput
 *   label="Email"
 *   type="email"
 *   error="Email inválido"
 *   placeholder="seu@email.com"
 * />
 *
 * @example
 * // Input with helper text
 * <NeuInput
 *   label="Código"
 *   placeholder="PRO-001"
 *   helperText="Formato: PRO-XXX"
 * />
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          type={type}
          className={cn(
            'w-full px-4 py-2.5 rounded-xl',
            'bg-gray-50 text-gray-900',
            'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
            'border border-transparent',
            'transition-all duration-200',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            hasError &&
              'border-red-300 focus:ring-red-500 shadow-[inset_4px_4px_8px_rgba(239,68,68,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
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
            className="mt-1.5 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p
            id={`${props.id}-helper`}
            className="mt-1.5 text-sm text-gray-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

NeuInput.displayName = 'NeuInput';
