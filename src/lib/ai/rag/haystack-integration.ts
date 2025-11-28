/**
 * ICARUS v5.0 - Haystack Integration for Regulatory RAG
 * 
 * Integração com Haystack para RAG especializado em documentação regulatória.
 * Complementa o sistema existente (pgvector + LangChain) com pipelines
 * otimizados para documentos ANVISA, RDC, ISO e normas técnicas.
 * 
 * Funcionalidades:
 * - Pipeline de indexação de documentos regulatórios
 * - Busca híbrida (BM25 + Semantic)
 * - Reranking com Cross-Encoder
 * - Geração de respostas com citações
 * - Cache de documentos frequentes
 * 
 * @version 1.0.0
 * @author ICARUS AI Team
 */

import { logger } from '@/lib/utils/logger'
import { cacheManager } from '@/lib/cache'

// ============ TIPOS ============

export interface HaystackConfig {
  apiUrl: string
  apiKey?: string
  documentStore: 'elasticsearch' | 'opensearch' | 'qdrant' | 'pinecone'
  embeddingModel: string
  rerankerModel?: string
  topK: number
  hybridWeight?: number // 0 = BM25 only, 1 = Semantic only
}

export interface RegulatoryDocument {
  id: string
  content: string
  metadata: RegulatoryMetadata
  embedding?: number[]
}

export interface RegulatoryMetadata {
  documentType: RegulatoryDocumentType
  documentNumber: string
  title: string
  publishDate: string
  effectiveDate?: string
  expirationDate?: string
  issuer: string
  category: string[]
  keywords: string[]
  version?: string
  status: 'active' | 'revoked' | 'superseded'
  supersededBy?: string
  relatedDocuments?: string[]
  sourceUrl?: string
}

export type RegulatoryDocumentType = 
  | 'rdc'           // Resolução da Diretoria Colegiada
  | 'in'            // Instrução Normativa
  | 'portaria'      // Portaria
  | 'iso'           // Norma ISO
  | 'abnt'          // Norma ABNT
  | 'manual'        // Manual técnico
  | 'guia'          // Guia de orientação
  | 'parecer'       // Parecer técnico
  | 'nota_tecnica'  // Nota técnica

export interface SearchQuery {
  query: string
  filters?: SearchFilters
  topK?: number
  useHybrid?: boolean
  useReranker?: boolean
}

export interface SearchFilters {
  documentTypes?: RegulatoryDocumentType[]
  issuers?: string[]
  categories?: string[]
  dateRange?: {
    start: string
    end: string
  }
  status?: ('active' | 'revoked' | 'superseded')[]
}

export interface SearchResult {
  document: RegulatoryDocument
  score: number
  highlights?: string[]
  explanation?: string
}

export interface RAGResponse {
  answer: string
  sources: SearchResult[]
  citations: Citation[]
  confidence: number
  processingTime: number
}

export interface Citation {
  text: string
  documentId: string
  documentTitle: string
  documentNumber: string
  section?: string
}

export interface IndexingResult {
  success: boolean
  documentsIndexed: number
  errors: string[]
  duration: number
}

// ============ CONFIGURAÇÃO ============

const DEFAULT_CONFIG: HaystackConfig = {
  apiUrl: import.meta.env.VITE_HAYSTACK_API_URL || 'http://localhost:8000',
  apiKey: import.meta.env.VITE_HAYSTACK_API_KEY,
  documentStore: 'qdrant',
  embeddingModel: 'sentence-transformers/paraphrase-multilingual-mpnet-base-v2',
  rerankerModel: 'cross-encoder/ms-marco-MiniLM-L-12-v2',
  topK: 10,
  hybridWeight: 0.7, // 70% semântico, 30% BM25
}

// Templates de prompt para RAG regulatório
const REGULATORY_PROMPT_TEMPLATE = `
Você é um especialista em regulamentação ANVISA e normas técnicas para dispositivos médicos OPME.
Com base nos documentos fornecidos, responda à pergunta de forma precisa e cite as fontes.

Documentos de referência:
{context}

Pergunta: {query}

Instruções:
1. Responda com base APENAS nos documentos fornecidos
2. Cite o número do documento (ex: RDC 751/2022) quando mencionar informações específicas
3. Se a informação não estiver nos documentos, diga claramente
4. Use linguagem técnica apropriada para o setor de saúde
5. Destaque requisitos obrigatórios vs recomendações

Resposta:
`

// ============ CLASSE PRINCIPAL ============

class HaystackRAGService {
  private config: HaystackConfig
  private isConnected = false

  constructor(config: HaystackConfig = DEFAULT_CONFIG) {
    this.config = config
  }

  /**
   * Verifica conexão com o serviço Haystack
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiUrl}/health`, {
        headers: this.getHeaders(),
      })
      
      this.isConnected = response.ok
      logger.info('Haystack connection status:', { connected: this.isConnected })
      
      return this.isConnected
    } catch (error) {
      logger.error('Haystack connection failed:', error)
      this.isConnected = false
      return false
    }
  }

  /**
   * Headers para requisições
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`
    }
    
    return headers
  }

  /**
   * Indexa documentos regulatórios
   */
  async indexDocuments(documents: RegulatoryDocument[]): Promise<IndexingResult> {
    const startTime = Date.now()
    const errors: string[] = []
    let indexed = 0

    try {
      // Preparar documentos para indexação
      const preparedDocs = documents.map(doc => ({
        id: doc.id,
        content: doc.content,
        meta: {
          ...doc.metadata,
          content_type: 'regulatory',
        },
      }))

      // Enviar para Haystack em batches
      const batchSize = 50
      for (let i = 0; i < preparedDocs.length; i += batchSize) {
        const batch = preparedDocs.slice(i, i + batchSize)
        
        const response = await fetch(`${this.config.apiUrl}/documents`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ documents: batch }),
        })

        if (response.ok) {
          indexed += batch.length
        } else {
          const error = await response.text()
          errors.push(`Batch ${i / batchSize}: ${error}`)
        }
      }

      logger.info('Documents indexed', { indexed, total: documents.length })

      return {
        success: errors.length === 0,
        documentsIndexed: indexed,
        errors,
        duration: Date.now() - startTime,
      }
    } catch (error) {
      logger.error('Indexing failed:', error)
      return {
        success: false,
        documentsIndexed: indexed,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        duration: Date.now() - startTime,
      }
    }
  }

  /**
   * Busca documentos regulatórios
   */
  async search(searchQuery: SearchQuery): Promise<SearchResult[]> {
    const { query, filters, topK = this.config.topK, useHybrid = true, useReranker = true } = searchQuery

    // Verificar cache
    const cacheKey = JSON.stringify({ query, filters, topK })
    const cached = await cacheManager.get<SearchResult[]>('search_result', cacheKey)
    if (cached) {
      logger.debug('Search cache hit')
      return cached
    }

    try {
      // Construir filtros para Haystack
      const haystackFilters = this.buildFilters(filters)

      // Pipeline de busca
      const pipeline = useHybrid ? 'hybrid_search' : 'semantic_search'
      
      const response = await fetch(`${this.config.apiUrl}/query`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          pipeline,
          params: {
            Retriever: {
              top_k: useReranker ? topK * 2 : topK, // Buscar mais se vai rerankar
              filters: haystackFilters,
            },
            ...(useReranker && {
              Reranker: {
                top_k: topK,
              },
            }),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Mapear resultados
      const results: SearchResult[] = data.documents.map((doc: any) => ({
        document: {
          id: doc.id,
          content: doc.content,
          metadata: doc.meta,
        },
        score: doc.score,
        highlights: this.extractHighlights(doc.content, query),
      }))

      // Cachear resultados
      await cacheManager.set('search_result', cacheKey, results, 300) // 5 minutos

      return results
    } catch (error) {
      logger.error('Search failed:', error)
      
      // Fallback para busca local simplificada
      return this.fallbackSearch(query, filters, topK)
    }
  }

  /**
   * Gera resposta RAG com citações
   */
  async generateAnswer(query: string, filters?: SearchFilters): Promise<RAGResponse> {
    const startTime = Date.now()

    try {
      // Buscar documentos relevantes
      const searchResults = await this.search({
        query,
        filters,
        topK: 5,
        useHybrid: true,
        useReranker: true,
      })

      if (searchResults.length === 0) {
        return {
          answer: 'Não foram encontrados documentos regulatórios relevantes para esta consulta.',
          sources: [],
          citations: [],
          confidence: 0,
          processingTime: Date.now() - startTime,
        }
      }

      // Construir contexto
      const context = searchResults
        .map((r, i) => `[${i + 1}] ${r.document.metadata.documentNumber} - ${r.document.metadata.title}:\n${r.document.content.substring(0, 1000)}...`)
        .join('\n\n')

      // Gerar resposta via Haystack Generator
      const response = await fetch(`${this.config.apiUrl}/generate`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          query,
          context,
          prompt_template: REGULATORY_PROMPT_TEMPLATE,
        }),
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Extrair citações da resposta
      const citations = this.extractCitations(data.answer, searchResults)

      // Calcular confiança baseada nos scores
      const avgScore = searchResults.reduce((sum, r) => sum + r.score, 0) / searchResults.length
      const confidence = Math.min(avgScore * 1.2, 1) // Normalizar para 0-1

      return {
        answer: data.answer,
        sources: searchResults,
        citations,
        confidence,
        processingTime: Date.now() - startTime,
      }
    } catch (error) {
      logger.error('RAG generation failed:', error)
      
      // Fallback: retornar documentos sem geração
      const searchResults = await this.search({ query, filters, topK: 3 })
      
      return {
        answer: `Encontrei ${searchResults.length} documentos relevantes. Por favor, consulte as fontes abaixo.`,
        sources: searchResults,
        citations: [],
        confidence: 0.3,
        processingTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Constrói filtros para Haystack
   */
  private buildFilters(filters?: SearchFilters): Record<string, any> | undefined {
    if (!filters) return undefined

    const haystackFilters: Record<string, any> = {}

    if (filters.documentTypes?.length) {
      haystackFilters['documentType'] = { '$in': filters.documentTypes }
    }

    if (filters.issuers?.length) {
      haystackFilters['issuer'] = { '$in': filters.issuers }
    }

    if (filters.status?.length) {
      haystackFilters['status'] = { '$in': filters.status }
    }

    if (filters.dateRange) {
      haystackFilters['publishDate'] = {
        '$gte': filters.dateRange.start,
        '$lte': filters.dateRange.end,
      }
    }

    return Object.keys(haystackFilters).length > 0 ? haystackFilters : undefined
  }

  /**
   * Extrai highlights do conteúdo
   */
  private extractHighlights(content: string, query: string): string[] {
    const words = query.toLowerCase().split(/\s+/)
    const sentences = content.split(/[.!?]+/)
    
    return sentences
      .filter(sentence => 
        words.some(word => sentence.toLowerCase().includes(word))
      )
      .slice(0, 3)
      .map(s => s.trim())
  }

  /**
   * Extrai citações da resposta
   */
  private extractCitations(answer: string, sources: SearchResult[]): Citation[] {
    const citations: Citation[] = []
    
    // Regex para encontrar referências a documentos (ex: RDC 751/2022)
    const docRefRegex = /(RDC|IN|Portaria|ISO|ABNT)\s*(?:N[º°]?\s*)?\d+(?:\/\d{4})?/gi
    const matches = answer.match(docRefRegex) || []

    for (const match of matches) {
      const source = sources.find(s => 
        s.document.metadata.documentNumber.toLowerCase().includes(match.toLowerCase())
      )

      if (source) {
        citations.push({
          text: match,
          documentId: source.document.id,
          documentTitle: source.document.metadata.title,
          documentNumber: source.document.metadata.documentNumber,
        })
      }
    }

    return citations
  }

  /**
   * Busca local como fallback
   */
  private async fallbackSearch(
    query: string,
    filters?: SearchFilters,
    topK = 5
  ): Promise<SearchResult[]> {
    logger.warn('Using fallback search')
    
    // Implementação simplificada usando busca local
    // Em produção, isso deve usar o pgvector existente
    return []
  }
}

// ============ INSTÂNCIA SINGLETON ============

export const haystackRAG = new HaystackRAGService()

// ============ HOOK REACT ============

import { useState, useCallback } from 'react'

export interface UseHaystackRAGReturn {
  search: (query: SearchQuery) => Promise<SearchResult[]>
  generateAnswer: (query: string, filters?: SearchFilters) => Promise<RAGResponse>
  indexDocuments: (documents: RegulatoryDocument[]) => Promise<IndexingResult>
  isConnected: boolean
  isLoading: boolean
  error: string | null
  checkConnection: () => Promise<boolean>
}

export function useHaystackRAG(): UseHaystackRAGReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkConnection = useCallback(async () => {
    const connected = await haystackRAG.checkConnection()
    setIsConnected(connected)
    return connected
  }, [])

  const search = useCallback(async (query: SearchQuery) => {
    setIsLoading(true)
    setError(null)
    try {
      return await haystackRAG.search(query)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const generateAnswer = useCallback(async (query: string, filters?: SearchFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      return await haystackRAG.generateAnswer(query, filters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
      return {
        answer: 'Erro ao gerar resposta',
        sources: [],
        citations: [],
        confidence: 0,
        processingTime: 0,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const indexDocuments = useCallback(async (documents: RegulatoryDocument[]) => {
    setIsLoading(true)
    setError(null)
    try {
      return await haystackRAG.indexDocuments(documents)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Indexing failed')
      return {
        success: false,
        documentsIndexed: 0,
        errors: [err instanceof Error ? err.message : 'Unknown error'],
        duration: 0,
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    search,
    generateAnswer,
    indexDocuments,
    isConnected,
    isLoading,
    error,
    checkConnection,
  }
}

// ============ DOCUMENTOS REGULATÓRIOS PRÉ-DEFINIDOS ============

export const REGULATORY_DOCUMENTS_CATALOG: Partial<RegulatoryDocument>[] = [
  {
    id: 'rdc-751-2022',
    metadata: {
      documentType: 'rdc',
      documentNumber: 'RDC 751/2022',
      title: 'Classificação de Risco, Regimes de Notificação e Registro de Dispositivos Médicos',
      publishDate: '2022-09-15',
      effectiveDate: '2023-03-15',
      issuer: 'ANVISA',
      category: ['dispositivos_medicos', 'registro', 'classificacao'],
      keywords: ['dispositivo médico', 'registro', 'notificação', 'classe de risco'],
      status: 'active',
    },
  },
  {
    id: 'rdc-59-2000',
    metadata: {
      documentType: 'rdc',
      documentNumber: 'RDC 59/2000',
      title: 'Boas Práticas de Fabricação para Estabelecimentos de Produtos para Saúde',
      publishDate: '2000-06-27',
      issuer: 'ANVISA',
      category: ['bpf', 'fabricacao', 'qualidade'],
      keywords: ['BPF', 'fabricação', 'qualidade', 'controle'],
      status: 'active',
    },
  },
  {
    id: 'rdc-16-2013',
    metadata: {
      documentType: 'rdc',
      documentNumber: 'RDC 16/2013',
      title: 'Boas Práticas de Fabricação de Produtos Médicos e Produtos para Diagnóstico de Uso In Vitro',
      publishDate: '2013-04-01',
      issuer: 'ANVISA',
      category: ['bpf', 'fabricacao', 'qualidade'],
      keywords: ['BPF', 'fabricação', 'qualidade', 'ISO 13485'],
      status: 'active',
    },
  },
  {
    id: 'iso-13485-2016',
    metadata: {
      documentType: 'iso',
      documentNumber: 'ISO 13485:2016',
      title: 'Medical devices — Quality management systems — Requirements for regulatory purposes',
      publishDate: '2016-03-01',
      issuer: 'ISO',
      category: ['qualidade', 'sgq', 'dispositivos_medicos'],
      keywords: ['SGQ', 'qualidade', 'dispositivo médico', 'regulatório'],
      status: 'active',
    },
  },
  {
    id: 'iso-42001-2023',
    metadata: {
      documentType: 'iso',
      documentNumber: 'ISO/IEC 42001:2023',
      title: 'Artificial intelligence — Management system',
      publishDate: '2023-12-18',
      issuer: 'ISO',
      category: ['ia', 'sgq', 'gestao'],
      keywords: ['IA', 'inteligência artificial', 'gestão', 'AIMS'],
      status: 'active',
    },
  },
]

// ============ EXPORTS ============

export default {
  haystackRAG,
  useHaystackRAG,
  REGULATORY_DOCUMENTS_CATALOG,
}

