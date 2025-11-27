import { ModuleTemplate } from './ModuleTemplate'
import { MessageSquare } from 'lucide-react'

/**
 * Módulo: Chatbot Metrics
 * Categoria: IA & Automação
 * Descrição: Métricas e análises do chatbot IA
 */

export function ChatbotMetrics() {
  return (
    <ModuleTemplate
      title="Chatbot Metrics"
      description="Métricas e análises do chatbot IA"
      icon={MessageSquare}
      iconColor="#3B82F6"
      stats={[
        { label: 'Conversas (Hoje)', value: 0 },
        { label: 'Taxa Resolução', value: '0%' },
        { label: 'Tempo Médio', value: '0 min' },
        { label: 'Satisfação', value: '0/5' }
      ]}
    />
  )
}

