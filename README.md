# 🚀 ICARUS v5.0

**ERP Enterprise para OPME** (Órteses, Próteses e Materiais Especiais) com **Inteligência Artificial**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase)](https://supabase.com/)

---

## ⚡ Quick Start

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com suas credenciais Supabase

# 3. Iniciar desenvolvimento
pnpm dev
```

Acesse: **http://localhost:5173**

---

## 📋 Sobre o Projeto

ICARUS é um sistema ERP completo desenvolvido com as mais modernas tecnologias web, incorporando **Inteligência Artificial** para otimização de processos em empresas de OPME.

### ✨ Principais Funcionalidades

- 🏥 **Gestão de Cirurgias** - Controle completo de procedimentos cirúrgicos
- 📦 **Estoque Inteligente** - Previsão de demanda com IA
- 💰 **Financeiro** - Controle de faturamento e inadimplência
- 🤖 **IcarusBrain** - IA integrada para análises preditivas
- 📊 **Dashboards** - Visualizações em tempo real
- 🎨 **Dark Glass Medical** - Design System moderno e profissional

---

## 🛠️ Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| **Frontend** | React 18.3.1 + TypeScript 5.8 + Vite 6.3 |
| **Styling** | Tailwind CSS 4.1 + Radix UI |
| **Database** | Supabase PostgreSQL 15 |
| **Design System** | Dark Glass Medical (Neumorphism 3D) |
| **Animações** | Motion (Framer Motion) 12.x |
| **Gráficos** | Recharts 3.x |
| **Ícones** | Lucide React |
| **IA** | Claude Sonnet, GPT-4, TensorFlow.js |
| **Deploy** | Vercel + GitHub Actions |

---

## 🎨 Dark Glass Medical Design System

O ICARUS utiliza o **Dark Glass Medical**, um design system moderno baseado em:

### Características
- 🌙 **Dark Mode** como padrão
- ✨ **Neumorphism 3D** com sombras elevadas
- 🎯 **Glassmorphism** com blur e transparência
- 🎨 **Paleta profissional** para ambiente médico-hospitalar
- ♿ **Acessibilidade** WCAG 2.1 AA
- 📱 **Responsivo** mobile-first

### Paleta de Cores

```css
/* Dark Mode */
--background: #0B0D16       /* Fundo principal */
--card: #15192B             /* Cards e containers */
--card-elevated: #1A1F35    /* Elementos elevados */
--primary: #6366F1          /* Indigo - Ações principais */
--success: #10B981          /* Verde - Sucesso */
--warning: #F59E0B          /* Âmbar - Avisos */
--danger: #EF4444           /* Vermelho - Erros */
--text-primary: #FFFFFF     /* Texto principal */
--text-secondary: #94A3B8   /* Texto secundário */
--text-muted: #64748B       /* Texto desabilitado */
```

### Componentes Principais

- ✅ **Card** - Container com efeito neumórfico 3D
- ✅ **KPICard** - Cards de métricas com ícones coloridos
- ✅ **Button** - Botões com variantes (primary, secondary, ghost)
- ✅ **Input** - Campos com efeito inset neumórfico
- ✅ **Sidebar** - Navegação colapsável com transições suaves
- ✅ **Topbar** - Barra superior com busca e notificações
- ✅ **ChatWidget** - Assistente virtual flutuante

---

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/                 # Componentes base
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── KPICard.tsx
│   │   │   └── ...
│   │   ├── layout/             # Layout components
│   │   │   ├── IcarusLayout.tsx
│   │   │   ├── IcarusSidebar.tsx
│   │   │   └── IcarusTopbar.tsx
│   │   ├── modules/            # Módulos do sistema
│   │   │   ├── Dashboard.tsx
│   │   │   └── ...
│   │   └── chat/               # Assistente virtual
│   │       └── ChatWidget.tsx
│   ├── pages/                  # Páginas
│   │   ├── HomePage.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── hooks/                  # Hooks customizados
│   │   ├── useTheme.ts
│   │   ├── useSidebar.ts
│   │   └── useIcarusBrain.ts
│   ├── contexts/               # React Contexts
│   │   ├── ThemeContext.tsx
│   │   └── SidebarContext.tsx
│   ├── lib/                    # Utilitários
│   │   ├── utils.ts
│   │   └── data/navigation.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css               # CSS Variables + Tailwind
├── docs/                       # Documentação
├── public/
│   └── favicon.svg
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
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

| Módulo | Status | Descrição |
|--------|--------|-----------|
| Dashboard | ✅ | Visão geral do sistema |
| Cirurgias | ✅ | Gestão de procedimentos |
| Estoque IA | ✅ | Controle inteligente |
| Financeiro | ✅ | Faturamento e cobrança |
| CRM & Vendas | ✅ | Gestão de clientes |
| Compras | ✅ | Gestão de fornecedores |
| Produtos OPME | ✅ | Cadastro de produtos |
| Contas a Receber | ✅ | Gestão de recebíveis |
| Faturamento NFe | ✅ | Emissão de notas fiscais |
| Inventário | ✅ | Controle de inventário |
| Licitações | ✅ | Gestão de licitações |

---

## 🗄️ Supabase

### Configuração

1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as variáveis de ambiente:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

### Exemplo de Uso

```typescript
import { supabase } from '@/lib/config/supabase-client'

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

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Servidor de desenvolvimento (port 5173)
pnpm build        # Build de produção
pnpm preview      # Preview do build
pnpm lint         # Executar linter
pnpm type-check   # Verificar tipos TypeScript
```

---

## 🔧 Suporte

- **Issues**: [GitHub Issues](https://github.com/Icarus-AI-Technology/icarus/issues)
- **Docs**: Ver pasta `/docs/` para guias completos
- **Troubleshooting**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

---

## 📝 Licença

Este projeto é propriedade da **Icarus AI Technology**.

---

## 🌟 Versão

**v5.0** - Production Ready

### Status do Projeto
- ✅ Design System Dark Glass Medical
- ✅ 14+ componentes otimizados
- ✅ Dark mode como padrão
- ✅ Sidebar colapsável com transições
- ✅ 11 módulos implementados
- ✅ Assistente virtual integrado
- ✅ Deploy automático Vercel

---

**Desenvolvido com ❤️ pela equipe Icarus AI Technology**
