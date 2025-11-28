/**
 * ICARUS v5.0 - Agents Index
 * 
 * Exporta todos os agentes tutores e utilitários.
 * Framework completo de Agentes LangGraph para IA.
 * 
 * @version 2.0.0
 * @author ICARUS AI Team
 */

// Types
export * from './types'

// Base Agent
export { BaseAgent } from './base-agent'

// Agentes Específicos
export { TrainingTutorAgent } from './training-tutor'
export { UserGuideAgent } from './user-guide'
export { ErrorPredictorAgent } from './error-predictor'
export { TestCertifierAgent } from './test-certifier'
export { AutoCorrectorAgent } from './auto-corrector'
export { LogAuditorAgent } from './log-auditor'
export { AnvisaTutorAgent, anvisaTutor, useAnvisaTutor } from './anvisa-tutor'
export { SecretaryAgent, useSecretaryAgent } from './secretary-agent'

// Factory para criar agentes
import { type AgentType } from './types'
import { BaseAgent } from './base-agent'
import { TrainingTutorAgent } from './training-tutor'
import { UserGuideAgent } from './user-guide'
import { ErrorPredictorAgent } from './error-predictor'
import { TestCertifierAgent } from './test-certifier'
import { AutoCorrectorAgent } from './auto-corrector'
import { LogAuditorAgent } from './log-auditor'
import { AnvisaTutorAgent } from './anvisa-tutor'

/**
 * Factory para criar instâncias de agentes
 */
export function createAgent(type: AgentType | 'anvisa-tutor'): BaseAgent {
  switch (type) {
    case 'training-tutor':
      return new TrainingTutorAgent()
    case 'user-guide':
      return new UserGuideAgent()
    case 'error-predictor':
      return new ErrorPredictorAgent()
    case 'test-certifier':
      return new TestCertifierAgent()
    case 'auto-corrector':
      return new AutoCorrectorAgent()
    case 'log-auditor':
      return new LogAuditorAgent()
    case 'anvisa-tutor':
      return new AnvisaTutorAgent()
    default:
      throw new Error(`Unknown agent type: ${type}`)
  }
}

// Singleton instances para reuso
const agentInstances: Partial<Record<AgentType, BaseAgent>> = {}

/**
 * Obtém uma instância singleton de um agente
 */
export function getAgent(type: AgentType): BaseAgent {
  if (!agentInstances[type]) {
    agentInstances[type] = createAgent(type)
  }
  return agentInstances[type]!
}

/**
 * Limpa todas as instâncias de agentes (útil para testes)
 */
export function clearAgentInstances(): void {
  Object.keys(agentInstances).forEach(key => {
    delete agentInstances[key as AgentType]
  })
}

// Exportar todos os tipos de agentes disponíveis
export const AVAILABLE_AGENTS: AgentType[] = [
  'training-tutor',
  'user-guide',
  'error-predictor',
  'test-certifier',
  'auto-corrector',
  'log-auditor'
]

// Descrições dos agentes para UI
export const AGENT_DESCRIPTIONS: Record<AgentType, { name: string; description: string; icon: string }> = {
  'training-tutor': {
    name: 'Training Tutor',
    description: 'Treina módulos via simulações e gera datasets sintéticos para fine-tuning',
    icon: 'GraduationCap'
  },
  'user-guide': {
    name: 'User Guide',
    description: 'Orienta usuários com passos guiados e onboarding interativo',
    icon: 'BookOpen'
  },
  'error-predictor': {
    name: 'Error Predictor',
    description: 'Prediz falhas e envia alertas proativos sobre riscos',
    icon: 'AlertTriangle'
  },
  'test-certifier': {
    name: 'Test Certifier',
    description: 'Certifica testes de conformidade ANVISA, ISO e auditorias',
    icon: 'ShieldCheck'
  },
  'auto-corrector': {
    name: 'Auto Corrector',
    description: 'Auto-corrige dados e valida consistência cross-branch',
    icon: 'Wand2'
  },
  'log-auditor': {
    name: 'Log Auditor',
    description: 'Audita logs, detecta comportamentos suspeitos e gera relatórios de compliance',
    icon: 'FileSearch'
  }
}

// Hook React para usar agentes
import { useState, useCallback, useMemo } from 'react'

export interface UseAgentResult {
  agent: BaseAgent | null
  isLoading: boolean
  error: string | null
  execute: (input: string) => Promise<string>
  reset: () => void
}

/**
 * Hook para usar um agente específico em componentes React
 */
export function useAgent(type: AgentType): UseAgentResult {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const agent = useMemo(() => {
    try {
      return getAgent(type)
    } catch (e) {
      setError((e as Error).message)
      return null
    }
  }, [type])

  const execute = useCallback(async (input: string): Promise<string> => {
    if (!agent) {
      throw new Error('Agent not initialized')
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await agent.execute({
        input,
        chat_history: [],
        intermediate_steps: []
      })
      return result.output || ''
    } catch (e) {
      const errorMessage = (e as Error).message
      setError(errorMessage)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [agent])

  const reset = useCallback(() => {
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    agent,
    isLoading,
    error,
    execute,
    reset
  }
}

/**
 * Hook para usar múltiplos agentes
 */
export function useAgents(types: AgentType[]): Record<AgentType, UseAgentResult> {
  const results: Partial<Record<AgentType, UseAgentResult>> = {}
  
  for (const type of types) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[type] = useAgent(type)
  }
  
  return results as Record<AgentType, UseAgentResult>
}
