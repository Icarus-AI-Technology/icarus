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
  isMicrosoftConfigured,
  isPluggyConfigured,
} from '@/lib/integrations';
import type {
  IntegrationHealth,
  AuditorChecklistResult,
  AuditorChecklistCategory,
  AuditorChecklistItem,
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
// CHECKLIST DEFINITIONS
// ============================================================================

const MICROSOFT_CHECKLIST: Omit<AuditorChecklistItem, 'status' | 'details' | 'lastChecked'>[] = [
  { id: 'm365-1.1', category: 'Microsoft 365', item: 'Client ID configurado', description: 'VITE_MICROSOFT_CLIENT_ID', verification: 'Verificar variável de ambiente', severity: 'critical' },
  { id: 'm365-1.2', category: 'Microsoft 365', item: 'Client Secret seguro', description: 'Supabase Secrets', verification: 'Verificar armazenamento seguro', severity: 'critical' },
  { id: 'm365-1.3', category: 'Microsoft 365', item: 'Redirect URI correto', description: 'Auth callback', verification: 'Verificar URL de callback', severity: 'critical' },
  { id: 'm365-1.4', category: 'Microsoft 365', item: 'Escopos mínimos', description: 'Princípio menor privilégio', verification: 'Verificar permissões solicitadas', severity: 'high' },
  { id: 'm365-1.5', category: 'Microsoft 365', item: 'Token refresh', description: 'Automático', verification: 'Verificar renovação de tokens', severity: 'high' },
  { id: 'm365-1.6', category: 'Microsoft 365', item: 'Token encryption', description: 'pgsodium', verification: 'Verificar criptografia de tokens', severity: 'critical' },
  { id: 'm365-1.7', category: 'Microsoft 365', item: 'Error handling', description: 'Fallback', verification: 'Verificar tratamento de erros', severity: 'high' },
  { id: 'm365-1.8', category: 'Microsoft 365', item: 'Rate limiting', description: 'Graph API limits', verification: 'Verificar limites de requisições', severity: 'medium' },
  { id: 'm365-1.9', category: 'Microsoft 365', item: 'Consent flow', description: 'Admin consent', verification: 'Verificar fluxo de consentimento', severity: 'medium' },
  { id: 'm365-1.10', category: 'Microsoft 365', item: 'Disconnect flow', description: 'Revoke tokens', verification: 'Verificar revogação de tokens', severity: 'medium' },
];

const PLUGGY_CHECKLIST: Omit<AuditorChecklistItem, 'status' | 'details' | 'lastChecked'>[] = [
  { id: 'pluggy-2.1', category: 'Pluggy', item: 'Client ID configurado', description: 'Env var', verification: 'Verificar variável de ambiente', severity: 'critical' },
  { id: 'pluggy-2.2', category: 'Pluggy', item: 'Client Secret seguro', description: 'Supabase Secrets', verification: 'Verificar armazenamento seguro', severity: 'critical' },
  { id: 'pluggy-2.3', category: 'Pluggy', item: 'Webhook configurado', description: 'URL pública', verification: 'Verificar endpoint de webhook', severity: 'high' },
  { id: 'pluggy-2.4', category: 'Pluggy', item: 'Webhook secret', description: 'Validação HMAC', verification: 'Verificar assinatura de webhooks', severity: 'critical' },
  { id: 'pluggy-2.5', category: 'Pluggy', item: 'Item sync', description: 'Status tracking', verification: 'Verificar sincronização de itens', severity: 'high' },
  { id: 'pluggy-2.6', category: 'Pluggy', item: 'Error handling', description: 'Reconnect flow', verification: 'Verificar reconexão em erros', severity: 'high' },
  { id: 'pluggy-2.7', category: 'Pluggy', item: 'Transaction sync', description: 'Periodicidade', verification: 'Verificar sincronização de transações', severity: 'medium' },
  { id: 'pluggy-2.8', category: 'Pluggy', item: 'Account mapping', description: 'Contas ICARUS', verification: 'Verificar mapeamento de contas', severity: 'medium' },
  { id: 'pluggy-2.9', category: 'Pluggy', item: 'Conciliation', description: 'Automática', verification: 'Verificar conciliação automática', severity: 'medium' },
  { id: 'pluggy-2.10', category: 'Pluggy', item: 'Sandbox vs Prod', description: 'Ambiente correto', verification: 'Verificar ambiente de execução', severity: 'critical' },
];

const SEFAZ_CHECKLIST: Omit<AuditorChecklistItem, 'status' | 'details' | 'lastChecked'>[] = [
  { id: 'sefaz-3.1', category: 'SEFAZ', item: 'Certificado A1 válido', description: 'Data expiração', verification: 'Verificar validade do certificado', severity: 'critical' },
  { id: 'sefaz-3.2', category: 'SEFAZ', item: 'Certificado correto', description: 'PFX + senha', verification: 'Verificar arquivo e senha', severity: 'critical' },
  { id: 'sefaz-3.3', category: 'SEFAZ', item: 'Ambiente correto', description: 'Produção/Homologação', verification: 'Verificar ambiente configurado', severity: 'critical' },
  { id: 'sefaz-3.4', category: 'SEFAZ', item: 'UF configurada', description: 'Estado da empresa', verification: 'Verificar UF do emitente', severity: 'critical' },
  { id: 'sefaz-3.5', category: 'SEFAZ', item: 'Série NF-e', description: 'Configurada', verification: 'Verificar série de NF-e', severity: 'high' },
  { id: 'sefaz-3.6', category: 'SEFAZ', item: 'Contingência', description: 'Modo offline', verification: 'Verificar configuração de contingência', severity: 'high' },
  { id: 'sefaz-3.7', category: 'SEFAZ', item: 'Backup XML', description: '5 anos', verification: 'Verificar armazenamento de XMLs', severity: 'critical' },
  { id: 'sefaz-3.8', category: 'SEFAZ', item: 'DANFE geração', description: 'PDF correto', verification: 'Verificar geração de DANFE', severity: 'high' },
  { id: 'sefaz-3.9', category: 'SEFAZ', item: 'Cancelamento', description: 'Prazo 24h', verification: 'Verificar fluxo de cancelamento', severity: 'high' },
  { id: 'sefaz-3.10', category: 'SEFAZ', item: 'CC-e', description: 'Carta correção', verification: 'Verificar carta de correção', severity: 'medium' },
];

const ANVISA_CHECKLIST: Omit<AuditorChecklistItem, 'status' | 'details' | 'lastChecked'>[] = [
  { id: 'anvisa-4.1', category: 'ANVISA', item: 'API disponível', description: 'Health check', verification: 'Verificar disponibilidade da API', severity: 'high' },
  { id: 'anvisa-4.2', category: 'ANVISA', item: 'Timeout configurado', description: '30s', verification: 'Verificar timeout de requisições', severity: 'medium' },
  { id: 'anvisa-4.3', category: 'ANVISA', item: 'Cache de consultas', description: 'Evitar excesso', verification: 'Verificar cache de consultas', severity: 'medium' },
  { id: 'anvisa-4.4', category: 'ANVISA', item: 'Fallback', description: 'Quando offline', verification: 'Verificar fallback offline', severity: 'high' },
  { id: 'anvisa-4.5', category: 'ANVISA', item: 'Logging', description: 'Consultas feitas', verification: 'Verificar logs de consultas', severity: 'low' },
  { id: 'anvisa-4.6', category: 'ANVISA', item: 'Validação de formato', description: 'Registro ANVISA', verification: 'Verificar validação de registros', severity: 'high' },
];

const OTHER_APIS_CHECKLIST: Omit<AuditorChecklistItem, 'status' | 'details' | 'lastChecked'>[] = [
  { id: 'other-5.1', category: 'Outras APIs', item: 'OpenAI API', description: 'Chatbot/Embeddings', verification: 'Verificar configuração OpenAI', severity: 'high' },
  { id: 'other-5.2', category: 'Outras APIs', item: 'ViaCEP', description: 'Endereços', verification: 'Verificar disponibilidade ViaCEP', severity: 'low' },
  { id: 'other-5.3', category: 'Outras APIs', item: 'BrasilAPI', description: 'CNPJ/CPF', verification: 'Verificar disponibilidade BrasilAPI', severity: 'low' },
  { id: 'other-5.4', category: 'Outras APIs', item: 'CFM API', description: 'Validação CRM', verification: 'Verificar disponibilidade CFM', severity: 'medium' },
];

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

  // Run full audit
  const runAudit = useCallback(async (): Promise<AuditorChecklistResult> => {
    const now = new Date();
    const alerts: AuditorAlert[] = [];
    const recommendations: string[] = [];

    // Check health first
    await checkAllHealth();

    // Microsoft 365 audit
    const microsoftHealth = getIntegrationHealth('Microsoft 365');
    const microsoftItems = MICROSOFT_CHECKLIST.map((item): AuditorChecklistItem => {
      let status: AuditorChecklistItem['status'] = 'pending';
      let details: string | undefined;

      if (!isMicrosoftConfigured()) {
        status = item.severity === 'critical' ? 'fail' : 'warning';
        details = 'Microsoft 365 not configured';
      } else if (microsoftHealth?.status === 'connected') {
        status = 'pass';
      } else if (microsoftHealth?.status === 'expiring') {
        status = 'warning';
        details = `Token expiring in ${microsoftHealth.daysUntilExpiry} days`;
      } else if (microsoftHealth?.status === 'error') {
        status = 'fail';
        details = microsoftHealth.errorMessage;
      }

      return { ...item, status, details, lastChecked: now };
    });

    // Pluggy audit
    const pluggyHealth = getIntegrationHealth('Pluggy (Open Banking)');
    const pluggyItems = PLUGGY_CHECKLIST.map((item): AuditorChecklistItem => {
      let status: AuditorChecklistItem['status'] = 'pending';
      let details: string | undefined;

      if (!isPluggyConfigured()) {
        status = item.severity === 'critical' ? 'fail' : 'not_applicable';
        details = 'Pluggy not configured';
      } else if (pluggyHealth?.status === 'connected') {
        status = 'pass';
      } else if (pluggyHealth?.status === 'error') {
        status = 'fail';
        details = pluggyHealth.errorMessage;
      } else if (pluggyHealth?.status === 'outdated') {
        status = 'warning';
        details = 'Connection outdated';
      }

      return { ...item, status, details, lastChecked: now };
    });

    // SEFAZ audit
    const sefazHealth = getIntegrationHealth('SEFAZ (NF-e)');
    const sefazItems = SEFAZ_CHECKLIST.map((item): AuditorChecklistItem => {
      let status: AuditorChecklistItem['status'] = 'pending';
      let details: string | undefined;

      if (sefazHealth?.status === 'disconnected') {
        status = item.severity === 'critical' ? 'fail' : 'warning';
        details = sefazHealth.errorMessage ?? 'Certificate not configured';
      } else if (sefazHealth?.status === 'connected') {
        status = 'pass';
      } else if (sefazHealth?.status === 'expiring') {
        status = 'warning';
        details = `Certificate expiring in ${sefazHealth.daysUntilExpiry} days`;

        if (sefazHealth.daysUntilExpiry && sefazHealth.daysUntilExpiry <= 7) {
          alerts.push({
            type: 'critical',
            integration: 'SEFAZ',
            message: `Certificado digital expira em ${sefazHealth.daysUntilExpiry} dias`,
            action: 'Renovar certificado imediatamente',
            timestamp: now,
          });
        }
      } else if (sefazHealth?.status === 'error') {
        status = 'fail';
        details = sefazHealth.errorMessage;
      }

      return { ...item, status, details, lastChecked: now };
    });

    // ANVISA audit
    const anvisaHealth = getIntegrationHealth('ANVISA API');
    const anvisaItems = ANVISA_CHECKLIST.map((item): AuditorChecklistItem => {
      let status: AuditorChecklistItem['status'] = 'pending';
      let details: string | undefined;

      if (anvisaHealth?.status === 'connected') {
        status = 'pass';
      } else if (anvisaHealth?.status === 'error') {
        status = item.severity === 'critical' ? 'fail' : 'warning';
        details = anvisaHealth.errorMessage;

        if (item.id === 'anvisa-4.1') {
          alerts.push({
            type: 'warning',
            integration: 'ANVISA',
            message: 'API ANVISA indisponível',
            action: 'Verificar status do serviço',
            timestamp: now,
          });
        }
      }

      return { ...item, status, details, lastChecked: now };
    });

    // Other APIs audit
    const otherItems = OTHER_APIS_CHECKLIST.map((item): AuditorChecklistItem => {
      let status: AuditorChecklistItem['status'] = 'pending';
      let details: string | undefined;

      const healthMap: Record<string, string> = {
        'other-5.1': 'OpenAI',
        'other-5.2': 'ViaCEP',
        'other-5.3': 'BrasilAPI',
        'other-5.4': 'CFM API',
      };

      const relatedHealth = getIntegrationHealth(healthMap[item.id] ?? '');

      if (relatedHealth?.status === 'connected') {
        status = 'pass';
      } else if (relatedHealth?.status === 'error') {
        status = item.severity === 'high' ? 'fail' : 'warning';
        details = relatedHealth.errorMessage;
      } else {
        status = 'pass'; // Default to pass for non-critical APIs
      }

      return { ...item, status, details, lastChecked: now };
    });

    // Calculate scores
    const calculateCategoryScore = (items: AuditorChecklistItem[]): number => {
      const weights = { critical: 3, high: 2, medium: 1, low: 0.5 };
      let totalWeight = 0;
      let earnedWeight = 0;

      items.forEach((item) => {
        const weight = weights[item.severity];
        totalWeight += weight;

        if (item.status === 'pass') {
          earnedWeight += weight;
        } else if (item.status === 'warning') {
          earnedWeight += weight * 0.5;
        } else if (item.status === 'not_applicable') {
          totalWeight -= weight; // Don't count N/A items
        }
      });

      return totalWeight > 0 ? (earnedWeight / totalWeight) * 100 : 100;
    };

    const categories: AuditorChecklistCategory[] = [
      {
        name: 'Microsoft 365',
        weight: 0.30,
        criticality: 'high',
        items: microsoftItems,
        score: calculateCategoryScore(microsoftItems),
      },
      {
        name: 'Pluggy (Open Banking)',
        weight: 0.25,
        criticality: 'high',
        items: pluggyItems,
        score: calculateCategoryScore(pluggyItems),
      },
      {
        name: 'SEFAZ (NF-e)',
        weight: 0.20,
        criticality: 'critical',
        items: sefazItems,
        score: calculateCategoryScore(sefazItems),
      },
      {
        name: 'ANVISA API',
        weight: 0.15,
        criticality: 'high',
        items: anvisaItems,
        score: calculateCategoryScore(anvisaItems),
      },
      {
        name: 'Outras APIs',
        weight: 0.10,
        criticality: 'medium',
        items: otherItems,
        score: calculateCategoryScore(otherItems),
      },
    ];

    // Calculate total score
    const totalScore = categories.reduce(
      (sum, cat) => sum + cat.score * cat.weight,
      0
    );

    // Generate recommendations
    categories.forEach((cat) => {
      if (cat.score < 80) {
        const failedItems = cat.items.filter((i) => i.status === 'fail');
        failedItems.forEach((item) => {
          recommendations.push(
            `[${cat.name}] Corrigir: ${item.item} - ${item.description}`
          );
        });
      }
    });

    if (totalScore < 85) {
      recommendations.push(
        'Score total abaixo do mínimo recomendado (85). Revise os itens críticos.'
      );
    }

    return {
      categories,
      totalScore,
      timestamp: now,
      recommendations,
      alerts,
    };
  }, [checkAllHealth, getIntegrationHealth]);

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
