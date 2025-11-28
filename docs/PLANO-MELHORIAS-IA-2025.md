# 🚀 ICARUS v5.0 - Plano de Melhorias IA 2025

**Baseado em:** Análise completa do repositório  
**Data:** Novembro 2025  
**Status:** Em Implementação  
**Estimativa MVP 100%:** 4-6 semanas

---

## 📊 Estado Atual (70% Completo)

### Módulos de IA Implementados

| Módulo | Status | Ferramentas | Pontos Fortes | Gaps |
|--------|--------|-------------|---------------|------|
| **Estoque IA** | ✅ 80% | pgvector, RAG | Rastreabilidade RDC 59, 200+ itens | Falta alertas real-time |
| **Cirurgias** | ✅ 75% | LangGraph, Claude | Análise preditiva | Sem wearables |
| **Financeiro** | ✅ 70% | RAG, NF-e extraction | Validação Zod | Sem boletos internacionais |
| **IcarusBrain** | ✅ 85% | Multi-agent, Memory | Orquestração cross-módulo | Fallback subotimizado |
| **Produtos OPME** | ✅ 90% | pgvector, embeddings | 200+ itens RDC 751 | UI sem Motion |
| **Faturamento** | ✅ 65% | Claude Vision, OCR | Serverless Edge Functions | Sem ERPs |

### Stack Atual

```yaml
Frontend: React 18.3 + TypeScript + Vite
Backend: Supabase Edge Functions (Deno/TS)
Database: PostgreSQL + pgvector (1536 dims)
LLMs: 
  - Claude 3.5 Sonnet (raciocínio regulatório)
  - GPT-4o (embeddings, vision)
RAG: LangChain 0.3.1 + LangGraph 0.2.5
Validação: Zod
Deploy: Vercel + GitHub Actions
```

---

## 🎯 Plano de Implementação por Fases

### FASE 1: Conformidade & Estabilidade (Semanas 1-2)

#### 1.1 ISO 42001 AIMS (AI Management System)

```typescript
// src/lib/compliance/aims-framework.ts
export interface AIManagementSystem {
  // Gestão de Riscos IA (NIST AI RMF)
  riskAssessment: {
    biasMetrics: BiasEvaluation[]
    safetyChecks: SafetyCheck[]
    regulatoryCompliance: ComplianceStatus
  }
  
  // Auditoria Automática
  audit: {
    modelVersions: ModelVersion[]
    decisionLogs: DecisionLog[]
    performanceMetrics: PerformanceMetric[]
  }
  
  // PCCP (Predetermined Change Control Plan)
  changeControl: {
    plannedChanges: PlannedChange[]
    impactAssessment: ImpactAssessment
    rollbackPlan: RollbackPlan
  }
}
```

**Entregáveis:**
- [ ] Framework AIMS integrado ao sistema
- [ ] Dashboard de conformidade IA
- [ ] Logs de auditoria para FDA/ANVISA
- [ ] PCCP para updates de modelos

#### 1.2 Cobertura de Testes 90%+

```bash
# Estrutura de testes
tests/
├── unit/
│   ├── hooks/
│   │   ├── useIcarusBrain.test.ts
│   │   ├── useLangChainTools.test.ts
│   │   └── useAnvisa.test.ts
│   └── lib/
│       ├── validators.test.ts
│       └── compliance.test.ts
├── integration/
│   ├── agents/
│   │   ├── estoque-agent.test.ts
│   │   └── cirurgias-agent.test.ts
│   └── edge-functions/
│       ├── langchain-agent.test.ts
│       └── semantic-search.test.ts
└── e2e/
    ├── regulatory-flows.spec.ts
    ├── anvisa-validation.spec.ts
    └── cirurgia-workflow.spec.ts
```

**Entregáveis:**
- [ ] Testes unitários para todos os hooks de IA
- [ ] Testes de integração para Edge Functions
- [ ] E2E Playwright para fluxos regulatórios
- [ ] Coverage report automatizado no CI

#### 1.3 Multi-LLM Fallback

```typescript
// src/lib/ai/llm-orchestrator.ts
export class LLMOrchestrator {
  private providers = [
    { name: 'claude', priority: 1, model: 'claude-3-5-sonnet-20241022' },
    { name: 'openai', priority: 2, model: 'gpt-4o' },
    { name: 'openai-mini', priority: 3, model: 'gpt-4o-mini' }
  ]

  async invoke(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
    for (const provider of this.providers) {
      try {
        const response = await this.callProvider(provider, prompt, options)
        if (response.success) return response
      } catch (error) {
        logger.warn(`Provider ${provider.name} failed, trying next...`)
        continue
      }
    }
    throw new Error('All LLM providers failed')
  }
}
```

**Entregáveis:**
- [ ] LLMOrchestrator com fallback automático
- [ ] Health checks para cada provider
- [ ] Métricas de latência e custo por provider
- [ ] Rate limiting por provider

---

### FASE 2: Escalabilidade & UX (Semanas 2-3)

#### 2.1 Skeletons Neumórficos + Motion

```typescript
// src/components/ui/NeomorphicSkeleton.tsx
import { motion } from 'framer-motion'
import { useTheme } from '@/hooks/useTheme'

export function NeomorphicSkeleton({ 
  width, 
  height, 
  variant = 'card' 
}: SkeletonProps) {
  const { isDark } = useTheme()
  
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ 
        opacity: [0.5, 0.8, 0.5],
        boxShadow: isDark 
          ? ['8px 8px 16px rgba(0,0,0,0.4)', '12px 12px 24px rgba(0,0,0,0.5)', '8px 8px 16px rgba(0,0,0,0.4)']
          : ['6px 6px 12px rgba(0,0,0,0.08)', '8px 8px 16px rgba(0,0,0,0.1)', '6px 6px 12px rgba(0,0,0,0.08)']
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={cn(
        'rounded-2xl',
        isDark ? 'bg-[#1A1F35]' : 'bg-slate-100'
      )}
      style={{ width, height }}
    />
  )
}
```

**Entregáveis:**
- [ ] NeomorphicSkeleton para todos os loadings
- [ ] Motion variants para dashboards
- [ ] Stagger animations para listas
- [ ] Page transitions suaves

#### 2.2 Otimização pgvector (HNSW)

```sql
-- Migração para índice HNSW (melhor para >10k vetores)
-- supabase/migrations/20251128_hnsw_index.sql

-- Criar índice HNSW para busca aproximada
CREATE INDEX IF NOT EXISTS opme_produtos_embedding_hnsw_idx 
ON opme_produtos 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- Configurar parâmetros de busca
SET hnsw.ef_search = 40;

-- Função otimizada de busca
CREATE OR REPLACE FUNCTION match_documents_hnsw(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  nome text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome,
    1 - (p.embedding <=> query_embedding) as similarity
  FROM opme_produtos p
  WHERE 1 - (p.embedding <=> query_embedding) > match_threshold
  ORDER BY p.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Entregáveis:**
- [ ] Migração para índice HNSW
- [ ] Benchmark de performance (antes/depois)
- [ ] Cache Redis para queries frequentes
- [ ] Monitoramento de latência

#### 2.3 Cache Redis para RAG

```typescript
// src/lib/cache/rag-cache.ts
import { Redis } from '@upstash/redis'

export class RAGCache {
  private redis: Redis
  private ttl = 3600 // 1 hora

  async getCachedEmbedding(text: string): Promise<number[] | null> {
    const key = `emb:${this.hashText(text)}`
    return await this.redis.get(key)
  }

  async cacheEmbedding(text: string, embedding: number[]): Promise<void> {
    const key = `emb:${this.hashText(text)}`
    await this.redis.set(key, embedding, { ex: this.ttl })
  }

  async getCachedSearch(query: string, filters: object): Promise<SearchResult[] | null> {
    const key = `search:${this.hashQuery(query, filters)}`
    return await this.redis.get(key)
  }
}
```

**Entregáveis:**
- [ ] Integração Upstash Redis
- [ ] Cache de embeddings
- [ ] Cache de buscas semânticas
- [ ] Invalidação inteligente

---

### FASE 3: Avaliação & Segurança (Semanas 3-4)

#### 3.1 RAGAS para Avaliação de RAG

```typescript
// src/lib/evaluation/ragas.ts
export interface RAGASMetrics {
  faithfulness: number      // Resposta fiel ao contexto
  answerRelevancy: number   // Relevância da resposta
  contextPrecision: number  // Precisão do contexto
  contextRecall: number     // Recall do contexto
}

export async function evaluateRAGResponse(
  question: string,
  answer: string,
  contexts: string[],
  groundTruth?: string
): Promise<RAGASMetrics> {
  // Implementação usando LLM como juiz
  const metrics = await Promise.all([
    evaluateFaithfulness(answer, contexts),
    evaluateAnswerRelevancy(question, answer),
    evaluateContextPrecision(question, contexts),
    evaluateContextRecall(question, contexts, groundTruth)
  ])

  return {
    faithfulness: metrics[0],
    answerRelevancy: metrics[1],
    contextPrecision: metrics[2],
    contextRecall: metrics[3]
  }
}
```

**Entregáveis:**
- [ ] Framework RAGAS integrado
- [ ] Dashboard de métricas de qualidade
- [ ] Alertas para degradação de qualidade
- [ ] Dataset de avaliação regulatório

#### 3.2 HITL (Human-in-the-Loop)

```typescript
// src/lib/ai/hitl-workflow.ts
export interface HITLDecision {
  id: string
  type: 'cirurgia_bloqueio' | 'anvisa_alerta' | 'estoque_critico'
  severity: 'low' | 'medium' | 'high' | 'critical'
  aiRecommendation: string
  humanRequired: boolean
  approvedBy?: string
  approvedAt?: Date
  notes?: string
}

export async function requireHumanApproval(
  decision: HITLDecision
): Promise<boolean> {
  if (decision.severity === 'critical') {
    // Sempre requer aprovação humana para decisões críticas
    await notifyApprovers(decision)
    return false // Aguarda aprovação
  }
  
  // Para decisões de menor severidade, IA pode prosseguir
  await logDecision(decision)
  return true
}
```

**Entregáveis:**
- [ ] Workflow HITL para decisões críticas
- [ ] Interface de aprovação para gestores
- [ ] Notificações em tempo real
- [ ] Audit trail completo

#### 3.3 Bias Checks em Embeddings

```typescript
// src/lib/evaluation/bias-detection.ts
export async function detectEmbeddingBias(
  embeddings: Map<string, number[]>,
  protectedAttributes: string[]
): Promise<BiasReport> {
  const report: BiasReport = {
    overallScore: 0,
    attributeScores: {},
    recommendations: []
  }

  for (const attr of protectedAttributes) {
    const score = await calculateBiasScore(embeddings, attr)
    report.attributeScores[attr] = score
    
    if (score > 0.7) {
      report.recommendations.push(
        `Alto viés detectado para "${attr}". Considere re-treinar embeddings.`
      )
    }
  }

  report.overallScore = Object.values(report.attributeScores)
    .reduce((a, b) => a + b, 0) / protectedAttributes.length

  return report
}
```

**Entregáveis:**
- [ ] Detector de viés em embeddings
- [ ] Relatório de fairness
- [ ] Alertas para viés detectado
- [ ] Documentação de mitigação

---

### FASE 4: Novas Features (Semanas 4-6)

#### 4.1 Integração Haystack para RAG Regulatório

```typescript
// src/lib/ai/haystack-integration.ts
// Alternativa/complemento ao LangChain para QA regulatória

export class HaystackRAG {
  private documentStore: InMemoryDocumentStore
  private retriever: DenseRetriever
  private reader: FARMReader

  async indexRegulatoryDocs(docs: RegulatoryDocument[]): Promise<void> {
    // Indexar RDCs, INs, e normas ANVISA
    for (const doc of docs) {
      await this.documentStore.write_documents([{
        content: doc.content,
        meta: {
          source: doc.source,
          rdc_number: doc.rdcNumber,
          effective_date: doc.effectiveDate,
          category: doc.category
        }
      }])
    }
  }

  async queryRegulation(question: string): Promise<RegulatoryAnswer> {
    const prediction = await this.pipeline.run({
      query: question,
      params: {
        Retriever: { top_k: 5 },
        Reader: { top_k: 3 }
      }
    })

    return {
      answer: prediction.answers[0].answer,
      confidence: prediction.answers[0].score,
      sources: prediction.answers[0].meta.source,
      rdcReferences: this.extractRDCReferences(prediction)
    }
  }
}
```

**Entregáveis:**
- [ ] PoC Haystack para QA regulatória
- [ ] Indexação de RDCs ANVISA
- [ ] API de consulta regulatória
- [ ] Comparativo LangChain vs Haystack

#### 4.2 Agente de Simulação RDC 59

```typescript
// supabase/functions/rdc59-simulator/index.ts
export async function simulateRDC59Compliance(
  scenario: RDC59Scenario
): Promise<ComplianceSimulation> {
  const agent = new RDC59Agent()
  
  // Simular cenário de rastreabilidade
  const simulation = await agent.run({
    produto: scenario.produto,
    lote: scenario.lote,
    movimentacoes: scenario.movimentacoes,
    checkpoints: [
      'fabricacao',
      'importacao',
      'distribuicao',
      'hospital',
      'paciente'
    ]
  })

  return {
    compliant: simulation.allChecksPassed,
    gaps: simulation.failedChecks,
    recommendations: simulation.recommendations,
    riskScore: simulation.riskScore
  }
}
```

**Entregáveis:**
- [ ] Agente de simulação RDC 59
- [ ] Interface de cenários
- [ ] Relatório de gaps de conformidade
- [ ] Recomendações automáticas

---

## 🛠️ Ferramentas Recomendadas

| Ferramenta | Tipo | Custo | Uso no ICARUS |
|------------|------|-------|---------------|
| **Haystack** | RAG Framework | Gratuito | QA regulatória ANVISA |
| **LlamaIndex** | RAG + Agents | Gratuito | Indexação catálogo OPME |
| **RAGFlow** | Engine RAG | Gratuito | Workflow visual |
| **AutoGen** | Multi-Agents | Gratuito | Coordenação de agentes |
| **Upstash Redis** | Cache | ~$10/mês | Cache RAG |
| **Weaviate** | Vector DB | Self-host | Alternativa pgvector (escala) |
| **RAGAS** | Avaliação | Gratuito | Métricas de qualidade |
| **LangSmith** | Observability | ~$20/mês | Debug de agents |

---

## 📈 Métricas de Sucesso

### KPIs Técnicos

| Métrica | Atual | Meta |
|---------|-------|------|
| Cobertura de Testes | ~40% | 90%+ |
| Latência RAG | ~2s | <500ms |
| RAGAS Faithfulness | N/A | >0.85 |
| Uptime Edge Functions | 99% | 99.9% |
| Fallback Success Rate | N/A | 99%+ |

### KPIs de Negócio

| Métrica | Atual | Meta |
|---------|-------|------|
| Conformidade ANVISA | 85% | 100% |
| Tempo de Resposta Chat | ~3s | <1s |
| Precisão Previsão Demanda | 78% | 90%+ |
| Detecção de Anomalias | Manual | Automático |

---

## 🔄 Próximos Passos Imediatos

1. **Hoje:** Implementar LLMOrchestrator com fallback
2. **Esta Semana:** Adicionar testes E2E para fluxos regulatórios
3. **Próxima Semana:** Migrar pgvector para HNSW
4. **Em 2 Semanas:** PoC Haystack para QA regulatória
5. **Em 1 Mês:** RAGAS + HITL completo

---

**Autor:** ICARUS AI Team  
**Revisado por:** Agente de Conformidade  
**Última Atualização:** Novembro 2025

