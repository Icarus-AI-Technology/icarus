import { ModuleTemplate } from './ModuleTemplate'
import { FileText } from 'lucide-react'

/**
 * Módulo: Relatórios Executivos
 * Categoria: Sistema & Integrações
 * Descrição: Relatórios executivos para diretoria
 */

export function RelatoriosExecutivos() {
  return (
    <ModuleTemplate
      title="Relatórios Executivos"
      description="Relatórios executivos para diretoria"
      icon={FileText}
      iconColor="#EF4444"
      stats={[
        { label: 'Relatórios Disponíveis', value: 12 },
        { label: 'Gerados (Mês)', value: 0 },
        { label: 'Agendados', value: 0 }
      ]}
      onAdd={() => console.log('Novo relatório')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar PDF')}
    />
  )
}

