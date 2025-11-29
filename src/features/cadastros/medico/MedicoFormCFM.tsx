/**
 * MedicoFormCFM - Cadastro de Médico com API CFM
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Auto-preenche via Infosimples API CFM
 * Upload de documentos para Supabase Storage
 */

'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Loader2, Save, Stethoscope, Upload, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react'

import { crmSchema, EstadosBrasileiros } from '@/lib/validators/cfm.schema'
import { useCFMInfosimples } from '@/hooks/useCNPJInfosimples'
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
import { toast } from 'sonner'
import { supabase } from '@/lib/config/supabase-client'

const medicoSchema = z.object({
  crm: z.string().min(4, 'CRM deve ter no mínimo 4 dígitos'),
  crm_uf: z.enum(EstadosBrasileiros, { required_error: 'Selecione o estado' }),
  nome_completo: z.string().min(5, 'Nome muito curto'),
  especialidade: z.string().min(3, 'Especialidade obrigatória'),
  subespecialidade: z.string().optional(),
  situacao_cfm: z.string().optional(),
  telefone: z.string().optional(),
  celular: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  hospital_principal: z.string().optional(),
  observacoes: z.string().optional(),
})

type MedicoFormData = z.infer<typeof medicoSchema>

interface UploadedDoc {
  name: string
  url: string
  size: number
}

interface MedicoFormCFMProps {
  defaultValues?: Partial<MedicoFormData>
  onSuccess?: (data: MedicoFormData, docs: UploadedDoc[]) => void
  onCancel?: () => void
}

export default function MedicoFormCFM({ defaultValues, onSuccess, onCancel }: MedicoFormCFMProps) {
  const { isDark } = useTheme()
  const { search: searchCFM, isLoading: cfmLoading } = useCFMInfosimples()
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([])
  const [uploading, setUploading] = useState(false)

  const form = useForm<MedicoFormData>({
    resolver: zodResolver(medicoSchema),
    defaultValues: {
      crm: '',
      crm_uf: undefined,
      nome_completo: '',
      especialidade: '',
      subespecialidade: '',
      situacao_cfm: '',
      telefone: '',
      celular: '',
      email: '',
      hospital_principal: '',
      observacoes: '',
      ...defaultValues,
    },
  })

  const crmValue = form.watch('crm')
  const ufValue = form.watch('crm_uf')

  const onCRMBlur = async () => {
    if (crmValue && ufValue) {
      const result = await searchCFM(crmValue, ufValue)
      if (result) {
        form.setValue('nome_completo', result.nome)
        form.setValue('especialidade', result.especialidade)
        form.setValue('situacao_cfm', result.situacao)
      }
    }
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0 || !crmValue) return

    setUploading(true)
    const newDocs: UploadedDoc[] = []

    for (const file of Array.from(files)) {
      try {
        const fileName = `${ufValue}${crmValue}/${Date.now()}_${file.name}`
        const { data, error } = await supabase.storage
          .from('medicos-docs')
          .upload(fileName, file)

        if (error) throw error

        const { data: urlData } = supabase.storage
          .from('medicos-docs')
          .getPublicUrl(fileName)

        newDocs.push({
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
        })

        toast.success('Documento enviado!', { description: file.name })
      } catch (error) {
        toast.error('Erro no upload', { description: `Falha ao enviar ${file.name}` })
      }
    }

    setUploadedDocs([...uploadedDocs, ...newDocs])
    setUploading(false)
  }

  const removeDoc = async (doc: UploadedDoc) => {
    setUploadedDocs(uploadedDocs.filter(d => d.url !== doc.url))
    toast.info('Documento removido')
  }

  const onSubmit = async (data: MedicoFormData) => {
    console.log('Médico validado:', data)
    onSuccess?.(data, uploadedDocs)
  }

  const cardBg = isDark
    ? 'bg-gradient-to-br from-slate-900/90 to-slate-800/95'
    : 'bg-gradient-to-br from-white/95 to-slate-50/90'

  const situacaoOk = form.watch('situacao_cfm')?.toLowerCase().includes('regular')

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
        <div className={cn('p-3 rounded-xl', isDark ? 'bg-cyan-500/10' : 'bg-cyan-100')}>
          <Stethoscope className="w-6 h-6 text-cyan-500" />
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
          Cadastrar Médico Cirurgião
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* CRM + UF */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormField
              control={form.control}
              name="crm_uf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>UF do CRM *</FormLabel>
                  <Select 
                    onValueChange={(val) => {
                      field.onChange(val)
                      if (crmValue) onCRMBlur()
                    }} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-slate-800/70 border-slate-600">
                        <SelectValue placeholder="UF" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-slate-600 max-h-60">
                      {EstadosBrasileiros.map((uf) => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="crm"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número CRM *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="123456"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                        onBlur={onCRMBlur}
                      />
                      {cfmLoading && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-cyan-500" />
                      )}
                    </div>
                  </FormControl>
                  <FormDescription>Auto-preenche via CFM</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="situacao_cfm"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Situação no CFM</FormLabel>
                  <FormControl>
                    <div className={cn(
                      'flex items-center gap-2 p-3 rounded-lg bg-slate-800/50',
                      situacaoOk ? 'text-emerald-400' : field.value ? 'text-red-400' : 'text-slate-400'
                    )}>
                      {situacaoOk ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : field.value ? (
                        <XCircle className="w-5 h-5" />
                      ) : null}
                      <span className="font-medium">{field.value || 'Aguardando consulta'}</span>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Dados do Médico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="nome_completo"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input placeholder="Dr. João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="especialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Especialidade *</FormLabel>
                  <FormControl>
                    <Input placeholder="Cardiologia, Cirurgia Vascular..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subespecialidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subespecialidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Hemodinâmica, Eletrofisiologia..." {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(21) 3456-7890" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="celular"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular</FormLabel>
                  <FormControl>
                    <Input placeholder="(21) 99999-9999" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="medico@hospital.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hospital_principal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hospital Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do hospital" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Upload de Documentos */}
          <div className="space-y-4">
            <h3 className={cn('text-lg font-semibold flex items-center gap-2', isDark ? 'text-slate-300' : 'text-slate-700')}>
              <FileText className="w-5 h-5" />
              Documentos do Médico
            </h3>

            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-cyan-500 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                className="hidden"
                id="doc-upload"
                onChange={(e) => handleFileUpload(e.target.files)}
                disabled={!crmValue || uploading}
              />
              <label htmlFor="doc-upload" className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="w-10 h-10 mx-auto text-cyan-500 animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 mx-auto text-slate-400" />
                )}
                <p className="text-sm text-slate-400 mt-2">
                  {crmValue 
                    ? 'Clique ou arraste documentos aqui (PDF, imagens, DOC)'
                    : 'Preencha o CRM primeiro para habilitar upload'
                  }
                </p>
              </label>
            </div>

            {/* Lista de documentos */}
            {uploadedDocs.length > 0 && (
              <div className="space-y-2">
                {uploadedDocs.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div>
                        <p className="text-sm font-medium text-white">{doc.name}</p>
                        <p className="text-xs text-slate-400">{(doc.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDoc(doc)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
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
              className="min-w-32 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
            >
              {form.formState.isSubmitting ? (
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

