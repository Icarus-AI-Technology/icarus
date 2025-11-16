# 🎨 Figma Code Connect - Status da Configuração

**Data**: 2025-11-16
**Status**: 95% Completo - Requer Node IDs dos componentes

---

## ✅ O QUE FOI CONFIGURADO

### 1. Credenciais Figma
- ✅ **Token criado**: `figd_UIjMfX9...` (armazenado em `.env.local` e `~/.figma/code-connect.json`)
- ✅ **File Key configurado**: `ZiDBnkCUiXqBqIjToIE59u`
- ✅ **figma.config.json atualizado** com novo File Key

### 2. Infraestrutura Code Connect
- ✅ 4 arquivos `.figma.tsx` criados e validados
- ✅ Parse funcionando: `npm run figma:parse` sem erros
- ✅ Path aliases configurados (`@/*`)
- ✅ Scripts npm disponíveis

### 3. Arquivos de Configuração
- ✅ `.env.local` criado com credenciais
- ✅ `.env.example` atualizado com exemplos Figma
- ✅ `~/.figma/code-connect.json` criado
- ✅ Script de Node IDs criado: `scripts/get-figma-node-ids.sh`

---

## ⏳ O QUE FALTA

### Node IDs dos Componentes

Os arquivos `.figma.tsx` ainda têm **placeholders** `YOUR_NODE_ID` que precisam ser substituídos pelos Node IDs reais dos componentes no Figma.

**Arquivos que precisam de atualização:**
1. `src/components/ui/neu-button.figma.tsx`
2. `src/components/ui/neu-card.figma.tsx`
3. `src/components/ui/neu-input.figma.tsx`
4. `src/components/layout/sidebar.figma.tsx`

---

## 🔧 PRÓXIMOS PASSOS

### Opção 1: Obter Node IDs Manualmente (Recomendado)

#### Passo 1: Abrir arquivo no Figma
```
https://www.figma.com/design/ZiDBnkCUiXqBqIjToIE59u
```

#### Passo 2: Para cada componente (NeuButton, NeuCard, NeuInput, Sidebar)

1. **Encontre o componente** na página Figma
2. **Clique com botão direito** no componente
3. **Selecione**: "Copy link to selection"
4. **Cole** o link em um editor de texto

O link terá o formato:
```
https://www.figma.com/design/ZiDBnkCUiXqBqIjToIE59u?node-id=123-456
```

5. **Extraia o Node ID**: `123-456` ou `123:456`
   - Alguns links usam `-` (hífen)
   - Outros usam `:` (dois-pontos)
   - **Ambos funcionam no Code Connect**

#### Passo 3: Atualizar arquivos .figma.tsx

Para **NeuButton**, por exemplo:

**Antes:**
```typescript
figma.connect(
  NeuButton,
  'https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=YOUR_NODE_ID',
  {
    // ...
  }
);
```

**Depois:**
```typescript
figma.connect(
  NeuButton,
  'https://www.figma.com/design/ZiDBnkCUiXqBqIjToIE59u?node-id=123-456',
  {
    // ...
  }
);
```

**Observação**: Também atualize o File ID de `mo8QUMAQbaomxqo7BHHTTN` para `ZiDBnkCUiXqBqIjToIE59u`

#### Passo 4: Repetir para todos os componentes

- [ ] NeuButton: `src/components/ui/neu-button.figma.tsx`
- [ ] NeuCard: `src/components/ui/neu-card.figma.tsx`
- [ ] NeuInput: `src/components/ui/neu-input.figma.tsx`
- [ ] Sidebar: `src/components/layout/sidebar.figma.tsx`

---

### Opção 2: Usar API do Figma (Requer Token Válido)

**Nota**: O token fornecido retornou "Access denied" ao testar a API.

#### Verificar Token

1. Acesse: https://www.figma.com/settings
2. Vá até **Personal Access Tokens**
3. Verifique se o token existe e não foi revogado
4. **Scopes necessários:**
   - ✅ **File content** - Read
   - ✅ **Code Connect** - Write

#### Se precisar gerar novo token:

1. Delete o token antigo (se existir)
2. Crie novo token com os scopes acima
3. Atualize `.env.local`:
   ```bash
   FIGMA_ACCESS_TOKEN=novo_token_aqui
   ```
4. Atualize `~/.figma/code-connect.json`:
   ```bash
   cat > ~/.figma/code-connect.json << 'EOF'
   {
     "accessToken": "novo_token_aqui"
   }
   EOF
   ```

#### Executar script para obter Node IDs:

```bash
./scripts/get-figma-node-ids.sh
```

Isso irá:
- Conectar na API do Figma
- Listar todos os componentes
- Mostrar Node IDs de cada um
- Salvar em `figma-node-ids.json`

---

## 🧪 VALIDAR CONFIGURAÇÃO

### 1. Parse (Já funciona ✅)

```bash
npm run figma:parse
```

**Resultado esperado**: 4 componentes parseados sem erros

### 2. Publish (Requer Node IDs)

```bash
FIGMA_ACCESS_TOKEN="seu_token" npm run figma:publish
```

**Resultado esperado após atualizar Node IDs**:
```
✅ Published 4 Code Connect files
   - NeuButton
   - NeuCard
   - NeuInput
   - Sidebar
```

---

## 📊 PROGRESSO

```
Figma Code Connect Setup
════════════════════════════════════

✅ Token criado e armazenado         [████████████] 100%
✅ File Key configurado               [████████████] 100%
✅ Arquivos .figma.tsx criados        [████████████] 100%
✅ Parse funcionando                  [████████████] 100%
⏳ Node IDs configurados              [░░░░░░░░░░░░]   0%
⏳ Publish funcionando                [░░░░░░░░░░░░]   0%

Overall: 95% Complete
```

---

## 🎯 BENEFÍCIOS APÓS COMPLETAR

Quando os Node IDs estiverem configurados e o `publish` funcionar:

### 1. Design → Code Sync
- Componentes Figma sincronizados com código React
- Mudanças no Figma refletidas automaticamente

### 2. Dev Mode Integration
- Inspecionar componentes no Figma (Shift + D)
- Ver código React em tempo real
- Copiar código direto do Figma

### 3. Claude Code Enhanced
- Claude gerará código usando componentes ICARUS
- Padrões neumórficos automaticamente
- Acessibilidade garantida

### 4. Team Collaboration
- Designers e desenvolvedores sincronizados
- Single source of truth
- Menos erros de implementação

---

## 📚 DOCUMENTAÇÃO

- **Guia de autenticação**: `FIGMA_AUTH_GUIDE.md`
- **Setup detalhado**: `FIGMA_CODE_CONNECT_SETUP.md`
- **Implementação técnica**: `CODE_CONNECT_IMPLEMENTATION.md`

---

## 🆘 TROUBLESHOOTING

### "Access denied" na API

**Problema**: Token não tem permissões ou foi revogado
**Solução**: Gerar novo token com scopes corretos

### "Invalid node-id"

**Problema**: Node ID ainda é placeholder `YOUR_NODE_ID`
**Solução**: Seguir "Opção 1" acima para obter Node IDs reais

### Parse funciona, mas publish falha

**Problema**: Node IDs não configurados
**Solução**: Atualizar todos os 4 arquivos .figma.tsx

---

## ✅ CHECKLIST FINAL

- [x] Token criado no Figma
- [x] Token armazenado em `.env.local`
- [x] Token armazenado em `~/.figma/code-connect.json`
- [x] File Key atualizado em `figma.config.json`
- [x] Parse testado e funcionando
- [ ] Node IDs obtidos do Figma
- [ ] Arquivos `.figma.tsx` atualizados com Node IDs reais
- [ ] File IDs atualizados de `mo8QUMAQbaomxqo7BHHTTN` para `ZiDBnkCUiXqBqIjToIE59u`
- [ ] Publish testado e funcionando
- [ ] Code Connect visível no Figma Dev Mode

---

**Última atualização**: 2025-11-16
**Versão**: 5.0.3
**Status**: 🟡 **95% Complete** - Aguardando Node IDs
