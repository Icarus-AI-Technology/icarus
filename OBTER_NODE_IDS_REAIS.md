# 🎯 Como Obter Node IDs Reais do Figma Make

**Arquivo Figma Make:** `mo8QUMAQbaomxqo7BHHTTN`
**URL:** https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/Icarus-Cursor--cópia-

---

## ✅ **FILE ID CORRIGIDO!**

```
❌ ANTES: ZiDBnkCUiXqBqIjToIE59u (incorreto)
✅ AGORA: mo8QUMAQbaomxqo7BHHTTN (correto!)
```

**Arquivos atualizados:**
- ✅ `figma.config.json`
- ✅ `src/components/ui/neu-button.figma.tsx`
- ✅ `src/components/ui/neu-card.figma.tsx`
- ✅ `src/components/ui/neu-input.figma.tsx`
- ✅ `src/components/layout/sidebar.figma.tsx`

---

## 🎨 **MÉTODO 1: Via Interface Web Figma Make** (RECOMENDADO)

### **Passo 1: Acessar o Arquivo**

```
https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/Icarus-Cursor--cópia-
```

### **Passo 2: Localizar Componentes**

No Figma Make, procure por estes componentes:
- **NeuButton** (ou Button, ou Botão)
- **NeuCard** (ou Card, ou Cartão)
- **NeuInput** (ou Input, ou Campo de texto)
- **Sidebar** (ou Menu lateral)

### **Passo 3: Obter Node ID de Cada Componente**

Para cada componente:

1. **Clique no componente** no canvas
2. **Verifique a URL** - ela mudará para algo como:
   ```
   https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/...?node-id=123-456
   ```
3. **Copie o Node ID**: `123-456` (a parte depois de `node-id=`)

### **Passo 4: Anotar Node IDs**

Crie uma lista com os Node IDs encontrados:

```
NeuButton: <node-id aqui>
NeuCard: <node-id aqui>
NeuInput: <node-id aqui>
Sidebar: <node-id aqui>
```

### **Passo 5: Atualizar Arquivos .figma.tsx**

Execute o script de atualização:

```bash
./ATUALIZAR_NODE_IDS_REAIS.sh
```

Quando solicitado, informe os Node IDs que você copiou.

---

## 🔧 **MÉTODO 2: Via Browser DevTools** (ALTERNATIVO)

### **Passo 1: Abrir DevTools**

1. Acesse o arquivo Figma Make
2. Pressione **F12** (ou Cmd+Opt+I no Mac)
3. Vá para aba **Network**

### **Passo 2: Navegar pelos Componentes**

1. Clique em cada componente no canvas
2. Observe as requisições de rede
3. Procure por chamadas que contenham `node-id`

### **Passo 3: Extrair Node IDs**

Nos requests, procure por:
```json
{
  "nodeId": "123:456",
  "name": "NeuButton"
}
```

---

## 📝 **MÉTODO 3: Inspecionar HTML** (RÁPIDO)

### **Passo 1: Inspecionar Elemento**

1. Acesse o arquivo Figma Make
2. **Right-click** em um componente
3. Selecione **"Inspect"** ou **"Inspecionar"**

### **Passo 2: Procurar node-id**

No HTML, procure por atributos como:
```html
<div data-node-id="123-456">
```

---

## 🚀 **SCRIPT DE ATUALIZAÇÃO**

### **ATUALIZAR_NODE_IDS_REAIS.sh**

```bash
#!/bin/bash

# 🎨 Atualizar Node IDs Reais do Figma Make

echo "═══════════════════════════════════════════════════════════"
echo "  🎨 Atualizar Node IDs Reais - Figma Make"
echo "═══════════════════════════════════════════════════════════"
echo ""

echo "Arquivo Figma Make:"
echo "https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/Icarus-Cursor--cópia-"
echo ""

# Solicitar Node IDs
read -p "Node ID do NeuButton (ex: 123-456): " NODE_BUTTON
read -p "Node ID do NeuCard (ex: 789-012): " NODE_CARD
read -p "Node ID do NeuInput (ex: 345-678): " NODE_INPUT
read -p "Node ID do Sidebar (ex: 901-234): " NODE_SIDEBAR

echo ""
echo "Aplicando Node IDs..."

# Atualizar cada arquivo
sed -i "s|node-id=1001-2001|node-id=$NODE_BUTTON|g" src/components/ui/neu-button.figma.tsx
sed -i "s|node-id=1002-2002|node-id=$NODE_CARD|g" src/components/ui/neu-card.figma.tsx
sed -i "s|node-id=1003-2003|node-id=$NODE_INPUT|g" src/components/ui/neu-input.figma.tsx
sed -i "s|node-id=1004-2004|node-id=$NODE_SIDEBAR|g" src/components/layout/sidebar.figma.tsx

echo ""
echo "✅ Node IDs atualizados com sucesso!"
echo ""
echo "Componentes atualizados:"
echo "  • NeuButton → $NODE_BUTTON"
echo "  • NeuCard → $NODE_CARD"
echo "  • NeuInput → $NODE_INPUT"
echo "  • Sidebar → $NODE_SIDEBAR"
echo ""
```

---

## 🎯 **EXEMPLO PRÁTICO**

### **Cenário: Encontrei os Node IDs**

```
NeuButton: 12-34
NeuCard: 56-78
NeuInput: 90-12
Sidebar: 34-56
```

### **Executar Script:**

```bash
chmod +x ATUALIZAR_NODE_IDS_REAIS.sh
./ATUALIZAR_NODE_IDS_REAIS.sh
```

### **Informar quando solicitado:**

```
Node ID do NeuButton: 12-34
Node ID do NeuCard: 56-78
Node ID do NeuInput: 90-12
Node ID do Sidebar: 34-56
```

### **Resultado:**

```
✅ src/components/ui/neu-button.figma.tsx
   https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=12-34

✅ src/components/ui/neu-card.figma.tsx
   https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=56-78

✅ src/components/ui/neu-input.figma.tsx
   https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=90-12

✅ src/components/layout/sidebar.figma.tsx
   https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=34-56
```

---

## 🧪 **TESTAR APÓS ATUALIZAR**

### **1. Verificar Parse:**

```bash
npm run figma:parse
```

### **2. Verificar Node IDs:**

```bash
grep "node-id=" src/components/**/*.figma.tsx
```

### **3. Publicar (Opcional):**

```bash
FIGMA_ACCESS_TOKEN="figd_UIjMfX9lHzWsJnuMSnyxBnso02p-Rn_COzA15RzM" npm run figma:publish
```

---

## 📊 **COMPARAÇÃO**

| Item | Node IDs Genéricos | Node IDs Reais |
|------|-------------------|----------------|
| **Parse Local** | ✅ Funciona | ✅ Funciona |
| **Figma Dev Mode** | ❌ Não aparece | ✅ Aparece |
| **Sync Design ↔ Code** | ❌ Não | ✅ Sim |
| **Publicar** | ⚠️ Limitado | ✅ Completo |
| **Desenvolvimento** | ✅ Pronto | ✅ Pronto |

---

## 💡 **DICAS**

### **Se não encontrar componentes:**

1. **Busque por variações de nome:**
   - "Button" em vez de "NeuButton"
   - "Card" em vez de "NeuCard"
   - etc.

2. **Crie componentes simples:**
   - Crie frames com os nomes exatos
   - Converta em componentes (Ctrl+Alt+K)
   - Obtenha Node IDs

3. **Use componentes existentes:**
   - Qualquer botão serve como "NeuButton"
   - Qualquer card serve como "NeuCard"
   - etc.

### **Formatação do Node ID:**

✅ **Aceito:**
- `123-456` (com hífen)
- `123:456` (com dois-pontos)

❌ **NÃO aceito:**
- `123456` (sem separador)
- `123_456` (underscore)

---

## 🎯 **STATUS ATUAL**

```
✅ File ID: CORRIGIDO (mo8QUMAQbaomxqo7BHHTTN)
✅ Arquivos .figma.tsx: ATUALIZADOS
⏳ Node IDs: GENÉRICOS (podem ser substituídos)

Progresso: 100% funcional
Sync real: Após obter Node IDs reais
```

---

## 🆘 **TROUBLESHOOTING**

### **Problema: Componentes não aparecem no Figma Make**

**Solução:** Figma Make pode ter componentes com nomes diferentes. Busque por:
- Frames principais
- Elementos de UI
- Botões/Cards/Inputs genéricos

### **Problema: URL não muda ao clicar**

**Solução:**
1. Certifique-se de estar clicando no layer no painel esquerdo
2. Tente selecionar via "Layers" panel
3. Use DevTools para inspecionar

### **Problema: Node ID muito longo**

**Solução:** Figma Make pode usar IDs diferentes. Copie exatamente como aparece.

---

## ✅ **PRÓXIMOS PASSOS**

1. **Agora:**
   - ✅ File ID corrigido
   - ✅ Sistema funcional com IDs genéricos

2. **Quando tiver tempo:**
   - 📋 Acessar Figma Make
   - 🔍 Localizar componentes
   - 📝 Copiar Node IDs reais
   - 🚀 Atualizar com script
   - 🎉 Publicar para Figma

3. **Benefícios ao atualizar:**
   - Ver código no Figma Dev Mode
   - Sincronização bidirecional
   - Claude Code usa componentes reais

---

**Data:** 2025-11-16
**File ID:** mo8QUMAQbaomxqo7BHHTTN ✅
**URL:** https://www.figma.com/make/mo8QUMAQbaomxqo7BHHTTN/Icarus-Cursor--cópia-

---

🎯 **Quando estiver pronto, siga os passos acima para obter Node IDs reais!**
