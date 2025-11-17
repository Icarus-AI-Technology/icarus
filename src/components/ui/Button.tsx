import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseClasses = cn(
      'inline-flex items-center justify-center',
      'font-semibold rounded-xl',
      'transition-all duration-200',
      'focus:outline-none focus:ring-4',
      'disabled:opacity-60 disabled:cursor-not-allowed',
      'active:scale-95'
    )

    const variantClasses = {
      primary: cn(
        'bg-gradient-to-br from-[#6366F1] to-indigo-700',
        'hover:from-[#4F46E5] hover:to-indigo-800',
        'text-white',
        'shadow-lg shadow-[#6366F1]/50',
        'hover:shadow-xl hover:shadow-[#6366F1]/60',
        'focus:ring-indigo-200'
      ),
      secondary: cn(
        'bg-white/5 backdrop-blur-sm',
        'border border-white/10',
        'text-gray-300',
        'hover:bg-white/10 hover:border-[#6366F1]/50',
        'shadow-lg',
        'focus:ring-gray-200'
      ),
      ghost: cn(
        'bg-transparent',
        'text-gray-300',
        'hover:bg-white/10',
        'focus:ring-gray-200'
      ),
      danger: cn(
        'bg-gradient-to-br from-[#EF4444] to-red-700',
        'hover:from-[#DC2626] hover:to-red-800',
        'text-white',
        'shadow-lg shadow-red-500/50',
        'hover:shadow-xl hover:shadow-red-500/60',
        'focus:ring-red-200'
      ),
    }

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-6 py-3',
      lg: 'px-8 py-4 text-lg',
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

Button.displayName = 'Button'

