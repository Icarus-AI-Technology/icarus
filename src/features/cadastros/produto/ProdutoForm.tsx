/**
 * ProdutoForm - Cadastro de Produto OPME com API ANVISA
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Auto-preenche via Infosimples API ANVISA
 * Conformidade: RDC 59/751/752
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Save, Package, Upload, FileText, AlertTriangle, CheckCircle } from 'lucide-react'

import { registroAnvisaSchema, classeRiscoOpmeSchema } from '@/lib/validators/anvisa.schema'
import { useANVISAInfosimples } from '@/hooks/useCNPJInfosimples'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const produtoSchema = z.object({
  registro_anvisa: registroAnvisaSchema,
  descricao: z.string().min(5, 'Descrição muito curta').max(500),
  fabricante: z.string().min(2, 'Fabricante obrigatório'),
  modelo: z.string().min(1, 'Modelo obrigatório'),
  classe_risco: classeRiscoOpmeSchema,
  ncm: z.string().regex(/^\d{8}$/, 'NCM deve ter 8 dígitos').optional().or(z.literal('')),
  gtin: z.string().optional(),
  validade_registro: z.string().optional(),
  situacao_anvisa: z.string().optional(),
  preco_tabela: z.string().optional(),
  unidade: z.string().default('UN'),
  estoque_minimo: z.number().int().min(0).optional(),
  observacoes: z.string().optional(),
})

type ProdutoFormData = z.infer<typeof produtoSchema>

interface ProdutoFormProps {
  defaultValues?: Partial<ProdutoFormData>
  onSuccess?: (data: ProdutoFormData) => void
  onCancel?: () => void
}

export default function ProdutoForm({ defaultValues, onSuccess, onCancel }: ProdutoFormProps) {
  const { isDark } = useTheme()
  const { search: searchANVISA, isLoading: anvisaLoading } = useANVISAInfosimples()
  const [xmlFile, setXmlFile] = useState<File | null>(null)

  const form = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema),
    defaultValues: {
      registro_anvisa: '',
      descricao: '',
      fabricante: '',
      modelo: '',
      classe_risco: undefined,
      ncm: '',
      gtin: '',
      validade_registro: '',
      situacao_anvisa: '',
      preco_tabela: '',
      unidade: 'UN',
      estoque_minimo: 0,
      observacoes: '',
      ...defaultValues,
    },
  })

  const onRegistroBlur = async (registro: string) => {
    if (registro.replace(/\D/g, '').length === 13) {
      const result = await searchANVISA(registro)
      if (result) {
        form.setValue('descricao', result.produto)
        form.setValue('fabricante', result.empresa)
        form.setValue('classe_risco', result.classe_risco)
        form.setValue('validade_registro', result.validade)
        form.setValue('situacao_anvisa', result.situacao)
      }
    }
  }

  const handleXMLImport = async (file: File) => {
    try {
      const text = await file.text()
      // Parse XML de NF-e para extrair dados do produto
      const parser = new DOMParser()
      const xml = parser.parseFromString(text, 'text/xml')
      
      const prod = xml.querySelector('prod')
      if (prod) {
        const cProd = prod.querySelector('cProd')?.textContent || ''
        const xProd = prod.querySelector('xProd')?.textContent || ''
        const NCM = prod.querySelector('NCM')?.textContent || ''
        const cEAN = prod.querySelector('cEAN')?.textContent || ''
        
        form.setValue('descricao', xProd)
        form.setValue('ncm', NCM)
        form.setValue('gtin', cEAN !== 'SEM GTIN' ? cEAN : '')
        
        toast.success('XML importado!', { description: `Produto: ${xProd}` })
      }
    } catch (error) {
      toast.error('Erro ao importar XML', { description: 'Verifique se o arquivo é válido' })
    }
  }

  const onSubmit = async (data: ProdutoFormData) => {
    console.log('Produto validado:', data)
    onSuccess?.(data)
  }

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  const situacaoColor = form.watch('situacao_anvisa') === 'VÁLIDO' 
    ? 'text-emerald-400' 
    : 'text-red-400'

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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={cn('p-3 rounded-xl', isDark ? 'bg-violet-500/10' : 'bg-violet-100')}>
            <Package className="w-6 h-6 text-violet-500" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
            Cadastrar Produto OPME
          </h2>
        </div>

        {/* Botão Importar XML */}
        <label className="cursor-pointer">
          <input
            type="file"
            accept=".xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setXmlFile(file)
                handleXMLImport(file)
              }
            }}
          />
          <Button type="button" variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Importar XML
          </Button>
        </label>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Registro ANVISA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="registro_anvisa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registro ANVISA *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="1234567890123"
                        maxLength={13}
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                        onBlur={(e) => {
                          field.onBlur()
                          onRegistroBlur(e.target.value)
                        }}
                      />
                      {anvisaLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-violet-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>13 dígitos - auto-preenche via ANVISA</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="situacao_anvisa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Situação ANVISA</FormLabel>
                  <FormControl>
                    <div className={cn('flex items-center gap-2 p-3 rounded-lg bg-slate-800/50', situacaoColor)}>
                      {field.value === 'VÁLIDO' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : field.value ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : null}
                      <span className="font-medium">{field.value || 'Aguardando consulta'}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="validade_registro"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade do Registro</FormLabel>
                  <FormControl>
                    <Input {...field} disabled placeholder="Preenchido automaticamente" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Dados do Produto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição do Produto *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descrição completa do produto OPME"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fabricante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fabricante *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do fabricante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="modelo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modelo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Modelo/Referência" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="classe_risco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classe de Risco *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/70 border-slate-600">
                        <SelectValue placeholder="Selecione a classe" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="I">Classe I - Baixo Risco</SelectItem>
                      <SelectItem value="II">Classe II - Médio Risco</SelectItem>
                      <SelectItem value="III">Classe III - Alto Risco</SelectItem>
                      <SelectItem value="IV">Classe IV - Máximo Risco</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ncm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>NCM</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="90189099"
                      maxLength={8}
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                    />
                  </FormControl>
                  <FormDescription>8 dígitos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gtin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GTIN/EAN</FormLabel>
                  <FormControl>
                    <Input placeholder="7891234567890" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco_tabela"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço Tabela</FormLabel>
                  <FormControl>
                    <Input placeholder="R$ 0,00" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/70 border-slate-600">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      <SelectItem value="UN">UN - Unidade</SelectItem>
                      <SelectItem value="PC">PC - Peça</SelectItem>
                      <SelectItem value="KIT">KIT - Kit</SelectItem>
                      <SelectItem value="CX">CX - Caixa</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="estoque_minimo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
                    placeholder="Informações adicionais sobre o produto..."
                    rows={3}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

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
              className="min-w-32 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Produto
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

