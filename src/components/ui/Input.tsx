import React, { useId } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Input Component - Dark Glass Medical Design System
 * 
 * ICARUS v5.1
 * - Theme-aware backgrounds
 * - Inset shadow for depth effect
 * - No borders, neumorphic styling
 * - WCAG 2.1 AA accessible
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const { isDark } = useTheme()
    const generatedId = useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    // Theme-aware styles - CORRIGIDO para melhor contraste
    const inputBg = isDark ? '#1A1F35' : '#F1F5F9'
    const inputText = isDark ? 'text-white' : 'text-slate-900'
    const placeholderColor = isDark ? 'placeholder-slate-500' : 'placeholder-slate-400'
    const labelColor = isDark ? 'text-slate-200' : 'text-slate-700'  // Mais visível em ambos os modos
    const helperColor = isDark ? 'text-slate-400' : 'text-slate-500'
    const inputShadow = isDark
      ? 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.02)'
      : 'inset 2px 2px 4px rgba(0,0,0,0.08), inset -2px -2px 4px rgba(255,255,255,0.8)'

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn('block text-sm font-medium', labelColor)}
          >
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            inputText,
            placeholderColor,
            'focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30',
            'transition-all duration-200',
            error && 'ring-2 ring-[#EF4444]/50',
            className
          )}
          style={{
            backgroundColor: inputBg,
            boxShadow: inputShadow,
          }}
          {...props}
        />
        
        {error && (
          <p id={errorId} className="text-sm text-[#EF4444] flex items-center gap-1" role="alert">
            <AlertCircle className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p id={helperId} className={cn('text-sm', helperColor)}>{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
