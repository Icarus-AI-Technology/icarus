import { ModuleTemplate } from './ModuleTemplate'
import { Shield } from 'lucide-react'

/**
 * Módulo: Compliance e Auditoria
 * Categoria: Compliance & Auditoria
 * Descrição: Auditoria interna e compliance regulatório
 */

export function ComplianceAuditoriaModule() {
  return (
    <ModuleTemplate
      title="Compliance e Auditoria"
      description="Auditoria interna e compliance regulatório"
      icon={Shield}
      iconColor="#EF4444"
      stats={[
        { label: 'Auditorias Ativas', value: 0 },
        { label: 'Não Conformidades', value: 0 },
        { label: 'Ações Corretivas', value: 0 },
        { label: 'Taxa Conformidade', value: '100%' }
      ]}
    />
  )
}

