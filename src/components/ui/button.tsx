import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-indigo-200 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // PRIMARY: SEMPRE #6366F1 (indigo) + texto branco
        default: cn(
          "bg-[#6366F1] text-white",
          "hover:bg-[#4F46E5]",
          "active:bg-[#4338CA]",
          "shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
          "hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]",
          "hover:-translate-y-0.5",
          "active:shadow-[3px_3px_6px_var(--shadow-dark),-3px_-3px_6px_var(--shadow-light)]",
          "active:translate-y-0"
        ),
        destructive: cn(
          "bg-[#EF4444] text-white",
          "hover:bg-[#DC2626]",
          "active:bg-[#B91C1C]",
          "shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
          "focus-visible:ring-red-200"
        ),
        outline: cn(
          "border border-[var(--border-default)] bg-[var(--surface-raised)] text-[var(--text-primary)]",
          "shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
          "hover:bg-[var(--background-tertiary)]",
          "focus-visible:ring-gray-200"
        ),
        secondary: cn(
          "bg-[var(--surface-raised)] text-[var(--text-primary)]",
          "shadow-[4px_4px_8px_var(--shadow-dark),-4px_-4px_8px_var(--shadow-light)]",
          "hover:shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
          "focus-visible:ring-gray-200"
        ),
        ghost: cn(
          "bg-transparent text-[var(--text-secondary)]",
          "hover:bg-[var(--background-tertiary)]",
          "focus-visible:ring-gray-200"
        ),
        link: "text-[#6366F1] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-3",
        sm: "h-9 px-3 py-1.5 text-sm",
        lg: "h-11 px-8 py-4 text-lg",
        icon: "h-10 w-10",
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
