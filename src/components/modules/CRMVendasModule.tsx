import { ModuleTemplate } from './ModuleTemplate'
import { Users } from 'lucide-react'

/**
 * Módulo: CRM Vendas
 * Categoria: Vendas & CRM
 * Descrição: CRM completo com funil de vendas
 */

export function CRMVendasModule() {
  return (
    <ModuleTemplate
      title="CRM Vendas"
      description="CRM completo com funil de vendas"
      icon={Users}
      iconColor="#6366F1"
      stats={[
        { label: 'Leads Ativos', value: 0 },
        { label: 'Oportunidades', value: 0 },
        { label: 'Taxa Conversão', value: '0%' },
        { label: 'Valor Pipeline', value: 'R$ 0,00' }
      ]}
    />
  )
}

