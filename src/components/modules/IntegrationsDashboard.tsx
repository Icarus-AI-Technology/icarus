/**
 * ICARUS v5.0 - Integrations Dashboard
 * Visual dashboard for monitoring all external integrations
 */

import { useState, useMemo, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Plug,
  Cloud,
  Building2,
  Landmark,
  FileText,
  Pill,
  MapPin,
  Activity,
  Stethoscope,
} from 'lucide-react';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useIntegrations } from '@/hooks/useIntegrations';
import { supabase } from '@/lib/supabase/client';
import { useIntegracoesConfig, useWebhooks, useApiKeys, useAdminStats } from '@/hooks/queries/useAdmin';
import type { IntegrationHealth, IntegrationStatus } from '@/lib/integrations/types';

// ============================================================================
// TYPES
// ============================================================================

interface IntegrationsDashboardProps {
  empresaId?: string;
}

// Hook to get current user's empresa_id
function useEmpresaId(): string {
  const [empresaId, setEmpresaId] = useState<string>('demo');

  useEffect(() => {
    async function fetchEmpresaId() {
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Try to get from user metadata
        const metaEmpresaId = userData.user.user_metadata?.empresa_id;
        if (metaEmpresaId) {
          setEmpresaId(metaEmpresaId);
          return;
        }

        // Try to get from perfis table
        const { data: perfil } = await supabase
          .from('perfis')
          .select('empresa_id')
          .eq('usuario_id', userData.user.id)
          .single() as { data: { empresa_id?: string } | null };

        if (perfil?.empresa_id) {
          setEmpresaId(perfil.empresa_id);
        }
      }
    }

    fetchEmpresaId();
  }, []);

  return empresaId;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getStatusIcon = (status: IntegrationStatus) => {
  switch (status) {
    case 'connected':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'disconnected':
      return <Plug className="h-5 w-5 text-gray-400" />;
    case 'error':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'expiring':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'connecting':
      return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
    case 'outdated':
      return <Clock className="h-5 w-5 text-orange-500" />;
    default:
      return <Plug className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusColor = (status: IntegrationStatus) => {
  switch (status) {
    case 'connected':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'disconnected':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'error':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'expiring':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'connecting':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'outdated':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusLabel = (status: IntegrationStatus) => {
  switch (status) {
    case 'connected':
      return 'Conectado';
    case 'disconnected':
      return 'Desconectado';
    case 'error':
      return 'Erro';
    case 'expiring':
      return 'Expirando';
    case 'connecting':
      return 'Conectando';
    case 'outdated':
      return 'Desatualizado';
    default:
      return 'Desconhecido';
  }
};

const getIntegrationIcon = (name: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'Microsoft 365': <Cloud className="h-6 w-6" />,
    'Pluggy (Open Banking)': <Landmark className="h-6 w-6" />,
    'SEFAZ (NF-e)': <FileText className="h-6 w-6" />,
    'ANVISA API': <Pill className="h-6 w-6" />,
    'ViaCEP': <MapPin className="h-6 w-6" />,
    'BrasilAPI': <Building2 className="h-6 w-6" />,
    'CFM API': <Stethoscope className="h-6 w-6" />,
  };
  return iconMap[name] ?? <Activity className="h-6 w-6" />;
};

const formatDate = (date: Date | undefined) => {
  if (!date) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface IntegrationCardProps {
  health: IntegrationHealth;
  onConfigure?: () => void;
}

function IntegrationCard({ health, onConfigure }: IntegrationCardProps) {
  return (
    <Card className="neu-soft p-4 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-100 text-gray-600">
            {getIntegrationIcon(health.name)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{health.name}</h3>
            <p className="text-sm text-gray-500">
              Última verificação: {formatDate(health.lastSync)}
            </p>
          </div>
        </div>
        {getStatusIcon(health.status)}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
            health.status
          )}`}
        >
          {getStatusLabel(health.status)}
        </span>

        {health.status === 'disconnected' && onConfigure && (
          <Button
            variant="outline"
            size="sm"
            onClick={onConfigure}
          >
            Configurar
          </Button>
        )}
      </div>

      {health.errorMessage && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          {health.errorMessage}
        </p>
      )}

      {health.daysUntilExpiry !== undefined && health.daysUntilExpiry <= 30 && (
        <p className="mt-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          Expira em {health.daysUntilExpiry} dia{health.daysUntilExpiry !== 1 ? 's' : ''}
        </p>
      )}
    </Card>
  );
}

interface SummaryCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card className="neu-soft p-4">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function IntegrationsDashboard({ empresaId: propEmpresaId }: IntegrationsDashboardProps) {
  const hookEmpresaId = useEmpresaId();
  const empresaId = propEmpresaId ?? hookEmpresaId;

  const {
    health,
    loading,
    error,
    lastCheck,
    checkAllHealth,
  } = useIntegrations({ empresaId, autoRefresh: true, refreshInterval: 5 * 60 * 1000 });

  // React Query hooks for admin data
  const { data: _integracoesConfig } = useIntegracoesConfig();
  const { data: _webhooks } = useWebhooks();
  const { data: _apiKeys } = useApiKeys();
  const { data: _adminStats } = useAdminStats();

  const [activeTab, setActiveTab] = useState('all');

  // Calculate summary statistics
  const stats = useMemo(() => {
    const connected = health.filter((h) => h.status === 'connected').length;
    const errors = health.filter((h) => h.status === 'error').length;
    const warnings = health.filter(
      (h) => h.status === 'expiring' || h.status === 'outdated'
    ).length;
    const disconnected = health.filter((h) => h.status === 'disconnected').length;

    return { connected, errors, warnings, disconnected, total: health.length };
  }, [health]);

  // Filter integrations by category
  const filteredHealth = useMemo(() => {
    if (activeTab === 'all') return health;

    const categoryMap: Record<string, string[]> = {
      business: ['Microsoft 365', 'Pluggy (Open Banking)', 'SEFAZ (NF-e)'],
      regulatory: ['ANVISA API', 'CFM API'],
      utilities: ['ViaCEP', 'BrasilAPI'],
    };

    return health.filter((h) => categoryMap[activeTab]?.includes(h.name));
  }, [health, activeTab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard de Integrações
          </h2>
          <p className="text-gray-500">
            Monitore o status de todas as integrações externas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            Última atualização: {formatDate(lastCheck ?? undefined)}
          </span>
          <Button
            variant="outline"
            onClick={checkAllHealth}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Conectadas"
          value={stats.connected}
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-100"
        />
        <SummaryCard
          title="Com Erros"
          value={stats.errors}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          color="bg-red-100"
        />
        <SummaryCard
          title="Avisos"
          value={stats.warnings}
          icon={<AlertTriangle className="h-5 w-5 text-amber-600" />}
          color="bg-amber-100"
        />
        <SummaryCard
          title="Desconectadas"
          value={stats.disconnected}
          icon={<Plug className="h-5 w-5 text-gray-600" />}
          color="bg-gray-100"
        />
      </div>

      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">
            Todas ({stats.total})
          </TabsTrigger>
          <TabsTrigger value="business">
            Negócios (3)
          </TabsTrigger>
          <TabsTrigger value="regulatory">
            Regulatórias (2)
          </TabsTrigger>
          <TabsTrigger value="utilities">
            Utilitárias (2)
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {loading && filteredHealth.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHealth.map((h) => (
                <IntegrationCard key={h.name} health={h} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Health Score */}
      <Card className="neu-soft p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Score de Saúde das Integrações
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 w-(--progress) ${
                  stats.total > 0 && stats.connected / stats.total >= 0.8
                    ? 'bg-emerald-500'
                    : stats.total > 0 && stats.connected / stats.total >= 0.5
                    ? 'bg-amber-500'
                    : 'bg-red-500'
                }`}
                style={{
                  '--progress': `${stats.total > 0 ? (stats.connected / stats.total) * 100 : 0}%`,
                } as React.CSSProperties}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats.total > 0
              ? Math.round((stats.connected / stats.total) * 100)
              : 0}
            %
          </span>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          {stats.connected} de {stats.total} integrações funcionando corretamente
        </p>
      </Card>

      {/* Alerts Section */}
      {stats.errors > 0 || stats.warnings > 0 ? (
        <Card className="neu-soft p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Alertas Ativos
          </h3>
          <div className="space-y-3">
            {health
              .filter(
                (h) =>
                  h.status === 'error' ||
                  h.status === 'expiring' ||
                  h.status === 'outdated'
              )
              .map((h) => (
                <div
                  key={h.name}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    h.status === 'error'
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-amber-50 border border-amber-200'
                  }`}
                >
                  {h.status === 'error' ? (
                    <XCircle className="h-5 w-5 text-red-500 shrink-0" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                  <div className="flex-1">
                    <p
                      className={`font-medium ${
                        h.status === 'error' ? 'text-red-700' : 'text-amber-700'
                      }`}
                    >
                      {h.name}
                    </p>
                    <p
                      className={`text-sm ${
                        h.status === 'error' ? 'text-red-600' : 'text-amber-600'
                      }`}
                    >
                      {h.errorMessage ??
                        (h.status === 'expiring'
                          ? `Expira em ${h.daysUntilExpiry} dias`
                          : 'Dados desatualizados')}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className={
                      h.status === 'error'
                        ? 'border-red-300 text-red-700 hover:bg-red-100'
                        : 'border-amber-300 text-amber-700 hover:bg-amber-100'
                    }
                  >
                    Resolver
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}

export default IntegrationsDashboard;
