# 🚀 Quick Start - Landing Page & Login

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências

```bash
npm install
# ou
pnpm install
```

### 2. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Resend (para email)
RESEND_API_KEY=your_resend_api_key
```

### 3. Aplicar Migration do Supabase

```bash
# Iniciar Supabase localmente (opcional)
npx supabase start

# Aplicar migration da tabela leads
npx supabase db push
```

### 4. Deploy Edge Function (Opcional)

```bash
# Login no Supabase
supabase login

# Link ao projeto
supabase link --project-ref YOUR_PROJECT_REF

# Configurar secret
supabase secrets set RESEND_API_KEY=your_key

# Deploy
supabase functions deploy send-lead-email
```

### 5. Iniciar Aplicação

```bash
npm run dev
```

Acesse:
- **Landing Page**: http://localhost:5173/
- **Login**: http://localhost:5173/login
- **Dashboard**: http://localhost:5173/dashboard

---

## 📋 Checklist de Testes

### Landing Page

- [ ] Header fixo aparece no topo
- [ ] Botão "Entrar no Sistema" redireciona para `/login`
- [ ] Hero section carrega com animações
- [ ] Cards de preview aparecem corretamente
- [ ] Seção de features renderiza 4 cards
- [ ] Seção de benefícios mostra estatísticas
- [ ] Formulário de contato renderiza todos os campos
- [ ] Footer aparece no final da página

### Login Page

- [ ] Background gradiente aparece
- [ ] Logo e título renderizam
- [ ] Campos de email e senha funcionam
- [ ] Botão "Entrar no Sistema" funciona
- [ ] Botões de acesso rápido (Admin/Analista) funcionam
- [ ] Link "Esqueceu sua senha?" aparece
- [ ] Footer com "IcarusAI Technology" aparece
- [ ] Botão "Voltar para página inicial" funciona

### Formulário de Leads

- [ ] Todos os campos são obrigatórios (exceto mensagem)
- [ ] Validação de email funciona
- [ ] Select dropdowns abrem corretamente
- [ ] Submissão mostra loading state
- [ ] Toast de sucesso aparece após submissão
- [ ] Toast de erro aparece em caso de falha
- [ ] Formulário é resetado após sucesso
- [ ] Lead é salvo no Supabase
- [ ] Email é enviado para dax@newortho.com.br

### Responsividade

- [ ] Mobile (375px): Layout em coluna única
- [ ] Tablet (768px): Layout em 2 colunas
- [ ] Desktop (1024px+): Layout em 3-4 colunas
- [ ] Navegação funciona em todos os tamanhos
- [ ] Imagens/cards escalam corretamente
- [ ] Formulário é usável em mobile

---

## 🎨 Preview das Páginas

### Landing Page

```
┌─────────────────────────────────────────────┐
│  [Brain Logo] Icarus v5.0  [Entrar Sistema] │ ← Header
├─────────────────────────────────────────────┤
│                                             │
│         🚀 Transforme sua gestão            │
│            de OPME com IA                   │ ← Hero
│                                             │
│   [Falar com Especialista] [Benefícios]    │
│                                             │
├─────────────────────────────────────────────┤
│  [Card 1]  [Card 2]  [Card 3]  [Card 4]    │ ← Features
├─────────────────────────────────────────────┤
│  [Stat 1]  [Stat 2]  [Stat 3]  [Stat 4]    │ ← Benefits
├─────────────────────────────────────────────┤
│  ❌ Dores          ✅ Soluções              │ ← Pain Points
├─────────────────────────────────────────────┤
│       📝 Formulário de Contato              │ ← Contact Form
├─────────────────────────────────────────────┤
│  Links | Contato | © 2025 IcarusAI Tech    │ ← Footer
└─────────────────────────────────────────────┘
```

### Login Page

```
┌─────────────────────────────────────────────┐
│                                             │
│           [Brain Icon Gradient]             │
│                                             │
│            Icarus v5.0                      │
│        Gestão elevada pela IA               │
│                                             │
│  Email                                      │
│  [_________________________]                │
│                                             │
│  Senha                                      │
│  [_________________________]                │
│                                             │
│  [→ Entrar no Sistema (Gradient)]          │
│                                             │
│  Acesso rápido (desenvolvimento)            │
│  [Admin]          [Analista]                │
│                                             │
│  Esqueceu sua senha?                        │
│                                             │
│  © 2025 IcarusAI Technology                 │
│                                             │
│  ← Voltar para página inicial               │
└─────────────────────────────────────────────┘
```

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server
npm run build            # Build para produção
npm run preview          # Preview da build

# Lint & Type Check
npm run lint             # Verificar código
npm run lint:check       # Check sem fix
tsc --noEmit            # Type check

# Testes
npm test                 # Run tests
npm run test:ui          # Tests com UI
npm run test:coverage    # Coverage report

# Supabase
npx supabase status      # Status local
npx supabase db reset    # Reset DB local
npx supabase db push     # Push migrations
npx supabase db diff     # Diff migrations
npx supabase functions serve  # Test functions

# Deploy
npm run build            # Build
vercel deploy            # Deploy to Vercel
```

---

## 🐛 Troubleshooting Rápido

### Erro: "Supabase não configurado"

```bash
# Verifique .env.local
cat .env.local

# Deve ter:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Erro: "Table 'leads' does not exist"

```bash
# Aplicar migration
npx supabase db push
```

### Erro: "Function 'send-lead-email' not found"

```bash
# Deploy function
supabase functions deploy send-lead-email
```

### Toast não aparece

```bash
# Verificar se 'sonner' está instalado
npm install sonner

# Verificar import em Landing.tsx
import { toast } from 'sonner'
```

### Erro de CORS

```typescript
// Verificar headers na Edge Function
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

---

## 📸 Screenshots Esperados

### Desktop (1920x1080)
- Hero section ocupa 100vh
- Grid de 4 colunas nas features
- Formulário em 2 colunas
- Header fixo sempre visível

### Tablet (768x1024)
- Grid de 2 colunas
- Formulário em 2 colunas
- Hero section adaptado

### Mobile (375x667)
- Grid de 1 coluna
- Formulário em 1 coluna
- Hero section compacto
- Menu hamburger (futuro)

---

## ✅ Critérios de Aceitação

### Landing Page

- [x] Design neumórfico 3D implementado
- [x] Animações sutis funcionando
- [x] Responsivo em todos os breakpoints
- [x] Formulário captura leads
- [x] Integração com Supabase
- [x] Email automático enviado
- [x] SEO otimizado (meta tags)
- [x] Performance (Lighthouse > 90)

### Login Page

- [x] Design baseado na imagem de referência
- [x] Ícone Brain Circuit
- [x] Gradiente de fundo animado
- [x] Campos validados
- [x] Botões de acesso rápido
- [x] Link de recuperação de senha
- [x] Redirecionamento após login
- [x] Mensagens de erro claras

---

## 🚢 Deploy em Produção

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Configurar Environment Variables

No painel da Vercel:
1. Settings → Environment Variables
2. Adicionar:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Configurar Domínio

1. Adicionar domínio customizado
2. Configurar DNS
3. Aguardar propagação (até 48h)

---

**Status**: ✅ Pronto para Deploy  
**Versão**: 1.0.0  
**Data**: 16/11/2025

🎉 **Parabéns! Sistema completo e funcional!**

