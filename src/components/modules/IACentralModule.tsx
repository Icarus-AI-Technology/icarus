import { ModuleTemplate } from './ModuleTemplate'
import { Brain } from 'lucide-react'

/**
 * Módulo: IA Central
 * Categoria: IA & Automação
 * Descrição: Centro de controle de IA (IcarusBrain)
 */

export function IACentralModule() {
  return (
    <ModuleTemplate
      title="IA Central"
      description="Centro de controle de IA (IcarusBrain)"
      icon={Brain}
      iconColor="#8B5CF6"
      stats={[
        { label: 'Modelos Ativos', value: 14 },
        { label: 'Previsões (Hoje)', value: 0 },
        { label: 'Confiança Média', value: '0%' },
        { label: 'Status', value: 'Online' }
      ]}
    />
  )
}

