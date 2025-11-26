# 🚀 Quick Start - ICARUS v5.0

Guia completo de instalação, configuração e deploy do ICARUS v5.0.

---

## 📋 Pré-requisitos

### Software Necessário

```bash
# Node.js 18+ (recomendado: 20 LTS)
node --version  # deve ser >= 18.0.0

# npm ou yarn
npm --version   # >= 9.0.0
# ou
yarn --version  # >= 1.22.0

# Git
git --version   # >= 2.30.0
```

### Contas Necessárias

1. **Supabase** (database) - https://supabase.com
   - Plano Free: ✅ Suficiente para começar
   - 500MB database, 2GB bandwidth/mês

2. **Anthropic** (IA - opcional) - https://console.anthropic.com
   - R$ 100 créditos grátis
   - Só necessário para serviços IA

3. **Vercel** (deploy - opcional) - https://vercel.com
   - Plano Free: ✅ Ilimitado para hobby

---

## 🏗️ Instalação Local

### 1. Clone o Repositório

```bash
git clone https://github.com/Icarus-AI-Technology/icarus.git
cd icarus
```

### 2. Instale Dependências

```bash
npm install
# ou
yarn install
```

**Tempo estimado**: 2-3 minutos

### 3. Configure Supabase

#### 3.1. Crie Projeto Supabase

1. Acesse https://supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name**: `icarus-dev`
   - **Database Password**: (anote!)
   - **Region**: `South America (São Paulo)`
   - **Pricing Plan**: `Free`
4. Clique "Create new project"

**Tempo de criação**: ~2 minutos

#### 3.2. Execute o Schema

1. No dashboard Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Cole o schema abaixo:

```sql
-- Tabela: Produtos
CREATE TABLE produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(200) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  categoria VARCHAR(100),
  preco DECIMAL(10,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Clientes
CREATE TABLE clientes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  razao_social VARCHAR(200) NOT NULL,
  cnpj VARCHAR(18) UNIQUE NOT NULL,
  email VARCHAR(100),
  telefone VARCHAR(20),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Cirurgias
CREATE TABLE cirurgias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente VARCHAR(200) NOT NULL,
  hospital VARCHAR(200) NOT NULL,
  data_cirurgia TIMESTAMP NOT NULL,
  status VARCHAR(50) DEFAULT 'agendada',
  medico VARCHAR(200),
  valor_total DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela: Estoque
CREATE TABLE estoque (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID REFERENCES produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 0,
  lote VARCHAR(50),
  validade DATE,
  localizacao VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_clientes_cnpj ON clientes(cnpj);
CREATE INDEX idx_cirurgias_data ON cirurgias(data_cirurgia);
CREATE INDEX idx_estoque_produto ON estoque(produto_id);

-- Row Level Security (RLS)
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cirurgias ENABLE ROW LEVEL SECURITY;
ALTER TABLE estoque ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (permitir tudo para desenvolvimento)
CREATE POLICY "Enable all for authenticated users" ON produtos
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON clientes
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON cirurgias
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON estoque
  FOR ALL USING (auth.role() = 'authenticated');
```

4. Clique em "Run" (ou F5)

#### 3.3. Copie Credenciais

1. Vá em **Project Settings** → **API**
2. Copie:
   - **Project URL**: `https://xxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiI...`

### 4. Configure Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env.local

# Edite .env.local
nano .env.local  # ou seu editor preferido
```

Cole suas credenciais:

```bash
# Supabase (OBRIGATÓRIO)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...

# Anthropic (OPCIONAL - só para IA)
VITE_ANTHROPIC_API_KEY=sk-ant-api03-...

# App Config
VITE_APP_NAME=ICARUS
VITE_APP_VERSION=5.0.3
```

**⚠️ IMPORTANTE**: Nunca commite `.env.local` (já está no `.gitignore`)

### 5. Execute o Projeto

```bash
npm run dev
# ou
yarn dev
```

**Saída esperada**:
```
  VITE v6.0.0  ready in 458 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

### 6. Acesse no Navegador

Abra http://localhost:5173

**Primeira tela**: Dashboard com KPIs e gráficos 🎉

---

## 🧪 Popular Dados de Teste (Opcional)

Execute o seed script:

```bash
npm run seed
# ou
yarn seed
```

Isso criará:
- 50 produtos
- 30 clientes
- 20 cirurgias
- 100 movimentações de estoque

---

## 🔧 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Type checking
npm run type-check
```

### Qualidade

```bash
# Lint (ESLint)
npm run lint

# Lint + fix automático
npm run lint:fix

# Format (Prettier)
npm run format

# Testes
npm test

# Testes com coverage
npm test -- --coverage
```

### Supabase Local (Avançado)

```bash
# Iniciar Supabase local
npx supabase start

# Ver status
npx supabase status

# Deploy schema
npx supabase db push

# Pull schema
npx supabase db pull

# Parar Supabase
npx supabase stop
```

---

## 🚀 Deploy Produção

### Opção 1: Vercel (Recomendado)

#### Via CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy (primeira vez)
vercel

# Siga o wizard:
# - Set up and deploy? Yes
# - Which scope? Seu username
# - Link to existing project? No
# - Project name? icarus
# - Directory? ./
# - Override settings? No

# 4. Configure env vars
# No dashboard Vercel: Settings → Environment Variables
# Adicione:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_ANTHROPIC_API_KEY

# 5. Deploy produção
vercel --prod
```

**URL final**: `https://icarus-xxx.vercel.app`

#### Via GitHub (Auto Deploy)

```bash
# 1. Push para GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Conecte no Vercel
# - Acesse https://vercel.com
# - Import Git Repository
# - Selecione seu repo
# - Configure env vars
# - Deploy!
```

**Vantagem**: Deploy automático a cada push para `main`

---

### Opção 2: Netlify

```bash
# 1. Build
npm run build

# 2. Instalar Netlify CLI
npm i -g netlify-cli

# 3. Login
netlify login

# 4. Deploy
netlify deploy

# 5. Deploy produção
netlify deploy --prod
```

---

### Opção 3: Docker

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
# Build
docker build -t icarus .

# Run
docker run -p 80:80 icarus
```

---

## 🔒 Configuração de Produção

### 1. Supabase Row Level Security (RLS)

**⚠️ CRÍTICO**: Ajuste as políticas RLS para produção!

```sql
-- Remover política de desenvolvimento
DROP POLICY "Enable all for authenticated users" ON produtos;

-- Criar políticas seguras
-- Usuários só veem produtos do seu tenant
CREATE POLICY "Users see own tenant products" ON produtos
  FOR SELECT USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Usuários só editam produtos do seu tenant
CREATE POLICY "Users edit own tenant products" ON produtos
  FOR UPDATE USING (
    tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
  );

-- Repetir para todas as tabelas...
```

### 2. Variáveis de Ambiente Produção

```bash
# Supabase Production
VITE_SUPABASE_URL=https://prod-xxx.supabase.co  # Projeto produção
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...   # Key produção

# Anthropic Production
VITE_ANTHROPIC_API_KEY=sk-ant-...  # Key produção (separada de dev)

# App Config
VITE_APP_ENV=production
VITE_APP_VERSION=5.0.3
VITE_ENABLE_ANALYTICS=true

# Sentry (monitoramento de erros)
VITE_SENTRY_DSN=https://...@sentry.io/...
```

### 3. CI/CD (GitHub Actions)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 20

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Test
        run: npm test

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Monitoramento

### Vercel Analytics

```tsx
// src/main.tsx
import { inject } from '@vercel/analytics'

inject()  // Adicione antes de render
```

### Sentry (Errors)

```bash
npm install @sentry/react @sentry/tracing
```

```tsx
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENV,
  tracesSampleRate: 1.0,
})
```

---

## 🐛 Troubleshooting

### Problema: `npm install` falha

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Problema: Supabase 401 Unauthorized

```bash
# Verifique .env.local
cat .env.local

# Keys corretas?
# VITE_SUPABASE_URL correto?
# Restart dev server
npm run dev
```

### Problema: IA não responde

```bash
# Verificar API key
echo $VITE_ANTHROPIC_API_KEY

# Testar key
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $VITE_ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4.5-20250929","max_tokens":10,"messages":[{"role":"user","content":"Hi"}]}'
```

### Problema: Build falha

```bash
# Type check
npm run type-check

# Ver erros específicos
npm run build 2>&1 | grep error
```

[📖 Mais problemas: TROUBLESHOOTING.md](../TROUBLESHOOTING.md)

---

## 📚 Próximos Passos

Após instalação:

1. **Leia a documentação**:
   - [CLAUDE.md](../CLAUDE.md) - Contexto para desenvolvimento
   - [.clinerules](../.clinerules) - Regras obrigatórias
   - [Design System](DARK-GLASS-MEDICAL.md)

2. **Explore os módulos**:
   - `/cirurgias` - Módulo referência
   - `/estoque` - Com IA
   - `/analytics` - Dashboards

3. **Customize**:
   - Cores (`tailwind.config.js`)
   - Componentes (`src/components/ui/`)
   - Módulos (`src/components/modules/`)

4. **Desenvolva**:
   - [Criar Módulos](skills/SKILL_CRIAR_MODULOS.md)
   - [Integrar IA](skills/SKILL_IA_INTEGRATION.md)
   - [Supabase Patterns](skills/SKILL_SUPABASE.md)

---

**✅ ICARUS v5.0 instalado com sucesso!**

**Tempo total**: 15-20 minutos

🚀 **Comece a desenvolver agora!**
