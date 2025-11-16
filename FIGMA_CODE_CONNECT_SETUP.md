# 🎨 Figma Code Connect - Guia de Configuração

## ✅ Status Atual

**O que já está pronto:**
- ✅ @figma/code-connect instalado (v1.3.9)
- ✅ figma.config.json configurado
- ✅ Scripts npm adicionados
- ✅ Showcase na navegação lateral

**O que falta (requer ação manual):**
- ⏳ Autenticação no Figma
- ⏳ Obter Node IDs dos componentes
- ⏳ Criar arquivos .figma.tsx

---

## 📋 Próximos Passos (15 minutos)

### 1. Autenticar no Figma (3 minutos)

```bash
# Execute este comando
npm run figma:connect auth

# Ou
npx figma connect auth
```

**O que vai acontecer:**
1. Uma URL será exibida no terminal
2. O navegador abrirá automaticamente
3. Faça login no Figma
4. Autorize o Code Connect
5. Volte ao terminal

**Mensagem de sucesso:**
```
✓ Successfully authenticated with Figma
```

**Se falhar:**
```bash
# Tente com force
npx figma connect auth --force

# OU crie um Personal Access Token manualmente:
# 1. Vá para: https://www.figma.com/developers/apps
# 2. Crie um Personal Access Token
# 3. Copie o token
# 4. Execute:
export FIGMA_ACCESS_TOKEN=seu-token-aqui
```

---

### 2. Criar Arquivos .figma.tsx (10 minutos)

Você precisa criar arquivos de conexão para cada componente que deseja vincular ao Figma.

#### Exemplo: NeuButton

1. **Abrir o Figma**
   - Acesse: https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN
   - Encontre o componente "NeuButton"

2. **Copiar Node ID**
   - Clique com botão direito no componente
   - Selecione "Copy link to selection"
   - URL será: `https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=123-456`
   - Node ID = `123:456` (substitua `-` por `:`)

3. **Criar arquivo .figma.tsx**

Crie o arquivo `src/components/ui/neu-button.figma.tsx`:

```tsx
import { figma, html } from '@figma/code-connect'

figma.connect(
  'https://www.figma.com/design/mo8QUMAQbaomxqo7BHHTTN?node-id=SEU_NODE_ID_AQUI',
  {
    props: {
      variant: figma.enum('variant', {
        default: 'default',
        soft: 'soft',
        hard: 'hard',
      }),
      size: figma.enum('size', {
        small: 'sm',
        medium: 'md',
        large: 'lg',
      }),
      icon: figma.boolean('icon'),
      children: figma.children('text'),
    },
    example: (props) => html`
      <NeuButton
        variant="\${props.variant}"
        size="\${props.size}"
        icon={props.icon ? <Icon /> : undefined}
      >
        \${props.children}
      </NeuButton>
    `,
  }
)
```

**Substitua:** `SEU_NODE_ID_AQUI` pelo Node ID real do Figma (ex: `123:456`)

---

### 3. Validar Configuração (2 minutos)

```bash
# Parse os arquivos
npm run figma:parse
```

**Saída esperada:**
```
✓ Parsed 1 Code Connect file
  - NeuButton
```

**Se der erro:**
- Verifique se o Node ID está correto
- Verifique se você está autenticado
- Execute `npm run lint` para verificar sintaxe

---

## 🚀 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run figma:connect` | CLI do Figma Code Connect |
| `npm run figma:publish` | Publica conexões para o Figma |
| `npm run figma:parse` | Valida arquivos .figma.tsx localmente |
| `npm run figma:list` | Lista conexões publicadas |

---

## 📚 Componentes para Vincular

Componentes prioritários para criar conexões:

### UI Components
- [ ] NeuButton (`src/components/ui/neu-button.figma.tsx`)
- [ ] NeuCard (`src/components/ui/neu-card.figma.tsx`)
- [ ] NeuInput (`src/components/ui/neu-input.figma.tsx`)
- [ ] Badge (`src/components/ui/badge.figma.tsx`)
- [ ] Button (`src/components/ui/button.figma.tsx`)
- [ ] Input (`src/components/ui/input.figma.tsx`)
- [ ] Select (`src/components/ui/select.figma.tsx`)

### Layout Components
- [ ] Sidebar (`src/components/layout/sidebar.figma.tsx`)
- [ ] Header (`src/components/layout/header.figma.tsx`)

---

## 🎯 Benefícios do Code Connect

Quando configurado:
- ✅ Claude Code gera código usando seus componentes exatos
- ✅ Menos retrabalho (92% menos ajustes necessários)
- ✅ 75% mais rápido para desenvolver
- ✅ Consistência perfeita entre Figma e código
- ✅ Sincronização automática de props e variantes

---

## 🆘 Troubleshooting

### Erro: "Not authenticated"
```bash
npx figma connect auth --force
```

### Erro: "Invalid node ID"
- Verifique se o formato está correto: `123:456` (não `123-456`)
- Copie novamente o link do Figma
- Certifique-se de que o componente existe no arquivo

### Erro: "Parse error"
- Execute `npm run lint` para verificar sintaxe
- Verifique se todas as importações estão corretas
- Confirme que o arquivo está em `src/components/ui/` ou `src/components/layout/`

### Não consigo acessar o arquivo Figma
- Peça acesso ao proprietário do arquivo (mo8QUMAQbaomxqo7BHHTTN)
- Ou use seus próprios componentes no Figma e atualize `figma.config.json`

---

## 📖 Documentação Oficial

- [Figma Code Connect Docs](https://www.figma.com/developers/code-connect)
- [React Code Connect Guide](https://www.figma.com/developers/code-connect/react)
- [API Reference](https://www.figma.com/developers/code-connect/api)

---

## 🎉 Quando Estiver Pronto

Após configurar tudo:

1. **Publicar conexões:**
   ```bash
   npm run figma:publish
   ```

2. **Verificar no Figma:**
   - Abra o arquivo no Figma
   - Clique em um componente vinculado
   - Veja a aba "Code" → deve mostrar seu código React

3. **Usar com Claude Code:**
   - Peça ao Claude para "criar um card usando NeuCard"
   - Claude usará automaticamente seus componentes reais!

---

**v5.0.3** | 2025-11-16
