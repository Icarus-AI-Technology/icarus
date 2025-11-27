import { ModuleTemplate } from './ModuleTemplate'
import { Receipt } from 'lucide-react'

/**
 * Módulo: Notas de Compra
 * Categoria: Compras & Fornecedores
 * Descrição: Registro e validação de notas fiscais de compra
 */

export function NotasCompra() {
  return (
    <ModuleTemplate
      title="Notas de Compra"
      description="Registro e validação de notas fiscais de compra"
      icon={Receipt}
      iconColor="#10B981"
      stats={[
        { label: 'NFs Recebidas (Mês)', value: 0 },
        { label: 'Aguardando Validação', value: 0 },
        { label: 'Valor Total', value: 'R$ 0,00' }
      ]}
    />
  )
}

