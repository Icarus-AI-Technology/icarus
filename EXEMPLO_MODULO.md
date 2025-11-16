# 📝 Guia: Como Criar um Novo Módulo

Este guia mostra como criar um módulo completo no ICARUS v5.0.

---

## 🎯 Exemplo Prático: Módulo de Fornecedores

Vamos criar o módulo de fornecedores passo a passo.

---

## Passo 1: Criar Estrutura de Arquivos

```bash
# Criar diretório do módulo
mkdir -p src/components/modules/compras

# Criar arquivos
touch src/components/modules/compras/Fornecedores.tsx
touch src/components/modules/compras/types.ts
touch src/components/modules/compras/hooks.ts
touch src/components/modules/compras/api.ts
```

---

## Passo 2: Definir Types (types.ts)

```typescript
// src/components/modules/compras/types.ts

export interface Fornecedor {
  id: string
  empresa_id: string
  cnpj: string
  razao_social: string
  nome_fantasia: string
  email: string
  telefone: string
  endereco: {
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
  }
  produtos_principais: string[]
  observacoes?: string
  ativo: boolean
  created_at: string
  updated_at: string
}

export interface FornecedorFormData {
  cnpj: string
  razao_social: string
  nome_fantasia: string
  email: string
  telefone: string
  endereco: Fornecedor['endereco']
  produtos_principais: string[]
  observacoes?: string
}
```

---

## Passo 3: Criar API Layer (api.ts)

```typescript
// src/components/modules/compras/api.ts

import { supabase } from '@/lib/supabase/client'
import type { Fornecedor, FornecedorFormData } from './types'

/**
 * Buscar todos os fornecedores
 */
export async function getFornecedores(): Promise<Fornecedor[]> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('ativo', true)
    .order('razao_social', { ascending: true })

  if (error) {
    console.error('Erro ao buscar fornecedores:', error)
    throw error
  }

  return data || []
}

/**
 * Buscar fornecedor por ID
 */
export async function getFornecedor(id: string): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Erro ao buscar fornecedor:', error)
    throw error
  }

  return data
}

/**
 * Criar novo fornecedor
 */
export async function createFornecedor(
  fornecedor: FornecedorFormData
): Promise<Fornecedor> {
  const { data, error } = await supabase
    .from('fornecedores')
    .insert({
      ...fornecedor,
      ativo: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar fornecedor:', error)
    throw error
  }

  return data
}

/**
 * Atualizar fornecedor
 */
export async function updateFornecedor(
  id: string,
  fornecedor: Partial<FornecedorFormData>
): Promise<Fornecedor> {
  const { data, error } = await supabase
    .from('fornecedores')
    .update(fornecedor)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar fornecedor:', error)
    throw error
  }

  return data
}

/**
 * Deletar fornecedor (soft delete)
 */
export async function deleteFornecedor(id: string): Promise<void> {
  const { error } = await supabase
    .from('fornecedores')
    .update({ ativo: false })
    .eq('id', id)

  if (error) {
    console.error('Erro ao deletar fornecedor:', error)
    throw error
  }
}

/**
 * Buscar fornecedor por CNPJ
 */
export async function getFornecedorByCNPJ(
  cnpj: string
): Promise<Fornecedor | null> {
  const { data, error } = await supabase
    .from('fornecedores')
    .select('*')
    .eq('cnpj', cnpj.replace(/\D/g, ''))
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 = not found
    console.error('Erro ao buscar fornecedor por CNPJ:', error)
    throw error
  }

  return data
}
```

---

## Passo 4: Criar Hooks (hooks.ts)

```typescript
// src/components/modules/compras/hooks.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
  getFornecedores,
  getFornecedor,
  createFornecedor,
  updateFornecedor,
  deleteFornecedor,
} from './api'
import type { FornecedorFormData } from './types'

/**
 * Hook para listar fornecedores
 */
export function useFornecedores() {
  return useQuery({
    queryKey: ['fornecedores'],
    queryFn: getFornecedores,
  })
}

/**
 * Hook para buscar um fornecedor
 */
export function useFornecedor(id: string) {
  return useQuery({
    queryKey: ['fornecedores', id],
    queryFn: () => getFornecedor(id),
    enabled: !!id,
  })
}

/**
 * Hook para criar fornecedor
 */
export function useCreateFornecedor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: createFornecedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast({
        title: 'Fornecedor criado',
        description: 'Fornecedor cadastrado com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar fornecedor',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook para atualizar fornecedor
 */
export function useUpdateFornecedor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FornecedorFormData> }) =>
      updateFornecedor(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast({
        title: 'Fornecedor atualizado',
        description: 'Alterações salvas com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar fornecedor',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}

/**
 * Hook para deletar fornecedor
 */
export function useDeleteFornecedor() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: deleteFornecedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fornecedores'] })
      toast({
        title: 'Fornecedor removido',
        description: 'Fornecedor removido com sucesso!',
      })
    },
    onError: (error) => {
      toast({
        title: 'Erro ao remover fornecedor',
        description: error.message,
        variant: 'destructive',
      })
    },
  })
}
```

---

## Passo 5: Criar Componente Principal (Fornecedores.tsx)

```typescript
// src/components/modules/compras/Fornecedores.tsx

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Search, Edit, Trash2 } from 'lucide-react'
import { useFornecedores, useDeleteFornecedor } from './hooks'
import type { Fornecedor } from './types'

export function Fornecedores() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data: fornecedores, isLoading } = useFornecedores()
  const deleteFornecedor = useDeleteFornecedor()

  const filteredFornecedores = fornecedores?.filter((f) =>
    f.razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.cnpj.includes(searchTerm)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Fornecedores</h2>
          <p className="text-muted-foreground">
            Gerencie seus fornecedores de produtos OPME
          </p>
        </div>
        <Button className="neu-soft">
          <Plus className="mr-2 h-4 w-4" />
          Novo Fornecedor
        </Button>
      </div>

      {/* Search */}
      <Card className="neu-soft">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por razão social ou CNPJ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary neu-inset"
            />
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card className="neu-soft">
        <CardHeader>
          <CardTitle>Lista de Fornecedores</CardTitle>
          <CardDescription>
            {filteredFornecedores?.length || 0} fornecedores encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFornecedores?.map((fornecedor) => (
              <div
                key={fornecedor.id}
                className="flex items-center justify-between p-4 border rounded-lg neu-soft hover:neu-hover transition-all"
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{fornecedor.razao_social}</h3>
                  <p className="text-sm text-muted-foreground">
                    CNPJ: {fornecedor.cnpj} • {fornecedor.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteFornecedor.mutate(fornecedor.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {filteredFornecedores?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum fornecedor encontrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Passo 6: Adicionar Rota

```typescript
// src/App.tsx

import { Fornecedores } from '@/components/modules/compras/Fornecedores'

// Adicionar rota:
<Route path="/fornecedores" element={<Fornecedores />} />
```

---

## Passo 7: Adicionar ao Menu

```typescript
// src/components/layout/Sidebar.tsx

const navigation = [
  // ... outras rotas
  { name: 'Fornecedores', href: '/fornecedores', icon: Truck },
]
```

---

## 🧪 Passo 8: Criar Testes

```typescript
// src/components/modules/compras/Fornecedores.test.tsx

import { render, screen } from '@testing-library/react'
import { Fornecedores } from './Fornecedores'

describe('Fornecedores', () => {
  it('deve renderizar título', () => {
    render(<Fornecedores />)
    expect(screen.getByText('Fornecedores')).toBeInTheDocument()
  })

  it('deve exibir campo de busca', () => {
    render(<Fornecedores />)
    expect(
      screen.getByPlaceholderText(/buscar por razão social/i)
    ).toBeInTheDocument()
  })
})
```

---

## ✅ Checklist de Implementação

Ao criar um novo módulo, garanta:

- [ ] Types TypeScript definidos
- [ ] API layer com funções CRUD
- [ ] Hooks React Query configurados
- [ ] Componente principal com UI neumórfica
- [ ] Formulários com validação (Zod)
- [ ] Listagem com busca e filtros
- [ ] Integração com Supabase
- [ ] Testes unitários
- [ ] Rota configurada
- [ ] Menu atualizado
- [ ] Documentação no código

---

## 🎨 Padrões de UI

### Cores por Ação

```typescript
// Sucesso
<Button variant="success">Salvar</Button>

// Atenção
<Button variant="warning">Atenção</Button>

// Deletar
<Button variant="danger">Excluir</Button>

// Padrão
<Button variant="default">Ação</Button>
```

### Efeitos Neumórficos

```typescript
// Card suave
<Card className="neu-soft">

// Card pronunciado
<Card className="neu-hard">

// Input/Campo côncavo
<input className="neu-inset" />

// Hover interativo
<div className="neu-soft hover:neu-hover transition-all">
```

---

## 📚 Recursos

- **Template**: Use `src/components/modules/Produtos.tsx` como base
- **Tipos Supabase**: `src/lib/supabase/types.ts`
- **Utils**: `src/lib/utils.ts`
- **Hooks**: `src/hooks/`

---

## 🚀 Próximo Módulo

Replique este processo para criar:
- Clientes
- Pedidos
- Estoque
- Financeiro
- Etc.

**Tempo estimado por módulo**: 3-5 dias
