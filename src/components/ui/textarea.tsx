/**
 * Textarea Component - OraclusX Design System
 * 
 * Neuromórfico Inset (Rebaixado)
 * Segue mesmo padrão do Input com efeito 3D
 */
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label style={{ fontSize: 'var(--font-sm)', fontWeight: 'var(--font-medium)' }} className="block text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          className={cn(
            // Base styles
            'w-full px-4 py-3 rounded-xl',
            'text-gray-900 dark:text-gray-100',
            'bg-gray-50 dark:bg-gray-900',
            'min-h-[120px]',
            'resize-y',
            // Neuromórfico inset
            'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.15),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]',
            'dark:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.5),inset_-4px_-4px_8px_rgba(255,255,255,0.05)]',
            // Focus state
            'focus:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.15),inset_-6px_-6px_12px_rgba(255,255,255,0.8),0_0_0_3px_rgba(99,102,241,0.1)]',
            'focus:outline-none',
            // Placeholder
            'placeholder:text-gray-400 dark:placeholder:text-gray-600',
            // Transition
            'transition-all duration-200',
            // Error state
            error && 'border-2 border-red-500 focus:ring-red-200',
            // Disabled
            'disabled:opacity-60 disabled:cursor-not-allowed',
            className
          )}
          style={{ fontSize: 'var(--font-sm)' }}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? 'error-message' : helperText ? 'helper-text' : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id="error-message"
            style={{ fontSize: 'var(--font-sm)' }}
            className="text-red-500 flex items-center gap-1.5"
            role="alert"
          >
            <AlertCircle className="size-4" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id="helper-text"
            style={{ fontSize: 'var(--font-sm)' }}
            className="text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"

export { Textarea }
