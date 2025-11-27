import { ModuleTemplate } from './ModuleTemplate'
import { Users } from 'lucide-react'

/**
 * Módulo: RH Gestão de Pessoas
 * Categoria: Cadastros & Gestão
 * Descrição: Recursos Humanos e gestão de equipes
 */

export function RHGestaoPessoas() {
  return (
    <ModuleTemplate
      title="RH Gestão de Pessoas"
      description="Recursos Humanos e gestão de equipes"
      icon={Users}
      iconColor="#6366F1"
      stats={[
        { label: 'Funcionários', value: 0 },
        { label: 'Equipes', value: 0 },
        { label: 'Férias Pendentes', value: 0 }
      ]}
    />
  )
}

