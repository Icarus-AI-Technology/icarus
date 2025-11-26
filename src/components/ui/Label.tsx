import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * Dark Glass Medical - Label Component
 * ✅ 100% Compliant with ICARUS v5.0 Standards
 * 
 * REGRAS OBRIGATÓRIAS:
 * - Font: text-[14px] font-[500] - CSS vars apenas
 * - Color: text-[#1F2937] (foreground)
 */
const labelVariants = cva(
  "text-[14px] font-[500] leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#1F2937]"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
