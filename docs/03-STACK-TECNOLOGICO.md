# ⚙️ Stack Tecnológico - ICARUS v5.0

Detalhamento completo de todas as tecnologias utilizadas no ICARUS.

---

## 📦 Frontend

### React 18.3.1
**Biblioteca UI principal**

```json
{
  "versão": "18.3.1",
  "motivo": "Concurrent features, Suspense, Automatic batching",
  "features_usadas": [
    "Concurrent rendering",
    "Suspense for data fetching",
    "Automatic batching",
    "useTransition",
    "useDeferredValue"
  ]
}
```

**Por que React?**
- ✅ Ecossistema maduro
- ✅ Performance excepcional
- ✅ Comunidade gigante
- ✅ Tooling excelente
- ✅ Server Components (futuro)

---

### TypeScript 5.6.3
**Type safety & Developer Experience**

```json
{
  "versão": "5.6.3",
  "strict": true,
  "features": [
    "Decorators",
    "Satisfies operator",
    "Const type parameters",
    "Template literal types"
  ]
}
```

**Configuração (tsconfig.json)**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

### Vite 6.0.0
**Build tool ultra-rápido**

```json
{
  "versão": "6.0.0",
  "motivo": "HMR instantâneo, Build rápido, ESM nativo",
  "benchmarks": {
    "dev_start": "<500ms",
    "hmr": "<50ms",
    "build": "<30s"
  }
}
```

**vs Webpack**:
- ⚡ **10x mais rápido** em dev
- ⚡ **5x mais rápido** em build
- ✅ Zero config
- ✅ ESM nativo

---

### Tailwind CSS 4.0.0
**Utility-first CSS framework**

```json
{
  "versão": "4.0.0",
  "motivo": "Performance, DX, Purge automático",
  "bundle_size": "<10KB",
  "classes": "~8000"
}
```

**Configuração (tailwind.config.js)**:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
      }
    },
  },
  plugins: [],
}
```

---

### shadcn/ui
**Component library (headless)**

```json
{
  "base": "Radix UI",
  "componentes": 175,
  "styled_with": "Tailwind CSS",
  "customizável": "100%"
}
```

**Componentes principais**:
- Button, Input, Select, Textarea
- Dialog, Sheet, Popover, Dropdown
- Table, Card, Tabs, Accordion
- Toast, Alert, Badge, Avatar
- Form, Label, Checkbox, Radio

**Por que shadcn/ui?**
- ✅ Headless (full control)
- ✅ Acessível (WCAG AA)
- ✅ Customizável (Tailwind)
- ✅ Copy-paste (não NPM package)
- ✅ TypeScript nativo

---

## 🗄️ Backend & Database

### Supabase
**Backend-as-a-Service (PostgreSQL)**

```json
{
  "database": "PostgreSQL 15",
  "auth": "GoTrue (JWT)",
  "storage": "S3-compatible",
  "realtime": "WebSocket",
  "edge_functions": "Deno",
  "pricing": "Free tier generoso"
}
```

**Features usadas**:

#### 1. Database (PostgreSQL 15)
```sql
-- Relacional, ACID
-- Extensions: pgvector, postgis
-- Full-text search
-- JSON/JSONB nativo
```

#### 2. Auth
```typescript
// Email/Password, OAuth, Magic Link
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
})
```

#### 3. Realtime
```typescript
// WebSocket subscriptions
supabase
  .channel('produtos_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'produtos' }, handleChange)
  .subscribe()
```

#### 4. Storage
```typescript
// S3-compatible file storage
await supabase.storage
  .from('documentos')
  .upload('invoice.pdf', file)
```

#### 5. Row Level Security (RLS)
```sql
-- Multi-tenant isolation
CREATE POLICY "tenant_isolation" ON produtos
  FOR ALL USING (tenant_id = current_user_tenant());
```

**Por que Supabase?**
- ✅ Open source
- ✅ PostgreSQL (melhor DB relacional)
- ✅ Realtime built-in
- ✅ Auth completo
- ✅ Self-hostable

---

## 🧠 IA & ML

### Anthropic Claude Sonnet 4.5
**Large Language Model principal**

```json
{
  "model": "claude-sonnet-4-20250514",
  "context_window": "200K tokens",
  "output": "8K tokens",
  "features": [
    "Function calling",
    "Vision (images)",
    "Streaming",
    "Prompt caching"
  ]
}
```

**Uso no ICARUS**:
```typescript
// 12 serviços IA
1. Previsão de demanda (92% acurácia)
2. Score inadimplência (0-100)
3. Recomendação produtos
4. Chat assistente
5. Análise sentimento
6. OCR documentos
7. Categorização auto
8. Detecção anomalias
9. Otimização rotas
10. Previsão churn
11. Pricing inteligente
12. Validação dados
```

**Custo**:
```
Input: $3.00 / 1M tokens
Output: $15.00 / 1M tokens
Cache hits: $0.30 / 1M tokens (90% desconto)

Média mensal: ~R$ 2.000
```

---

### GPT-4 (Fallback)
**Modelo alternativo**

```json
{
  "model": "gpt-4-turbo",
  "uso": "Fallback se Claude indisponível",
  "custo": "Mais caro que Claude"
}
```

---

### TensorFlow.js
**ML no browser**

```json
{
  "versão": "4.x",
  "uso": [
    "Modelos customizados",
    "Inference local",
    "Transfer learning"
  ]
}
```

---

## 🚀 Deploy & DevOps

### Vercel
**Hosting & CI/CD**

```json
{
  "tier": "Pro",
  "features": [
    "Edge Functions",
    "Analytics",
    "Image Optimization",
    "DDoS protection",
    "Auto SSL"
  ],
  "regions": "Global CDN (300+ POPs)"
}
```

**Build config (vercel.json)**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

**Por que Vercel?**
- ✅ Deploy <30s
- ✅ Preview automático
- ✅ Edge runtime
- ✅ Analytics incluído
- ✅ DX excepcional

---

### GitHub Actions
**CI/CD Pipeline**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test
      - run: npm run build
```

---

## 📊 Monitoring & Analytics

### Vercel Analytics
**Web Vitals & Performance**

```json
{
  "metrics": [
    "FCP (First Contentful Paint)",
    "LCP (Largest Contentful Paint)",
    "CLS (Cumulative Layout Shift)",
    "FID (First Input Delay)",
    "TTFB (Time to First Byte)"
  ]
}
```

---

### Sentry
**Error tracking**

```typescript
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
})
```

---

## 🧪 Testing

### Vitest
**Unit & Integration tests**

```json
{
  "framework": "Vitest",
  "versão": "1.x",
  "features": [
    "Vite-native",
    "ESM support",
    "Snapshot testing",
    "Coverage (c8)"
  ]
}
```

```typescript
// Exemplo
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

---

### React Testing Library
**Component testing**

```json
{
  "filosofia": "Test behavior, not implementation",
  "queries": ["ByRole", "ByLabelText", "ByText"],
  "user_events": "@testing-library/user-event"
}
```

---

### Playwright
**E2E testing**

```json
{
  "browsers": ["Chromium", "Firefox", "WebKit"],
  "features": [
    "Auto-wait",
    "Screenshots",
    "Video recording",
    "Network mocking"
  ]
}
```

```typescript
// Exemplo
import { test, expect } from '@playwright/test'

test('login flow', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.fill('input[name="email"]', 'user@test.com')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  await expect(page).toHaveURL('/dashboard')
})
```

---

## 📦 Outras Dependências

### UI/UX
```json
{
  "lucide-react": "Icons (tree-shakeable)",
  "radix-ui": "Headless components",
  "clsx": "Conditional classes",
  "tailwind-merge": "Merge Tailwind classes"
}
```

### Utils
```json
{
  "date-fns": "Date manipulation",
  "zod": "Schema validation",
  "react-hook-form": "Form management",
  "zustand": "State management (opcional)"
}
```

### Charts
```json
{
  "recharts": "Charts declarativos",
  "chart.js": "Alternativa imperativa"
}
```

---

## 📊 Comparação Stack

### ICARUS vs Competitors

| Stack | ICARUS | Protheus | SAP |
|-------|--------|----------|-----|
| **Frontend** | React 18 | Desktop app | Java/ABAP |
| **Database** | PostgreSQL | SQL Server | HANA |
| **Deploy** | Vercel Edge | On-premise | On-premise |
| **IA** | Claude 4.5 | ❌ Nenhuma | Watson (pago) |
| **Custo** | Baixo | Alto | Muito alto |
| **DX** | Excelente | Ruim | Médio |

---

## 🔮 Roadmap Tecnológico

### v5.1 (Q1 2026)
- [ ] React Server Components
- [ ] Bun runtime
- [ ] Turbopack (Vite replacement)

### v5.2 (Q2 2026)
- [ ] Edge database (Cloudflare D1)
- [ ] WebAssembly modules
- [ ] Offline-first architecture

### v6.0 (Q3 2026)
- [ ] React Native (mobile)
- [ ] Tauri (desktop)
- [ ] Blockchain integration

---

## 📚 Documentação Relacionada

- [Arquitetura](02-ARQUITETURA.md)
- [OraclusX Design System](06-ORACLUSX-DESIGN-SYSTEM.md)
- [IA IcarusBrain](07-IA-ICARUSBRAIN.md)
- [Supabase Database](08-SUPABASE-DATABASE.md)

---

**ICARUS v5.0** - Stack moderno, performático e production-ready ⚙️
