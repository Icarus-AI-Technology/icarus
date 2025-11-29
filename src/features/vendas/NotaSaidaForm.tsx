/**
 * NotaSaidaForm - NF-e de Saída com Justificativa Médica
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Integração com IcarusBrain para justificativa automática
 */

'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { 
  Loader2, Save, FileText, Plus, Trash2, Sparkles, 
  Building2, User, Stethoscope, Package, Copy, CheckCircle 
} from 'lucide-react'

import { nfeSaidaSchema } from '@/lib/validators/nfe-opme.schema'
import { cnpjSchema, registroAnvisaSchema, loteSchema } from '@/lib/validators/anvisa.schema'
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
import { Textarea } from '@/components/ui/Textarea'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const itemSchema = z.object({
  codigo_produto: z.string().min(1),
  descricao: z.string().min(3),
  registro_anvisa: registroAnvisaSchema,
  lote: loteSchema,
  validade: z.string(),
  quantidade: z.number().int().positive(),
  valor_unitario: z.number().positive(),
})

const formSchema = z.object({
  cliente_cnpj: cnpjSchema,
  cliente_razao_social: z.string().min(5),
  paciente_nome: z.string().optional(),
  paciente_cpf: z.string().optional(),
  hospital_nome: z.string().optional(),
  medico_crm: z.string().optional(),
  itens: z.array(itemSchema).min(1, 'Adicione pelo menos um item'),
  info_complementares: z.string().max(5000).optional(),
})

type FormData = z.infer<typeof formSchema>

interface NotaSaidaFormProps {
  onSuccess?: (data: FormData) => void
  onCancel?: () => void
}

export default function NotaSaidaForm({ onSuccess, onCancel }: NotaSaidaFormProps) {
  const { isDark } = useTheme()
  const [gerando, setGerando] = useState(false)
  const [copiado, setCopiado] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cliente_cnpj: '',
      cliente_razao_social: '',
      paciente_nome: '',
      paciente_cpf: '',
      hospital_nome: '',
      medico_crm: '',
      itens: [
        {
          codigo_produto: '',
          descricao: '',
          registro_anvisa: '',
          lote: '',
          validade: '',
          quantidade: 1,
          valor_unitario: 0,
        },
      ],
      info_complementares: '',
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'itens',
  })

  const gerarJustificativa = async () => {
    setGerando(true)
    try {
      const itens = form.getValues('itens')
      const paciente = form.getValues('paciente_nome')
      const hospital = form.getValues('hospital_nome')
      const medico = form.getValues('medico_crm')

      // Chamar API do IcarusBrain
      const response = await fetch('/api/icarus-brain/justificativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itens: itens.map(i => ({ descricao: i.descricao, registro_anvisa: i.registro_anvisa })),
          paciente,
          hospital,
          medico,
        }),
      })

      if (!response.ok) throw new Error('Falha ao gerar justificativa')

      const { justificativa } = await response.json()
      form.setValue('info_complementares', justificativa)
      toast.success('Justificativa gerada!', { description: 'Revise antes de usar' })
    } catch (error) {
      toast.error('Erro ao gerar justificativa', { description: 'Tente novamente' })
    } finally {
      setGerando(false)
    }
  }

  const copiarJustificativa = () => {
    const texto = form.getValues('info_complementares')
    if (texto) {
      navigator.clipboard.writeText(texto)
      setCopiado(true)
      toast.success('Copiado para área de transferência!')
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  const onSubmit = async (data: FormData) => {
    console.log('NF-e Saída validada:', data)
    onSuccess?.(data)
  }

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  const valorTotal = form.watch('itens').reduce((acc, item) => {
    return acc + (item.quantidade * item.valor_unitario)
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'rounded-2xl p-8 backdrop-blur-xl border border-slate-700/50 shadow-2xl',
        cardBg
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className={cn('p-3 rounded-xl', isDark ? 'bg-emerald-500/10' : 'bg-emerald-100')}>
          <FileText className="w-6 h-6 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Nova NF-e de Saída
          </h2>
          <p className="text-sm text-slate-400">Venda para hospital/convênio</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-300">
              <Building2 className="w-5 h-5" />
              Destinatário (Cliente)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cliente_cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ *</FormLabel>
                    <FormControl>
                      <Input placeholder="00.000.000/0001-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cliente_razao_social"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Razão Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do hospital/cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Rastreabilidade */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-300">
              <User className="w-5 h-5" />
              Rastreabilidade (Opcional - ANVISA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="paciente_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paciente_cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF do Paciente</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hospital_nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hospital</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do hospital" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medico_crm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <Stethoscope className="w-4 h-4" />
                      CRM do Médico
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="RJ123456" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Itens */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-300">
                <Package className="w-5 h-5" />
                Itens da NF-e
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({
                  codigo_produto: '',
                  descricao: '',
                  registro_anvisa: '',
                  lote: '',
                  validade: '',
                  quantidade: 1,
                  valor_unitario: 0,
                })}
              >
                <Plus className="w-4 h-4 mr-1" />
                Adicionar Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-slate-400">Item {index + 1}</span>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <FormField
                      control={form.control}
                      name={`itens.${index}.codigo_produto`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.descricao`}
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.registro_anvisa`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reg. ANVISA</FormLabel>
                          <FormControl>
                            <Input maxLength={13} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.lote`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lote</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.validade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validade</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.quantidade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qtd</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`itens.${index}.valor_unitario`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Unit.</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min={0}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="bg-slate-800/70 rounded-xl p-4 border border-slate-600">
                <span className="text-slate-400 text-sm">Valor Total:</span>
                <p className="text-2xl font-bold text-emerald-400">
                  {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>

          {/* Justificativa Médica */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-300">
                <Sparkles className="w-5 h-5 text-violet-400" />
                Informações Complementares (Justificativa Médica)
              </h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={gerarJustificativa}
                  disabled={gerando}
                  className="gap-2"
                >
                  {gerando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Gerar com IA
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={copiarJustificativa}
                  className="gap-2"
                >
                  {copiado ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  Copiar
                </Button>
              </div>
            </div>

            <FormField
              control={form.control}
              name="info_complementares"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Justificativa médica gerada automaticamente pelo IcarusBrain ou digite manualmente..."
                      rows={6}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Este texto será incluído nas informações complementares da NF-e
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              className="min-w-40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Gerar NF-e de Saída
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

