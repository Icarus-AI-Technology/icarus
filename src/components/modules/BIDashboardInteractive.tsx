import { ModuleTemplate } from './ModuleTemplate'
import { Activity } from 'lucide-react'

/**
 * Módulo: BI Dashboard Interactive
 * Categoria: Sistema & Integrações
 * Descrição: Dashboard BI interativo e customizável
 */

export function BIDashboardInteractive() {
  return (
    <ModuleTemplate
      title="BI Dashboard Interactive"
      description="Dashboard BI interativo e customizável"
      icon={Activity}
      iconColor="#8b5cf6"
      stats={[
        { label: 'Dashboards Personalizados', value: 0 },
        { label: 'Widgets', value: 0 },
        { label: 'Usuários Ativos', value: 0 }
      ]}
    />
  )
}

