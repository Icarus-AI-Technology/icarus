# 🚀 ICARUS v5.0

**ERP Enterprise neumórfico para OPME** (Órteses, Próteses e Materiais Especiais)

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## ⚡ Quick Start em 3 Passos

```bash
# 1. Instalar
npm install

# 2. Configurar
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase

# 3. Rodar
npm run dev
```

Acesse: **http://localhost:5173**

**Ver guia completo:** [GETTING_STARTED.md](./GETTING_STARTED.md)

---

## 📋 Sobre o Projeto

ICARUS é um sistema ERP completo desenvolvido com as mais modernas tecnologias web, incorporando **Inteligência Artificial** para otimização de processos em empresas de OPME.

### ✨ Principais Funcionalidades

- 🏥 **Gestão de Cirurgias** - Controle completo de procedimentos cirúrgicos
- 📦 **Estoque Inteligente** - Previsão de demanda com IA
- 💰 **Financeiro** - Controle de faturamento e inadimplência
- 🤖 **IcarusBrain** - IA integrada para análises preditivas
- 📊 **Dashboards** - Visualizações em tempo real
- 🎨 **OraclusX DS** - Design System neumórfico

---

## 📚 Documentação

### Para Começar
- **[GETTING_STARTED.md](./GETTING_STARTED.md)** - Setup completo em 5 minutos ⚡
- **[QUICKSTART.md](./QUICKSTART.md)** - Guia rápido de início

### Code Connect (Figma → Code)
- **[CODE_CONNECT_IMPLEMENTATION.md](./CODE_CONNECT_IMPLEMENTATION.md)** - Implementar Code Connect (15min)
- [CODE_CONNECT_SETUP.md](./CODE_CONNECT_SETUP.md) - Visão geral Code Connect
- [docs/code-connect-analysis.md](./docs/code-connect-analysis.md) - Análise ROI detalhada (4.105%)

### Suporte
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Solução de problemas comuns
- [docs/troubleshooting.md](./docs/troubleshooting.md) - Guia de troubleshooting

---

## 🛠️ Stack Tecnológico

```typescript
{
  frontend: "React 18.3.1 + TypeScript 5.6.3 + Vite 6.0.0",
  styling: "Tailwind CSS 4.0 + shadcn/ui",
  database: "Supabase PostgreSQL 15",
  designSystem: "OraclusX DS (Neumorphism)",
  ai: ["Claude Sonnet 4.5", "GPT-4", "TensorFlow.js"],
  deployment: "Vercel + GitHub Actions",
  codeConnect: "Figma → Code automation"
}
```

---

## 🎨 Componentes Neumorphism

### Principais Componentes
- ✅ **NeuButton** - 5 variantes (primary, soft, danger, secondary, pressed)
- ✅ **NeuCard** - 4 elevações (low, medium, high) + 3 variantes
- ✅ **NeuInput** - Com validação, helper text e error handling
- ✅ **Icon3D** - Ícones com profundidade
- ✅ **Sidebar** - Navegação collapsible
- ✅ **Dialog, Tabs, Select, Table** - Componentes auxiliares

### 🎭 Showcase Interativo
**Ver todos os componentes em ação:**

Acesse: `src/pages/ShowcasePage.tsx`

Inclui:
- Todos os componentes com exemplos vivos
- Estados (loading, disabled, error)
- Formulário completo funcional
- Guias de uso inline
- 400+ linhas de exemplos práticos

### Design System
- Design System Neumorphism completo
- 14+ componentes otimizados
- Dark mode ready
- Acessibilidade (WCAG 2.1 AA)
- Responsivo mobile-first

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui + Neumorphism
│   │   │   ├── neu-button.tsx
│   │   │   ├── neu-card.tsx
│   │   │   ├── neu-input.tsx
│   │   │   └── icon-3d.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── IcarusLayout.tsx
│   │   │   └── sidebar.tsx
│   │   └── modules/         # Módulos do sistema
│   │       └── Dashboard.tsx
│   ├── pages/               # Páginas
│   │   └── ShowcasePage.tsx # Demonstração interativa
│   ├── hooks/               # Hooks customizados
│   │   ├── useSupabase.ts
│   │   └── useIcarusBrain.ts
│   ├── lib/                 # Utilitários
│   │   ├── utils.ts
│   │   ├── supabase.ts
│   │   └── data/navigation.ts
│   ├── types/               # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── docs/                    # Documentação completa
├── .clinerules              # Regras de desenvolvimento
├── CLAUDE.md                # Contexto para Claude Code
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 OraclusX Design System

O ICARUS utiliza o **OraclusX Design System**, baseado em neumorfismo:

### Paleta de Cores

```css
--primary: #6366F1      /* Indigo - Botões principais */
--background: #F9FAFB   /* Fundo claro */
--foreground: #1F2937   /* Texto escuro */
```

### Componentes Base

Todos os componentes utilizam shadcn/ui:

```tsx
import { NeuButton } from '@/components/ui/neu-button'
import { NeuCard } from '@/components/ui/neu-card'
import { NeuInput } from '@/components/ui/neu-input'

// Exemplo
<NeuCard variant="soft" elevation="medium" padding="lg">
  <h2>Título</h2>
  <NeuButton variant="primary">Ação</NeuButton>
</NeuCard>
```

### Classes Neumórficas

```tsx
<Card className="neu-card">
  {/* Efeito neumórfico automático */}
</Card>
```

---

## 🧠 Integração com IA

### IcarusBrain

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

const { predict, analyze, recommend } = useIcarusBrain()

// Previsão de demanda
const forecast = await predict('demanda', {
  produto_id: '123',
  dias: 30
})

// Score de inadimplência
const score = await analyze('inadimplencia', {
  cliente_id: '456'
})
```

---

## 📊 Módulos Disponíveis

- ✅ **Dashboard** - Visão geral do sistema
- 🏥 **Cirurgias** - Gestão de procedimentos
- 📦 **Estoque IA** - Controle inteligente
- 💰 **Financeiro** - Faturamento e cobrança
- 👥 **Clientes** - CRM integrado
- 🏢 **Hospitais** - Cadastro de unidades
- ⚙️ **Configurações** - Preferências do sistema

---

## 🗄️ Supabase

### Setup

1. Crie um projeto no [Supabase](https://supabase.com)
2. Copie as credenciais para `.env.local`:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### Exemplo de Uso

```typescript
import { useSupabase } from '@/hooks/useSupabase'

const { supabase } = useSupabase()

// Fetch
const { data } = await supabase
  .from('produtos')
  .select('*')

// Insert
await supabase
  .from('produtos')
  .insert([{ nome: 'Produto 1' }])
```

---

## 🔗 Code Connect (Figma → Code)

**Automatize 75% do desenvolvimento** com Code Connect:

### Benefícios
- ⚡ **75% mais rápido** para desenvolver
- 🎯 **92% menos retrabalho**
- ✅ **99% consistência** design-código
- 💰 **ROI 4.105%** no primeiro ano

### Setup Rápido (15min)

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

## 🤝 Trabalhando com Claude Code

Este projeto foi otimizado para desenvolvimento com **Claude Code**. Consulte `CLAUDE.md` para o contexto completo.

### Comandos úteis para Claude:

```
"Crie um novo módulo de Compras seguindo o padrão OraclusX"
"Adicione previsão de demanda no módulo Estoque IA"
"Implemente validação Zod no formulário de produtos"
"Criar botão de salvar usando componentes ICARUS"
```

---

## 📝 Scripts Disponíveis

```bash
npm run dev         # Inicia servidor de desenvolvimento (port 5173)
npm run build       # Cria build de produção
npm run preview     # Preview do build de produção
npm run lint        # Executa linter

# Code Connect
npm run figma:publish  # Publicar componentes no Figma
npm run figma:list     # Listar componentes conectados
npm run figma:parse    # Validar arquivos .figma.tsx
```

---

## 🔧 Suporte

- **Issues**: Reportar bugs via [GitHub Issues](https://github.com/Icarus-AI-Technology/icarus/issues)
- **Docs**: Ver pasta `/docs/` para guias completos
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Licença

Este projeto é propriedade da **Icarus AI Technology**.

---

## 🌟 Versão

**v5.0.3** - Production Ready

### Status do Projeto
- ✅ Setup completo
- ✅ 14+ componentes Neumorphism
- ✅ Code Connect preparado
- ✅ Showcase interativo
- ✅ 8 guias de documentação
- ✅ Módulos exemplo com IA

---

**Desenvolvido com ❤️ pela equipe Icarus AI Technology**
