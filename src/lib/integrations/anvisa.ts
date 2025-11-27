/**
 * ICARUS v5.0 - ANVISA API Integration
 * Medical device and product registry validation
 * 
 * Supports two backends:
 * 1. InfoSimples API (preferred - faster, SLA 99.9%)
 * 2. Direct ANVISA public API (fallback)
 * 
 * Conformidade: RDC 751/2022, RDC 16/2013, RDC 59/2008
 */

import { APIClient, APICache } from './api-client';
import { infosimples } from '@/lib/infosimples';
import type { AnvisaRegistro, IntegrationHealth } from './types';

// ANVISA API URL (public consultation)
const ANVISA_API_URL = 'https://consultas.anvisa.gov.br/api';

// Check if InfoSimples is configured
const INFOSIMPLES_KEY = typeof window !== 'undefined'
  ? import.meta.env.VITE_INFOSIMPLES_KEY
  : undefined;

/**
 * ANVISA Client
 */
export class AnvisaClient extends APIClient {
  private cache: APICache;
  private lastHealthCheck: Date | null = null;
  private isAvailable: boolean = true;
  private useInfoSimples: boolean;

  constructor() {
    super({
      baseUrl: ANVISA_API_URL,
      timeout: 30000,
      retries: 2,
    });
    this.cache = new APICache(60000); // 1 minute cleanup
    this.useInfoSimples = Boolean(INFOSIMPLES_KEY);
  }

  // =========================================================================
  // REGISTRY VALIDATION
  // =========================================================================

  /**
   * Validate ANVISA registry format
   */
  private validateRegistryFormat(registro: string): boolean {
    // ANVISA registry is typically 13 digits
    return /^\d{13}$/.test(registro.replace(/\D/g, ''));
  }

  /**
   * Format registry number
   */
  private formatRegistry(registro: string): string {
    return registro.replace(/\D/g, '').padStart(13, '0');
  }

  /**
   * Lookup ANVISA registry via InfoSimples (preferred)
   */
  private async consultarViaInfoSimples(registro: string): Promise<AnvisaRegistro | null> {
    try {
      const response = await infosimples.post<{
        numero_registro: string;
        nome_comercial?: string;
        titular?: string;
        situacao?: string;
        valido_ate?: string;
        classe_risco?: string;
        motivo_cancelamento?: string;
      }>('/consultas/anvisa/registro', {
        numero_registro: registro.replace(/\D/g, '')
      });

      if (response.code !== 200 || !response.data || response.data.length === 0) {
        return null;
      }

      const data = response.data[0];
      let situacao = data.situacao?.toUpperCase() || 'NAO_ENCONTRADO';
      
      // Check if expired
      if (data.valido_ate && situacao === 'ATIVO') {
        const dataValidade = new Date(data.valido_ate);
        if (dataValidade < new Date()) {
          situacao = 'VENCIDO';
        }
      }

      return {
        numero: data.numero_registro,
        valido: situacao === 'ATIVO',
        produto: data.nome_comercial,
        empresa: data.titular,
        vencimento: data.valido_ate ? new Date(data.valido_ate) : undefined,
        classeRisco: data.classe_risco as AnvisaRegistro['classeRisco'],
        situacao: situacao as AnvisaRegistro['situacao'],
      };
    } catch (error) {
      console.warn('InfoSimples ANVISA query failed, falling back to direct API:', error);
      return null;
    }
  }

  /**
   * Lookup ANVISA registry via direct API (fallback)
   */
  private async consultarViaDireta(registro: string): Promise<AnvisaRegistro> {
    const data = await this.withRetry(async () => {
      return this.get<{
        numero: string;
        nomeProduto?: string;
        nomeEmpresa?: string;
        dataVencimento?: string;
        classeRisco?: string;
        situacao?: string;
        categoriaReguladora?: string;
        finalidade?: string;
        apresentacao?: string;
      }>(`/produto/${registro}`);
    });

    return {
      numero: registro,
      valido: data.situacao === 'ATIVO',
      produto: data.nomeProduto,
      empresa: data.nomeEmpresa,
      vencimento: data.dataVencimento ? new Date(data.dataVencimento) : undefined,
      classeRisco: data.classeRisco as AnvisaRegistro['classeRisco'],
      situacao: (data.situacao ?? 'NAO_ENCONTRADO') as AnvisaRegistro['situacao'],
      categoriaReguladora: data.categoriaReguladora,
      finalidade: data.finalidade,
      apresentacao: data.apresentacao,
    };
  }

  /**
   * Lookup ANVISA registry
   * Uses InfoSimples if configured, falls back to direct ANVISA API
   */
  async consultarRegistro(
    registro: string,
    useCache = true,
    cacheExpiry = 86400 // 24 hours
  ): Promise<AnvisaRegistro> {
    const formattedRegistry = this.formatRegistry(registro);

    // Validate format
    if (!this.validateRegistryFormat(formattedRegistry)) {
      return {
        numero: registro,
        valido: false,
        situacao: 'NAO_ENCONTRADO',
      };
    }

    // Check cache
    const cacheKey = `anvisa:${formattedRegistry}`;
    if (useCache) {
      const cached = this.cache.get<AnvisaRegistro>(cacheKey);
      if (cached) return cached;
    }

    try {
      let result: AnvisaRegistro;

      // Try InfoSimples first if configured (faster, more reliable)
      if (this.useInfoSimples) {
        const infoSimplesResult = await this.consultarViaInfoSimples(formattedRegistry);
        if (infoSimplesResult) {
          result = infoSimplesResult;
        } else {
          // Fallback to direct API
          result = await this.consultarViaDireta(formattedRegistry);
        }
      } else {
        // Direct ANVISA API
        result = await this.consultarViaDireta(formattedRegistry);
      }

      // Cache result
      this.cache.set(cacheKey, result, cacheExpiry);
      this.isAvailable = true;

      return result;
    } catch (error) {
      // Check if 404 (not found)
      if (error instanceof Error && error.message.includes('404')) {
        const result: AnvisaRegistro = {
          numero: formattedRegistry,
          valido: false,
          situacao: 'NAO_ENCONTRADO',
        };
        this.cache.set(cacheKey, result, 3600); // Cache for 1 hour
        return result;
      }

      // API unavailable
      this.isAvailable = false;
      throw error;
    }
  }

  /**
   * Batch validate registries
   */
  async validarRegistrosLote(
    registros: string[]
  ): Promise<Map<string, AnvisaRegistro>> {
    const results = new Map<string, AnvisaRegistro>();

    // Process in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < registros.length; i += batchSize) {
      const batch = registros.slice(i, i + batchSize);
      const batchResults = await Promise.allSettled(
        batch.map((r) => this.consultarRegistro(r))
      );

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.set(batch[index], result.value);
        } else {
          results.set(batch[index], {
            numero: batch[index],
            valido: false,
            situacao: 'NAO_ENCONTRADO',
          });
        }
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < registros.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    return results;
  }

  /**
   * Search products by name
   */
  async pesquisarProdutos(
    termo: string,
    options?: {
      page?: number;
      pageSize?: number;
      classeRisco?: 'I' | 'II' | 'III' | 'IV';
    }
  ): Promise<{
    produtos: Array<{
      registro: string;
      nome: string;
      empresa: string;
      classeRisco: string;
      situacao: string;
    }>;
    total: number;
  }> {
    const params: Record<string, string> = {
      filter: `nomeProduto~*'${termo}'`,
      page: String(options?.page ?? 1),
      count: String(options?.pageSize ?? 20),
    };

    if (options?.classeRisco) {
      params.filter += `~classeRisco:'${options.classeRisco}'`;
    }

    try {
      const data = await this.get<{
        content: Array<{
          numeroRegistro: string;
          nomeProduto: string;
          nomeEmpresa: string;
          classeRisco: string;
          situacao: string;
        }>;
        totalElements: number;
      }>('/produto', params);

      return {
        produtos: data.content.map((p) => ({
          registro: p.numeroRegistro,
          nome: p.nomeProduto,
          empresa: p.nomeEmpresa,
          classeRisco: p.classeRisco,
          situacao: p.situacao,
        })),
        total: data.totalElements,
      };
    } catch {
      return { produtos: [], total: 0 };
    }
  }

  /**
   * Get products expiring soon
   */
  async getExpiringProducts(
    empresaId: string,
    daysAhead = 90
  ): Promise<Array<{
    id: string;
    registro: string;
    nome: string;
    vencimento: Date;
    diasRestantes: number;
  }>> {
    // This would query the local database for products with ANVISA registries
    // and check their expiration dates
    const { supabase } = await import('@/lib/supabase/client');

    const { data, error } = await supabase
      .from('produtos')
      .select('id, registro_anvisa, descricao, anvisa_vencimento')
      .eq('empresa_id', empresaId)
      .not('registro_anvisa', 'is', null)
      .not('anvisa_vencimento', 'is', null)
      .lte(
        'anvisa_vencimento',
        new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString()
      )
      .order('anvisa_vencimento');

    if (error || !data) return [];

    return data.map((p) => {
      const vencimento = new Date(p.anvisa_vencimento);
      const diasRestantes = Math.floor(
        (vencimento.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      return {
        id: p.id,
        registro: p.registro_anvisa,
        nome: p.descricao,
        vencimento,
        diasRestantes,
      };
    });
  }

  /**
   * Update product ANVISA info from API
   */
  async atualizarInfoProduto(
    empresaId: string,
    produtoId: string
  ): Promise<boolean> {
    const { supabase } = await import('@/lib/supabase/client');

    // Get product
    const { data: produto } = await supabase
      .from('produtos')
      .select('registro_anvisa')
      .eq('id', produtoId)
      .eq('empresa_id', empresaId)
      .single();

    if (!produto?.registro_anvisa) return false;

    // Query ANVISA
    const registro = await this.consultarRegistro(produto.registro_anvisa, false);

    if (!registro.valido) return false;

    // Update product
    const { error } = await supabase
      .from('produtos')
      .update({
        anvisa_valido: registro.valido,
        anvisa_situacao: registro.situacao,
        anvisa_vencimento: registro.vencimento?.toISOString(),
        anvisa_classe_risco: registro.classeRisco,
        anvisa_atualizado_em: new Date().toISOString(),
      })
      .eq('id', produtoId);

    return !error;
  }

  // =========================================================================
  // HEALTH CHECK
  // =========================================================================

  /**
   * Check API availability
   */
  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // Simple health check - try to query a known valid registry
      const testRegistry = '1020300000001'; // Example registry

      const startTime = Date.now();
      await this.consultarRegistro(testRegistry, false, 60);
      const responseTime = Date.now() - startTime;

      this.lastHealthCheck = new Date();
      this.isAvailable = true;

      return {
        name: 'ANVISA API',
        status: responseTime > 10000 ? 'error' : 'connected',
        lastSync: this.lastHealthCheck,
        ...(responseTime > 10000 && {
          errorMessage: `Slow response: ${responseTime}ms`,
        }),
      };
    } catch (error) {
      this.isAvailable = false;
      this.lastHealthCheck = new Date();

      return {
        name: 'ANVISA API',
        status: 'error',
        lastSync: this.lastHealthCheck,
        errorMessage: error instanceof Error ? error.message : 'API unavailable',
      };
    }
  }

  /**
   * Get cached availability status
   */
  isApiAvailable(): boolean {
    return this.isAvailable;
  }

  /**
   * Get last health check time
   */
  getLastHealthCheck(): Date | null {
    return this.lastHealthCheck;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const anvisa = new AnvisaClient();
