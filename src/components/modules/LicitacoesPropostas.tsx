import { ModuleTemplate } from './ModuleTemplate'
import { Scale } from 'lucide-react'

/**
 * Módulo: Licitações e Propostas
 * Categoria: Cirurgias & Procedimentos
 * Descrição: Gestão de licitações públicas e propostas comerciais
 */

export function LicitacoesPropostas() {
  return (
    <ModuleTemplate
      title="Licitações e Propostas"
      description="Gestão de licitações públicas e propostas comerciais"
      icon={Scale}
      iconColor="#8B5CF6"
      stats={[
        { label: 'Licitações Ativas', value: 0 },
        { label: 'Propostas Enviadas', value: 0 },
        { label: 'Taxa de Ganho', value: '0%' },
        { label: 'Valor Total', value: 'R$ 0,00' }
      ]}
      onAdd={() => console.log('Nova licitação')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

