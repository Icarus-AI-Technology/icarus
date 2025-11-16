# 🔧 Troubleshooting - ICARUS v5.0

Guia completo para resolver problemas comuns.

---

## 📋 Índice

1. [Instalação](#instalação)
2. [Supabase](#supabase)
3. [IA (IcarusBrain)](#ia-icarusbrain)
4. [Build & Deploy](#build--deploy)
5. [Performance](#performance)
6. [UI/UX](#uiux)
7. [TypeScript](#typescript)

---

## 🏗️ Instalação

### `npm install` falha com erro EACCES

**Problema**: Permissões incorretas no diretório npm global

**Solução**:
```bash
# Opção 1: Mudar owner (macOS/Linux)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Opção 2: Configurar prefix local
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Tentar novamente
npm install
```

---

### Dependências desatualizadas

**Problema**: Warnings sobre dependências desatualizadas

**Solução**:
```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar minor/patch (seguro)
npm update

# Atualizar major (cuidado!)
npx npm-check-updates -u
npm install

# Se quebrar, reverter
git checkout package.json package-lock.json
npm install
```

---

### `node-gyp` erros no Windows

**Problema**: Erros de compilação de dependências nativas

**Solução**:
```bash
# Instalar build tools
npm install --global windows-build-tools

# Ou manualmente:
# 1. Instalar Visual Studio Build Tools
# 2. Instalar Python 2.7
# 3. npm config set python python2.7
# 4. npm config set msvs_version 2019

# Tentar novamente
npm install
```

---

## 🗄️ Supabase

### Erro 401: Unauthorized

**Problema**: Credenciais Supabase incorretas

**Diagnóstico**:
```bash
# Verificar .env.local
cat .env.local

# Deve ter:
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

**Solução**:
```bash
# 1. Pegar credenciais corretas
# Dashboard Supabase → Settings → API

# 2. Atualizar .env.local
nano .env.local

# 3. Restart dev server
npm run dev
```

---

### Erro: relation "produtos" does not exist

**Problema**: Schema não foi executado

**Solução**:
```bash
# 1. Ir para Supabase SQL Editor
# 2. Executar schema completo (docs/10-QUICK-START.md)
# 3. Verificar sucesso:
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

# Deve listar: produtos, clientes, cirurgias, estoque
```

---

### Row Level Security bloqueia queries

**Problema**: RLS muito restritivo

**Diagnóstico**:
```sql
-- Verificar políticas
SELECT * FROM pg_policies WHERE tablename = 'produtos';
```

**Solução temporária (dev)**:
```sql
-- Desabilitar RLS (APENAS DEV!)
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;

-- Em produção, ajustar políticas
DROP POLICY "nome_politica" ON produtos;
CREATE POLICY "nova_politica" ON produtos
  FOR SELECT USING (true);  -- Ajustar condição
```

---

### Realtime não funciona

**Problema**: Subscriptions não recebem eventos

**Diagnóstico**:
```tsx
useEffect(() => {
  const channel = supabase
    .channel('test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'produtos'
    }, (payload) => {
      console.log('REALTIME:', payload)  // Não aparece
    })
    .subscribe((status) => {
      console.log('STATUS:', status)  // Ver status
    })

  return () => supabase.removeChannel(channel)
}, [])
```

**Solução**:
```bash
# 1. Verificar Realtime habilitado
# Dashboard Supabase → Database → Replication
# Habilitar para tabelas necessárias

# 2. Verificar RLS
# Policies devem permitir SELECT

# 3. Verificar browser console
# Erros de WebSocket?

# 4. Testar conexão
# Dashboard → API → Realtime Inspector
```

---

## 🧠 IA (IcarusBrain)

### IA não responde (erro 401)

**Problema**: API key inválida ou ausente

**Solução**:
```bash
# 1. Verificar .env.local
cat .env.local | grep ANTHROPIC

# 2. Pegar key correta
# https://console.anthropic.com/account/keys

# 3. Testar key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $VITE_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-sonnet-4.5-20250929",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hi"}]
  }'

# Deve retornar: {"id":"msg_...","content":[...]}

# 4. Restart dev server
npm run dev
```

---

### IA muito lenta (>30s)

**Problema**: Modelo muito grande ou internet lenta

**Solução**:
```tsx
// 1. Usar modelo menor
const { chat } = useIcarusBrain({
  model: 'claude-3-haiku-20240307'  // Mais rápido
})

// 2. Reduzir max_tokens
const response = await chat('pergunta', {
  max_tokens: 500  // vs 4096 padrão
})

// 3. Implementar timeout
const response = await Promise.race([
  chat('pergunta'),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout')), 10000)
  )
])

// 4. Mostrar loading
const [loading, setLoading] = useState(false)
setLoading(true)
const response = await chat('pergunta')
setLoading(false)
```

---

### Erro: Rate limit exceeded

**Problema**: Muitas requisições à API

**Solução**:
```tsx
// 1. Implementar debounce
import { useDebouncedCallback } from 'use-debounce'

const debouncedPredict = useDebouncedCallback(
  async (data) => {
    const result = await predict('demanda', data)
    // ...
  },
  1000  // 1s delay
)

// 2. Cache de respostas
const cache = new Map()

async function cachedPredict(key, data) {
  if (cache.has(key)) {
    return cache.get(key)
  }

  const result = await predict('demanda', data)
  cache.set(key, result)
  return result
}

// 3. Retry com backoff
async function retryPredict(data, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await predict('demanda', data)
    } catch (err) {
      if (err.message.includes('rate limit') && i < retries - 1) {
        await sleep(2 ** i * 1000)  // 1s, 2s, 4s
        continue
      }
      throw err
    }
  }
}
```

---

## 🏗️ Build & Deploy

### `npm run build` falha com erro TypeScript

**Problema**: Erros de tipo

**Diagnóstico**:
```bash
# Ver todos os erros
npm run type-check
```

**Solução**:
```bash
# 1. Corrigir erros reportados

# 2. Se não conseguir, temporariamente:
# tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true,
    "noUnusedLocals": false,  // Temporário
    "noUnusedParameters": false  // Temporário
  }
}

# 3. Build
npm run build

# 4. Reverter tsconfig depois!
```

---

### Build sucesso mas app quebrado em produção

**Problema**: Env vars não definidas

**Solução**:
```bash
# Vercel: Settings → Environment Variables
# Adicionar TODAS as vars de .env.local:
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ANTHROPIC_API_KEY=sk-ant-...

# Redeploy
vercel --prod --force
```

---

### Erro: Cannot find module '@/...'

**Problema**: Path alias não configurado

**Solução**:
```typescript
// vite.config.ts
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})

// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

---

## ⚡ Performance

### Lighthouse score baixo (<90)

**Problema**: Bundle muito grande ou assets não otimizados

**Diagnóstico**:
```bash
# 1. Analisar bundle
npm run build
npx vite-bundle-visualizer

# 2. Lighthouse CI
npx lighthouse http://localhost:5173 --view
```

**Solução**:
```tsx
// 1. Lazy load rotas
const Cirurgias = lazy(() => import('./components/modules/Cirurgias'))
const Estoque = lazy(() => import('./components/modules/Estoque'))

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/cirurgias" element={<Cirurgias />} />
    <Route path="/estoque" element={<Estoque />} />
  </Routes>
</Suspense>

// 2. Otimizar imagens
// - Usar WebP
// - Comprimir com imagemin
// - Lazy load: loading="lazy"

// 3. Code splitting
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-tabs'],
        },
      },
    },
  },
})
```

---

### App lento em produção

**Problema**: Re-renders desnecessários

**Diagnóstico**:
```tsx
// React DevTools Profiler
// 1. Abrir DevTools → Profiler
// 2. Gravar interação
// 3. Ver componentes que re-renderizam muito
```

**Solução**:
```tsx
// 1. Memoizar componentes pesados
const HeavyComponent = memo(({ data }) => {
  // ...
})

// 2. useCallback para funções
const handleClick = useCallback(() => {
  // ...
}, [deps])

// 3. useMemo para cálculos pesados
const expensiveValue = useMemo(() => {
  return heavyCalculation(data)
}, [data])

// 4. Virtualizar listas longas
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: 10000,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 35,
})
```

---

## 🎨 UI/UX

### Componente shadcn/ui não renderiza

**Problema**: Importação incorreta ou CSS ausente

**Diagnóstico**:
```tsx
// Verificar import
import { Button } from '@/components/ui/button'  // ✅
import { Button } from '@/components/ui/Button'  // ❌ (case-sensitive)

// Verificar se existe
ls src/components/ui/button.tsx
```

**Solução**:
```bash
# 1. Reinstalar componente
npx shadcn-ui@latest add button

# 2. Verificar globals.css importado
# src/main.tsx
import './styles/globals.css'  // ✅

# 3. Verificar Tailwind config
# tailwind.config.js deve ter:
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
```

---

### Dark mode não funciona

**Problema**: Provider ausente ou classes incorretas

**Solução**:
```tsx
// 1. Verificar ThemeProvider
// src/main.tsx
import { ThemeProvider } from '@/components/theme-provider'

createRoot(document.getElementById('root')!).render(
  <ThemeProvider defaultTheme="system" storageKey="icarus-theme">
    <App />
  </ThemeProvider>
)

// 2. Usar classes corretas
<div className="bg-background text-foreground">  // ✅
  {/* Funciona em light e dark */}
</div>

<div className="bg-white text-black">  // ❌
  {/* Só light mode */}
</div>

// 3. Verificar CSS variables
// globals.css deve ter:
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

---

### Grid quebra em mobile

**Problema**: Grid não responsivo

**Solução**:
```tsx
// ❌ ERRADO
<div className="grid grid-cols-3">
  {/* Quebra em mobile (3 cols muito estreitas) */}
</div>

// ✅ CORRETO
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 3 cols desktop, 2 tablet, 1 mobile */}
</div>

// Para 4 cols (KPIs)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* 4 cols desktop, 2 tablet, 1 mobile */}
</div>
```

---

## 📘 TypeScript

### Erro: Property 'X' does not exist on type 'Y'

**Problema**: Tipo incorreto ou ausente

**Solução**:
```tsx
// 1. Definir interface
interface Produto {
  id: string
  nome: string
  preco: number
}

const produto: Produto = {
  id: '123',
  nome: 'Produto X',
  preco: 100
}

// 2. Usar type assertion (último recurso)
const produto = data as Produto

// 3. Verificar tipo do Supabase
// lib/supabase/types.ts (auto-gerado)
export type Produto = Database['public']['Tables']['produtos']['Row']
```

---

### Erro: Cannot find name 'X'

**Problema**: Import ausente

**Solução**:
```tsx
// ❌ ERRADO
const data = useQuery(...)  // useQuery is not defined

// ✅ CORRETO
import { useQuery } from '@tanstack/react-query'
const data = useQuery(...)

// Atalho VSCode: Ctrl+Space para auto-import
```

---

### Muitos erros `any` implícito

**Solução**:
```typescript
// Temporariamente desabilitar (não recomendado)
// tsconfig.json
{
  "compilerOptions": {
    "noImplicitAny": false
  }
}

// Melhor: Adicionar tipos
// ❌ ANTES
function calcular(valor) {  // valor: any
  return valor * 2
}

// ✅ DEPOIS
function calcular(valor: number): number {
  return valor * 2
}
```

---

## 🆘 Ainda Com Problemas?

### 1. Buscar nos Issues

https://github.com/Icarus-AI-Technology/icarus/issues

### 2. Criar Novo Issue

```markdown
**Problema**: [Descrição breve]

**Ambiente**:
- OS: [Windows 11 / macOS 14 / Ubuntu 22.04]
- Node: [20.10.0]
- npm: [10.2.3]
- Browser: [Chrome 120]

**Passos para reproduzir**:
1.
2.
3.

**Comportamento esperado**:
[O que deveria acontecer]

**Comportamento atual**:
[O que está acontecendo]

**Logs/Erros**:
```
[Cole aqui]
```

**Screenshots** (se aplicável):
[Anexe aqui]
```

### 3. Discord Community

https://discord.gg/icarus-ai

### 4. Email Suporte

suporte@icarus.ai

---

**✅ 99% dos problemas resolvidos com este guia!**

Se encontrou um problema não listado, por favor abra um issue para ajudar outros desenvolvedores. 🙏
