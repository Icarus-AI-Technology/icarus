import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  label?: string
  'aria-label'?: string
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = 'Selecione',
  'aria-label': ariaLabel,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-12 rounded-xl bg-[#1A1F35] text-left px-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#6366F1]/30 transition-all duration-300 flex items-center justify-between"
        style={{
          boxShadow: isOpen
            ? 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.03), 0 0 0 2px rgba(99, 102, 241, 0.3)'
            : 'inset 4px 4px 8px rgba(0,0,0,0.4), inset -3px -3px 6px rgba(255,255,255,0.03)'
        }}
      >
        <span className={selectedOption ? 'text-white' : 'text-[#64748B]'}>
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          className={`w-5 h-5 text-[#94A3B8] absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute z-50 w-full mt-2 rounded-xl overflow-hidden animate-fadeIn"
          style={{
            background: '#1A1F35',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(99, 102, 241, 0.2)'
          }}
          role="listbox"
        >
          {options.map((option) => {
            const isSelected = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#6366F1]/20 text-white' 
                    : 'text-[#D1D5DB] hover:bg-[#252B44] hover:text-white'
                }`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 text-[#6366F1]" />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Hidden native select for form submission */}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      >
        <option value="">{placeholder}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}

