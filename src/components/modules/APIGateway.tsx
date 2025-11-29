import { ModuleTemplate } from './ModuleTemplate'
import { Webhook } from 'lucide-react'

/**
 * Módulo: API Gateway
 * Categoria: Sistema & Integrações
 * Descrição: Gateway de APIs e webhooks
 */

export function APIGateway() {
  return (
    <ModuleTemplate
      title="API Gateway"
      description="Gateway de APIs e webhooks"
      icon={Webhook}
      iconColor="#8b5cf6"
      stats={[
        { label: 'Endpoints Ativos', value: 0 },
        { label: 'Requisições (Hoje)', value: 0 },
        { label: 'Latência Média', value: '0ms' },
        { label: 'Taxa Erro', value: '0%' }
      ]}
    />
  )
}

