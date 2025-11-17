// src/components/ui/textarea.tsx
// Componente Textarea seguindo padrão shadcn/ui
// ✅ LOWERCASE filename para compatibilidade case-sensitive

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // Base styles
          "flex min-h-[80px] w-full rounded-md",
          
          // Border & Background
          "border border-input bg-background",
          
          // Spacing
          "px-3 py-2",
          
          // Typography
          "text-sm",
          
          // Focus styles
          "ring-offset-background",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          
          // Placeholder
          "placeholder:text-muted-foreground",
          
          // Disabled state
          "disabled:cursor-not-allowed",
          "disabled:opacity-50",
          
          // Custom className
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
