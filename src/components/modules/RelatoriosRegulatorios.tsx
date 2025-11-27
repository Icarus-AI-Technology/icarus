import { ModuleTemplate } from './ModuleTemplate'
import { FileCheck } from 'lucide-react'

/**
 * Módulo: Relatórios Regulatórios
 * Categoria: Financeiro & Faturamento
 * Descrição: Relatórios regulatórios (SPED, DCTF, DIRF)
 */

export function RelatoriosRegulatorios() {
  return (
    <ModuleTemplate
      title="Relatórios Regulatórios"
      description="Relatórios regulatórios (SPED, DCTF, DIRF)"
      icon={FileCheck}
      iconColor="#EF4444"
      stats={[
        { label: 'Obrigações Pendentes', value: 0 },
        { label: 'Em Dia', value: 0 },
        { label: 'Próximo Vencimento', value: '-' }
      ]}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

