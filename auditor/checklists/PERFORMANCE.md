# Performance Audit Checklist

> **Area:** Performance (Web Vitals, Bundle, Database)
> **Peso:** 10%
> **Itens:** ~40

---

## 1. Core Web Vitals

### 1.1 Largest Contentful Paint (LCP)
- [ ] LCP < 2.5s (Good)
- [ ] Imagens hero otimizadas
- [ ] Fonts preloaded
- [ ] Critical CSS inline

**Target:** < 2.5s (Good), < 4.0s (Needs Improvement)

### 1.2 First Input Delay (FID) / Interaction to Next Paint (INP)
- [ ] FID < 100ms (Good)
- [ ] INP < 200ms (Good)
- [ ] Event handlers otimizados
- [ ] Long tasks eliminadas

**Target:** FID < 100ms, INP < 200ms

### 1.3 Cumulative Layout Shift (CLS)
- [ ] CLS < 0.1 (Good)
- [ ] Dimensoes de imagens definidas
- [ ] Fonts com font-display: swap
- [ ] Nenhum conteudo injetado

**Target:** < 0.1 (Good), < 0.25 (Needs Improvement)

### 1.4 Time to First Byte (TTFB)
- [ ] TTFB < 800ms
- [ ] CDN configurado
- [ ] Edge functions otimizadas
- [ ] Cache headers corretos

**Verificacao:**
```bash
# Lighthouse CLI
npx lighthouse https://app.icarus.com --only-categories=performance

# Web Vitals em dev
# Verificar Speed Insights no Vercel
```

**Severidade:** MEDIUM (Vitals ruins = -5 pontos cada)

---

## 2. Bundle Size

### 2.1 JavaScript Bundle
- [ ] Main bundle < 200KB (gzipped)
- [ ] Total JS < 500KB (gzipped)
- [ ] Vendor bundle separado
- [ ] Async chunks para rotas

**Verificacao:**
```bash
# Build e verificar tamanho
npm run build
du -sh dist/assets/*.js

# Analisar bundle
npx vite-bundle-visualizer
```

### 2.2 Code Splitting
- [ ] React.lazy para rotas
- [ ] Dynamic imports para modulos pesados
- [ ] Prefetch de rotas criticas
- [ ] Preload de chunks importantes

### 2.3 Tree Shaking
- [ ] ESM imports usados
- [ ] Side effects marcados em package.json
- [ ] Lodash-es ao inves de lodash
- [ ] Date-fns ao inves de moment

**Verificacao:**
```bash
# Verificar React.lazy
grep -r "React.lazy" src/ --include="*.tsx" | wc -l

# Verificar dynamic imports
grep -r "import(" src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Severidade:** MEDIUM (Bundle > 500KB = -5 pontos)

---

## 3. Images & Assets

### 3.1 Image Optimization
- [ ] WebP/AVIF quando possivel
- [ ] Responsive images (srcset)
- [ ] Lazy loading de imagens
- [ ] Dimensoes definidas

### 3.2 Compression
- [ ] Gzip habilitado
- [ ] Brotli quando disponivel
- [ ] SVG otimizado (SVGO)

### 3.3 Caching
- [ ] Cache headers configurados
- [ ] Immutable para assets com hash
- [ ] Service Worker (opcional)

**Verificacao:**
```bash
# Verificar lazy loading
grep -r "loading=\"lazy\"" src/ --include="*.tsx" | wc -l

# Verificar dimensoes de imagens
grep -r "<img" src/ --include="*.tsx" | grep -v "width=" | wc -l
```

---

## 4. React Performance

### 4.1 Re-renders
- [ ] React.memo em componentes puros
- [ ] useCallback para handlers
- [ ] useMemo para calculos pesados
- [ ] Keys unicas e estaveis em listas

### 4.2 State Management
- [ ] Estado local quando possivel
- [ ] Context split para evitar re-renders
- [ ] Selectors para derivar dados
- [ ] React Query para server state

### 4.3 Virtualization
- [ ] Listas longas virtualizadas (react-window)
- [ ] Tabelas grandes virtualizadas
- [ ] Infinite scroll quando apropriado

**Verificacao:**
```bash
# Verificar React.memo
grep -r "React.memo\|memo(" src/ --include="*.tsx" | wc -l

# Verificar useCallback
grep -r "useCallback" src/ --include="*.tsx" | wc -l

# Verificar virtualizacao
grep -r "react-window\|react-virtual" src/ --include="*.tsx" | wc -l
```

---

## 5. API Performance

### 5.1 Latency
- [ ] API response < 200ms (P50)
- [ ] API response < 500ms (P95)
- [ ] API response < 1000ms (P99)

### 5.2 Caching
- [ ] React Query com staleTime
- [ ] HTTP cache headers
- [ ] Invalidation correta

### 5.3 Batching
- [ ] Requests agrupados quando possivel
- [ ] GraphQL batching (se aplicavel)
- [ ] N+1 eliminados

**Verificacao:**
```bash
# Verificar React Query config
grep -r "staleTime\|cacheTime" src/ --include="*.ts" --include="*.tsx"
```

---

## 6. Database Performance

### 6.1 Query Optimization
- [ ] Queries < 100ms (P95)
- [ ] Indices utilizados (EXPLAIN)
- [ ] N+1 queries eliminadas
- [ ] Pagination implementada

**Verificacao SQL:**
```sql
-- Queries lentas
SELECT
  query,
  calls,
  mean_time,
  total_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;

-- Indices nao utilizados
SELECT
  schemaname,
  relname,
  indexrelname,
  idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

### 6.2 Connection Pooling
- [ ] Pooler configurado (PgBouncer)
- [ ] Max connections adequado
- [ ] Connection timeout definido

### 6.3 Indexes
- [ ] Indice em empresa_id
- [ ] Indices em FKs
- [ ] Partial indexes para soft delete
- [ ] Composite indexes quando necessario

**Severidade:** HIGH (query > 1s = -10 pontos)

---

## 7. Edge Functions Performance

### 7.1 Cold Start
- [ ] Cold start < 500ms
- [ ] Imports minimos
- [ ] Lazy loading de modulos pesados

### 7.2 Execution Time
- [ ] Execution < 5s (Vercel limit: 10s hobby, 60s pro)
- [ ] Streaming quando possivel
- [ ] Early return para erros

### 7.3 Memory
- [ ] Memory usage monitorado
- [ ] Nao armazenar grandes objetos em memoria
- [ ] GC amigavel

**Verificacao:**
```bash
# Verificar funcoes
supabase functions list

# Ver logs de performance
supabase functions logs [function-name] --level=info
```

---

## 8. Monitoring

### 8.1 Metrics
- [ ] Vercel Analytics habilitado
- [ ] Speed Insights ativo
- [ ] Custom metrics definidas
- [ ] Alertas configurados

### 8.2 Real User Monitoring (RUM)
- [ ] Web Vitals coletados
- [ ] Error tracking (Sentry)
- [ ] User timing metrics

### 8.3 Synthetic Monitoring
- [ ] Lighthouse CI configurado
- [ ] Uptime monitoring
- [ ] Alertas de degradacao

**Verificacao:**
```bash
# Verificar Vercel Analytics
grep -r "@vercel/analytics\|@vercel/speed-insights" package.json
```

---

## 9. Targets de Performance

| Metrica | Target | Critico |
|---------|--------|---------|
| LCP | < 2.5s | > 4.0s |
| FID | < 100ms | > 300ms |
| CLS | < 0.1 | > 0.25 |
| TTFB | < 800ms | > 1.8s |
| Bundle (gzip) | < 500KB | > 1MB |
| API P95 | < 500ms | > 2s |
| Query P95 | < 100ms | > 500ms |
| Cold Start | < 500ms | > 2s |

---

## Calculo de Score

```typescript
const performanceChecks = {
  webVitals: { weight: 30, checks: ['lcp', 'fid', 'cls', 'ttfb'] },
  bundle: { weight: 20, checks: ['size', 'splitting', 'treeShaking'] },
  react: { weight: 15, checks: ['rerenders', 'state', 'virtualization'] },
  api: { weight: 15, checks: ['latency', 'caching', 'batching'] },
  database: { weight: 15, checks: ['queries', 'indexes', 'pooling'] },
  monitoring: { weight: 5, checks: ['metrics', 'rum', 'synthetic'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de performance
@auditor performance

# Lighthouse
npx lighthouse https://app.icarus.com --only-categories=performance

# Bundle analysis
npm run build && npx vite-bundle-visualizer
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
