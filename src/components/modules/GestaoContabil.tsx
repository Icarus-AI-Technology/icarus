import { ModuleTemplate } from './ModuleTemplate'
import { FileSpreadsheet } from 'lucide-react'

/**
 * Módulo: Gestão Contábil
 * Categoria: Financeiro & Faturamento
 * Descrição: Contabilidade e plano de contas
 */

export function GestaoContabil() {
  return (
    <ModuleTemplate
      title="Gestão Contábil"
      description="Contabilidade e plano de contas"
      icon={FileSpreadsheet}
      iconColor="#F59E0B"
      stats={[
        { label: 'Lançamentos (Mês)', value: 0 },
        { label: 'Contas Ativas', value: 0 },
        { label: 'Saldo Geral', value: 'R$ 0,00' }
      ]}
      onAdd={() => console.log('Novo lançamento')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

