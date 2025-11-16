# 📚 ICARUS - EXEMPLOS PRÁTICOS

Casos de uso reais copiáveis para desenvolvimento rápido.

---

## 1. MÓDULO DE ESTOQUE (Exemplo Completo)

```tsx
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { FormularioProdutoOPME } from './components/formularios/FormularioProdutoOPMEAvancado';
import { Package, Plus, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export const ModuloEstoque: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // KPIs
  const kpis = [
    {
      title: "Total de Produtos",
      value: "3.847",
      change: "+142",
      changeType: "positive" as const,
      icon: Package,
      iconColor: IcarusColorPalette.teal
    },
    {
      title: "Valor Total",
      value: "R$ 12.847.500",
      change: "+12.5%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconColor: IcarusColorPalette.green
    },
    {
      title: "Produtos Críticos",
      value: "23",
      changeType: "negative" as const,
      icon: AlertTriangle,
      iconColor: IcarusColorPalette.amber,
      subtitle: "Abaixo do mínimo"
    },
    {
      title: "Giro Médio",
      value: "45 dias",
      change: "-5 dias",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: IcarusColorPalette.blue
    }
  ];

  // Tabs
  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Package },
    { id: 'produtos', label: 'Produtos', icon: Package },
    { id: 'movimentacoes', label: 'Movimentações', icon: TrendingUp }
  ];

  // Tabela de produtos
  const columns = [
    { key: 'codigo', label: 'Código', sortable: true },
    { key: 'nome', label: 'Produto', sortable: true },
    { key: 'estoque', label: 'Estoque', sortable: true, align: 'right' as const },
    {
      key: 'valor',
      label: 'Valor Unitário',
      sortable: true,
      align: 'right' as const,
      format: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    },
    {
      key: 'status',
      label: 'Status',
      format: (value: string) => {
        const colors = {
          normal: 'bg-green-100 text-green-800',
          baixo: 'bg-amber-100 text-amber-800',
          critico: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value as keyof typeof colors]}`}>
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Ações',
      format: (_: any, row: any) => (
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={() => handleEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="ghost" onClick={() => handleView(row)}>
            Ver
          </Button>
        </div>
      )
    }
  ];

  const produtos = [
    {
      id: '1',
      codigo: 'OPME-001',
      nome: 'Stent Coronário Farmacológico',
      estoque: 50,
      valor: 6500,
      status: 'normal'
    },
    {
      id: '2',
      codigo: 'OPME-002',
      nome: 'Prótese de Joelho',
      estoque: 5,
      valor: 12000,
      status: 'baixo'
    },
    {
      id: '3',
      codigo: 'OPME-003',
      nome: 'Parafusos Ortopédicos',
      estoque: 2,
      valor: 450,
      status: 'critico'
    }
  ];

  // Handlers
  const handleEdit = (produto: any) => {
    console.log('Editar:', produto);
    setModalOpen(true);
  };

  const handleView = (produto: any) => {
    console.log('Ver:', produto);
  };

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      // Chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Produto salvo com sucesso!');
      setModalOpen(false);
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IcarusModuleLayout>
      {/* Header */}
      <IcarusModuleHeader
        title="Estoque Inteligente"
        subtitle="Gestão completa com IA e predição de demanda"
        icon={Package}
        iconColor={IcarusColorPalette.teal}
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={handleCreate}
          >
            Novo Produto
          </Button>
        }
      />

      {/* KPIs */}
      <IcarusKPIGrid>
        {kpis.map((kpi, index) => (
          <IcarusKPICard key={index} {...kpi} />
        ))}
      </IcarusKPIGrid>

      {/* Tabs */}
      <IcarusTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content */}
      <IcarusContentArea>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Produtos Críticos</h3>
              {/* Lista de produtos críticos */}
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Movimentações Recentes</h3>
              {/* Lista de movimentações */}
            </div>
          </div>
        )}

        {activeTab === 'produtos' && (
          <PaginatedTable
            columns={columns}
            data={produtos}
            pageSize={20}
            searchable={true}
            searchPlaceholder="Buscar produtos..."
            onRowClick={(row) => handleView(row)}
            loading={isLoading}
            emptyMessage="Nenhum produto encontrado"
          />
        )}

        {activeTab === 'movimentacoes' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Movimentações de Estoque</h3>
            {/* Tabela de movimentações */}
          </div>
        )}
      </IcarusContentArea>

      {/* Modal de Produto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Novo Produto OPME</DialogTitle>
          </DialogHeader>
          <FormularioProdutoOPME
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
            mode="create"
          />
        </DialogContent>
      </Dialog>
    </IcarusModuleLayout>
  );
};

export default ModuloEstoque;
```

---

## 2. KPI COM GRÁFICO INTEGRADO

```tsx
import { IcarusKPICard } from './components/ui/design-system';
import { WorkingLineChart } from './components/charts/WorkingLineChart';
import { DollarSign } from 'lucide-react';

const miniData = [
  { mes: 'Jan', valor: 450000 },
  { mes: 'Fev', valor: 520000 },
  { mes: 'Mar', valor: 580000 }
];

<IcarusKPICard
  title="Faturamento"
  value="R$ 580.000"
  change="+11.5%"
  changeType="positive"
  icon={DollarSign}
  iconColor="#10B981"
>
  <div className="h-16 mt-2 -mx-2">
    <WorkingLineChart
      data={miniData}
      height={64}
      lines={[{ dataKey: "valor", stroke: "#10B981" }]}
      xAxisKey="mes"
      hideAxis={true}
    />
  </div>
</IcarusKPICard>
```

---

## 3. TABELA COM FORMATAÇÃO CUSTOMIZADA

```tsx
import { PaginatedTable } from './components/ui/paginated-table';
import { Badge } from './components/ui/badge';
import { Button } from './components/oraclusx-ds/Button';

const columns = [
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'nome', label: 'Nome', sortable: true },
  {
    key: 'valor',
    label: 'Valor',
    sortable: true,
    align: 'right' as const,
    format: (value: number) => (
      <span className="font-medium">
        R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </span>
    )
  },
  {
    key: 'status',
    label: 'Status',
    format: (value: string) => {
      const variants = {
        ativo: 'default',
        inativo: 'secondary',
        pendente: 'outline'
      };
      return (
        <Badge variant={variants[value as keyof typeof variants] as any}>
          {value.toUpperCase()}
        </Badge>
      );
    }
  },
  {
    key: 'actions',
    label: '',
    format: (_: any, row: any) => (
      <div className="flex gap-1 justify-end">
        <Button size="sm" variant="ghost">Editar</Button>
        <Button size="sm" variant="ghost">Ver</Button>
      </div>
    )
  }
];

<PaginatedTable
  columns={columns}
  data={data}
  pageSize={20}
  searchable
  searchPlaceholder="Buscar..."
/>
```

---

## 4. GRÁFICO DE LINHA COM MÚLTIPLAS SÉRIES

```tsx
import { WorkingLineChart } from './components/charts/WorkingLineChart';

const faturamentoData = [
  { mes: 'Jan', real: 450000, meta: 500000, previsao: 480000 },
  { mes: 'Fev', real: 520000, meta: 500000, previsao: 550000 },
  { mes: 'Mar', real: 580000, meta: 500000, previsao: 590000 },
  { mes: 'Abr', real: 620000, meta: 500000, previsao: 630000 },
  { mes: 'Mai', real: 680000, meta: 500000, previsao: 690000 },
  { mes: 'Jun', real: 720000, meta: 500000, previsao: 730000 }
];

<WorkingLineChart
  data={faturamentoData}
  height={420}
  lines={[
    { dataKey: "real", stroke: "#10B981", name: "Realizado" },
    { dataKey: "meta", stroke: "#6366F1", name: "Meta", strokeDasharray: "5 5" },
    { dataKey: "previsao", stroke: "#F59E0B", name: "Previsão IA", strokeDasharray: "3 3" }
  ]}
  xAxisKey="mes"
/>
```

---

## 5. GRÁFICO DONUT COM DRILL-DOWN

```tsx
import { WorkingDonutChart } from './components/charts/WorkingDonutChart';
import { IcarusColorPalette } from './components/ui/design-system';

const cirurgiasPorEspecialidade = [
  { name: 'Ortopedia', value: 35, color: IcarusColorPalette.green },
  { name: 'Cardiologia', value: 28, color: IcarusColorPalette.blue },
  { name: 'Neurologia', value: 18, color: IcarusColorPalette.purple },
  { name: 'Vascular', value: 12, color: IcarusColorPalette.amber },
  { name: 'Outros', value: 7, color: IcarusColorPalette.slate }
];

<WorkingDonutChart
  data={cirurgiasPorEspecialidade}
  height={420}
  centerText="142"
  centerSubtext="Cirurgias"
  onClick={(data) => {
    console.log('Clicou em:', data.name);
    // Navegar para detalhes
  }}
/>
```

---

## 6. FORMULÁRIO COM VALIDAÇÃO

```tsx
import { FormularioProdutoOPME } from './components/formularios/FormularioProdutoOPMEAvancado';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { toast } from 'sonner';

const [modalOpen, setModalOpen] = useState(false);
const [produtoEdit, setProdutoEdit] = useState<any>(null);

const handleSubmit = async (data: any) => {
  try {
    if (produtoEdit) {
      // Atualizar
      await updateProduto(produtoEdit.id, data);
      toast.success('Produto atualizado com sucesso!');
    } else {
      // Criar
      await createProduto(data);
      toast.success('Produto criado com sucesso!', {
        action: {
          label: 'Ver produto',
          onClick: () => navigate(`/produtos/${newId}`)
        }
      });
    }
    setModalOpen(false);
  } catch (error) {
    toast.error('Erro ao salvar produto');
  }
};

<Dialog open={modalOpen} onOpenChange={setModalOpen}>
  <DialogContent className="sm:max-w-[700px]">
    <DialogHeader>
      <DialogTitle>
        {produtoEdit ? 'Editar Produto' : 'Novo Produto'}
      </DialogTitle>
    </DialogHeader>
    <FormularioProdutoOPME
      initialData={produtoEdit}
      onSubmit={handleSubmit}
      onCancel={() => setModalOpen(false)}
      mode={produtoEdit ? 'edit' : 'create'}
    />
  </DialogContent>
</Dialog>
```

---

## 7. NOTIFICAÇÕES COM AÇÕES

```tsx
import { toast } from 'sonner';

// Sucesso simples
toast.success('Produto salvo com sucesso!');

// Erro simples
toast.error('Erro ao salvar produto');

// Com ação
toast.success('Cirurgia agendada!', {
  action: {
    label: 'Ver detalhes',
    onClick: () => navigate(`/cirurgias/${id}`)
  }
});

// Com duração customizada
toast.info('Sincronizando estoque...', {
  duration: 5000
});

// Warning
toast.warning('Estoque abaixo do mínimo', {
  description: 'Produto: Stent Coronário (OPME-001)',
  action: {
    label: 'Reordenar',
    onClick: () => handleReorder('OPME-001')
  }
});

// Loading (promise)
toast.promise(
  saveProduto(data),
  {
    loading: 'Salvando produto...',
    success: 'Produto salvo!',
    error: 'Erro ao salvar'
  }
);
```

---

## 8. BOTÕES COM LOADING E CONFIRMAÇÃO

```tsx
import { Button } from './components/oraclusx-ds/Button';
import { Plus, Trash2 } from 'lucide-react';

const [isDeleting, setIsDeleting] = useState(false);

const handleDelete = async () => {
  if (!confirm('Deseja realmente excluir este item?')) {
    return;
  }

  setIsDeleting(true);
  try {
    await deleteItem(id);
    toast.success('Item excluído');
  } catch (error) {
    toast.error('Erro ao excluir');
  } finally {
    setIsDeleting(false);
  }
};

// Botão primary com ícone
<Button
  variant="primary"
  icon={Plus}
  iconPosition="left"
  onClick={handleCreate}
>
  Novo Produto
</Button>

// Botão destrutivo com loading
<Button
  variant="outline"
  icon={Trash2}
  loading={isDeleting}
  disabled={isDeleting}
  onClick={handleDelete}
>
  {isDeleting ? 'Excluindo...' : 'Excluir'}
</Button>
```

---

**Ver mais exemplos**: [Guia Completo](./COMPONENT_GUIDE.md)

**Versão**: 1.0.0
**Data**: 16/11/2025
