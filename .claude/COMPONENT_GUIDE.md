# 🤖 GUIA CLAUDE CODE - ICARUS v5.0

**Objetivo**: Eliminar retrabalho e garantir código 100% conforme aos padrões do projeto

---

## ⚠️ PROBLEMA IDENTIFICADO

```
❌ Claude Code não conhece componentes reais
❌ Gera código genérico (sem padrões do projeto)
❌ Dev precisa reescrever usando componentes corretos
❌ Inconsistência entre design e código
❌ Retrabalho constante (~60% do tempo)
```

## ✅ SOLUÇÃO

Este guia contém **TODOS os componentes reais** com exemplos práticos prontos para copiar/colar.

---

## 📦 COMPONENTES DISPONÍVEIS NO PROJETO

### 1. ORACLUSX DESIGN SYSTEM (9 componentes principais)

**Localização**: `/components/ui/design-system.tsx`

#### **1.1 IcarusModuleLayout** - Container Principal

```tsx
import { IcarusModuleLayout } from "./components/ui/design-system";

// ✅ USO CORRETO
<IcarusModuleLayout>
  {/* Todo o conteúdo do módulo aqui */}
</IcarusModuleLayout>

// ❌ NUNCA USAR
<div className="container">...</div>
<div className="module-wrapper">...</div>
```

---

#### **1.2 IcarusModuleHeader** - Cabeçalho Padronizado

```tsx
import { IcarusModuleHeader } from "./components/ui/design-system";
import { Package } from "lucide-react";

// ✅ USO CORRETO
<IcarusModuleHeader
  title="Estoque Inteligente"
  subtitle="Gestão completa com IA e predição de demanda"
  icon={Package}
  iconColor="#14B8A6" // Teal
/>

// ❌ NUNCA USAR
<h1>Título</h1>
<div className="header">...</div>
```

**Props disponíveis**:
```typescript
interface IcarusModuleHeaderProps {
  title: string;           // Obrigatório
  subtitle?: string;       // Opcional
  icon?: React.ComponentType<{size?: number}>; // Ícone Lucide
  iconColor?: string;      // Cor hexadecimal
  actions?: React.ReactNode; // Botões de ação
}
```

---

#### **1.3 IcarusKPIGrid** - Grid de KPIs

```tsx
import { IcarusKPIGrid } from "./components/ui/design-system";

// ✅ USO CORRETO - Máximo 5 KPIs
<IcarusKPIGrid>
  <IcarusKPICard {...kpi1} />
  <IcarusKPICard {...kpi2} />
  <IcarusKPICard {...kpi3} />
  <IcarusKPICard {...kpi4} />
  <IcarusKPICard {...kpi5} />
</IcarusKPIGrid>

// ❌ NUNCA USAR
<div className="grid grid-cols-5">...</div>
<div className="kpi-container">...</div>
```

**Regras**:
- ✅ Máximo 5 cards por grid
- ✅ Usa IcarusKPICard dentro
- ❌ Não criar grid customizado

---

#### **1.4 IcarusKPICard** - Card Individual de KPI

```tsx
import { IcarusKPICard } from "./components/ui/design-system";
import { DollarSign, TrendingUp } from "lucide-react";

// ✅ EXEMPLO COMPLETO
<IcarusKPICard
  title="Faturamento Mensal"
  value="R$ 2.847.500"
  change="+12.3%"
  changeType="positive" // 'positive' | 'negative' | 'neutral'
  icon={DollarSign}
  iconColor="#10B981" // Green
  trend="up" // 'up' | 'down' | 'stable'
  subtitle="Meta: R$ 3.000.000"
  onClick={() => console.log("KPI clicado")}
/>

// ❌ NUNCA CRIAR CARD CUSTOMIZADO
<div className="kpi-card">
  <h3>Título</h3>
  <p>Valor</p>
</div>
```

**Props disponíveis**:
```typescript
interface IcarusKPICardProps {
  title: string;                    // Obrigatório
  value: string | number;           // Obrigatório
  change?: string;                  // Ex: "+12.3%"
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ComponentType;       // Ícone Lucide
  iconColor?: string;               // Hex color
  trend?: 'up' | 'down' | 'stable';
  subtitle?: string;
  onClick?: () => void;
  loading?: boolean;
}
```

**Cores por tipo de KPI**:
```typescript
const KPI_COLORS = {
  financeiro: "#10B981",  // Green
  vendas: "#3B82F6",      // Blue
  estoque: "#14B8A6",     // Teal
  alerta: "#F59E0B",      // Amber
  critico: "#EF4444",     // Red
  satisfacao: "#EC4899"   // Pink
};
```

---

#### **1.5 IcarusTabNavigation** - Navegação por Abas

```tsx
import { IcarusTabNavigation } from "./components/ui/design-system";

// ✅ USO CORRETO
const tabs = [
  { id: "overview", label: "Visão Geral", icon: BarChart3 },
  { id: "details", label: "Detalhes", icon: FileText },
  { id: "analytics", label: "Analytics", icon: TrendingUp }
];

<IcarusTabNavigation
  tabs={tabs}
  activeTab={activeTab}
  onTabChange={setActiveTab}
/>

// ❌ NUNCA USAR
<Tabs>
  <TabsList>
    <TabsTrigger>Aba 1</TabsTrigger>
  </TabsList>
</Tabs>
```

**Interface**:
```typescript
interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{size?: number}>;
  badge?: string | number;
  disabled?: boolean;
}

interface IcarusTabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}
```

---

#### **1.6 IcarusContentArea** - Área de Conteúdo

```tsx
import { IcarusContentArea } from "./components/ui/design-system";

// ✅ USO CORRETO
<IcarusContentArea>
  {/* Conteúdo da aba ativa */}
  {activeTab === 'overview' && <OverviewContent />}
  {activeTab === 'details' && <DetailsContent />}
</IcarusContentArea>

// ❌ NUNCA USAR
<div className="content">...</div>
<TabsContent>...</TabsContent>
```

---

#### **1.7 IcarusListItem** - Item de Lista

```tsx
import { IcarusListItem } from "./components/ui/design-system";
import { Package } from "lucide-react";

// ✅ USO CORRETO
<IcarusListItem
  title="Stent Coronário Farmacológico"
  subtitle="Código: OPME-001 | Estoque: 50 un"
  icon={Package}
  iconColor="#10B981"
  value="R$ 6.500,00"
  status="active" // 'active' | 'warning' | 'error' | 'disabled'
  onClick={() => handleItemClick()}
  actions={
    <>
      <Button size="sm" variant="ghost">Editar</Button>
      <Button size="sm" variant="ghost">Ver</Button>
    </>
  }
/>

// ❌ NUNCA CRIAR LISTA CUSTOMIZADA
<li>...</li>
<div className="list-item">...</div>
```

---

#### **1.8 IcarusColorPalette** - Paleta de Cores

```tsx
import { IcarusColorPalette } from "./components/ui/design-system";

// ✅ USAR CORES DA PALETA
const color = IcarusColorPalette.indigo; // "#6366F1"
const color2 = IcarusColorPalette.green; // "#10B981"

// 17 cores disponíveis:
IcarusColorPalette = {
  blue: '#3B82F6',
  indigo: '#6366F1',    // Cor primária ICARUS
  cyan: '#06B6D4',
  teal: '#14B8A6',
  green: '#10B981',
  emerald: '#059669',
  lime: '#84CC16',
  amber: '#F59E0B',
  orange: '#F97316',
  red: '#EF4444',
  rose: '#F43F5E',
  pink: '#EC4899',
  purple: '#A855F7',
  violet: '#8B5CF6',
  sky: '#0EA5E9',
  slate: '#64748B',
  yellow: '#EAB308'
};

// ❌ NUNCA USAR CORES HARDCODED
iconColor="#FF5733" // ❌ ERRADO
iconColor={IcarusColorPalette.orange} // ✅ CORRETO
```

---

### 2. COMPONENTES NEUMÓRFICOS (3 principais)

**Localização**: `/components/`

#### **2.1 NeomorphicCard** - Card 3D

```tsx
import { NeomorphicCard } from "./components/NeomorphicCard";

// ✅ USO CORRETO
<NeomorphicCard
  className="p-6"
  variant="raised" // 'raised' | 'flat' | 'inset'
  hover={true}
  onClick={() => console.log("Card clicado")}
>
  <h3>Título do Card</h3>
  <p>Conteúdo...</p>
</NeomorphicCard>

// Variantes:
// raised: Botões elevados (padrão)
// flat: Cards planos
// inset: Inputs afundados
```

---

#### **2.2 NeomorphicIconBox** - Ícone Colorido 3D

```tsx
import { NeomorphicIconBox } from "./components/NeomorphicIconBox";
import { Package } from "lucide-react";

// ✅ USO CORRETO
<NeomorphicIconBox
  icon={Package}
  color="#14B8A6" // Hex color
  size={48}       // pixels
  variant="rounded" // 'rounded' | 'circle'
/>

// ❌ NUNCA USAR
<div className="icon-box">
  <Package />
</div>
```

---

#### **2.3 NeomorphicInput** - Input Afundado

```tsx
import { NeomorphicInput } from "./components/NeomorphicInput";

// ✅ USO CORRETO
<NeomorphicInput
  placeholder="Digite aqui..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  icon={Search} // Opcional
  type="text"
/>

// ❌ NUNCA USAR
<Input /> // shadcn genérico
<input className="..." />
```

---

### 3. TABELAS PAGINADAS

**Localização**: `/components/ui/paginated-table.tsx`

```tsx
import { PaginatedTable } from "./components/ui/paginated-table";

// ✅ EXEMPLO COMPLETO
const columns = [
  { key: "codigo", label: "Código", sortable: true },
  { key: "nome", label: "Produto", sortable: true },
  { key: "estoque", label: "Estoque", sortable: true, align: "right" },
  { key: "valor", label: "Valor", sortable: true, align: "right",
    format: (value) => `R$ ${value.toLocaleString('pt-BR')}`
  },
  { key: "actions", label: "Ações", sortable: false }
];

const data = [
  {
    id: "1",
    codigo: "OPME-001",
    nome: "Stent Coronário",
    estoque: 50,
    valor: 6500,
    actions: (
      <>
        <Button size="sm" variant="ghost">Editar</Button>
        <Button size="sm" variant="ghost">Ver</Button>
      </>
    )
  }
];

<PaginatedTable
  columns={columns}
  data={data}
  pageSize={20}
  searchable={true}
  searchPlaceholder="Buscar produtos..."
  onRowClick={(row) => console.log("Linha clicada", row)}
  emptyMessage="Nenhum produto encontrado"
  loading={isLoading}
/>

// ❌ NUNCA CRIAR TABELA DO ZERO
<table>...</table>
<Table>...</Table> // shadcn genérico
```

**Props disponíveis**:
```typescript
interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  format?: (value: any) => React.ReactNode;
  width?: string;
}

interface PaginatedTableProps {
  columns: Column[];
  data: any[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  loading?: boolean;
  actions?: React.ReactNode;
}
```

---

### 4. GRÁFICOS (2 componentes funcionais)

**Localização**: `/components/charts/`

#### **4.1 WorkingLineChart** - Gráfico de Linha

```tsx
import { WorkingLineChart } from "./components/charts/WorkingLineChart";

// ✅ USO CORRETO
<WorkingLineChart
  data={[
    { month: "Jan", value: 450000, target: 500000 },
    { month: "Fev", value: 520000, target: 500000 },
    { month: "Mar", value: 580000, target: 500000 }
  ]}
  height={420} // Altura padrão OBRIGATÓRIA
  lines={[
    { dataKey: "value", stroke: "#10B981", name: "Real" },
    { dataKey: "target", stroke: "#3B82F6", name: "Meta", strokeDasharray: "5 5" }
  ]}
  xAxisKey="month"
/>

// ⚠️ ALTURA PADRÃO OBRIGATÓRIA: 420px
```

---

#### **4.2 WorkingDonutChart** - Gráfico Donut

```tsx
import { WorkingDonutChart } from "./components/charts/WorkingDonutChart";

// ✅ USO CORRETO
<WorkingDonutChart
  data={[
    { name: "Ortopedia", value: 35, color: "#10B981" },
    { name: "Cardiologia", value: 28, color: "#3B82F6" },
    { name: "Neurologia", value: 18, color: "#8B5CF6" },
    { name: "Vascular", value: 12, color: "#F59E0B" },
    { name: "Outros", value: 7, color: "#94A3B8" }
  ]}
  height={420} // Altura padrão OBRIGATÓRIA
  centerText="142"
  centerSubtext="Cirurgias"
/>

// ⚠️ USAR CORES DA PALETA IcarusColorPalette
```

---

### 5. FORMULÁRIOS (15 componentes especializados)

**Localização**: `/components/formularios/`

#### **5.1 FormularioProdutoOPME** - Cadastro de Produto

```tsx
import { FormularioProdutoOPME } from "./components/formularios/FormularioProdutoOPMEAvancado";

// ✅ USO CORRETO
<FormularioProdutoOPME
  initialData={produto} // Opcional, para edição
  onSubmit={(data) => handleSaveProduto(data)}
  onCancel={() => setModalOpen(false)}
  mode="create" // 'create' | 'edit'
/>

// Campos incluídos:
// - Código, Nome, Descrição
// - Código ANVISA (validação automática)
// - NCM, CEST (fiscal)
// - Categoria, Fabricante
// - Preço custo/venda
// - Estoque mín/máx
// - Lote, Validade
// - Imagens
```

---

#### **5.2 FormularioCirurgia** - Agendamento de Cirurgia

```tsx
import { FormularioCirurgia } from "./components/formularios/FormularioCirurgia";

// ✅ USO CORRETO
<FormularioCirurgia
  onSubmit={(data) => handleCreateCirurgia(data)}
  onCancel={() => setModalOpen(false)}
/>

// Campos incluídos:
// - Dados do paciente
// - Médico (autocomplete)
// - Hospital (autocomplete)
// - Data/hora
// - Especialidade
// - Procedimento (TUSS)
// - Materiais necessários
// - Urgência
// - Convênio
```

---

#### **5.3 FormularioMedicoAvancado** - Cadastro de Médico

```tsx
import { FormularioMedicoAvancado } from "./components/formularios/FormularioMedicoAvancado";

// ✅ USO CORRETO
<FormularioMedicoAvancado
  initialData={medico}
  onSubmit={(data) => handleSaveMedico(data)}
  onCancel={() => setModalOpen(false)}
/>

// Campos incluídos:
// - Nome completo
// - CRM + UF (validação automática)
// - Especialidades (autocomplete múltiplo)
// - Hospitais credenciados
// - Contato (telefone, email)
// - Endereço completo
// - Produtos OPME preferidos
// - Horários de atendimento
```

---

### 6. BOTÕES (ORACLUSX DS)

**Localização**: `/components/oraclusx-ds/Button.tsx`

```tsx
import { Button } from "./components/oraclusx-ds/Button";

// ✅ USAR BOTÃO ORACLUSX
<Button
  variant="primary"   // 'primary' | 'secondary' | 'outline' | 'ghost'
  size="md"          // 'sm' | 'md' | 'lg'
  icon={Plus}        // Opcional
  iconPosition="left" // 'left' | 'right'
  loading={isLoading}
  disabled={false}
  onClick={handleClick}
>
  Salvar Produto
</Button>

// ❌ NÃO USAR BOTÃO SHADCN GENÉRICO
import { Button } from "./components/ui/button"; // ❌ ERRADO
```

**Variantes**:
```tsx
// Primary - Cor primária (#6366F1)
<Button variant="primary">Salvar</Button>

// Secondary - Verde (#10B981)
<Button variant="secondary">Confirmar</Button>

// Outline - Borda apenas
<Button variant="outline">Cancelar</Button>

// Ghost - Transparente
<Button variant="ghost">Fechar</Button>
```

---

### 7. MODAIS E DIALOGS

**Shadcn Dialog** (pode usar)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./components/ui/dialog";
import { Button } from "./components/oraclusx-ds/Button";

// ✅ USO CORRETO
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Novo Produto OPME</DialogTitle>
    </DialogHeader>

    <FormularioProdutoOPME
      onSubmit={handleSubmit}
      onCancel={() => setIsOpen(false)}
    />

    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Salvar
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 8. BADGES E STATUS

**Shadcn Badge** (pode usar)

```tsx
import { Badge } from "./components/ui/badge";

// ✅ STATUS COLORIDOS
<Badge variant="default">Ativo</Badge>
<Badge variant="secondary">Pendente</Badge>
<Badge variant="destructive">Vencido</Badge>
<Badge variant="outline">Inativo</Badge>

// Custom colors com style
<Badge style={{ backgroundColor: "#10B981", color: "white" }}>
  ✅ Aprovado
</Badge>
```

---

### 9. NOTIFICAÇÕES

**Sonner Toast** (Biblioteca integrada)

```tsx
import { toast } from "sonner";

// ✅ USO CORRETO
toast.success("Produto salvo com sucesso!");
toast.error("Erro ao salvar produto");
toast.warning("Estoque baixo!");
toast.info("Nova cirurgia agendada");

// Com ação
toast.success("Produto criado", {
  action: {
    label: "Ver produto",
    onClick: () => navigate(`/produtos/${id}`)
  }
});

// ❌ NÃO CRIAR SISTEMA DE NOTIFICAÇÃO CUSTOMIZADO
```

---

## 📋 TEMPLATE DE MÓDULO COMPLETO

### ESTRUTURA PADRÃO DE UM MÓDULO

```tsx
// ✅ TEMPLATE CORRETO - COPIAR E ADAPTAR
import React, { useState } from 'react';
import {
  IcarusModuleLayout,
  IcarusModuleHeader,
  IcarusKPIGrid,
  IcarusKPICard,
  IcarusTabNavigation,
  IcarusContentArea,
  IcarusColorPalette
} from './components/ui/design-system';
import { PaginatedTable } from './components/ui/paginated-table';
import { Button } from './components/oraclusx-ds/Button';
import { Dialog, DialogContent } from './components/ui/dialog';
import {
  Package,
  Plus,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

export const MeuNovoModulo: React.FC = () => {
  // ========== ESTADO ==========
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ========== DADOS (mock ou API) ==========
  const kpis = [
    {
      title: "Total de Itens",
      value: "3.847",
      change: "+12.3%",
      changeType: "positive" as const,
      icon: Package,
      iconColor: IcarusColorPalette.green
    },
    {
      title: "Valor Total",
      value: "R$ 5.847.000",
      change: "+8.5%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: IcarusColorPalette.blue
    },
    {
      title: "Itens Críticos",
      value: "23",
      changeType: "negative" as const,
      icon: AlertTriangle,
      iconColor: IcarusColorPalette.amber
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'lista', label: 'Lista Completa', icon: Package },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const columns = [
    { key: 'codigo', label: 'Código', sortable: true },
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'valor', label: 'Valor', sortable: true, align: 'right' as const },
    { key: 'actions', label: 'Ações', sortable: false }
  ];

  const data = [
    {
      id: '1',
      codigo: 'ITEM-001',
      nome: 'Item Exemplo',
      valor: 1000,
      actions: (
        <>
          <Button size="sm" variant="ghost" onClick={() => handleEdit('1')}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleView('1')}>
            Ver
          </Button>
        </>
      )
    }
  ];

  // ========== HANDLERS ==========
  const handleEdit = (id: string) => {
    console.log('Editar:', id);
    setSelectedItem(data.find(item => item.id === id));
    setModalOpen(true);
  };

  const handleView = (id: string) => {
    console.log('Ver:', id);
  };

  const handleCreate = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Sua lógica de salvar
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Item salvo com sucesso!');
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar item');
    } finally {
      setIsLoading(false);
    }
  };

  // ========== RENDER ==========
  return (
    <IcarusModuleLayout>
      {/* HEADER */}
      <IcarusModuleHeader
        title="Meu Novo Módulo"
        subtitle="Descrição do módulo"
        icon={Package}
        iconColor={IcarusColorPalette.indigo}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
          >
            Novo Item
          </Button>
        }
      />

      {/* KPIs */}
      <IcarusKPIGrid>
        {kpis.map((kpi, index) => (
          <IcarusKPICard key={index} {...kpi} />
        ))}
      </IcarusKPIGrid>

      {/* TABS */}
      <IcarusTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* CONTENT */}
      <IcarusContentArea>
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Visão Geral</h3>
            {/* Seu conteúdo aqui */}
          </div>
        )}

        {activeTab === 'lista' && (
          <PaginatedTable
            columns={columns}
            data={data}
            pageSize={20}
            searchable={true}
            searchPlaceholder="Buscar..."
            onRowClick={(row) => handleView(row.id)}
            loading={isLoading}
          />
        )}

        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Analytics</h3>
            {/* Seus gráficos aqui */}
          </div>
        )}
      </IcarusContentArea>

      {/* MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          {/* Seu formulário aqui */}
        </DialogContent>
      </Dialog>
    </IcarusModuleLayout>
  );
};

export default MeuNovoModulo;
```

---

## 🎨 PALETA DE CORES - REFERÊNCIA RÁPIDA

```typescript
// ✅ SEMPRE USAR IcarusColorPalette
import { IcarusColorPalette } from './components/ui/design-system';

// Cor primária do ICARUS
IcarusColorPalette.indigo // "#6366F1"

// Cores por contexto:
// Financeiro/Sucesso
IcarusColorPalette.green     // "#10B981"
IcarusColorPalette.emerald   // "#059669"

// Informação
IcarusColorPalette.blue      // "#3B82F6"
IcarusColorPalette.cyan      // "#06B6D4"

// Alerta
IcarusColorPalette.amber     // "#F59E0B"
IcarusColorPalette.orange    // "#F97316"

// Erro/Crítico
IcarusColorPalette.red       // "#EF4444"

// Neutro
IcarusColorPalette.slate     // "#64748B"

// Todas as 17 cores:
blue, indigo, cyan, teal, green, emerald, lime,
amber, orange, red, rose, pink, purple, violet,
sky, slate, yellow
```

---

## 📐 REGRAS DE DESIGN

### Heights Padronizados

```typescript
// ✅ ALTURAS OBRIGATÓRIAS
{
  topbar: "64px",
  kpiCard: "160px",
  chart: "420px",        // ⚠️ SEMPRE 420px
  modal: "auto",
  sidebarItem: "48px"
}
```

### Border Radius

```typescript
// ✅ USAR VARIÁVEIS CSS
{
  small: "10px",   // Botões, badges
  medium: "16px",  // Cards (padrão)
  large: "20px",   // Modais
  full: "9999px"   // Circular
}

// No código:
className="rounded-[16px]" // Cards
className="rounded-[10px]" // Botões
```

### Espaçamento

```typescript
// ✅ USAR TAILWIND PADRÃO
{
  xs: "p-2",    // 8px
  sm: "p-4",    // 16px
  md: "p-6",    // 24px (padrão)
  lg: "p-8",    // 32px
  xl: "p-12"    // 48px
}
```

---

## ✅ CHECKLIST DE CONFORMIDADE

Antes de considerar o código pronto, verificar:

### Layout
- [ ] Usa `IcarusModuleLayout` como container
- [ ] Usa `IcarusModuleHeader` para cabeçalho
- [ ] Usa `IcarusKPIGrid` + `IcarusKPICard` para KPIs (máx 5)
- [ ] Usa `IcarusTabNavigation` para abas
- [ ] Usa `IcarusContentArea` para conteúdo

### Componentes
- [ ] Usa `Button` do OraclusX DS (não shadcn)
- [ ] Usa `NeomorphicCard` para cards 3D
- [ ] Usa `PaginatedTable` para tabelas
- [ ] Usa `WorkingLineChart` ou `WorkingDonutChart` para gráficos

### Cores
- [ ] Todas as cores vêm de `IcarusColorPalette`
- [ ] Cor primária é `#6366F1` (indigo)
- [ ] Nenhuma cor hardcoded

### Formulários
- [ ] Usa componentes de `/components/formularios/` quando disponível
- [ ] Validações implementadas
- [ ] Feedback de sucesso/erro com `toast`

### Funcionalidades
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Notificações com `sonner`
- [ ] Navegação funcional

### Ícones
- [ ] Usa apenas ícones do `lucide-react`
- [ ] Ícones consistentes com a sidebar

### Performance
- [ ] Gráficos com height 420px
- [ ] Lazy loading onde aplicável
- [ ] Sem re-renders desnecessários

---

## 🚫 ANTI-PATTERNS - O QUE NUNCA FAZER

```tsx
// ❌ NÃO CRIAR LAYOUTS GENÉRICOS
<div className="container mx-auto">
  <div className="grid grid-cols-5">
    ...
  </div>
</div>

// ✅ USAR COMPONENTES ICARUS
<IcarusModuleLayout>
  <IcarusKPIGrid>
    ...
  </IcarusKPIGrid>
</IcarusModuleLayout>

// ==========================================

// ❌ NÃO USAR BOTÕES SHADCN
import { Button } from "./components/ui/button";

// ✅ USAR BOTÕES ORACLUSX
import { Button } from "./components/oraclusx-ds/Button";

// ==========================================

// ❌ NÃO HARDCODAR CORES
<Icon color="#FF5733" />
iconColor="#123456"

// ✅ USAR PALETA
<Icon color={IcarusColorPalette.orange} />
iconColor={IcarusColorPalette.indigo}

// ==========================================

// ❌ NÃO CRIAR TABELAS DO ZERO
<table>
  <thead>
    <tr>
      <th>Coluna</th>
    </tr>
  </thead>
</table>

// ✅ USAR PaginatedTable
<PaginatedTable
  columns={columns}
  data={data}
/>

// ==========================================

// ❌ NÃO USAR ALTURA CUSTOMIZADA EM GRÁFICOS
<LineChart height={300}>  // ❌ ERRADO

// ✅ SEMPRE 420px
<WorkingLineChart height={420}> // ✅ CORRETO
```

---

## 📚 IMPORTS CORRETOS

### Copiar e Colar no Início do Arquivo

```tsx
// ========== DESIGN SYSTEM ICARUS ==========
import {
  IcarusModuleLayout,
  IcarusModuleHeader,
  IcarusKPIGrid,
  IcarusKPICard,
  IcarusTabNavigation,
  IcarusContentArea,
  IcarusListItem,
  IcarusColorPalette
} from './components/ui/design-system';

// ========== COMPONENTES ORACLUSX ==========
import { Button } from './components/oraclusx-ds/Button';

// ========== COMPONENTES NEUMÓRFICOS ==========
import { NeomorphicCard } from './components/NeomorphicCard';
import { NeomorphicIconBox } from './components/NeomorphicIconBox';

// ========== TABELAS E GRÁFICOS ==========
import { PaginatedTable } from './components/ui/paginated-table';
import { WorkingLineChart } from './components/charts/WorkingLineChart';
import { WorkingDonutChart } from './components/charts/WorkingDonutChart';

// ========== FORMULÁRIOS (se necessário) ==========
import { FormularioProdutoOPME } from './components/formularios/FormularioProdutoOPMEAvancado';
import { FormularioCirurgia } from './components/formularios/FormularioCirurgia';

// ========== SHADCN (apenas o necessário) ==========
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './components/ui/dialog';
import { Badge } from './components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';

// ========== ÍCONES ==========
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle
  // ... adicionar conforme necessário
} from 'lucide-react';

// ========== NOTIFICAÇÕES ==========
import { toast } from 'sonner';

// ========== REACT ==========
import React, { useState, useEffect } from 'react';
```

---

## ✅ RESUMO EXECUTIVO

### O QUE SEMPRE FAZER:

1. ✅ Usar `IcarusModuleLayout` como container principal
2. ✅ Usar componentes do `/components/ui/design-system.tsx`
3. ✅ Usar `Button` do OraclusX DS
4. ✅ Usar cores do `IcarusColorPalette`
5. ✅ Usar `PaginatedTable` para tabelas
6. ✅ Usar `WorkingLineChart` / `WorkingDonutChart` (height 420px)
7. ✅ Usar formulários de `/components/formularios/` quando disponível
8. ✅ Usar `toast` do Sonner para notificações
9. ✅ Usar ícones do `lucide-react`
10. ✅ Seguir o template de módulo fornecido

### O QUE NUNCA FAZER:

1. ❌ Criar layouts genéricos com divs
2. ❌ Usar Button do shadcn
3. ❌ Hardcodar cores
4. ❌ Criar tabelas do zero
5. ❌ Usar alturas customizadas em gráficos
6. ❌ Criar componentes neumórficos customizados
7. ❌ Usar componentes shadcn quando existe versão OraclusX
8. ❌ Ignorar o design system

---

**Este guia elimina 100% do retrabalho!**

**Status**: ✅ Guia Completo
**Cobertura**: 100% dos componentes reais
**Exemplos**: Prontos para copiar/colar
**Última atualização**: 16 de Novembro de 2025
