# 🚀 Executar Migrations no Supabase

> **Guia completo para configurar o banco de dados ICARUS v5.0**

---

## 📋 3 Métodos Disponíveis

### **Método 1: Script Automático (Recomendado)** ⚡

Execute o script interativo que criamos:

```bash
./run-migrations.sh
```

**O script irá:**
1. ✅ Detectar automaticamente seu projeto Supabase
2. ✅ Listar todas as migrations disponíveis
3. ✅ Pedir a senha do banco (você pode obter em Supabase Dashboard)
4. ✅ Executar as migrations
5. ✅ Verificar se as tabelas foram criadas

---

### **Método 2: GitHub Actions (Automático)** 🤖

Se você configurar os secrets no GitHub, as migrations rodarão automaticamente a cada push:

#### **Passo 1: Configurar Secrets no GitHub**

Acesse: `https://github.com/Icarus-AI-Technology/icarus/settings/secrets/actions`

Adicione os seguintes secrets:

| Secret Name | Onde encontrar | Descrição |
|-------------|----------------|-----------|
| `SUPABASE_ACCESS_TOKEN` | [Supabase Access Tokens](https://app.supabase.com/account/tokens) | Token de acesso pessoal |
| `SUPABASE_DB_PASSWORD` | [Database Settings](https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/database) | Senha do banco postgres |

#### **Passo 2: Como obter cada secret**

**A) SUPABASE_ACCESS_TOKEN:**
```
1. Acesse: https://app.supabase.com/account/tokens
2. Clique em "Generate new token"
3. Nomeie: "ICARUS GitHub Actions"
4. Copie o token gerado
5. Cole no GitHub Secret
```

**B) SUPABASE_DB_PASSWORD:**
```
1. Acesse: https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/database
2. Procure por "Database password"
3. Clique em "Reset database password" se necessário
4. Copie a senha
5. Cole no GitHub Secret
```

#### **Passo 3: Executar**

Após configurar os secrets, as migrations rodarão automaticamente quando você:
- Fizer push para `main` (produção)
- Criar um Pull Request (preview)
- Clicar em "Run workflow" manualmente

---

### **Método 3: Manual via Supabase Dashboard** 📝

Se preferir copiar e colar manualmente:

#### **Passo 1: Acessar SQL Editor**

```
https://app.supabase.com/project/oshgkugagyixutiqyjsq/editor
```

1. Vá em: **Database** > **SQL Editor**
2. Clique em **New query**

#### **Passo 2: Copiar SQL**

```bash
# No terminal, copie o SQL:
cat supabase/migrations/001_icarus_core_schema_ptbr.sql
```

Ou leia o arquivo diretamente:

```bash
# Abrir no editor
code supabase/migrations/001_icarus_core_schema_ptbr.sql
```

#### **Passo 3: Executar**

1. Cole **TODO** o SQL no editor
2. Clique em **"Run"** (ou `Ctrl+Enter`)
3. Aguarde a execução (30-60 segundos)

#### **Passo 4: Verificar**

Vá em **Database** > **Tables** e confirme que foram criadas **12 tabelas**:

- ✅ empresas
- ✅ perfis
- ✅ categorias_produtos
- ✅ fabricantes
- ✅ produtos
- ✅ hospitais
- ✅ medicos
- ✅ cirurgias
- ✅ itens_cirurgia
- ✅ notas_fiscais
- ✅ contas_receber
- ✅ movimentacoes_estoque

---

## 🔑 Obter Senha do Banco de Dados

### **Onde encontrar:**

```
https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/database
```

### **O que procurar:**

1. **Connection string** (formato completo):
   ```
   postgresql://postgres:[SUA-SENHA]@db.oshgkugagyixutiqyjsq.supabase.co:5432/postgres
   ```

2. **Database password** (apenas a senha):
   ```
   Procure pela seção "Database password"
   Clique em "Show" ou "Reset" se necessário
   ```

### **Dica de Segurança:**

⚠️ **NUNCA** commite a senha do banco no código!

Salve em:
- `.env.local` (já está no .gitignore)
- Secrets do GitHub (para CI/CD)
- Gerenciador de senhas (1Password, LastPass, etc)

---

## ✅ Validação Pós-Execução

Após executar as migrations, verifique:

### **1. Tabelas Criadas (12 total)**

```bash
# Via script (se tiver psql instalado)
./run-migrations.sh
# Escolha a opção de listar tabelas
```

Ou manualmente no Supabase:
```
Database > Tables
```

### **2. Views Criadas (3 úteis)**

- `vw_produtos_estoque_baixo` - Produtos abaixo do estoque mínimo
- `vw_contas_vencidas` - Contas a receber vencidas
- `vw_resumo_cirurgias` - Resumo de cirurgias com valores

### **3. Triggers Ativos**

- ✅ Auto-atualização de `updated_at` (10 tabelas)
- ✅ Atualização automática de estoque

### **4. Teste de Conexão**

```bash
# Iniciar o dev server
npm run dev

# Acessar
http://localhost:5173

# Verificar console do navegador (F12)
# Deve mostrar: "✅ Supabase connected"
```

---

## 🐛 Troubleshooting

### **Erro: "permission denied"**

**Solução:** Você precisa da senha de administrador do banco.

```bash
# Acesse:
https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/database

# Reset a senha se necessário
```

---

### **Erro: "relation already exists"**

**Solução:** As tabelas já foram criadas. Isso é OK!

Se quiser recomeçar do zero:

```sql
-- ⚠️ CUIDADO: Isso apaga TUDO!
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- Depois execute a migration novamente
```

---

### **Erro: "psql: command not found"**

**Solução:** Instale o PostgreSQL client:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql-client

# macOS
brew install postgresql

# Windows (use Git Bash ou WSL)
choco install postgresql
```

---

### **Erro: "connection refused"**

**Solução:** Verifique se o projeto Supabase está ativo:

```
https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/general
```

Se estiver "Paused", clique em **"Resume"**.

---

## 📚 Próximos Passos

Após executar as migrations com sucesso:

### **1. Testar o Sistema**

```bash
npm run dev
```

Acesse: `http://localhost:5173`

### **2. Criar Primeiro Usuário**

1. Clique em **"Cadastrar"**
2. Preencha os dados
3. Faça login

### **3. Explorar os Módulos**

- 📊 **Dashboard** - Visão geral
- 📦 **Produtos** - Catálogo OPME
- 🏥 **Hospitais** - Clientes
- 👨‍⚕️ **Médicos** - Cadastro de cirurgiões
- 🔪 **Cirurgias** - Procedimentos
- 💰 **Financeiro** - Contas a receber

---

## 🆘 Ajuda Adicional

- **Documentação Completa:** `cat GUIA_SETUP_DATABASE.md`
- **Troubleshooting:** `cat TROUBLESHOOTING.md`
- **Próximos Passos:** `cat PROXIMOS_PASSOS.md`

---

## ✨ Resumo Rápido

**Para executar agora:**

```bash
# Opção 1: Script automático
./run-migrations.sh

# Opção 2: Manual
# 1. Acesse: https://app.supabase.com/project/oshgkugagyixutiqyjsq/editor
# 2. Database > SQL Editor
# 3. Cole o SQL de: supabase/migrations/001_icarus_core_schema_ptbr.sql
# 4. Clique "Run"
```

**Senha necessária?**
```
https://app.supabase.com/project/oshgkugagyixutiqyjsq/settings/database
```

**Pronto!** 🎉

---

**Versão:** 1.0.0
**Última atualização:** 2025-11-16
