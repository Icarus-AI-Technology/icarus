# 📝 Guia de Formulários CRUD

**Versão:** 1.0.0  
**Data:** 29/11/2025  
**Status:** ✅ Implementado

---

## 🎯 Objetivo

Este guia documenta como usar os componentes de formulários CRUD em todos os módulos do ICARUS v5.0.

---

## 📦 Componentes Disponíveis

### 1. GenericCRUDForm

Formulário genérico reutilizável com React Hook Form + Zod + Supabase.

```typescript
import { GenericCRUDForm } from '@/components/forms/GenericCRUDForm'

// Definir schema Zod
const schema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  status: z.enum(['ativo', 'inativo']),
})

// Definir campos
const fields: FormField[] = [
  { name: 'nome', label: 'Nome', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { 
    name: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'ativo', label: 'Ativo' },
      { value: 'inativo', label: 'Inativo' },
    ]
  },
]

// Uso
<GenericCRUDForm
  tableName="usuarios"
  fields={fields}
  schema={schema}
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  mode="create" // ou "update"
  initialData={selectedUser} // Para modo update
/>
```

### 2. CRUDTable

Tabela completa com busca, edição, exclusão e exportação.

```typescript
import { CRUDTable, Column } from '@/components/tables/CRUDTable'

// Definir colunas
const columns: Column<User>[] = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { 
    key: 'status', 
    label: 'Status',
    render: (value) => <StatusBadge status={value} />
  },
  { 
    key: 'created_at', 
    label: 'Cadastro',
    render: (value) => formatDate(value)
  },
]

// Uso
<CRUDTable
  tableName="usuarios"
  columns={columns}
  data={usuarios}
  isLoading={isLoading}
  onEdit={(user) => formHook.openUpdate(user)}
  onDelete={(user) => console.log('Deletando:', user)}
  onCreate={() => formHook.openCreate()}
  enableSearch
  enableExport
  title="Usuários"
/>
```

### 3. useCRUDForm Hook

Hook para gerenciar estado do formulário CRUD.

```typescript
import { useCRUDForm } from '@/components/forms/GenericCRUDForm'

function MeuModulo() {
  const formHook = useCRUDForm()

  return (
    <>
      <Button onClick={formHook.openCreate}>Novo</Button>
      
      <GenericCRUDForm
        {...formHook}
        tableName="minha_tabela"
        fields={fields}
        schema={schema}
      />
    </>
  )
}
```

---

## 🏗️ Formulários Específicos Disponíveis

### 1. GrupoProdutoForm

Formulário para cadastro de Grupos de Produtos OPME.

```typescript
import { GrupoProdutoForm } from '@/components/forms/GenericCRUDForm'

<GrupoProdutoForm
  isOpen={isOpen}
  onClose={onClose}
  mode="create"
/>
```

**Campos:**
- Código (obrigatório)
- Nome (obrigatório, mín. 3 caracteres)
- Descrição (opcional)
- Classe de Risco ANVISA (I, II, III, IV)
- Markup Padrão (0-100%)

### 2. SensorIoTForm

Formulário para cadastro de Sensores IoT.

```typescript
import { SensorIoTForm } from '@/components/forms/GenericCRUDForm'

<SensorIoTForm
  isOpen={isOpen}
  onClose={onClose}
  mode="create"
/>
```

**Campos:**
- Nome do Sensor (obrigatório)
- Tipo (temperatura, umidade, pressão, movimento)
- Localização (obrigatório)
- Limite Mínimo (número)
- Limite Máximo (número)

### 3. LeadForm

Formulário para cadastro de Leads.

```typescript
import { LeadForm } from '@/components/forms/GenericCRUDForm'

<LeadForm
  isOpen={isOpen}
  onClose={onClose}
  mode="create"
/>
```

**Campos:**
- Nome Completo (obrigatório)
- Email (obrigatório, validação email)
- Telefone (opcional)
- Empresa (opcional)
- Cargo (opcional)
- Origem (website, indicação, evento, linkedin, outro)
- Interesse (textarea)

### 4. CampanhaForm

Formulário para cadastro de Campanhas de Marketing.

```typescript
import { CampanhaForm } from '@/components/forms/GenericCRUDForm'

<CampanhaForm
  isOpen={isOpen}
  onClose={onClose}
  mode="create"
/>
```

**Campos:**
- Nome da Campanha (obrigatório)
- Tipo (email, sms, whatsapp, social, multiplo)
- Data de Início (date)
- Data de Fim (date)
- Orçamento (número, R$)
- Objetivo (textarea)

---

## 📚 Exemplo Completo: Módulo com CRUD

```typescript
import { useState } from 'react'
import { useGruposOPME } from '@/hooks/useModuleData'
import { CRUDTable, Column } from '@/components/tables/CRUDTable'
import { GrupoProdutoForm } from '@/components/forms/GenericCRUDForm'
import { useCRUDForm } from '@/components/forms/GenericCRUDForm'
import { StatusBadge, formatDate } from '@/components/tables/CRUDTable'

export function GruposProdutosOPMEModule() {
  // 1. Buscar dados
  const { data: grupos, isLoading } = useGruposOPME()

  // 2. Hook do formulário
  const formHook = useCRUDForm()

  // 3. Definir colunas
  const columns: Column<GrupoProduto>[] = [
    { key: 'codigo', label: 'Código', width: '10%' },
    { key: 'nome', label: 'Nome', width: '30%' },
    { 
      key: 'classe_risco', 
      label: 'Classe ANVISA', 
      width: '15%',
      render: (value) => (
        <Badge className="bg-indigo-500/20 text-indigo-500">
          Classe {value}
        </Badge>
      )
    },
    { 
      key: 'markup_padrao', 
      label: 'Markup', 
      width: '10%',
      render: (value) => `${value}%`
    },
    { 
      key: 'familias_count', 
      label: 'Famílias', 
      width: '10%' 
    },
    { 
      key: 'created_at', 
      label: 'Cadastro', 
      width: '15%',
      render: (value) => formatDate(value)
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Grupos de Produtos OPME</h1>
        <p className="text-slate-600">Gestão de grupos e famílias de produtos OPME</p>
      </div>

      {/* Tabela com CRUD */}
      <CRUDTable
        tableName="grupos_produtos"
        columns={columns}
        data={grupos || []}
        isLoading={isLoading}
        onEdit={(grupo) => formHook.openUpdate(grupo)}
        onCreate={() => formHook.openCreate()}
        enableSearch
        enableExport
        enableFilter
        searchPlaceholder="Buscar grupos..."
        title="Grupos de Produtos"
      />

      {/* Formulário */}
      <GrupoProdutoForm
        isOpen={formHook.isOpen}
        onClose={formHook.close}
        mode={formHook.mode}
        initialData={formHook.selectedItem}
      />
    </div>
  )
}
```

---

## 🎨 Helpers Visuais

### StatusBadge

```typescript
import { StatusBadge } from '@/components/tables/CRUDTable'

<StatusBadge status="ativo" />
<StatusBadge status="pendente" />
<StatusBadge status="concluido" />
<StatusBadge status="cancelado" />
```

**Status suportados:**
- `ativo` - Verde esmeralda
- `inativo` - Cinza
- `pendente` - Âmbar
- `concluido` - Azul
- `cancelado` - Vermelho

### formatDate

```typescript
import { formatDate } from '@/components/tables/CRUDTable'

formatDate('2025-11-29') // "29/11/2025"
formatDate(new Date()) // "29/11/2025"
```

### formatCurrency

```typescript
import { formatCurrency } from '@/components/tables/CRUDTable'

formatCurrency(1250.50) // "R$ 1.250,50"
```

---

## ⚙️ Validações Zod Comuns

```typescript
import { z } from 'zod'

// Email
z.string().email('Email inválido')

// CNPJ (14 dígitos)
z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos')

// CPF (11 dígitos)
z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos')

// Telefone brasileiro
z.string().regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone inválido')

// Valor monetário (mínimo 0)
z.number().min(0, 'Valor deve ser positivo')

// Data futura
z.string().refine((date) => new Date(date) > new Date(), 'Data deve ser futura')

// Enum com mensagem customizada
z.enum(['opcao1', 'opcao2', 'opcao3'], {
  errorMap: () => ({ message: 'Selecione uma opção válida' })
})
```

---

## 🔄 Fluxo Completo de CRUD

### Create

1. Usuário clica em "Novo"
2. `formHook.openCreate()` é chamado
3. Formulário abre em modo `create`
4. Usuário preenche campos
5. `handleSubmit` valida com Zod
6. `mutations.create.mutateAsync(data)` envia para Supabase
7. Toast de sucesso automático
8. React Query invalida cache
9. Tabela atualiza automaticamente

### Update

1. Usuário clica em "Editar" na linha
2. `formHook.openUpdate(item)` é chamado
3. Formulário abre em modo `update` com dados preenchidos
4. Usuário edita campos
5. `handleSubmit` valida com Zod
6. `mutations.update.mutateAsync({ id, data })` envia para Supabase
7. Toast de sucesso automático
8. React Query invalida cache
9. Tabela atualiza automaticamente

### Delete

1. Usuário clica em "Excluir" na linha
2. Dialog de confirmação abre
3. Usuário confirma
4. `mutations.delete.mutateAsync(id)` envia para Supabase
5. Toast de sucesso automático
6. React Query invalida cache
7. Tabela atualiza automaticamente

---

## 🚀 Performance

### Otimizações Implementadas

1. **Validação no client-side** (Zod) - Reduz chamadas desnecessárias à API
2. **Debounce na busca** - Evita muitos renders durante digitação
3. **React Query cache** - Evita refetches desnecessários
4. **Optimistic updates** - UI atualiza antes da confirmação do servidor
5. **Invalidação seletiva** - Apenas queries relevantes são invalidadas

---

## 📋 Checklist de Implementação

Para cada módulo que precisa de CRUD:

- [ ] Importar `CRUDTable` e colunas
- [ ] Importar hook de dados (`use[Module]Data`)
- [ ] Importar formulário específico ou criar com `GenericCRUDForm`
- [ ] Definir colunas com renders customizados
- [ ] Usar `useCRUDForm` hook
- [ ] Conectar tabela com formulário
- [ ] Testar create, update, delete
- [ ] Validar busca e filtros
- [ ] Testar exportação CSV
- [ ] Verificar responsividade

---

## 🎯 Próximos Passos

1. Criar formulários específicos para os outros 42 módulos
2. Adicionar validações avançadas (async, custom)
3. Implementar upload de arquivos
4. Adicionar paginação server-side
5. Implementar filtros avançados
6. Adicionar ações em lote (bulk actions)

---

**Versão:** 1.0.0  
**Status:** ✅ Pronto para uso

🎯 **Use este guia para implementar CRUD em todos os módulos do ICARUS v5.0!**

