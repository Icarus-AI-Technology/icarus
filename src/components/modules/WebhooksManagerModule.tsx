import { ModuleTemplate } from './ModuleTemplate'
import { Zap } from 'lucide-react'

/**
 * Módulo: Webhooks Manager
 * Categoria: Sistema & Integrações
 * Descrição: Gerenciamento de webhooks
 */

export function WebhooksManagerModule() {
  return (
    <ModuleTemplate
      title="Webhooks Manager"
      description="Gerenciamento de webhooks"
      icon={Zap}
      iconColor="#EC4899"
      stats={[
        { label: 'Webhooks Ativos', value: 0 },
        { label: 'Disparos (Hoje)', value: 0 },
        { label: 'Taxa Sucesso', value: '0%' },
        { label: 'Falhas', value: 0 }
      ]}
    />
  )
}

