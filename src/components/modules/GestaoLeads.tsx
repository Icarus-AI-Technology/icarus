import { ModuleTemplate } from './ModuleTemplate'
import { UserPlus } from 'lucide-react'

/**
 * Módulo: Gestão de Leads
 * Categoria: Cadastros & Gestão
 * Descrição: Qualificação e conversão de leads
 */

export function GestaoLeads() {
  return (
    <ModuleTemplate
      title="Gestão de Leads"
      description="Qualificação e conversão de leads"
      icon={UserPlus}
      iconColor="#8b5cf6"
      stats={[
        { label: 'Leads Ativos', value: 0 },
        { label: 'Taxa de Conversão', value: '0%' },
        { label: 'Novos (7 dias)', value: 0, trend: { value: 0, direction: 'stable' } }
      ]}
    />
  )
}

