import { ModuleTemplate } from './ModuleTemplate'
import { Container } from 'lucide-react'

/**
 * Módulo: Consignação Avançada
 * Categoria: Estoque & Consignação
 * Descrição: Gestão de kits consignados em hospitais
 */

export function ConsignacaoAvancada() {
  return (
    <ModuleTemplate
      title="Consignação Avançada"
      description="Gestão de kits consignados em hospitais"
      icon={Container}
      iconColor="#10B981"
      stats={[
        { label: 'Kits Ativos', value: 0 },
        { label: 'Hospitais', value: 0 },
        { label: 'Valor Consignado', value: 'R$ 0,00' },
        { label: 'Taxa Retorno', value: '0%' }
      ]}
      onAdd={() => console.log('Novo kit')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

