import React, { useState } from 'react';
import {
  IcarusModuleLayout,
  IcarusModuleHeader,
  IcarusKPIGrid,
  IcarusKPICard,
  IcarusTabNavigation,
  IcarusContentArea,
  IcarusColorPalette
} from '@/components/ui/design-system';
import { PaginatedTable } from '@/components/ui/paginated-table';
import { Button } from '@/components/oraclusx-ds/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  Filter,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

/**
 * 🎨 Component Showcase
 *
 * Demonstração completa de todos os componentes ICARUS OraclusX Design System.
 * Use esta página como referência visual e para copiar exemplos de código.
 *
 * Componentes demonstrados:
 * - IcarusModuleLayout, IcarusModuleHeader
 * - IcarusKPIGrid, IcarusKPICard (9 variações)
 * - IcarusTabNavigation, IcarusContentArea
 * - Button (5 variants)
 * - PaginatedTable
 * - Dialog (modals)
 * - Form patterns
 * - Toast notifications
 */
export function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState('kpis');
  const [modalOpen, setModalOpen] = useState(false);

  // KPIs Examples - 9 variações com diferentes cores e estilos
  const kpisExamples = [
    {
      title: "Total de Vendas",
      value: "R$ 1.847.500",
      change: "+18.2%",
      changeType: "positive" as const,
      icon: DollarSign,
      iconColor: IcarusColorPalette.green,
      subtitle: "Mês atual"
    },
    {
      title: "Novos Clientes",
      value: "342",
      change: "+24",
      changeType: "positive" as const,
      icon: Users,
      iconColor: IcarusColorPalette.blue,
    },
    {
      title: "Pedidos Pendentes",
      value: "23",
      changeType: "negative" as const,
      icon: AlertTriangle,
      iconColor: IcarusColorPalette.amber,
      subtitle: "Requer atenção"
    },
    {
      title: "Taxa de Conversão",
      value: "68.5%",
      change: "+5.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconColor: IcarusColorPalette.indigo,
    },
    {
      title: "Produtos Ativos",
      value: "3.847",
      change: "+142",
      changeType: "positive" as const,
      icon: Package,
      iconColor: IcarusColorPalette.teal,
    }
  ];

  // Tabs configuration
  const tabs = [
    { id: 'kpis', label: 'KPI Cards', icon: Activity },
    { id: 'buttons', label: 'Botões', icon: CheckCircle },
    { id: 'tables', label: 'Tabelas', icon: Package },
    { id: 'forms', label: 'Formulários', icon: Edit },
    { id: 'modals', label: 'Modals', icon: Eye },
  ];

  // Table example data
  const tableColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'produto', label: 'Produto', sortable: true },
    {
      key: 'valor',
      label: 'Valor',
      sortable: true,
      align: 'right' as const,
      format: (value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
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
      label: 'Ações',
      format: (_: any, row: any) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.success(`Visualizando: ${row.produto}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.info(`Editando: ${row.produto}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => toast.error(`Deletando: ${row.produto}`)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  const tableData = [
    { id: 'PRO-001', produto: 'Stent Coronário', valor: 6500, status: 'ativo' },
    { id: 'PRO-002', produto: 'Prótese de Joelho', valor: 12000, status: 'ativo' },
    { id: 'PRO-003', produto: 'Parafusos Ortopédicos', valor: 450, status: 'pendente' },
    { id: 'PRO-004', produto: 'Placa de Fixação', valor: 2800, status: 'ativo' },
    { id: 'PRO-005', produto: 'Haste Intramedular', valor: 5200, status: 'inativo' },
  ];

  // Handlers
  const handleToastDemo = (type: string) => {
    switch(type) {
      case 'success':
        toast.success('Operação realizada com sucesso!');
        break;
      case 'error':
        toast.error('Erro ao processar operação');
        break;
      case 'info':
        toast.info('Informação importante');
        break;
      case 'warning':
        toast.warning('Atenção necessária');
        break;
      case 'promise':
        toast.promise(
          new Promise(resolve => setTimeout(resolve, 2000)),
          {
            loading: 'Processando...',
            success: 'Concluído!',
            error: 'Erro!'
          }
        );
        break;
      case 'action':
        toast.success('Item salvo!', {
          action: {
            label: 'Desfazer',
            onClick: () => toast.info('Ação desfeita')
          }
        });
        break;
    }
  };

  return (
    <IcarusModuleLayout>
      {/* Header */}
      <IcarusModuleHeader
        title="Component Showcase"
        subtitle="Demonstração completa do OraclusX Design System"
        icon={Package}
        iconColor={IcarusColorPalette.indigo}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              icon={Download}
              onClick={() => toast.info('Download iniciado')}
            >
              Exportar
            </Button>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setModalOpen(true)}
            >
              Novo Item
            </Button>
          </div>
        }
      />

      {/* KPIs - Sempre visível no topo */}
      <IcarusKPIGrid>
        {kpisExamples.map((kpi, index) => (
          <IcarusKPICard key={index} {...kpi} />
        ))}
      </IcarusKPIGrid>

      {/* Tabs Navigation */}
      <IcarusTabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Content Area */}
      <IcarusContentArea>
        {/* Tab: KPI Cards */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">IcarusKPICard - Variações</h3>
              <p className="text-sm text-gray-600 mb-4">
                KPI Cards são sempre exibidos em um IcarusKPIGrid (máx 5 cards).
                Veja os exemplos acima com diferentes cores, ícones e variações.
              </p>
            </div>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Exemplo de Código</CardTitle>
                <CardDescription>Copy-paste ready</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`<IcarusKPIGrid>
  <IcarusKPICard
    title="Total de Vendas"
    value="R$ 1.847.500"
    change="+18.2%"
    changeType="positive"
    icon={DollarSign}
    iconColor={IcarusColorPalette.green}
    subtitle="Mês atual"
  />
  {/* Mais cards... (máx 5) */}
</IcarusKPIGrid>`}
                </pre>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="neu-soft">
                <CardHeader>
                  <CardTitle className="text-sm">✅ Fazer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>✅ Usar IcarusKPIGrid como wrapper</div>
                  <div>✅ Máximo 5 KPI cards por grid</div>
                  <div>✅ Usar IcarusColorPalette para cores</div>
                  <div>✅ Ícones do lucide-react</div>
                  <div>✅ changeType: "positive" | "negative" | "neutral"</div>
                </CardContent>
              </Card>

              <Card className="neu-soft">
                <CardHeader>
                  <CardTitle className="text-sm">❌ Não Fazer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>❌ Usar div ao invés de IcarusKPIGrid</div>
                  <div>❌ Mais de 5 cards (quebra layout)</div>
                  <div>❌ Cores hardcoded (#FF5733)</div>
                  <div>❌ Ícones de outras bibliotecas</div>
                  <div>❌ Esquecer subtitle quando relevante</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab: Buttons */}
        {activeTab === 'buttons' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Button - Todas as Variantes</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use sempre Button do OraclusX DS (não shadcn/ui).
                Importação: <code className="bg-gray-100 px-2 py-1 rounded">import &#123; Button &#125; from '@/components/oraclusx-ds/Button'</code>
              </p>
            </div>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Variants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium (default)</Button>
                  <Button size="lg">Large</Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button icon={Plus} iconPosition="left">Com Ícone Left</Button>
                  <Button icon={Upload} iconPosition="right">Com Ícone Right</Button>
                  <Button loading disabled>Loading...</Button>
                  <Button disabled>Disabled</Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => handleToastDemo('success')}>
                    Toast Success
                  </Button>
                  <Button variant="destructive" onClick={() => handleToastDemo('error')}>
                    Toast Error
                  </Button>
                  <Button variant="outline" onClick={() => handleToastDemo('promise')}>
                    Toast Promise
                  </Button>
                  <Button variant="outline" onClick={() => handleToastDemo('action')}>
                    Toast com Ação
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Código de Exemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`// Botão básico
<Button variant="primary" onClick={handleClick}>
  Salvar
</Button>

// Com ícone e loading
<Button
  variant="primary"
  icon={Save}
  iconPosition="left"
  loading={isSaving}
  disabled={isSaving}
  onClick={handleSave}
>
  {isSaving ? 'Salvando...' : 'Salvar'}
</Button>

// Botão destrutivo
<Button
  variant="destructive"
  icon={Trash2}
  onClick={handleDelete}
>
  Deletar
</Button>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Tables */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">PaginatedTable - Tabela Completa</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use sempre PaginatedTable para tabelas de dados (nunca &lt;table&gt; HTML ou shadcn Table).
              </p>
            </div>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Exemplo Interativo</CardTitle>
                <CardDescription>Tabela com busca, ordenação e ações</CardDescription>
              </CardHeader>
              <CardContent>
                <PaginatedTable
                  columns={tableColumns}
                  data={tableData}
                  pageSize={10}
                  searchable={true}
                  searchPlaceholder="Buscar produtos..."
                  emptyMessage="Nenhum produto encontrado"
                />
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Código de Exemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`const columns = [
  { key: 'codigo', label: 'Código', sortable: true },
  { key: 'nome', label: 'Produto', sortable: true },
  {
    key: 'valor',
    label: 'Valor',
    align: 'right',
    format: (value: number) =>
      \`R$ \${value.toLocaleString('pt-BR')}\`
  },
  {
    key: 'status',
    label: 'Status',
    format: (value: string) => (
      <Badge variant="default">{value}</Badge>
    )
  },
  {
    key: 'actions',
    label: 'Ações',
    format: (_, row) => (
      <div className="flex gap-2">
        <Button size="sm" variant="ghost">Ver</Button>
        <Button size="sm" variant="ghost">Editar</Button>
      </div>
    )
  }
];

<PaginatedTable
  columns={columns}
  data={produtos}
  pageSize={20}
  searchable
  searchPlaceholder="Buscar..."
/>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Forms */}
        {activeTab === 'forms' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Formulários - Padrões ICARUS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Sempre use labels, validação e feedback de erro apropriado.
              </p>
            </div>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Exemplo de Formulário</CardTitle>
                <CardDescription>Com validação e feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  toast.success('Formulário enviado com sucesso!');
                }}>
                  <div className="form-row">
                    <Label htmlFor="nome">Nome do Produto *</Label>
                    <Input
                      id="nome"
                      placeholder="Ex: Stent Coronário"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-row">
                      <Label htmlFor="codigo">Código *</Label>
                      <Input
                        id="codigo"
                        placeholder="PRO-001"
                        required
                      />
                    </div>

                    <div className="form-row">
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Input
                      id="descricao"
                      placeholder="Descrição detalhada do produto"
                    />
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                    <Button variant="primary" type="submit" icon={CheckCircle}>
                      Salvar Produto
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Padrões de Formulário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>✅ Sempre use <code className="bg-gray-100 px-1 rounded">form-row</code> para envolver label + input</div>
                <div>✅ Labels obrigatórios devem ter * no final</div>
                <div>✅ Use grid responsivo (cols-1 md:cols-2) para múltiplos campos</div>
                <div>✅ Botões de ação sempre à direita (justify-end)</div>
                <div>✅ Botão cancelar com variant="outline"</div>
                <div>✅ Botão salvar com variant="primary" e ícone</div>
                <div>✅ Use toast para feedback de sucesso/erro</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab: Modals */}
        {activeTab === 'modals' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dialog - Modais ICARUS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Use sempre Dialog do shadcn/ui (NUNCA alert/confirm nativo).
              </p>
            </div>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Exemplos de Modais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="primary">Abrir Modal Simples</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Modal de Exemplo</DialogTitle>
                      <DialogDescription>
                        Este é um modal simples com título e descrição.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm">Conteúdo do modal aqui.</p>
                    </div>
                    <div className="flex justify-end gap-3">
                      <Button variant="outline">Cancelar</Button>
                      <Button variant="primary">Confirmar</Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Modal com Formulário</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Item</DialogTitle>
                      <DialogDescription>
                        Preencha as informações abaixo
                      </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4 py-4">
                      <div className="form-row">
                        <Label htmlFor="modal-nome">Nome *</Label>
                        <Input id="modal-nome" required />
                      </div>
                      <div className="form-row">
                        <Label htmlFor="modal-valor">Valor *</Label>
                        <Input id="modal-valor" type="number" required />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" type="button">Cancelar</Button>
                        <Button variant="primary" type="submit">Salvar</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card className="neu-card">
              <CardHeader>
                <CardTitle>Código de Exemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm">
{`<Dialog>
  <DialogTrigger asChild>
    <Button>Abrir Modal</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[600px]">
    <DialogHeader>
      <DialogTitle>Título do Modal</DialogTitle>
      <DialogDescription>
        Descrição opcional
      </DialogDescription>
    </DialogHeader>

    {/* Conteúdo aqui */}
    <div className="py-4">
      {/* Form, texto, etc */}
    </div>

    <div className="flex justify-end gap-3">
      <Button variant="outline">Cancelar</Button>
      <Button variant="primary">Confirmar</Button>
    </div>
  </DialogContent>
</Dialog>`}
                </pre>
              </CardContent>
            </Card>
          </div>
        )}
      </IcarusContentArea>

      {/* Example Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Item</DialogTitle>
            <DialogDescription>
              Exemplo de modal acionado pelo header
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm">
              Este modal foi aberto pelo botão "Novo Item" no header do módulo.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Fechar
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                toast.success('Item criado com sucesso!');
                setModalOpen(false);
              }}
            >
              Criar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </IcarusModuleLayout>
  );
}

export default ComponentShowcase;
