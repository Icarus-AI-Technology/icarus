import { ModuleTemplate } from './ModuleTemplate'
import { Megaphone } from 'lucide-react'

/**
 * Módulo: Campanhas Marketing
 * Categoria: Vendas & CRM
 * Descrição: Gestão de campanhas de marketing digital
 */

export function CampanhasMarketing() {
  return (
    <ModuleTemplate
      title="Campanhas Marketing"
      description="Gestão de campanhas de marketing digital"
      icon={Megaphone}
      iconColor="#EC4899"
      stats={[
        { label: 'Campanhas Ativas', value: 0 },
        { label: 'Leads Gerados', value: 0 },
        { label: 'ROI Médio', value: '0%' },
        { label: 'Investimento', value: 'R$ 0,00' }
      ]}
      onAdd={() => console.log('Nova campanha')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

