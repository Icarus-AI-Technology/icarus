# Supabase Setup Guide - ICARUS v5.0

## 📋 Overview

ICARUS v5.0 uses **Supabase** as its primary database and backend service.

**Database**: PostgreSQL 15
**Tables**: 12 core tables
**Security**: Row Level Security (RLS) enabled
**Features**: Auth, Realtime, Storage

---

## 🚀 Quick Start

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in / Create account
3. Click "New Project"
4. Fill in:
   - **Project Name**: `ICARUS-FIGMA` (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you (recommend: South America - São Paulo)
5. Click "Create Project" and wait ~2 minutes

### Step 2: Get Credentials

Once your project is created:

1. Go to **Project Settings** (gear icon)
2. Navigate to **API** section
3. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long token)

### Step 3: Configure Environment Variables

1. Open `.env` file in project root
2. Replace placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Save the file

### Step 4: Run Migrations

**Option A: Supabase Dashboard (Easiest)**

1. Go to your Supabase project
2. Click **SQL Editor** in left sidebar
3. Copy content from `/supabase/migrations/001_icarus_core_schema.sql`
4. Paste in SQL Editor and click "Run"
5. Repeat for `002_rls_policies.sql`
6. Repeat for `003_seed_data.sql`

**Option B: Supabase CLI**

```bash
# Install Supabase CLI (if not installed)
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-id

# Run all migrations
supabase db push
```

### Step 5: Verify Connection

1. Start your dev server: `npm run dev`
2. Open the app in browser
3. Click the **"Database"** button (bottom right)
4. Click **"Test"** button
5. All 4 tests should show ✅ green checkmarks

---

## 📊 Database Structure

### 12 Tables Created

| # | Table | Description | Demo Data |
|---|-------|-------------|-----------|
| 1 | `companies` | Empresas/Distribuidoras | 1 company |
| 2 | `profiles` | User profiles | Auto-created |
| 3 | `product_categories` | OPME categories | 5 categories |
| 4 | `manufacturers` | Fabricantes | 5 manufacturers |
| 5 | `products` | Produtos OPME | 5 products |
| 6 | `hospitals` | Hospitais | 3 hospitals |
| 7 | `doctors` | Médicos | 4 doctors |
| 8 | `surgeries` | Cirurgias/Procedimentos | 10 surgeries |
| 9 | `surgery_items` | Items in surgeries | - |
| 10 | `invoices` | Notas Fiscais | - |
| 11 | `accounts_receivable` | Contas a Receber | - |
| 12 | `stock_movements` | Movimentações Estoque | - |

### Security (RLS)

All tables have **Row Level Security** enabled:
- Users see only data from their own company
- Multi-tenant architecture
- Role-based access control (admin, manager, user, viewer)

---

## 🔧 Troubleshooting

### Error: "Missing credentials"

**Solution**: Check your `.env` file has correct values.

### Error: "Connection failed"

**Solutions**:
1. Verify your Supabase project is active
2. Check URL and anon key are correct
3. Ensure no firewall blocking connection

### Error: "Query failed" or "Table doesn't exist"

**Solution**: Run migrations (Step 4 above).

### Error: "Permission denied"

**Solution**:
1. Make sure you're logged in (or RLS policies are correct)
2. Check if tables have RLS enabled

---

## 📚 Using Supabase in Code

### Fetch Data

```typescript
import { useSupabase } from '@/hooks/useSupabase'

function MyComponent() {
  const { supabase, isConfigured } = useSupabase()

  useEffect(() => {
    if (!isConfigured) return

    async function fetchProducts() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error:', error)
        return
      }

      console.log('Products:', data)
    }

    fetchProducts()
  }, [isConfigured])
}
```

### Insert Data

```typescript
const { error } = await supabase
  .from('products')
  .insert([{
    company_id: 'uuid-here',
    name: 'New Product',
    code: 'PROD-001',
    sale_price: 1000,
    stock_quantity: 10
  }])

if (error) {
  console.error('Error:', error)
} else {
  console.log('Product created!')
}
```

### Update Data

```typescript
const { error } = await supabase
  .from('products')
  .update({ stock_quantity: 20 })
  .eq('id', 'product-uuid')
```

### Delete Data

```typescript
const { error } = await supabase
  .from('products')
  .delete()
  .eq('id', 'product-uuid')
```

### Realtime Subscriptions

```typescript
const subscription = supabase
  .channel('products_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'products'
  }, (payload) => {
    console.log('Change detected:', payload)
  })
  .subscribe()

// Cleanup
return () => {
  subscription.unsubscribe()
}
```

---

## 🔐 Authentication (Future)

Supabase Auth is pre-configured. To enable login:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Sign out
await supabase.auth.signOut()

// Get current user
const { data: { user } } = await supabase.auth.getUser()
```

---

## 📖 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Version**: 1.0
**Last Updated**: 2025-11-16
**Author**: ICARUS Development Team
