import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle } from 'lucide-react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

/**
 * Input Component - Dark Glass Medical Design System
 * 
 * ICARUS v5.1
 * - Background: #1A1F35
 * - Inset shadow for depth effect
 * - No borders, neumorphic styling
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[#94A3B8]">
            {label}
          </label>
        )}
        
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl',
            'bg-[#1A1F35] text-white placeholder-[#64748B]',
            'focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30',
            'transition-all duration-200',
            error && 'ring-2 ring-[#EF4444]/50',
            className
          )}
          style={{
            boxShadow: 'inset 3px 3px 6px rgba(0,0,0,0.4), inset -2px -2px 4px rgba(255,255,255,0.02)',
          }}
          {...props}
        />
        
        {error && (
          <p className="text-sm text-[#EF4444] flex items-center gap-1">
            <AlertCircle className="w-4 h-4" strokeWidth={2} />
            {error}
          </p>
        )}
        
        {helperText && !error && (
          <p className="text-sm text-[#64748B]">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
