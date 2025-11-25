# AI/Agents Audit Checklist

> **Area:** AI (Chatbot, Embeddings, OpenAI Integration)
> **Peso:** 5%
> **Itens:** ~35

---

## 1. OpenAI Configuration

### 1.1 API Key Management
- [ ] API key em environment variable
- [ ] Nao hardcoded no codigo
- [ ] Key rotacionada periodicamente
- [ ] Key com permissoes minimas

**Verificacao:**
```bash
# Buscar API key hardcoded
grep -rn "sk-" src/ supabase/ --include="*.ts" --include="*.tsx"

# Verificar env usage
grep -r "OPENAI_API_KEY\|VITE_OPENAI" src/ --include="*.ts"
```

**Severidade:** CRITICAL (API key hardcoded = -30 pontos)

### 1.2 Model Selection
- [ ] Modelo apropriado para cada caso
- [ ] GPT-4 para tarefas complexas
- [ ] GPT-3.5 para tarefas simples
- [ ] Embeddings com text-embedding-3-small/large

### 1.3 Rate Limiting
- [ ] Rate limits respeitados
- [ ] Retry com backoff exponencial
- [ ] Queue para requests em massa
- [ ] Fallback para erros de rate limit

**Verificacao:**
```bash
# Verificar retry logic
grep -r "retry\|backoff" src/ --include="*.ts" | grep -i openai
```

---

## 2. Prompt Engineering

### 2.1 Prompt Security
- [ ] Nenhum prompt injection vulneravel
- [ ] Input sanitizado antes de prompt
- [ ] System prompt protegido
- [ ] Output validado

### 2.2 Prompt Management
- [ ] Prompts versionados
- [ ] Templates reutilizaveis
- [ ] Contexto limitado (tokens)
- [ ] Few-shot examples quando necessario

### 2.3 Context Window
- [ ] Token count monitorado
- [ ] Truncamento graceful
- [ ] Summarization para contextos longos

**Verificacao:**
```bash
# Verificar prompts
find src/ -name "*.ts" -exec grep -l "prompt\|systemMessage" {} \;
```

**Severidade:** HIGH (prompt injection vulneravel = -15 pontos)

---

## 3. Embeddings (pgvector)

### 3.1 Database Setup
- [ ] Extension pgvector instalada
- [ ] Tabela de embeddings configurada
- [ ] Indice HNSW ou IVFFlat criado
- [ ] Dimensao correta (1536 para text-embedding-3-small)

**Verificacao SQL:**
```sql
-- Verificar pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verificar tabela de embeddings
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'document_embeddings';

-- Verificar indice
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename = 'document_embeddings';
```

### 3.2 Embedding Generation
- [ ] Batch processing para muitos documentos
- [ ] Chunking de documentos longos
- [ ] Overlap entre chunks
- [ ] Metadata preservada

### 3.3 Embedding Updates
- [ ] Re-embedding automatico quando documento muda
- [ ] Versioning de embeddings
- [ ] Cleanup de embeddings orfaos

**Severidade:** MEDIUM (embeddings desatualizados = -5 pontos)

---

## 4. Similarity Search

### 4.1 Query Optimization
- [ ] Top-k appropriado
- [ ] Distance threshold definido
- [ ] Hybrid search (keywords + semantic)
- [ ] Reranking quando necessario

### 4.2 Performance
- [ ] Query < 100ms
- [ ] Indice utilizado
- [ ] Cache de queries frequentes

**Verificacao SQL:**
```sql
-- Verificar performance de similarity search
EXPLAIN ANALYZE
SELECT *
FROM document_embeddings
ORDER BY embedding <-> '[...]'::vector
LIMIT 10;
```

---

## 5. Chatbot

### 5.1 Architecture
- [ ] Streaming responses implementado
- [ ] Conversation history gerenciada
- [ ] Context window respeitado
- [ ] Fallback para erros

### 5.2 RAG (Retrieval Augmented Generation)
- [ ] Documentos relevantes buscados
- [ ] Contexto injetado no prompt
- [ ] Sources citadas na resposta
- [ ] Alucinacao minimizada

### 5.3 User Experience
- [ ] Loading states
- [ ] Error messages amigaveis
- [ ] Retry automatico
- [ ] Rate limit comunicado

**Verificacao:**
```bash
# Verificar streaming
grep -r "stream\|ReadableStream" src/ --include="*.ts" | grep -i chat
```

---

## 6. Function Calling

### 6.1 Tools Definition
- [ ] Functions bem definidas
- [ ] Parameters tipados (JSON Schema)
- [ ] Descriptions claras
- [ ] Error handling

### 6.2 Execution
- [ ] Validacao de parametros
- [ ] Permissoes verificadas
- [ ] Logging de execucoes
- [ ] Timeout configurado

**Verificacao:**
```bash
# Verificar function definitions
grep -r "functions:\|tools:" src/ --include="*.ts" | grep -i openai
```

---

## 7. Cost Monitoring

### 7.1 Usage Tracking
- [ ] Tokens contados por request
- [ ] Custo estimado calculado
- [ ] Alertas de gasto
- [ ] Dashboard de uso

### 7.2 Cost Optimization
- [ ] Modelo mais barato quando possivel
- [ ] Caching de respostas similares
- [ ] Prompt optimization (menos tokens)
- [ ] Batch requests quando possivel

### 7.3 Budgets
- [ ] Limite diario definido
- [ ] Limite mensal definido
- [ ] Alertas antes de exceder
- [ ] Auto-shutoff em emergencia

**Verificacao:**
```bash
# Verificar tracking de custo
grep -r "usage\|tokens\|cost" src/ --include="*.ts" | grep -i openai
```

**Severidade:** MEDIUM (sem monitoring de custo = -5 pontos)

---

## 8. Error Handling

### 8.1 API Errors
- [ ] Rate limit handled (429)
- [ ] Timeout handled
- [ ] Invalid request handled (400)
- [ ] Server errors handled (500)

### 8.2 Content Errors
- [ ] Content filter handled
- [ ] Token limit exceeded handled
- [ ] Invalid JSON response handled

### 8.3 Fallbacks
- [ ] Fallback model configurado
- [ ] Graceful degradation
- [ ] User notification

**Verificacao:**
```bash
# Verificar error handling
grep -r "catch\|error" src/ --include="*.ts" | grep -i openai | wc -l
```

---

## 9. Security

### 9.1 Input Validation
- [ ] User input sanitizado
- [ ] Max length enforced
- [ ] No code injection
- [ ] PII filtering (opcional)

### 9.2 Output Validation
- [ ] JSON schema validation
- [ ] Content filtering
- [ ] Length limits

### 9.3 Data Privacy
- [ ] Nao enviar PII desnecessario
- [ ] Opt-out de training data
- [ ] Logs sanitizados

**Severidade:** HIGH (PII vazando para OpenAI = -15 pontos)

---

## 10. Testing

### 10.1 Unit Tests
- [ ] Prompts testados
- [ ] Functions testados
- [ ] Error cases testados

### 10.2 Integration Tests
- [ ] Flow completo testado
- [ ] Mock da API quando necessario
- [ ] Real API em staging

### 10.3 Evaluation
- [ ] Metricas de qualidade
- [ ] A/B testing de prompts
- [ ] User feedback coletado

---

## Calculo de Score

```typescript
const aiChecks = {
  config: { weight: 20, checks: ['apiKey', 'model', 'rateLimiting'] },
  prompts: { weight: 20, checks: ['security', 'management', 'context'] },
  embeddings: { weight: 20, checks: ['setup', 'generation', 'updates'] },
  chatbot: { weight: 15, checks: ['architecture', 'rag', 'ux'] },
  cost: { weight: 15, checks: ['tracking', 'optimization', 'budgets'] },
  security: { weight: 10, checks: ['input', 'output', 'privacy'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de AI
@auditor ai

# Verificar pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

# Contar embeddings
SELECT COUNT(*) FROM document_embeddings;
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
