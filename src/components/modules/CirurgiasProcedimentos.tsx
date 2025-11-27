import { ModuleTemplate } from './ModuleTemplate'
import { Calendar } from 'lucide-react'

/**
 * Módulo: Cirurgias e Procedimentos
 * Categoria: Cirurgias & Procedimentos
 * Descrição: Gestão completa de cirurgias e procedimentos
 */

export function CirurgiasProcedimentos() {
  return (
    <ModuleTemplate
      title="Cirurgias e Procedimentos"
      description="Gestão completa de cirurgias e procedimentos"
      icon={Calendar}
      iconColor="#2DD4BF"
      stats={[
        { label: 'Cirurgias Hoje', value: 0 },
        { label: 'Agendadas (7 dias)', value: 0 },
        { label: 'Realizadas (Mês)', value: 0 },
        { label: 'Taxa Sucesso', value: '0%' }
      ]}
      onAdd={() => console.log('Nova cirurgia')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

