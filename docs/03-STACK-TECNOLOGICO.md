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

---

### TypeScript 5.8
**Type safety & Developer Experience**

```json
{
  "versão": "5.8",
  "strict": true,
  "features": [
    "Satisfies operator",
    "Const type parameters",
    "Template literal types"
  ]
}
```

---

### Vite 6.3
**Build tool ultra-rápido**

```json
{
  "versão": "6.3",
  "motivo": "HMR instantâneo, Build rápido, ESM nativo",
  "benchmarks": {
    "dev_start": "<500ms",
    "hmr": "<50ms",
    "build": "<30s"
  }
}
```

---

### Tailwind CSS 4.1
**Utility-first CSS framework**

```json
{
  "versão": "4.1",
  "motivo": "Performance, DX, Purge automático",
  "bundle_size": "<10KB"
}
```

---

### Radix UI
**Component library (headless)**

```json
{
  "base": "Radix UI",
  "styled_with": "Tailwind CSS",
  "customizável": "100%"
}
```

**Componentes principais**:
- Button, Input, Select, Textarea
- Dialog, Sheet, Popover, Dropdown
- Table, Card, Tabs, Accordion
- Toast, Alert, Badge, Avatar

---

## 🎨 Design System

### Dark Glass Medical
**Design System neumórfico 3D profissional**

```json
{
  "estilo": "Neumorphism 3D",
  "tema_padrão": "Dark mode",
  "acessibilidade": "WCAG 2.1 AA",
  "responsivo": "Mobile-first"
}
```

**Paleta de Cores Dark Mode**:
```css
--background: #0B0D16       /* Fundo principal */
--card: #15192B             /* Cards e containers */
--card-elevated: #1A1F35    /* Elementos elevados */
--primary: #6366F1          /* Indigo - Ações principais */
--success: #10B981          /* Verde - Sucesso */
--warning: #F59E0B          /* Âmbar - Avisos */
--danger: #EF4444           /* Vermelho - Erros */
--text-primary: #FFFFFF     /* Texto principal */
--text-secondary: #94A3B8   /* Texto secundário */
```

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
  "edge_functions": "Deno"
}
```

**Features usadas**:
- Database PostgreSQL 15 com RLS
- Auth (Email/Password, OAuth)
- Realtime WebSocket subscriptions
- Storage S3-compatible
- Row Level Security (RLS) multi-tenant

---

## 🧠 IA & ML

### Anthropic Claude
**Large Language Model principal**

```json
{
  "model": "claude-sonnet",
  "context_window": "200K tokens",
  "features": [
    "Function calling",
    "Vision (images)",
    "Streaming"
  ]
}
```

**Uso no ICARUS (IcarusBrain)**:
- Previsão de demanda
- Score inadimplência
- Recomendação produtos
- Assistente virtual (ChatWidget)
- Análise sentimento
- Detecção anomalias

---

## 🚀 Deploy & DevOps

### Vercel
**Hosting & CI/CD**

```json
{
  "features": [
    "Edge Functions",
    "Analytics",
    "Image Optimization",
    "DDoS protection",
    "Auto SSL"
  ],
  "regions": "Global CDN"
}
```

### GitHub Actions
**CI/CD Pipeline**

- Lint e Type Check automáticos
- Build de produção
- Deploy automático para Vercel

---

## 📊 Outras Dependências

### UI/UX
```json
{
  "lucide-react": "Ícones (tree-shakeable)",
  "radix-ui": "Headless components",
  "clsx": "Conditional classes",
  "tailwind-merge": "Merge Tailwind classes"
}
```

### Animações
```json
{
  "motion": "Framer Motion 12.x - Animações declarativas"
}
```

### Charts
```json
{
  "recharts": "Charts declarativos 3.x"
}
```

### Utils
```json
{
  "date-fns": "Date manipulation",
  "zod": "Schema validation",
  "react-hook-form": "Form management",
  "@tanstack/react-query": "Data fetching & caching"
}
```

---

## 📊 Resumo do Stack

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| Frontend | React | 18.3.1 |
| Linguagem | TypeScript | 5.8 |
| Build | Vite | 6.3 |
| Styling | Tailwind CSS | 4.1 |
| UI Components | Radix UI | Latest |
| Design System | Dark Glass Medical | - |
| Icons | Lucide React | Latest |
| Animations | Motion | 12.x |
| Charts | Recharts | 3.x |
| Database | Supabase PostgreSQL | 15 |
| IA | Claude (Anthropic) | Sonnet |
| Deploy | Vercel | - |
| CI/CD | GitHub Actions | - |

---

**ICARUS v5.0** - Stack moderno, performático e production-ready ⚙️
