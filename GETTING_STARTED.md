# 🎯 ICARUS v5.0 - Getting Started

## Setup Rápido em 3 Passos

### 1️⃣ Instalação (2 minutos)

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/icarus-v5.git
cd icarus-v5

# Instalar dependências
npm install
```

### 2️⃣ Configuração (3 minutos)

```bash
# Copiar variáveis de ambiente
cp .env.example .env.local

# Editar com suas credenciais
nano .env.local
```

**Preencha:**
```bash
# Supabase (obrigatório)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key

# Anthropic Claude (opcional - para IA)
VITE_ANTHROPIC_API_KEY=sk-ant-...
```

**Como obter:**
- **Supabase**: https://supabase.com → Novo projeto → Settings → API
- **Anthropic**: https://console.anthropic.com → API Keys

### 3️⃣ Rodar (30 segundos)

```bash
npm run dev
```

Acesse: **http://localhost:3000**

✅ **ICARUS está rodando!**

---

## 🎨 Ver Componentes

Acesse a página de showcase para ver todos os componentes:

**http://localhost:3000/showcase**

Você verá:
- ✅ Todos os componentes Neumorphism
- ✅ Variantes e tamanhos
- ✅ Estados (loading, disabled, error)
- ✅ Exemplos interativos
- ✅ Formulário completo

---

## 📚 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes base (NeuButton, NeuCard, etc)
│   │   ├── layout/          # Layout (Sidebar, Header)
│   │   └── modules/         # Módulos do sistema
│   ├── pages/               # Páginas
│   ├── lib/                 # Utilitários e configs
│   └── hooks/               # Custom hooks
├── docs/                    # Documentação
└── figma.config.json        # Code Connect config
```

---

## 🧩 Usar Componentes

### Exemplo 1: Botão Simples

```tsx
import { NeuButton } from '@/components/ui/neu-button'

<NeuButton variant="soft">
  Clique aqui
</NeuButton>
```

### Exemplo 2: Card com Dados

```tsx
import { NeuCard } from '@/components/ui/neu-card'
import { Icon3D } from '@/components/ui/icon-3d'

<NeuCard variant="soft" elevation="medium" padding="lg">
  <div className="flex items-center gap-4">
    <Icon3D name="wallet" size="lg" />
    <div>
      <p className="text-sm text-gray-600">Saldo</p>
      <p className="text-2xl font-bold">R$ 125.430</p>
    </div>
  </div>
</NeuCard>
```

### Exemplo 3: Formulário

```tsx
import { NeuInput } from '@/components/ui/neu-input'
import { NeuButton } from '@/components/ui/neu-button'

<form>
  <NeuInput
    label="Nome *"
    placeholder="Digite o nome"
    required
  />

  <NeuButton variant="soft" type="submit">
    Salvar
  </NeuButton>
</form>
```

---

## 🚀 Code Connect (Opcional)

Para usar Code Connect e deixar Claude Code gerar código perfeito automaticamente:

```bash
# 1. Autenticar
npx figma connect auth

# 2. Publicar componentes
npm run figma:publish

# 3. Verificar
npm run figma:list
```

**Ver guia completo:** [CODE_CONNECT_IMPLEMENTATION.md](./CODE_CONNECT_IMPLEMENTATION.md)

---

## 📖 Documentação

| Arquivo | Descrição |
|---------|-----------|
| [README.md](./README.md) | Visão geral do projeto |
| [QUICKSTART.md](./QUICKSTART.md) | Quick start guide |
| [CODE_CONNECT_IMPLEMENTATION.md](./CODE_CONNECT_IMPLEMENTATION.md) | Implementar Code Connect (15min) |
| [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) | Solução de problemas |
| [docs/code-connect-analysis.md](./docs/code-connect-analysis.md) | Análise ROI do Code Connect |

---

## 🎯 Próximos Passos

### 1. Explorar Showcase

```bash
# Abrir no navegador
http://localhost:3000/showcase
```

Interaja com todos os componentes!

### 2. Criar Seu Primeiro Componente

Crie `src/pages/TestePage.tsx`:

```tsx
import { NeuButton } from '@/components/ui/neu-button'
import { NeuCard } from '@/components/ui/neu-card'

export default function TestePage() {
  return (
    <div className="p-8">
      <NeuCard variant="soft" padding="lg">
        <h1 className="text-2xl font-bold mb-4">
          Minha Primeira Página
        </h1>
        <NeuButton variant="primary">
          Clique aqui
        </NeuButton>
      </NeuCard>
    </div>
  )
}
```

### 3. Estudar Módulo Exemplo

Ver: `src/components/modules/Produtos.tsx`

Módulo completo com:
- ✅ CRUD
- ✅ Filtros
- ✅ Validações
- ✅ Integração IA
- ✅ Supabase

### 4. Implementar Code Connect

Siga: [CODE_CONNECT_IMPLEMENTATION.md](./CODE_CONNECT_IMPLEMENTATION.md)

Benefícios:
- 75% mais rápido
- 92% menos retrabalho
- Código perfeito de primeira

---

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
npm run dev              # Rodar em modo dev

# Build
npm run build            # Build produção
npm run preview          # Preview build

# Qualidade
npm run lint             # Lint código
npm run test             # Rodar testes

# Code Connect
npm run figma:publish    # Publicar componentes
npm run figma:list       # Listar componentes
npm run figma:parse      # Validar .figma.tsx
```

---

## 🆘 Precisa de Ajuda?

### Problemas Comuns

**1. "npm install" falha**
```bash
rm -rf node_modules package-lock.json
npm install
```

**2. Erro TypeScript**
```bash
npm run build
# Ver erros detalhados
```

**3. Componentes não aparecem**
```bash
# Verificar importação:
import { NeuButton } from '@/components/ui/neu-button'

# NÃO:
import NeuButton from '@/components/ui/neu-button'
```

**4. Supabase não conecta**
```bash
# Verificar .env.local:
cat .env.local

# Deve ter:
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

**Mais soluções:** [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## ✅ Checklist de Setup

- [ ] Node.js >= 18.0.0
- [ ] npm install executado
- [ ] .env.local configurado
- [ ] npm run dev funcionando
- [ ] Acessou http://localhost:3000
- [ ] Viu página de showcase
- [ ] Testou componentes
- [ ] Leu documentação básica
- [ ] (Opcional) Code Connect configurado

---

## 🎉 Pronto!

Você está pronto para desenvolver com **ICARUS v5.0**!

**Próximo:** Explore a [página de showcase](http://localhost:3000/showcase) e veja todos os componentes em ação.

**Dica:** Use Claude Code + Code Connect para desenvolvimento 10x mais rápido!

---

**Versão**: 5.0.0
**Tempo de setup**: 5-8 minutos
**Dificuldade**: ⭐ Muito Fácil
