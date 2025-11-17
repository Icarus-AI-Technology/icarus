# 🔧 SUPABASE MCP - Configuração Atualizada

**Data:** Novembro 16, 2025  
**Projeto:** ICARUS v5.0  
**Status:** ✅ Pronto para Configurar

---

## 📋 Credenciais do Supabase

### 🌐 Project Information

**Project URL:**
```
https://oshgkugagyixutiqyjsq.supabase.co
```

**Project Reference ID:**
```
oshgkugagyixutiqyjsq
```

---

### 🔑 API Keys

#### Anon/Public Key (Client-Side)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzE4MDgsImV4cCI6MjA3ODgwNzgwOH0.4x2pOJLSRkT9tQbUjLQFOvPhTgmPJNm1KenkepqFlmo
```

#### Service Role Key (Server-Side) ⚠️
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIzMTgwOCwiZXhwIjoyMDc4ODA3ODA4fQ.Jrw_uY4YeIs-LpGkbnAnWNwevZq9oAWUfVXR9o9rQBk
```

---

### 🗄️ Database Connection

**PostgreSQL Connection String:**
```
postgresql://postgres:KGenUNsg@!Wt//@db.oshgkugagyixutiqyjsq.supabase.co:5432/postgres
```

**Connection Details:**
- **Host:** `db.oshgkugagyixutiqyjsq.supabase.co`
- **Port:** `5432`
- **Database:** `postgres`
- **User:** `postgres`
- **Password:** `KGenUNsg@!Wt//`

---

## 📝 Passo a Passo - Configuração Manual

### 1️⃣ Criar arquivo `.env.local`

Crie um arquivo chamado `.env.local` na raiz do projeto com o seguinte conteúdo:

```bash
# 🔧 ICARUS v5.0 - Configuração Supabase

# Supabase Project URL
VITE_SUPABASE_URL=https://oshgkugagyixutiqyjsq.supabase.co

# Supabase Anon/Public Key (para client-side)
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzE4MDgsImV4cCI6MjA3ODgwNzgwOH0.4x2pOJLSRkT9tQbUjLQFOvPhTgmPJNm1KenkepqFlmo

# Supabase Service Role Key (para server-side/admin)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIzMTgwOCwiZXhwIjoyMDc4ODA3ODA4fQ.Jrw_uY4YeIs-LpGkbnAnWNwevZq9oAWUfVXR9o9rQBk

# Database URL (para conexões diretas PostgreSQL)
DATABASE_URL=postgresql://postgres:KGenUNsg@!Wt//@db.oshgkugagyixutiqyjsq.supabase.co:5432/postgres
```

### 2️⃣ Verificar arquivo `.gitignore`

Certifique-se de que o `.env.local` está no `.gitignore`:

```bash
# Environment variables
.env
.env.local
.env*.local
```

### 3️⃣ Testar Conexão

Execute o projeto e verifique a conexão:

```bash
npm run dev
```

Abra o console do navegador e procure por:
- ✅ `ICARUS: Supabase connected successfully`
- ❌ `⚠️ ICARUS: Supabase credentials not found`

### 4️⃣ Testar Componente de Diagnóstico

Acesse o componente de teste:

```bash
# No navegador, abra DevTools e execute:
# O componente SupabaseConnectionTest já está disponível
```

---

## 🛠️ Comandos Úteis

### Criar arquivo .env.local via Terminal

```bash
cd /Users/daxmeneghel/.cursor/worktrees/icarus/xOIpa

cat > .env.local << 'EOF'
# 🔧 ICARUS v5.0 - Configuração Supabase
VITE_SUPABASE_URL=https://oshgkugagyixutiqyjsq.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzE4MDgsImV4cCI6MjA3ODgwNzgwOH0.4x2pOJLSRkT9tQbUjLQFOvPhTgmPJNm1KenkepqFlmo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzIzMTgwOCwiZXhwIjoyMDc4ODA3ODA4fQ.Jrw_uY4YeIs-LpGkbnAnWNwevZq9oAWUfVXR9o9rQBk
DATABASE_URL=postgresql://postgres:KGenUNsg@!Wt//@db.oshgkugagyixutiqyjsq.supabase.co:5432/postgres
EOF
```

### Verificar configuração

```bash
# Verificar se o arquivo foi criado
cat .env.local

# Iniciar servidor de desenvolvimento
npm run dev
```

---

## 🔒 Segurança

### ⚠️ IMPORTANTE

1. **Anon Key (VITE_SUPABASE_ANON_KEY)**
   - ✅ Seguro para usar no client-side
   - ✅ Pode ser exposto publicamente
   - ✅ Acesso controlado por RLS (Row Level Security)

2. **Service Role Key (SUPABASE_SERVICE_ROLE_KEY)**
   - ❌ NUNCA exponha no client-side
   - ❌ NUNCA commite no Git
   - ✅ Use apenas em server-side
   - ✅ Bypassa todas as regras de RLS

3. **Database URL (DATABASE_URL)**
   - ❌ NUNCA exponha no client-side
   - ❌ NUNCA commite no Git
   - ✅ Use apenas em ferramentas CLI ou server-side
   - ✅ Contém senha de acesso direto ao banco

---

## 📊 Próximos Passos

### 1. Configurar RLS (Row Level Security)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;

-- Criar políticas de acesso
CREATE POLICY "Users can view their own company data"
  ON companies FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Executar Migrations

```bash
# Executar migrations do Supabase
npm run supabase:migrate

# Ou manualmente via Supabase Dashboard
# Settings > Database > SQL Editor
```

### 3. Configurar Autenticação

```bash
# No Supabase Dashboard:
# Authentication > Providers
# Habilitar: Email/Password, Google, etc.
```

---

## 🧪 Testes de Conexão

### Teste 1: Via Console do Navegador

```javascript
// Abra DevTools Console
import { supabase } from './src/lib/config/supabase-client';

// Testar conexão
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .limit(1);

console.log('Test Result:', { data, error });
```

### Teste 2: Via Componente React

```tsx
import { supabase } from '@/lib/config/supabase-client';

function TestConnection() {
  const [status, setStatus] = useState('testing...');

  useEffect(() => {
    supabase
      .from('companies')
      .select('count')
      .then(({ data, error }) => {
        setStatus(error ? 'Error' : 'Connected');
      });
  }, []);

  return <div>Supabase Status: {status}</div>;
}
```

---

## 📚 Referências

### Documentação Supabase

- **Dashboard:** https://supabase.com/dashboard/project/oshgkugagyixutiqyjsq
- **API Docs:** https://supabase.com/docs/reference/javascript
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security

### Arquivos do Projeto

- **Client Config:** `src/lib/config/supabase-client.ts`
- **Types:** `src/types/supabase.ts`
- **Test Component:** `src/components/dev-tools/SupabaseConnectionTest.tsx`
- **Auth Context:** `src/contexts/AuthContext.tsx`

---

## ✅ Checklist de Configuração

- [ ] Criar arquivo `.env.local` na raiz do projeto
- [ ] Copiar as credenciais acima
- [ ] Verificar que `.env.local` está no `.gitignore`
- [ ] Executar `npm run dev`
- [ ] Verificar console do navegador (sem erros de Supabase)
- [ ] Testar conexão com banco (query simples)
- [ ] Configurar RLS nas tabelas
- [ ] Executar migrations
- [ ] Testar autenticação (se necessário)
- [ ] Deploy em produção (configurar env vars na plataforma)

---

## 🚀 Status

**Configuração:** ✅ Pronta  
**Credenciais:** ✅ Fornecidas  
**Documentação:** ✅ Completa  
**Próximo Passo:** Criar `.env.local` manualmente

---

**Data de Atualização:** Novembro 16, 2025  
**Responsável:** Designer Icarus v5.0  
**Projeto:** ICARUS v5.0 - ERP Médico-Hospitalar B2B

