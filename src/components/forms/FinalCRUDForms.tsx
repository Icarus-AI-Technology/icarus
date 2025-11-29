import React from 'react'
import { z } from 'zod'
import { GenericCRUDForm, FormField, GenericCRUDFormProps } from './GenericCRUDForm'

/**
 * Formulários CRUD Finais - Batch 3
 * 18 últimos formulários para completar 100%
 */

/**
 * 1. Perfil de Acesso (RBAC)
 */
export function PerfilAcessoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    descricao: z.string().optional(),
    nivel_acesso: z.number().min(1).max(10),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Perfil', type: 'text', placeholder: 'Administrador' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { name: 'nivel_acesso', label: 'Nível de Acesso (1-10)', type: 'number', placeholder: '9' },
  ]

  return <GenericCRUDForm tableName="perfis_acesso" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 2. Consignação
 */
export function ConsignacaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    hospital_id: z.string().uuid(),
    data_envio: z.string(),
    data_prevista_retorno: z.string(),
    status: z.enum(['enviado', 'em_hospital', 'retornado', 'faturado']),
  })

  const fields: FormField[] = [
    { name: 'hospital_id', label: 'Hospital (UUID)', type: 'text' },
    { name: 'data_envio', label: 'Data de Envio', type: 'date' },
    { name: 'data_prevista_retorno', label: 'Previsão de Retorno', type: 'date' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'enviado', label: 'Enviado' },
        { value: 'em_hospital', label: 'No Hospital' },
        { value: 'retornado', label: 'Retornado' },
        { value: 'faturado', label: 'Faturado' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="consignacoes" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 3. Rastreabilidade
 */
export function RastreabilidadeForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    lote: z.string().min(1),
    registro_anvisa: z.string().length(13),
    data_fabricacao: z.string(),
    data_validade: z.string(),
    origem: z.string(),
  })

  const fields: FormField[] = [
    { name: 'lote', label: 'Número do Lote', type: 'text', placeholder: 'LOT123456' },
    { name: 'registro_anvisa', label: 'Registro ANVISA (13 dígitos)', type: 'text', placeholder: '8012345678901' },
    { name: 'data_fabricacao', label: 'Data de Fabricação', type: 'date' },
    { name: 'data_validade', label: 'Data de Validade', type: 'date' },
    { name: 'origem', label: 'Origem', type: 'text', placeholder: 'Nacional' },
  ]

  return <GenericCRUDForm tableName="rastreabilidade_opme" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 4. Manutenção Preventiva
 */
export function ManutencaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    equipamento_id: z.string().uuid(),
    tipo: z.enum(['preventiva', 'corretiva', 'calibracao']),
    data_programada: z.string(),
    tecnico_responsavel: z.string(),
  })

  const fields: FormField[] = [
    { name: 'equipamento_id', label: 'Equipamento (UUID)', type: 'text' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'preventiva', label: 'Preventiva' },
        { value: 'corretiva', label: 'Corretiva' },
        { value: 'calibracao', label: 'Calibração' },
      ]
    },
    { name: 'data_programada', label: 'Data Programada', type: 'date' },
    { name: 'tecnico_responsavel', label: 'Técnico Responsável', type: 'text' },
  ]

  return <GenericCRUDForm tableName="manutencoes" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 5. Nota Fiscal (Entrada)
 */
export function NotaFiscalEntradaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    chave_nfe: z.string().length(44, 'Chave deve ter 44 dígitos'),
    fornecedor_id: z.string().uuid(),
    valor_total: z.number().min(0),
    data_emissao: z.string(),
  })

  const fields: FormField[] = [
    { name: 'chave_nfe', label: 'Chave NF-e (44 dígitos)', type: 'text', placeholder: '35210312345678901234567890123456789012345678' },
    { name: 'fornecedor_id', label: 'Fornecedor (UUID)', type: 'text' },
    { name: 'valor_total', label: 'Valor Total (R$)', type: 'number', placeholder: '15000.00' },
    { name: 'data_emissao', label: 'Data de Emissão', type: 'date' },
  ]

  return <GenericCRUDForm tableName="notas_fiscais_entrada" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 6. Cotação
 */
export function CotacaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    numero_cotacao: z.string().min(1),
    data_abertura: z.string(),
    data_fechamento: z.string(),
    status: z.enum(['aberta', 'em_analise', 'fechada', 'cancelada']),
  })

  const fields: FormField[] = [
    { name: 'numero_cotacao', label: 'Número da Cotação', type: 'text', placeholder: 'COT-2025-001' },
    { name: 'data_abertura', label: 'Data de Abertura', type: 'date' },
    { name: 'data_fechamento', label: 'Data de Fechamento', type: 'date' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'aberta', label: 'Aberta' },
        { value: 'em_analise', label: 'Em Análise' },
        { value: 'fechada', label: 'Fechada' },
        { value: 'cancelada', label: 'Cancelada' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="cotacoes" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 7. Contrato
 */
export function ContratoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    numero_contrato: z.string().min(1),
    cliente_id: z.string().uuid(),
    data_inicio: z.string(),
    data_fim: z.string(),
    valor_mensal: z.number().min(0),
  })

  const fields: FormField[] = [
    { name: 'numero_contrato', label: 'Número do Contrato', type: 'text', placeholder: 'CONT-2025-001' },
    { name: 'cliente_id', label: 'Cliente (UUID)', type: 'text' },
    { name: 'data_inicio', label: 'Data de Início', type: 'date' },
    { name: 'data_fim', label: 'Data de Fim', type: 'date' },
    { name: 'valor_mensal', label: 'Valor Mensal (R$)', type: 'number', placeholder: '5000.00' },
  ]

  return <GenericCRUDForm tableName="contratos" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 8. Tabela de Preços
 */
export function TabelaPrecoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    tipo_convenio: z.enum(['particular', 'plano_saude', 'sus', 'empresa']),
    data_vigencia_inicio: z.string(),
    data_vigencia_fim: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Tabela', type: 'text', placeholder: 'Tabela Particular 2025' },
    { 
      name: 'tipo_convenio', 
      label: 'Tipo de Convênio', 
      type: 'select',
      options: [
        { value: 'particular', label: 'Particular' },
        { value: 'plano_saude', label: 'Plano de Saúde' },
        { value: 'sus', label: 'SUS' },
        { value: 'empresa', label: 'Empresa' },
      ]
    },
    { name: 'data_vigencia_inicio', label: 'Início da Vigência', type: 'date' },
    { name: 'data_vigencia_fim', label: 'Fim da Vigência', type: 'date' },
  ]

  return <GenericCRUDForm tableName="tabelas_precos" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 9. Relatório Executivo
 */
export function RelatorioExecutivoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    titulo: z.string().min(3),
    tipo: z.enum(['mensal', 'trimestral', 'anual', 'ad_hoc']),
    data_geracao: z.string(),
    gerado_por_id: z.string().uuid(),
  })

  const fields: FormField[] = [
    { name: 'titulo', label: 'Título do Relatório', type: 'text', placeholder: 'Relatório Executivo Q1 2025' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'mensal', label: 'Mensal' },
        { value: 'trimestral', label: 'Trimestral' },
        { value: 'anual', label: 'Anual' },
        { value: 'ad_hoc', label: 'Ad Hoc' },
      ]
    },
    { name: 'data_geracao', label: 'Data de Geração', type: 'date' },
    { name: 'gerado_por_id', label: 'Gerado por (UUID)', type: 'text' },
  ]

  return <GenericCRUDForm tableName="relatorios_executivos" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 10. Notificação
 */
export function NotificacaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    usuario_id: z.string().uuid(),
    titulo: z.string().min(3),
    mensagem: z.string(),
    tipo: z.enum(['info', 'warning', 'error', 'success']),
    lida: z.boolean().default(false),
  })

  const fields: FormField[] = [
    { name: 'usuario_id', label: 'Usuário (UUID)', type: 'text' },
    { name: 'titulo', label: 'Título', type: 'text', placeholder: 'Lote próximo ao vencimento' },
    { name: 'mensagem', label: 'Mensagem', type: 'textarea', placeholder: 'O lote XYZ vence em 7 dias.' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'info', label: 'Informação' },
        { value: 'warning', label: 'Aviso' },
        { value: 'error', label: 'Erro' },
        { value: 'success', label: 'Sucesso' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="notificacoes" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 11. Workflow
 */
export function WorkflowForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    descricao: z.string().optional(),
    trigger: z.enum(['manual', 'scheduled', 'event']),
    ativo: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Workflow', type: 'text', placeholder: 'Aprovação de Compras' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { 
      name: 'trigger', 
      label: 'Gatilho', 
      type: 'select',
      options: [
        { value: 'manual', label: 'Manual' },
        { value: 'scheduled', label: 'Agendado' },
        { value: 'event', label: 'Evento' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="workflows" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 12. Configuração
 */
export function ConfiguracaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    chave: z.string().min(1),
    valor: z.string(),
    tipo: z.enum(['string', 'number', 'boolean', 'json']),
    descricao: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'chave', label: 'Chave', type: 'text', placeholder: 'max_upload_size' },
    { name: 'valor', label: 'Valor', type: 'text', placeholder: '10485760' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'string', label: 'String' },
        { value: 'number', label: 'Number' },
        { value: 'boolean', label: 'Boolean' },
        { value: 'json', label: 'JSON' },
      ]
    },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
  ]

  return <GenericCRUDForm tableName="configuracoes_sistema" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 13. Entrega
 */
export function EntregaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    rota_id: z.string().uuid(),
    endereco_destino: z.string(),
    data_prevista: z.string(),
    status: z.enum(['pendente', 'em_transito', 'entregue', 'devolvido']),
  })

  const fields: FormField[] = [
    { name: 'rota_id', label: 'Rota (UUID)', type: 'text' },
    { name: 'endereco_destino', label: 'Endereço de Destino', type: 'textarea' },
    { name: 'data_prevista', label: 'Data Prevista', type: 'date' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'pendente', label: 'Pendente' },
        { value: 'em_transito', label: 'Em Trânsito' },
        { value: 'entregue', label: 'Entregue' },
        { value: 'devolvido', label: 'Devolvido' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="entregas" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 14. Webhook
 */
export function WebhookForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    url: z.string().url(),
    evento: z.string(),
    ativo: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Webhook', type: 'text', placeholder: 'Webhook Estoque Baixo' },
    { name: 'url', label: 'URL', type: 'text', placeholder: 'https://api.exemplo.com/webhook' },
    { name: 'evento', label: 'Evento', type: 'text', placeholder: 'estoque.baixo' },
  ]

  return <GenericCRUDForm tableName="webhooks" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 15. Dashboard BI
 */
export function DashboardBIForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    descricao: z.string().optional(),
    config_json: z.string(),
    publico: z.boolean().default(false),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Dashboard', type: 'text', placeholder: 'Dashboard Financeiro' },
    { name: 'descricao', label: 'Descrição', type: 'textarea' },
    { name: 'config_json', label: 'Configuração (JSON)', type: 'textarea', placeholder: '{"widgets": [...]}' },
  ]

  return <GenericCRUDForm tableName="dashboards_bi" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 16. Meta
 */
export function MetaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    tipo: z.enum(['vendas', 'faturamento', 'cobranca', 'estoque']),
    valor_alvo: z.number().min(0),
    periodo: z.enum(['diario', 'mensal', 'trimestral', 'anual']),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Meta', type: 'text', placeholder: 'Meta de Vendas Q1' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'vendas', label: 'Vendas' },
        { value: 'faturamento', label: 'Faturamento' },
        { value: 'cobranca', label: 'Cobrança' },
        { value: 'estoque', label: 'Estoque' },
      ]
    },
    { name: 'valor_alvo', label: 'Valor Alvo', type: 'number', placeholder: '100000' },
    { 
      name: 'periodo', 
      label: 'Período', 
      type: 'select',
      options: [
        { value: 'diario', label: 'Diário' },
        { value: 'mensal', label: 'Mensal' },
        { value: 'trimestral', label: 'Trimestral' },
        { value: 'anual', label: 'Anual' },
      ]
    },
  ]

  return <GenericCRUDForm tableName="metas" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 17. Equipamento
 */
export function EquipamentoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    numero_serie: z.string(),
    fabricante: z.string(),
    data_aquisicao: z.string(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Equipamento', type: 'text', placeholder: 'Autoclave 50L' },
    { name: 'numero_serie', label: 'Número de Série', type: 'text', placeholder: 'SN123456789' },
    { name: 'fabricante', label: 'Fabricante', type: 'text', placeholder: 'Fabricante XYZ' },
    { name: 'data_aquisicao', label: 'Data de Aquisição', type: 'date' },
  ]

  return <GenericCRUDForm tableName="equipamentos" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * 18. Documento de Qualidade
 */
export function DocumentoQualidadeForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    codigo: z.string().min(1),
    titulo: z.string().min(3),
    tipo: z.enum(['procedimento', 'instrucao', 'manual', 'politica']),
    versao: z.string(),
    data_vigencia: z.string(),
  })

  const fields: FormField[] = [
    { name: 'codigo', label: 'Código', type: 'text', placeholder: 'POP-001' },
    { name: 'titulo', label: 'Título', type: 'text', placeholder: 'Procedimento de Armazenamento' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'procedimento', label: 'Procedimento Operacional' },
        { value: 'instrucao', label: 'Instrução de Trabalho' },
        { value: 'manual', label: 'Manual' },
        { value: 'politica', label: 'Política' },
      ]
    },
    { name: 'versao', label: 'Versão', type: 'text', placeholder: '1.0' },
    { name: 'data_vigencia', label: 'Data de Vigência', type: 'date' },
  ]

  return <GenericCRUDForm tableName="documentos_qualidade" fields={fields} schema={schema} isOpen={isOpen} onClose={onClose} mode={mode} initialData={initialData} />
}

/**
 * Export de todos os formulários
 */
export const allForms = {
  PerfilAcessoForm,
  ConsignacaoForm,
  RastreabilidadeForm,
  ManutencaoForm,
  NotaFiscalEntradaForm,
  CotacaoForm,
  ContratoForm,
  TabelaPrecoForm,
  RelatorioExecutivoForm,
  NotificacaoForm,
  WorkflowForm,
  ConfiguracaoForm,
  EntregaForm,
  WebhookForm,
  DashboardBIForm,
  MetaForm,
  EquipamentoForm,
  DocumentoQualidadeForm,
}

