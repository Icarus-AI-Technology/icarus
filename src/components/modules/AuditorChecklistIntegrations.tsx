/**
 * ICARUS v5.0 - Auditor Checklist Integrations
 * Complete audit checklist for external integrations
 */

import { useState, useEffect } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MinusCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  AlertOctagon,
  Target,
  Gauge,
  ListChecks,
} from 'lucide-react';
import { Card, Button, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useIntegrations } from '@/hooks/useIntegrations';
import { supabase } from '@/lib/supabase/client';
import type {
  AuditorChecklistResult,
  AuditorChecklistCategory,
  AuditorChecklistItem,
  AuditorAlert,
  IntegrationSeverity,
} from '@/lib/integrations/types';

// ============================================================================
// TYPES
// ============================================================================

interface AuditorChecklistIntegrationsProps {
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
          .single();

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

const getStatusIcon = (status: AuditorChecklistItem['status']) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
    case 'fail':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case 'pending':
      return <MinusCircle className="h-5 w-5 text-gray-400" />;
    case 'not_applicable':
      return <MinusCircle className="h-5 w-5 text-gray-300" />;
    default:
      return <MinusCircle className="h-5 w-5 text-gray-400" />;
  }
};

const getStatusBadge = (status: AuditorChecklistItem['status']) => {
  const styles: Record<AuditorChecklistItem['status'], string> = {
    pass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    fail: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    pending: 'bg-gray-100 text-gray-800 border-gray-200',
    not_applicable: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  const labels: Record<AuditorChecklistItem['status'], string> = {
    pass: 'OK',
    fail: 'FALHA',
    warning: 'ALERTA',
    pending: 'PENDENTE',
    not_applicable: 'N/A',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
};

const getSeverityBadge = (severity: IntegrationSeverity) => {
  const styles: Record<IntegrationSeverity, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-blue-100 text-blue-800',
  };

  const labels: Record<IntegrationSeverity, string> = {
    critical: 'CRITICAL',
    high: 'HIGH',
    medium: 'MEDIUM',
    low: 'LOW',
  };

  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${styles[severity]}`}
    >
      {labels[severity]}
    </span>
  );
};

const getScoreColor = (score: number) => {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-amber-600';
  return 'text-red-600';
};

const getScoreProgressColor = (score: number) => {
  if (score >= 85) return 'bg-emerald-500';
  if (score >= 70) return 'bg-amber-500';
  return 'bg-red-500';
};

const formatDate = (date: Date | undefined) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
}

function ScoreGauge({ score, label, size = 'md' }: ScoreGaugeProps) {
  const sizes = {
    sm: { width: 80, height: 80, fontSize: 'text-lg', labelSize: 'text-xs' },
    md: { width: 120, height: 120, fontSize: 'text-2xl', labelSize: 'text-sm' },
    lg: { width: 160, height: 160, fontSize: 'text-4xl', labelSize: 'text-base' },
  };

  const { width, height, fontSize, labelSize } = sizes[size];
  const radius = (width - 16) / 2;
  const circumference = radius * Math.PI;
  const progress = (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={width} height={height / 2 + 20} viewBox={`0 0 ${width} ${height / 2 + 20}`}>
        {/* Background arc */}
        <path
          d={`M 8 ${height / 2} A ${radius} ${radius} 0 0 1 ${width - 8} ${height / 2}`}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M 8 ${height / 2} A ${radius} ${radius} 0 0 1 ${width - 8} ${height / 2}`}
          fill="none"
          stroke={score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#ef4444'}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        {/* Score text */}
        <text
          x={width / 2}
          y={height / 2 - 5}
          textAnchor="middle"
          className={`${fontSize} font-bold fill-current ${getScoreColor(score)}`}
        >
          {Math.round(score)}
        </text>
      </svg>
      <span className={`${labelSize} text-gray-600 mt-1`}>{label}</span>
    </div>
  );
}

interface CategorySectionProps {
  category: AuditorChecklistCategory;
  expanded: boolean;
  onToggle: () => void;
}

function CategorySection({ category, expanded, onToggle }: CategorySectionProps) {
  const passCount = category.items.filter((i) => i.status === 'pass').length;
  const failCount = category.items.filter((i) => i.status === 'fail').length;
  const warningCount = category.items.filter((i) => i.status === 'warning').length;

  return (
    <Card className="neu-soft overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          {expanded ? (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-400" />
          )}
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{category.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">
                Peso: {(category.weight * 100).toFixed(0)}%
              </span>
              <span className="text-xs text-gray-300">|</span>
              <span className="text-xs text-emerald-600">{passCount} OK</span>
              {warningCount > 0 && (
                <>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-amber-600">{warningCount} Alertas</span>
                </>
              )}
              {failCount > 0 && (
                <>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-xs text-red-600">{failCount} Falhas</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-lg font-bold ${getScoreColor(category.score)}`}>
              {Math.round(category.score)}%
            </span>
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${getScoreProgressColor(
                category.score
              )}`}
              style={{ width: `${category.score}%` }}
            />
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-100">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Item
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Descrição
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Severidade
                </th>
                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {category.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {item.item}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">{item.description}</span>
                    {item.details && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.details}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getSeverityBadge(item.severity)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {getStatusBadge(item.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

interface AlertCardProps {
  alert: AuditorAlert;
}

function AlertCard({ alert }: AlertCardProps) {
  const styles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: <AlertOctagon className="h-5 w-5 text-red-500" />,
      text: 'text-red-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      text: 'text-amber-700',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: <AlertTriangle className="h-5 w-5 text-blue-500" />,
      text: 'text-blue-700',
    },
  };

  const style = styles[alert.type];

  return (
    <div className={`p-4 rounded-lg ${style.bg} border ${style.border}`}>
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className={`font-semibold ${style.text}`}>{alert.integration}</span>
            <span className="text-xs text-gray-500">{formatDate(alert.timestamp)}</span>
          </div>
          <p className={`text-sm ${style.text} mt-1`}>{alert.message}</p>
          <p className="text-sm text-gray-600 mt-2">
            <span className="font-medium">Ação:</span> {alert.action}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AuditorChecklistIntegrations({
  empresaId: propEmpresaId,
}: AuditorChecklistIntegrationsProps) {
  const hookEmpresaId = useEmpresaId();
  const empresaId = propEmpresaId ?? hookEmpresaId;

  const { runAudit, loading } = useIntegrations({ empresaId });
  const [auditResult, setAuditResult] = useState<AuditorChecklistResult | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('checklist');
  const [isRunning, setIsRunning] = useState(false);

  // Run audit on mount
  useEffect(() => {
    handleRunAudit();
  }, []);

  const handleRunAudit = async () => {
    setIsRunning(true);
    try {
      const result = await runAudit();
      setAuditResult(result);
      // Auto-expand categories with failures
      const failedCategories = result.categories
        .filter((c) => c.items.some((i) => i.status === 'fail'))
        .map((c) => c.name);
      setExpandedCategories(new Set(failedCategories));
    } finally {
      setIsRunning(false);
    }
  };

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const expandAll = () => {
    if (auditResult) {
      setExpandedCategories(new Set(auditResult.categories.map((c) => c.name)));
    }
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const exportReport = () => {
    if (!auditResult) return;

    const report = {
      timestamp: auditResult.timestamp.toISOString(),
      totalScore: auditResult.totalScore,
      categories: auditResult.categories.map((c) => ({
        name: c.name,
        score: c.score,
        weight: c.weight,
        items: c.items.map((i) => ({
          item: i.item,
          description: i.description,
          severity: i.severity,
          status: i.status,
          details: i.details,
        })),
      })),
      alerts: auditResult.alerts,
      recommendations: auditResult.recommendations,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-integrations-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !auditResult) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="ml-3 text-gray-600">Executando auditoria...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Auditoria de Integrações
          </h2>
          <p className="text-gray-500">
            Checklist completo de verificação das integrações externas
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={exportReport} disabled={!auditResult}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleRunAudit} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Executar Auditoria
          </Button>
        </div>
      </div>

      {auditResult && (
        <>
          {/* Score Overview */}
          <Card className="neu-soft p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <ScoreGauge
                  score={auditResult.totalScore}
                  label="Score Total"
                  size="lg"
                />
                <div className="grid grid-cols-2 gap-4">
                  {auditResult.categories.slice(0, 4).map((cat) => (
                    <ScoreGauge
                      key={cat.name}
                      score={cat.score}
                      label={cat.name.split(' ')[0]}
                      size="sm"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center md:text-right">
                <div className="text-sm text-gray-500 mb-1">Última execução</div>
                <div className="font-medium text-gray-900">
                  {formatDate(auditResult.timestamp)}
                </div>
                <div className="mt-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      auditResult.totalScore >= 85
                        ? 'bg-emerald-100 text-emerald-800'
                        : auditResult.totalScore >= 70
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {auditResult.totalScore >= 85
                      ? 'Aprovado'
                      : auditResult.totalScore >= 70
                      ? 'Atenção Necessária'
                      : 'Reprovado'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Meta mínima: 85 pontos
                </p>
              </div>
            </div>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="checklist">
                <ListChecks className="h-4 w-4 mr-2" />
                Checklist
              </TabsTrigger>
              <TabsTrigger value="alerts">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alertas ({auditResult.alerts.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations">
                <Target className="h-4 w-4 mr-2" />
                Recomendações ({auditResult.recommendations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="checklist" className="mt-4">
              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={expandAll}>
                  Expandir Tudo
                </Button>
                <Button variant="ghost" size="sm" onClick={collapseAll}>
                  Recolher Tudo
                </Button>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {auditResult.categories.map((category) => (
                  <CategorySection
                    key={category.name}
                    category={category}
                    expanded={expandedCategories.has(category.name)}
                    onToggle={() => toggleCategory(category.name)}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-4">
              {auditResult.alerts.length === 0 ? (
                <Card className="neu-soft p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nenhum alerta ativo
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Todas as integrações estão funcionando corretamente.
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {auditResult.alerts.map((alert, index) => (
                    <AlertCard key={index} alert={alert} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              {auditResult.recommendations.length === 0 ? (
                <Card className="neu-soft p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nenhuma recomendação
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Todas as verificações passaram com sucesso.
                  </p>
                </Card>
              ) : (
                <Card className="neu-soft overflow-hidden">
                  <div className="p-4 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-semibold text-blue-800">
                      Recomendações de Melhoria
                    </h3>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {auditResult.recommendations.map((rec, index) => (
                      <li key={index} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{rec}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Score Formula */}
          <Card className="neu-inset p-4 bg-gray-50">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Fórmula de Score
            </h4>
            <code className="text-xs text-gray-600">
              Score = (Microsoft365 × 0.30) + (Pluggy × 0.25) + (SEFAZ × 0.20) + (ANVISA ×
              0.15) + (Outras × 0.10) × 100
            </code>
          </Card>
        </>
      )}
    </div>
  );
}

export default AuditorChecklistIntegrations;
