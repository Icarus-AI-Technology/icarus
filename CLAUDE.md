# 🤖 CLAUDE.md - Contexto Principal ICARUS v5.0

**LEIA ESTE ARQUIVO PRIMEIRO** antes de qualquer desenvolvimento!

---

## 🎯 CONTEXTO RÁPIDO

**Você está trabalhando no ICARUS v5.0**, um ERP enterprise neumórfico para OPME (Órteses, Próteses e Materiais Especiais).

### O Que Precisa Saber Imediatamente

```typescript
{
  projeto: "ICARUS v5.0",
  tipo: "ERP Enterprise Web",
  dominio: "Gestão OPME (distribuidoras médicas)",

  stack: {
    frontend: "React 18.3 + TypeScript 5.6 + Vite 6",
    styling: "Tailwind CSS 4.0 + shadcn/ui",
    database: "Supabase PostgreSQL 15",
    ia: "Claude Sonnet 4.5 (Anthropic)",
    deploy: "Vercel"
  },

  design_system: "OraclusX (neumórfico)",
  modulos: 58,  // 100% implementados
  componentes: 175,
  status: "Production-Ready"
}
```

---

## 📋 WORKFLOW OBRIGATÓRIO

Antes de QUALQUER desenvolvimento, **SEMPRE** siga esta ordem:

```bash
# 1. Ler este arquivo (CLAUDE.md)
cat CLAUDE.md

# 2. Ler regras obrigatórias
cat .clinerules

# 3. Ler skill relevante para sua tarefa
cat docs/skills/SKILL_ORACLUSX_DS.md      # Para UI/UX
cat docs/skills/SKILL_CRIAR_MODULOS.md    # Para novos módulos
cat docs/skills/SKILL_IA_INTEGRATION.md   # Para integrar IA
cat docs/skills/SKILL_SUPABASE.md         # Para database

# 4. Desenvolver seguindo padrões
# 5. Testar
# 6. Commit
```

**⚠️ NUNCA** desenvolva sem ler estes arquivos primeiro!

---

## 🎨 ORACLUSX DESIGN SYSTEM

### Regras CRÍTICAS (nunca viole!)

#### ✅ SEMPRE Use:

1. **Componentes shadcn/ui** (NUNCA HTML nativo):
```tsx
// ✅ CORRETO
import { Button } from '@/components/ui/button'
<Button variant="default">Salvar</Button>

// ❌ ERRADO
<button className="...">Salvar</button>
```

2. **Paleta de Cores Universal**:
```css
/* ÚNICA paleta permitida */
--primary: #6366F1      /* Indigo - ÚNICA COR DE BOTÕES */
--success: #10B981
--warning: #F59E0B
--danger: #EF4444
--background: #F9FAFB
--foreground: #1F2937
```

3. **Inputs em form-row**:
```tsx
// ✅ CORRETO
<div className="form-row">
  <label>Nome *</label>
  <Input required />
</div>

// ❌ ERRADO
<Input placeholder="Nome" />  // Sem label, sem form-row
```

4. **Grid Responsivo 3/2/1**:
```tsx
// ✅ CORRETO
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 3 colunas desktop, 2 tablet, 1 mobile */}
</div>
```

#### ❌ NUNCA Faça:

1. ❌ `<input>` ou `<button>` HTML nativo
2. ❌ `box-shadow` em inputs/buttons (quebra neumorfismo)
3. ❌ Cores fora da paleta universal
4. ❌ Botões sem `aria-label` (acessibilidade)
5. ❌ Esquecer dark mode (`className="..."` deve funcionar em ambos)

### Componentes Base

```tsx
// Button
<Button variant="default">Ação Principal</Button>
<Button variant="secondary">Ação Secundária</Button>
<Button variant="destructive">Deletar</Button>
<Button variant="outline">Cancelar</Button>
<Button variant="ghost">Sutil</Button>

// Card Neumórfico
<Card className="neu-soft">
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// Dialog (SEMPRE usar, nunca alert/confirm)
<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {/* Conteúdo */}
  </DialogContent>
</Dialog>

// Tabs (padrão de módulos)
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="lista">Lista</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">...</TabsContent>
</Tabs>

// Table
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Coluna</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Valor</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

[📖 Ver guia completo: `docs/skills/SKILL_ORACLUSX_DS.md`]

---

## 📦 PADRÃO DE MÓDULOS

Todos os 58 módulos seguem esta estrutura:

```tsx
// src/components/modules/NomeModulo.tsx
export function NomeModulo() {
  return (
    <div className="p-6">
      {/* 1. KPIs (4-5 cards neumórficos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="neu-card">
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Métrica</p>
            <p className="text-2xl font-bold">142</p>
            <p className="text-xs text-green-600">↑ 12.5%</p>
          </CardContent>
        </Card>
        {/* ... mais 3 KPIs */}
      </div>

      {/* 2. Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lista">Lista</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="ia">IA</TabsTrigger>
        </TabsList>

        {/* Overview: Gráficos + Dashboard */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráficos, resumos, etc */}
          </div>
        </TabsContent>

        {/* Lista: Tabela + CRUD */}
        <TabsContent value="lista">
          <div className="flex justify-between mb-4">
            <Input placeholder="Buscar..." className="max-w-sm" />
            <Dialog>
              <DialogTrigger asChild>
                <Button>Adicionar</Button>
              </DialogTrigger>
              <DialogContent>
                {/* Form de criação */}
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            {/* Dados */}
          </Table>
        </TabsContent>

        {/* Relatórios: Cards + Exports */}
        <TabsContent value="relatorios">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Relatórios pré-definidos */}
          </div>
        </TabsContent>

        {/* IA: Serviços IcarusBrain */}
        <TabsContent value="ia">
          {/* Previsões, análises, chat, etc */}
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Referência**: `src/components/modules/Cirurgias.tsx` (módulo padrão-ouro)

[📖 Ver guia completo: `docs/skills/SKILL_CRIAR_MODULOS.md`]

---

## 🧠 ICARUSBRAIN (IA)

### Hook Principal

```typescript
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

const { predict, analyze, recommend, chat } = useIcarusBrain()
```

### Serviços Disponíveis

#### 1. Previsão de Demanda
```typescript
const forecast = await predict('demanda', {
  produto_id: '123',
  dias: 30
})
// Retorna: { valores: number[], confidence: number, tendencia: string }
```

#### 2. Score Inadimplência
```typescript
const score = await analyze('inadimplencia', {
  cliente_id: '456'
})
// Retorna: { score: 0-100, risco: 'baixo|medio|alto', fatores: [...] }
```

#### 3. Recomendação de Produtos
```typescript
const produtos = await recommend('produtos', {
  cliente_id: '789',
  limite: 5
})
// Retorna: [{ produto_id, nome, score, motivo }, ...]
```

#### 4. Chat Assistente
```typescript
const response = await chat('Qual o status do estoque?', {
  contexto: 'estoque'
})
// Retorna: { resposta: string, acoes: [...] }
```

[📖 Ver guia completo: `docs/skills/SKILL_IA_INTEGRATION.md`]

---

## 🗄️ SUPABASE DATABASE

### Client Setup

```typescript
import { supabase } from '@/lib/supabase/client'
```

### Operações CRUD

```typescript
// SELECT
const { data, error } = await supabase
  .from('produtos')
  .select('*')
  .eq('ativo', true)
  .order('created_at', { ascending: false })

// INSERT
const { data, error } = await supabase
  .from('produtos')
  .insert({ nome: 'Produto X', preco: 100 })

// UPDATE
const { data, error } = await supabase
  .from('produtos')
  .update({ preco: 120 })
  .eq('id', '123')

// DELETE
const { data, error } = await supabase
  .from('produtos')
  .delete()
  .eq('id', '123')
```

### Realtime Subscriptions

```typescript
useEffect(() => {
  const channel = supabase
    .channel('produtos_changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'produtos'
    }, (payload) => {
      refetchData()
    })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
```

[📖 Ver guia completo: `docs/skills/SKILL_SUPABASE.md`]

---

## 🔧 TROUBLESHOOTING

### Problemas Comuns

#### 1. Componente não renderiza
```bash
# Verifique:
1. Importou corretamente de '@/components/ui/...'?
2. Usando className correto (neu-soft, neu-card, etc)?
3. Props corretas (variant, size, etc)?
```

#### 2. Supabase erro 401
```bash
# Verifique:
1. .env.local configurado?
2. VITE_SUPABASE_URL correto?
3. VITE_SUPABASE_ANON_KEY correto?
4. RLS policies corretas?
```

#### 3. IA não responde
```bash
# Verifique:
1. VITE_ANTHROPIC_API_KEY configurado?
2. Créditos API disponíveis?
3. Usando await corretamente?
4. Tratando erros?
```

#### 4. Build falha
```bash
# Execute:
npm run type-check  # Verificar erros TypeScript
npm run lint        # Verificar erros ESLint
npm run build       # Ver erro específico
```

[📖 Ver guia completo: `TROUBLESHOOTING.md`]

---

## 📂 ESTRUTURA DO PROJETO

```
/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── modules/         # 58 módulos
│   │   └── layout/          # Layout components
│   ├── hooks/
│   │   ├── useIcarusBrain.ts
│   │   └── useSupabase.ts
│   ├── lib/
│   │   ├── supabase/
│   │   └── utils.ts
│   ├── styles/
│   │   └── globals.css      # Tailwind + custom
│   └── App.tsx
├── docs/                    # Documentação completa
├── CLAUDE.md                # Este arquivo
├── .clinerules              # Regras obrigatórias
└── package.json
```

---

## 🚀 COMANDOS ÚTEIS

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server
npm run build            # Build produção
npm run preview          # Preview build

# Qualidade
npm run type-check       # TypeScript
npm run lint             # ESLint
npm run format           # Prettier
npm test                 # Testes

# Supabase
npx supabase start       # Local
npx supabase db push     # Deploy schema
npx supabase db pull     # Pull schema

# Deploy
vercel                   # Deploy preview
vercel --prod            # Deploy produção
```

---

## 📊 MÉTRICAS DE QUALIDADE

Mantenha estas métricas:

```typescript
{
  lighthouse_score: ">95",
  bundle_size: "<1.5MB",     // Meta: <800KB
  cobertura_testes: ">65%",  // Meta: 85%
  typescript_errors: 0,
  eslint_warnings: 0,
  accessibility: "WCAG AA"
}
```

---

## 🎯 CHECKLIST PRÉ-COMMIT

Antes de commitar, verifique:

- [ ] Leu `.clinerules`?
- [ ] Seguiu OraclusX Design System?
- [ ] Usou componentes shadcn/ui (não HTML nativo)?
- [ ] Testou em dark mode?
- [ ] Testou responsividade (desktop/tablet/mobile)?
- [ ] Adicionou aria-labels?
- [ ] TypeScript sem erros?
- [ ] ESLint sem warnings?
- [ ] Build passou?
- [ ] Commit message segue convenção?

---

## 📚 DOCUMENTAÇÃO COMPLETA

### Para Desenvolvimento
- [Visão Geral](docs/01-VISAO-GERAL.md)
- [Arquitetura](docs/02-ARQUITETURA.md)
- [Stack Tecnológico](docs/03-STACK-TECNOLOGICO.md)
- [Módulos (58)](docs/09-MODULOS.md)
- [Quick Start](docs/10-QUICK-START.md)

### Skills (LEIA ANTES DE DESENVOLVER!)
- [SKILL: OraclusX DS](docs/skills/SKILL_ORACLUSX_DS.md)
- [SKILL: Criar Módulos](docs/skills/SKILL_CRIAR_MODULOS.md)
- [SKILL: IA Integration](docs/skills/SKILL_IA_INTEGRATION.md)
- [SKILL: Supabase](docs/skills/SKILL_SUPABASE.md)

### Análise Competitiva
- [Comparativo Protheus](docs/04-COMPARATIVO-PROTHEUS.md)
- [Code Connect](docs/05-CODE-CONNECT.md)

---

## 🎓 PRINCÍPIOS DE DESENVOLVIMENTO

1. **Consistência acima de tudo** - Siga os padrões existentes
2. **Acessibilidade é obrigatória** - WCAG AA mínimo
3. **Performance importa** - Bundle size, lazy loading, etc
4. **TypeScript strict** - Sem `any`, sem `@ts-ignore`
5. **Dark mode first** - Sempre teste em ambos os temas
6. **Mobile-first** - Grid responsivo 3/2/1 sempre
7. **Documentação inline** - JSDoc em funções complexas
8. **Testes são importantes** - Coverage mínimo 65%

---

## ⚠️ AVISOS IMPORTANTES

### ❌ NUNCA faça:

1. **Componentes HTML nativos** (`<input>`, `<button>`, etc)
2. **Cores customizadas** (fora da paleta universal)
3. **CSS inline** ou styled-components
4. **Requests diretos** (sempre use hooks/services)
5. **Hardcode de URLs** (use env vars)
6. **Commits sem teste**
7. **Push para main** (sempre PR)
8. **Quebrar backwards compatibility**

### ✅ SEMPRE faça:

1. **Leia documentação** antes de desenvolver
2. **Siga padrões** existentes
3. **Teste manualmente** antes de commit
4. **Escreva testes** para lógica complexa
5. **Documente mudanças** no código
6. **Peça review** de código importante
7. **Monitore performance** (Lighthouse)
8. **Atualize docs** quando necessário

---

## 🆘 PRECISA DE AJUDA?

1. **Leia primeiro**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. **Busque exemplos**: `src/components/modules/Cirurgias.tsx`
3. **Revise docs**: `/docs`
4. **Pergunte**: Se ainda tiver dúvidas

---

## 📝 CONVENÇÃO DE COMMITS

```bash
# Padrão: tipo(escopo): descrição

# Tipos:
feat(modulo): adicionar nova funcionalidade
fix(modulo): corrigir bug
docs: atualizar documentação
style: formatação (não afeta código)
refactor: refatoração
test: adicionar testes
chore: tarefas de build/CI

# Exemplos:
feat(cirurgias): adicionar filtro por data
fix(estoque): corrigir cálculo de saldo
docs(readme): atualizar instalação
refactor(ia): otimizar hook useIcarusBrain
test(cirurgias): adicionar testes unitários
```

---

## 🎯 RESUMO PARA INICIAR

```typescript
const workflow = {
  1: "Ler CLAUDE.md (este arquivo)",
  2: "Ler .clinerules",
  3: "Ler skill relevante (SKILL_*.md)",
  4: "Estudar módulo de referência (Cirurgias.tsx)",
  5: "Desenvolver seguindo padrões",
  6: "Testar (manual + automatizado)",
  7: "Verificar checklist pré-commit",
  8: "Commit com convenção correta",
  9: "Push e criar PR"
}
```

---

**Versão**: 1.0.0
**Última atualização**: 2025-11-15
**Status**: ✅ Completo e atualizado

🚀 **Agora você está pronto para desenvolver no ICARUS v5.0!**

💡 **Dica**: Mantenha este arquivo aberto enquanto desenvolve. Consulte sempre que tiver dúvidas sobre padrões, estrutura ou boas práticas.
