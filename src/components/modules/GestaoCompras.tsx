import { ModuleTemplate } from './ModuleTemplate'
import { ShoppingCart } from 'lucide-react'

/**
 * Módulo: Gestão de Compras
 * Categoria: Compras & Fornecedores
 * Descrição: Gestão completa de compras e cotações
 */

export function GestaoCompras() {
  return (
    <ModuleTemplate
      title="Gestão de Compras"
      description="Gestão completa de compras e cotações"
      icon={ShoppingCart}
      iconColor="#8B5CF6"
      stats={[
        { label: 'Pedidos Ativos', value: 0 },
        { label: 'Cotações Pendentes', value: 0 },
        { label: 'Valor Total (Mês)', value: 'R$ 0,00' },
        { label: 'Fornecedores', value: 0 }
      ]}
      onAdd={() => console.log('Nova compra')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

