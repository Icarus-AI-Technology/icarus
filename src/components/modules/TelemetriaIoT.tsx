import { ModuleTemplate } from './ModuleTemplate'
import { Gauge } from 'lucide-react'

/**
 * Módulo: Telemetria IoT
 * Categoria: Estoque & Consignação
 * Descrição: Monitoramento IoT (temperatura, localização GPS)
 */

export function TelemetriaIoT() {
  return (
    <ModuleTemplate
      title="Telemetria IoT"
      description="Monitoramento IoT (temperatura, localização GPS)"
      icon={Gauge}
      iconColor="#3B82F6"
      stats={[
        { label: 'Dispositivos Ativos', value: 0 },
        { label: 'Alertas Temperatura', value: 0 },
        { label: 'Localização GPS', value: '0 rastreados' },
        { label: 'Uptime', value: '0%' }
      ]}
    />
  )
}

