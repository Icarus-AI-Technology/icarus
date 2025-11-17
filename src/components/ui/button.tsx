import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * OraclusX Design System - Button Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Border Radius: 10px (rounded-[10px]) - ÚNICO valor permitido
 * - Primário: bg-[#6366F1] + text-white SEMPRE
 * - Alturas: 36px (sm), 40px (md), 44px (lg) - Fixas
 * - Font: text-[14px] font-[500] - CSS vars apenas
 * - Min Width: 44px (touch target WCAG AAA)
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[10px] text-[14px] font-[500] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[#6366F1] text-white hover:bg-[#4F46E5] active:bg-[#4338CA] shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.7)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.7)]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]",
        outline:
          "border border-[rgba(0,0,0,0.1)] bg-transparent hover:bg-[#F3F4F6] text-[#1F2937]",
        secondary:
          "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB] shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)]",
        ghost: "bg-transparent hover:bg-[#F3F4F6] text-[#1F2937]",
        link: "text-[#6366F1] underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-[40px] min-h-[40px] px-5 min-w-[44px]",
        sm: "h-[36px] min-h-[36px] px-4 min-w-[44px]",
        lg: "h-[44px] min-h-[44px] px-6 min-w-[44px]",
        icon: "h-[44px] w-[44px] min-w-[44px] min-h-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
