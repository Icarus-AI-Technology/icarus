import { ModuleTemplate } from './ModuleTemplate'
import { Globe } from 'lucide-react'

/**
 * Módulo: Compras Internacionais
 * Categoria: Compras & Fornecedores
 * Descrição: Importação de produtos OPME (SISCOMEX)
 */

export function ComprasInternacionais() {
  return (
    <ModuleTemplate
      title="Compras Internacionais"
      description="Importação de produtos OPME (SISCOMEX)"
      icon={Globe}
      iconColor="#3B82F6"
      stats={[
        { label: 'Importações Ativas', value: 0 },
        { label: 'Em Trânsito', value: 0 },
        { label: 'Desembaraço', value: 0 },
        { label: 'Valor USD', value: '$ 0.00' }
      ]}
    />
  )
}

