/**
 * ICARUS v5.0 - InfoSimples API Client
 * 
 * Cliente centralizado para consultas InfoSimples
 * Suporta: CNPJ, Sintegra, Suframa, ANVISA, etc.
 * 
 * @version 1.0.0
 * @author ICARUS Team
 */

// Chave da API - prioriza variável de ambiente
const INFOSIMPLES_KEY = typeof window !== 'undefined'
  ? import.meta.env.VITE_INFOSIMPLES_KEY
  : (typeof Deno !== 'undefined' ? Deno.env.get('INFOSIMPLES_API_KEY') : process.env.INFOSIMPLES_API_KEY)

const BASE_URL = 'https://api.infosimples.com/api/v2'

export interface InfoSimplesResponse<T = unknown> {
  code: number
  code_message: string
  data: T[]
  errors: string[]
  site_receipts: string[]
}

export interface InfoSimplesConfig {
  timeout?: number
  retries?: number
}

class InfoSimplesClient {
  private apiKey: string
  private config: InfoSimplesConfig

  constructor(apiKey?: string, config: InfoSimplesConfig = {}) {
    this.apiKey = apiKey || INFOSIMPLES_KEY || ''
    this.config = {
      timeout: config.timeout || 30000,
      retries: config.retries || 2
    }
  }

  private async request<T>(
    endpoint: string,
    data: Record<string, unknown>
  ): Promise<InfoSimplesResponse<T>> {
    if (!this.apiKey) {
      throw new Error('INFOSIMPLES_API_KEY não configurada')
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          token: this.apiKey
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`InfoSimples API error: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('InfoSimples API timeout')
      }
      throw error
    }
  }

  /**
   * POST genérico para qualquer endpoint
   */
  async post<T>(endpoint: string, data: Record<string, unknown>): Promise<InfoSimplesResponse<T>> {
    return this.request<T>(endpoint, data)
  }

  /**
   * Consulta CNPJ na Receita Federal
   */
  async consultaCNPJ(cnpj: string) {
    return this.request('/consultas/receita-federal/cnpj', {
      cnpj: cnpj.replace(/\D/g, '')
    })
  }

  /**
   * Consulta Sintegra
   */
  async consultaSintegra(uf: string, cnpj: string) {
    return this.request('/consultas/sintegra', {
      uf,
      cnpj: cnpj.replace(/\D/g, '')
    })
  }

  /**
   * Consulta Suframa
   */
  async consultaSuframa(inscricao: string) {
    return this.request('/consultas/suframa', {
      inscricao: inscricao.replace(/\D/g, '')
    })
  }
}

// Instância singleton
export const infosimples = new InfoSimplesClient()

// Export da classe para criar instâncias customizadas
export { InfoSimplesClient }

export default infosimples

