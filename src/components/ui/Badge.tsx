/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Badge Component - Dark Glass Medical Design System
 * ICARUS v5.1
 * 
 * - Dark backgrounds with colored text
 * - No borders (neumorphic subtle shadows)
 * - Rounded full
 */
const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full h-6 px-3 py-1 text-xs font-medium transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#6366F1]/20 text-[#818CF8]",
        secondary:
          "bg-[#1A1F35] text-[#94A3B8]",
        destructive:
          "bg-[#EF4444]/20 text-[#EF4444]",
        outline: 
          "bg-transparent border border-[#252B44] text-[#94A3B8]",
        success:
          "bg-[#10B981]/20 text-[#10B981]",
        warning:
          "bg-[#F59E0B]/20 text-[#F59E0B]",
        info:
          "bg-[#3B82F6]/20 text-[#3B82F6]",
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
