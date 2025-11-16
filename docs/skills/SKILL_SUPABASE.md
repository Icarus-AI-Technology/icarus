# 🗄️ SKILL: Supabase Database Patterns

Guia completo de boas práticas para trabalhar com Supabase no ICARUS.

---

## 🎯 Client Setup

```tsx
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 📋 CRUD Operations

### SELECT (Read)

```tsx
// Buscar todos
const { data, error } = await supabase
  .from('produtos')
  .select('*')

// Buscar com filtro
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)  // WHERE ativo = true

// Buscar um único
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('id', '123')
  .single()  // Retorna objeto, não array

// Buscar com relacionamentos (JOIN)
const { data, error } = await supabase
  .from('cirurgias')
  .select(`
    *,
    paciente:pacientes(nome, cpf),
    hospital:hospitais(nome, cidade)
  `)

// Buscar com filtros múltiplos
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('categoria', 'protese')
  .gte('preco', 100)  // >= 100
  .lte('preco', 1000)  // <= 1000
  .order('created_at', { ascending: false })
  .limit(10)

// Buscar com busca textual
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .ilike('nome', '%joelho%')  // LIKE case-insensitive

// Buscar com paginação
const page = 1
const perPage = 20
const { data, error, count } = await supabase
  .from('produtos')
  .select('*', { count: 'exact' })  // Retorna total count
  .range(page * perPage, (page + 1) * perPage - 1)
```

### INSERT (Create)

```tsx
// Inserir um
const { data, error } = await supabase
  .from('produtos')
  .insert({
    nome: 'Prótese Joelho',
    categoria: 'protese',
    preco: 5000
  })
  .select()  // Retornar objeto criado
  .single()

// Inserir múltiplos
const { data, error } = await supabase
  .from('produtos')
  .insert([
    { nome: 'Produto 1', preco: 100 },
    { nome: 'Produto 2', preco: 200 },
    { nome: 'Produto 3', preco: 300 }
  ])
  .select()
```

### UPDATE (Update)

```tsx
// Atualizar um
const { data, error } = await supabase
  .from('produtos')
  .update({ preco: 5500 })
  .eq('id', '123')
  .select()
  .single()

// Atualizar múltiplos
const { data, error } = await supabase
  .from('produtos')
  .update({ ativo: false })
  .eq('categoria', 'ortese')
```

### DELETE (Delete)

```tsx
// Deletar um
const { error } = await supabase
  .from('produtos')
  .delete()
  .eq('id', '123')

// Deletar múltiplos
const { error } = await supabase
  .from('produtos')
  .delete()
  .eq('ativo', false)
```

---

## 🔄 Realtime Subscriptions

```tsx
import { useEffect, useState } from 'react'

export function ProdutosRealtime() {
  const [produtos, setProdutos] = useState([])

  useEffect(() => {
    // Fetch inicial
    async function fetchProdutos() {
      const { data } = await supabase.from('produtos').select('*')
      setProdutos(data || [])
    }
    fetchProdutos()

    // Subscription para mudanças
    const channel = supabase
      .channel('produtos_changes')
      .on('postgres_changes', {
        event: '*',  // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'produtos'
      }, (payload) => {
        console.log('Change:', payload)

        if (payload.eventType === 'INSERT') {
          setProdutos([...produtos, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setProdutos(produtos.map(p =>
            p.id === payload.new.id ? payload.new : p
          ))
        } else if (payload.eventType === 'DELETE') {
          setProdutos(produtos.filter(p => p.id !== payload.old.id))
        }
      })
      .subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <div>
      {produtos.map(p => (
        <div key={p.id}>{p.nome}</div>
      ))}
    </div>
  )
}
```

### Subscription com Filtros

```tsx
const channel = supabase
  .channel('produtos_ativos')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'produtos',
    filter: 'ativo=eq.true'  // Só produtos ativos
  }, handleChange)
  .subscribe()
```

---

## 🔒 Row Level Security (RLS)

### Habilitar RLS

```sql
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
```

### Políticas Comuns

```sql
-- Permitir tudo para autenticados (DEV)
CREATE POLICY "Enable all for authenticated users" ON produtos
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Permitir SELECT para todos
CREATE POLICY "Enable read for all" ON produtos
  FOR SELECT
  USING (true);

-- Permitir INSERT/UPDATE/DELETE só para autenticados
CREATE POLICY "Enable write for authenticated" ON produtos
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Multi-tenant: Usuários só veem dados do seu tenant
CREATE POLICY "Users see own tenant data" ON produtos
  FOR SELECT
  USING (tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid()));

-- Dono pode editar seus próprios dados
CREATE POLICY "Users edit own data" ON produtos
  FOR UPDATE
  USING (created_by = auth.uid());
```

---

## 🎣 Custom Hooks

### useSupabaseQuery

```tsx
// hooks/useSupabaseQuery.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

export function useSupabaseQuery(table, query = (q) => q) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      setError(null)

      const builder = supabase.from(table).select('*')
      const { data, error } = await query(builder)

      if (error) {
        setError(error)
      } else {
        setData(data || [])
      }

      setLoading(false)
    }

    fetch()
  }, [table])

  return { data, loading, error, refetch: fetch }
}

// Uso:
const { data: produtos, loading } = useSupabaseQuery('produtos', (q) =>
  q.eq('ativo', true).order('created_at', { ascending: false })
)
```

### useSupabaseMutation

```tsx
// hooks/useSupabaseMutation.ts
import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function useSupabaseMutation(table) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function create(data) {
    setLoading(true)

    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select()
      .single()

    setLoading(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      throw error
    }

    toast({ title: 'Criado!', description: 'Item criado com sucesso' })
    return result
  }

  async function update(id, data) {
    setLoading(true)

    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single()

    setLoading(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      throw error
    }

    toast({ title: 'Atualizado!', description: 'Item atualizado com sucesso' })
    return result
  }

  async function remove(id) {
    setLoading(true)

    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)

    setLoading(false)

    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      throw error
    }

    toast({ title: 'Deletado!', description: 'Item deletado com sucesso' })
  }

  return { create, update, remove, loading }
}

// Uso:
const { create, update, remove, loading } = useSupabaseMutation('produtos')

await create({ nome: 'Produto X', preco: 100 })
await update('123', { preco: 120 })
await remove('123')
```

---

## 📊 Queries Avançadas

### Aggregations

```tsx
// Count
const { count } = await supabase
  .from('produtos')
  .select('*', { count: 'exact', head: true })

// Sum
const { data } = await supabase
  .from('vendas')
  .select('valor.sum()')

// Group by + Aggregation
const { data } = await supabase
  .from('vendas')
  .select('categoria, valor.sum()')
  .group('categoria')
```

### Joins Complexos

```tsx
// Many-to-one
const { data } = await supabase
  .from('cirurgias')
  .select(`
    id,
    data_cirurgia,
    paciente:pacientes(nome, cpf),
    hospital:hospitais(nome)
  `)

// Many-to-many
const { data } = await supabase
  .from('cirurgias')
  .select(`
    id,
    materiais:cirurgia_materiais(
      quantidade,
      produto:produtos(nome, preco)
    )
  `)
```

### Full-text Search

```sql
-- Criar índice (no SQL Editor)
CREATE INDEX produtos_nome_idx ON produtos
  USING GIN (to_tsvector('portuguese', nome));
```

```tsx
// Buscar
const { data } = await supabase
  .from('produtos')
  .select('*')
  .textSearch('nome', 'joelho titanio', {
    config: 'portuguese'
  })
```

---

## 🔐 Storage (Arquivos)

### Upload

```tsx
async function uploadFile(file: File) {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('documentos')  // Bucket name
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (error) throw error

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
```

### Download

```tsx
async function downloadFile(path: string) {
  const { data, error } = await supabase.storage
    .from('documentos')
    .download(path)

  if (error) throw error

  // Create blob URL
  const url = URL.createObjectURL(data)
  return url
}
```

### Delete

```tsx
async function deleteFile(path: string) {
  const { error } = await supabase.storage
    .from('documentos')
    .remove([path])

  if (error) throw error
}
```

---

## 🧪 Testes

```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { supabase } from '@/lib/supabase/client'

describe('Produtos CRUD', () => {
  beforeEach(async () => {
    // Limpar dados de teste
    await supabase.from('produtos').delete().like('nome', 'TESTE%')
  })

  it('deve criar produto', async () => {
    const { data, error } = await supabase
      .from('produtos')
      .insert({ nome: 'TESTE Produto', preco: 100 })
      .select()
      .single()

    expect(error).toBeNull()
    expect(data.nome).toBe('TESTE Produto')
  })

  it('deve buscar produto', async () => {
    // Create
    const { data: created } = await supabase
      .from('produtos')
      .insert({ nome: 'TESTE Produto', preco: 100 })
      .select()
      .single()

    // Read
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id', created.id)
      .single()

    expect(error).toBeNull()
    expect(data.id).toBe(created.id)
  })
})
```

---

## ✅ Checklist de Boas Práticas

- [ ] Sempre verificar `error` antes de usar `data`
- [ ] Usar `.select()` após INSERT/UPDATE para retornar dados
- [ ] Usar `.single()` quando espera um único resultado
- [ ] Implementar loading states
- [ ] Mostrar feedback ao usuário (toast)
- [ ] Usar hooks customizados para reutilização
- [ ] Implementar RLS para segurança
- [ ] Criar índices para queries frequentes
- [ ] Usar subscriptions para realtime
- [ ] Limpar subscriptions no cleanup
- [ ] Validar inputs antes de inserir
- [ ] Tratar erros de forma amigável
- [ ] Logar erros para debugging

---

**✅ Database operations seguras e eficientes!**
