# Backend Audit Checklist

> **Area:** Backend (Supabase Edge Functions, APIs)
> **Peso:** 12%
> **Itens:** ~40

---

## 1. Edge Functions Structure

### 1.1 Organization
- [ ] Cada funcao em diretorio proprio
- [ ] index.ts como entry point
- [ ] Tipos definidos localmente
- [ ] README por funcao (opcional)

**Verificacao:**
```bash
# Listar edge functions
ls -la supabase/functions/

# Verificar estrutura
find supabase/functions -name "index.ts" | wc -l
```

### 1.2 Configuration
- [ ] deno.json configurado
- [ ] Import maps definidos
- [ ] Versoes fixas de dependencias

---

## 2. Error Handling

### 2.1 Try-Catch
- [ ] Todos os handlers em try-catch
- [ ] Erros logados corretamente
- [ ] Stack trace preservado (dev only)

### 2.2 Response Codes
- [ ] 200 para sucesso
- [ ] 400 para bad request
- [ ] 401 para unauthorized
- [ ] 403 para forbidden
- [ ] 404 para not found
- [ ] 500 para server error

### 2.3 Error Messages
- [ ] Mensagens amigaveis para cliente
- [ ] Detalhes tecnicos em logs
- [ ] Nenhum dado sensivel exposto

**Verificacao:**
```bash
# Verificar try-catch
grep -r "try {" supabase/functions/ --include="*.ts" | wc -l

# Verificar error handling
grep -r "catch" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** HIGH (funcao sem try-catch = -10 pontos)

---

## 3. CORS Configuration

### 3.1 Headers
- [ ] Access-Control-Allow-Origin definido
- [ ] Access-Control-Allow-Methods definido
- [ ] Access-Control-Allow-Headers definido
- [ ] Preflight (OPTIONS) tratado

### 3.2 Security
- [ ] Origin especifico (nao *)
- [ ] Methods minimos necessarios
- [ ] Credentials apenas se necessario

**Verificacao:**
```bash
# Verificar CORS headers
grep -r "Access-Control" supabase/functions/ --include="*.ts" | wc -l

# Verificar origin wildcard
grep -r "'*'" supabase/functions/ --include="*.ts" | grep -i origin
```

**Severidade:** HIGH (CORS * = -15 pontos)

---

## 4. Authentication

### 4.1 JWT Validation
- [ ] Token extraido do header
- [ ] Token validado com Supabase
- [ ] Claims verificados
- [ ] Expiracao checada

### 4.2 Authorization
- [ ] Roles verificados
- [ ] empresa_id validado
- [ ] Permissoes checadas

**Verificacao:**
```bash
# Verificar auth
grep -r "authorization" supabase/functions/ --include="*.ts" | wc -l

# Verificar getUser
grep -r "getUser" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** CRITICAL (endpoint sem auth = -30 pontos)

---

## 5. Input Validation

### 5.1 Request Body
- [ ] Schema validation (Zod)
- [ ] Tipos verificados
- [ ] Sanitizacao de strings
- [ ] Limites de tamanho

### 5.2 Query Parameters
- [ ] Parametros validados
- [ ] Tipos corretos
- [ ] Defaults definidos

### 5.3 Headers
- [ ] Content-Type verificado
- [ ] Accept headers tratados

**Verificacao:**
```bash
# Verificar Zod
grep -r "z\." supabase/functions/ --include="*.ts" | wc -l

# Verificar validacao
grep -r "parse\|safeParse" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** HIGH (input nao validado = -10 pontos)

---

## 6. Response Format

### 6.1 Consistency
- [ ] JSON estruturado
- [ ] Status codes corretos
- [ ] Headers apropriados
- [ ] Content-Type definido

### 6.2 Data Structure
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

**Verificacao:**
```bash
# Verificar Response pattern
grep -r "new Response" supabase/functions/ --include="*.ts" | wc -l
```

---

## 7. Rate Limiting

### 7.1 Configuration
- [ ] Limite por IP
- [ ] Limite por usuario
- [ ] Limite por endpoint
- [ ] Headers de rate limit

### 7.2 Storage
- [ ] Redis/KV para contagem
- [ ] TTL configurado
- [ ] Fallback se storage falhar

**Verificacao:**
```bash
# Verificar rate limiting
grep -r "rateLimit\|rate-limit" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** MEDIUM (sem rate limit = -5 pontos)

---

## 8. Logging

### 8.1 Structure
- [ ] Logs estruturados (JSON)
- [ ] Timestamp incluido
- [ ] Request ID
- [ ] User ID (se autenticado)

### 8.2 Levels
- [ ] INFO para operacoes normais
- [ ] WARN para situacoes inesperadas
- [ ] ERROR para falhas
- [ ] DEBUG apenas em dev

### 8.3 Security
- [ ] Sem dados sensiveis em logs
- [ ] Sem tokens em logs
- [ ] Sem PII em logs

**Verificacao:**
```bash
# Verificar console.log
grep -r "console\." supabase/functions/ --include="*.ts" | wc -l

# Verificar structured logging
grep -r "JSON.stringify" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** LOW (logs nao estruturados = -2 pontos)

---

## 9. Timeouts

### 9.1 Configuration
- [ ] Timeout de execucao definido
- [ ] Timeout de database
- [ ] Timeout de external APIs

### 9.2 Handling
- [ ] Graceful timeout handling
- [ ] Cleanup on timeout
- [ ] Retry logic (se aplicavel)

**Verificacao:**
```bash
# Verificar timeouts
grep -r "timeout\|AbortController" supabase/functions/ --include="*.ts" | wc -l
```

---

## 10. Environment Variables

### 10.1 Management
- [ ] Secrets em Supabase Vault
- [ ] Nao hardcoded
- [ ] Fallbacks para desenvolvimento

### 10.2 Required Variables
- [ ] SUPABASE_URL
- [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] Outras especificas da funcao

**Verificacao:**
```bash
# Verificar hardcoded secrets
grep -rn "sk-\|eyJ\|secret=" supabase/functions/ --include="*.ts"

# Verificar Deno.env
grep -r "Deno.env" supabase/functions/ --include="*.ts" | wc -l
```

**Severidade:** CRITICAL (secret hardcoded = -30 pontos)

---

## 11. Database Operations

### 11.1 Client Usage
- [ ] Supabase client inicializado corretamente
- [ ] Service role apenas quando necessario
- [ ] User context para RLS

### 11.2 Queries
- [ ] Prepared statements
- [ ] Parametros escapados
- [ ] Limites aplicados

**Verificacao:**
```bash
# Verificar createClient
grep -r "createClient" supabase/functions/ --include="*.ts" | wc -l

# Verificar service role
grep -r "service_role" supabase/functions/ --include="*.ts" | wc -l
```

---

## 12. External API Calls

### 12.1 Best Practices
- [ ] Retry logic implementado
- [ ] Circuit breaker (opcional)
- [ ] Timeout configurado
- [ ] Error handling

### 12.2 Security
- [ ] API keys em secrets
- [ ] HTTPS apenas
- [ ] Response validation

**Verificacao:**
```bash
# Verificar fetch calls
grep -r "fetch\(" supabase/functions/ --include="*.ts" | wc -l
```

---

## Calculo de Score

```typescript
const backendChecks = {
  structure: { weight: 10, checks: ['organization', 'config'] },
  errorHandling: { weight: 20, checks: ['tryCatch', 'codes', 'messages'] },
  cors: { weight: 10, checks: ['headers', 'security'] },
  auth: { weight: 20, checks: ['jwt', 'authorization'] },
  validation: { weight: 15, checks: ['body', 'query', 'headers'] },
  security: { weight: 15, checks: ['secrets', 'logging', 'sanitization'] },
  performance: { weight: 10, checks: ['timeouts', 'rateLimit', 'caching'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de backend
@auditor backend

# Deploy function
supabase functions deploy [function-name]

# Test locally
supabase functions serve [function-name]

# View logs
supabase functions logs [function-name]
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
