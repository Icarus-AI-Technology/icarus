import { ModuleTemplate } from './ModuleTemplate'
import { FileSpreadsheet } from 'lucide-react'

/**
 * Módulo: Tabelas Preços Import
 * Categoria: Vendas & CRM
 * Descrição: Importação em massa de tabelas de preços
 */

export function TabelasPrecosImport() {
  return (
    <ModuleTemplate
      title="Tabelas Preços Import"
      description="Importação em massa de tabelas de preços"
      icon={FileSpreadsheet}
      iconColor="#10B981"
      stats={[
        { label: 'Importações (Mês)', value: 0 },
        { label: 'Produtos Importados', value: 0 },
        { label: 'Taxa Sucesso', value: '0%' }
      ]}
    />
  )
}

