# 🚀 ICARUS v5.0

**ERP Enterprise neumórfico para OPME** (Órteses, Próteses e Materiais Especiais)

[![React](https://img.shields.io/badge/React-18.3.1-blue?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

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

## 🛠️ Stack Tecnológico

```typescript
{
  frontend: "React 18.3.1 + TypeScript 5.6.3 + Vite 6.0.0",
  styling: "Tailwind CSS 4.0 + shadcn/ui",
  database: "Supabase PostgreSQL 15",
  designSystem: "OraclusX DS (Neumorphism)",
  ai: ["Claude Sonnet 4.5", "GPT-4", "TensorFlow.js"],
  deployment: "Vercel + GitHub Actions"
}
```

---

## 🚀 Começando

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta no Supabase (para produção)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/Icarus-AI-Technology/icarus.git
cd icarus

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do Supabase

# Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

### Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Cria build de produção
npm run preview  # Preview do build de produção
npm run lint     # Executa linter
```

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── tabs.tsx
│   │   └── modules/         # Módulos do sistema
│   │       └── Dashboard.tsx
│   ├── hooks/               # Hooks customizados
│   │   └── useSupabase.ts
│   ├── lib/                 # Utilitários
│   │   ├── utils.ts
│   │   └── supabase.ts
│   ├── types/               # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── claude.md                # Contexto para Claude Code
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
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
2. Copie as credenciais para `.env`:

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

## 🤝 Trabalhando com Claude Code

Este projeto foi otimizado para desenvolvimento com **Claude Code**. Consulte `claude.md` para o contexto completo.

### Comandos úteis para Claude:

```
"Crie um novo módulo de Compras seguindo o padrão OraclusX"
"Adicione previsão de demanda no módulo Estoque IA"
"Implemente validação Zod no formulário de produtos"
```

---

## 📝 Licença

Este projeto é propriedade da **Icarus AI Technology**.

---

## 🌟 Versão

**v5.0.3** - Production Ready

---

**Desenvolvido com ❤️ pela equipe Icarus AI Technology**
