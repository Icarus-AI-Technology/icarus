# Guia de Deploy - Landing Page Icarus v5.0

## 📋 Visão Geral

Este guia contém instruções para configurar e deployar a landing page do Icarus v5.0 com formulário de contato integrado.

---

## 🎨 Componentes Criados

### 1. **HomePage** (`src/pages/HomePage.tsx`)
   - Hero section moderna e impactante
   - Seção de pain points (problemas resolvidos)
   - Features (funcionalidades poderosas)
   - Benefits (resultados reais)
   - Differentials (diferenciais competitivos)
   - Formulário de contato integrado
   - Footer completo

### 2. **LoginPage** (`src/pages/LoginPage.tsx`)
   - Design neumórfico baseado na referência
   - Formulário de login com validação
   - Quick access para desenvolvimento
   - Link "Esqueceu sua senha?"
   - Totalmente responsivo

### 3. **ContactForm** (`src/components/landing/ContactForm.tsx`)
   - Campos estratégicos para qualificação de leads
   - Integração com Supabase (salva no banco)
   - Envio de email automático via Edge Function
   - Feedback visual de sucesso/erro
   - Validação de campos obrigatórios

---

## 🗄️ Database Setup

### Migration criada: `005_create_leads_table.sql`

Execute a migration no Supabase:

```bash
# Aplicar migration
npx supabase db push

# Ou executar manualmente no Supabase Dashboard
# SQL Editor > Cole o conteúdo de 005_create_leads_table.sql
```

### Tabela `leads` - Estrutura:

```sql
- id (UUID)
- nome_completo (VARCHAR)
- email (VARCHAR)
- telefone (VARCHAR)
- empresa (VARCHAR)
- cargo (VARCHAR)
- tamanho_empresa (VARCHAR)
- segmento (VARCHAR)
- principal_desafio (TEXT)
- interesse_em (TEXT[])
- como_conheceu (VARCHAR)
- mensagem (TEXT)
- status (VARCHAR) - default: 'novo'
- origem (VARCHAR) - default: 'site'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 📧 Configurar Edge Function para Email

### 1. Criar conta no Resend

1. Acesse [resend.com](https://resend.com)
2. Crie uma conta gratuita
3. Gere uma API Key
4. Copie a API Key

### 2. Configurar variáveis de ambiente no Supabase

```bash
# No Supabase Dashboard:
# Settings > Edge Functions > Add new secret

RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

### 3. Deploy da Edge Function

```bash
# Login no Supabase CLI (se ainda não fez)
npx supabase login

# Link do projeto
npx supabase link --project-ref seu-project-ref

# Deploy da função
npx supabase functions deploy send-lead-email
```

### 4. Testar Edge Function

```bash
# Teste local
npx supabase functions serve send-lead-email

# Teste com curl
curl -X POST 'https://seu-projeto.supabase.co/functions/v1/send-lead-email' \
  -H 'Authorization: Bearer SUA_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "nome_completo": "João Silva",
    "email": "joao@empresa.com",
    "telefone": "(11) 99999-9999",
    "empresa": "Empresa Teste",
    "cargo": "Diretor",
    "tamanho_empresa": "média",
    "segmento": "OPME",
    "principal_desafio": "Gestão de estoque",
    "interesse_em": ["IA e Automação", "Gestão de Estoque"],
    "como_conheceu": "google",
    "mensagem": "Gostaria de uma demonstração"
  }'
```

---

## 🚀 Deploy da Aplicação

### Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Configurar variáveis de ambiente na Vercel:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

---

## 🧪 Testes

### Teste Local

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Acesse:
# - HomePage: http://localhost:5173/
# - LoginPage: http://localhost:5173/login
```

### Teste de Responsividade

1. Abra DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Teste em diferentes resoluções:
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px, 1920px

### Teste de Acessibilidade

```bash
# Executar testes de acessibilidade
npm run validate:orx
```

---

## ✅ Checklist de Deploy

- [ ] Migration `005_create_leads_table.sql` aplicada no Supabase
- [ ] Conta Resend criada e API Key gerada
- [ ] Variável `RESEND_API_KEY` configurada no Supabase
- [ ] Edge Function `send-lead-email` deployada
- [ ] Edge Function testada e funcionando
- [ ] Build da aplicação sem erros (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel/host
- [ ] Deploy realizado
- [ ] Teste end-to-end do formulário em produção
- [ ] Emails sendo recebidos em dax@newortho.com.br
- [ ] Responsividade testada em mobile, tablet e desktop
- [ ] Acessibilidade validada

---

## 🎯 Rotas Configuradas

```
/ (público)           → HomePage (Landing Page)
/login (público)      → LoginPage
/dashboard (protegido) → Dashboard (após login)
/* (protegido)        → Módulos do sistema
```

---

## 🔧 Manutenção

### Atualizar email de destino

Edite `supabase/functions/send-lead-email/index.ts`:

```typescript
const RECIPIENT_EMAIL = 'novo-email@empresa.com.br'
```

Redeploy:

```bash
npx supabase functions deploy send-lead-email
```

### Adicionar novos campos no formulário

1. Atualizar tipo `Lead` em `send-lead-email/index.ts`
2. Adicionar campo na migration (criar nova migration)
3. Atualizar `ContactForm.tsx`
4. Atualizar template do email

---

## 📊 Métricas e Analytics

### Consultar leads no Supabase

```sql
-- Total de leads
SELECT COUNT(*) FROM leads;

-- Leads por status
SELECT status, COUNT(*) 
FROM leads 
GROUP BY status;

-- Leads dos últimos 7 dias
SELECT * 
FROM leads 
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Segmentos mais comuns
SELECT segmento, COUNT(*) 
FROM leads 
WHERE segmento IS NOT NULL
GROUP BY segmento 
ORDER BY COUNT(*) DESC;
```

### View pré-configurada

```sql
SELECT * FROM vw_leads_summary;
```

---

## 🐛 Troubleshooting

### Email não está sendo enviado

1. Verificar se a Edge Function está deployada:
   ```bash
   npx supabase functions list
   ```

2. Verificar logs da Edge Function:
   ```bash
   npx supabase functions logs send-lead-email
   ```

3. Verificar API Key do Resend no Supabase Dashboard

4. Verificar se o domínio está verificado no Resend

### Formulário não salva no banco

1. Verificar RLS policies na tabela `leads`
2. Verificar se a migration foi aplicada
3. Verificar network tab no DevTools
4. Verificar console do navegador para erros

### Rota não encontrada

1. Verificar se o componente foi importado corretamente no `App.tsx`
2. Limpar cache do navegador
3. Rebuild da aplicação: `npm run build`

---

## 📞 Suporte

Para problemas técnicos, consulte:

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Resend](https://resend.com/docs)
- [Documentação Vercel](https://vercel.com/docs)

---

## 🎉 Pronto!

Sua landing page está configurada e pronta para capturar leads. Lembre-se de:

1. Monitorar emails recebidos
2. Responder leads em até 24h
3. Acompanhar métricas no Supabase
4. Manter o CRM atualizado

---

**Versão**: 1.0.0  
**Data**: 2025-11-16  
**Autor**: Designer Icarus v5.0

