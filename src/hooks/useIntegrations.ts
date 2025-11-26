/**
 * ICARUS v5.0 - useIntegrations Hook
 * Unified hook for managing all external integrations
 */

import { useState, useCallback, useEffect } from 'react';
import {
  microsoft365,
  pluggy,
  createSefazClient,
  anvisa,
  viaCep,
  brasilApi,
  cfm,
} from '@/lib/integrations';
import {
  runFullAudit,
} from '@/lib/integrations/validators';
import type {
  IntegrationHealth,
  AuditorChecklistResult,
  AuditorChecklistCategory,
  AuditorAlert,
} from '@/lib/integrations/types';

// ============================================================================
// TYPES
// ============================================================================

interface UseIntegrationsOptions {
  empresaId: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

interface IntegrationsState {
  health: IntegrationHealth[];
  loading: boolean;
  error: string | null;
  lastCheck: Date | null;
}

interface UseIntegrationsReturn {
  // State
  health: IntegrationHealth[];
  loading: boolean;
  error: string | null;
  lastCheck: Date | null;

  // Actions
  checkAllHealth: () => Promise<void>;
  getIntegrationHealth: (name: string) => IntegrationHealth | undefined;

  // Audit
  runAudit: () => Promise<AuditorChecklistResult>;

  // Individual integrations
  microsoft365: typeof microsoft365;
  pluggy: typeof pluggy;
  sefaz: ReturnType<typeof createSefazClient>;
  anvisa: typeof anvisa;
  viaCep: typeof viaCep;
  brasilApi: typeof brasilApi;
  cfm: typeof cfm;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useIntegrations(options: UseIntegrationsOptions): UseIntegrationsReturn {
  const { empresaId, autoRefresh = false, refreshInterval = 5 * 60 * 1000 } = options;

  const [state, setState] = useState<IntegrationsState>({
    health: [],
    loading: false,
    error: null,
    lastCheck: null,
  });

  // Create SEFAZ client for this empresa
  const sefaz = createSefazClient(empresaId);

  // Check all integrations health
  const checkAllHealth = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const healthPromises = [
        microsoft365.checkHealth(),
        pluggy.checkHealth(empresaId),
        sefaz.checkHealth(),
        anvisa.checkHealth(),
        viaCep.checkHealth(),
        brasilApi.checkHealth(),
        cfm.checkHealth(),
      ];

      const results = await Promise.allSettled(healthPromises);

      const health: IntegrationHealth[] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        }

        const names = [
          'Microsoft 365',
          'Pluggy (Open Banking)',
          'SEFAZ (NF-e)',
          'ANVISA API',
          'ViaCEP',
          'BrasilAPI',
          'CFM API',
        ];

        return {
          name: names[index],
          status: 'error' as const,
          errorMessage: result.reason?.message ?? 'Check failed',
        };
      });

      setState({
        health,
        loading: false,
        error: null,
        lastCheck: new Date(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Health check failed',
      }));
    }
  }, [empresaId, sefaz]);

  // Get specific integration health
  const getIntegrationHealth = useCallback(
    (name: string): IntegrationHealth | undefined => {
      return state.health.find((h) => h.name === name);
    },
    [state.health]
  );

  // Run full audit using comprehensive validators
  const runAudit = useCallback(async (): Promise<AuditorChecklistResult> => {
    const now = new Date();
    const alerts: AuditorAlert[] = [];
    const recommendations: string[] = [];

    // Run full audit using validators
    const auditResult = await runFullAudit(empresaId);

    // Build categories from audit result
    const categories: AuditorChecklistCategory[] = [
      {
        name: 'Microsoft 365',
        weight: 0.30,
        criticality: 'high',
        items: auditResult.microsoft365.items,
        score: auditResult.microsoft365.score,
      },
      {
        name: 'Pluggy (Open Banking)',
        weight: 0.25,
        criticality: 'high',
        items: auditResult.pluggy.items,
        score: auditResult.pluggy.score,
      },
      {
        name: 'SEFAZ (NF-e)',
        weight: 0.20,
        criticality: 'critical',
        items: auditResult.sefaz.items,
        score: auditResult.sefaz.score,
      },
      {
        name: 'ANVISA API',
        weight: 0.15,
        criticality: 'high',
        items: auditResult.anvisa.items,
        score: auditResult.anvisa.score,
      },
      {
        name: 'Outras APIs',
        weight: 0.10,
        criticality: 'medium',
        items: auditResult.otherApis.items,
        score: auditResult.otherApis.score,
      },
    ];

    // Generate alerts from failed items
    categories.forEach((cat) => {
      cat.items.forEach((item) => {
        // Critical failures generate alerts
        if (item.status === 'fail' && item.severity === 'critical') {
          alerts.push({
            type: 'critical',
            integration: cat.name,
            message: `${item.item}: ${item.details ?? item.description}`,
            action: `Corrigir: ${item.verification}`,
            timestamp: now,
          });
        }
        // Warnings on high severity items
        if (item.status === 'warning' && (item.severity === 'critical' || item.severity === 'high')) {
          alerts.push({
            type: 'warning',
            integration: cat.name,
            message: `${item.item}: ${item.details ?? item.description}`,
            action: `Verificar: ${item.verification}`,
            timestamp: now,
          });
        }
      });
    });

    // Generate recommendations for categories below 100
    categories.forEach((cat) => {
      if (cat.score < 100) {
        const failedItems = cat.items.filter((i) => i.status === 'fail');
        const warningItems = cat.items.filter((i) => i.status === 'warning');

        failedItems.forEach((item) => {
          recommendations.push(
            `[${cat.name}] CORRIGIR: ${item.item} - ${item.details ?? item.description}`
          );
        });

        warningItems.forEach((item) => {
          recommendations.push(
            `[${cat.name}] ATENÇÃO: ${item.item} - ${item.details ?? item.description}`
          );
        });
      }
    });

    // Add overall recommendation if not at 100
    if (auditResult.totalScore < 100) {
      if (auditResult.totalScore >= 85) {
        recommendations.push(
          `Score atual: ${auditResult.totalScore}%. Para atingir 100%, revise os itens com alertas acima.`
        );
      } else {
        recommendations.push(
          `Score atual: ${auditResult.totalScore}% - ABAIXO DO MÍNIMO (85%). Priorize os itens críticos.`
        );
      }
    }

    return {
      categories,
      totalScore: auditResult.totalScore,
      timestamp: now,
      recommendations,
      alerts,
    };
  }, [empresaId]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(checkAllHealth, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, checkAllHealth]);

  // Initial check
  useEffect(() => {
    checkAllHealth();
  }, [checkAllHealth]);

  return {
    health: state.health,
    loading: state.loading,
    error: state.error,
    lastCheck: state.lastCheck,
    checkAllHealth,
    getIntegrationHealth,
    runAudit,
    microsoft365,
    pluggy,
    sefaz,
    anvisa,
    viaCep,
    brasilApi,
    cfm,
  };
}
