# 🧪 Code Connect - Testes Práticos

Guia de testes para validar que Code Connect está funcionando corretamente.

---

## ⚡ Setup Inicial

Antes de começar os testes, certifique-se de que:

```bash
# 1. Dependências instaladas
npm install

# 2. Node IDs atualizados
npm run figma:setup

# 3. Figma autenticado
npm run figma:auth

# 4. Componentes publicados
npm run figma:publish

# 5. Verificar publicação
npm run figma:list
```

---

## 📋 Suite de Testes

### Teste 1: Botão Simples ⭐ BÁSICO

**Objetivo:** Verificar se Claude Code usa NeuButton

**Prompt para Claude Code:**
```
Crie um botão de salvar usando o design ICARUS
```

**Resultado Esperado:**
```tsx
import { NeuButton } from '@/components/ui/neu-button';
import { Icon3D } from '@/components/ui/icon-3d';

<NeuButton
  variant="soft"
  icon={<Icon3D name="save" />}
  iconPosition="left"
  onClick={handleSave}
>
  Salvar
</NeuButton>
```

**Checklist de Validação:**
- [ ] Usa `NeuButton` (não `<button>`)
- [ ] Tem `variant="soft"` (variant correto)
- [ ] Tem `Icon3D` (não lucide-react)
- [ ] Tem `iconPosition="left"`
- [ ] Import correto `@/components/ui/neu-button`

**Status:** ___ ✅ PASSOU | ❌ FALHOU

**Se falhou:** Claude Code pode não estar consultando Code Connect. Tente:
```
"Crie um botão de salvar usando componentes ICARUS do Figma"
```

---

### Teste 2: Botão com Loading ⭐ INTERMEDIÁRIO

**Objetivo:** Verificar se aplica loading states automaticamente

**Prompt:**
```
Crie um botão de salvar que mostre loading durante a operação assíncrona
```

**Resultado Esperado:**
```tsx
const [isSaving, setIsSaving] = useState(false);

<NeuButton
  variant="soft"
  loading={isSaving}
  disabled={isSaving}
  icon={<Icon3D name="save" />}
  iconPosition="left"
  onClick={handleSave}
>
  {isSaving ? 'Salvando...' : 'Salvar'}
</NeuButton>
```

**Checklist:**
- [ ] Estado `isSaving` criado
- [ ] Prop `loading={isSaving}`
- [ ] Prop `disabled={isSaving}` (desabilita durante loading)
- [ ] Texto muda durante loading
- [ ] Import do useState

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 3: Botão Destrutivo ⭐ AVANÇADO

**Objetivo:** Verificar se aplica confirmDialog em ações destrutivas

**Prompt:**
```
Crie um botão de deletar conta com confirmação
```

**Resultado Esperado:**
```tsx
<NeuButton
  variant="danger"
  icon={<Icon3D name="trash" />}
  confirmDialog={{
    title: "Deletar conta",
    message: "Esta ação não pode ser desfeita",
    confirmText: "Deletar",
    cancelText: "Cancelar"
  }}
  onClick={handleDelete}
  aria-label="Deletar conta permanentemente"
>
  Deletar Conta
</NeuButton>
```

**Checklist:**
- [ ] `variant="danger"` (vermelho para destrutivo)
- [ ] Tem `confirmDialog` configurado
- [ ] Tem `aria-label` descritivo
- [ ] Mensagem clara sobre irreversibilidade
- [ ] Ícone `trash` apropriado

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 4: Card Simples ⭐ BÁSICO

**Objetivo:** Verificar se usa NeuCard

**Prompt:**
```
Crie um card para mostrar o saldo bancário
```

**Resultado Esperado:**
```tsx
import { NeuCard } from '@/components/ui/neu-card';
import { Icon3D } from '@/components/ui/icon-3d';

<NeuCard variant="soft" elevation="medium" padding="lg">
  <div className="flex items-center gap-4">
    <Icon3D name="wallet" size="lg" />
    <div>
      <p className="text-sm text-gray-600">Saldo Disponível</p>
      <p className="text-2xl font-bold">R$ 125.430,00</p>
    </div>
  </div>
</NeuCard>
```

**Checklist:**
- [ ] Usa `NeuCard` (não `<div>`)
- [ ] `variant="soft"` (elevação externa)
- [ ] `elevation="medium"` (padrão)
- [ ] `padding="lg"` (espaçamento adequado)
- [ ] Icon3D incluído
- [ ] Formatação de moeda brasileira

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 5: Input com Validação ⭐ INTERMEDIÁRIO

**Objetivo:** Verificar integração com react-hook-form

**Prompt:**
```
Crie um campo de email com validação usando react-hook-form
```

**Resultado Esperado:**
```tsx
import { NeuInput } from '@/components/ui/neu-input';
import { useForm } from 'react-hook-form';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <NeuInput
      label="Email"
      type="email"
      placeholder="seu@email.com"
      error={errors.email?.message}
      helperText="Usaremos para recuperação de senha"
      {...register('email', {
        required: 'Email é obrigatório',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
          message: 'Email inválido'
        }
      })}
    />
  );
}
```

**Checklist:**
- [ ] Usa `NeuInput`
- [ ] `type="email"` correto
- [ ] Tem `label` descritivo
- [ ] Tem `error` mapeado de react-hook-form
- [ ] Tem `helperText` útil
- [ ] Validação com `required` e `pattern`
- [ ] Mensagens de erro específicas

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 6: Formulário Completo ⭐ AVANÇADO

**Objetivo:** Verificar composição de múltiplos componentes

**Prompt:**
```
Crie um formulário completo de cadastro de produto com nome, código e preço, usando componentes ICARUS
```

**Resultado Esperado:**
```tsx
import { useForm } from 'react-hook-form';
import { NeuInput } from '@/components/ui/neu-input';
import { NeuButton } from '@/components/ui/neu-button';
import { NeuCard } from '@/components/ui/neu-card';
import { Icon3D } from '@/components/ui/icon-3d';

export function ProdutoForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = async (data) => {
    // API call
  };

  return (
    <NeuCard variant="soft" padding="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <NeuInput
          label="Nome do Produto"
          placeholder="Ex: Prótese de Joelho"
          error={errors.nome?.message}
          {...register('nome', { required: 'Nome é obrigatório' })}
        />

        <NeuInput
          label="Código"
          placeholder="PRO-001"
          helperText="Formato: PRO-XXX"
          error={errors.codigo?.message}
          {...register('codigo', {
            required: 'Código é obrigatório',
            pattern: {
              value: /^PRO-\d{3}$/,
              message: 'Formato inválido'
            }
          })}
        />

        <NeuInput
          label="Preço"
          type="number"
          placeholder="0.00"
          error={errors.preco?.message}
          {...register('preco', {
            required: 'Preço é obrigatório',
            min: { value: 0.01, message: 'Preço deve ser maior que zero' }
          })}
        />

        <div className="flex gap-3 justify-end pt-4">
          <NeuButton variant="secondary" type="button">
            Cancelar
          </NeuButton>

          <NeuButton
            variant="soft"
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<Icon3D name="check" />}
          >
            Salvar
          </NeuButton>
        </div>
      </form>
    </NeuCard>
  );
}
```

**Checklist:**
- [ ] NeuCard wrapper
- [ ] 3 NeuInputs com validação
- [ ] Labels descritivos
- [ ] Placeholders úteis
- [ ] Helper text quando apropriado
- [ ] Máscaras/patterns em código
- [ ] Mensagens de erro específicas
- [ ] 2 botões (cancelar + salvar)
- [ ] Botão salvar com loading
- [ ] Icon3D no botão salvar
- [ ] Espaçamento adequado (space-y-4)
- [ ] Alinhamento correto (justify-end)

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 7: Sidebar ⭐ INTERMEDIÁRIO

**Objetivo:** Verificar Sidebar responsivo

**Prompt:**
```
Crie uma sidebar para navegação do ICARUS com os módulos principais
```

**Resultado Esperado:**
```tsx
import { Sidebar } from '@/components/layout/sidebar';
import { useSidebarStore } from '@/stores/sidebar';
import { useAuth } from '@/hooks/useAuth';

const ICARUS_MODULES = [
  { id: 'dashboard', icon: 'home', label: 'Dashboard', href: '/dashboard' },
  { id: 'financeiro', icon: 'wallet', label: 'Financeiro', href: '/financeiro' },
  { id: 'estoque', icon: 'package', label: 'Estoque', href: '/estoque' },
  { id: 'vendas', icon: 'shopping-cart', label: 'Vendas', href: '/vendas' },
];

function Layout({ children }) {
  const { collapsed, toggle } = useSidebarStore();
  const { user } = useAuth();

  return (
    <div className="flex h-screen">
      <Sidebar
        collapsed={collapsed}
        onToggle={toggle}
        modules={ICARUS_MODULES}
        user={user}
        theme="light"
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
```

**Checklist:**
- [ ] Usa `Sidebar` component
- [ ] Array `ICARUS_MODULES` definido
- [ ] Módulos com id, icon, label, href
- [ ] useSidebarStore para estado
- [ ] Prop `collapsed` e `onToggle`
- [ ] Prop `modules` com array
- [ ] Prop `user` do auth
- [ ] Layout flex correto

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

### Teste 8: Composição Completa ⭐ EXPERT

**Objetivo:** Página completa com todos os componentes

**Prompt:**
```
Crie a página de Contas a Pagar do ICARUS com:
- Sidebar com navegação
- Card com KPIs (total contas, vencidas, pagas)
- Formulário de filtros
- Tabela de contas (simulada)
```

**Checklist:**
- [ ] Sidebar implementada
- [ ] 3+ NeuCards para KPIs
- [ ] Icon3D nos cards
- [ ] Formulário de filtros com NeuInputs
- [ ] Botões de ação (NeuButton)
- [ ] Layout responsivo
- [ ] Espaçamento consistente
- [ ] Tipografia adequada
- [ ] Acessibilidade (labels, aria-*)

**Status:** ___ ✅ PASSOU | ❌ FALHOU

---

## 📊 Scorecard

### Resultados:

| Teste | Nome | Dificuldade | Status |
|-------|------|-------------|--------|
| 1 | Botão Simples | ⭐ Básico | ___ |
| 2 | Botão Loading | ⭐ Intermediário | ___ |
| 3 | Botão Destrutivo | ⭐ Avançado | ___ |
| 4 | Card Simples | ⭐ Básico | ___ |
| 5 | Input Validação | ⭐ Intermediário | ___ |
| 6 | Formulário Completo | ⭐ Avançado | ___ |
| 7 | Sidebar | ⭐ Intermediário | ___ |
| 8 | Página Completa | ⭐ Expert | ___ |

### Score:

- **8/8 (100%)**: 🏆 **PERFEITO!** Code Connect funcionando perfeitamente
- **6-7/8 (75-87%)**: ✅ **ÓTIMO!** Pequenos ajustes necessários
- **4-5/8 (50-62%)**: ⚠️ **BOM** Algumas custom instructions não aplicadas
- **0-3/8 (<50%)**: ❌ **RECONFIGURAR** Verificar Node IDs e republicar

---

## 🔧 Troubleshooting

### Score < 50%

**Problema:** Code Connect não está sendo consultado

**Soluções:**
1. Verificar Node IDs corretos
2. Re-autenticar: `npm run figma:auth`
3. Republicar: `npm run figma:publish`
4. Listar: `npm run figma:list` (deve mostrar 4 componentes)
5. Ser mais específico nos prompts: "usando componentes ICARUS"

### Score 50-75%

**Problema:** Algumas custom instructions não aplicadas

**Soluções:**
1. Republicar componentes: `npm run figma:publish`
2. Verificar sintaxe dos `.figma.tsx`
3. Melhorar prompts: mencionar "design do Figma"
4. Iterar: pedir ajustes específicos

### Score > 75%

**Problema:** Pequenos ajustes pontuais

**Soluções:**
1. Ajustar prompts para ser mais específico
2. Pedir correções incrementais
3. Expandir custom instructions se padrão recorrente

---

## 💡 Dicas de Prompts

### ✅ Bons Prompts:

```
"Crie um botão de salvar usando componentes ICARUS"
"Seguindo o design do Figma, crie um formulário de..."
"Use o design system neumórfico para criar..."
"Crie usando NeuButton com todos os padrões ICARUS"
```

### ❌ Prompts Ruins:

```
"Crie um botão" (muito genérico)
"Faça igual ao exemplo" (sem contexto)
"Botão azul" (ignora design system)
```

---

## 📈 Métricas de Sucesso

Após passar em todos os testes, você deve observar:

### Produtividade:
- ⚡ Redução de 75% no tempo de desenvolvimento
- 🎯 Redução de 92% em retrabalho
- ✅ 99% de consistência no código

### Qualidade:
- 🐛 93% menos erros
- ♿ 100% acessibilidade
- 🎨 100% design system compliance

---

## ✅ Certificação

Após completar todos os testes com score > 75%:

```
╔════════════════════════════════════════════════════╗
║                                                    ║
║   ✅ CODE CONNECT CERTIFICADO!                    ║
║                                                    ║
║   Score: ___/8 (___%)                             ║
║   Status: _______________                         ║
║                                                    ║
║   Você está pronto para:                          ║
║   ✅ Desenvolver 75% mais rápido                  ║
║   ✅ Produzir código production-ready             ║
║   ✅ Manter 99% de consistência                   ║
║                                                    ║
║   Data: _____________                             ║
║   Certificado por: Claude Code                    ║
║                                                    ║
╚════════════════════════════════════════════════════╝
```

---

**Versão**: 1.0.0
**Data**: 2025-11-16

🎉 **Boa sorte nos testes!**
