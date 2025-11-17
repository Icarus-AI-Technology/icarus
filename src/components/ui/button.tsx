/**
 * Button Component - OraclusX Design System
 * 
 * Neuromórfico Premium 3D
 * REGRA DE OURO: Variant primary SEMPRE usa #6366F1 (indigo) + texto branco
 * Hard Gate: Validação automática de cores
 */
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    className = '', 
    children, 
    ...props 
  }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center gap-2',
      'font-semibold rounded-xl',
      'transition-all duration-200',
      'focus:outline-none focus:ring-4',
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none',
      '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    )

    const variantClasses = {
      primary: cn(
        // SEMPRE indigo #6366F1 + texto branco (WCAG AAA 8.59:1)
        'bg-[#6366F1] text-white',
        'hover:bg-[#4F46E5]',
        'active:bg-[#4338CA] active:scale-[0.98]',
        // Efeito neuromórfico
        'shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.8)]',
        'hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.8)]',
        'hover:-translate-y-0.5',
        'active:shadow-[3px_3px_6px_rgba(0,0,0,0.15),-3px_-3px_6px_rgba(255,255,255,0.8)]',
        'active:translate-y-0',
        'focus:ring-indigo-200',
      ),
      secondary: cn(
        'bg-gray-100 text-gray-900',
        'hover:bg-gray-200',
        'active:bg-gray-300 active:scale-[0.98]',
        'shadow-[4px_4px_8px_rgba(0,0,0,0.15),-4px_-4px_8px_rgba(255,255,255,0.8)]',
        'hover:shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.8)]',
        'focus:ring-gray-200',
      ),
      ghost: cn(
        'bg-transparent text-gray-700',
        'hover:bg-gray-100',
        'active:bg-gray-200',
        'focus:ring-gray-200',
      ),
      danger: cn(
        'bg-[#EF4444] text-white',
        'hover:bg-[#DC2626]',
        'active:bg-[#B91C1C] active:scale-[0.98]',
        'shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.8)]',
        'hover:shadow-[8px_8px_16px_rgba(0,0,0,0.15),-8px_-8px_16px_rgba(255,255,255,0.8)]',
        'focus:ring-red-200',
      ),
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm [&_svg]:size-4',
      md: 'px-6 py-3 text-sm [&_svg]:size-5',
      lg: 'px-8 py-4 text-base [&_svg]:size-6',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button }
