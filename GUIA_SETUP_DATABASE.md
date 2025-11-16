# 🗄️ Guia Visual: Setup do Banco de Dados Supabase

> **Guia passo a passo** para executar o `setup-db.sql` no Supabase

---

## 📋 Pré-requisitos

Antes de começar, certifique-se que você tem:

- ✅ Conta no Supabase criada
- ✅ Projeto Supabase criado
- ✅ Credenciais configuradas no `.env.local`
- ✅ Arquivo `setup-db.sql` disponível

---

## 🎯 Passo 1: Acessar o Dashboard do Supabase

### 1.1 Login no Supabase

1. Acesse: **https://app.supabase.com**
2. Faça login com sua conta
3. Você verá a lista de projetos

```
┌─────────────────────────────────────────┐
│  Supabase Dashboard                     │
├─────────────────────────────────────────┤
│                                         │
│  📁 My Projects                         │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ ICARUS-v5-prod                   │  │
│  │ oshgkugagyixutiqyjsq              │  │
│  │ Status: Active ●                 │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

### 1.2 Selecionar o Projeto

- Clique no card do seu projeto **ICARUS**
- Você será redirecionado para o dashboard do projeto

---

## 🎯 Passo 2: Abrir o SQL Editor

### 2.1 Navegar até SQL Editor

1. No menu lateral esquerdo, localize a seção **Database**
2. Clique em **SQL Editor**

```
┌────────────────────────────────────────────┐
│ 📊 Dashboard                               │
│ 🗄️  Database                               │
│    ├─ Tables                               │
│    ├─ Extensions                           │
│    └─ 📝 SQL Editor  ← CLIQUE AQUI         │
│ 🔐 Authentication                          │
│ 📁 Storage                                 │
│ 🔔 Realtime                                │
└────────────────────────────────────────────┘
```

### 2.2 Interface do SQL Editor

Você verá uma interface com:
- **Painel esquerdo**: Queries salvas
- **Painel central**: Editor de SQL
- **Painel direito**: Resultados

```
┌──────────────────────────────────────────────────┐
│  SQL Editor                      [Run] [Save]    │
├──────────────────────────────────────────────────┤
│  Saved queries  │  SQL Editor     │  Results     │
│  ┌────────────┐ │                 │              │
│  │ + New      │ │  -- Digite ou  │              │
│  │            │ │  -- cole SQL   │              │
│  │ Templates  │ │  -- aqui       │              │
│  │            │ │                 │              │
│  └────────────┘ │                 │              │
└──────────────────────────────────────────────────┘
```

---

## 🎯 Passo 3: Executar o setup-db.sql

### 3.1 Abrir o arquivo setup-db.sql

No seu terminal local:

```bash
# Visualizar o conteúdo do arquivo
cat setup-db.sql

# OU abrir no editor
code setup-db.sql  # VS Code
nano setup-db.sql  # Terminal
```

### 3.2 Copiar o Conteúdo

1. Selecione **TODO** o conteúdo do arquivo `setup-db.sql`
2. Copie para a área de transferência (`Ctrl+C` ou `Cmd+C`)

**⚠️ IMPORTANTE**: Copie TODO o conteúdo, incluindo:
- Criação de tabelas (12 tabelas)
- Policies de Row Level Security (RLS)
- Seed data (dados iniciais)

### 3.3 Colar no SQL Editor

1. No SQL Editor do Supabase, **cole** o conteúdo (`Ctrl+V` ou `Cmd+V`)
2. Revise rapidamente o SQL para garantir que está completo

```sql
-- =====================================================
-- ICARUS v5.0 - Database Setup
-- =====================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ...
```

### 3.4 Executar o Script

1. Clique no botão **"Run"** (Executar) no canto superior direito
2. **OU** use o atalho: `Ctrl+Enter` (Windows/Linux) ou `Cmd+Enter` (Mac)

```
┌─────────────────────────────────────────┐
│  [▶ Run]  [Save]  [Format]              │
├─────────────────────────────────────────┤
│  -- SQL Editor                          │
│  CREATE TABLE companies ...             │
│                                         │
│                            ← CLIQUE RUN │
└─────────────────────────────────────────┘
```

### 3.5 Aguardar Execução

- O script pode levar **30-60 segundos** para executar
- Você verá um indicador de progresso
- Aguarde até a conclusão

---

## 🎯 Passo 4: Validar a Execução

### 4.1 Verificar Mensagens de Sucesso

No painel **Results** (Resultados), você deve ver:

```
✅ Success. No rows returned

Query executed successfully.
Rows: 0
Duration: 1234ms
```

**✅ SUCESSO**: Nenhum erro significa que tudo foi criado!

### 4.2 Verificar se houve Erros

Se aparecer mensagens de erro em vermelho:

```
❌ ERROR: relation "companies" already exists
```

**Isso é OK!** Significa que a tabela já existe. Continue.

**⚠️ Se houver outros erros**, veja a seção **Troubleshooting** abaixo.

---

## 🎯 Passo 5: Confirmar Criação das Tabelas

### 5.1 Voltar para Tables

1. No menu lateral, clique em **Database > Tables**
2. Você verá a lista de tabelas criadas

```
┌────────────────────────────────────────┐
│  Tables                                │
├────────────────────────────────────────┤
│  📋 companies          (1 row)         │
│  📋 profiles           (0 rows)        │
│  📋 products           (5 rows)        │
│  📋 hospitals          (3 rows)        │
│  📋 doctors            (4 rows)        │
│  📋 medical_procedures (0 rows)        │
│  📋 sales              (0 rows)        │
│  📋 sale_items         (0 rows)        │
│  📋 suppliers          (0 rows)        │
│  📋 purchase_orders    (0 rows)        │
│  📋 inventory_movements (0 rows)       │
│  📋 ai_predictions     (0 rows)        │
└────────────────────────────────────────┘
```

### 5.2 Verificar as 12 Tabelas

Confirme que TODAS as tabelas foram criadas:

1. ✅ **companies** - Empresas (multi-tenant)
2. ✅ **profiles** - Perfis de usuários
3. ✅ **products** - Produtos OPME
4. ✅ **hospitals** - Hospitais clientes
5. ✅ **doctors** - Médicos
6. ✅ **medical_procedures** - Procedimentos médicos
7. ✅ **sales** - Vendas
8. ✅ **sale_items** - Itens de venda
9. ✅ **suppliers** - Fornecedores
10. ✅ **purchase_orders** - Ordens de compra
11. ✅ **inventory_movements** - Movimentações de estoque
12. ✅ **ai_predictions** - Previsões de IA

---

## 🎯 Passo 6: Validar Seed Data (Dados Iniciais)

### 6.1 Verificar Empresa Demo

1. Clique na tabela **companies**
2. Você deve ver **1 linha** com a empresa demo:

```
┌──────────────────────────────────────────────┐
│  companies                                   │
├──────────────────────────────────────────────┤
│  id        │ name                │ created_at│
│  uuid-123  │ ICARUS Demo Corp    │ 2025-...  │
└──────────────────────────────────────────────┘
```

### 6.2 Verificar Produtos

1. Clique na tabela **products**
2. Você deve ver **5 produtos** OPME de exemplo:

```
┌────────────────────────────────────────────────────┐
│  products                                          │
├────────────────────────────────────────────────────┤
│  name                 │ code    │ sale_price       │
│  Parafuso Pedicular   │ PP-001  │ 450.00           │
│  Placa Cervical       │ PC-001  │ 1200.00          │
│  Haste Toracolombar   │ HT-001  │ 850.00           │
│  Cage Intersomático   │ CI-001  │ 2500.00          │
│  Kit Artrodese        │ KA-001  │ 3200.00          │
└────────────────────────────────────────────────────┘
```

### 6.3 Verificar Hospitais

1. Clique na tabela **hospitals**
2. Você deve ver **3 hospitais** de exemplo:

```
┌────────────────────────────────────────────────────┐
│  hospitals                                         │
├────────────────────────────────────────────────────┤
│  name                          │ city              │
│  Hospital Albert Einstein      │ São Paulo         │
│  Hospital Sírio-Libanês        │ São Paulo         │
│  Hospital Israelita A. Einstein│ São Paulo         │
└────────────────────────────────────────────────────┘
```

### 6.4 Verificar Médicos

1. Clique na tabela **doctors**
2. Você deve ver **4 médicos** de exemplo:

```
┌────────────────────────────────────────────────────┐
│  doctors                                           │
├────────────────────────────────────────────────────┤
│  name                    │ specialty               │
│  Dr. Carlos Silva        │ Ortopedia               │
│  Dra. Maria Santos       │ Neurocirurgia           │
│  Dr. João Oliveira       │ Ortopedia               │
│  Dra. Ana Costa          │ Cirurgia de Coluna      │
└────────────────────────────────────────────────────┘
```

---

## 🎯 Passo 7: Verificar Row Level Security (RLS)

### 7.1 Acessar Policies

1. Clique em uma tabela (ex: **products**)
2. Clique na aba **Policies** no topo
3. Você verá as políticas de segurança configuradas

```
┌────────────────────────────────────────────────────┐
│  products                    [Policies]            │
├────────────────────────────────────────────────────┤
│  ✅ RLS Enabled                                    │
│                                                    │
│  📜 Users can view own company data                │
│  📜 Users can insert own company data              │
│  📜 Users can update own company data              │
│  📜 Users can delete own company data              │
└────────────────────────────────────────────────────┘
```

### 7.2 Confirmar RLS Ativo

Para cada tabela importante, confirme:
- ✅ **RLS Enabled** está marcado
- ✅ Há 4 policies (SELECT, INSERT, UPDATE, DELETE)
- ✅ Policies filtram por `company_id`

---

## 🎯 Passo 8: Testar a Conexão no App

### 8.1 Iniciar o Dev Server

No terminal:

```bash
npm run dev
```

### 8.2 Acessar o App

1. Abra o navegador em: **http://localhost:5173**
2. Você deve ver a tela de login do ICARUS

### 8.3 Verificar Conexão

No console do navegador (`F12`), verifique:

```javascript
// Console do navegador
✅ Supabase connected
✅ Database: oshgkugagyixutiqyjsq
```

**Se houver erros**, veja **Troubleshooting** abaixo.

---

## 🔧 Troubleshooting (Resolução de Problemas)

### ❌ Erro: "relation already exists"

```
ERROR: relation "companies" already exists
```

**Solução**: A tabela já existe. Isso é OK! Continue com as próximas tabelas.

**OU**, se quiser recomeçar do zero:

1. No SQL Editor, execute:

```sql
-- ⚠️ CUIDADO: Isso apaga TUDO!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
```

2. Execute novamente o `setup-db.sql` completo

---

### ❌ Erro: "permission denied"

```
ERROR: permission denied for schema public
```

**Solução**: Você não tem permissões de admin.

1. Vá em **Settings > Database**
2. Use a **Connection String** como admin:

```
postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

3. Use um cliente SQL como **pgAdmin** ou **DBeaver**
4. Execute o script lá

---

### ❌ Erro: "syntax error at or near"

```
ERROR: syntax error at or near "CREATE"
LINE 42: CREATE TABLE products (
```

**Solução**: O SQL está incompleto ou corrompido.

1. Baixe novamente o `setup-db.sql` do repositório
2. Garanta que copiou **TODO** o arquivo
3. Execute novamente

---

### ❌ Erro: Nenhuma tabela aparece

**Solução**:

1. Atualize a página do Supabase (`F5`)
2. Volte para **Database > Tables**
3. Clique em **Refresh** (ícone de recarregar)

Se ainda não aparecer:

1. Verifique se o script foi executado com sucesso
2. Veja se há erros na aba **Results**

---

### ❌ Erro: "could not connect to server"

**Solução**:

1. Verifique sua conexão com a internet
2. Verifique se o projeto Supabase está ativo:
   - Vá em **Settings > General**
   - Confirme que **Status** está **Active**
3. Se o projeto foi pausado, clique em **Resume**

---

### ❌ Erro no App: "Invalid API key"

**Solução**:

1. Verifique o arquivo `.env.local`:

```bash
cat .env.local
```

2. Confirme que as variáveis estão corretas:
   - `VITE_SUPABASE_URL` - Deve começar com `https://`
   - `VITE_SUPABASE_ANON_KEY` - Chave longa começando com `eyJ...`

3. Copie as credenciais corretas de **Settings > API**:

```
┌────────────────────────────────────────┐
│  Project API Keys                      │
├────────────────────────────────────────┤
│  Project URL                           │
│  https://xxx.supabase.co               │
│                                        │
│  anon / public                         │
│  eyJhbGciOiJI...                       │
└────────────────────────────────────────┘
```

4. Reinicie o dev server:

```bash
# Ctrl+C para parar
npm run dev
```

---

## ✅ Checklist de Validação

Antes de continuar, confirme que você tem:

- [ ] 12 tabelas criadas no Supabase
- [ ] 1 empresa demo em `companies`
- [ ] 5 produtos demo em `products`
- [ ] 3 hospitais demo em `hospitals`
- [ ] 4 médicos demo em `doctors`
- [ ] RLS habilitado em todas as tabelas
- [ ] 4 policies por tabela (SELECT, INSERT, UPDATE, DELETE)
- [ ] `.env.local` configurado com credenciais corretas
- [ ] Dev server iniciando sem erros
- [ ] Console do navegador sem erros de conexão

---

## 🎉 Próximos Passos

Com o banco de dados configurado, você pode:

### 1. Criar Primeiro Usuário

1. No app, vá para **Cadastro**
2. Crie um usuário de teste
3. Faça login

### 2. Explorar os Módulos

- **Dashboard**: Visão geral do sistema
- **Produtos**: Gerenciar produtos OPME
- **Vendas**: Criar pedidos de venda
- **Estoque**: Controlar movimentações

### 3. Adicionar Dados Reais

1. Cadastre sua empresa real
2. Importe produtos do seu catálogo
3. Adicione hospitais e médicos

### 4. Configurar IA (IcarusBrain)

1. Verifique se `VITE_ANTHROPIC_API_KEY` está configurado
2. Teste previsões de demanda no Dashboard
3. Use o assistente virtual

---

## 📚 Recursos Adicionais

- **Documentação Supabase**: https://supabase.com/docs
- **SQL Reference**: https://www.postgresql.org/docs/
- **ICARUS Docs**: `/docs/` no projeto

---

## 🆘 Suporte

Se você encontrou um problema não listado aqui:

1. **Verifique os logs**: Console do navegador (`F12`)
2. **Verifique o terminal**: Erros do Vite
3. **Consulte**: `TROUBLESHOOTING.md`
4. **Issues**: GitHub Issues do projeto

---

**✨ Banco de dados pronto! Você está pronto para desenvolver no ICARUS v5.0!**

---

📅 Última atualização: 2025-11-16
🔖 Versão: 1.0.0
