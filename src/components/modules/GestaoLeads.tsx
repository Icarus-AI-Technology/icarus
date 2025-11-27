import { ModuleTemplate } from './ModuleTemplate'
import { UserPlus } from 'lucide-react'

/**
 * Módulo: Gestão de Leads
 * Categoria: Cadastros & Gestão
 * Descrição: Qualificação e conversão de leads
 */

export function GestaoLeads() {
  return (
    <ModuleTemplate
      title="Gestão de Leads"
      description="Qualificação e conversão de leads"
      icon={UserPlus}
      iconColor="#F59E0B"
      stats={[
        { label: 'Leads Ativos', value: 0 },
        { label: 'Taxa de Conversão', value: '0%' },
        { label: 'Novos (7 dias)', value: 0, trend: { value: 0, direction: 'stable' } }
      ]}
      onAdd={() => console.log('Adicionar lead')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
      onImport={() => console.log('Importar')}
    />
  )
}

