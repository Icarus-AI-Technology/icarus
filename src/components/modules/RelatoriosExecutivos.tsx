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
    />
  )
}

