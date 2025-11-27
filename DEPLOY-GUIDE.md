# 🚀 Guia de Deploy - ICARUS v5.0

Este guia detalha o processo completo de deploy do ICARUS v5.0 para Vercel (frontend) e Supabase (backend).

---

## 📋 Pré-requisitos

### Contas Necessárias
- ✅ Conta Vercel (https://vercel.com)
- ✅ Conta Supabase (https://supabase.com)
- ✅ Conta GitHub (repositório conectado)

### Ferramentas
- ✅ Node.js 20.x ou superior
- ✅ pnpm 9.x
- ✅ Supabase CLI
- ✅ Vercel CLI (opcional)

---

## 🔧 PARTE 1: Configuração do Supabase

### 1.1 Criar Projeto no Supabase

```bash
# Fazer login
supabase login

# Criar novo projeto (via Dashboard ou CLI)
# Dashboard: https://supabase.com/dashboard
# Nome: icarus-v5
# Região: São Paulo (South America)
# Database Password: [gerar senha forte]
```

### 1.2 Obter Credenciais

No Supabase Dashboard:
1. Acesse seu projeto
2. Settings → API
3. Copie:
   - `Project URL` (VITE_SUPABASE_URL)
   - `anon/public key` (VITE_SUPABASE_ANON_KEY)

### 1.3 Deploy de Migrations

```bash
# Vincular projeto local ao Supabase
supabase link --project-ref [SEU_PROJECT_REF]

# Verificar migrations pendentes
supabase db diff

# Aplicar migrations
supabase db push

# Verificar status
supabase db status
```

### 1.4 Deploy de Edge Functions

```bash
# Deploy de todas as functions
supabase functions deploy

# Ou deploy individual
supabase functions deploy icarus-brain
supabase functions deploy langchain-agent
supabase functions deploy anvisa-validar
supabase functions deploy cfm-validar
```

### 1.5 Configurar Secrets

```bash
# Adicionar secrets para Edge Functions
supabase secrets set OPENAI_API_KEY=sk-...
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set INFOSIMPLES_API_KEY=...

# Verificar secrets
supabase secrets list
```

### 1.6 Habilitar Row Level Security (RLS)

No Supabase Dashboard → Authentication → Policies:
- Verificar se RLS está ativo em todas as tabelas
- Configurar policies conforme necessário

---

## ☁️ PARTE 2: Deploy no Vercel

### 2.1 Conectar Repositório GitHub

1. Acesse https://vercel.com/dashboard
2. Clique em "Add New Project"
3. Import Git Repository
4. Selecione o repositório `icarus-v5`
5. Configure o projeto:

```yaml
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
```

### 2.2 Configurar Environment Variables

No Vercel Dashboard → Settings → Environment Variables:

```env
# Supabase
VITE_SUPABASE_URL=https://[SEU_PROJECT].supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...

# APIs (opcional)
VITE_ANTHROPIC_API_KEY=sk-ant-...
VITE_OPENAI_API_KEY=sk-...

# Configuração
NODE_ENV=production
```

### 2.3 Deploy Automático

```bash
# Push para main branch
git push origin main

# Vercel detecta automaticamente e faz deploy
# Acompanhe em: https://vercel.com/dashboard
```

### 2.4 Deploy Manual (Alternativo)

```bash
# Instalar Vercel CLI
pnpm add -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Seguir prompts interativos
```

### 2.5 Configurar Domínio Customizado

No Vercel Dashboard → Settings → Domains:
1. Adicionar domínio customizado (ex: icarus.seudominio.com.br)
2. Configurar DNS conforme instruções
3. Aguardar propagação (até 48h)

---

## 🔐 PARTE 3: Segurança e Secrets

### 3.1 GitHub Secrets

Configure no GitHub → Settings → Secrets and variables → Actions:

```yaml
# Vercel
VERCEL_TOKEN: [obter em vercel.com/account/tokens]
VERCEL_ORG_ID: [obter em vercel.com/[org]/settings]
VERCEL_PROJECT_ID: [obter no project settings]

# Supabase
SUPABASE_ACCESS_TOKEN: [obter em supabase.com/dashboard/account/tokens]
SUPABASE_PROJECT_REF: [project reference]

# APIs
ANTHROPIC_API_KEY: sk-ant-...
OPENAI_API_KEY: sk-...
INFOSIMPLES_API_KEY: ...
```

### 3.2 Proteção de Branches

Configure no GitHub:
1. Settings → Branches
2. Add branch protection rule para `main`
3. Habilitar:
   - Require status checks (CI/CD)
   - Require pull request reviews
   - Require linear history

---

## 🧪 PARTE 4: Testes E2E

### 4.1 Executar Localmente

```bash
# Instalar Playwright
pnpm exec playwright install

# Executar testes
pnpm test:e2e

# Ver relatório
pnpm exec playwright show-report
```

### 4.2 CI/CD com GitHub Actions

O arquivo `.github/workflows/deploy.yml` já está configurado para:
- ✅ Executar testes em PRs
- ✅ Fazer deploy automático em push para main
- ✅ Gerar relatórios de teste

---

## 📊 PARTE 5: Monitoramento

### 5.1 Vercel Analytics

Habilitado automaticamente:
- Real User Monitoring (RUM)
- Web Vitals
- Audience insights

### 5.2 Supabase Logs

Acesse no Dashboard:
- Database → Logs
- Edge Functions → Logs
- Auth → Logs

### 5.3 Sentry (Opcional)

```bash
pnpm add @sentry/react @sentry/vite-plugin

# Configurar em src/main.tsx
```

---

## 🔄 PARTE 6: Rollback e Updates

### 6.1 Rollback no Vercel

```bash
# Via Dashboard
1. Acessar Deployments
2. Selecionar versão anterior
3. Clicar em "Promote to Production"

# Via CLI
vercel rollback [deployment-url]
```

### 6.2 Rollback Supabase Migrations

```bash
# Criar migration de rollback
supabase migration new rollback_[nome]

# Reverter mudanças no arquivo SQL
# Aplicar
supabase db push
```

---

## ✅ Checklist de Deploy

### Pré-Deploy
- [ ] Todos os testes passando (`pnpm test`)
- [ ] Type-check sem erros (`pnpm type-check`)
- [ ] Lint sem warnings (`pnpm lint`)
- [ ] Build bem-sucedido (`pnpm build`)
- [ ] Testes E2E passando (`pnpm test:e2e`)

### Supabase
- [ ] Projeto criado
- [ ] Migrations aplicadas
- [ ] Edge Functions deployed
- [ ] Secrets configurados
- [ ] RLS ativado
- [ ] Policies configuradas

### Vercel
- [ ] Repositório conectado
- [ ] Environment variables configuradas
- [ ] Domínio customizado (opcional)
- [ ] Deploy bem-sucedido
- [ ] Preview URLs funcionando

### Segurança
- [ ] GitHub Secrets configurados
- [ ] Branch protection ativo
- [ ] HTTPS habilitado
- [ ] Headers de segurança configurados

### Monitoramento
- [ ] Vercel Analytics ativo
- [ ] Supabase Logs configurados
- [ ] Alertas configurados (opcional)

---

## 🆘 Troubleshooting

### Build Fails no Vercel

```bash
# Verificar localmente
pnpm build

# Verificar logs no Vercel Dashboard
# Verificar environment variables
```

### Edge Functions Não Funcionam

```bash
# Verificar logs
supabase functions logs icarus-brain

# Verificar secrets
supabase secrets list

# Re-deploy
supabase functions deploy icarus-brain --no-verify-jwt
```

### Database Connection Issues

```bash
# Verificar connection string
supabase db status

# Verificar RLS policies
# Verificar se anon key está correta
```

---

## 📞 Suporte

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **GitHub Actions:** https://docs.github.com/actions

---

## 🎯 URLs Úteis

### Produção
- **Frontend:** https://icarus-v5.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/[ref]
- **Vercel Dashboard:** https://vercel.com/dashboard

### Desenvolvimento
- **Local:** http://localhost:5173
- **Supabase Local:** http://localhost:54321

---

**Última Atualização:** 27/11/2025  
**Versão:** 5.0.0  
**Status:** ✅ Pronto para Produção

