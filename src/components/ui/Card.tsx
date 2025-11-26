import * as React from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"

/**
 * Card Component - Dark Glass Medical Design System
 * 
 * ICARUS v5.1 - Neumorphic 3D card with no borders
 * Uses useTheme hook for proper dark/light mode support
 */

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => {
    const { isDark } = useTheme()
    
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl transition-all duration-300",
          isDark ? "text-white" : "text-slate-900",
          className
        )}
        style={{
          backgroundColor: isDark ? '#15192B' : '#FFFFFF',
          boxShadow: isDark 
            ? '8px 8px 16px rgba(0,0,0,0.4), -6px -6px 14px rgba(255,255,255,0.02)'
            : '8px 8px 16px rgba(0,0,0,0.08), -6px -6px 14px rgba(255,255,255,0.9)',
          ...style
        }}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isDark } = useTheme()
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 p-6",
        className
      )}
      style={{
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}
      {...props}
    />
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  const { isDark } = useTheme()
  
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        isDark ? "text-white" : "text-slate-900",
        className
      )}
      {...props}
    />
  )
})
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { isDark } = useTheme()
  
  return (
    <p
      ref={ref}
      className={cn(
        "text-sm",
        isDark ? "text-[#94A3B8]" : "text-slate-600",
        className
      )}
      {...props}
    />
  )
})
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { isDark } = useTheme()
  
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-6 pt-0",
        className
      )}
      style={{
        borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
      }}
      {...props}
    />
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
