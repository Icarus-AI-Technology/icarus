# 🔧 Troubleshooting Guide

Soluções para problemas comuns no ICARUS v5.0

---

## 🚨 Problemas de Build

### Erro: "Cannot find module '@/...'"

**Problema**: Imports com `@/` não funcionam

**Solução**:
```bash
# Verificar tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reiniciar servidor dev
npm run dev
```

---

### Erro: "process is not defined"

**Problema**: Variáveis de ambiente incorretas

**Solução**:
```bash
# Usar VITE_ prefix
# ❌ ERRADO
SUPABASE_URL=...

# ✅ CORRETO
VITE_SUPABASE_URL=...

# Reiniciar dev server após mudar .env
```

---

### Build muito lento

**Solução**:
```bash
# Limpar cache
rm -rf node_modules/.vite
npm run dev

# Otimizar dependências
npm run build -- --profile
```

---

## 🗄️ Problemas Supabase

### Erro: "Invalid API key"

**Problema**: Credenciais incorretas

**Solução**:
```bash
# Verificar .env.local
VITE_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ... (anon/public key)

# NÃO usar service_role key no frontend!
```

---

### RLS bloqueando queries

**Problema**: Row Level Security impedindo acesso

**Solução**:
```sql
-- Habilitar RLS policies no Supabase
CREATE POLICY "Enable read for authenticated users"
ON produtos
FOR SELECT
TO authenticated
USING (true);
```

---

### Realtime não funciona

**Solução**:
```typescript
// Verificar subscription
const channel = supabase
  .channel('my-channel')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'produtos'
  }, (payload) => {
    console.log('Change:', payload)
  })
  .subscribe((status) => {
    console.log('Status:', status) // Deve ser 'SUBSCRIBED'
  })
```

---

## 🎨 Problemas de Estilo

### Tailwind classes não aplicadas

**Solução**:
```bash
# Verificar tailwind.config.ts
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Incluir todos os arquivos
  ],
}

# Reiniciar dev server
npm run dev
```

---

### Efeito neumórfico não aparece

**Problema**: Classes `neu-*` não funcionam

**Solução**:
```css
/* Verificar src/index.css */
@layer utilities {
  .neu-soft {
    @apply shadow-neu-soft;
  }
}

/* E tailwind.config.ts */
theme: {
  extend: {
    boxShadow: {
      'neu-soft': '8px 8px 16px rgba(0, 0, 0, 0.1), -8px -8px 16px rgba(255, 255, 255, 0.9)',
    }
  }
}
```

---

## 🧪 Problemas de Teste

### Jest não encontra módulos

**Solução**:
```json
// jest.config.js
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
}
```

---

### Testes E2E falhando

**Solução**:
```bash
# Instalar browsers do Playwright
npx playwright install

# Rodar em modo debug
npx playwright test --debug
```

---

## 🔒 Problemas de Autenticação

### Login não persiste

**Solução**:
```typescript
// Verificar Supabase client config
export const supabase = createClient(url, key, {
  auth: {
    persistSession: true, // ✅ Deve ser true
    autoRefreshToken: true,
  }
})
```

---

### Redirect após login não funciona

**Solução**:
```typescript
// Configurar redirect URL no Supabase Dashboard
// Authentication > URL Configuration > Redirect URLs
// Adicionar: http://localhost:5173/auth/callback
```

---

## 📦 Problemas de Dependências

### npm install falha

**Solução**:
```bash
# Limpar cache npm
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Ou usar pnpm (mais rápido)
npm install -g pnpm
pnpm install
```

---

### Conflitos de versão

**Solução**:
```bash
# Ver árvore de dependências
npm ls <package-name>

# Forçar resolução (package.json)
"overrides": {
  "package-name": "^1.0.0"
}
```

---

## 🚀 Problemas de Deploy

### Vercel build timeout

**Solução**:
```json
// vercel.json
{
  "buildCommand": "npm run build",
  "framework": "vite",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "maxDuration": 300
      }
    }
  ]
}
```

---

### Environment variables não carregam

**Solução**:
```bash
# Vercel Dashboard > Settings > Environment Variables
# Adicionar:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Redeploy após adicionar vars
```

---

## 🔍 Debug Geral

### React DevTools não conecta

**Solução**:
```bash
# Instalar extensão do navegador
# Chrome: React Developer Tools
# Firefox: React DevTools

# Verificar modo dev
npm run dev # Não build
```

---

### Performance ruim em dev

**Solução**:
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    hmr: true,
    watch: {
      usePolling: false, // Desabilitar polling
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom'], // Pre-bundle deps
  }
})
```

---

## 📞 Ainda com problemas?

1. **Verificar Issues do GitHub** - Alguém já teve o mesmo problema
2. **Logs detalhados** - `DEBUG=* npm run dev`
3. **Abrir Issue** - Com logs + steps to reproduce

---

**v5.0.3** | Last updated: 2025-11-15
