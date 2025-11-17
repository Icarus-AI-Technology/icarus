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
          "flex min-h-[80px] w-full rounded-[10px] border border-[rgba(0,0,0,0.1)] bg-[hsl(var(--muted))] px-4 py-3 text-[14px] font-[400] ring-offset-background",
          "shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2",
          "focus-visible:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1),inset_-6px_-6px_12px_rgba(255,255,255,0.5),0_0_0_3px_rgba(99,102,241,0.1)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
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
