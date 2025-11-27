import { ModuleTemplate } from './ModuleTemplate'
import { Mic } from 'lucide-react'

/**
 * Módulo: Voice Macros
 * Categoria: IA & Automação
 * Descrição: Macros ativadas por comandos de voz
 */

export function VoiceMacros() {
  return (
    <ModuleTemplate
      title="Voice Macros"
      description="Macros ativadas por comandos de voz"
      icon={Mic}
      iconColor="#EC4899"
      stats={[
        { label: 'Macros Configuradas', value: 0 },
        { label: 'Executadas (Hoje)', value: 0 },
        { label: 'Mais Usada', value: '-' }
      ]}
    />
  )
}

