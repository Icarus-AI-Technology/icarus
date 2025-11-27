import { ModuleTemplate } from './ModuleTemplate'
import { TrendingUp } from 'lucide-react'

/**
 * Módulo: Contas a Receber IA
 * Categoria: Financeiro & Faturamento
 * Descrição: Gestão de recebíveis com IA (score inadimplência)
 */

export function ContasReceberIA() {
  return (
    <ModuleTemplate
      title="Contas a Receber IA"
      description="Gestão de recebíveis com IA (score inadimplência)"
      icon={TrendingUp}
      iconColor="#6366F1"
      stats={[
        { label: 'Títulos Abertos', value: 0 },
        { label: 'Valor Total', value: 'R$ 0,00' },
        { label: 'Risco Alto (IA)', value: 0 },
        { label: 'Recebido (Mês)', value: 'R$ 0,00' }
      ]}
    />
  )
}

