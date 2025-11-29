/**
 * ICARUS v5.0 - Masked Input Component
 * 
 * Input com máscara automática, validação em tempo real e indicadores visuais.
 * Segue o Dark Glass Medical Design System.
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import React, { useState, useEffect, useCallback } from 'react'
import { Input } from './Input'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import {
  maskCPF,
  maskCNPJ,
  maskCPFCNPJ,
  maskTelefone,
  maskCEP,
  maskData,
  maskMoeda,
  maskCRM,
  maskANVISA,
  maskCartao,
  maskPlaca,
  validateCPF,
  validateCNPJ,
  validateEmail,
  validateTelefone,
  validateCEP,
  validateCRM,
  validateANVISA,
  autoCorrectNome,
  autoCorrectEmail,
  toUpperCase,
  toLowerCase,
  normalizeSpaces,
} from '@/lib/utils/masks'

// ============ TIPOS ============

export type MaskType = 
  | 'cpf'
  | 'cnpj'
  | 'cpf-cnpj'
  | 'telefone'
  | 'cep'
  | 'data'
  | 'moeda'
  | 'crm'
  | 'anvisa'
  | 'cartao'
  | 'placa'
  | 'nome'
  | 'email'
  | 'uppercase'
  | 'lowercase'
  | 'none'

export interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  mask: MaskType
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  showValidation?: boolean
  autoCorrect?: boolean
  onValueChange?: (value: string, isValid: boolean) => void
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ============ COMPONENTE ============

export const MaskedInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      label,
      error,
      helperText,
      required = false,
      showValidation = true,
      autoCorrect = true,
      onValueChange,
      onChange,
      className,
      value: propValue,
      ...props
    },
    ref
  ) => {
    const { isDark } = useTheme()
    const [internalValue, setInternalValue] = useState(propValue?.toString() || '')
    const [isValid, setIsValid] = useState<boolean | null>(null)
    const [isCorrecting, setIsCorrecting] = useState(false)
    const [correctionMessage, setCorrectionMessage] = useState<string | null>(null)
    const [isFocused, setIsFocused] = useState(false)

    // Sincronizar com prop value
    useEffect(() => {
      if (propValue !== undefined && propValue !== internalValue) {
        setInternalValue(propValue.toString())
      }
    }, [propValue])

    // Aplicar máscara
    const applyMask = useCallback((value: string): string => {
      switch (mask) {
        case 'cpf':
          return maskCPF(value)
        case 'cnpj':
          return maskCNPJ(value)
        case 'cpf-cnpj':
          return maskCPFCNPJ(value)
        case 'telefone':
          return maskTelefone(value)
        case 'cep':
          return maskCEP(value)
        case 'data':
          return maskData(value)
        case 'moeda':
          return maskMoeda(value)
        case 'crm':
          return maskCRM(value)
        case 'anvisa':
          return maskANVISA(value)
        case 'cartao':
          return maskCartao(value)
        case 'placa':
          return maskPlaca(value)
        case 'nome':
        case 'uppercase':
          return autoCorrect ? toUpperCase(normalizeSpaces(value)) : value
        case 'email':
        case 'lowercase':
          return autoCorrect ? toLowerCase(value.trim()) : value
        default:
          return value
      }
    }, [mask, autoCorrect])

    // Validar valor
    const validateValue = useCallback((value: string): boolean => {
      if (!value || value.length === 0) return true // Vazio é válido (a menos que required)
      
      switch (mask) {
        case 'cpf':
          return value.replace(/\D/g, '').length < 11 || validateCPF(value)
        case 'cnpj':
          return value.replace(/\D/g, '').length < 14 || validateCNPJ(value)
        case 'cpf-cnpj': {
          const numbers = value.replace(/\D/g, '')
          if (numbers.length < 11) return true
          return numbers.length <= 11 ? validateCPF(value) : validateCNPJ(value)
        }
        case 'telefone':
          return value.replace(/\D/g, '').length < 10 || validateTelefone(value)
        case 'cep':
          return value.replace(/\D/g, '').length < 8 || validateCEP(value)
        case 'email':
          return !value.includes('@') || validateEmail(value)
        case 'crm':
          return value.length < 7 || validateCRM(value)
        case 'anvisa':
          return value.length < 11 || validateANVISA(value)
        default:
          return true
      }
    }, [mask])

    // Handle change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value
      const maskedValue = applyMask(rawValue)
      
      // Verificar se houve auto-correção
      if (autoCorrect && (mask === 'nome' || mask === 'email' || mask === 'uppercase' || mask === 'lowercase')) {
        if (rawValue !== maskedValue) {
          setIsCorrecting(true)
          setCorrectionMessage(
            mask === 'nome' || mask === 'uppercase' 
              ? 'Convertido para maiúsculas' 
              : 'Convertido para minúsculas'
          )
          setTimeout(() => {
            setIsCorrecting(false)
            setCorrectionMessage(null)
          }, 1500)
        }
      }

      setInternalValue(maskedValue)
      
      // Validar
      const valid = validateValue(maskedValue)
      setIsValid(valid)
      
      // Callbacks
      onValueChange?.(maskedValue, valid)
      
      // Criar evento sintético com valor mascarado
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: maskedValue,
        },
      } as React.ChangeEvent<HTMLInputElement>
      onChange?.(syntheticEvent)
    }

    // Handle blur - validação final
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      const valid = validateValue(internalValue)
      setIsValid(valid)
      props.onBlur?.(e)
    }

    // Handle focus
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    // Determinar estado visual
    const getFieldState = () => {
      if (error) return 'error'
      if (isCorrecting) return 'correcting'
      if (isValid === true && internalValue.length > 0 && showValidation) return 'valid'
      if (isValid === false && showValidation) return 'invalid'
      return 'default'
    }

    const fieldState = getFieldState()

    // Classes baseadas no estado
    const stateClasses = {
      default: '',
      correcting: isDark 
        ? 'border-slate-600/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' 
        : 'border-slate-600 shadow-[0_0_10px_rgba(234,179,8,0.15)]',
      valid: isDark 
        ? 'border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' 
        : 'border-green-400 shadow-[0_0_10px_rgba(34,197,94,0.15)]',
      invalid: isDark 
        ? 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
        : 'border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.15)]',
      error: isDark 
        ? 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' 
        : 'border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
    }

    // Placeholder baseado na máscara
    const getPlaceholder = () => {
      if (props.placeholder) return props.placeholder
      switch (mask) {
        case 'cpf': return '000.000.000-00'
        case 'cnpj': return '00.000.000/0000-00'
        case 'cpf-cnpj': return 'CPF ou CNPJ'
        case 'telefone': return '(00) 00000-0000'
        case 'cep': return '00000-000'
        case 'data': return 'DD/MM/AAAA'
        case 'moeda': return 'R$ 0,00'
        case 'crm': return '00000-UF'
        case 'anvisa': return '00000000000'
        case 'cartao': return '0000 0000 0000 0000'
        case 'placa': return 'AAA-0A00'
        case 'email': return 'email@exemplo.com'
        default: return ''
      }
    }

    return (
      <div className="space-y-1.5">
        {/* Label */}
        {label && (
          <label className={cn(
            'block text-sm font-medium',
            isDark ? 'text-[#94A3B8]' : 'text-slate-600'
          )}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <Input
            ref={ref}
            value={internalValue}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder={getPlaceholder()}
            className={cn(
              'pr-10 transition-all duration-200',
              stateClasses[fieldState],
              className
            )}
            {...props}
          />

          {/* Status Icon */}
          {showValidation && internalValue.length > 0 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isCorrecting && (
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              )}
              {!isCorrecting && fieldState === 'valid' && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {!isCorrecting && (fieldState === 'invalid' || fieldState === 'error') && (
                <AlertCircle className="w-4 h-4 text-red-500" />
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="min-h-[20px]">
          {/* Correction Message */}
          {correctionMessage && (
            <p className="text-xs text-cyan-400 flex items-center gap-1 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              {correctionMessage}
            </p>
          )}

          {/* Error Message */}
          {error && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {error}
            </p>
          )}

          {/* Validation Error */}
          {!error && isValid === false && internalValue.length > 0 && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {mask === 'cpf' && 'CPF inválido'}
              {mask === 'cnpj' && 'CNPJ inválido'}
              {mask === 'cpf-cnpj' && 'CPF/CNPJ inválido'}
              {mask === 'telefone' && 'Telefone inválido'}
              {mask === 'cep' && 'CEP inválido'}
              {mask === 'email' && 'Email inválido'}
              {mask === 'crm' && 'CRM inválido'}
              {mask === 'anvisa' && 'Código ANVISA inválido'}
            </p>
          )}

          {/* Valid Badge */}
          {!error && isValid === true && internalValue.length > 0 && showValidation && !isCorrecting && (
            <p className="text-xs text-green-500 flex items-center gap-1">
              <Check className="w-3 h-3" />
              ✓ Padronizado
            </p>
          )}

          {/* Helper Text */}
          {helperText && !error && isValid !== false && !correctionMessage && (
            <p className={cn(
              'text-xs',
              isDark ? 'text-[#64748B]' : 'text-slate-500'
            )}>
              {helperText}
            </p>
          )}
        </div>
      </div>
    )
  }
)

MaskedInput.displayName = 'MaskedInput'

export default MaskedInput

