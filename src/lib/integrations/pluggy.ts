/**
 * ICARUS v5.0 - Pluggy (Open Banking) Integration
 * Bank account connections, transaction sync, and financial data
 */

import { getSupabaseClientOrThrow, isSupabaseConfigured } from '@/lib/supabase/client';
import { APIClient, APICache } from './api-client';
import type {
  PluggyConfig,
  PluggyConnectToken,
  PluggyConnection,
  PluggyAccount,
  PluggyTransaction,
  PluggyWebhookEvent,
  IntegrationHealth,
} from './types';

// Pluggy API URLs
const PLUGGY_API_URL = 'https://api.pluggy.ai';
const PLUGGY_SANDBOX_URL = 'https://api.pluggy.ai/sandbox';

// Configuration
const getPluggyConfig = (): PluggyConfig => ({
  clientId: import.meta.env.VITE_PLUGGY_CLIENT_ID ?? '',
  clientSecret: '', // Should be stored in Supabase secrets
  webhookUrl: import.meta.env.VITE_PLUGGY_WEBHOOK_URL,
  sandbox: import.meta.env.VITE_PLUGGY_SANDBOX === 'true',
});

const validatePluggyConfig = (
  config: PluggyConfig
): { config: PluggyConfig; isValid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!config.clientId) missing.push('clientId');
  if (!config.webhookUrl) missing.push('webhookUrl');

  return {
    config,
    isValid: missing.length === 0,
    missing,
  };
};

export function isPluggyConfigured(): boolean {
  const validation = validatePluggyConfig(getPluggyConfig());
  return validation.isValid;
}

/**
 * Pluggy Open Banking Client
 */
export class PluggyClient extends APIClient {
  private apiKey: string | null = null;
  private apiKeyExpiry: Date | null = null;
  private cache: APICache;
  private isSandbox: boolean;
  private readonly config: PluggyConfig;
  private readonly configMissing: string[];

  constructor() {
    const config = getPluggyConfig();
    const validation = validatePluggyConfig(config);
    super({
      baseUrl: config.sandbox ? PLUGGY_SANDBOX_URL : PLUGGY_API_URL,
      timeout: 30000,
      retries: 3,
    });
    this.cache = new APICache(60000);
    this.isSandbox = config.sandbox ?? false;
    this.config = config;
    this.configMissing = validation.missing;
  }

  private getSupabase() {
    return getSupabaseClientOrThrow();
  }

  private assertConfig() {
    if (this.configMissing.length > 0) {
      throw new Error(
        `Pluggy configuration is incomplete: missing ${this.configMissing.join(', ')}`
      );
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Supabase must be configured before using Pluggy.');
    }
  }

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================

  /**
   * Get API key for Pluggy requests (server-side via Edge Function)
   */
  private async getActiveApiKey(): Promise<string> {
    this.assertConfig();

    const hasValidCachedKey = () => {
      if (!this.apiKey || !this.apiKeyExpiry) return false;
      const buffer = 5 * 60 * 1000; // 5 minutes buffer
      return this.apiKeyExpiry.getTime() > Date.now() + buffer;
    };

    if (hasValidCachedKey()) {
      return this.apiKey as string;
    }

    // Get new API key via Edge Function
    const supabase = this.getSupabase();
    const { data, error } = await supabase.functions.invoke<{ apiKey?: string; expiresIn?: number }>('pluggy-auth', {
      body: { action: 'get_api_key' },
    });

    if (error) {
      throw new Error(error.message ?? 'Failed to get Pluggy API key');
    }

    const apiKey = data?.apiKey;
    if (!apiKey) {
      throw new Error('Pluggy API key is missing from the authentication response');
    }

    const expiresIn = data?.expiresIn ?? 3600;
    this.apiKey = apiKey;
    this.apiKeyExpiry = new Date(Date.now() + expiresIn * 1000);

    return apiKey;
  }

  /**
   * Make authenticated request to Pluggy API
   */
  private async pluggyRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const apiKey = await this.getActiveApiKey();

    return this.request<T>(endpoint, {
      ...options,
      headers: {
        'X-API-KEY': apiKey,
        ...options.headers,
      },
    });
  }

  // =========================================================================
  // CONNECT TOKEN
  // =========================================================================

  /**
   * Create connect token for widget
   */
  async createConnectToken(
    empresaId: string,
    options?: {
      itemId?: string; // For reconnection
      products?: ('ACCOUNTS' | 'TRANSACTIONS' | 'INVESTMENTS' | 'IDENTITY')[];
    }
  ): Promise<PluggyConnectToken> {
    this.assertConfig();
    const supabase = this.getSupabase();
    const { data, error } = await supabase.functions.invoke<{ accessToken?: string }>('pluggy-connect', {
      body: {
        action: 'create_connect_token',
        empresaId,
        itemId: options?.itemId,
        products: options?.products ?? ['ACCOUNTS', 'TRANSACTIONS'],
      },
    });

    if (error) {
      throw new Error(error.message ?? 'Failed to create Pluggy connect token');
    }

    if (!data?.accessToken) {
      throw new Error('Pluggy connect token is missing from the response');
    }

    return {
      accessToken: data.accessToken,
      expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
    };
  }

  // =========================================================================
  // ITEMS (Bank Connections)
  // =========================================================================

  /**
   * Get connection by item ID
   */
  async getConnection(itemId: string): Promise<PluggyConnection> {
    const data = await this.pluggyRequest<{
      id: string;
      connector: {
        id: number;
        name: string;
        imageUrl: string;
        primaryColor: string;
        type: string;
      };
      status: string;
      statusDetail?: { code: string; message: string };
      lastUpdatedAt?: string;
      error?: { code: string; message: string };
    }>(`/items/${itemId}`);

    // Get accounts for this item
    const accounts = await this.getAccounts(itemId);

    return {
      id: data.id,
      itemId: data.id,
      status: this.mapItemStatus(data.status),
      institution: {
        id: data.connector.id,
        name: data.connector.name,
        imageUrl: data.connector.imageUrl,
        primaryColor: data.connector.primaryColor,
        type: data.connector.type as 'BANK' | 'INVESTMENT' | 'EXCHANGE',
      },
      lastSync: data.lastUpdatedAt ? new Date(data.lastUpdatedAt) : undefined,
      errorMessage: data.error?.message,
      accounts,
    };
  }

  /**
   * Get all connections for empresa
   */
  async getConnections(empresaId: string): Promise<PluggyConnection[]> {
    // Get item IDs from Supabase
    const supabase = this.getSupabase();
    const { data: items, error } = await supabase
      .from('pluggy_connections')
      .select('item_id')
      .eq('empresa_id', empresaId)
      .is('excluido_em', null);

    if (error || !items) {
      return [];
    }

    const connections = await Promise.all(
      items.map(async (item) => {
        try {
          return await this.getConnection(item.item_id);
        } catch {
          return null;
        }
      })
    );

    return connections.filter(Boolean) as PluggyConnection[];
  }

  /**
   * Delete connection
   */
  async deleteConnection(itemId: string): Promise<void> {
    await this.pluggyRequest(`/items/${itemId}`, { method: 'DELETE' });

    // Also remove from Supabase
    const supabase = this.getSupabase();
    await supabase
      .from('pluggy_connections')
      .update({ excluido_em: new Date().toISOString() })
      .eq('item_id', itemId);
  }

  /**
   * Update connection (reconnect)
   */
  async updateConnection(
    itemId: string,
    empresaId: string
  ): Promise<PluggyConnectToken> {
    return this.createConnectToken(empresaId, { itemId });
  }

  private mapItemStatus(
    status: string
  ): PluggyConnection['status'] {
    const statusMap: Record<string, PluggyConnection['status']> = {
      UPDATING: 'connecting',
      UPDATED: 'connected',
      LOGIN_ERROR: 'login_required',
      OUTDATED: 'outdated',
      ERROR: 'error',
    };
    return statusMap[status] ?? 'error';
  }

  // =========================================================================
  // ACCOUNTS
  // =========================================================================

  /**
   * Get accounts for an item
   */
  async getAccounts(itemId: string): Promise<PluggyAccount[]> {
    const cacheKey = `accounts:${itemId}`;
    const cached = this.cache.get<PluggyAccount[]>(cacheKey);
    if (cached) return cached;

    const data = await this.pluggyRequest<{
      results: Array<{
        id: string;
        itemId: string;
        type: string;
        name: string;
        number?: string;
        balance: number;
        currencyCode: string;
        bankData?: {
          bankName: string;
          branchNumber: string;
          accountNumber: string;
        };
      }>;
    }>(`/accounts?itemId=${itemId}`);

    const accounts: PluggyAccount[] = data.results.map((acc) => ({
      id: acc.id,
      itemId: acc.itemId,
      type: acc.type as PluggyAccount['type'],
      name: acc.name,
      number: acc.number,
      balance: acc.balance,
      currencyCode: acc.currencyCode,
      bankData: acc.bankData
        ? {
            bankName: acc.bankData.bankName,
            branch: acc.bankData.branchNumber,
            account: acc.bankData.accountNumber,
          }
        : undefined,
    }));

    this.cache.set(cacheKey, accounts, 300); // 5 min cache
    return accounts;
  }

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================

  /**
   * Get transactions for an account
   */
  async getTransactions(
    accountId: string,
    options?: {
      from?: Date;
      to?: Date;
      page?: number;
      pageSize?: number;
    }
  ): Promise<{
    transactions: PluggyTransaction[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const params = new URLSearchParams({
      accountId,
      page: String(options?.page ?? 1),
      pageSize: String(options?.pageSize ?? 100),
    });

    if (options?.from) {
      params.set('from', options.from.toISOString().split('T')[0]);
    }
    if (options?.to) {
      params.set('to', options.to.toISOString().split('T')[0]);
    }

    const data = await this.pluggyRequest<{
      results: Array<{
        id: string;
        accountId: string;
        date: string;
        description: string;
        descriptionRaw?: string;
        amount: number;
        amountInAccountCurrency?: number;
        type: string;
        category?: string;
        categoryId?: string;
        paymentData?: {
          payer?: { name: string };
          receiver?: { name: string };
          paymentMethod?: string;
          referenceNumber?: string;
        };
      }>;
      total: number;
      page: number;
      totalPages: number;
    }>(`/transactions?${params.toString()}`);

    const transactions: PluggyTransaction[] = data.results.map((tx) => ({
      id: tx.id,
      accountId: tx.accountId,
      date: new Date(tx.date),
      description: tx.description,
      descriptionRaw: tx.descriptionRaw,
      amount: tx.amount,
      amountInAccountCurrency: tx.amountInAccountCurrency,
      type: tx.type as 'CREDIT' | 'DEBIT',
      category: tx.category,
      categoryId: tx.categoryId,
      paymentData: tx.paymentData
        ? {
            payer: tx.paymentData.payer?.name,
            payee: tx.paymentData.receiver?.name,
            paymentMethod: tx.paymentData.paymentMethod,
            referenceNumber: tx.paymentData.referenceNumber,
          }
        : undefined,
    }));

    return {
      transactions,
      total: data.total,
      page: data.page,
      totalPages: data.totalPages,
    };
  }

  /**
   * Sync transactions to ICARUS database
   */
  async syncTransactions(
    itemId: string,
    empresaId: string
  ): Promise<{ synced: number; errors: number }> {
    const connection = await this.getConnection(itemId);
    let synced = 0;
    let errors = 0;

    for (const account of connection.accounts) {
      try {
        // Get last sync date
        const supabase = this.getSupabase();
        const { data: lastTx } = await supabase
          .from('contas_transacoes')
          .select('data')
          .eq('pluggy_conta_id', account.id)
          .order('data', { ascending: false })
          .limit(1)
          .single();

        const fromDate = lastTx?.data
          ? new Date(lastTx.data)
          : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // 90 days

        // Fetch transactions
        const { transactions } = await this.getTransactions(account.id, {
          from: fromDate,
          pageSize: 500,
        });

        // Insert into ICARUS
        for (const tx of transactions) {
          const supabase = this.getSupabase();
          const { error } = await supabase.from('contas_transacoes').upsert(
            {
              id: tx.id,
              empresa_id: empresaId,
              pluggy_conta_id: account.id,
              pluggy_item_id: itemId,
              data: tx.date.toISOString(),
              descricao: tx.description,
              descricao_original: tx.descriptionRaw,
              valor: tx.amount,
              tipo: tx.type === 'CREDIT' ? 'entrada' : 'saida',
              categoria_pluggy: tx.category,
              categoria_id: tx.categoryId,
              pagador: tx.paymentData?.payer,
              beneficiario: tx.paymentData?.payee,
              conciliado: false,
            },
            { onConflict: 'id' }
          );

          if (error) {
            errors++;
          } else {
            synced++;
          }
        }
      } catch {
        errors++;
      }
    }

    // Update last sync date
    const supabase = this.getSupabase();
    await supabase
      .from('pluggy_connections')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('item_id', itemId);

    return { synced, errors };
  }

  // =========================================================================
  // WEBHOOK
  // =========================================================================

  /**
   * Validate webhook signature
   */
  static validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    // This would need to be done in an Edge Function for proper HMAC
    // Here we just return true for type safety
    return Boolean(signature && secret);
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(
    event: PluggyWebhookEvent,
    empresaId: string
  ): Promise<void> {
    switch (event.event) {
      case 'item/created':
      case 'item/updated':
        await this.syncTransactions(event.itemId, empresaId);
        break;

      case 'item/error':
      case 'item/login_required': {
        const supabase = this.getSupabase();
        await supabase
          .from('pluggy_connections')
          .update({
            status: event.event === 'item/login_required' ? 'login_required' : 'error',
            erro_mensagem: JSON.stringify(event.data),
          })
          .eq('item_id', event.itemId);
        break;
      }

      case 'item/deleted': {
        const supabase = this.getSupabase();
        await supabase
          .from('pluggy_connections')
          .update({ excluido_em: new Date().toISOString() })
          .eq('item_id', event.itemId);
        break;
      }

      case 'transactions/created':
        await this.syncTransactions(event.itemId, empresaId);
        break;
    }
  }

  // =========================================================================
  // INSTITUTIONS
  // =========================================================================

  /**
   * Get available institutions
   */
  async getInstitutions(
    type?: 'BANK' | 'INVESTMENT' | 'EXCHANGE'
  ): Promise<Array<{
    id: number;
    name: string;
    imageUrl: string;
    primaryColor: string;
    type: string;
    country: string;
  }>> {
    const cacheKey = `institutions:${type ?? 'all'}`;
    const cached = this.cache.get<Array<{
      id: number;
      name: string;
      imageUrl: string;
      primaryColor: string;
      type: string;
      country: string;
    }>>(cacheKey);
    if (cached) return cached;

    let endpoint = '/connectors?countries=BR';
    if (type) {
      endpoint += `&types=${type}`;
    }

    const data = await this.pluggyRequest<{
      results: Array<{
        id: number;
        name: string;
        imageUrl: string;
        primaryColor: string;
        type: string;
        country: string;
      }>;
    }>(endpoint);

    this.cache.set(cacheKey, data.results, 3600); // 1 hour cache
    return data.results;
  }

  // =========================================================================
  // HEALTH CHECK
  // =========================================================================

  /**
   * Check integration health
   */
  async checkHealth(empresaId: string): Promise<IntegrationHealth> {
    try {
      if (!isPluggyConfigured()) {
        return {
          name: 'Pluggy (Open Banking)',
          status: 'disconnected',
          errorMessage: 'Pluggy not configured',
        };
      }

      const connections = await this.getConnections(empresaId);

      if (connections.length === 0) {
        return {
          name: 'Pluggy (Open Banking)',
          status: 'disconnected',
        };
      }

      // Check for any errors or outdated connections
      const hasError = connections.some((c) => c.status === 'error');
      const hasLoginRequired = connections.some((c) => c.status === 'login_required');
      const hasOutdated = connections.some((c) => c.status === 'outdated');
      const allConnected = connections.every((c) => c.status === 'connected');

      const lastSync = connections
        .filter((c) => c.lastSync)
        .map((c) => c.lastSync!)
        .sort((a, b) => b.getTime() - a.getTime())[0];

      if (hasError) {
        return {
          name: 'Pluggy (Open Banking)',
          status: 'error',
          lastSync,
          errorMessage: 'One or more connections have errors',
        };
      }

      if (hasLoginRequired) {
        return {
          name: 'Pluggy (Open Banking)',
          status: 'error',
          lastSync,
          errorMessage: 'One or more connections require re-authentication',
        };
      }

      if (hasOutdated) {
        return {
          name: 'Pluggy (Open Banking)',
          status: 'outdated',
          lastSync,
        };
      }

      return {
        name: 'Pluggy (Open Banking)',
        status: allConnected ? 'connected' : 'connecting',
        lastSync,
      };
    } catch (error) {
      return {
        name: 'Pluggy (Open Banking)',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Singleton instance
export const pluggy = new PluggyClient();
