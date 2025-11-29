import { ModuleTemplate } from './ModuleTemplate'
import { FileSpreadsheet } from 'lucide-react'

/**
 * Módulo: Tabelas Preços Form
 * Categoria: Cirurgias & Procedimentos
 * Descrição: Cadastro e edição de tabelas de preços
 */

export function TabelasPrecosForm() {
  return (
    <ModuleTemplate
      title="Tabelas Preços Form"
      description="Cadastro e edição de tabelas de preços"
      icon={FileSpreadsheet}
      iconColor="#8b5cf6"
      stats={[
        { label: 'Tabelas Cadastradas', value: 0 },
        { label: 'Pendentes Aprovação', value: 0 }
      ]}
    />
  )
}

