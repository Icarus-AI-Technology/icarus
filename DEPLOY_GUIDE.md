# 🚀 ICARUS v5.0 - Deploy Guide (Fase 1)

> Guia completo para deploy do ICARUS v5.0 na Vercel com CI/CD via GitHub Actions

---

## 📋 Pré-requisitos

- ✅ Node.js 20+
- ✅ Conta Vercel
- ✅ Conta Supabase
- ✅ Repositório GitHub

---

## 🔐 1. Configurar GitHub Secrets

Acesse o repositório no GitHub:
```
Settings > Secrets and variables > Actions > New repository secret
```

Adicione os seguintes secrets:

### Vercel

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `VERCEL_TOKEN` | `JlUnvmSIyFGS714BwOmmnBx9` | Token de autenticação da Vercel CLI |
| `VERCEL_ORG_ID` | Extrair de: `vercel.com/teams/invite/awyGqeT2iaXgqvagiKfjlVDGbcJ7XqWp` | ID da organização/team Vercel |
| `VERCEL_PROJECT_ID` | `prj_QBuI1u2PLfKxia3jmkYLe2Z08gx7` | ID do projeto Vercel |

### Supabase

| Secret | Valor | Descrição |
|--------|-------|-----------|
| `VITE_SUPABASE_URL` | `https://oshgkugagyixutiqyjsq.supabase.co` | URL do projeto Supabase |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Chave anônima (public) do Supabase |

---

## 📝 2. Configurar Variáveis de Ambiente na Vercel

Acesse o projeto na Vercel:
```
Project Settings > Environment Variables
```

Adicione as variáveis:

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_SUPABASE_URL` | `https://oshgkugagyixutiqyjsq.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |

**Opcional (FASE 2 - IA Real):**

| Name | Value | Environments |
|------|-------|--------------|
| `VITE_CLAUDE_API_KEY` | `sk-ant-api03-...` | Production |
| `VITE_OPENAI_API_KEY` | `sk-proj-...` | Production |

---

## 🔄 3. Workflow CI/CD (GitHub Actions)

O workflow já está configurado em `.github/workflows/deploy.yml`:

### Pipeline:

```
PR aberto → Lint + Type-check + Test + Build → Deploy Preview
Merge main → Lint + Type-check + Test + Build → Deploy Production
```

### Jobs:

1. **Lint**: ESLint com zero warnings
2. **Type-check**: TypeScript strict mode
3. **Test**: Vitest com coverage
4. **Build**: Vite build otimizado
5. **Deploy**: Vercel CLI deploy

---

## 🏗️ 4. Deploy Manual (Primeira vez)

Se preferir fazer o primeiro deploy manualmente:

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Link do projeto
vercel link

# Deploy preview
vercel

# Deploy production
vercel --prod
```

---

## 📦 5. Estrutura do Projeto

```
icarus-v5.0/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Lint + Type-check
│       ├── deploy.yml             # Deploy Vercel
│       └── supabase-migrations.yml # Migrations
├── supabase/
│   ├── migrations/
│   │   ├── 001_icarus_core_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_seed_data.sql
│   └── schema.sql
├── src/
│   ├── App.tsx                    # ✨ SpeedInsights integrado
│   ├── hooks/useIcarusBrain.ts    # ✨ IA Mock (Fase 1)
│   └── ...
├── .env.example                   # Template de variáveis
├── vercel.json                    # ✨ Config Vercel (SPA + Headers)
└── package.json
```

---

## ✅ 6. Checklist de Deploy

Antes de fazer deploy, verifique:

- [ ] Todos os secrets do GitHub configurados
- [ ] Variáveis de ambiente na Vercel configuradas
- [ ] Build local funcionando (`npm run build`)
- [ ] Testes passando (`npm test`)
- [ ] Lint sem erros (`npm run lint`)
- [ ] Type-check sem erros (`npx tsc --noEmit`)
- [ ] Migrations Supabase aplicadas

---

## 🚦 7. Validar Deploy

Após o deploy, verifique:

### Preview (PR)
- URL: `https://icarus-[branch]-[team].vercel.app`
- Status: GitHub Actions mostrará o link

### Production (Main)
- URL: `https://icarus-nkew7j31a-daxs-projects-5db3d203.vercel.app`
- Status: Green check no commit

### Testes Pós-Deploy:

1. **Performance**:
   - Lighthouse Score > 85
   - Speed Insights ativo
   - Core Web Vitals ok

2. **Funcionalidades**:
   - Dashboard carrega
   - Showcase acessível
   - Supabase conectado
   - IcarusBrain mock funciona

3. **Security**:
   - Headers configurados (X-Frame-Options, CSP)
   - HTTPS forçado
   - RLS ativo no Supabase

---

## 📊 8. Monitoramento

### Vercel Dashboard
- Real-time analytics
- Speed Insights
- Edge logs

### Supabase Dashboard
- Database metrics
- API usage
- Auth logs

### Sentry (Opcional - FASE 2)
- Error tracking
- Performance monitoring
- Release health

---

## 🔧 9. Troubleshooting

### Build Falha

```bash
# Limpar cache
rm -rf node_modules .vercel
npm install
npm run build
```

### Environment Variables não carregam

```bash
# Verificar prefixo VITE_
echo $VITE_SUPABASE_URL  # Deve ter valor

# Redeployer
vercel --prod --force
```

### Supabase RLS bloqueando

```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename = 'produtos';

-- Temporariamente desabilitar (dev only)
ALTER TABLE produtos DISABLE ROW LEVEL SECURITY;
```

---

## 🎯 10. Próximos Passos (FASE 2)

- [ ] Migrar IcarusBrain para Claude API real
- [ ] Implementar 57 módulos faltantes
- [ ] Aumentar test coverage para 85%
- [ ] Code splitting (chunks < 500KB)
- [ ] PWA (Service Worker + manifest)
- [ ] Implementar Sentry error tracking

---

## 📞 Suporte

- **GitHub Issues**: https://github.com/Icarus-AI-Technology/icarus/issues
- **Docs**: `/docs/`
- **Troubleshooting**: `TROUBLESHOOTING.md`

---

**Versão**: 5.0.3
**Data**: 2025-11-16
**Status**: ✅ FASE 1 Completa - Pronto para Deploy

🚀 **Deploy ICARUS v5.0 agora!**
