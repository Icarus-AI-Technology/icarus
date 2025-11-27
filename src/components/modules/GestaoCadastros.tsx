import { ModuleTemplate } from './ModuleTemplate'
import { FileText } from 'lucide-react'

/**
 * Módulo: Gestão de Cadastros
 * Categoria: Cadastros & Gestão
 * Descrição: Cadastros auxiliares (médicos, hospitais, pacientes, convênios)
 */

export function GestaoCadastros() {
  return (
    <ModuleTemplate
      title="Gestão de Cadastros"
      description="Cadastros auxiliares do sistema"
      icon={FileText}
      iconColor="#F59E0B"
      stats={[
        { label: 'Médicos', value: 0 },
        { label: 'Hospitais', value: 0 },
        { label: 'Pacientes', value: 0 },
        { label: 'Convênios', value: 0 }
      ]}
      onAdd={() => console.log('Adicionar cadastro')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

