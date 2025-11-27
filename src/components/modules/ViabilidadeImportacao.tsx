import { ModuleTemplate } from './ModuleTemplate'
import { TrendingUp } from 'lucide-react'

/**
 * Módulo: Viabilidade Importação
 * Categoria: Compras & Fornecedores
 * Descrição: Análise de viabilidade financeira de importações
 */

export function ViabilidadeImportacao() {
  return (
    <ModuleTemplate
      title="Viabilidade Importação"
      description="Análise de viabilidade financeira de importações"
      icon={TrendingUp}
      iconColor="#F59E0B"
      stats={[
        { label: 'Análises Realizadas', value: 0 },
        { label: 'Taxa Aprovação', value: '0%' },
        { label: 'Economia Estimada', value: 'R$ 0,00' }
      ]}
    />
  )
}

