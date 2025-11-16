# 🔧 ICARUS v5.0 - Troubleshooting Guide

## 🚨 Problemas Comuns

### 1. Supabase Connection Error

**Erro**: `Error: Invalid Supabase URL`

**Solução**:
```bash
# Verificar .env.local
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-key-aqui

# Reiniciar dev server
npm run dev
```

### 2. TypeScript Errors

**Erro**: `Cannot find module '@/components/ui/button'`

**Solução**:
```bash
# Verificar tsconfig.json paths
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}

# Reinstalar
npm install
```

### 3. Build Failing

**Erro**: `Build failed with errors`

**Solução**:
```bash
# Limpar cache
rm -rf node_modules
rm -rf .next
rm package-lock.json

# Reinstalar
npm install
npm run build
```

### 4. IA API Errors

**Erro**: `ANTHROPIC_API_KEY not found`

**Solução**:
```bash
# Adicionar em .env.local
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Verificar limites de rate
# Claude: 50 req/min (Tier 1)
```

### 5. Componente Não Renderiza

**Debug**:
```typescript
// Adicionar console.logs
console.log('Props:', props)
console.log('State:', state)
console.log('Data:', data)

// Verificar erros no console
// Verificar network tab (API calls)
```

---

## ⚡ Performance Issues

### Bundle Size Grande

```bash
# Analisar bundle
npm run build
npx vite-bundle-visualizer

# Lazy load módulos pesados
const Module = lazy(() => import('./Module'))
```

### Queries Lentas

```typescript
// Adicionar índices no Supabase
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_created_at ON produtos(created_at DESC);

// Limitar resultados
.select('*')
.limit(50)

// Usar paginação
.range(0, 49)
```

---

## 🔍 Debug Mode

```typescript
// Ativar em desenvolvimento
if (import.meta.env.DEV) {
  console.log('Debug mode ON')
  // Logs adicionais
}
```

---

## 📞 Suporte

- **Docs**: `/docs/`
- **GitHub Issues**: Reportar bugs
- **Supabase Dashboard**: Verificar logs

**Atualizado**: 2025-11-15
