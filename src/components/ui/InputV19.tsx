/**
 * InputV19 - Input com ref como prop (React 19)
 * 
 * Esta é uma versão do Input usando a nova sintaxe do React 19
 * onde ref é uma prop regular, eliminando a necessidade de forwardRef.
 * 
 * @example
 * ```tsx
 * function MyForm() {
 *   const inputRef = useRef<HTMLInputElement>(null);
 *   
 *   return (
 *     <InputV19
 *       ref={inputRef}
 *       label="Nome"
 *       placeholder="Digite seu nome"
 *     />
 *   );
 * }
 * ```
 */

import * as React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

export interface InputV19Props extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Ref do input (React 19 - ref como prop) */
  ref?: React.Ref<HTMLInputElement>;
  /** Label do campo */
  label?: string;
  /** Mensagem de erro */
  error?: string;
  /** Texto de ajuda */
  helperText?: string;
  /** Ícone à esquerda */
  startIcon?: React.ReactNode;
  /** Ícone à direita */
  endIcon?: React.ReactNode;
  /** Variante visual */
  variant?: 'default' | 'glass' | 'neomorphic';
}

/**
 * Input component using React 19 ref-as-prop pattern
 * No forwardRef needed!
 */
export function InputV19({
  ref,
  className,
  label,
  error,
  helperText,
  startIcon,
  endIcon,
  variant = 'default',
  ...props
}: InputV19Props) {
  const variantStyles = {
    default: cn(
      'bg-[var(--surface-inset)]',
      'border border-[var(--border-default)]',
      'shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]'
    ),
    glass: cn(
      'bg-white/5 backdrop-blur-sm',
      'border border-white/10',
      'shadow-lg'
    ),
    neomorphic: cn(
      'bg-[var(--surface-raised)]',
      'shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]',
      'border-none'
    ),
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {props.required && <span className="text-[var(--error-color)] ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {startIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            {startIcon}
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
            'focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50',
            'transition-all duration-200',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[variant],
            error && 'border-2 border-[var(--error-color)] focus:ring-[var(--error-color)]/50',
            startIcon && 'pl-10',
            endIcon && 'pr-10',
            className
          )}
          {...props}
        />
        
        {endIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-[var(--error-color)] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-[var(--text-tertiary)]">{helperText}</p>
      )}
    </div>
  );
}

/**
 * TextareaV19 - Textarea com ref como prop (React 19)
 */
export interface TextareaV19Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  ref?: React.Ref<HTMLTextAreaElement>;
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'default' | 'glass' | 'neomorphic';
}

export function TextareaV19({
  ref,
  className,
  label,
  error,
  helperText,
  variant = 'default',
  ...props
}: TextareaV19Props) {
  const variantStyles = {
    default: cn(
      'bg-[var(--surface-inset)]',
      'border border-[var(--border-default)]',
      'shadow-[inset_2px_2px_4px_var(--shadow-dark),inset_-2px_-2px_4px_var(--shadow-light)]'
    ),
    glass: cn(
      'bg-white/5 backdrop-blur-sm',
      'border border-white/10',
      'shadow-lg'
    ),
    neomorphic: cn(
      'bg-[var(--surface-raised)]',
      'shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]',
      'border-none'
    ),
  };

  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-[var(--text-secondary)]">
          {label}
          {props.required && <span className="text-[var(--error-color)] ml-1">*</span>}
        </label>
      )}
      
      <textarea
        ref={ref}
        className={cn(
          'w-full px-4 py-3 rounded-xl',
          'text-[var(--text-primary)] placeholder-[var(--text-tertiary)]',
          'focus:outline-none focus:ring-2 focus:ring-[#6366F1]/50',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'resize-none',
          'min-h-[120px]',
          variantStyles[variant],
          error && 'border-2 border-[var(--error-color)] focus:ring-[var(--error-color)]/50',
          className
        )}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-[var(--error-color)] flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-[var(--text-tertiary)]">{helperText}</p>
      )}
    </div>
  );
}

export default InputV19;

