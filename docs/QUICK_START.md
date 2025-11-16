# ICARUS v5.0 - Guia de Início Rápido

Este guia vai te ajudar a começar a desenvolver com ICARUS v5.0 em minutos.

## 🎯 Objetivo

Criar um módulo funcional do ICARUS seguindo todos os padrões estabelecidos.

## ⚡ Setup Rápido (5 minutos)

### 1. Instalar Dependências

```bash
cd icarus
npm install
```

### 2. Configurar Ambiente

```bash
cp .env.example .env
```

Edite `.env` e adicione suas credenciais:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_ANTHROPIC_API_KEY=sua-chave-anthropic
```

### 3. Rodar Aplicação

```bash
npm run dev
```

Acesse: `http://localhost:5173`

## 📝 Criar Seu Primeiro Módulo (10 minutos)

### Passo 1: Copiar Template

```bash
cp src/components/modules/ModuleTemplate.tsx src/components/modules/MeuModulo.tsx
```

### Passo 2: Renomear Componente

Abra `MeuModulo.tsx` e:

1. Renomeie a função de `ModuleTemplate` para `MeuModulo`
2. Altere o nome da tabela Supabase
3. Customize os KPIs

```tsx
export function MeuModulo() {
  // ...
  const { data } = await supabase
    .from('minha_tabela')  // ← Sua tabela
    .select('*')
}
```

### Passo 3: Customizar KPIs

Modifique os 4 KPIs com as métricas do seu módulo:

```tsx
<Card className="neu-card">
  <CardContent className="pt-6">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm text-gray-600">Minha Métrica</p>
        <p className="text-2xl font-bold mt-1">1.234</p>
        <p className="text-xs text-green-600 mt-1">↑ 10%</p>
      </div>
      <IconeRelevante className="h-8 w-8 text-blue-600" />
    </div>
  </CardContent>
</Card>
```

### Passo 4: Testar

```bash
npm run dev
```

Importe e use seu módulo em algum lugar da aplicação.

## 🎨 Padrões Essenciais

### Grid Responsivo

```tsx
// 4 colunas em desktop, 2 em tablet, 1 em mobile
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  ...
</div>
```

### Form Layout

```tsx
<div className="form-row">
  <label htmlFor="nome">Nome *</label>
  <Input id="nome" required />
</div>
```

### Classes Neumórficas

```tsx
<Card className="neu-card">     {/* KPI cards */}
<Card className="neu-soft">     {/* Raised effect */}
<Card className="neu-pressed">  {/* Inset effect */}
```

### Cores Semânticas

- Botões primários: `variant="default"` (indigo)
- Botões secundários: `variant="secondary"`
- Botões destrutivos: `variant="destructive"`
- Botões outline: `variant="outline"`

## 🤖 Usar IA em Seu Módulo

```tsx
import { useIcarusBrain } from '@/hooks/useIcarusBrain'

function MeuModulo() {
  const { predict, chat } = useIcarusBrain()

  async function handlePrevisao() {
    const resultado = await predict('demanda', {
      item_id: '123',
      dias: 30
    })
    console.log(resultado)
  }

  async function handleAnalise() {
    const resposta = await chat('Analise os dados', {
      contexto: 'meu_modulo'
    })
    console.log(resposta.resposta)
  }
}
```

## 📊 Usar Supabase

```tsx
import { useSupabase } from '@/hooks/useSupabase'

function MeuModulo() {
  const { supabase } = useSupabase()

  // Fetch
  const { data } = await supabase
    .from('tabela')
    .select('*')

  // Create
  const { data } = await supabase
    .from('tabela')
    .insert([{ nome: 'Novo' }])

  // Update
  const { data } = await supabase
    .from('tabela')
    .update({ nome: 'Atualizado' })
    .eq('id', '123')

  // Delete
  const { data } = await supabase
    .from('tabela')
    .delete()
    .eq('id', '123')
}
```

## ✅ Checklist Antes de Commitar

- [ ] Módulo tem 4-5 KPIs
- [ ] Módulo tem 3-5 abas
- [ ] Grid responsivo (4/2/1 colunas)
- [ ] Classes `neu-*` aplicadas
- [ ] Componentes shadcn/ui usados
- [ ] Labels em todos os inputs
- [ ] aria-label em botões de ícone
- [ ] Integração Supabase funcional
- [ ] (Opcional) Integração IA implementada
- [ ] Código testado localmente

## 🎓 Próximos Passos

1. **Ver Exemplo Completo**: Estude `src/components/modules/Produtos.tsx`
2. **Ler Skills**: Explore `/docs/skills/` para padrões avançados
3. **Criar Documentação**: Use `/docs/modulos/ICARUS-MOD-PRODUTOS.md` como template
4. **Adicionar Testes**: Crie testes para seu módulo
5. **Integrar IA**: Adicione análises preditivas

## 📚 Recursos

- [Template Base](/src/components/modules/ModuleTemplate.tsx)
- [Exemplo Produtos](/src/components/modules/Produtos.tsx)
- [OraclusX Design System](/docs/skills/oraclusx-design-system.md)
- [Criar Módulos](/docs/skills/criar-modulos.md)
- [Integração IA](/docs/skills/integracao-ia.md)

## 🆘 Problemas Comuns

### Erro: "Cannot find module '@/...'"

**Solução**: Verifique que `tsconfig.json` tem:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Erro: "supabase is not defined"

**Solução**: Verifique que `.env` tem as variáveis corretas e reinicie o servidor.

### Estilos neumórficos não aparecem

**Solução**: Importe os estilos globais no seu `main.tsx`:

```tsx
import '@/styles/globals.css'
```

### IA retorna erro 401

**Solução**: Verifique que `VITE_ANTHROPIC_API_KEY` está correta no `.env`.

## 💡 Dicas

1. **Use o template**: Sempre comece com `ModuleTemplate.tsx`
2. **Copie do exemplo**: `Produtos.tsx` tem todos os padrões
3. **Seja consistente**: Siga sempre os mesmos padrões
4. **Documente**: Crie um `.md` para seu módulo
5. **Teste**: Sempre teste antes de commitar

---

Pronto para criar módulos incríveis! 🚀

Para dúvidas: `suporte@icarus.com.br`
