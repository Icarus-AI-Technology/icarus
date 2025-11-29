/**
 * Formulário de Cadastro de Paciente
 * 
 * ICARUS v5.1 - Dark Glass Medical Design System
 * Conformidade: LGPD, RN 506 ANS (TISS)
 */

'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Save, User, Heart, Phone, Mail, MapPin, CreditCard } from 'lucide-react'

import { 
  pacienteSchema, 
  dataNascimentoSchema, 
  sexoSchema, 
  tipoSanguineoSchema,
  cnsSchema,
  EstadosBrasileiros 
} from '@/lib/validators/cfm.schema'
import { cpfSchema, cepSchema, telefoneSchema } from '@/lib/validators/anvisa.schema'
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
import { Textarea } from '@/components/ui/Textarea'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

// Schema do formulário
const pacienteFormSchema = z.object({
  nome_completo: z.string().min(5, 'Nome deve ter no mínimo 5 caracteres').max(200),
  cpf: cpfSchema,
  cns: cnsSchema.optional().or(z.literal('')),
  data_nascimento: dataNascimentoSchema,
  sexo: sexoSchema,
  tipo_sanguineo: tipoSanguineoSchema.optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  endereco: z.string().max(300).optional(),
  cidade: z.string().max(100).optional(),
  estado: z.enum(EstadosBrasileiros).optional(),
  cep: z.string().optional(),
  convenio: z.string().max(100).optional(),
  numero_carteirinha: z.string().max(50).optional(),
  observacoes: z.string().max(1000).optional(),
})

type PacienteFormData = z.infer<typeof pacienteFormSchema>

interface PacienteFormProps {
  defaultValues?: Partial<PacienteFormData>
  onSuccess?: (data: PacienteFormData) => void
  onCancel?: () => void
  isLoading?: boolean
}

export default function PacienteForm({
  defaultValues,
  onSuccess,
  onCancel,
  isLoading = false,
}: PacienteFormProps) {
  const { isDark } = useTheme()

  const form = useForm<PacienteFormData>({
    resolver: zodResolver(pacienteFormSchema),
    defaultValues: {
      nome_completo: '',
      cpf: '',
      cns: '',
      data_nascimento: '',
      sexo: undefined,
      tipo_sanguineo: undefined,
      telefone: '',
      celular: '',
      email: '',
      endereco: '',
      cidade: '',
      estado: undefined,
      cep: '',
      convenio: '',
      numero_carteirinha: '',
      observacoes: '',
      ...defaultValues,
    },
  })

  const onSubmit = async (data: PacienteFormData) => {
    console.log('Paciente validado:', data)
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

  const sectionTitle = isDark ? 'text-slate-300' : 'text-slate-700'

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
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'
        )}>
          <User className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Cadastrar Paciente
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Seção: Dados Pessoais */}
          <div className="space-y-4">
            <h3 className={cn('text-lg font-semibold flex items-center gap-2', sectionTitle)}>
              <User className="w-5 h-5" />
              Dados Pessoais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nome Completo */}
              <FormField
                control={form.control}
                name="nome_completo"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo do paciente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF */}
              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000.000.000-00"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CNS */}
              <FormField
                control={form.control}
                name="cns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cartão SUS (CNS)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="000 0000 0000 0000"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormDescription>15 dígitos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Data Nascimento */}
              <FormField
                control={form.control}
                name="data_nascimento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Sexo */}
              <FormField
                control={form.control}
                name="sexo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sexo *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="M">Masculino</SelectItem>
                        <SelectItem value="F">Feminino</SelectItem>
                        <SelectItem value="I">Indeterminado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo Sanguíneo */}
              <FormField
                control={form.control}
                name="tipo_sanguineo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-500" />
                      Tipo Sanguíneo
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção: Contato */}
          <div className="space-y-4">
            <h3 className={cn('text-lg font-semibold flex items-center gap-2', sectionTitle)}>
              <Phone className="w-5 h-5" />
              Contato
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Telefone */}
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone Fixo</FormLabel>
                    <FormControl>
                      <Input placeholder="(11) 3456-7890" {...field} />
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
                      <Input placeholder="(11) 99999-9999" {...field} />
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
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="paciente@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção: Endereço */}
          <div className="space-y-4">
            <h3 className={cn('text-lg font-semibold flex items-center gap-2', sectionTitle)}>
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* CEP */}
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="00000-000"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '')
                          field.onChange(value)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Endereço */}
              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="lg:col-span-2">
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, complemento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cidade */}
              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="São Paulo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Estado */}
              <FormField
                control={form.control}
                name="estado"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EstadosBrasileiros.map((uf) => (
                          <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Seção: Convênio */}
          <div className="space-y-4">
            <h3 className={cn('text-lg font-semibold flex items-center gap-2', sectionTitle)}>
              <CreditCard className="w-5 h-5" />
              Convênio
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Convênio */}
              <FormField
                control={form.control}
                name="convenio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Convênio</FormLabel>
                    <FormControl>
                      <Input placeholder="Unimed, Bradesco Saúde..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Carteirinha */}
              <FormField
                control={form.control}
                name="numero_carteirinha"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Carteirinha</FormLabel>
                    <FormControl>
                      <Input placeholder="000000000000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Observações */}
          <FormField
            control={form.control}
            name="observacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Alergias, condições especiais, medicamentos em uso..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Informações importantes sobre o paciente
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                'bg-gradient-to-r from-emerald-600 to-teal-600',
                'hover:from-emerald-700 hover:to-teal-700',
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
                  Salvar Paciente
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

