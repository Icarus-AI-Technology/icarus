import React from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface NeuSelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * NeuSelect - Neumorphic Select Component
 *
 * A select dropdown with neumorphic design following ICARUS OraclusX patterns.
 * Supports labels, validation, and custom styling.
 *
 * @example
 * // Basic select
 * <NeuSelect
 *   label="Status"
 *   placeholder="Selecione um status"
 *   options={[
 *     { value: 'ativo', label: 'Ativo' },
 *     { value: 'inativo', label: 'Inativo' },
 *   ]}
 *   value={status}
 *   onChange={setStatus}
 * />
 *
 * @example
 * // Select with error
 * <NeuSelect
 *   label="Categoria"
 *   options={categories}
 *   error="Categoria obrigatória"
 *   required
 * />
 */
export const NeuSelect = React.forwardRef<HTMLDivElement, NeuSelectProps>(
  (
    {
      label,
      placeholder = 'Selecione...',
      options,
      value,
      onChange,
      error,
      helperText,
      disabled,
      required,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);
    const hasError = !!error;

    // Close dropdown when clicking outside
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setIsOpen(false);
    };

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Trigger Button */}
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full px-4 py-2.5 rounded-xl text-left',
              'bg-gray-50 text-gray-900',
              'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]',
              'border border-transparent',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              hasError &&
                'border-red-300 focus:ring-red-500 shadow-[inset_4px_4px_8px_rgba(239,68,68,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.9)]'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  selectedOption ? 'text-gray-900' : 'text-gray-400'
                )}
              >
                {selectedOption?.label || placeholder}
              </span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform',
                  isOpen && 'rotate-180'
                )}
              />
            </div>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className={cn(
                'absolute z-10 w-full mt-2',
                'bg-gradient-to-br from-white to-gray-50',
                'rounded-xl',
                'shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]',
                'max-h-60 overflow-auto',
                'animate-in fade-in slide-in-from-top-2 duration-200'
              )}
              role="listbox"
            >
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={option.disabled}
                  className={cn(
                    'w-full px-4 py-2.5 text-left',
                    'transition-colors duration-150',
                    'hover:bg-gray-100/70',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    option.value === value && 'bg-primary-50 text-primary-700',
                    'first:rounded-t-xl last:rounded-b-xl',
                    'flex items-center justify-between'
                  )}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check className="w-5 h-5 text-primary-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Helper/Error Text */}
        {error && (
          <p className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

NeuSelect.displayName = 'NeuSelect';
