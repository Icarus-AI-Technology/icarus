# HeroUI v2 - Guia de Integração ICARUS v5.0

## 📦 Instalação Completa

HeroUI v2.8.5 foi instalado com sucesso no projeto ICARUS.

```bash
pnpm add @heroui/react @heroui/theme
```

---

## 🎨 Configuração Básica

### 1. Configurar Tailwind CSS v4

HeroUI v2 é totalmente compatível com Tailwind CSS v4. Adicione o plugin no seu `src/index.css`:

```css
@import "@heroui/theme/dist/index.css";

@theme {
  /* Suas variáveis personalizadas */
  --color-primary: #6366F1;
  /* ... */
}
```

### 2. Provider Setup

Envolva sua aplicação com o `HeroUIProvider`:

```tsx
import { HeroUIProvider } from '@heroui/react';

function App() {
  return (
    <HeroUIProvider>
      {/* Seu app */}
    </HeroUIProvider>
  );
}
```

---

## 🧩 Componentes Disponíveis

### Componentes Core
- **Button** - Botões estilizados com variantes
- **Card** - Cards com efeitos glassmorphism
- **Input** - Inputs com validação
- **Modal** - Modais/Dialogs
- **Dropdown** - Menus dropdown
- **Table** - Tabelas responsivas
- **Tabs** - Navegação por tabs
- **Tooltip** - Tooltips informativos

### Componentes de Navegação
- **Navbar** - Barra de navegação
- **Breadcrumbs** - Navegação hierárquica
- **Pagination** - Paginação de dados

### Componentes de Formulário
- **Checkbox** - Checkboxes customizados
- **Radio** - Radio buttons
- **Select** - Selects estilizados
- **Switch** - Toggle switches
- **Textarea** - Áreas de texto

### Componentes de Feedback
- **Badge** - Badges/Tags
- **Avatar** - Avatares de usuário
- **Progress** - Barras de progresso
- **Spinner** - Loading spinners
- **Skeleton** - Loading skeletons

---

## 📝 Exemplos de Uso

### Button com OraclusX Style

```tsx
import { Button } from '@heroui/react';

<Button 
  color="primary" 
  variant="shadow"
  className="bg-[#6366F1] text-white"
>
  Salvar
</Button>
```

### Card Neuromórfico

```tsx
import { Card, CardBody, CardHeader } from '@heroui/react';

<Card className="neu-soft bg-[var(--surface-raised)]">
  <CardHeader>
    <h3 className="text-lg font-semibold">Dashboard</h3>
  </CardHeader>
  <CardBody>
    <p>Conteúdo do card</p>
  </CardBody>
</Card>
```

### Input com Validação

```tsx
import { Input } from '@heroui/react';

<Input
  type="email"
  label="Email"
  placeholder="Digite seu email"
  errorMessage="Email inválido"
  isInvalid={!!errors.email}
/>
```

### Modal/Dialog

```tsx
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure } from '@heroui/react';

function Example() {
  const {isOpen, onOpen, onOpenChange} = useDisclosure();

  return (
    <>
      <Button onPress={onOpen}>Abrir Modal</Button>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Título</ModalHeader>
              <ModalBody>
                <p>Conteúdo do modal</p>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Fechar
                </Button>
                <Button color="primary" onPress={onClose}>
                  Confirmar
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
```

### Table Responsiva

```tsx
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';

<Table aria-label="Tabela de produtos">
  <TableHeader>
    <TableColumn>NOME</TableColumn>
    <TableColumn>PREÇO</TableColumn>
    <TableColumn>STATUS</TableColumn>
  </TableHeader>
  <TableBody>
    <TableRow key="1">
      <TableCell>Produto 1</TableCell>
      <TableCell>R$ 100,00</TableCell>
      <TableCell>Ativo</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## 🎨 Integração com OraclusX Design System

### Manter Consistência Visual

HeroUI v2 pode ser customizado para seguir o OraclusX Design System:

```tsx
// Exemplo de Button customizado
<Button 
  className={cn(
    "neu-soft",
    "bg-[#6366F1] text-white",
    "shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
    "hover:shadow-[8px_8px_16px_var(--shadow-dark),-8px_-8px_16px_var(--shadow-light)]"
  )}
>
  Botão Neuromórfico
</Button>
```

### Variantes Personalizadas

Use Tailwind Variants para criar componentes híbridos:

```tsx
import { tv } from 'tailwind-variants';

const button = tv({
  base: "font-semibold rounded-xl transition-all duration-200",
  variants: {
    color: {
      primary: "bg-[#6366F1] text-white",
      success: "bg-[#10B981] text-white",
      danger: "bg-[#EF4444] text-white",
    },
    neomorphic: {
      true: "neu-soft shadow-[6px_6px_12px_var(--shadow-dark),-6px_-6px_12px_var(--shadow-light)]",
    }
  }
});
```

---

## 🚀 Quando Usar HeroUI vs OraclusX Components

### Use HeroUI para:
- ✅ Tabelas complexas (`<Table>`)
- ✅ Modais/Dialogs (`<Modal>`)
- ✅ Dropdowns/Selects (`<Dropdown>`, `<Select>`)
- ✅ Componentes de navegação (`<Navbar>`, `<Breadcrumbs>`)
- ✅ Componentes de feedback (`<Progress>`, `<Spinner>`)

### Use OraclusX Components para:
- ✅ Cards neuromórficos (`<NeuCard>`)
- ✅ Buttons primários (`<NeuButton>`)
- ✅ Inputs com estilo específico (`<NeuInput>`)
- ✅ Componentes customizados do projeto

---

## 📚 Recursos

- **Documentação Oficial**: https://www.heroui.com/docs
- **Componentes**: https://www.heroui.com/docs/components
- **Tailwind v4 Guide**: https://www.heroui.com/docs/guide/tailwind-v4
- **GitHub**: https://github.com/heroui-inc/heroui

---

## ⚠️ Notas Importantes

1. **React 19 Compatibilidade**: HeroUI v2 funciona perfeitamente com React 19
2. **Peer Dependencies**: Alguns warnings de peer deps são esperados e não afetam funcionalidade
3. **Tailwind v4**: Totalmente compatível com a configuração CSS-first
4. **Tree-Shaking**: HeroUI v2 suporta tree-shaking para bundles menores

---

## 🔄 Migração Futura (HeroUI v3)

HeroUI v3 está em beta com:
- 8 novos componentes (Alert, InputOTP, ListBox, etc.)
- Novo design system
- Melhor suporte React 19
- Breaking changes no design system

**Recomendação**: Manter v2 em produção até v3 estar estável.

---

**Versão**: HeroUI v2.8.5  
**Data**: 2025-11-26  
**Projeto**: ICARUS v5.0.3

