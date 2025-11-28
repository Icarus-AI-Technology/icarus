/**
 * Formulário de Cadastro de Médico
 * 
 * ICARUS v5.1 - Dark Glass Medical Design System
 * Conformidade: CFM 1.638/2002, Validação CRM oficial
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Save, User, Stethoscope, Phone, Mail } from 'lucide-react'

import { crmSchema, rqeSchema, EstadosBrasileiros } from '@/lib/validators/cfm.schema'
import { telefoneSchema, emailSchema } from '@/lib/validators/anvisa.schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/Form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// Schema do formulário
const medicoFormSchema = z.object({
  nome_completo: z.string().min(5, 'Nome deve ter no mínimo 5 caracteres').max(200),
  crm: crmSchema,
  crm_estado: z.enum(EstadosBrasileiros, {
    required_error: 'Selecione o estado do CRM',
  }),
  rqe: rqeSchema,
  especialidade: z.string().min(3, 'Especialidade muito curta').max(100),
  subespecialidade: z.string().max(100).optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
})

type MedicoFormData = z.infer<typeof medicoFormSchema>

interface MedicoFormProps {
  defaultValues?: Partial<MedicoFormData>
  onSuccess?: (data: MedicoFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function MedicoForm({
  defaultValues,
  onSuccess,
  onCancel,
  isLoading = false,
}: MedicoFormProps) {
  const { isDark } = useTheme()

  const form = useForm<MedicoFormData>({
    resolver: zodResolver(medicoFormSchema),
    defaultValues: {
      nome_completo: '',
      crm: '',
      crm_estado: undefined,
      rqe: '',
      especialidade: '',
      subespecialidade: '',
      telefone: '',
      celular: '',
      email: '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: MedicoFormData) => {
    console.log('Médico validado:', data)
    onSuccess?.(data)
  }

  // Estilos Dark Glass Medical
  const cardBg = isDark
    ? 'bg-gradient-to-br from-[#15192B]/95 to-[#1A1F35]/90'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'
  
  const cardBorder = isDark
    ? 'border-[#2A2F45]/50'
    : 'border-slate-200/50'
  
  const cardShadow = isDark
    ? 'shadow-[8px_8px_24px_rgba(0,0,0,0.4),-6px_-6px_20px_rgba(255,255,255,0.02)]'
    : 'shadow-[8px_8px_24px_rgba(0,0,0,0.08),-6px_-6px_20px_rgba(255,255,255,0.8)]'

  const titleGradient = isDark
    ? 'from-cyan-400 to-blue-400'
    : 'from-cyan-600 to-blue-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={cn(
        'rounded-2xl p-8 backdrop-blur-xl border',
        cardBg,
        cardBorder,
        cardShadow
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className={cn(
          'p-3 rounded-xl',
          isDark ? 'bg-cyan-500/10' : 'bg-cyan-100'
        )}>
          <Stethoscope className="w-6 h-6 text-cyan-500" />
        </div>
        <h2 className={cn(
          'text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent',
          titleGradient
        )}>
          Cadastrar Médico
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid de campos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome Completo */}
            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo *
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Dr. João da Silva"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CRM */}
            <FormField
              control={form.control}
              name="crm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número CRM *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormDescription>
                    Apenas números (4-8 dígitos)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estado CRM */}
            <FormField
              control={form.control}
              name="crm_estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado do CRM *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EstadosBrasileiros.map((uf) => (
                        <SelectItem key={uf} value={uf}>
                          {uf}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* RQE */}
            <FormField
              control={form.control}
              name="rqe"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RQE (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormDescription>
                    Registro de Qualificação de Especialista
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Especialidade */}
            <FormField
              control={form.control}
              name="especialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Cardiologia, Cirurgia Vascular..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subespecialidade */}
            <FormField
              control={form.control}
              name="subespecialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subespecialidade</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Hemodinâmica, Eletrofisiologia..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Telefone */}
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 3456-7890"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Celular */}
            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(11) 99999-9999"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    E-mail
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="medico@hospital.com.br"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/30">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                'min-w-32',
                'bg-gradient-to-r from-cyan-600 to-blue-600',
                'hover:from-cyan-700 hover:to-blue-700',
                'text-white font-medium'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Médico
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

