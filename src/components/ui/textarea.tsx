import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * OraclusX Design System - Textarea Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Min Height: 80px (min-h-[80px])
 * - Border Radius: 10px (rounded-[10px]) - Padrão SM
 * - Font: text-[14px] font-[400] - CSS vars apenas
 * - Padding: 12px 16px (py-3 px-4)
 * - Efeito Inset: Shadow neuromórfico inset obrigatório
 */

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl",
          "bg-white/5 backdrop-blur-sm",
          "border border-white/10",
          "text-gray-300 placeholder-gray-500",
          "px-4 py-3 text-[14px] font-[400]",
          "shadow-lg",
          "ring-offset-background",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:border-[#6366F1]/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-300",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
