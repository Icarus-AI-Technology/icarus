# 🎯 ICARUS - REFERÊNCIA RÁPIDA DE COMPONENTES

**Guia de 1 página** - Consulta rápida dos componentes mais usados

---

## 📦 USAR SEMPRE

| Componente | Importação | Uso |
|------------|------------|-----|
| **Layout** | `import { IcarusModuleLayout } from './components/ui/design-system'` | Container principal de todos os módulos |
| **Header** | `import { IcarusModuleHeader } from './components/ui/design-system'` | Cabeçalho padronizado com título, ícone e ações |
| **KPIs** | `import { IcarusKPIGrid, IcarusKPICard } from './components/ui/design-system'` | Grid de métricas (máx 5 cards) |
| **Tabs** | `import { IcarusTabNavigation } from './components/ui/design-system'` | Navegação por abas |
| **Content** | `import { IcarusContentArea } from './components/ui/design-system'` | Área de conteúdo das abas |
| **Cores** | `import { IcarusColorPalette } from './components/ui/design-system'` | Paleta de 17 cores consistentes |
| **Button** | `import { Button } from './components/oraclusx-ds/Button'` | Botão OraclusX (NÃO shadcn) |
| **Table** | `import { PaginatedTable } from './components/ui/paginated-table'` | Tabela com paginação e busca |
| **Charts** | `import { WorkingLineChart, WorkingDonutChart } from './components/charts/...'` | Gráficos (height 420px obrigatório) |
| **Toast** | `import { toast } from 'sonner'` | Notificações |

---

## ❌ NUNCA USAR

| ❌ Errado | ✅ Correto |
|-----------|------------|
| `<div className="container">` | `<IcarusModuleLayout>` |
| `<h1>Título</h1>` | `<IcarusModuleHeader title="..." />` |
| `<div className="grid grid-cols-5">` | `<IcarusKPIGrid>` |
| `import { Button } from './components/ui/button'` | `import { Button } from './components/oraclusx-ds/Button'` |
| `iconColor="#FF5733"` | `iconColor={IcarusColorPalette.orange}` |
| `<table>`, `<Table>` (shadcn) | `<PaginatedTable>` |
| `<input>`, `<Input>` (shadcn) | `<NeomorphicInput>` |
| `<LineChart height={300}>` | `<WorkingLineChart height={420}>` |

---

## 🎨 PALETA DE CORES

```typescript
IcarusColorPalette = {
  indigo: '#6366F1',   // Cor primária ICARUS
  green: '#10B981',    // Sucesso/Financeiro
  blue: '#3B82F6',     // Informação/Vendas
  teal: '#14B8A6',     // Estoque
  amber: '#F59E0B',    // Alerta
  red: '#EF4444',      // Erro/Crítico
  slate: '#64748B'     // Neutro
  // + 10 cores adicionais
}
```

---

## 📐 REGRAS DE DESIGN

```typescript
{
  // Heights
  kpiCard: "160px",
  chart: "420px",        // ⚠️ OBRIGATÓRIO

  // Border Radius
  button: "10px",
  card: "16px",          // Padrão
  modal: "20px",

  // Spacing
  default: "p-6"         // 24px
}
```

---

## 📋 TEMPLATE MÍNIMO

```tsx
import {
  IcarusModuleLayout,
  IcarusModuleHeader,
  IcarusKPIGrid,
  IcarusKPICard,
  IcarusTabNavigation,
  IcarusContentArea,
  IcarusColorPalette
} from './components/ui/design-system';
import { Button } from './components/oraclusx-ds/Button';
import { Package, Plus } from 'lucide-react';

export const MeuModulo = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <IcarusModuleLayout>
      <IcarusModuleHeader
        title="Meu Módulo"
        icon={Package}
        iconColor={IcarusColorPalette.indigo}
        actions={<Button icon={Plus}>Novo</Button>}
      />

      <IcarusKPIGrid>
        <IcarusKPICard
          title="Total"
          value="142"
          icon={Package}
          iconColor={IcarusColorPalette.green}
        />
      </IcarusKPIGrid>

      <IcarusTabNavigation
        tabs={[{id: 'overview', label: 'Overview'}]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <IcarusContentArea>
        {/* Conteúdo aqui */}
      </IcarusContentArea>
    </IcarusModuleLayout>
  );
};
```

---

## ✅ CHECKLIST PRÉ-COMMIT

- [ ] Usa `IcarusModuleLayout` como container
- [ ] Usa `IcarusModuleHeader` no topo
- [ ] Usa `IcarusKPIGrid` para métricas (máx 5)
- [ ] Usa `IcarusTabNavigation` para abas
- [ ] Usa `Button` do OraclusX (não shadcn)
- [ ] Usa `IcarusColorPalette` (sem cores hardcoded)
- [ ] Usa `PaginatedTable` para tabelas
- [ ] Gráficos têm `height={420}`
- [ ] Usa `toast` do Sonner para notificações
- [ ] Usa ícones do `lucide-react`

---

## 🔗 DOCUMENTAÇÃO COMPLETA

Para detalhes completos de cada componente:

📖 [Ver Guia Completo](./.claude/COMPONENT_GUIDE.md)

---

**Versão**: 1.0.0
**Data**: 16/11/2025
**Status**: ✅ Pronto para uso
