# Frontend Audit Checklist

> **Area:** Frontend (React, TypeScript, UI/UX)
> **Peso:** 12%
> **Itens:** ~50

---

## 1. TypeScript Configuration

### 1.1 Strict Mode
- [ ] `strict: true` em tsconfig.json
- [ ] `noImplicitAny: true`
- [ ] `strictNullChecks: true`
- [ ] `strictFunctionTypes: true`
- [ ] `strictPropertyInitialization: true`

**Verificacao:**
```bash
# Verificar tsconfig.json
cat tsconfig.json | grep -E "(strict|noImplicitAny|strictNullChecks)"
```

### 1.2 Any Types
- [ ] Nenhum uso de `: any` no codigo
- [ ] Nenhum uso de `as any`
- [ ] Nenhum `@ts-ignore` desnecessario

**Verificacao:**
```bash
# Contar usos de 'any'
grep -r ": any" src/ --include="*.ts" --include="*.tsx" | wc -l

# Listar arquivos com 'any'
grep -rn ": any" src/ --include="*.ts" --include="*.tsx"
```

**Severidade:** HIGH (cada uso de any = -2 pontos)

---

## 2. React Best Practices

### 2.1 Hooks
- [ ] Hooks seguem regras (nao em condicionais)
- [ ] useEffect com dependencies corretas
- [ ] useMemo/useCallback quando necessario
- [ ] Custom hooks bem estruturados

### 2.2 Components
- [ ] Componentes funcionais (nao classes)
- [ ] Props tipadas corretamente
- [ ] Destructuring de props
- [ ] Keys unicas em listas

### 2.3 State Management
- [ ] Estado local quando possivel
- [ ] Context para estado global
- [ ] Nao prop drilling excessivo
- [ ] React Query para server state

**Verificacao:**
```bash
# Verificar componentes classe
grep -r "extends Component" src/ --include="*.tsx" | wc -l

# Verificar hooks rules
npx eslint src/ --rule 'react-hooks/rules-of-hooks: error'
```

---

## 3. Error Handling

### 3.1 Error Boundaries
- [ ] Error boundary no root
- [ ] Error boundaries em rotas criticas
- [ ] Fallback UI definido

### 3.2 Loading States
- [ ] Loading state em todas as paginas
- [ ] Skeleton loaders implementados
- [ ] Suspense boundaries configurados

### 3.3 Error States
- [ ] Tratamento de erros de API
- [ ] Mensagens de erro amigaveis
- [ ] Retry logic implementado

**Verificacao:**
```bash
# Verificar Error Boundaries
grep -r "ErrorBoundary" src/ --include="*.tsx" | wc -l
```

**Severidade:** MEDIUM (falta de error boundary = -5 pontos)

---

## 4. Design System (Dark Glass Medical)

### 4.1 Components
- [ ] Usando componentes do Design System
- [ ] Nao duplicando componentes base
- [ ] Props consistentes

### 4.2 Styling
- [ ] Classes neu-* aplicadas
- [ ] Tailwind CSS padronizado
- [ ] Nao inline styles
- [ ] CSS modules quando necessario

### 4.3 Themes
- [ ] Dark/Light mode funcionando
- [ ] Cores do tema aplicadas
- [ ] Tokens de design utilizados

**Verificacao:**
```bash
# Verificar uso de componentes UI
grep -r "from '@/components/ui'" src/ --include="*.tsx" | wc -l

# Verificar inline styles
grep -r "style={{" src/ --include="*.tsx" | wc -l
```

---

## 5. Forms e Validation

### 5.1 React Hook Form
- [ ] Forms usando react-hook-form
- [ ] Validacao com Zod schema
- [ ] Error messages exibidas
- [ ] Acessibilidade em forms

### 5.2 Inputs
- [ ] Labels associados
- [ ] Placeholders informativos
- [ ] Estados de erro visuais
- [ ] Mensagens de validacao

**Verificacao:**
```bash
# Verificar uso de react-hook-form
grep -r "useForm" src/ --include="*.tsx" | wc -l

# Verificar validacao Zod
grep -r "zodResolver" src/ --include="*.tsx" | wc -l
```

---

## 6. Routing

### 6.1 React Router
- [ ] Rotas tipadas
- [ ] Lazy loading de rotas
- [ ] Protected routes funcionando
- [ ] 404 page implementada

### 6.2 Navigation
- [ ] Links usando <Link>
- [ ] Navigate programatico correto
- [ ] History state preservado

**Verificacao:**
```bash
# Verificar lazy loading
grep -r "React.lazy" src/ --include="*.tsx" | wc -l

# Verificar protected routes
grep -r "ProtectedRoute" src/ --include="*.tsx" | wc -l
```

---

## 7. Accessibility (WCAG 2.1)

### 7.1 Basic
- [ ] Alt text em imagens
- [ ] Labels em inputs
- [ ] Heading hierarchy correto
- [ ] Color contrast adequado

### 7.2 Keyboard Navigation
- [ ] Tab order logico
- [ ] Focus visible
- [ ] Skip links
- [ ] Escape fecha modals

### 7.3 ARIA
- [ ] aria-label quando necessario
- [ ] aria-describedby para forms
- [ ] role attributes corretos
- [ ] Live regions para updates

**Verificacao:**
```bash
# Verificar imagens sem alt
grep -r "<img" src/ --include="*.tsx" | grep -v "alt=" | wc -l

# Verificar aria attributes
grep -r "aria-" src/ --include="*.tsx" | wc -l
```

**Severidade:** MEDIUM (cada violacao a11y = -3 pontos)

---

## 8. Performance

### 8.1 Bundle Size
- [ ] Bundle < 500KB (gzipped)
- [ ] Code splitting implementado
- [ ] Tree shaking funcionando
- [ ] Dependencies otimizadas

### 8.2 Rendering
- [ ] Memo em componentes pesados
- [ ] useCallback para handlers
- [ ] useMemo para calculos
- [ ] Virtualizacao em listas longas

### 8.3 Assets
- [ ] Imagens otimizadas
- [ ] Lazy loading de imagens
- [ ] Fontes otimizadas
- [ ] SVG inline quando pequeno

**Verificacao:**
```bash
# Verificar bundle size
npm run build && du -sh dist/

# Verificar React.memo
grep -r "React.memo" src/ --include="*.tsx" | wc -l
```

---

## 9. Testing

### 9.1 Unit Tests
- [ ] Componentes testados
- [ ] Hooks testados
- [ ] Utils testadas
- [ ] Coverage > 65%

### 9.2 Integration Tests
- [ ] Fluxos criticos testados
- [ ] Forms testados
- [ ] Mocks corretos

**Verificacao:**
```bash
# Verificar coverage
npm run test:coverage

# Contar arquivos de teste
find src/ -name "*.test.tsx" -o -name "*.spec.tsx" | wc -l
```

**Severidade:** LOW (coverage < 65% = -5 pontos)

---

## 10. Dependencies

### 10.1 Security
- [ ] Sem vulnerabilidades criticas
- [ ] npm audit limpo
- [ ] Dependencies atualizadas

### 10.2 Management
- [ ] Package-lock.json commitado
- [ ] Sem dependencies nao utilizadas
- [ ] Versoes fixas (nao ^)

**Verificacao:**
```bash
# Verificar vulnerabilidades
npm audit

# Verificar dependencies nao utilizadas
npx depcheck
```

---

## Calculo de Score

```typescript
const frontendChecks = {
  typescript: { weight: 20, checks: ['strict', 'noAny'] },
  react: { weight: 20, checks: ['hooks', 'components', 'state'] },
  errorHandling: { weight: 15, checks: ['boundaries', 'loading', 'errors'] },
  designSystem: { weight: 15, checks: ['components', 'styling', 'themes'] },
  forms: { weight: 10, checks: ['rhf', 'zod', 'a11y'] },
  accessibility: { weight: 10, checks: ['basic', 'keyboard', 'aria'] },
  performance: { weight: 5, checks: ['bundle', 'rendering', 'assets'] },
  testing: { weight: 5, checks: ['unit', 'integration', 'coverage'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria completa de frontend
@auditor frontend

# Verificacoes especificas
npm run type-check      # TypeScript
npm run lint           # ESLint
npm run test:coverage  # Cobertura
npm run build          # Build
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
