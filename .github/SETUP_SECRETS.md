# 🔐 Configuração de Secrets - GitHub Actions

> Guia rápido para configurar os secrets necessários para CI/CD funcionar

---

## 📍 Como Acessar

1. Vá para o repositório no GitHub:
   ```
   https://github.com/Icarus-AI-Technology/icarus
   ```

2. Clique em **Settings** (no menu superior do repositório)

3. No menu lateral esquerdo, clique em **Secrets and variables** > **Actions**

4. Clique em **New repository secret**

---

## 🔑 Secrets Necessários

Adicione os seguintes secrets **UM POR VEZ**:

### 1. VERCEL_TOKEN

```
Name: VERCEL_TOKEN
Secret: JlUnvmSIyFGS714BwOmmnBx9
```

**Descrição**: Token de autenticação da Vercel CLI para deploy automático


### 2. VERCEL_ORG_ID

```
Name: VERCEL_ORG_ID
Secret: [Extrair do link do team invite]
```

**Como obter**:
- Link fornecido: `vercel.com/teams/invite/awyGqeT2iaXgqvagiKfjlVDGbcJ7XqWp`
- Ou acesse Vercel Dashboard > Settings > General > Team ID


### 3. VERCEL_PROJECT_ID

```
Name: VERCEL_PROJECT_ID
Secret: prj_QBuI1u2PLfKxia3jmkYLe2Z08gx7
```

**Descrição**: ID do projeto ICARUS na Vercel


### 4. VITE_SUPABASE_URL

```
Name: VITE_SUPABASE_URL
Secret: https://oshgkugagyixutiqyjsq.supabase.co
```

**Descrição**: URL do projeto Supabase


### 5. VITE_SUPABASE_ANON_KEY

```
Name: VITE_SUPABASE_ANON_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9zaGdrdWdhZ3lpeHV0aXF5anNxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzE4MDgsImV4cCI6MjA3ODgwNzgwOH0.4x2pOJLSRkT9tQbUjLQFOvPhTgmPJNm1KenkepqFlmo
```

**Descrição**: Chave anônima (public) do Supabase para autenticação client-side

---

## ✅ Verificação

Depois de adicionar todos os secrets, você deve ver:

```
Secrets (5)
├── VERCEL_TOKEN
├── VERCEL_ORG_ID
├── VERCEL_PROJECT_ID
├── VITE_SUPABASE_URL
└── VITE_SUPABASE_ANON_KEY
```

---

## 🚦 Testar CI/CD

Após configurar os secrets:

1. Abra um Pull Request (ou faça push na branch atual)
2. Vá em **Actions** no GitHub
3. Verifique se o workflow **Deploy to Vercel** está rodando
4. Aguarde todos os jobs completarem:
   - ✅ Lint & Type Check
   - ✅ Test
   - ✅ Build
   - ✅ Deploy Preview

---

## ⚠️ Importante

**NUNCA** commite secrets diretamente no código!

- ❌ `.env` (gitignored)
- ❌ Hardcoded tokens
- ✅ GitHub Secrets
- ✅ Vercel Environment Variables

---

## 📚 Referências

- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Supabase API Keys](https://supabase.com/docs/guides/api/api-keys)

---

**Status**: ✅ Pronto para configurar
**Tempo estimado**: 5 minutos
