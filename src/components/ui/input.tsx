import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * OraclusX Design System - Input Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Altura: 44px (h-[44px] min-h-[44px]) - FIXA WCAG AAA
 * - Border Radius: 10px (rounded-[10px]) - Padrão SM
 * - Font: text-[14px] font-[400] - CSS vars apenas
 * - Padding: 12px 16px (py-3 px-4)
 * - Efeito Inset: Shadow neuromórfico inset obrigatório
 * - Background: var(--input-background) ou hsl(var(--muted))
 * - Acessibilidade: label, error (role="alert"), helperText
 */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helperText, ...props }, ref) => {
    const inputId = React.useId()
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        
        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-[44px] min-h-[44px] w-full rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[hsl(var(--muted))] px-4 py-3 text-[14px] font-[400] ring-offset-background",
            "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2",
            "focus-visible:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.5),0_0_0_3px_rgba(99,102,241,0.1)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "file:border-0 file:bg-transparent file:text-[14px] file:font-[500] file:text-foreground",
            "transition-all duration-200",
            error && "border-red-500",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${inputId}-error`}
            role="alert"
            className="text-sm text-red-500 mt-2 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${inputId}-helper`}
            className="text-sm text-gray-400 mt-2"
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
