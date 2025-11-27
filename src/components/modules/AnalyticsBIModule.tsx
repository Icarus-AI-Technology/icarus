import { ModuleTemplate } from './ModuleTemplate'
import { BarChart3 } from 'lucide-react'

/**
 * Módulo: Analytics BI
 * Categoria: Sistema & Integrações
 * Descrição: Business Intelligence e análises avançadas
 */

export function AnalyticsBIModule() {
  return (
    <ModuleTemplate
      title="Analytics BI"
      description="Business Intelligence e análises avançadas"
      icon={BarChart3}
      iconColor="#10B981"
      stats={[
        { label: 'Dashboards', value: 0 },
        { label: 'Relatórios', value: 0 },
        { label: 'Fontes de Dados', value: 0 }
      ]}
    />
  )
}

