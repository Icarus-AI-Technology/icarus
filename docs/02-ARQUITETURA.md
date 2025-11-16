# 🏗️ Arquitetura - ICARUS v5.0

## Visão Geral Arquitetural

ICARUS v5.0 segue uma arquitetura **modular, escalável e cloud-native**, projetada para alta performance e manutenibilidade.

---

## 🎯 Princípios Arquiteturais

### 1. Separation of Concerns
- **UI Layer**: Componentes React isolados
- **Business Logic**: Hooks customizados
- **Data Layer**: Supabase client
- **AI Layer**: IcarusBrain services

### 2. Modularidade
- 58 módulos independentes
- Lazy loading por rota
- Code splitting automático
- Reusabilidade 100%

### 3. Escalabilidade
- Horizontal scaling (Vercel Edge)
- Database pooling (Supabase)
- CDN global
- Caching agressivo

### 4. Performance
- Bundle <1.5MB
- FCP <1.5s
- Lighthouse >95
- Realtime WebSocket

---

## 📐 Arquitetura de Alto Nível

```
┌─────────────────────────────────────────────────────────┐
│                      USUÁRIO                             │
│               (Browser / PWA / Mobile)                   │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  VERCEL EDGE CDN                         │
│           (Global Cache + Edge Functions)                │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                FRONTEND (React SPA)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  58 Módulos  │  │  OraclusX DS │  │ Code Connect │  │
│  │  (Lazy Load) │  │ (175 Comps)  │  │(Figma Sync)  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  React 18.3  │  │   Vite 6.0   │  │Tailwind 4.0  │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────┐              ┌──────────────────────┐
│    SUPABASE      │              │   ANTHROPIC API      │
│   (Database)     │              │  (Claude Sonnet 4)   │
│                  │              │                      │
│  PostgreSQL 15   │              │  IcarusBrain (12)    │
│  Auth            │              │  - Predict           │
│  Realtime        │              │  - Analyze           │
│  Storage         │              │  - Recommend         │
│  RLS             │              │  - Chat              │
└──────────────────┘              └──────────────────────┘
```

---

## 🔄 Fluxo de Dados

### 1. Renderização Inicial

```
1. User acessa URL
   ↓
2. Vercel Edge serve HTML/CSS/JS (cached)
   ↓
3. React hydrate app
   ↓
4. Lazy load módulo necessário
   ↓
5. Fetch data do Supabase
   ↓
6. Render UI com OraclusX DS
```

### 2. Interação do Usuário

```
1. User interage (click, input)
   ↓
2. React event handler
   ↓
3. Update local state
   ↓
4. Call Supabase mutation
   ↓
5. Optimistic UI update
   ↓
6. Await response
   ↓
7. Sync state ou rollback
   ↓
8. Toast notification
```

### 3. Serviço IA

```
1. User solicita previsão
   ↓
2. useIcarusBrain hook
   ↓
3. Validate inputs
   ↓
4. Call Anthropic API
   ↓
5. Stream response (se aplicável)
   ↓
6. Parse resultado
   ↓
7. Update UI
   ↓
8. Cache resultado (opcional)
```

### 4. Realtime Sync

```
1. Supabase Realtime WebSocket
   ↓
2. Subscribe to table changes
   ↓
3. Receive postgres_changes event
   ↓
4. Update React state
   ↓
5. Re-render affected components
```

---

## 📦 Estrutura de Diretórios Detalhada

```
icarus/
├── public/                   # Assets estáticos
│   ├── icons/
│   ├── images/
│   └── fonts/
│
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base (175 componentes)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   └── ...
│   │   │
│   │   ├── modules/         # 58 módulos ICARUS
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Cirurgias.tsx
│   │   │   ├── Estoque.tsx
│   │   │   ├── Compras.tsx
│   │   │   └── ...
│   │   │
│   │   └── layout/          # Layout components
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       ├── Footer.tsx
│   │       └── MainLayout.tsx
│   │
│   ├── hooks/               # Custom hooks
│   │   ├── useIcarusBrain.ts    # IA integration
│   │   ├── useSupabase.ts       # Database queries
│   │   ├── useAuth.ts           # Authentication
│   │   ├── useToast.ts          # Notifications
│   │   └── useMediaQuery.ts     # Responsive
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── anthropic.ts     # Claude client
│   │   │   ├── services.ts      # IA services
│   │   │   └── types.ts         # IA types
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts        # Supabase client
│   │   │   ├── types.ts         # Database types
│   │   │   └── queries.ts       # Common queries
│   │   │
│   │   └── utils.ts             # Helper functions
│   │
│   ├── styles/
│   │   ├── globals.css          # Global styles
│   │   └── neomorphism.css      # Neumorfismo
│   │
│   ├── types/
│   │   ├── database.ts          # Supabase types
│   │   ├── modules.ts           # Module types
│   │   └── index.ts             # Exports
│   │
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── vite-env.d.ts            # Vite types
│
├── docs/                    # Documentação
├── .github/                 # GitHub Actions
├── tests/                   # Testes
│
├── .env.example             # Env template
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── README.md
```

---

## 🔐 Segurança

### 1. Authentication (Supabase Auth)
```typescript
// Email/Password
// Google OAuth
// Magic Link
// JWT tokens
// Row Level Security (RLS)
```

### 2. Row Level Security (RLS)
```sql
-- Exemplo: Users só veem dados do próprio tenant
CREATE POLICY "tenant_isolation" ON produtos
  FOR ALL USING (
    tenant_id = (
      SELECT tenant_id
      FROM profiles
      WHERE id = auth.uid()
    )
  );
```

### 3. API Keys
```typescript
// Env vars (NUNCA commit)
VITE_SUPABASE_ANON_KEY  // Public (safe)
SUPABASE_SERVICE_KEY    // Secret (server-only)
VITE_ANTHROPIC_API_KEY  // Secret (rate limited)
```

### 4. CORS & CSP
```typescript
// Vercel headers
{
  "headers": [
    {
      "key": "X-Frame-Options",
      "value": "DENY"
    },
    {
      "key": "X-Content-Type-Options",
      "value": "nosniff"
    }
  ]
}
```

---

## ⚡ Performance

### 1. Code Splitting
```typescript
// Lazy load modules
const Cirurgias = lazy(() => import('./modules/Cirurgias'))
const Estoque = lazy(() => import('./modules/Estoque'))

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/cirurgias" element={<Cirurgias />} />
    <Route path="/estoque" element={<Estoque />} />
  </Routes>
</Suspense>
```

### 2. Bundle Optimization
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
          'ai-vendor': ['@anthropic-ai/sdk']
        }
      }
    }
  }
})
```

### 3. Caching Strategy
```typescript
// Service Worker (PWA)
- Static assets: Cache-first (1 ano)
- API responses: Network-first (com fallback)
- Images: Cache-first (3 meses)
```

---

## 🧪 Testing Strategy

### 1. Unit Tests
```typescript
// Vitest
- Hooks customizados
- Utils functions
- Components isolados
```

### 2. Integration Tests
```typescript
// React Testing Library
- User flows
- Form submissions
- API interactions
```

### 3. E2E Tests
```typescript
// Playwright
- Critical paths
- Multi-step workflows
- Cross-browser
```

---

## 🚀 Deploy Strategy

### 1. Development
```
Branch: develop
Auto-deploy: Vercel preview
URL: icarus-dev-xxx.vercel.app
```

### 2. Staging
```
Branch: staging
Auto-deploy: Vercel preview
URL: icarus-staging.vercel.app
```

### 3. Production
```
Branch: main
Auto-deploy: Vercel production
URL: icarus.vercel.app
```

### 4. CI/CD Pipeline
```yaml
# GitHub Actions
1. Lint (ESLint)
2. Type check (TypeScript)
3. Test (Vitest)
4. Build
5. Deploy (Vercel)
```

---

## 📈 Monitoring

### 1. Performance
- Vercel Analytics
- Web Vitals
- Lighthouse CI

### 2. Errors
- Sentry
- Error boundaries
- Logs estruturados

### 3. Usage
- Posthog (analytics)
- User behavior
- Feature flags

---

## 🔄 Versionamento

```
v5.0.x - Patch (bug fixes)
v5.x.0 - Minor (new features)
v6.0.0 - Major (breaking changes)
```

Semver: `MAJOR.MINOR.PATCH`

---

## 📚 Documentação Relacionada

- [Stack Tecnológico](03-STACK-TECNOLOGICO.md)
- [Design System](06-ORACLUSX-DESIGN-SYSTEM.md)
- [IA IcarusBrain](07-IA-ICARUSBRAIN.md)
- [Supabase Database](08-SUPABASE-DATABASE.md)

---

**ICARUS v5.0** - Arquitetura moderna, escalável e production-ready 🏗️
