import { ModuleTemplate } from './ModuleTemplate'
import { Settings } from 'lucide-react'

/**
 * Módulo: Manutenção Preventiva
 * Categoria: Estoque & Consignação
 * Descrição: Manutenção preventiva de equipamentos OPME
 */

export function ManutencaoPreventiva() {
  return (
    <ModuleTemplate
      title="Manutenção Preventiva"
      description="Manutenção preventiva de equipamentos OPME"
      icon={Settings}
      iconColor="#F59E0B"
      stats={[
        { label: 'Equipamentos', value: 0 },
        { label: 'Manutenções Agendadas', value: 0 },
        { label: 'Vencidas', value: 0 },
        { label: 'Taxa Conformidade', value: '0%' }
      ]}
    />
  )
}

