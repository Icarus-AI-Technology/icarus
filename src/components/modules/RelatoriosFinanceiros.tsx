import { ModuleTemplate } from './ModuleTemplate'
import { BarChart3 } from 'lucide-react'

/**
 * Módulo: Relatórios Financeiros
 * Categoria: Financeiro & Faturamento
 * Descrição: Relatórios financeiros gerenciais (DRE, Fluxo de Caixa)
 */

export function RelatoriosFinanceiros() {
  return (
    <ModuleTemplate
      title="Relatórios Financeiros"
      description="Relatórios financeiros gerenciais (DRE, Fluxo de Caixa)"
      icon={BarChart3}
      iconColor="#3B82F6"
      stats={[
        { label: 'Relatórios Gerados', value: 0 },
        { label: 'Última Atualização', value: '-' }
      ]}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar PDF')}
    />
  )
}

