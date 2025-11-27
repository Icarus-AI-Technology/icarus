import { ModuleTemplate } from './ModuleTemplate'
import { UserCog } from 'lucide-react'

/**
 * Módulo: Usuários e Permissões
 * Categoria: Cadastros & Gestão
 * Descrição: Gestão de usuários e controle de acesso (RBAC)
 */

export function GestaoUsuariosPermissoes() {
  return (
    <ModuleTemplate
      title="Usuários e Permissões"
      description="Gestão de usuários e controle de acesso (RBAC)"
      icon={UserCog}
      iconColor="#3B82F6"
      stats={[
        { label: 'Usuários Ativos', value: 0 },
        { label: 'Administradores', value: 0 },
        { label: 'Perfis', value: 0 }
      ]}
      onAdd={() => console.log('Adicionar usuário')}
      onSearch={(query) => console.log('Buscar:', query)}
      onFilter={() => console.log('Filtrar')}
    />
  )
}

