import React from 'react'
import { z } from 'zod'
import { GenericCRUDForm, FormField, GenericCRUDFormProps } from './GenericCRUDForm'

/**
 * Formulários CRUD Adicionais - Batch 2
 * 10 novos formulários para módulos principais
 */

/**
 * Formulário para Usuários (RBAC)
 */
export function UsuarioForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3, 'Nome obrigatório'),
    email: z.string().email('Email inválido'),
    cargo: z.string().min(2),
    perfil_id: z.string().uuid('Selecione um perfil válido'),
    ativo: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome Completo', type: 'text', placeholder: 'João Silva' },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'joao@empresa.com' },
    { name: 'cargo', label: 'Cargo', type: 'text', placeholder: 'Gerente de Vendas' },
    // perfil_id seria um select dinâmico com dados de perfis_acesso
    { name: 'perfil_id', label: 'Perfil de Acesso', type: 'text', placeholder: 'UUID do perfil' },
  ]

  return (
    <GenericCRUDForm
      tableName="usuarios"
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
 * Formulário para Inventário
 */
export function InventarioForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    data_inicio: z.string(),
    data_fim: z.string().optional(),
    tipo: z.enum(['ciclico', 'geral', 'por_lote']),
    responsavel_id: z.string().uuid(),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Inventário', type: 'text', placeholder: 'Inventário Anual 2025' },
    { name: 'data_inicio', label: 'Data de Início', type: 'date' },
    { name: 'data_fim', label: 'Data de Fim', type: 'date' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'ciclico', label: 'Cíclico' },
        { value: 'geral', label: 'Geral' },
        { value: 'por_lote', label: 'Por Lote' },
      ]
    },
    { name: 'responsavel_id', label: 'Responsável (UUID)', type: 'text' },
  ]

  return (
    <GenericCRUDForm
      tableName="inventarios"
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
 * Formulário para Pedido de Compra
 */
export function PedidoCompraForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    numero_pedido: z.string().min(1),
    fornecedor_id: z.string().uuid(),
    data_pedido: z.string(),
    data_entrega_prevista: z.string(),
    valor_total: z.number().min(0),
    observacoes: z.string().optional(),
  })

  const fields: FormField[] = [
    { name: 'numero_pedido', label: 'Número do Pedido', type: 'text', placeholder: 'PC-2025-001' },
    { name: 'fornecedor_id', label: 'Fornecedor (UUID)', type: 'text' },
    { name: 'data_pedido', label: 'Data do Pedido', type: 'date' },
    { name: 'data_entrega_prevista', label: 'Previsão de Entrega', type: 'date' },
    { name: 'valor_total', label: 'Valor Total (R$)', type: 'number', placeholder: '10000.00' },
    { name: 'observacoes', label: 'Observações', type: 'textarea' },
  ]

  return (
    <GenericCRUDForm
      tableName="pedidos_compra"
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
 * Formulário para Oportunidade (CRM)
 */
export function OportunidadeForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    titulo: z.string().min(3),
    cliente_id: z.string().uuid(),
    valor_estimado: z.number().min(0),
    probabilidade: z.number().min(0).max(100),
    data_fechamento_prevista: z.string(),
    estagio: z.enum(['prospecção', 'qualificação', 'proposta', 'negociação', 'fechamento']),
  })

  const fields: FormField[] = [
    { name: 'titulo', label: 'Título da Oportunidade', type: 'text', placeholder: 'Venda OPME Hospital X' },
    { name: 'cliente_id', label: 'Cliente (UUID)', type: 'text' },
    { name: 'valor_estimado', label: 'Valor Estimado (R$)', type: 'number', placeholder: '50000' },
    { name: 'probabilidade', label: 'Probabilidade (%)', type: 'number', placeholder: '75' },
    { name: 'data_fechamento_prevista', label: 'Previsão de Fechamento', type: 'date' },
    { 
      name: 'estagio', 
      label: 'Estágio', 
      type: 'select',
      options: [
        { value: 'prospecção', label: 'Prospecção' },
        { value: 'qualificação', label: 'Qualificação' },
        { value: 'proposta', label: 'Proposta Enviada' },
        { value: 'negociação', label: 'Em Negociação' },
        { value: 'fechamento', label: 'Fechamento' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="oportunidades"
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
 * Formulário para Contas a Receber
 */
export function ContaReceberForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    cliente_id: z.string().uuid(),
    numero_documento: z.string().min(1),
    valor: z.number().min(0.01),
    data_vencimento: z.string(),
    data_emissao: z.string(),
    forma_pagamento: z.enum(['boleto', 'pix', 'cartao', 'transferencia']),
  })

  const fields: FormField[] = [
    { name: 'cliente_id', label: 'Cliente (UUID)', type: 'text' },
    { name: 'numero_documento', label: 'Número do Documento', type: 'text', placeholder: 'NF-12345' },
    { name: 'valor', label: 'Valor (R$)', type: 'number', placeholder: '1500.00' },
    { name: 'data_emissao', label: 'Data de Emissão', type: 'date' },
    { name: 'data_vencimento', label: 'Data de Vencimento', type: 'date' },
    { 
      name: 'forma_pagamento', 
      label: 'Forma de Pagamento', 
      type: 'select',
      options: [
        { value: 'boleto', label: 'Boleto' },
        { value: 'pix', label: 'PIX' },
        { value: 'cartao', label: 'Cartão de Crédito' },
        { value: 'transferencia', label: 'Transferência Bancária' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="contas_receber"
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
 * Formulário para Faturamento
 */
export function FaturamentoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    convenio_id: z.string().uuid(),
    cirurgia_id: z.string().uuid(),
    data_faturamento: z.string(),
    valor_total: z.number().min(0),
    status: z.enum(['pendente', 'autorizado', 'glosado', 'pago']),
  })

  const fields: FormField[] = [
    { name: 'convenio_id', label: 'Convênio (UUID)', type: 'text' },
    { name: 'cirurgia_id', label: 'Cirurgia (UUID)', type: 'text' },
    { name: 'data_faturamento', label: 'Data do Faturamento', type: 'date' },
    { name: 'valor_total', label: 'Valor Total (R$)', type: 'number', placeholder: '25000.00' },
    { 
      name: 'status', 
      label: 'Status', 
      type: 'select',
      options: [
        { value: 'pendente', label: 'Pendente' },
        { value: 'autorizado', label: 'Autorizado' },
        { value: 'glosado', label: 'Glosado' },
        { value: 'pago', label: 'Pago' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="faturamentos"
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
 * Formulário para Plano de Contas
 */
export function PlanoContasForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    codigo: z.string().min(1),
    nome: z.string().min(3),
    tipo: z.enum(['ativo', 'passivo', 'receita', 'despesa', 'patrimonio']),
    nivel: z.number().min(1).max(5),
    aceita_lancamento: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'codigo', label: 'Código', type: 'text', placeholder: '1.1.01.001' },
    { name: 'nome', label: 'Nome da Conta', type: 'text', placeholder: 'Caixa' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'ativo', label: 'Ativo' },
        { value: 'passivo', label: 'Passivo' },
        { value: 'receita', label: 'Receita' },
        { value: 'despesa', label: 'Despesa' },
        { value: 'patrimonio', label: 'Patrimônio Líquido' },
      ]
    },
    { name: 'nivel', label: 'Nível', type: 'number', placeholder: '4' },
  ]

  return (
    <GenericCRUDForm
      tableName="plano_contas"
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
 * Formulário para Auditoria
 */
export function AuditoriaForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    titulo: z.string().min(3),
    tipo: z.enum(['interna', 'externa', 'anvisa', 'lgpd']),
    data_auditoria: z.string(),
    auditor_id: z.string().uuid(),
    escopo: z.string(),
  })

  const fields: FormField[] = [
    { name: 'titulo', label: 'Título da Auditoria', type: 'text', placeholder: 'Auditoria ANVISA Q1 2025' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'interna', label: 'Interna' },
        { value: 'externa', label: 'Externa' },
        { value: 'anvisa', label: 'ANVISA' },
        { value: 'lgpd', label: 'LGPD' },
      ]
    },
    { name: 'data_auditoria', label: 'Data da Auditoria', type: 'date' },
    { name: 'auditor_id', label: 'Auditor (UUID)', type: 'text' },
    { name: 'escopo', label: 'Escopo', type: 'textarea', placeholder: 'Descrição do escopo da auditoria...' },
  ]

  return (
    <GenericCRUDForm
      tableName="auditorias"
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
 * Formulário para Agente IA
 */
export function AgenteIAForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    tipo: z.enum(['langgraph', 'react', 'tool_calling', 'rag']),
    modelo: z.enum(['claude-3-5-sonnet', 'gpt-4o', 'gpt-3.5-turbo']),
    prompt_sistema: z.string(),
    ativo: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome do Agente', type: 'text', placeholder: 'EstoqueAgent' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'langgraph', label: 'LangGraph' },
        { value: 'react', label: 'ReAct' },
        { value: 'tool_calling', label: 'Tool Calling' },
        { value: 'rag', label: 'RAG' },
      ]
    },
    { 
      name: 'modelo', 
      label: 'Modelo LLM', 
      type: 'select',
      options: [
        { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
        { value: 'gpt-4o', label: 'GPT-4o' },
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
      ]
    },
    { name: 'prompt_sistema', label: 'Prompt do Sistema', type: 'textarea', placeholder: 'Você é um agente especializado em...' },
  ]

  return (
    <GenericCRUDForm
      tableName="agentes_ia"
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
 * Formulário para Integração
 */
export function IntegracaoForm({ isOpen, onClose, mode, initialData }: Omit<GenericCRUDFormProps, 'tableName' | 'fields' | 'schema'>) {
  const schema = z.object({
    nome: z.string().min(3),
    tipo: z.enum(['rest', 'soap', 'graphql', 'webhook']),
    url_base: z.string().url(),
    auth_tipo: z.enum(['bearer', 'api_key', 'oauth', 'basic')),
    ativa: z.boolean().default(true),
  })

  const fields: FormField[] = [
    { name: 'nome', label: 'Nome da Integração', type: 'text', placeholder: 'API SEFAZ RJ' },
    { 
      name: 'tipo', 
      label: 'Tipo', 
      type: 'select',
      options: [
        { value: 'rest', label: 'REST API' },
        { value: 'soap', label: 'SOAP' },
        { value: 'graphql', label: 'GraphQL' },
        { value: 'webhook', label: 'Webhook' },
      ]
    },
    { name: 'url_base', label: 'URL Base', type: 'text', placeholder: 'https://api.sefaz.rj.gov.br' },
    { 
      name: 'auth_tipo', 
      label: 'Tipo de Autenticação', 
      type: 'select',
      options: [
        { value: 'bearer', label: 'Bearer Token' },
        { value: 'api_key', label: 'API Key' },
        { value: 'oauth', label: 'OAuth 2.0' },
        { value: 'basic', label: 'Basic Auth' },
      ]
    },
  ]

  return (
    <GenericCRUDForm
      tableName="integracoes_config"
      fields={fields}
      schema={schema}
      isOpen={isOpen}
      onClose={onClose}
      mode={mode}
      initialData={initialData}
    />
  )
}

