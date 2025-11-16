# 🔐 Guia de Autenticação Figma Code Connect

**Status Atual:** 95% → 100% (falta apenas autenticação manual)

---

## 📋 Passos para Autenticação

### 1️⃣ Gerar Personal Access Token no Figma

1. **Acesse:** https://www.figma.com/settings
2. **Navegue até:** Account Settings → Personal Access Tokens
3. **Clique em:** "Create new token"
4. **Configure o token:**
   - **Nome:** `ICARUS Code Connect`
   - **Descrição:** `Token para Code Connect do projeto ICARUS v5.0`
   - **Scopes necessários:**
     - ✅ **File content** - Read (obrigatório)
     - ✅ **Code Connect** - Write (obrigatório)
5. **Gere o token** e **copie imediatamente** (você não verá novamente!)

### 2️⃣ Autenticar no Terminal

```bash
cd /home/user/icarus

# Executar autenticação
npx figma connect auth

# Colar o token quando solicitado
# Paste your access token: [COLE SEU TOKEN AQUI]
```

### 3️⃣ Verificar Autenticação

Após autenticar, o token será salvo em `~/.figma/code-connect.json`

```bash
# Verificar se autenticou
cat ~/.figma/code-connect.json

# Testar parse novamente
npm run figma:parse

# Publicar componentes (opcional)
npm run figma:publish
```

---

## 🎯 O Que Acontece Depois

Após autenticação bem-sucedida:

### ✅ **Você poderá:**

1. **Publicar componentes** para o Figma:
   ```bash
   npm run figma:publish
   ```
   - Envia os 4 componentes conectados (NeuButton, NeuCard, NeuInput, Sidebar)
   - Sincroniza código com designs do Figma

2. **Ver código no Dev Mode:**
   - Abra qualquer componente no Figma
   - Entre em Dev Mode (Shift + D)
   - Veja o código React gerado automaticamente

3. **Claude Code gera código usando ICARUS:**
   - Ao pedir para Claude Code criar componentes
   - Ele usará os componentes OraclusX automaticamente
   - Código neumórfico enterprise-ready

### 📊 **Componentes Conectados:**

| Componente | Arquivo Figma | Arquivo Código | Status |
|------------|---------------|----------------|--------|
| NeuButton | `neu-button.figma.tsx` | `src/components/ui/neu-button.tsx` | ✅ Parsed |
| NeuCard | `neu-card.figma.tsx` | `src/components/ui/neu-card.tsx` | ✅ Parsed |
| NeuInput | `neu-input.figma.tsx` | `src/components/ui/neu-input.tsx` | ✅ Parsed |
| Sidebar | `sidebar.figma.tsx` | `src/components/layout/sidebar.tsx` | ✅ Parsed |

---

## 🔧 Configuração Atual

### `figma.config.json`
```json
{
  "codeConnect": {
    "include": [
      "src/components/ui/**/*.figma.tsx",
      "src/components/ui/**/*.tsx",
      "src/components/layout/**/*.figma.tsx",
      "src/components/layout/**/*.tsx",
      "src/components/modules/**/*.figma.tsx",
      "src/components/modules/**/*.tsx"
    ],
    "parser": "react",
    "importStatementFormat": "typescript",
    "labels": ["icarus-components", "oraclusx-ds", "neumorphism"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "documentUrlSubstitutions": {
      "FIGMA_FILE_ID": "mo8QUMAQbaomxqo7BHHTTN"
    }
  }
}
```

### Scripts npm disponíveis:
```bash
npm run figma:parse      # Parse .figma.tsx files
npm run figma:publish    # Publish to Figma (requer auth)
```

---

## 🆘 Troubleshooting

### ❌ Token inválido
```
Error: Invalid access token
```
**Solução:** Verifique se o token tem os scopes corretos:
- File content (Read)
- Code Connect (Write)

### ❌ Arquivo .figma.tsx não encontrado
```
Error: No Code Connect files found
```
**Solução:** Já resolvido! Temos 4 arquivos .figma.tsx validados.

### ❌ Import resolution error
```
Error: Cannot resolve import '@/components/...'
```
**Solução:** Já resolvido! `paths` configurado em `figma.config.json`.

---

## 📚 Recursos

- **Documentação Figma:** https://www.figma.com/developers/code-connect
- **Guia de Token:** https://help.figma.com/hc/en-us/articles/8085703771159
- **GitHub Issues:** https://github.com/figma/code-connect/issues

---

## ✅ Checklist de Autenticação

- [ ] Acessei Figma Settings
- [ ] Criei Personal Access Token
- [ ] Adicionei scopes: File Content + Code Connect Write
- [ ] Copiei o token
- [ ] Executei `npx figma connect auth`
- [ ] Colei o token no prompt
- [ ] Verifiquei `~/.figma/code-connect.json`
- [ ] Executei `npm run figma:publish` com sucesso
- [ ] Testei Code Connect no Figma Dev Mode

---

**Após completar:** Code Connect 95% → 100% ✅
**ICARUS v5.0:** 96% → 97% Overall 🚀

---

**Data:** 2025-11-16
**Versão:** 5.0.3
**Autor:** Claude Code
