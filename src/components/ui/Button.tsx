import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
  loading?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', loading, disabled, children, className = '', ...props }, ref) => {
    const baseClasses = `
      px-6 py-3 rounded-xl
      font-medium
      active:scale-95
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      flex items-center justify-center gap-2
    `

    const variantClasses = {
      primary: `
        bg-gradient-to-br from-blue-500 to-blue-600
        border border-blue-400/20
        text-white
        shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]
        hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
      `,
      secondary: `
        bg-gradient-to-br from-gray-800 to-gray-900
        border border-white/10
        text-gray-100
        shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
        hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]
      `,
      danger: `
        bg-gradient-to-br from-red-500 to-red-600
        border border-red-400/20
        text-white
        shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(239,68,68,0.1)]
        hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
      `,
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
