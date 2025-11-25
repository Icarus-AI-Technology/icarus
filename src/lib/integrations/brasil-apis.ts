/**
 * ICARUS v5.0 - Brazilian APIs Integration
 * ViaCEP, BrasilAPI (CNPJ/CPF), and CFM (CRM validation)
 */

import { APIClient, APICache } from './api-client';
import type {
  ViaCepEndereco,
  BrasilApiCnpj,
  CfmMedico,
  IntegrationHealth,
} from './types';

// API URLs
const VIA_CEP_URL = 'https://viacep.com.br/ws';
const BRASIL_API_URL = 'https://brasilapi.com.br/api';
const CFM_API_URL = 'https://portal.cfm.org.br/api';

// ============================================================================
// VIA CEP CLIENT
// ============================================================================

export class ViaCepClient extends APIClient {
  private cache: APICache;

  constructor() {
    super({
      baseUrl: VIA_CEP_URL,
      timeout: 10000,
      retries: 2,
    });
    this.cache = new APICache(300000); // 5 min cleanup
  }

  /**
   * Format CEP (remove non-digits)
   */
  private formatCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Validate CEP format
   */
  private validateCep(cep: string): boolean {
    return /^\d{8}$/.test(cep);
  }

  /**
   * Lookup address by CEP
   */
  async consultarCep(cep: string): Promise<ViaCepEndereco | null> {
    const formattedCep = this.formatCep(cep);

    if (!this.validateCep(formattedCep)) {
      return null;
    }

    // Check cache
    const cacheKey = `cep:${formattedCep}`;
    const cached = this.cache.get<ViaCepEndereco>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.get<ViaCepEndereco>(`/${formattedCep}/json`);

      if (data.erro) {
        return null;
      }

      this.cache.set(cacheKey, data, 86400); // 24 hours
      return data;
    } catch {
      return null;
    }
  }

  /**
   * Search CEP by address
   */
  async pesquisarCep(
    uf: string,
    cidade: string,
    logradouro: string
  ): Promise<ViaCepEndereco[]> {
    const encodedUf = encodeURIComponent(uf);
    const encodedCidade = encodeURIComponent(cidade);
    const encodedLogradouro = encodeURIComponent(logradouro);

    try {
      const data = await this.get<ViaCepEndereco[]>(
        `/${encodedUf}/${encodedCidade}/${encodedLogradouro}/json`
      );

      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // Test with a known valid CEP (São Paulo)
      const result = await this.consultarCep('01310100');

      return {
        name: 'ViaCEP',
        status: result ? 'connected' : 'error',
        lastSync: new Date(),
        ...(result ? {} : { errorMessage: 'Failed to query test CEP' }),
      };
    } catch (error) {
      return {
        name: 'ViaCEP',
        status: 'error',
        lastSync: new Date(),
        errorMessage: error instanceof Error ? error.message : 'API unavailable',
      };
    }
  }
}

// ============================================================================
// BRASIL API CLIENT
// ============================================================================

export class BrasilApiClient extends APIClient {
  private cache: APICache;

  constructor() {
    super({
      baseUrl: BRASIL_API_URL,
      timeout: 15000,
      retries: 2,
    });
    this.cache = new APICache(300000);
  }

  /**
   * Format CNPJ (remove non-digits)
   */
  private formatCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '');
  }

  /**
   * Validate CNPJ format
   */
  private validateCnpj(cnpj: string): boolean {
    if (!/^\d{14}$/.test(cnpj)) return false;

    // CNPJ validation algorithm
    let sum = 0;
    let weight = 5;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(cnpj[12]) !== digit) return false;

    sum = 0;
    weight = 6;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(cnpj[13]) === digit;
  }

  /**
   * Format CPF (remove non-digits)
   */
  private formatCpf(cpf: string): string {
    return cpf.replace(/\D/g, '');
  }

  /**
   * Validate CPF format
   */
  private validateCpf(cpf: string): boolean {
    if (!/^\d{11}$/.test(cpf)) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; // All same digits

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    if (parseInt(cpf[9]) !== digit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    digit = (sum * 10) % 11;
    if (digit === 10) digit = 0;
    return parseInt(cpf[10]) === digit;
  }

  /**
   * Lookup CNPJ
   */
  async consultarCnpj(cnpj: string): Promise<BrasilApiCnpj | null> {
    const formattedCnpj = this.formatCnpj(cnpj);

    if (!this.validateCnpj(formattedCnpj)) {
      return null;
    }

    // Check cache
    const cacheKey = `cnpj:${formattedCnpj}`;
    const cached = this.cache.get<BrasilApiCnpj>(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.get<{
        cnpj: string;
        razao_social: string;
        nome_fantasia?: string;
        data_inicio_atividade?: string;
        descricao_situacao_cadastral?: string;
        data_situacao_cadastral?: string;
        natureza_juridica?: string;
        porte?: string;
        capital_social?: number;
        cnae_fiscal_descricao?: string;
        cnae_fiscal?: number;
        cnaes_secundarios?: Array<{ codigo: number; descricao: string }>;
        tipo_logradouro?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cep?: string;
        municipio?: string;
        uf?: string;
        ddd_telefone_1?: string;
        email?: string;
        qsa?: Array<{
          nome_socio: string;
          qualificacao_socio: string;
        }>;
      }>(`/cnpj/v1/${formattedCnpj}`);

      const result: BrasilApiCnpj = {
        cnpj: data.cnpj,
        razaoSocial: data.razao_social,
        nomeFantasia: data.nome_fantasia,
        dataAbertura: data.data_inicio_atividade,
        situacaoCadastral: data.descricao_situacao_cadastral,
        dataSituacaoCadastral: data.data_situacao_cadastral,
        naturezaJuridica: data.natureza_juridica,
        porte: data.porte,
        capitalSocial: data.capital_social,
        atividadePrincipal: data.cnae_fiscal
          ? {
              codigo: String(data.cnae_fiscal),
              descricao: data.cnae_fiscal_descricao ?? '',
            }
          : undefined,
        atividadesSecundarias: data.cnaes_secundarios?.map((c) => ({
          codigo: String(c.codigo),
          descricao: c.descricao,
        })),
        endereco:
          data.logradouro
            ? {
                tipoLogradouro: data.tipo_logradouro,
                logradouro: data.logradouro,
                numero: data.numero ?? 'S/N',
                complemento: data.complemento,
                bairro: data.bairro ?? '',
                cep: data.cep ?? '',
                municipio: data.municipio ?? '',
                uf: data.uf ?? '',
              }
            : undefined,
        telefone: data.ddd_telefone_1,
        email: data.email,
        qsa: data.qsa?.map((s) => ({
          nome: s.nome_socio,
          qualificacao: s.qualificacao_socio,
        })),
      };

      this.cache.set(cacheKey, result, 86400); // 24 hours
      return result;
    } catch {
      return null;
    }
  }

  /**
   * Validate CPF (basic validation only - not from Receita Federal)
   */
  validateCpfFormat(cpf: string): { valid: boolean; formatted: string } {
    const formatted = this.formatCpf(cpf);
    return {
      valid: this.validateCpf(formatted),
      formatted,
    };
  }

  /**
   * Get bank list
   */
  async listarBancos(): Promise<
    Array<{
      ispb: string;
      name: string;
      code: number | null;
      fullName: string;
    }>
  > {
    const cacheKey = 'bancos';
    const cached = this.cache.get<
      Array<{
        ispb: string;
        name: string;
        code: number | null;
        fullName: string;
      }>
    >(cacheKey);
    if (cached) return cached;

    try {
      const data = await this.get<
        Array<{
          ispb: string;
          name: string;
          code: number | null;
          fullName: string;
        }>
      >('/banks/v1');

      this.cache.set(cacheKey, data, 86400 * 7); // 7 days
      return data;
    } catch {
      return [];
    }
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // Test with a known CNPJ (Receita Federal)
      const result = await this.consultarCnpj('00394460005887');

      return {
        name: 'BrasilAPI',
        status: result ? 'connected' : 'error',
        lastSync: new Date(),
        ...(result ? {} : { errorMessage: 'Failed to query test CNPJ' }),
      };
    } catch (error) {
      return {
        name: 'BrasilAPI',
        status: 'error',
        lastSync: new Date(),
        errorMessage: error instanceof Error ? error.message : 'API unavailable',
      };
    }
  }
}

// ============================================================================
// CFM (Conselho Federal de Medicina) CLIENT
// ============================================================================

export class CfmClient extends APIClient {
  private cache: APICache;

  constructor() {
    super({
      baseUrl: CFM_API_URL,
      timeout: 15000,
      retries: 2,
    });
    this.cache = new APICache(300000);
  }

  /**
   * Format CRM
   */
  private formatCrm(crm: string): string {
    return crm.replace(/\D/g, '');
  }

  /**
   * Validate CRM format (basic)
   */
  private validateCrmFormat(crm: string, uf: string): boolean {
    const UFS = [
      'AC',
      'AL',
      'AP',
      'AM',
      'BA',
      'CE',
      'DF',
      'ES',
      'GO',
      'MA',
      'MT',
      'MS',
      'MG',
      'PA',
      'PB',
      'PR',
      'PE',
      'PI',
      'RJ',
      'RN',
      'RS',
      'RO',
      'RR',
      'SC',
      'SP',
      'SE',
      'TO',
    ];
    return /^\d{4,7}$/.test(crm) && UFS.includes(uf.toUpperCase());
  }

  /**
   * Lookup CRM
   * Note: CFM doesn't have a public API, this would need to be done via web scraping
   * or a third-party service. This implementation is a placeholder.
   */
  async consultarCrm(crm: string, uf: string): Promise<CfmMedico | null> {
    const formattedCrm = this.formatCrm(crm);
    const formattedUf = uf.toUpperCase();

    if (!this.validateCrmFormat(formattedCrm, formattedUf)) {
      return {
        crm: formattedCrm,
        uf: formattedUf,
        nome: '',
        situacao: 'NAO_ENCONTRADO',
      };
    }

    // Check cache
    const cacheKey = `crm:${formattedUf}:${formattedCrm}`;
    const cached = this.cache.get<CfmMedico>(cacheKey);
    if (cached) return cached;

    try {
      // This would need to use a Supabase Edge Function for web scraping
      // or a third-party API service
      const { supabase } = await import('@/lib/supabase/client');

      const { data, error } = await supabase.functions.invoke('cfm-consulta', {
        body: { crm: formattedCrm, uf: formattedUf },
      });

      if (error || !data) {
        return {
          crm: formattedCrm,
          uf: formattedUf,
          nome: '',
          situacao: 'NAO_ENCONTRADO',
        };
      }

      const result: CfmMedico = {
        crm: formattedCrm,
        uf: formattedUf,
        nome: data.nome,
        situacao: data.situacao as CfmMedico['situacao'],
        especialidades: data.especialidades,
        dataInscricao: data.dataInscricao
          ? new Date(data.dataInscricao)
          : undefined,
        enderecoProfissional: data.endereco,
      };

      this.cache.set(cacheKey, result, 86400); // 24 hours
      return result;
    } catch {
      return {
        crm: formattedCrm,
        uf: formattedUf,
        nome: '',
        situacao: 'NAO_ENCONTRADO',
      };
    }
  }

  /**
   * Validate CRM from local database
   */
  async validarCrmLocal(
    crm: string,
    uf: string,
    empresaId: string
  ): Promise<{
    found: boolean;
    medico?: {
      id: string;
      nome: string;
      especialidade?: string;
    };
  }> {
    const { supabase } = await import('@/lib/supabase/client');

    const { data } = await supabase
      .from('medicos')
      .select('id, nome, especialidade')
      .eq('empresa_id', empresaId)
      .eq('crm', this.formatCrm(crm))
      .eq('crm_uf', uf.toUpperCase())
      .is('excluido_em', null)
      .single();

    if (!data) {
      return { found: false };
    }

    return {
      found: true,
      medico: {
        id: data.id,
        nome: data.nome,
        especialidade: data.especialidade,
      },
    };
  }

  /**
   * Check service health
   */
  async checkHealth(): Promise<IntegrationHealth> {
    // CFM doesn't have a public API, so we can only check if our Edge Function works
    try {
      const { supabase } = await import('@/lib/supabase/client');

      const { error } = await supabase.functions.invoke('cfm-consulta', {
        body: { action: 'health_check' },
      });

      return {
        name: 'CFM API',
        status: error ? 'error' : 'connected',
        lastSync: new Date(),
        ...(error && { errorMessage: 'Edge function unavailable' }),
      };
    } catch (error) {
      return {
        name: 'CFM API',
        status: 'error',
        lastSync: new Date(),
        errorMessage:
          error instanceof Error ? error.message : 'Service unavailable',
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCES
// ============================================================================

export const viaCep = new ViaCepClient();
export const brasilApi = new BrasilApiClient();
export const cfm = new CfmClient();
