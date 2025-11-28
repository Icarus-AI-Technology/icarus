/**
 * ICARUS v5.0 - Voice Commands System
 * 
 * Sistema de comandos de voz para operações hands-free.
 * Ideal para instrumentadores durante cirurgias.
 * 
 * Funcionalidades:
 * - Reconhecimento de voz em português
 * - Comandos de navegação
 * - Consultas rápidas
 * - Confirmações por voz
 * - Feedback por síntese de voz
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'

// ============ TIPOS ============

export interface VoiceCommand {
  id: string
  patterns: string[]
  action: string
  category: VoiceCommandCategory
  description: string
  requiresConfirmation?: boolean
  parameters?: VoiceParameter[]
}

export interface VoiceParameter {
  name: string
  type: 'text' | 'number' | 'date' | 'option'
  required: boolean
  options?: string[]
}

export type VoiceCommandCategory = 
  | 'navigation'
  | 'search'
  | 'action'
  | 'query'
  | 'confirmation'
  | 'system'

export interface VoiceRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: string[]
}

export interface VoiceCommandMatch {
  command: VoiceCommand
  parameters: Record<string, string>
  confidence: number
}

export interface VoiceFeedback {
  text: string
  priority: 'low' | 'normal' | 'high'
  interrupt?: boolean
}

export interface VoiceConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  confidenceThreshold: number
  speechRate: number
  pitch: number
  volume: number
}

// ============ CONFIGURAÇÃO ============

const DEFAULT_CONFIG: VoiceConfig = {
  language: 'pt-BR',
  continuous: true,
  interimResults: true,
  maxAlternatives: 3,
  confidenceThreshold: 0.7,
  speechRate: 1.0,
  pitch: 1.0,
  volume: 1.0,
}

// Comandos de voz pré-definidos
export const VOICE_COMMANDS: VoiceCommand[] = [
  // Navegação
  {
    id: 'nav_dashboard',
    patterns: ['ir para dashboard', 'abrir dashboard', 'mostrar dashboard', 'página inicial'],
    action: 'navigate:/dashboard',
    category: 'navigation',
    description: 'Navega para o Dashboard principal',
  },
  {
    id: 'nav_cirurgias',
    patterns: ['ir para cirurgias', 'abrir cirurgias', 'mostrar cirurgias', 'agenda cirúrgica'],
    action: 'navigate:/cirurgias',
    category: 'navigation',
    description: 'Navega para o módulo de Cirurgias',
  },
  {
    id: 'nav_estoque',
    patterns: ['ir para estoque', 'abrir estoque', 'mostrar estoque', 'verificar estoque'],
    action: 'navigate:/estoque',
    category: 'navigation',
    description: 'Navega para o módulo de Estoque',
  },
  {
    id: 'nav_financeiro',
    patterns: ['ir para financeiro', 'abrir financeiro', 'mostrar financeiro'],
    action: 'navigate:/financeiro',
    category: 'navigation',
    description: 'Navega para o módulo Financeiro',
  },
  {
    id: 'nav_cadastros',
    patterns: ['ir para cadastros', 'abrir cadastros', 'mostrar cadastros'],
    action: 'navigate:/cadastros',
    category: 'navigation',
    description: 'Navega para o módulo de Cadastros',
  },
  {
    id: 'nav_back',
    patterns: ['voltar', 'página anterior', 'retornar'],
    action: 'navigate:back',
    category: 'navigation',
    description: 'Volta para a página anterior',
  },

  // Consultas
  {
    id: 'query_cirurgias_hoje',
    patterns: ['cirurgias de hoje', 'agenda de hoje', 'quantas cirurgias hoje'],
    action: 'query:cirurgias_hoje',
    category: 'query',
    description: 'Consulta cirurgias agendadas para hoje',
  },
  {
    id: 'query_estoque_baixo',
    patterns: ['estoque baixo', 'produtos em falta', 'alertas de estoque'],
    action: 'query:estoque_baixo',
    category: 'query',
    description: 'Consulta produtos com estoque baixo',
  },
  {
    id: 'query_proxima_cirurgia',
    patterns: ['próxima cirurgia', 'próximo procedimento', 'qual a próxima'],
    action: 'query:proxima_cirurgia',
    category: 'query',
    description: 'Consulta a próxima cirurgia agendada',
  },
  {
    id: 'query_kit_cirurgia',
    patterns: ['kit da cirurgia', 'materiais da cirurgia', 'OPME necessário'],
    action: 'query:kit_cirurgia',
    category: 'query',
    description: 'Consulta o kit OPME da cirurgia atual',
  },

  // Buscas
  {
    id: 'search_produto',
    patterns: ['buscar produto', 'procurar produto', 'encontrar produto'],
    action: 'search:produto',
    category: 'search',
    description: 'Busca um produto no sistema',
    parameters: [{ name: 'termo', type: 'text', required: true }],
  },
  {
    id: 'search_paciente',
    patterns: ['buscar paciente', 'procurar paciente', 'encontrar paciente'],
    action: 'search:paciente',
    category: 'search',
    description: 'Busca um paciente no sistema',
    parameters: [{ name: 'nome', type: 'text', required: true }],
  },
  {
    id: 'search_medico',
    patterns: ['buscar médico', 'procurar médico', 'encontrar médico'],
    action: 'search:medico',
    category: 'search',
    description: 'Busca um médico no sistema',
    parameters: [{ name: 'nome', type: 'text', required: true }],
  },

  // Ações
  {
    id: 'action_confirmar_cirurgia',
    patterns: ['confirmar cirurgia', 'cirurgia confirmada', 'confirmar procedimento'],
    action: 'action:confirmar_cirurgia',
    category: 'action',
    description: 'Confirma uma cirurgia',
    requiresConfirmation: true,
  },
  {
    id: 'action_registrar_uso',
    patterns: ['registrar uso', 'material utilizado', 'registrar material'],
    action: 'action:registrar_uso',
    category: 'action',
    description: 'Registra uso de material OPME',
    requiresConfirmation: true,
  },
  {
    id: 'action_solicitar_material',
    patterns: ['solicitar material', 'pedir material', 'requisitar material'],
    action: 'action:solicitar_material',
    category: 'action',
    description: 'Solicita material adicional',
    parameters: [{ name: 'material', type: 'text', required: true }],
  },
  {
    id: 'action_chamar_suporte',
    patterns: ['chamar suporte', 'preciso de ajuda', 'emergência'],
    action: 'action:chamar_suporte',
    category: 'action',
    description: 'Chama suporte técnico',
  },

  // Confirmações
  {
    id: 'confirm_yes',
    patterns: ['sim', 'confirmo', 'correto', 'afirmativo', 'pode confirmar'],
    action: 'confirm:yes',
    category: 'confirmation',
    description: 'Confirma ação pendente',
  },
  {
    id: 'confirm_no',
    patterns: ['não', 'cancelar', 'negativo', 'não confirmo', 'cancelar operação'],
    action: 'confirm:no',
    category: 'confirmation',
    description: 'Cancela ação pendente',
  },

  // Sistema
  {
    id: 'system_help',
    patterns: ['ajuda', 'comandos disponíveis', 'o que posso fazer', 'listar comandos'],
    action: 'system:help',
    category: 'system',
    description: 'Lista comandos disponíveis',
  },
  {
    id: 'system_pause',
    patterns: ['pausar reconhecimento', 'parar de ouvir', 'silêncio'],
    action: 'system:pause',
    category: 'system',
    description: 'Pausa o reconhecimento de voz',
  },
  {
    id: 'system_resume',
    patterns: ['continuar ouvindo', 'ativar voz', 'voltar a ouvir'],
    action: 'system:resume',
    category: 'system',
    description: 'Retoma o reconhecimento de voz',
  },
  {
    id: 'system_status',
    patterns: ['status do sistema', 'como está o sistema', 'verificar status'],
    action: 'system:status',
    category: 'system',
    description: 'Informa status do sistema',
  },
]

// ============ CLASSE PRINCIPAL ============

class VoiceCommandService {
  private recognition: SpeechRecognition | null = null
  private synthesis: SpeechSynthesis | null = null
  private config: VoiceConfig = DEFAULT_CONFIG
  private isListening = false
  private isPaused = false
  private pendingConfirmation: VoiceCommand | null = null
  private callbacks: Map<string, (result: VoiceCommandMatch) => void> = new Map()

  constructor() {
    this.initializeSpeechRecognition()
    this.initializeSpeechSynthesis()
  }

  /**
   * Inicializa o reconhecimento de voz
   */
  private initializeSpeechRecognition(): void {
    if (typeof window === 'undefined') return

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    
    if (!SpeechRecognition) {
      logger.warn('Speech Recognition not supported in this browser')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = this.config.language
    this.recognition.continuous = this.config.continuous
    this.recognition.interimResults = this.config.interimResults
    this.recognition.maxAlternatives = this.config.maxAlternatives

    this.recognition.onresult = (event) => {
      this.handleRecognitionResult(event)
    }

    this.recognition.onerror = (event) => {
      logger.error('Speech recognition error:', event.error)
      if (event.error !== 'no-speech') {
        this.speak({ text: 'Desculpe, não entendi. Pode repetir?', priority: 'normal' })
      }
    }

    this.recognition.onend = () => {
      if (this.isListening && !this.isPaused) {
        this.recognition?.start()
      }
    }

    logger.info('Speech Recognition initialized')
  }

  /**
   * Inicializa a síntese de voz
   */
  private initializeSpeechSynthesis(): void {
    if (typeof window === 'undefined') return

    this.synthesis = window.speechSynthesis
    
    if (!this.synthesis) {
      logger.warn('Speech Synthesis not supported in this browser')
    } else {
      logger.info('Speech Synthesis initialized')
    }
  }

  /**
   * Processa resultado do reconhecimento
   */
  private handleRecognitionResult(event: SpeechRecognitionEvent): void {
    const result = event.results[event.results.length - 1]
    
    if (!result.isFinal) return

    const transcript = result[0].transcript.toLowerCase().trim()
    const confidence = result[0].confidence

    logger.debug('Voice input:', { transcript, confidence })

    // Verificar se há confirmação pendente
    if (this.pendingConfirmation) {
      this.handleConfirmation(transcript)
      return
    }

    // Buscar comando correspondente
    const match = this.matchCommand(transcript, confidence)

    if (match) {
      this.executeCommand(match)
    } else if (confidence > this.config.confidenceThreshold) {
      this.speak({ 
        text: 'Comando não reconhecido. Diga "ajuda" para ver os comandos disponíveis.', 
        priority: 'normal' 
      })
    }
  }

  /**
   * Encontra comando correspondente ao texto
   */
  private matchCommand(transcript: string, confidence: number): VoiceCommandMatch | null {
    let bestMatch: VoiceCommandMatch | null = null
    let bestScore = 0

    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        const score = this.calculateSimilarity(transcript, pattern)
        
        if (score > bestScore && score > 0.6) {
          bestScore = score
          bestMatch = {
            command,
            parameters: this.extractParameters(transcript, command),
            confidence: score * confidence,
          }
        }
      }
    }

    return bestMatch
  }

  /**
   * Calcula similaridade entre textos
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    
    let matches = 0
    for (const word of words1) {
      if (words2.some(w => w.includes(word) || word.includes(w))) {
        matches++
      }
    }

    return matches / Math.max(words1.length, words2.length)
  }

  /**
   * Extrai parâmetros do texto
   */
  private extractParameters(
    transcript: string,
    command: VoiceCommand
  ): Record<string, string> {
    const params: Record<string, string> = {}

    if (!command.parameters) return params

    // Encontrar o padrão que mais combina
    let bestPattern = ''
    let bestScore = 0

    for (const pattern of command.patterns) {
      const score = this.calculateSimilarity(transcript, pattern)
      if (score > bestScore) {
        bestScore = score
        bestPattern = pattern
      }
    }

    // Extrair texto após o padrão como parâmetro
    const patternWords = bestPattern.split(/\s+/)
    const transcriptWords = transcript.split(/\s+/)
    
    const remainingWords = transcriptWords.filter(
      word => !patternWords.some(p => p.includes(word) || word.includes(p))
    )

    if (remainingWords.length > 0 && command.parameters.length > 0) {
      params[command.parameters[0].name] = remainingWords.join(' ')
    }

    return params
  }

  /**
   * Executa comando reconhecido
   */
  private executeCommand(match: VoiceCommandMatch): void {
    const { command, parameters } = match

    logger.info('Executing voice command:', { command: command.id, parameters })

    // Verificar se precisa confirmação
    if (command.requiresConfirmation) {
      this.pendingConfirmation = command
      this.speak({
        text: `Você quer ${command.description}? Diga sim para confirmar ou não para cancelar.`,
        priority: 'high',
      })
      return
    }

    // Executar ação
    this.dispatchAction(command, parameters)
  }

  /**
   * Processa confirmação de comando
   */
  private handleConfirmation(transcript: string): void {
    const yesPatterns = ['sim', 'confirmo', 'correto', 'afirmativo']
    const noPatterns = ['não', 'cancelar', 'negativo']

    const isYes = yesPatterns.some(p => transcript.includes(p))
    const isNo = noPatterns.some(p => transcript.includes(p))

    if (isYes && this.pendingConfirmation) {
      this.speak({ text: 'Confirmado!', priority: 'normal' })
      this.dispatchAction(this.pendingConfirmation, {})
      this.pendingConfirmation = null
    } else if (isNo) {
      this.speak({ text: 'Operação cancelada.', priority: 'normal' })
      this.pendingConfirmation = null
    } else {
      this.speak({ 
        text: 'Não entendi. Diga sim para confirmar ou não para cancelar.', 
        priority: 'normal' 
      })
    }
  }

  /**
   * Despacha ação do comando
   */
  private dispatchAction(command: VoiceCommand, parameters: Record<string, string>): void {
    const [type, value] = command.action.split(':')

    // Notificar callbacks registrados
    const callback = this.callbacks.get(type)
    if (callback) {
      callback({ command, parameters, confidence: 1 })
    }

    // Feedback por voz
    switch (type) {
      case 'navigate':
        this.speak({ text: `Navegando para ${command.description.replace('Navega para ', '')}`, priority: 'low' })
        break
      case 'query':
        this.speak({ text: 'Consultando informações...', priority: 'low' })
        break
      case 'search':
        this.speak({ text: `Buscando ${parameters.termo || parameters.nome || ''}`, priority: 'low' })
        break
      case 'action':
        this.speak({ text: 'Executando ação...', priority: 'normal' })
        break
      case 'system':
        this.handleSystemCommand(value)
        break
    }

    // Disparar evento customizado
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('voiceCommand', {
        detail: { command, parameters, type, value }
      }))
    }
  }

  /**
   * Processa comandos de sistema
   */
  private handleSystemCommand(action: string): void {
    switch (action) {
      case 'help': {
        const categories = [...new Set(VOICE_COMMANDS.map(c => c.category))]
        let helpText = 'Comandos disponíveis: '
        helpText += categories.map(cat => {
          const cmds = VOICE_COMMANDS.filter(c => c.category === cat)
          return `${cat}: ${cmds.map(c => c.patterns[0]).join(', ')}`
        }).join('. ')
        this.speak({ text: helpText, priority: 'high' })
        break
      }
      case 'pause':
        this.pause()
        this.speak({ text: 'Reconhecimento pausado.', priority: 'normal' })
        break
      case 'resume':
        this.resume()
        this.speak({ text: 'Reconhecimento ativado.', priority: 'normal' })
        break
      case 'status': {
        const status = this.isListening ? 'ativo' : 'inativo'
        this.speak({ text: `Sistema ${status}. Tudo funcionando normalmente.`, priority: 'normal' })
        break
      }
    }
  }

  /**
   * Fala texto usando síntese de voz
   */
  speak(feedback: VoiceFeedback): void {
    if (!this.synthesis) return

    if (feedback.interrupt) {
      this.synthesis.cancel()
    }

    const utterance = new SpeechSynthesisUtterance(feedback.text)
    utterance.lang = this.config.language
    utterance.rate = this.config.speechRate
    utterance.pitch = this.config.pitch
    utterance.volume = this.config.volume

    // Selecionar voz em português
    const voices = this.synthesis.getVoices()
    const ptVoice = voices.find(v => v.lang.startsWith('pt'))
    if (ptVoice) {
      utterance.voice = ptVoice
    }

    this.synthesis.speak(utterance)
  }

  /**
   * Inicia reconhecimento de voz
   */
  start(): boolean {
    if (!this.recognition) {
      logger.error('Speech Recognition not available')
      return false
    }

    try {
      this.recognition.start()
      this.isListening = true
      this.isPaused = false
      logger.info('Voice recognition started')
      this.speak({ text: 'Reconhecimento de voz ativado.', priority: 'low' })
      return true
    } catch (error) {
      logger.error('Failed to start voice recognition:', error)
      return false
    }
  }

  /**
   * Para reconhecimento de voz
   */
  stop(): void {
    if (this.recognition) {
      this.recognition.stop()
      this.isListening = false
      logger.info('Voice recognition stopped')
    }
  }

  /**
   * Pausa reconhecimento
   */
  pause(): void {
    this.isPaused = true
    if (this.recognition) {
      this.recognition.stop()
    }
  }

  /**
   * Retoma reconhecimento
   */
  resume(): void {
    this.isPaused = false
    if (this.recognition && this.isListening) {
      this.recognition.start()
    }
  }

  /**
   * Registra callback para tipo de ação
   */
  onAction(type: string, callback: (result: VoiceCommandMatch) => void): void {
    this.callbacks.set(type, callback)
  }

  /**
   * Remove callback
   */
  offAction(type: string): void {
    this.callbacks.delete(type)
  }

  /**
   * Verifica se está ouvindo
   */
  getIsListening(): boolean {
    return this.isListening && !this.isPaused
  }

  /**
   * Verifica suporte do navegador
   */
  isSupported(): boolean {
    if (typeof window === 'undefined') return false
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * Atualiza configuração
   */
  updateConfig(config: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...config }
    
    if (this.recognition) {
      this.recognition.lang = this.config.language
      this.recognition.continuous = this.config.continuous
      this.recognition.interimResults = this.config.interimResults
      this.recognition.maxAlternatives = this.config.maxAlternatives
    }
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const voiceCommands = new VoiceCommandService()

// ============ HOOK REACT ============

import { useState, useEffect, useCallback } from 'react'

export interface UseVoiceCommandsReturn {
  isListening: boolean
  isSupported: boolean
  start: () => boolean
  stop: () => void
  pause: () => void
  resume: () => void
  speak: (text: string) => void
  lastCommand: VoiceCommandMatch | null
  onNavigate: (callback: (path: string) => void) => void
  onQuery: (callback: (query: string) => void) => void
  onAction: (callback: (action: string, params: Record<string, string>) => void) => void
}

export function useVoiceCommands(): UseVoiceCommandsReturn {
  const [isListening, setIsListening] = useState(false)
  const [lastCommand, setLastCommand] = useState<VoiceCommandMatch | null>(null)

  useEffect(() => {
    const handleCommand = (event: CustomEvent) => {
      setLastCommand(event.detail)
    }

    window.addEventListener('voiceCommand', handleCommand as EventListener)
    
    return () => {
      window.removeEventListener('voiceCommand', handleCommand as EventListener)
    }
  }, [])

  const start = useCallback(() => {
    const result = voiceCommands.start()
    setIsListening(result)
    return result
  }, [])

  const stop = useCallback(() => {
    voiceCommands.stop()
    setIsListening(false)
  }, [])

  const pause = useCallback(() => {
    voiceCommands.pause()
    setIsListening(false)
  }, [])

  const resume = useCallback(() => {
    voiceCommands.resume()
    setIsListening(true)
  }, [])

  const speak = useCallback((text: string) => {
    voiceCommands.speak({ text, priority: 'normal' })
  }, [])

  const onNavigate = useCallback((callback: (path: string) => void) => {
    voiceCommands.onAction('navigate', (result) => {
      const path = result.command.action.split(':')[1]
      callback(path)
    })
  }, [])

  const onQuery = useCallback((callback: (query: string) => void) => {
    voiceCommands.onAction('query', (result) => {
      const query = result.command.action.split(':')[1]
      callback(query)
    })
  }, [])

  const onAction = useCallback((
    callback: (action: string, params: Record<string, string>) => void
  ) => {
    voiceCommands.onAction('action', (result) => {
      const action = result.command.action.split(':')[1]
      callback(action, result.parameters)
    })
  }, [])

  return {
    isListening,
    isSupported: voiceCommands.isSupported(),
    start,
    stop,
    pause,
    resume,
    speak,
    lastCommand,
    onNavigate,
    onQuery,
    onAction,
  }
}

// ============ TIPOS GLOBAIS ============

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
  }
}

// ============ EXPORTS ============

export default {
  voiceCommands,
  useVoiceCommands,
  VOICE_COMMANDS,
}

