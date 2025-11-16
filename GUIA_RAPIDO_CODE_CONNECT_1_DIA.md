# ⚡ Guia Rápido: Code Connect em 1 Dia

## 🎯 Objetivo

Implementar Code Connect no ICARUS em **8 horas** de trabalho focado.

---

## ⏱️ Timeline (8 horas)

```
09:00 - 10:00  |  Setup                    (1h)
10:00 - 12:00  |  Mapear Componentes       (2h)
12:00 - 13:00  |  ALMOÇO
13:00 - 15:00  |  Custom Instructions      (2h)
15:00 - 16:30  |  Testes Claude Code       (1.5h)
16:30 - 17:00  |  Deploy & Documentação    (0.5h)
```

---

## 📋 Hora a Hora

### 09:00 - 10:00 | Setup (1h)

#### Instalar Dependências

```bash
# Instalar figma-connect
npm install figma-connect --save-dev

# Inicializar
npx figma-connect init
```

#### Configurar `.figmaconnect.json`

```json
{
  "codeConnect": {
    "include": ["src/components/**/*.tsx"],
    "exclude": ["**/*.test.tsx", "**/*.stories.tsx"],
    "parser": "react"
  },
  "figma": {
    "token": "FIGMA_TOKEN_HERE"
  }
}
```

#### Criar Estrutura

```bash
mkdir -p .figma/code-connect
mkdir -p docs/code-connect
```

**✅ Checkpoint**: Ambiente configurado

---

### 10:00 - 12:00 | Mapear 4 Componentes (2h)

#### 1. Input (30 min)

Criar `.figma/code-connect/Input.figma.ts`:

```typescript
import figma from '@figma/code-connect'

figma.connect(
  'FIGMA_NODE_ID_INPUT',
  {
    example: () => (
      <input
        className="
          bg-gray-900/50 backdrop-blur-sm
          w-full px-4 py-3 rounded-xl
          border border-white/10
          text-gray-100 placeholder-gray-500
          shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
          focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
          transition-all duration-200
        "
      />
    ),
    props: {
      variant: figma.enum('Variant', {
        default: 'default',
        error: 'error',
        success: 'success'
      })
    }
  }
)
```

#### 2. Button Primary (30 min)

```typescript
figma.connect(
  'FIGMA_NODE_ID_BUTTON_PRIMARY',
  {
    example: () => (
      <button
        className="
          bg-gradient-to-br from-blue-500 to-blue-600
          px-6 py-3 rounded-xl
          border border-blue-400/20
          text-white font-medium
          shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(59,130,246,0.1)]
          hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
          active:scale-95
          transition-all duration-200
        "
      />
    )
  }
)
```

#### 3. Card (30 min)

```typescript
figma.connect(
  'FIGMA_NODE_ID_CARD',
  {
    example: () => (
      <div
        className="
          bg-gradient-to-br from-gray-900/90 to-gray-800/90
          backdrop-blur-sm
          border border-white/10
          rounded-2xl p-6
          shadow-[5px_5px_15px_rgba(0,0,0,0.5),-5px_-5px_15px_rgba(255,255,255,0.03)]
        "
      />
    )
  }
)
```

#### 4. KPI Card (30 min)

```typescript
figma.connect(
  'FIGMA_NODE_ID_KPI_CARD',
  {
    example: ({ value, label, icon }) => (
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm p-6 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold text-gray-100 mt-2">{value}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl">
            {icon}
          </div>
        </div>
      </div>
    ),
    props: {
      value: figma.string('Value'),
      label: figma.string('Label'),
      icon: figma.instance('Icon')
    }
  }
)
```

**✅ Checkpoint**: 4 componentes mapeados

---

### 13:00 - 15:00 | Custom Instructions (2h)

#### Criar `docs/code-connect/CLAUDE_CODE_INSTRUCTIONS.md`

```markdown
# OraclusX Design System - Claude Code Instructions

## Core Principles

When generating UI components for ICARUS:

1. **ALWAYS use neumorphic shadows**:
   ```
   Elevated: shadow-[2px_2px_5px_rgba(0,0,0,0.5),-2px_-2px_5px_rgba(255,255,255,0.03)]
   Inset: shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5),inset_-2px_-2px_5px_rgba(255,255,255,0.03)]
   ```

2. **ALWAYS use approved colors**:
   - Background: #0f1419, #1a1f26
   - Accent: #3b82f6 (blue), #10b981 (green)
   - Text: #f3f4f6, #9ca3af

3. **ALWAYS include states**:
   - hover, focus, active, disabled

4. **NEVER use colors outside palette**

5. **ALWAYS use rounded-xl or rounded-2xl**

6. **ALWAYS include transitions** (transition-all duration-200)

## Component Patterns

### Input
```tsx
className="
  bg-gray-900/50 backdrop-blur-sm
  border border-white/10 rounded-xl px-4 py-3
  text-gray-100 placeholder-gray-500
  shadow-[inset_2px_2px_5px_rgba(0,0,0,0.5)]
  focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
  transition-all duration-200
"
```

### Button Primary
```tsx
className="
  bg-gradient-to-br from-blue-500 to-blue-600
  border border-blue-400/20 rounded-xl px-6 py-3
  text-white font-medium
  shadow-[2px_2px_5px_rgba(0,0,0,0.5)]
  hover:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3)]
  active:scale-95
  transition-all duration-200
"
```

## Code Quality

- TypeScript strict mode
- Zod validation for forms
- React Hook Form
- Accessibility (WCAG 2.1 AA)
- Error boundaries
```

#### Atualizar `CLAUDE.md`

Adicionar referência ao Code Connect:

```markdown
## 🎨 Code Connect Integration

Claude Code está integrado ao Figma via Code Connect.

**Componentes disponíveis**:
- Input (default, error, success)
- Button (primary, secondary, danger)
- Card (padrão, KPI)

**Como usar**:
Apenas mencione o componente no prompt:
"Criar formulário com Input e Button Primary OraclusX"

Claude Code irá gerar automaticamente seguindo o DS.
```

**✅ Checkpoint**: Instruções customizadas criadas

---

### 15:00 - 16:30 | Testes Claude Code (1.5h)

#### Teste 1: Criar Componente Simples (15 min)

**Prompt para Claude Code**:
```
"Criar um input de busca usando OraclusX Design System"
```

**Validar**:
- ✅ Sombras neumórficas corretas
- ✅ Cores da paleta
- ✅ Estados (focus, hover)
- ✅ Transições suaves

---

#### Teste 2: Criar Form Completo (30 min)

**Prompt**:
```
"Criar formulário de cadastro de cliente com:
- Nome (input)
- Email (input)
- Categoria (select)
- Botões Salvar e Cancelar
Usar OraclusX Design System"
```

**Validar**:
- ✅ Layout grid 2 colunas
- ✅ Todos componentes seguem DS
- ✅ Validação Zod
- ✅ Error handling

---

#### Teste 3: Criar Módulo Completo (45 min)

**Prompt**:
```
"Criar módulo de Produtos completo:
- KPIs (4 cards)
- Tabs (Lista, Formulário)
- Tabela de produtos
- Formulário com validação
Seguir padrão ICARUS com OraclusX DS"
```

**Validar**:
- ✅ Estrutura de módulo correta
- ✅ KPIs com design correto
- ✅ Tabs funcionais
- ✅ Tabela responsiva
- ✅ Form com Zod + RHF

**✅ Checkpoint**: Testes validados

---

### 16:30 - 17:00 | Deploy & Doc (30 min)

#### Publish Code Connect

```bash
# Build
npx figma-connect build

# Publish
npx figma-connect publish
```

#### Documentar

Criar `docs/code-connect/SETUP_COMPLETO.md`:

```markdown
# Setup Code Connect - ICARUS

## O que foi feito

- ✅ 4 componentes mapeados
- ✅ Custom instructions criadas
- ✅ Testes validados
- ✅ Deploy realizado

## Como usar

1. No Claude Code, apenas mencione componentes:
   "Criar com Input OraclusX"

2. Claude gera automaticamente seguindo DS

## Manutenção

- Atualizar mapeamentos: mensal
- Adicionar novos componentes: conforme necessidade
```

**✅ Checkpoint**: Deployment completo

---

## 🎯 Checklist Final

- [ ] figma-connect instalado
- [ ] 4 componentes mapeados
- [ ] Custom instructions criadas
- [ ] 3 testes validados
- [ ] Code Connect publicado
- [ ] Documentação criada
- [ ] Time comunicado

---

## 📊 Resultados Esperados

Após 1 dia:

```typescript
{
  componentesMapeados: 4,
  tempoInvestido: "8 horas",
  produtividadeImediata: "+200%",
  aderenciaDS: "100%",
  satisfacaoTime: "Alta",
  roiEsperado: "525% (12 meses)"
}
```

---

## 🚀 Próximos Passos

1. **Semana 1**: Mapear mais 6 componentes
2. **Semana 2**: Criar 2 módulos usando Code Connect
3. **Mês 1**: Avaliar ROI real vs projetado
4. **Trimestre 1**: Expandir para 100% dos componentes

---

**Versão**: 1.0.0
**Data**: 2025-11-15
**Status**: ✅ Guia pronto para execução
