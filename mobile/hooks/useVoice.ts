/**
 * ICARUS Mobile - Voice Commands Hook
 * 
 * Hook para comandos de voz hands-free.
 */

import { useState, useEffect, useCallback } from 'react'
import * as Speech from 'expo-speech'
import { Platform } from 'react-native'

// Tipos
interface VoiceCommand {
  id: string
  patterns: string[]
  action: string
  description: string
}

interface VoiceState {
  isListening: boolean
  isSupported: boolean
  lastTranscript: string
  error: string | null
}

// Comandos disponíveis
const VOICE_COMMANDS: VoiceCommand[] = [
  {
    id: 'proxima_cirurgia',
    patterns: ['próxima cirurgia', 'próximo procedimento', 'qual a próxima'],
    action: 'query:proxima_cirurgia',
    description: 'Mostra a próxima cirurgia',
  },
  {
    id: 'kit_cirurgia',
    patterns: ['kit da cirurgia', 'materiais', 'opme necessário'],
    action: 'query:kit_cirurgia',
    description: 'Lista materiais OPME',
  },
  {
    id: 'confirmar_uso',
    patterns: ['confirmar uso', 'registrar uso', 'material utilizado'],
    action: 'action:confirmar_uso',
    description: 'Registra uso de material',
  },
  {
    id: 'estoque',
    patterns: ['verificar estoque', 'consultar estoque', 'estoque do produto'],
    action: 'query:estoque',
    description: 'Consulta estoque',
  },
  {
    id: 'chamar_suporte',
    patterns: ['chamar suporte', 'preciso de ajuda', 'emergência'],
    action: 'action:chamar_suporte',
    description: 'Chama suporte técnico',
  },
]

export function useVoice() {
  const [state, setState] = useState<VoiceState>({
    isListening: false,
    isSupported: Platform.OS !== 'web',
    lastTranscript: '',
    error: null,
  })

  const [callbacks, setCallbacks] = useState<Map<string, (params?: any) => void>>(new Map())

  // Falar texto
  const speak = useCallback(async (text: string, options?: Speech.SpeechOptions) => {
    try {
      await Speech.speak(text, {
        language: 'pt-BR',
        pitch: 1.0,
        rate: 1.0,
        ...options,
      })
    } catch (error) {
      console.error('Speech error:', error)
    }
  }, [])

  // Parar de falar
  const stopSpeaking = useCallback(async () => {
    await Speech.stop()
  }, [])

  // Verificar se está falando
  const isSpeaking = useCallback(async () => {
    return Speech.isSpeakingAsync()
  }, [])

  // Processar comando de voz
  const processCommand = useCallback((transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim()

    for (const command of VOICE_COMMANDS) {
      for (const pattern of command.patterns) {
        if (normalizedTranscript.includes(pattern)) {
          const [type, action] = command.action.split(':')
          const callback = callbacks.get(type)
          
          if (callback) {
            callback({ action, transcript })
          }

          // Feedback por voz
          speak(`Executando: ${command.description}`)
          
          return { command, matched: true }
        }
      }
    }

    speak('Comando não reconhecido. Tente novamente.')
    return { command: null, matched: false }
  }, [callbacks, speak])

  // Registrar callback para tipo de ação
  const onAction = useCallback((type: string, callback: (params?: any) => void) => {
    setCallbacks(prev => new Map(prev).set(type, callback))
  }, [])

  // Simular início de reconhecimento (em produção, usar react-native-voice)
  const startListening = useCallback(async () => {
    setState(prev => ({ ...prev, isListening: true, error: null }))
    speak('Estou ouvindo...')
  }, [speak])

  // Parar de ouvir
  const stopListening = useCallback(() => {
    setState(prev => ({ ...prev, isListening: false }))
  }, [])

  // Processar texto (para testes ou input manual)
  const processText = useCallback((text: string) => {
    setState(prev => ({ ...prev, lastTranscript: text }))
    return processCommand(text)
  }, [processCommand])

  return {
    ...state,
    speak,
    stopSpeaking,
    isSpeaking,
    startListening,
    stopListening,
    processText,
    processCommand,
    onAction,
    commands: VOICE_COMMANDS,
  }
}

export default useVoice

