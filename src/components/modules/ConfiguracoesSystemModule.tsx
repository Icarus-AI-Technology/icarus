import { ModuleTemplate } from './ModuleTemplate'
import { Settings } from 'lucide-react'

/**
 * Módulo: Configurações System
 * Categoria: Sistema & Integrações
 * Descrição: Configurações gerais do sistema
 */

export function ConfiguracoesSystemModule() {
  return (
    <ModuleTemplate
      title="Configurações System"
      description="Configurações gerais do sistema"
      icon={Settings}
      iconColor="#64748B"
      stats={[
        { label: 'Módulos Ativos', value: 58 },
        { label: 'Usuários', value: 0 },
        { label: 'Armazenamento', value: '0 GB' }
      ]}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
    />
  )
}

