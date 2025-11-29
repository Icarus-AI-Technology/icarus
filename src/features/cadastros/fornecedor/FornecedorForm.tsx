/**
 * FornecedorForm - Cadastro de Fornecedor com auto-preenchimento CNPJ
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Auto-preenche via Infosimples API
 */

'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Save, Building2, Phone, Mail, MapPin } from 'lucide-react'

import { cnpjSchema } from '@/lib/validators/anvisa.schema'
import { useCNPJInfosimples } from '@/hooks/useCNPJInfosimples'
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
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

const fornecedorSchema = z.object({
  cnpj: cnpjSchema,
  razao_social: z.string().min(5, 'Razão social obrigatória'),
  nome_fantasia: z.string().optional(),
  endereco: z.string().min(5, 'Endereço obrigatório'),
  cidade: z.string().min(2, 'Cidade obrigatória'),
  uf: z.string().length(2, 'UF deve ter 2 letras'),
  cep: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  situacao_cadastral: z.string().optional(),
  contato_nome: z.string().optional(),
  contato_telefone: z.string().optional(),
  observacoes: z.string().optional(),
})

type FornecedorFormData = z.infer<typeof fornecedorSchema>

interface FornecedorFormProps {
  defaultValues?: Partial<FornecedorFormData>
  onSuccess?: (data: FornecedorFormData) => void
  onCancel?: () => void
}

export default function FornecedorForm({ defaultValues, onSuccess, onCancel }: FornecedorFormProps) {
  const { isDark } = useTheme()
  const { search, isLoading: cnpjLoading } = useCNPJInfosimples()

  const form = useForm<FornecedorFormData>({
    resolver: zodResolver(fornecedorSchema),
    defaultValues: {
      cnpj: '',
      razao_social: '',
      nome_fantasia: '',
      endereco: '',
      cidade: '',
      uf: '',
      cep: '',
      telefone: '',
      email: '',
      situacao_cadastral: '',
      contato_nome: '',
      contato_telefone: '',
      observacoes: '',
      ...defaultValues,
    },
  })

  const onCNPJBlur = async (cnpj: string) => {
    if (cnpj.replace(/\D/g, '').length >= 14) {
      const result = await search(cnpj)
      if (result) {
        form.setValue('razao_social', result.razao_social)
        form.setValue('nome_fantasia', result.nome_fantasia || '')
        form.setValue('endereco', `${result.logradouro}, ${result.numero}${result.complemento ? ` - ${result.complemento}` : ''} - ${result.bairro}`)
        form.setValue('cidade', result.municipio)
        form.setValue('uf', result.uf)
        form.setValue('cep', result.cep)
        form.setValue('telefone', result.telefone || '')
        form.setValue('email', result.email || '')
        form.setValue('situacao_cadastral', result.situacao)
      }
    }
  }

  const onSubmit = async (data: FornecedorFormData) => {
    console.log('Fornecedor validado:', data)
    onSuccess?.(data)
  }

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  const cardBorder = isDark ? 'border-slate-700/50' : 'border-slate-200/50'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl p-8 backdrop-blur-xl border shadow-2xl',
        cardBg,
        cardBorder
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className={cn(
          'p-3 rounded-xl',
          isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'
        )}>
          <Building2 className="w-6 h-6 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          Cadastrar Fornecedor
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* CNPJ com auto-preenchimento */}
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="00.000.000/0001-00"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur()
                        onCNPJBlur(e.target.value)
                      }}
                    />
                    {cnpjLoading && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-emerald-500" />
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Digite o CNPJ para auto-preencher os dados
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Razão Social */}
            <FormField
              control={form.control}
              name="razao_social"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Razão Social *</FormLabel>
                  <FormControl>
                    <Input placeholder="Razão social da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nome Fantasia */}
            <FormField
              control={form.control}
              name="nome_fantasia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome fantasia" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Situação */}
            <FormField
              control={form.control}
              name="situacao_cadastral"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação Cadastral</FormLabel>
                  <FormControl>
                    <Input placeholder="ATIVA" {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className={cn(
              'text-lg font-semibold flex items-center gap-2',
              isDark ? 'text-slate-300' : 'text-slate-700'
            )}>
              <MapPin className="w-5 h-5" />
              Endereço
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="cep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CEP</FormLabel>
                    <FormControl>
                      <Input placeholder="00000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Endereço *</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua, número, complemento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade *</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="uf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF *</FormLabel>
                    <FormControl>
                      <Input placeholder="RJ" maxLength={2} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h3 className={cn(
              'text-lg font-semibold flex items-center gap-2',
              isDark ? 'text-slate-300' : 'text-slate-700'
            )}>
              <Phone className="w-5 h-5" />
              Contato
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(21) 3456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input type="email" placeholder="contato@empresa.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="João Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4 pt-6 border-t border-slate-700/30">
            {onCancel && (
              <Button type="button" variant="ghost" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
              className="min-w-32 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Fornecedor
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}
