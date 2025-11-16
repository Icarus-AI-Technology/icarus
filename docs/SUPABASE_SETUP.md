# 🗄️ Supabase Setup - ICARUS v5.0

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): https://supabase.com
- Node.js 20+ instalado
- Git configurado

---

## 🚀 Setup Completo (10 minutos)

### 1. Criar Projeto no Supabase

1. Acesse https://app.supabase.com
2. Clique em "New Project"
3. Preencha:
   - **Name**: icarus-v5
   - **Database Password**: (escolha uma senha segura e **anote**)
   - **Region**: South America (São Paulo)
4. Clique em "Create new project"
5. Aguarde ~2 minutos (projeto sendo provisionado)

---

### 2. Executar Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (menu lateral)
2. Clique em "+ New query"
3. Cole todo o conteúdo de `supabase/schema.sql`
4. Clique em "Run" (ou Ctrl+Enter)
5. Aguarde confirmação: ✅ Success

**O que foi criado:**
- 2 tabelas: `categories`, `products`
- Triggers para `updated_at`
- Row Level Security (RLS) policies
- 3 views para analytics
- 7 produtos de exemplo (seed data)

---

### 3. Configurar Variáveis de Ambiente

1. No dashboard do Supabase, vá em **Settings** → **API**
2. Copie as credenciais:
   - **Project URL**
   - **anon public** key

3. No projeto ICARUS, crie/edite `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui

# OpenAI (IcarusBrain) - opcional por enquanto
# OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG=false
```

**⚠️ IMPORTANTE:**
- Nunca commite `.env.local` no Git
- Use `.env.example` como template

---

### 4. Instalar Dependências

```bash
npm install
```

Isso instalará:
- `@supabase/supabase-js` - Cliente Supabase
- `zod` - Validação
- `react-hook-form` - Formulários
- `@hookform/resolvers` - Integração Zod + RHF

---

### 5. Testar Conexão

```bash
npm run dev
```

Acesse: http://localhost:3000/estoque/produtos

**Verificações:**
- ✅ KPIs mostram dados reais (7 produtos)
- ✅ Tabela lista os 7 produtos de exemplo
- ✅ Criar novo produto funciona
- ✅ Editar produto funciona
- ✅ Excluir produto funciona
- ✅ Filtros funcionam

---

## 🔍 Verificar Dados no Supabase

### Via Dashboard

1. No Supabase, vá em **Table Editor**
2. Selecione `products` ou `categories`
3. Veja os dados em tempo real
4. Edite, adicione ou remova dados diretamente

### Via SQL Editor

```sql
-- Ver todos os produtos
SELECT * FROM products ORDER BY created_at DESC;

-- Ver KPIs
SELECT * FROM vw_products_summary;

-- Ver produtos com estoque baixo
SELECT * FROM vw_low_stock_products;

-- Ver produtos com categoria
SELECT * FROM vw_products_with_category;
```

---

## 🔒 Segurança (RLS)

### Políticas Atuais

As políticas estão configuradas para:

**Leitura (SELECT)**: Todos (público)
**Escrita (INSERT/UPDATE/DELETE)**: Apenas autenticados

### Para Produção

1. Habilite autenticação:
   - Supabase Auth
   - Magic Link
   - OAuth (Google, GitHub)

2. Ajuste policies conforme necessidade:

```sql
-- Exemplo: Apenas admin pode deletar
CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

---

## 🔄 Realtime (Sincronização Automática)

O módulo de Produtos já está configurado com Realtime!

**Como funciona:**
1. Usuário A cria/edita/deleta produto
2. Supabase emite evento via WebSocket
3. Usuário B recebe atualização instantânea
4. Lista e KPIs atualizam automaticamente

**Ver código:**
`src/modules/estoque/produtos/hooks/useProducts.ts:65-80`

---

## 📊 Gerar Types TypeScript

Sempre que alterar o schema SQL, regenere os types:

```bash
npm run db:types
```

Isso atualiza `src/types/supabase.ts` com os tipos corretos.

**Nota**: Requer Supabase CLI instalado:
```bash
npm install -g supabase
supabase login
supabase link --project-ref seu-project-ref
```

---

## 🐛 Troubleshooting

### Erro: "Invalid API key"

**Causa**: `.env.local` não configurado ou incorreto

**Solução**:
1. Verificar `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. Copiar novamente do dashboard Supabase
3. Reiniciar `npm run dev`

---

### Erro: "relation 'products' does not exist"

**Causa**: Schema SQL não executado

**Solução**:
1. Ir no SQL Editor do Supabase
2. Executar `supabase/schema.sql` completo
3. Verificar sucesso (✅)

---

### Erro: "new row violates row-level security policy"

**Causa**: Tentando inserir/atualizar sem permissão

**Solução**:
1. Verificar policies em RLS
2. Temporariamente desabilitar RLS para testes:
   ```sql
   ALTER TABLE products DISABLE ROW LEVEL SECURITY;
   ```
3. **Não fazer isso em produção!**

---

### Produtos não aparecem

**Causa**: Seed data não inserido ou filtros ativos

**Solução**:
1. Executar parte de seed data do schema.sql
2. Verificar filtros na interface
3. Ver no Table Editor do Supabase

---

## 📚 Próximos Passos

### 1. Adicionar Autenticação

```bash
# Habilitar Supabase Auth no dashboard
# Implementar login/logout
# Ajustar RLS policies
```

### 2. Adicionar Mais Módulos

Use o módulo Produtos como template:
- Vendas
- Compras
- Financeiro

### 3. Implementar Storage

```typescript
// Upload de imagens de produtos
import { supabase } from '@/lib/supabase'

const { data, error } = await supabase.storage
  .from('products')
  .upload('product.jpg', file)
```

### 4. Adicionar Edge Functions

Para lógica backend complexa:
```bash
supabase functions new minha-funcao
```

---

## 🎯 Checklist Final

Setup completo quando:

- [ ] Projeto Supabase criado
- [ ] Schema SQL executado
- [ ] `.env.local` configurado
- [ ] Dependências instaladas (`npm install`)
- [ ] App rodando (`npm run dev`)
- [ ] 7 produtos aparecem na lista
- [ ] CRUD funciona (criar/editar/excluir)
- [ ] KPIs mostram valores corretos
- [ ] Realtime funciona (testar em 2 abas)

---

## 📞 Suporte

**Documentação Supabase**: https://supabase.com/docs

**Troubleshooting ICARUS**: Ver `TROUBLESHOOTING.md`

**Issues**: GitHub Issues do projeto

---

**Versão**: 1.0.0
**Data**: 2025-11-15
**Status**: ✅ Guia completo

🗄️ **Supabase configurado e pronto para produção!**
