# 🔧 Guia de Resolução de Conflitos de Merge

## 🚨 Situação Atual

Você está com conflitos de merge no GitHub entre o branch atual e o main.

---

## 📋 Solução Passo a Passo

### **Opção 1: Resolver via GitHub (Recomendado para iniciantes)**

1. **Acesse o Pull Request no GitHub**
   - Vá para: https://github.com/seu-usuario/icarus/pulls
   - Clique no seu Pull Request

2. **Resolver conflitos pelo GitHub**
   - GitHub mostrará botão "Resolve conflicts"
   - Clique nele
   - Você verá os arquivos com conflito marcados assim:

```
<<<<<<< HEAD (seu branch)
Seu código aqui
=======
Código do main aqui
>>>>>>> main
```

3. **Para cada conflito, escolha:**
   - **Manter suas mudanças**: Delete as linhas do main
   - **Manter mudanças do main**: Delete suas linhas
   - **Manter ambas**: Combine as duas versões

4. **Marcar como resolvido**
   - Clique em "Mark as resolved"
   - Clique em "Commit merge"

---

### **Opção 2: Resolver Localmente (Recomendado para você)**

#### Passo 1: Descartar mudanças temporárias

```bash
cd /Users/daxmeneghel/.cursor/worktrees/icarus/TLjz5

# Fazer stash das mudanças problemáticas
git stash push -m "mudanças temporárias"

# Verificar status
git status
```

#### Passo 2: Atualizar com o main

```bash
# Buscar mudanças do remoto
git fetch origin

# Fazer merge do main no seu branch
git merge origin/main

# Ou se preferir rebase:
# git rebase origin/main
```

#### Passo 3: Se houver conflitos, resolver

```bash
# Git mostrará arquivos com conflito
# Para ver quais são:
git status

# Para cada arquivo com conflito, abra e edite manualmente
# Depois marque como resolvido:
git add arquivo-resolvido.tsx

# Quando todos estiverem resolvidos:
git commit -m "Resolver conflitos de merge com main"
```

#### Passo 4: Aplicar stash de volta (se necessário)

```bash
# Ver stashes
git stash list

# Aplicar o stash
git stash pop
```

#### Passo 5: Push final

```bash
git push origin 2025-11-16-okx9-TLjz5
```

---

### **Opção 3: Criar novo branch limpo (Mais seguro)**

Se os conflitos estiverem muito complicados:

```bash
# 1. Criar backup do trabalho atual
cd /Users/daxmeneghel/.cursor/worktrees/icarus/TLjz5
cp -r . ../icarus-backup

# 2. Voltar para main
git checkout main
git pull origin main

# 3. Criar novo branch
git checkout -b landing-page-nova

# 4. Copiar arquivos novos que você criou
cp ../icarus-backup/src/pages/HomePage.tsx src/pages/
cp ../icarus-backup/src/pages/LoginPage.tsx src/pages/
cp ../icarus-backup/src/components/landing/ContactForm.tsx src/components/landing/
cp ../icarus-backup/supabase/migrations/005_create_leads_table.sql supabase/migrations/
cp ../icarus-backup/supabase/functions/send-lead-email/index.ts supabase/functions/send-lead-email/
# ... copiar outros arquivos novos

# 5. Commit e push
git add .
git commit -m "feat: Adicionar landing page completa"
git push origin landing-page-nova

# 6. Criar novo PR no GitHub
```

---

## 🎯 Arquivos que Podem Ter Conflito

Baseado no seu commit, esses são os mais prováveis:

1. **src/App.tsx** - Mudanças nas rotas
2. **src/index.css** - Novas animações
3. **package.json** - Novas dependências
4. **CLAUDE.md** - Documentação

---

## 📝 Como Resolver Conflitos Comuns

### **Conflito no App.tsx (Rotas)**

```typescript
<<<<<<< HEAD
// Seu código (rotas públicas/protegidas)
<Route path="/" element={<HomePage />} />
<Route path="/login" element={<LoginPage />} />
=======
// Código do main (rotas antigas)
<IcarusLayout>
  <Routes>
    {/* rotas antigas */}
  </Routes>
</IcarusLayout>
>>>>>>> main
```

**Solução**: Manter suas mudanças (rotas públicas/protegidas são melhores)

---

### **Conflito no package.json**

```json
<<<<<<< HEAD
"dependencies": {
  "react": "^18.3.1",
  "nova-lib": "^1.0.0"  // sua nova dependência
}
=======
"dependencies": {
  "react": "^18.3.1"
}
>>>>>>> main
```

**Solução**: Combinar ambas (manter todas as dependências)

---

### **Conflito no index.css**

```css
<<<<<<< HEAD
/* Suas animações */
@keyframes fadeInUp { ... }
=======
/* Código do main */
.neu-card { ... }
>>>>>>> main
```

**Solução**: Manter ambos (suas animações + estilos existentes)

---

## 🚨 Comandos de Emergência

Se tudo der errado:

```bash
# Abortar merge
git merge --abort

# Voltar para estado anterior
git reset --hard HEAD

# Descartar todas as mudanças locais
git reset --hard origin/2025-11-16-okx9-TLjz5
```

---

## ✅ Checklist de Resolução

- [ ] Identificar arquivos com conflito
- [ ] Abrir cada arquivo no editor
- [ ] Procurar por marcadores `<<<<<<<`, `=======`, `>>>>>>>`
- [ ] Decidir o que manter (seu código, código do main, ou ambos)
- [ ] Remover os marcadores de conflito
- [ ] Testar se o código funciona (`npm run dev`)
- [ ] Fazer commit das resoluções
- [ ] Push para o GitHub
- [ ] Verificar se o PR pode ser mergeado

---

## 🎯 Comando Recomendado Agora

Execute este comando para começar:

```bash
cd /Users/daxmeneghel/.cursor/worktrees/icarus/TLjz5
git stash
git status
```

Depois me informe o resultado e eu te ajudo com o próximo passo!

---

## 📞 Precisa de Ajuda?

Se tiver dúvidas em qualquer etapa:
1. Me mostre a saída do `git status`
2. Me mostre o conteúdo do arquivo com conflito
3. Vou te ajudar a resolver!

---

**Importante**: Não tenha medo de conflitos! Eles são normais e resolvê-los é uma habilidade importante. 💪

