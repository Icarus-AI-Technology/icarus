import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * OraclusX Design System - Textarea Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Min Height: 88px (min-h-[88px]) - WCAG AAA
 * - Border Radius: 10px (rounded-[10px]) - Padrão SM
 * - Font: text-[14px] font-[400] - CSS vars apenas
 * - Padding: 12px 16px (py-3 px-4)
 * - Efeito Inset: Shadow neuromórfico inset obrigatório
 * - Background: var(--input-background) ou hsl(var(--muted))
 * - Acessibilidade: label, error (role="alert"), helperText
 */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    const textareaId = React.useId()
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            {label}
          </label>
        )}
        
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[88px] w-full rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[hsl(var(--muted))] px-4 py-3 text-[14px] font-[400] ring-offset-background",
            "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2",
            "focus-visible:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.5),0_0_0_3px_rgba(99,102,241,0.1)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200",
            "resize-vertical",
            error && "border-red-500",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
          {...props}
        />
        
        {error && (
          <p 
            id={`${textareaId}-error`}
            className="mt-2 text-sm text-red-600"
            role="alert"
          >
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p 
            id={`${textareaId}-helper`}
            className="mt-2 text-sm text-muted-foreground"
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

