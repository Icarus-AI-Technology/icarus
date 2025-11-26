import * as React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-white/5 backdrop-blur-sm',
            'border border-white/10',
            'text-gray-300 placeholder-gray-500',
            'shadow-lg',
            'focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:border-[#6366F1]/50',
            'transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-2 border-[#EF4444]',
            className
          )}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-[#EF4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-gray-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

