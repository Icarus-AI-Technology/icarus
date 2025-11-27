import { ModuleTemplate } from './ModuleTemplate'
import { Eye } from 'lucide-react'

/**
 * Módulo: Tabela Preços Viewer
 * Categoria: Cirurgias & Procedimentos
 * Descrição: Visualização de tabelas de preços OPME
 */

export function TabelaPrecosViewer() {
  return (
    <ModuleTemplate
      title="Tabela Preços Viewer"
      description="Visualização de tabelas de preços OPME"
      icon={Eye}
      iconColor="#3B82F6"
      stats={[
        { label: 'Tabelas Ativas', value: 0 },
        { label: 'Produtos', value: 0 },
        { label: 'Última Atualização', value: '-' }
      ]}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

