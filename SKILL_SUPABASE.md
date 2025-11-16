# 🗄️ SKILL: Supabase Patterns

## 🔧 Setup Client

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

---

## 📝 CRUD Patterns

### CREATE

```typescript
const { data, error } = await supabase
  .from('products')
  .insert({
    name: 'Product Name',
    price: 100,
    active: true
  })
  .select()
  .single()

if (error) throw error
return data
```

### READ (List)

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*, category(*)')  // Join com category
  .eq('active', true)        // Filtro
  .order('created_at', { ascending: false })
  .limit(10)

if (error) throw error
return data
```

### READ (Single)

```typescript
const { data, error } = await supabase
  .from('products')
  .select('*, category(*)')
  .eq('id', productId)
  .single()

if (error) throw error
return data
```

### UPDATE

```typescript
const { data, error } = await supabase
  .from('products')
  .update({ price: 150 })
  .eq('id', productId)
  .select()
  .single()

if (error) throw error
return data
```

### DELETE

```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', productId)

if (error) throw error
```

---

## 🔍 Filtros Avançados

```typescript
// OR
.or('name.ilike.%search%,code.ilike.%search%')

// IN
.in('status', ['active', 'pending'])

// Range
.gte('price', 100)
.lte('price', 500)

// Full text search
.textSearch('description', 'keyword')

// Múltiplos filtros
.eq('active', true)
.gte('stock', 10)
.order('name', { ascending: true })
.limit(20)
```

---

## 🔄 Realtime Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('products-changes')
    .on(
      'postgres_changes',
      {
        event: '*',              // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'products'
      },
      (payload) => {
        console.log('Change:', payload)

        // Atualizar state local
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p =>
            p.id === payload.new.id ? payload.new : p
          ))
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## 🔐 RLS (Row Level Security)

### Habilitar RLS

```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
```

### Policies Comuns

```sql
-- SELECT: Usuários veem apenas seus dados
CREATE POLICY "Users can view own products"
ON products FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Usuários inserem apenas para si
CREATE POLICY "Users can insert own products"
ON products FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Usuários atualizam apenas seus dados
CREATE POLICY "Users can update own products"
ON products FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Usuários deletam apenas seus dados
CREATE POLICY "Users can delete own products"
ON products FOR DELETE
USING (auth.uid() = user_id);

-- Admin pode tudo
CREATE POLICY "Admins have full access"
ON products
USING (
  auth.jwt() ->> 'role' = 'admin'
);
```

---

## 🎯 Exemplo Completo (Service)

```typescript
import { supabase } from '@/lib/supabase'

export class ProductService {
  static async create(data: ProductFormData) {
    const { data: product, error } = await supabase
      .from('products')
      .insert(data)
      .select('*, category(*)')
      .single()

    if (error) throw error
    return product
  }

  static async list(filters?: ProductFilters) {
    let query = supabase
      .from('products')
      .select('*, category(*)')

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  static async update(id: string, data: Partial<ProductFormData>) {
    const { data: product, error } = await supabase
      .from('products')
      .update(data)
      .eq('id', id)
      .select('*, category(*)')
      .single()

    if (error) throw error
    return product
  }

  static async delete(id: string) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
```

---

**Versão**: 1.0.0
**Status**: ✅ Patterns prontos
