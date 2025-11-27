import { ModuleTemplate } from './ModuleTemplate'
import { PieChart } from 'lucide-react'

/**
 * Módulo: KPI Dashboard
 * Categoria: Sistema & Integrações
 * Descrição: Dashboard executivo de KPIs
 */

export function KPIDashboardModule() {
  return (
    <ModuleTemplate
      title="KPI Dashboard"
      description="Dashboard executivo de KPIs"
      icon={PieChart}
      iconColor="#6366F1"
      stats={[
        { label: 'KPIs Ativos', value: 24 },
        { label: 'Metas Atingidas', value: '0%' },
        { label: 'Alertas', value: 0 }
      ]}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

