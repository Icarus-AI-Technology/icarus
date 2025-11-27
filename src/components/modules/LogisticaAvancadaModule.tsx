import { ModuleTemplate } from './ModuleTemplate'
import { Truck } from 'lucide-react'

/**
 * Módulo: Logística Avançada
 * Categoria: Sistema & Integrações
 * Descrição: Gestão logística completa com roteirização
 */

export function LogisticaAvancadaModule() {
  return (
    <ModuleTemplate
      title="Logística Avançada"
      description="Gestão logística completa com roteirização"
      icon={Truck}
      iconColor="#6366F1"
      stats={[
        { label: 'Entregas (Hoje)', value: 0 },
        { label: 'Em Trânsito', value: 0 },
        { label: 'Taxa Pontualidade', value: '0%' },
        { label: 'Rotas Otimizadas', value: 0 }
      ]}
      onAdd={() => console.log('Nova entrega')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
      onExport={() => console.log('Exportar')}
    />
  )
}

