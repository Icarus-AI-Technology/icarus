/**
 * ICARUS v5.0 - API Gateway Templates
 * 
 * Templates pré-configurados para integração com sistemas externos.
 * Suporta SAP, Oracle, TOTVS, e outros ERPs.
 * 
 * Funcionalidades:
 * - Templates para integração de estoque
 * - Templates para Sell Out automático
 * - Autenticação OAuth2, API Key, Basic Auth
 * - Transformação de dados
 * - Rate limiting e retry
 * - Logs de auditoria
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'
import { supabase } from '@/lib/config/supabase-client'
import { audit } from '@/lib/blockchain/audit-trail'

// ============ TIPOS ============

export interface APIGatewayTemplate {
  id: string
  name: string
  description: string
  category: TemplateCategory
  version: string
  authType: AuthType
  baseUrl: string
  endpoints: EndpointConfig[]
  dataMapping: DataMapping[]
  schedule?: ScheduleConfig
  retryPolicy: RetryPolicy
  rateLimit: RateLimitConfig
  enabled: boolean
}

export type TemplateCategory =
  | 'erp_integration'
  | 'stock_sync'
  | 'sellout_report'
  | 'purchase_order'
  | 'invoice'
  | 'product_catalog'
  | 'pricing'
  | 'customer_data'

export type AuthType =
  | 'none'
  | 'api_key'
  | 'basic'
  | 'oauth2'
  | 'jwt'
  | 'certificate'

export interface EndpointConfig {
  id: string
  name: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  headers?: Record<string, string>
  queryParams?: Record<string, string>
  bodyTemplate?: string
  responseMapping?: DataMapping[]
}

export interface DataMapping {
  source: string
  target: string
  transform?: TransformType
  defaultValue?: unknown
}

export type TransformType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'currency'
  | 'uppercase'
  | 'lowercase'
  | 'trim'
  | 'custom'

export interface ScheduleConfig {
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly'
  time?: string
  dayOfWeek?: number
  dayOfMonth?: number
  timezone: string
}

export interface RetryPolicy {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export interface RateLimitConfig {
  requestsPerMinute: number
  requestsPerHour: number
  requestsPerDay: number
}

export interface IntegrationCredentials {
  id: string
  templateId: string
  name: string
  authType: AuthType
  credentials: {
    apiKey?: string
    username?: string
    password?: string
    clientId?: string
    clientSecret?: string
    tokenUrl?: string
    certificate?: string
  }
  isActive: boolean
}

export interface IntegrationLog {
  id: string
  templateId: string
  credentialsId: string
  endpoint: string
  method: string
  requestBody?: unknown
  responseStatus: number
  responseBody?: unknown
  duration: number
  success: boolean
  error?: string
  timestamp: string
}

// ============ TEMPLATES PRÉ-CONFIGURADOS ============

export const API_GATEWAY_TEMPLATES: APIGatewayTemplate[] = [
  // Template SAP - Estoque
  {
    id: 'sap_stock_sync',
    name: 'SAP - Sincronização de Estoque',
    description: 'Integração com SAP para sincronização bidirecional de estoque em tempo real',
    category: 'stock_sync',
    version: '1.0.0',
    authType: 'oauth2',
    baseUrl: '{{SAP_BASE_URL}}/sap/opu/odata/sap',
    endpoints: [
      {
        id: 'get_stock',
        name: 'Consultar Estoque',
        method: 'GET',
        path: '/API_MATERIAL_STOCK_SRV/A_MatlStkInAcctMod',
        headers: {
          'Accept': 'application/json',
          'x-csrf-token': 'fetch',
        },
        queryParams: {
          '$filter': "Plant eq '{{PLANT_CODE}}'",
          '$select': 'Material,Plant,StorageLocation,MatlWrhsStkQtyInMatlBaseUnit',
        },
        responseMapping: [
          { source: 'd.results', target: 'items', transform: 'custom' },
        ],
      },
      {
        id: 'post_stock_movement',
        name: 'Registrar Movimentação',
        method: 'POST',
        path: '/API_MATERIAL_DOCUMENT_SRV/A_MaterialDocumentHeader',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': '{{CSRF_TOKEN}}',
        },
        bodyTemplate: JSON.stringify({
          GoodsMovementCode: '{{MOVEMENT_TYPE}}',
          DocumentDate: '{{DATE}}',
          PostingDate: '{{DATE}}',
          to_MaterialDocumentItem: {
            results: '{{ITEMS}}'
          }
        }),
      },
    ],
    dataMapping: [
      { source: 'codigo', target: 'Material', transform: 'uppercase' },
      { source: 'quantidade', target: 'MatlWrhsStkQtyInMatlBaseUnit', transform: 'number' },
      { source: 'lote', target: 'Batch', transform: 'string' },
      { source: 'deposito', target: 'StorageLocation', transform: 'string' },
    ],
    schedule: {
      frequency: 'hourly',
      timezone: 'America/Sao_Paulo',
    },
    retryPolicy: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    enabled: true,
  },

  // Template SAP - Sell Out
  {
    id: 'sap_sellout_report',
    name: 'SAP - Relatório de Sell Out',
    description: 'Envio automático de dados de Sell Out para fabricantes via SAP',
    category: 'sellout_report',
    version: '1.0.0',
    authType: 'oauth2',
    baseUrl: '{{SAP_BASE_URL}}/sap/opu/odata/sap',
    endpoints: [
      {
        id: 'post_sellout',
        name: 'Enviar Sell Out',
        method: 'POST',
        path: '/Z_SELLOUT_SRV/SellOutSet',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': '{{CSRF_TOKEN}}',
        },
        bodyTemplate: JSON.stringify({
          DistributorCode: '{{DISTRIBUTOR_CODE}}',
          ReportPeriod: '{{PERIOD}}',
          ReportDate: '{{DATE}}',
          Items: '{{SELLOUT_ITEMS}}'
        }),
      },
    ],
    dataMapping: [
      { source: 'produto_codigo', target: 'MaterialNumber', transform: 'uppercase' },
      { source: 'quantidade_vendida', target: 'SalesQuantity', transform: 'number' },
      { source: 'valor_total', target: 'SalesValue', transform: 'currency' },
      { source: 'cliente_cnpj', target: 'CustomerTaxID', transform: 'string' },
      { source: 'data_venda', target: 'SalesDate', transform: 'date' },
      { source: 'nfe_numero', target: 'InvoiceNumber', transform: 'string' },
    ],
    schedule: {
      frequency: 'daily',
      time: '23:00',
      timezone: 'America/Sao_Paulo',
    },
    retryPolicy: {
      maxRetries: 5,
      initialDelay: 5000,
      maxDelay: 60000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 5000,
    },
    enabled: true,
  },

  // Template Genérico - REST API Estoque
  {
    id: 'generic_stock_api',
    name: 'API REST - Estoque (Genérico)',
    description: 'Template genérico para integração de estoque via REST API',
    category: 'stock_sync',
    version: '1.0.0',
    authType: 'api_key',
    baseUrl: '{{API_BASE_URL}}',
    endpoints: [
      {
        id: 'get_inventory',
        name: 'Consultar Inventário',
        method: 'GET',
        path: '/api/v1/inventory',
        headers: {
          'Accept': 'application/json',
          'X-API-Key': '{{API_KEY}}',
        },
        queryParams: {
          'page': '{{PAGE}}',
          'limit': '{{LIMIT}}',
          'updated_since': '{{LAST_SYNC}}',
        },
      },
      {
        id: 'update_stock',
        name: 'Atualizar Estoque',
        method: 'PUT',
        path: '/api/v1/inventory/{{PRODUCT_ID}}',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '{{API_KEY}}',
        },
        bodyTemplate: JSON.stringify({
          quantity: '{{QUANTITY}}',
          location: '{{LOCATION}}',
          batch: '{{BATCH}}',
          expiry_date: '{{EXPIRY}}',
        }),
      },
      {
        id: 'post_movement',
        name: 'Registrar Movimento',
        method: 'POST',
        path: '/api/v1/inventory/movements',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': '{{API_KEY}}',
        },
        bodyTemplate: JSON.stringify({
          product_id: '{{PRODUCT_ID}}',
          movement_type: '{{MOVEMENT_TYPE}}',
          quantity: '{{QUANTITY}}',
          reference: '{{REFERENCE}}',
          timestamp: '{{TIMESTAMP}}',
        }),
      },
    ],
    dataMapping: [
      { source: 'id', target: 'product_id', transform: 'string' },
      { source: 'codigo', target: 'sku', transform: 'uppercase' },
      { source: 'quantidade_estoque', target: 'quantity', transform: 'number' },
      { source: 'lote', target: 'batch', transform: 'string' },
      { source: 'validade', target: 'expiry_date', transform: 'date' },
    ],
    retryPolicy: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 100,
      requestsPerHour: 2000,
      requestsPerDay: 20000,
    },
    enabled: true,
  },

  // Template CRM Cardíaco - Dispositivos Implantáveis
  {
    id: 'crm_cardiac_devices',
    name: 'CRM Cardíaco - Dispositivos Implantáveis',
    description: 'Integração para rastreabilidade de dispositivos cardíacos implantáveis (marca-passos, CDI, CRT)',
    category: 'product_catalog',
    version: '1.0.0',
    authType: 'oauth2',
    baseUrl: '{{MANUFACTURER_API_URL}}',
    endpoints: [
      {
        id: 'get_devices',
        name: 'Consultar Dispositivos',
        method: 'GET',
        path: '/api/v1/devices',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer {{ACCESS_TOKEN}}',
        },
        queryParams: {
          'device_type': '{{DEVICE_TYPE}}',
          'status': 'available',
        },
      },
      {
        id: 'register_implant',
        name: 'Registrar Implante',
        method: 'POST',
        path: '/api/v1/implants',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{ACCESS_TOKEN}}',
        },
        bodyTemplate: JSON.stringify({
          device_serial: '{{SERIAL_NUMBER}}',
          device_model: '{{MODEL}}',
          implant_date: '{{IMPLANT_DATE}}',
          patient_id: '{{PATIENT_ID}}',
          physician_id: '{{PHYSICIAN_ID}}',
          facility_id: '{{FACILITY_ID}}',
          procedure_type: '{{PROCEDURE_TYPE}}',
        }),
      },
      {
        id: 'report_sellout',
        name: 'Reportar Sell Out',
        method: 'POST',
        path: '/api/v1/sellout',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{ACCESS_TOKEN}}',
        },
        bodyTemplate: JSON.stringify({
          distributor_id: '{{DISTRIBUTOR_ID}}',
          report_period: '{{PERIOD}}',
          items: '{{SELLOUT_ITEMS}}',
        }),
      },
    ],
    dataMapping: [
      { source: 'numero_serie', target: 'device_serial', transform: 'uppercase' },
      { source: 'modelo', target: 'device_model', transform: 'string' },
      { source: 'registro_anvisa', target: 'anvisa_registration', transform: 'string' },
      { source: 'data_implante', target: 'implant_date', transform: 'date' },
      { source: 'paciente_id', target: 'patient_id', transform: 'string' },
      { source: 'medico_crm', target: 'physician_id', transform: 'string' },
      { source: 'hospital_cnes', target: 'facility_id', transform: 'string' },
    ],
    schedule: {
      frequency: 'daily',
      time: '22:00',
      timezone: 'America/Sao_Paulo',
    },
    retryPolicy: {
      maxRetries: 5,
      initialDelay: 2000,
      maxDelay: 60000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 30,
      requestsPerHour: 500,
      requestsPerDay: 5000,
    },
    enabled: true,
  },

  // Template TOTVS Protheus
  {
    id: 'totvs_protheus',
    name: 'TOTVS Protheus - Integração ERP',
    description: 'Integração com TOTVS Protheus para pedidos, estoque e financeiro',
    category: 'erp_integration',
    version: '1.0.0',
    authType: 'basic',
    baseUrl: '{{TOTVS_BASE_URL}}/rest',
    endpoints: [
      {
        id: 'get_products',
        name: 'Consultar Produtos',
        method: 'GET',
        path: '/FWMODEL/SB1',
        headers: {
          'Accept': 'application/json',
        },
      },
      {
        id: 'get_stock',
        name: 'Consultar Estoque',
        method: 'GET',
        path: '/FWMODEL/SB2',
        headers: {
          'Accept': 'application/json',
        },
      },
      {
        id: 'post_order',
        name: 'Criar Pedido',
        method: 'POST',
        path: '/FWMODEL/SC5',
        headers: {
          'Content-Type': 'application/json',
        },
        bodyTemplate: JSON.stringify({
          C5_CLIENTE: '{{CUSTOMER_CODE}}',
          C5_LOJACLI: '{{CUSTOMER_BRANCH}}',
          C5_CONDPAG: '{{PAYMENT_TERMS}}',
          ITEMS: '{{ORDER_ITEMS}}',
        }),
      },
    ],
    dataMapping: [
      { source: 'codigo', target: 'B1_COD', transform: 'uppercase' },
      { source: 'descricao', target: 'B1_DESC', transform: 'string' },
      { source: 'quantidade', target: 'B2_QATU', transform: 'number' },
      { source: 'custo', target: 'B2_CM1', transform: 'currency' },
    ],
    retryPolicy: {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 60,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    enabled: true,
  },

  // Template Oracle NetSuite
  {
    id: 'oracle_netsuite',
    name: 'Oracle NetSuite - Integração ERP',
    description: 'Integração com Oracle NetSuite via SuiteTalk REST API',
    category: 'erp_integration',
    version: '1.0.0',
    authType: 'oauth2',
    baseUrl: '{{NETSUITE_ACCOUNT_ID}}.suitetalk.api.netsuite.com',
    endpoints: [
      {
        id: 'get_inventory',
        name: 'Consultar Inventário',
        method: 'GET',
        path: '/services/rest/record/v1/inventoryItem',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer {{ACCESS_TOKEN}}',
        },
      },
      {
        id: 'create_sales_order',
        name: 'Criar Pedido de Venda',
        method: 'POST',
        path: '/services/rest/record/v1/salesOrder',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer {{ACCESS_TOKEN}}',
        },
      },
    ],
    dataMapping: [
      { source: 'codigo', target: 'itemId', transform: 'string' },
      { source: 'descricao', target: 'displayName', transform: 'string' },
      { source: 'quantidade', target: 'quantityOnHand', transform: 'number' },
    ],
    retryPolicy: {
      maxRetries: 3,
      initialDelay: 2000,
      maxDelay: 60000,
      backoffMultiplier: 2,
    },
    rateLimit: {
      requestsPerMinute: 50,
      requestsPerHour: 1000,
      requestsPerDay: 10000,
    },
    enabled: true,
  },
]

// ============ CLASSE PRINCIPAL ============

class APIGatewayService {
  private templates: Map<string, APIGatewayTemplate> = new Map()
  private credentials: Map<string, IntegrationCredentials> = new Map()

  constructor() {
    // Carregar templates pré-definidos
    for (const template of API_GATEWAY_TEMPLATES) {
      this.templates.set(template.id, template)
    }
  }

  /**
   * Obtém todos os templates
   */
  getTemplates(): APIGatewayTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Obtém template por ID
   */
  getTemplate(id: string): APIGatewayTemplate | undefined {
    return this.templates.get(id)
  }

  /**
   * Obtém templates por categoria
   */
  getTemplatesByCategory(category: TemplateCategory): APIGatewayTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.category === category)
  }

  /**
   * Adiciona template customizado
   */
  addCustomTemplate(template: APIGatewayTemplate): void {
    this.templates.set(template.id, template)
    logger.info('Custom template added:', { templateId: template.id })
  }

  /**
   * Configura credenciais para um template
   */
  async configureCredentials(credentials: IntegrationCredentials): Promise<void> {
    this.credentials.set(credentials.id, credentials)

    // Salvar no banco (criptografado)
    await supabase.from('integration_credentials').upsert({
      id: credentials.id,
      template_id: credentials.templateId,
      name: credentials.name,
      auth_type: credentials.authType,
      credentials_encrypted: JSON.stringify(credentials.credentials), // Em produção, criptografar
      is_active: credentials.isActive,
    })

    logger.info('Credentials configured:', { credentialsId: credentials.id })
  }

  /**
   * Executa chamada de API usando template
   */
  async executeEndpoint(
    templateId: string,
    endpointId: string,
    credentialsId: string,
    variables: Record<string, string>
  ): Promise<{
    success: boolean
    status: number
    data: unknown
    error?: string
    duration: number
  }> {
    const startTime = Date.now()
    const template = this.templates.get(templateId)
    const creds = this.credentials.get(credentialsId)

    if (!template) {
      return {
        success: false,
        status: 0,
        data: null,
        error: `Template not found: ${templateId}`,
        duration: Date.now() - startTime,
      }
    }

    const endpoint = template.endpoints.find(e => e.id === endpointId)
    if (!endpoint) {
      return {
        success: false,
        status: 0,
        data: null,
        error: `Endpoint not found: ${endpointId}`,
        duration: Date.now() - startTime,
      }
    }

    try {
      // Substituir variáveis na URL
      let url = `${template.baseUrl}${endpoint.path}`
      for (const [key, value] of Object.entries(variables)) {
        url = url.replace(`{{${key}}}`, value)
      }

      // Preparar headers
      const headers: Record<string, string> = { ...endpoint.headers }
      for (const [key, value] of Object.entries(headers)) {
        for (const [varKey, varValue] of Object.entries(variables)) {
          headers[key] = value.replace(`{{${varKey}}}`, varValue)
        }
      }

      // Adicionar autenticação
      if (creds) {
        headers['Authorization'] = this.getAuthHeader(template.authType, creds.credentials)
      }

      // Preparar body
      let body: string | undefined
      if (endpoint.bodyTemplate && ['POST', 'PUT', 'PATCH'].includes(endpoint.method)) {
        body = endpoint.bodyTemplate
        for (const [key, value] of Object.entries(variables)) {
          body = body.replace(`{{${key}}}`, value)
        }
      }

      // Executar requisição
      const response = await fetch(url, {
        method: endpoint.method,
        headers,
        body,
      })

      const data = await response.json().catch(() => null)

      // Log de auditoria
      await this.logIntegration({
        id: crypto.randomUUID(),
        templateId,
        credentialsId,
        endpoint: endpointId,
        method: endpoint.method,
        requestBody: body ? JSON.parse(body) : undefined,
        responseStatus: response.status,
        responseBody: data,
        duration: Date.now() - startTime,
        success: response.ok,
        timestamp: new Date().toISOString(),
      })

      return {
        success: response.ok,
        status: response.status,
        data,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      await this.logIntegration({
        id: crypto.randomUUID(),
        templateId,
        credentialsId,
        endpoint: endpointId,
        method: endpoint.method,
        responseStatus: 0,
        duration: Date.now() - startTime,
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      })

      return {
        success: false,
        status: 0,
        data: null,
        error: errorMessage,
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Gera header de autenticação
   */
  private getAuthHeader(authType: AuthType, credentials: IntegrationCredentials['credentials']): string {
    switch (authType) {
      case 'api_key':
        return credentials.apiKey || ''
      case 'basic': {
        const basicAuth = btoa(`${credentials.username}:${credentials.password}`)
        return `Basic ${basicAuth}`
      }
      case 'oauth2':
      case 'jwt':
        return `Bearer ${credentials.apiKey}` // Token armazenado em apiKey
      default:
        return ''
    }
  }

  /**
   * Registra log de integração
   */
  private async logIntegration(log: IntegrationLog): Promise<void> {
    try {
      await supabase.from('integration_logs').insert({
        id: log.id,
        template_id: log.templateId,
        credentials_id: log.credentialsId,
        endpoint: log.endpoint,
        method: log.method,
        request_body: log.requestBody,
        response_status: log.responseStatus,
        response_body: log.responseBody,
        duration: log.duration,
        success: log.success,
        error: log.error,
        timestamp: log.timestamp,
      })

      // Registrar na blockchain para auditoria
      await audit(
        'API_REQUEST' as any,
        'api_request',
        log.id,
        'SYSTEM',
        'API Gateway',
        'system',
        {
          templateId: log.templateId,
          endpoint: log.endpoint,
          success: log.success,
          status: log.responseStatus,
        }
      )
    } catch (error) {
      logger.error('Failed to log integration:', error)
    }
  }

  /**
   * Envia relatório de Sell Out
   */
  async sendSellOutReport(
    templateId: string,
    credentialsId: string,
    period: string,
    items: Array<{
      productCode: string
      quantity: number
      value: number
      customerCnpj: string
      saleDate: string
      invoiceNumber: string
    }>
  ): Promise<{ success: boolean; error?: string }> {
    const template = this.templates.get(templateId)
    if (!template) {
      return { success: false, error: 'Template not found' }
    }

    const selloutEndpoint = template.endpoints.find(e => 
      e.id.includes('sellout') || e.name.toLowerCase().includes('sell out')
    )

    if (!selloutEndpoint) {
      return { success: false, error: 'Sell Out endpoint not found in template' }
    }

    // Mapear dados usando dataMapping do template
    const mappedItems = items.map(item => {
      const mapped: Record<string, unknown> = {}
      for (const mapping of template.dataMapping) {
        const sourceValue = item[mapping.source as keyof typeof item]
        if (sourceValue !== undefined) {
          mapped[mapping.target] = this.transformValue(sourceValue, mapping.transform)
        }
      }
      return mapped
    })

    const result = await this.executeEndpoint(
      templateId,
      selloutEndpoint.id,
      credentialsId,
      {
        PERIOD: period,
        DATE: new Date().toISOString(),
        SELLOUT_ITEMS: JSON.stringify(mappedItems),
      }
    )

    return {
      success: result.success,
      error: result.error,
    }
  }

  /**
   * Transforma valor conforme tipo
   */
  private transformValue(value: unknown, transform?: TransformType): unknown {
    if (!transform) return value

    switch (transform) {
      case 'string':
        return String(value)
      case 'number':
        return Number(value)
      case 'boolean':
        return Boolean(value)
      case 'date':
        return new Date(value as string).toISOString()
      case 'currency':
        return Number(value).toFixed(2)
      case 'uppercase':
        return String(value).toUpperCase()
      case 'lowercase':
        return String(value).toLowerCase()
      case 'trim':
        return String(value).trim()
      default:
        return value
    }
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const apiGateway = new APIGatewayService()

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export function useAPIGateway() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const executeEndpoint = useCallback(async (
    templateId: string,
    endpointId: string,
    credentialsId: string,
    variables: Record<string, string>
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      return await apiGateway.executeEndpoint(templateId, endpointId, credentialsId, variables)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute endpoint')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendSellOut = useCallback(async (
    templateId: string,
    credentialsId: string,
    period: string,
    items: Parameters<typeof apiGateway.sendSellOutReport>[3]
  ) => {
    setIsLoading(true)
    setError(null)
    try {
      return await apiGateway.sendSellOutReport(templateId, credentialsId, period, items)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send sell out')
      return { success: false, error: 'Unknown error' }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    templates: apiGateway.getTemplates(),
    getTemplate: apiGateway.getTemplate.bind(apiGateway),
    getTemplatesByCategory: apiGateway.getTemplatesByCategory.bind(apiGateway),
    executeEndpoint,
    sendSellOut,
    isLoading,
    error,
  }
}

// ============ EXPORTS ============

export default {
  apiGateway,
  useAPIGateway,
  API_GATEWAY_TEMPLATES,
}

