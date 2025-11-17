# 🗄️ Supabase Database

**PostgreSQL 15 com Realtime, Auth e Storage**

---

## 📖 Documentação Completa

Este documento é um **resumo executivo**. Para o **guia completo de patterns**, consulte:

**→ [SKILL: Supabase](skills/SKILL_SUPABASE.md)**

---

## 🎯 Visão Geral

**Supabase** é o backend do ICARUS, fornecendo:
- **Database**: PostgreSQL 15 (relacional, ACID)
- **Auth**: JWT, OAuth, Magic Link
- **Realtime**: WebSocket subscriptions
- **Storage**: S3-compatible file storage
- **RLS**: Row Level Security (multi-tenant)

### Por que Supabase?

```typescript
{
  pros: [
    "Open source",
    "PostgreSQL (melhor DB relacional)",
    "Realtime built-in",
    "Auth completo",
    "Self-hostable",
    "Free tier generoso"
  ],
  pricing: {
    free: "500MB DB, 2GB bandwidth",
    pro: "$25/mês (8GB DB, 50GB bandwidth)"
  }
}
```

---

## 🗂️ Schema Principal

### Tabelas Core (12)

```sql
-- Auth
auth.users
public.perfis

-- Core Business
public.produtos
public.clientes
public.cirurgias
public.estoque
public.movimentacoes

-- Financeiro
public.contas_pagar
public.contas_receber
public.notas_fiscais

-- Operacional
public.fornecedores
public.contratos
```

---

## 🔧 Setup Client

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

---

## 📝 CRUD Operations

### SELECT (Read)

```typescript
// Buscar todos
const { data, error } = await supabase
  .from('produtos')
  .select('*')

// Com filtro
const { data } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)
  .order('created_at', { ascending: false })

// Com JOIN
const { data } = await supabase
  .from('cirurgias')
  .select(`
    *,
    paciente:pacientes(nome, cpf),
    hospital:hospitais(nome, cidade)
  `)
```

### INSERT (Create)

```typescript
const { data, error } = await supabase
  .from('produtos')
  .insert({
    nome: 'Produto X',
    preco: 100
  })
  .select()
  .single()
```

### UPDATE

```typescript
const { error } = await supabase
  .from('produtos')
  .update({ preco: 120 })
  .eq('id', '123')
```

### DELETE

```typescript
const { error } = await supabase
  .from('produtos')
  .delete()
  .eq('id', '123')
```

---

## 🔄 Realtime Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('produtos_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'produtos'
    }, (payload) => {
      console.log('Change:', payload)
      refetchData()
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

---

## 🔒 Row Level Security (RLS)

### Habilitar RLS

```sql
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
```

### Políticas Multi-Tenant

```sql
-- Usuários só veem dados do próprio tenant
CREATE POLICY "tenant_isolation" ON produtos
  FOR ALL
  USING (
    tenant_id = (
      SELECT tenant_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );
```

---

## 🎣 Custom Hooks

### useSupabaseQuery

```typescript
export function useSupabaseQuery(table, query = (q) => q) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const builder = supabase.from(table).select('*')
      const { data, error } = await query(builder)

      if (error) setError(error)
      else setData(data || [])

      setLoading(false)
    }
    fetch()
  }, [table])

  return { data, loading, error }
}
```

### Uso

```typescript
const { data: produtos, loading } = useSupabaseQuery('produtos', (q) =>
  q.eq('ativo', true).order('created_at', { ascending: false })
)
```

---

## 📁 Storage (Arquivos)

### Upload

```typescript
async function uploadFile(file: File) {
  const fileName = `${Date.now()}-${file.name}`

  const { data, error } = await supabase.storage
    .from('documentos')
    .upload(fileName, file)

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('documentos')
    .getPublicUrl(fileName)

  return urlData.publicUrl
}
```

### Download

```typescript
const { data } = await supabase.storage
  .from('documentos')
  .download(path)

const url = URL.createObjectURL(data)
```

---

## 📊 Queries Avançadas

### Aggregations

```typescript
// Count
const { count } = await supabase
  .from('produtos')
  .select('*', { count: 'exact', head: true })

// Sum
const { data } = await supabase
  .from('vendas')
  .select('valor.sum()')
```

### Full-text Search

```sql
-- Criar índice
CREATE INDEX produtos_nome_idx ON produtos
  USING GIN (to_tsvector('portuguese', nome));
```

```typescript
// Buscar
const { data } = await supabase
  .from('produtos')
  .select('*')
  .textSearch('nome', 'joelho titanio', {
    config: 'portuguese'
  })
```

---

## ⚡ Performance

### Índices

```sql
-- Performance queries
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX idx_estoque_produto ON estoque(produto_id);
```

### Paginação

```typescript
const page = 1
const perPage = 20

const { data, count } = await supabase
  .from('produtos')
  .select('*', { count: 'exact' })
  .range(page * perPage, (page + 1) * perPage - 1)
```

---

## ✅ Checklist Boas Práticas

- [ ] Sempre verificar `error` antes de usar `data`
- [ ] Usar `.select()` após INSERT/UPDATE
- [ ] Usar `.single()` quando espera um único resultado
- [ ] Implementar loading states
- [ ] Mostrar feedback ao usuário (toast)
- [ ] Usar hooks customizados
- [ ] Implementar RLS para segurança
- [ ] Criar índices para queries frequentes
- [ ] Limpar subscriptions no cleanup
- [ ] Validar inputs antes de inserir
- [ ] Tratar erros de forma amigável

---

## 🎓 Como Usar

### 1. Leia o SKILL Completo
**→ [SKILL: Supabase](skills/SKILL_SUPABASE.md)**

### 2. Estude Exemplos
- Ver hooks: `src/hooks/useSupabase.ts`
- Ver queries: `src/lib/supabase/queries.ts`
- Ver módulos: `Produtos.tsx`, `Cirurgias.tsx`

### 3. Implemente Queries
- Seguir patterns do SKILL
- Sempre tratar erros
- Usar hooks customizados

---

## 📚 Recursos

### Documentação
- **[SKILL: Supabase](skills/SKILL_SUPABASE.md)** ⭐ (Guia completo)
- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript)

### Exemplos
- **Client**: `src/lib/supabase/client.ts`
- **Hooks**: `src/hooks/useSupabase.ts`
- **Queries**: `src/lib/supabase/queries.ts`

---

**Supabase** - Backend completo, simples e poderoso 🗄️

**Para desenvolvimento**: Consulte sempre o [SKILL completo](skills/SKILL_SUPABASE.md)
