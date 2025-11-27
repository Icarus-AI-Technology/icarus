import { ModuleTemplate } from './ModuleTemplate'
import { Video } from 'lucide-react'

/**
 * Módulo: Video Calls Manager
 * Categoria: Vendas & CRM
 * Descrição: Videochamadas integradas para atendimento
 */

export function VideoCallsManager() {
  return (
    <ModuleTemplate
      title="Video Calls Manager"
      description="Videochamadas integradas para atendimento"
      icon={Video}
      iconColor="#3B82F6"
      stats={[
        { label: 'Chamadas Hoje', value: 0 },
        { label: 'Agendadas', value: 0 },
        { label: 'Duração Média', value: '0 min' },
        { label: 'Satisfação', value: '0%' }
      ]}
      onAdd={() => console.log('Agendar chamada')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
    />
  )
}

