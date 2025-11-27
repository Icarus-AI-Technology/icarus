import { ModuleTemplate } from './ModuleTemplate'
import { Workflow } from 'lucide-react'

/**
 * Módulo: Workflow Builder
 * Categoria: IA & Automação
 * Descrição: Construtor visual de workflows automatizados
 */

export function WorkflowBuilder() {
  return (
    <ModuleTemplate
      title="Workflow Builder"
      description="Construtor visual de workflows automatizados"
      icon={Workflow}
      iconColor="#10B981"
      stats={[
        { label: 'Workflows Ativos', value: 0 },
        { label: 'Executados (Hoje)', value: 0 },
        { label: 'Taxa Sucesso', value: '0%' },
        { label: 'Tempo Economizado', value: '0h' }
      ]}
    />
  )
}

