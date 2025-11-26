/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * OraclusX Design System - Badge Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Border Radius: 9999px (rounded-full) - Circular
 * - Font: text-[12px] font-[500] - CSS vars apenas
 * - Altura: 24px (h-[24px]) - Fixa
 * - Padding: 4px 12px (px-3 py-1)
 * - Primário: bg-[#6366F1] + text-white SEMPRE
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border-transparent h-[24px] px-3 py-1 text-[12px] font-[500] transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#6366F1] text-white hover:bg-[#4F46E5]",
        secondary:
          "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]",
        destructive:
          "bg-[#EF4444] text-white hover:bg-[#DC2626]",
        outline: "border border-[rgba(0,0,0,0.1)] bg-transparent text-[#1F2937] hover:bg-[#F3F4F6]",
        success:
          "bg-[#10B981] text-white hover:bg-[#059669]",
        warning:
          "bg-[#F59E0B] text-white hover:bg-[#D97706]",
        info:
          "bg-[#3B82F6] text-white hover:bg-[#2563EB]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
