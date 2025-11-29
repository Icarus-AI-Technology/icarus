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

/**
 * Formulário para Compras Internacionais
 */
export function CompraInternacionalForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    numero_proforma: z.string().min(1),
    data_proforma: z.string(),
    valor_usd: z.number().min(0),
    valor_frete_usd: z.number().min(0),
    valor_seguro_usd: z.number().min(0),
    incoterm: z.enum(['FOB', 'CIF', 'EXW', 'FCA', 'DAP']),
  })

  const fields: FormField[] = [
    { name: 'numero_proforma', label: 'Número Proforma', type: 'text', placeholder: 'PI-2025-001' },
    { name: 'data_proforma', label: 'Data Proforma', type: 'date' },
    { name: 'valor_usd', label: 'Valor Produtos (USD)', type: 'number', placeholder: '10000' },
    { name: 'valor_frete_usd', label: 'Frete (USD)', type: 'number', placeholder: '1500' },
    { name: 'valor_seguro_usd', label: 'Seguro (USD)', type: 'number', placeholder: '500' },
    { 
      name: 'incoterm', 
      label: 'Incoterm', 
      type: 'select',
      options: [
        { value: 'FOB', label: 'FOB - Free On Board' },
        { value: 'CIF', label: 'CIF - Cost, Insurance and Freight' },
        { value: 'EXW', label: 'EXW - Ex Works' },
        { value: 'FCA', label: 'FCA - Free Carrier' },
        { value: 'DAP', label: 'DAP - Delivered At Place' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="compras_internacionais"
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
 * Formulário para Videoconferências
 */
export function VideoCallForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    titulo: z.string().min(3),
    descricao: z.string().optional(),
    agendado_para: z.string(),
    duracao_minutos: z.number().min(15).max(480),
    plataforma: z.enum(['meet', 'teams', 'zoom']),
  })

  const fields: FormField[] = [
    { name: 'titulo', label: 'Título da Reunião', type: 'text', placeholder: 'Reunião Semanal de Vendas' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', placeholder: 'Pauta da reunião...' },
    { name: 'agendado_para', label: 'Data/Hora', type: 'datetime-local' as any },
    { name: 'duracao_minutos', label: 'Duração (minutos)', type: 'number', placeholder: '60' },
    { 
      name: 'plataforma', 
      label: 'Plataforma', 
      type: 'select',
      options: [
        { value: 'meet', label: 'Google Meet' },
        { value: 'teams', label: 'Microsoft Teams' },
        { value: 'zoom', label: 'Zoom' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="video_calls"
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
 * Formulário para Lançamentos Contábeis
 */
export function LancamentoContabilForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    data_lancamento: z.string(),
    historico: z.string().min(10),
    tipo: z.enum(['debito', 'credito']),
    valor: z.number().min(0.01),
    documento: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'data_lancamento', label: 'Data', type: 'date' },
    { name: 'historico', label: 'Histórico', type: 'textarea', placeholder: 'Descrição do lançamento...' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'debito', label: 'Débito' },
        { value: 'credito', label: 'Crédito' },
      ]
    },
    { name: 'valor', label: 'Valor (R$)', type: 'number', placeholder: '1000.00' },
    { name: 'documento', label: 'Documento', type: 'text', placeholder: 'NF-001234' },
  ]

  return (
    <GenericCRUDForm
      tableName="lancamentos_contabeis"
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
 * Formulário para Voice Macros
 */
export function VoiceMacroForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    comando: z.string().min(3),
    acao: z.enum(['navegar', 'criar', 'buscar', 'abrir', 'fechar']),
    parametros: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'comando', label: 'Comando de Voz', type: 'text', placeholder: 'abrir dashboard' },
    { 
      name: 'acao', 
      label: 'Ação', 
      type: 'select',
      options: [
        { value: 'navegar', label: 'Navegar' },
        { value: 'criar', label: 'Criar Registro' },
        { value: 'buscar', label: 'Buscar' },
        { value: 'abrir', label: 'Abrir Módulo' },
        { value: 'fechar', label: 'Fechar' },
      ]
    },
    { name: 'parametros', label: 'Parâmetros (JSON)', type: 'textarea', placeholder: '{"modulo": "dashboard"}' },
  ]

  return (
    <GenericCRUDForm
      tableName="voice_macros"
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
 * Formulário para Automações IA
 */
export function AutomacaoIAForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    descricao: z.string(),
    tipo: z.enum(['workflow', 'trigger', 'scheduled']),
    config: z.string(), // JSON string
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Automação', type: 'text', placeholder: 'Alerta de Estoque Baixo' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', placeholder: 'Descrição detalhada...' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'workflow', label: 'Workflow' },
        { value: 'trigger', label: 'Trigger (Evento)' },
        { value: 'scheduled', label: 'Agendada' },
      ]
    },
    { name: 'config', label: 'Configuração (JSON)', type: 'textarea', placeholder: '{"condicao": "estoque < 10"}' },
  ]

  return (
    <GenericCRUDForm
      tableName="automacoes_ia"
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
 * Formulário para API Tokens
 */
export function APITokenForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    tipo: z.enum(['read', 'write', 'admin']),
    rate_limit: z.number().min(100).max(10000),
    expira_em: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Token', type: 'text', placeholder: 'API Production' },
    { 
      name: 'tipo', 
      label: 'Tipo de Acesso', 
      type: 'select',
      options: [
        { value: 'read', label: 'Somente Leitura' },
        { value: 'write', label: 'Leitura e Escrita' },
        { value: 'admin', label: 'Administrador' },
      ]
    },
    { name: 'rate_limit', label: 'Rate Limit (req/hora)', type: 'number', placeholder: '1000' },
    { name: 'expira_em', label: 'Data de Expiração', type: 'date' },
  ]

  return (
    <GenericCRUDForm
      tableName="api_tokens"
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
 * Formulário para Rotas de Entrega
 */
export function RotaEntregaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    data: z.string(),
    distancia_km: z.number().min(0),
    tempo_estimado: z.number().min(10),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Rota', type: 'text', placeholder: 'Rota Sul - Zona Leste' },
    { name: 'data', label: 'Data', type: 'date' },
    { name: 'distancia_km', label: 'Distância (km)', type: 'number', placeholder: '45.5' },
    { name: 'tempo_estimado', label: 'Tempo Estimado (min)', type: 'number', placeholder: '120' },
  ]

  return (
    <GenericCRUDForm
      tableName="rotas_entrega"
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
 * Formulário para Compliance Checks
 */
export function ComplianceCheckForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    tipo: z.enum(['lgpd', 'iso42001', 'anvisa', 'sox']),
    nome: z.string().min(3),
    descricao: z.string(),
    proxima_verificacao: z.string(),
  })

  const fields: FormField[] = [
    { 
      name: 'tipo', 
      label: 'Tipo de Compliance', 
      type: 'select',
      options: [
        { value: 'lgpd', label: 'LGPD' },
        { value: 'iso42001', label: 'ISO 42001' },
        { value: 'anvisa', label: 'ANVISA' },
        { value: 'sox', label: 'SOX' },
      ]
    },
    { name: 'nome', label: 'Nome da Verificação', type: 'text', placeholder: 'Audit Trail Completo' },
    { name: 'descricao', label: 'Descrição', type: 'textarea', placeholder: 'Descrição detalhada...' },
    { name: 'proxima_verificacao', label: 'Próxima Verificação', type: 'date' },
  ]

  return (
    <GenericCRUDForm
      tableName="compliance_checks"
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
 * Formulário para Licitações
 */
export function LicitacaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    numero_edital: z.string().min(1),
    orgao: z.string().min(3),
    modalidade: z.enum(['pregao', 'concorrencia', 'tomada_preco', 'convite']),
    data_abertura: z.string(),
    valor_estimado: z.number().min(0),
  })

  const fields: FormField[] = [
    { name: 'numero_edital', label: 'Número do Edital', type: 'text', placeholder: 'PE-2025-0001' },
    { name: 'orgao', label: 'Órgão', type: 'text', placeholder: 'Secretaria Municipal de Saúde' },
    { 
      name: 'modalidade', 
      label: 'Modalidade', 
      type: 'select',
      options: [
        { value: 'pregao', label: 'Pregão' },
        { value: 'concorrencia', label: 'Concorrência' },
        { value: 'tomada_preco', label: 'Tomada de Preço' },
        { value: 'convite', label: 'Convite' },
      ]
    },
    { name: 'data_abertura', label: 'Data de Abertura', type: 'date' },
    { name: 'valor_estimado', label: 'Valor Estimado (R$)', type: 'number', placeholder: '100000' },
  ]

  return (
    <GenericCRUDForm
      tableName="licitacoes"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

