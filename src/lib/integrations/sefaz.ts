/**
 * ICARUS v5.0 - SEFAZ Integration
 * NF-e emission, certificate management, and fiscal operations
 */

import { supabase } from '@/lib/supabase/client';
import type {
  NFe,
  NFeResponse,
  SefazContingencia,
  IntegrationHealth,
} from './types';

export function isSefazConfigured(): boolean {
  // SEFAZ is configured via company data in Supabase
  return true;
}

/**
 * SEFAZ NF-e Client
 * Note: Actual SEFAZ communication must be done via Edge Functions
 * due to certificate handling and XML signing requirements
 */
export class SefazClient {
  private empresaId: string;

  constructor(empresaId: string) {
    this.empresaId = empresaId;
  }

  // =========================================================================
  // CERTIFICATE MANAGEMENT
  // =========================================================================

  /**
   * Upload digital certificate
   */
  async uploadCertificate(
    file: File,
    senha: string
  ): Promise<{ valid: boolean; expiresAt: Date; subject: string }> {
    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(
      new Uint8Array(arrayBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ''
      )
    );

    // Validate and store via Edge Function
    const { data, error } = await supabase.functions.invoke('sefaz-certificate', {
      body: {
        action: 'upload',
        empresaId: this.empresaId,
        certificate: base64,
        password: senha,
      },
    });

    if (error || !data?.valid) {
      throw new Error(data?.error ?? 'Invalid certificate');
    }

    return {
      valid: data.valid,
      expiresAt: new Date(data.expiresAt),
      subject: data.subject,
    };
  }

  /**
   * Get certificate info
   */
  async getCertificateInfo(): Promise<{
    exists: boolean;
    expiresAt?: Date;
    daysUntilExpiry?: number;
    subject?: string;
    issuer?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('sefaz-certificate', {
      body: {
        action: 'info',
        empresaId: this.empresaId,
      },
    });

    if (error || !data?.exists) {
      return { exists: false };
    }

    const expiresAt = new Date(data.expiresAt);
    const daysUntilExpiry = Math.floor(
      (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
      exists: true,
      expiresAt,
      daysUntilExpiry,
      subject: data.subject,
      issuer: data.issuer,
    };
  }

  /**
   * Validate certificate password
   */
  async validateCertificatePassword(senha: string): Promise<boolean> {
    const { data, error } = await supabase.functions.invoke('sefaz-certificate', {
      body: {
        action: 'validate_password',
        empresaId: this.empresaId,
        password: senha,
      },
    });

    return !error && data?.valid === true;
  }

  // =========================================================================
  // NF-e OPERATIONS
  // =========================================================================

  /**
   * Emit NF-e
   */
  async emitirNFe(nfe: NFe): Promise<NFeResponse> {
    const { data, error } = await supabase.functions.invoke('sefaz-nfe', {
      body: {
        action: 'emitir',
        empresaId: this.empresaId,
        nfe,
      },
    });

    if (error) {
      return {
        success: false,
        motivo: error.message,
      };
    }

    // Store XML and generate DANFE if authorized
    if (data.success && data.xml) {
      await this.storeNFeXml(data.chave, data.xml);
      if (data.danfeUrl) {
        await this.updateNFeDanfe(data.chave, data.danfeUrl);
      }
    }

    return {
      success: data.success,
      chave: data.chave,
      protocolo: data.protocolo,
      dataAutorizacao: data.dataAutorizacao
        ? new Date(data.dataAutorizacao)
        : undefined,
      codigoStatus: data.codigoStatus,
      motivo: data.motivo,
      xml: data.xml,
      danfeUrl: data.danfeUrl,
    };
  }

  /**
   * Cancel NF-e
   */
  async cancelarNFe(
    chaveAcesso: string,
    justificativa: string
  ): Promise<NFeResponse> {
    // Validate deadline (24h)
    const { data: nfeData } = await supabase
      .from('nfes')
      .select('data_emissao')
      .eq('chave_acesso', chaveAcesso)
      .single();

    if (nfeData) {
      const emissionDate = new Date(nfeData.data_emissao);
      const hoursSinceEmission =
        (Date.now() - emissionDate.getTime()) / (1000 * 60 * 60);

      if (hoursSinceEmission > 24) {
        return {
          success: false,
          motivo: 'Prazo de 24 horas para cancelamento excedido',
        };
      }
    }

    const { data, error } = await supabase.functions.invoke('sefaz-nfe', {
      body: {
        action: 'cancelar',
        empresaId: this.empresaId,
        chaveAcesso,
        justificativa,
      },
    });

    if (error) {
      return {
        success: false,
        motivo: error.message,
      };
    }

    return {
      success: data.success,
      protocolo: data.protocolo,
      codigoStatus: data.codigoStatus,
      motivo: data.motivo,
    };
  }

  /**
   * Issue Correction Letter (CC-e)
   */
  async emitirCartaCorrecao(
    chaveAcesso: string,
    correcao: string,
    sequencia?: number
  ): Promise<NFeResponse> {
    const { data, error } = await supabase.functions.invoke('sefaz-nfe', {
      body: {
        action: 'carta_correcao',
        empresaId: this.empresaId,
        chaveAcesso,
        correcao,
        sequencia,
      },
    });

    if (error) {
      return {
        success: false,
        motivo: error.message,
      };
    }

    return {
      success: data.success,
      protocolo: data.protocolo,
      codigoStatus: data.codigoStatus,
      motivo: data.motivo,
    };
  }

  /**
   * Query NF-e status
   */
  async consultarNFe(chaveAcesso: string): Promise<{
    status: string;
    dataRecebimento?: Date;
    protocoloAutorizacao?: string;
    xml?: string;
  }> {
    const { data, error } = await supabase.functions.invoke('sefaz-nfe', {
      body: {
        action: 'consultar',
        empresaId: this.empresaId,
        chaveAcesso,
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      status: data.status,
      dataRecebimento: data.dataRecebimento
        ? new Date(data.dataRecebimento)
        : undefined,
      protocoloAutorizacao: data.protocoloAutorizacao,
      xml: data.xml,
    };
  }

  /**
   * Check SEFAZ service status
   */
  async consultarStatusServico(uf: string): Promise<{
    online: boolean;
    status: string;
    motivo?: string;
    tempoMedio?: number;
  }> {
    const { data, error } = await supabase.functions.invoke('sefaz-nfe', {
      body: {
        action: 'status_servico',
        uf,
      },
    });

    if (error) {
      return {
        online: false,
        status: 'ERROR',
        motivo: error.message,
      };
    }

    return {
      online: data.status === '107', // Serviço em Operação
      status: data.status,
      motivo: data.motivo,
      tempoMedio: data.tempoMedio,
    };
  }

  // =========================================================================
  // CONTINGENCY MODE
  // =========================================================================

  /**
   * Get contingency status
   */
  async getContingencyStatus(): Promise<SefazContingencia> {
    const { data } = await supabase
      .from('sefaz_contingencia')
      .select('*')
      .eq('empresa_id', this.empresaId)
      .eq('ativa', true)
      .single();

    if (!data) {
      return { ativa: false };
    }

    return {
      ativa: true,
      tipo: data.tipo as SefazContingencia['tipo'],
      motivo: data.motivo,
      dataInicio: new Date(data.data_inicio),
    };
  }

  /**
   * Enable contingency mode
   */
  async enableContingency(
    tipo: 'SVC-AN' | 'SVC-RS' | 'DPEC' | 'FS-DA',
    motivo: string
  ): Promise<void> {
    await supabase.from('sefaz_contingencia').upsert({
      empresa_id: this.empresaId,
      ativa: true,
      tipo,
      motivo,
      data_inicio: new Date().toISOString(),
    });
  }

  /**
   * Disable contingency mode
   */
  async disableContingency(): Promise<void> {
    await supabase
      .from('sefaz_contingencia')
      .update({
        ativa: false,
        data_fim: new Date().toISOString(),
      })
      .eq('empresa_id', this.empresaId)
      .eq('ativa', true);
  }

  // =========================================================================
  // XML STORAGE
  // =========================================================================

  /**
   * Store NF-e XML
   */
  private async storeNFeXml(chaveAcesso: string, xml: string): Promise<void> {
    const path = `nfes/${this.empresaId}/${chaveAcesso}.xml`;

    await supabase.storage.from('nfes').upload(path, xml, {
      contentType: 'application/xml',
      upsert: true,
    });
  }

  /**
   * Get NF-e XML
   */
  async getNFeXml(chaveAcesso: string): Promise<string | null> {
    const path = `nfes/${this.empresaId}/${chaveAcesso}.xml`;

    const { data, error } = await supabase.storage.from('nfes').download(path);

    if (error || !data) {
      return null;
    }

    return await data.text();
  }

  /**
   * Update NF-e with DANFE URL
   */
  private async updateNFeDanfe(
    chaveAcesso: string,
    danfeUrl: string
  ): Promise<void> {
    await supabase
      .from('nfes')
      .update({ danfe_url: danfeUrl })
      .eq('chave_acesso', chaveAcesso);
  }

  /**
   * Generate DANFE PDF
   */
  async generateDanfe(chaveAcesso: string): Promise<string | null> {
    const { data, error } = await supabase.functions.invoke('sefaz-danfe', {
      body: {
        empresaId: this.empresaId,
        chaveAcesso,
      },
    });

    if (error || !data?.url) {
      return null;
    }

    return data.url;
  }

  // =========================================================================
  // NFE LISTING & STATISTICS
  // =========================================================================

  /**
   * Get NF-e list
   */
  async listNFes(options?: {
    status?: string;
    dataInicio?: Date;
    dataFim?: Date;
    page?: number;
    pageSize?: number;
  }): Promise<{
    nfes: Array<{
      id: string;
      numero: number;
      serie: number;
      chaveAcesso: string;
      status: string;
      dataEmissao: Date;
      valor: number;
      destinatario: string;
    }>;
    total: number;
  }> {
    let query = supabase
      .from('nfes')
      .select('*', { count: 'exact' })
      .eq('empresa_id', this.empresaId)
      .order('data_emissao', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.dataInicio) {
      query = query.gte('data_emissao', options.dataInicio.toISOString());
    }
    if (options?.dataFim) {
      query = query.lte('data_emissao', options.dataFim.toISOString());
    }

    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data, error, count } = await query;

    if (error || !data) {
      return { nfes: [], total: 0 };
    }

    return {
      nfes: data.map((nfe) => ({
        id: nfe.id,
        numero: nfe.numero_nfe,
        serie: nfe.serie,
        chaveAcesso: nfe.chave_acesso,
        status: nfe.status,
        dataEmissao: new Date(nfe.data_emissao),
        valor: nfe.valor_total,
        destinatario: nfe.destinatario_nome,
      })),
      total: count ?? 0,
    };
  }

  /**
   * Get NF-e statistics
   */
  async getStatistics(periodo?: { inicio: Date; fim: Date }): Promise<{
    total: number;
    autorizadas: number;
    canceladas: number;
    rejeitadas: number;
    valorTotal: number;
  }> {
    let query = supabase
      .from('nfes')
      .select('status, valor_total')
      .eq('empresa_id', this.empresaId);

    if (periodo) {
      query = query
        .gte('data_emissao', periodo.inicio.toISOString())
        .lte('data_emissao', periodo.fim.toISOString());
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        total: 0,
        autorizadas: 0,
        canceladas: 0,
        rejeitadas: 0,
        valorTotal: 0,
      };
    }

    return {
      total: data.length,
      autorizadas: data.filter((n) => n.status === 'autorizada').length,
      canceladas: data.filter((n) => n.status === 'cancelada').length,
      rejeitadas: data.filter((n) => n.status === 'rejeitada').length,
      valorTotal: data
        .filter((n) => n.status === 'autorizada')
        .reduce((sum, n) => sum + (n.valor_total ?? 0), 0),
    };
  }

  // =========================================================================
  // HEALTH CHECK
  // =========================================================================

  /**
   * Check integration health
   */
  async checkHealth(): Promise<IntegrationHealth> {
    try {
      // Check certificate
      const certInfo = await this.getCertificateInfo();

      if (!certInfo.exists) {
        return {
          name: 'SEFAZ (NF-e)',
          status: 'disconnected',
          errorMessage: 'Digital certificate not configured',
        };
      }

      // Check expiration
      if (certInfo.daysUntilExpiry !== undefined) {
        if (certInfo.daysUntilExpiry <= 0) {
          return {
            name: 'SEFAZ (NF-e)',
            status: 'error',
            errorMessage: 'Digital certificate expired',
            expiresAt: certInfo.expiresAt,
            daysUntilExpiry: certInfo.daysUntilExpiry,
          };
        }

        if (certInfo.daysUntilExpiry <= 7) {
          return {
            name: 'SEFAZ (NF-e)',
            status: 'expiring',
            expiresAt: certInfo.expiresAt,
            daysUntilExpiry: certInfo.daysUntilExpiry,
          };
        }
      }

      // Check SEFAZ service status
      const { data: empresa } = await supabase
        .from('empresas')
        .select('uf')
        .eq('id', this.empresaId)
        .single();

      if (empresa?.uf) {
        const serviceStatus = await this.consultarStatusServico(empresa.uf);

        if (!serviceStatus.online) {
          // Check if in contingency mode
          const contingency = await this.getContingencyStatus();

          return {
            name: 'SEFAZ (NF-e)',
            status: contingency.ativa ? 'connected' : 'error',
            errorMessage: contingency.ativa
              ? `Contingency mode active: ${contingency.tipo}`
              : 'SEFAZ service offline',
            lastSync: new Date(),
          };
        }
      }

      return {
        name: 'SEFAZ (NF-e)',
        status: 'connected',
        lastSync: new Date(),
        expiresAt: certInfo.expiresAt,
        daysUntilExpiry: certInfo.daysUntilExpiry,
      };
    } catch (error) {
      return {
        name: 'SEFAZ (NF-e)',
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

/**
 * Create SEFAZ client for empresa
 */
export function createSefazClient(empresaId: string): SefazClient {
  return new SefazClient(empresaId);
}
