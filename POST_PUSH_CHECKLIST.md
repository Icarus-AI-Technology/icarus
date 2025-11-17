# 🚀 Checklist de Deploy Pós-Push

## ✅ Status Atual

- ✅ Código commitado e pushed para o repositório
- ✅ Migration `005_create_leads_table.sql` criada
- ✅ Edge Function `send-lead-email` criada
- ✅ Componentes React implementados
- ✅ Rotas configuradas

---

## 📋 Próximos Passos Obrigatórios

### 1. 🗄️ Aplicar Migration no Supabase

#### Opção A: Via Supabase CLI (Recomendado)

```bash
# Navegar para o diretório do projeto
cd /Users/daxmeneghel/.cursor/worktrees/icarus/TLjz5

# Verificar conexão com o projeto
npx supabase status

# Aplicar migration
npx supabase db push

# Verificar se a tabela foi criada
npx supabase db reset --db-only
```

#### Opção B: Via Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto Icarus
3. Vá em **SQL Editor**
4. Clique em **New query**
5. Cole o conteúdo de `supabase/migrations/005_create_leads_table.sql`
6. Clique em **Run**

**Resultado esperado:**
```sql
✅ Table 'leads' created
✅ Indexes created
✅ RLS policies applied
✅ View 'vw_leads_summary' created
```

---

### 2. 📧 Configurar Resend para Emails

#### Passo 1: Criar conta Resend

1. Acesse: https://resend.com
2. Clique em **Sign Up**
3. Crie uma conta gratuita
4. Verifique seu email

#### Passo 2: Gerar API Key

1. No dashboard Resend, vá em **API Keys**
2. Clique em **Create API Key**
3. Nome: `Icarus Lead Emails`
4. Permissions: **Sending access**
5. Copie a API Key (começa com `re_`)

**⚠️ IMPORTANTE**: Guarde a API Key em local seguro! Ela só aparece uma vez.

#### Passo 3: Adicionar API Key no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto Icarus
3. Vá em **Settings** → **Edge Functions**
4. Clique na aba **Secrets**
5. Clique em **Add secret**
6. Nome: `RESEND_API_KEY`
7. Valor: Cole sua API Key do Resend (ex: `re_123abc...`)
8. Clique em **Save**

---

### 3. 🚀 Deploy da Edge Function

```bash
# Navegar para o diretório do projeto
cd /Users/daxmeneghel/.cursor/worktrees/icarus/TLjz5

# Login no Supabase (se ainda não fez)
npx supabase login

# Link do projeto (se ainda não fez)
npx supabase link --project-ref seu-project-ref

# Deploy da função
npx supabase functions deploy send-lead-email

# Verificar se foi deployada
npx supabase functions list
```

**Resultado esperado:**
```
✅ send-lead-email deployed successfully
   URL: https://seu-projeto.supabase.co/functions/v1/send-lead-email
```

---

### 4. 🧪 Testar o Sistema Completo

#### Teste Local

```bash
# Garantir que o servidor está rodando
npm run dev

# Abrir no navegador
# http://localhost:5173/
```

#### Teste do Formulário

1. Acesse a homepage: `http://localhost:5173/`
2. Role até o formulário de contato
3. Preencha todos os campos obrigatórios:
   - Nome completo
   - Email corporativo
   - Telefone
   - Empresa
4. Selecione pelo menos 1 área de interesse
5. Clique em **Enviar Contato**

**Verificações:**

- [ ] Loading state aparece no botão
- [ ] Mensagem de sucesso é exibida
- [ ] Formulário é resetado
- [ ] Lead foi salvo no Supabase
- [ ] Email foi recebido em `dax@newortho.com.br`

#### Verificar no Supabase

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto Icarus
3. Vá em **Table Editor**
4. Selecione a tabela **leads**
5. Você deve ver o lead recém-criado

#### Verificar Email

1. Acesse seu email: `dax@newortho.com.br`
2. Procure por email com assunto: "🚀 Novo Lead: [Empresa] - [Nome]"
3. Verifique se todos os dados estão corretos
4. Verifique se os links (WhatsApp, email) funcionam

---

### 5. 🌐 Deploy para Produção (Vercel)

#### Passo 1: Preparar Build

```bash
# Testar build localmente
npm run build

# Verificar se build foi bem-sucedido
# Não deve ter erros
```

#### Passo 2: Deploy Vercel

```bash
# Instalar Vercel CLI (se ainda não tem)
npm i -g vercel

# Login na Vercel
vercel login

# Deploy
vercel --prod
```

#### Passo 3: Configurar Variáveis de Ambiente na Vercel

1. Acesse: https://vercel.com/dashboard
2. Selecione o projeto Icarus
3. Vá em **Settings** → **Environment Variables**
4. Adicione as variáveis:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

5. Clique em **Save**
6. Redeploy o projeto:

```bash
vercel --prod
```

---

### 6. 🧪 Teste em Produção

1. Acesse seu site em produção (URL da Vercel)
2. Teste o formulário de contato
3. Verifique se:
   - [ ] Lead é salvo no Supabase
   - [ ] Email é recebido
   - [ ] Login funciona
   - [ ] Redirecionamento funciona

---

## 🎯 Comandos Rápidos de Referência

```bash
# Aplicar migration
npx supabase db push

# Deploy Edge Function
npx supabase functions deploy send-lead-email

# Ver logs da Edge Function
npx supabase functions logs send-lead-email

# Testar localmente
npm run dev

# Build para produção
npm run build

# Deploy para Vercel
vercel --prod

# Ver status do Supabase
npx supabase status

# Listar Edge Functions
npx supabase functions list
```

---

## 🐛 Troubleshooting Comum

### "Error: Project not linked"

```bash
npx supabase link --project-ref seu-project-ref
```

### "Error: Not logged in"

```bash
npx supabase login
```

### "Email não está sendo enviado"

1. Verificar se `RESEND_API_KEY` está configurada no Supabase
2. Verificar logs: `npx supabase functions logs send-lead-email`
3. Verificar se o domínio está verificado no Resend

### "Lead não salva no banco"

1. Verificar se migration foi aplicada
2. Verificar RLS policies
3. Verificar console do navegador para erros

---

## ✅ Checklist Final

- [ ] Migration aplicada no Supabase
- [ ] Tabela `leads` criada e visível
- [ ] Conta Resend criada
- [ ] API Key Resend gerada
- [ ] `RESEND_API_KEY` configurada no Supabase
- [ ] Edge Function deployada
- [ ] Edge Function testada e funcionando
- [ ] Formulário testado localmente
- [ ] Lead salvo com sucesso
- [ ] Email recebido com sucesso
- [ ] Build sem erros
- [ ] Deploy na Vercel realizado
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] Teste em produção bem-sucedido

---

## 🎉 Quando Tudo Estiver Funcionando

Você terá:

✅ **Landing page** moderna e profissional  
✅ **Captura de leads** automática  
✅ **Notificações por email** instantâneas  
✅ **Sistema de login** funcional  
✅ **Design responsivo** em todos os dispositivos  
✅ **Acessibilidade** WCAG 2.1 AA  

---

## 📊 Monitoramento

### Consultas SQL Úteis

```sql
-- Ver todos os leads
SELECT * FROM leads ORDER BY created_at DESC;

-- Resumo de leads
SELECT * FROM vw_leads_summary;

-- Leads de hoje
SELECT * FROM leads 
WHERE created_at::date = CURRENT_DATE;

-- Leads por segmento
SELECT segmento, COUNT(*) as total
FROM leads
GROUP BY segmento
ORDER BY total DESC;

-- Leads por origem
SELECT como_conheceu, COUNT(*) as total
FROM leads
GROUP BY como_conheceu
ORDER BY total DESC;
```

---

**Status**: 📋 Aguardando execução dos passos acima  
**Prioridade**: 🔴 Alta  
**Tempo estimado**: 30-45 minutos  

**Próximo passo**: Aplicar migration no Supabase (Passo 1)

