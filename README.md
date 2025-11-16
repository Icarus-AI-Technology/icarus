# ICARUS v5.0

Sistema ERP Hospitalar com Inteligência Artificial integrada

![ICARUS v5.0](https://img.shields.io/badge/Version-5.0.0-blue)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 📋 Visão Geral

ICARUS v5.0 é um sistema completo de gestão hospitalar com 58 módulos integrados e capacidades avançadas de inteligência artificial para análises preditivas, automação de processos e insights em tempo real.

### Características Principais

- **58 Módulos Integrados**: Gestão completa de todas as áreas hospitalares
- **IA Integrada**: Claude Sonnet 4 para análises e previsões
- **OraclusX Design System**: Interface neumórfica moderna e acessível
- **Real-time**: Sincronização em tempo real via Supabase
- **Escalável**: Arquitetura modular preparada para crescimento
- **Acessível**: WCAG 2.1 AA compliant

## 🚀 Quick Start

### Pré-requisitos

- Node.js >= 18.x
- npm ou yarn
- Conta Supabase (para backend)
- API Key Anthropic (para IA)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/icarus.git
cd icarus

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Inicie o servidor de desenvolvimento
npm run dev
```

### Configuração

Edite o arquivo `.env` com suas credenciais:

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Anthropic AI
VITE_ANTHROPIC_API_KEY=your-anthropic-key
```

## 📁 Estrutura do Projeto

```
icarus/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes shadcn/ui
│   │   └── modules/         # Módulos ICARUS (58)
│   ├── hooks/               # Custom React hooks
│   │   ├── useSupabase.ts
│   │   └── useIcarusBrain.ts
│   ├── lib/
│   │   ├── ai/              # Integração IA
│   │   ├── supabase/        # Cliente Supabase
│   │   └── utils.ts         # Utilitários
│   ├── styles/
│   │   └── globals.css      # Estilos globais + neomorphism
│   └── types/               # TypeScript types
├── docs/
│   ├── modulos/             # Documentação dos módulos
│   └── skills/              # Skills de desenvolvimento
└── public/                  # Assets estáticos
```

## 🎨 OraclusX Design System

O ICARUS usa o **OraclusX Design System**, baseado em **Neomorphism** (design neumórfico).

### Componentes Principais

- **Card** - Containers com elevação neumórfica
- **Button** - Botões com variantes semânticas
- **Input** - Campos de entrada acessíveis
- **Select** - Dropdowns customizados
- **Tabs** - Navegação por abas
- **Dialog** - Modais e diálogos

### Classes Neumórficas

```tsx
// Soft elevation (raised)
<Card className="neu-soft">...</Card>

// Pressed effect (inset)
<Card className="neu-pressed">...</Card>

// KPI Card preset
<Card className="neu-card">...</Card>
```

### Paleta de Cores

- **Primary**: #6366F1 (Indigo) - Cor universal de botões
- **Secondary**: #64748B (Slate)
- **Accent**: #8B5CF6 (Purple)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

## 🧩 Criando Módulos

Siga o template base para criar novos módulos:

```tsx
// src/components/modules/SeuModulo.tsx
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useSupabase } from '@/hooks/useSupabase'
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

export function SeuModulo() {
  const { supabase } = useSupabase()
  const { predict } = useIcarusBrain()

  // ... implementação
}
```

### Checklist de Módulo

- [ ] 4-5 KPIs no topo
- [ ] 3-5 abas de navegação
- [ ] Integração Supabase
- [ ] Componentes shadcn/ui
- [ ] Classes neumórficas
- [ ] Acessibilidade (labels, aria-*)
- [ ] Responsividade (grid cols 4/2/1)
- [ ] (Opcional) Serviços IA

Ver `/docs/skills/criar-modulos.md` para guia completo.

## 🤖 Integração com IA

ICARUS usa **Claude Sonnet 4** para capacidades de IA:

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function MyComponent() {
  const { predict, analyze, recommend, chat } = useIcarusBrain()

  // Previsão de demanda
  const forecast = await predict('demanda', {
    produto_id: '123',
    dias: 30
  })

  // Análise de risco
  const score = await analyze('inadimplencia', {
    cliente_id: '456'
  })

  // Recomendações
  const items = await recommend('produtos', {
    cliente_id: '789',
    limite: 5
  })

  // Chat assistente
  const response = await chat('Qual o status do estoque?', {
    contexto: 'estoque'
  })
}
```

Ver `/docs/skills/integracao-ia.md` para mais detalhes.

## 📊 Módulos Disponíveis

### Exemplo: Módulo de Produtos

Demonstração completa de todos os recursos:

- ✅ KPIs: Total, Valor Estoque, Ativos, Baixo Estoque
- ✅ Abas: Overview, Lista, Relatórios, IA
- ✅ CRUD completo
- ✅ Filtros e busca
- ✅ Previsão de demanda por IA
- ✅ Análise automatizada

Ver código em: `src/components/modules/Produtos.tsx`

## 🧪 Testes

```bash
# Rodar testes
npm test

# Testes com coverage
npm test -- --coverage

# Testes e2e
npm run test:e2e
```

## 🏗️ Build

```bash
# Build de produção
npm run build

# Preview do build
npm run preview
```

## 📖 Documentação

- [Criar Módulos](/docs/skills/criar-modulos.md)
- [OraclusX Design System](/docs/skills/oraclusx-design-system.md)
- [Integração IA](/docs/skills/integracao-ia.md)
- [Supabase Patterns](/docs/skills/supabase-patterns.md)
- [Módulo Produtos](/docs/modulos/ICARUS-MOD-PRODUTOS.md)

## 🤝 Contribuindo

1. Siga o template de módulo base
2. Garanta 100% OraclusX DS compliance
3. Adicione testes
4. Documente seu módulo
5. Crie PR para review

## 📝 Licença

Proprietary - Todos os direitos reservados

## 🔧 Tecnologias

- **React** 18.2 - UI Framework
- **TypeScript** 5.2 - Type Safety
- **Vite** 5.0 - Build Tool
- **Tailwind CSS** 3.4 - Styling
- **shadcn/ui** - Component Library
- **Supabase** - Backend & Real-time
- **Anthropic Claude** - AI Integration
- **Radix UI** - Headless Components

## 📞 Suporte

Para dúvidas e suporte:
- 📧 Email: suporte@icarus.com.br
- 📚 Documentação: `/docs`
- 🐛 Issues: GitHub Issues

---

**ICARUS v5.0** - Powered by AI, Built for Healthcare