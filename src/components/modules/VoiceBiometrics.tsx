import { ModuleTemplate } from './ModuleTemplate'
import { Fingerprint } from 'lucide-react'

/**
 * Módulo: Voice Biometrics
 * Categoria: IA & Automação
 * Descrição: Biometria por voz para autenticação
 */

export function VoiceBiometrics() {
  return (
    <ModuleTemplate
      title="Voice Biometrics"
      description="Biometria por voz para autenticação"
      icon={Fingerprint}
      iconColor="#EF4444"
      stats={[
        { label: 'Usuários Cadastrados', value: 0 },
        { label: 'Autenticações (Hoje)', value: 0 },
        { label: 'Taxa Sucesso', value: '0%' },
        { label: 'Tentativas Bloqueadas', value: 0 }
      ]}
    />
  )
}

