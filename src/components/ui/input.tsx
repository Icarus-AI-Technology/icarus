import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, type, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-[var(--text-secondary)]">
            {label}
          </label>
        )}
      <input
        type={type}
        className={cn(
            "w-full px-4 py-3 rounded-xl",
            "bg-[var(--surface-inset)]",
            "text-[var(--text-primary)]",
            "shadow-[inset_4px_4px_8px_var(--shadow-dark),inset_-4px_-4px_8px_var(--shadow-light)]",
            "focus:shadow-[inset_6px_6px_12px_var(--shadow-dark),inset_-6px_-6px_12px_var(--shadow-light),0_0_0_3px_rgba(99,102,241,0.1)]",
            "focus:outline-none",
            "transition-all duration-200",
            "placeholder:text-[var(--text-tertiary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-2 border-[var(--error-color)]",
          className
        )}
        ref={ref}
        {...props}
      />
        {error && (
          <p className="text-sm text-[var(--error-color)] flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-sm text-[var(--text-tertiary)]">{helperText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
