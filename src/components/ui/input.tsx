import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={`
            bg-gray-900/50 backdrop-blur-sm
            w-full px-4 py-3 rounded-xl
            border ${error ? 'border-red-500/50' : 'border-white/10'}
            text-gray-100 placeholder-gray-500
            shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
            focus:border-${error ? 'red' : 'blue'}-500/50
            focus:ring-2 focus:ring-${error ? 'red' : 'blue'}-500/20
            focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-all duration-200
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-red-400 text-sm mt-1">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
