import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useModuleMutation } from '@/hooks/useModuleData'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

/**
 * Formulário CRUD Genérico
 * Componente reutilizável para Create/Update/Delete em qualquer tabela
 * Usa React Hook Form + Zod + Supabase
 */

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea'
  placeholder?: string
  options?: Array<{ value: string; label: string }> // Para selects
  validation?: z.ZodTypeAny
}

export interface GenericCRUDFormProps {
  tableName: string
  fields: FormField[]
  schema: z.ZodObject<any>
  isOpen: boolean
  onClose: () => void
  mode: 'create' | 'update'
  initialData?: Record<string, any>
  onSuccess?: () => void
}

export function GenericCRUDForm({
  tableName,
  fields,
  schema,
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: GenericCRUDFormProps) {
  const mutations = useModuleMutation(tableName)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {},
  })

  const onSubmit = async (data: any) => {
    try {
      if (mode === 'create') {
        await mutations.create.mutateAsync(data)
      } else if (mode === 'update' && initialData?.id) {
        await mutations.update.mutateAsync({
          id: initialData.id,
          data,
        })
      }

      reset()
      onClose()
      onSuccess?.()
    } catch (error) {
      console.error('Erro ao salvar:', error)
    }
  }

  const renderField = (field: FormField) => {
    const error = errors[field.name]

    switch (field.type) {
      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <select
              id={field.name}
              {...register(field.name)}
              className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700"
            >
              <option value="">Selecione...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {error && (
              <p className="text-sm text-red-500">{String(error.message)}</p>
            )}
          </div>
        )

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <textarea
              id={field.name}
              {...register(field.name)}
              rows={4}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700"
            />
            {error && (
              <p className="text-sm text-red-500">{String(error.message)}</p>
            )}
          </div>
        )

      default:
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type={field.type}
              {...register(field.name, {
                valueAsNumber: field.type === 'number',
              })}
              placeholder={field.placeholder}
              error={error ? String(error.message) : undefined}
            />
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Novo Registro' : 'Editar Registro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(renderField)}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {mode === 'create' ? 'Criar' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/**
 * Hook para gerenciar estado do formulário CRUD
 */
export function useCRUDForm() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'create' | 'update'>('create')
  const [selectedItem, setSelectedItem] = React.useState<any>(null)

  const openCreate = () => {
    setMode('create')
    setSelectedItem(null)
    setIsOpen(true)
  }

  const openUpdate = (item: any) => {
    setMode('update')
    setSelectedItem(item)
    setIsOpen(true)
  }

  const close = () => {
    setIsOpen(false)
    setSelectedItem(null)
  }

  return {
    isOpen,
    mode,
    selectedItem,
    openCreate,
    openUpdate,
    close,
  }
}

// ========================================
// Formulários Específicos por Módulo
// ========================================

/**
 * Formulário para Grupos de Produtos OPME
 */
export function GrupoProdutoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    codigo: z.string().min(1, 'Código obrigatório'),
    nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
    descricao: z.string().optional(),
    classe_risco: z.enum(['I', 'II', 'III', 'IV']),
    markup_padrao: z.number().min(0).max(100),
  })

  const fields: FormField[] = [
    { name: 'codigo', label: 'Código', type: 'text', placeholder: 'GRP-001' },
    { name: 'nome', label: 'Nome do Grupo', type: 'text', placeholder: 'Cardiologia' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { 
      name: 'classe_risco', 
      label: 'Classe de Risco ANVISA', 
      type: 'select',
      options: [
        { value: 'I', label: 'Classe I - Baixo Risco' },
        { value: 'II', label: 'Classe II - Médio Risco' },
        { value: 'III', label: 'Classe III - Alto Risco' },
        { value: 'IV', label: 'Classe IV - Risco Máximo' },
      ]
    },
    { name: 'markup_padrao', label: 'Markup Padrão (%)', type: 'number', placeholder: '25' },
  ]

  return (
    <GenericCRUDForm
      tableName="grupos_produtos"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

/**
 * Formulário para Sensores IoT
 */
export function SensorIoTForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3, 'Nome obrigatório'),
    tipo: z.enum(['temperatura', 'umidade', 'pressao', 'movimento']),
    localizacao: z.string().min(1, 'Localização obrigatória'),
    limite_min: z.number(),
    limite_max: z.number(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Sensor', type: 'text', placeholder: 'Sensor Temp. Sala 01' },
    { 
      name: 'tipo', 
      label: 'Tipo de Sensor', 
      type: 'select',
      options: [
        { value: 'temperatura', label: 'Temperatura' },
        { value: 'umidade', label: 'Umidade' },
        { value: 'pressao', label: 'Pressão' },
        { value: 'movimento', label: 'Movimento' },
      ]
    },
    { name: 'localizacao', label: 'Localização', type: 'text', placeholder: 'Sala de Cirurgia 01' },
    { name: 'limite_min', label: 'Limite Mínimo', type: 'number', placeholder: '18' },
    { name: 'limite_max', label: 'Limite Máximo', type: 'number', placeholder: '25' },
  ]

  return (
    <GenericCRUDForm
      tableName="sensores_iot"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

/**
 * Formulário para Leads
 */
export function LeadForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    telefone: z.string().optional(),
    empresa: z.string().optional(),
    cargo: z.string().optional(),
    origem: z.enum(['website', 'indicacao', 'evento', 'linkedin', 'outro']),
    interesse: z.string(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome Completo', type: 'text', placeholder: 'João Silva' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'joao@empresa.com' },
    { name: 'telefone', label: 'Telefone', type: 'text', placeholder: '(11) 98765-4321' },
    { name: 'empresa', label: 'Empresa', type: 'text', placeholder: 'Empresa LTDA' },
    { name: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Gerente de Compras' },
    { 
      name: 'origem', 
      label: 'Origem do Lead', 
      type: 'select',
      options: [
        { value: 'website', label: 'Website' },
        { value: 'indicacao', label: 'Indicação' },
        { value: 'evento', label: 'Evento' },
        { value: 'linkedin', label: 'LinkedIn' },
        { value: 'outro', label: 'Outro' },
      ]
    },
    { name: 'interesse', label: 'Interesse', type: 'textarea', placeholder: 'Descreva o interesse do lead...' },
  ]

  return (
    <GenericCRUDForm
      tableName="leads"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

/**
 * Formulário para Campanhas de Marketing
 */
export function CampanhaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3, 'Nome obrigatório'),
    tipo: z.enum(['email', 'sms', 'whatsapp', 'social', 'multiplo']),
    data_inicio: z.string(),
    data_fim: z.string(),
    orcamento: z.number().min(0),
    objetivo: z.string(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Campanha', type: 'text', placeholder: 'Black Friday 2025' },
    { 
      name: 'tipo', 
      label: 'Tipo de Campanha', 
      type: 'select',
      options: [
        { value: 'email', label: 'Email Marketing' },
        { value: 'sms', label: 'SMS' },
        { value: 'whatsapp', label: 'WhatsApp' },
        { value: 'social', label: 'Redes Sociais' },
        { value: 'multiplo', label: 'Múltiplos Canais' },
      ]
    },
    { name: 'data_inicio', label: 'Data de Início', type: 'date' },
    { name: 'data_fim', label: 'Data de Fim', type: 'date' },
    { name: 'orcamento', label: 'Orçamento (R$)', type: 'number', placeholder: '5000' },
    { name: 'objetivo', label: 'Objetivo', type: 'textarea', placeholder: 'Descreva o objetivo da campanha...' },
  ]

  return (
    <GenericCRUDForm
      tableName="campanhas_marketing"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

