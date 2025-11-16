# 🔧 ICARUS - Troubleshooting Guide

## 🚨 Problemas Comuns

### 1. TypeScript Errors

**Problema**: `Property 'X' does not exist on type 'Y'`

**Solução**:
```bash
# Regenerar types do Supabase
npm run db:types

# Verificar tsconfig.json
npm run type-check
```

---

### 2. Supabase Connection Failed

**Problema**: `Failed to fetch` ou timeout em queries

**Solução**:
```bash
# Verificar env vars
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Testar conexão
curl $NEXT_PUBLIC_SUPABASE_URL/rest/v1/

# Verificar RLS policies no Supabase Dashboard
```

---

### 3. Build Falha

**Problema**: `npm run build` falha

**Solução**:
```bash
# Limpar cache
rm -rf .next
rm -rf node_modules
npm install

# Verificar erros
npm run lint
npm run type-check

# Build novamente
npm run build
```

---

### 4. Componentes Não Renderizam

**Problema**: Tela branca ou componente não aparece

**Solução**:
```tsx
// Verificar no console do navegador
// Adicionar error boundary

import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error }) {
  return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
      <h2 className="text-red-400 font-bold">Erro</h2>
      <pre className="text-red-300 text-sm mt-2">{error.message}</pre>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
```

---

### 5. Styling Não Funciona

**Problema**: Classes Tailwind não aplicam

**Solução**:
```bash
# Verificar tailwind.config.js
# Certifi car que content inclui seus arquivos:
content: [
  './src/**/*.{js,ts,jsx,tsx,mdx}',
]

# Rebuild
npm run dev
```

---

## ⚡ Performance Issues

### Lentidão Geral

```tsx
// Adicionar React.memo
export const MyComponent = React.memo(({ data }) => {
  // ...
})

// Usar useMemo para computações pesadas
const filteredData = useMemo(() => {
  return data.filter(/* ... */)
}, [data])

// Usar useCallback para funções
const handleClick = useCallback(() => {
  // ...
}, [dependency])

// Lazy load rotas
const ProductPage = lazy(() => import('./ProductPage'))
```

---

## 🐛 Debug Mode

### Habilitar Debug

```tsx
// .env.local
NEXT_PUBLIC_DEBUG=true

// Usar no código
if (process.env.NEXT_PUBLIC_DEBUG === 'true') {
  console.log('Debug info:', data)
}
```

### React DevTools

```bash
# Instalar extensão:
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Usar no navegador:
# Components tab: ver árvore de componentes
# Profiler tab: medir performance
```

---

## 📞 Suporte

Se os problemas persistirem:

1. **Verificar logs**: `npm run dev` (terminal)
2. **Console navegador**: F12 → Console
3. **Network tab**: F12 → Network (ver chamadas API)
4. **Criar issue**: GitHub Issues com:
   - Descrição do problema
   - Steps to reproduce
   - Versão do Node/npm
   - Logs relevantes

---

**Versão**: 1.0.0
**Status**: ✅ Guia ativo
