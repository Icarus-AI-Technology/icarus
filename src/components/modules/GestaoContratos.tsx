import { ModuleTemplate } from './ModuleTemplate'
import { FileCheck } from 'lucide-react'

/**
 * Módulo: Gestão de Contratos
 * Categoria: Cadastros & Gestão
 * Descrição: Contratos com hospitais, fornecedores e convênios
 */

export function GestaoContratos() {
  return (
    <ModuleTemplate
      title="Gestão de Contratos"
      description="Contratos com hospitais, fornecedores e convênios"
      icon={FileCheck}
      iconColor="#10B981"
      stats={[
        { label: 'Contratos Ativos', value: 0 },
        { label: 'Vencendo em 30 dias', value: 0 },
        { label: 'Valor Total', value: 'R$ 0,00' }
      ]}
    />
  )
}

