# Security Audit Checklist

> **Area:** Security (Authentication, Authorization, Data Protection)
> **Peso:** 18%
> **Itens:** ~50

---

## 1. Authentication (Supabase Auth)

### 1.1 Configuration
- [ ] Email confirmation habilitado
- [ ] Password policy configurada (min 8 chars, complexity)
- [ ] Rate limiting de login ativo
- [ ] Session timeout configurado

### 1.2 JWT
- [ ] JWT secret forte (256+ bits)
- [ ] Token expiration configurado (1h access, 7d refresh)
- [ ] Refresh token rotation habilitado
- [ ] Claims customizados seguros

### 1.3 MFA
- [ ] 2FA disponivel
- [ ] TOTP implementado
- [ ] Recovery codes gerados
- [ ] Backup methods configurados

**Verificacao:**
```bash
# Verificar config de auth
supabase auth config

# Verificar JWT helpers
grep -r "jwt" src/ --include="*.ts" --include="*.tsx" | wc -l
```

**Severidade:** CRITICAL (auth mal configurado = -30 pontos)

---

## 2. Authorization (RLS + RBAC)

### 2.1 Row Level Security
- [ ] RLS habilitado em TODAS as tabelas
- [ ] Policies de SELECT por empresa_id
- [ ] Policies de INSERT por empresa_id
- [ ] Policies de UPDATE por empresa_id
- [ ] Policies de DELETE controladas

### 2.2 Role-Based Access Control
- [ ] Roles definidos (admin, user, viewer)
- [ ] Permissoes por funcionalidade
- [ ] Hierarquia de roles implementada
- [ ] Role assignment auditado

**Verificacao SQL:**
```sql
-- Verificar RLS
SELECT * FROM audit_check_rls_status();

-- Verificar roles
SELECT * FROM auth.users WHERE raw_user_meta_data->>'role' IS NOT NULL;
```

**Severidade:** CRITICAL (RLS desabilitado = -30 pontos por tabela)

---

## 3. Secrets Management

### 3.1 No Hardcoded Secrets
- [ ] Nenhum API key no codigo
- [ ] Nenhuma senha no codigo
- [ ] Nenhum token no codigo
- [ ] Nenhum certificate inline

**Verificacao:**
```bash
# Buscar padroes de secrets
grep -rn "sk-" src/ --include="*.ts" --include="*.tsx"
grep -rn "eyJ" src/ --include="*.ts" --include="*.tsx"
grep -rn "password=" src/ --include="*.ts" --include="*.tsx"
grep -rn "secret=" src/ --include="*.ts" --include="*.tsx"
grep -rn "api_key=" src/ --include="*.ts" --include="*.tsx"
grep -rn "AKIA" src/ --include="*.ts" --include="*.tsx"
```

**Severidade:** CRITICAL (secret hardcoded = -30 pontos)

### 3.2 Environment Variables
- [ ] .env em .gitignore
- [ ] .env.example sem valores reais
- [ ] Secrets em Supabase Vault
- [ ] Vercel env vars configuradas

**Verificacao:**
```bash
# Verificar .gitignore
grep ".env" .gitignore

# Verificar .env.example
cat .env.example | grep -v "^#" | grep "="
```

### 3.3 Secret Rotation
- [ ] Processo de rotacao definido
- [ ] Rotacao automatica quando possivel
- [ ] Alertas de expiracao

---

## 4. Input Validation

### 4.1 Frontend Validation
- [ ] Zod schemas para forms
- [ ] Sanitizacao de inputs
- [ ] XSS prevention
- [ ] HTML encoding

### 4.2 Backend Validation
- [ ] Schema validation em todas APIs
- [ ] Type checking
- [ ] Size limits
- [ ] Format validation (email, phone, etc.)

**Verificacao:**
```bash
# Verificar uso de Zod
grep -r "z\." src/ --include="*.ts" --include="*.tsx" | wc -l

# Verificar DOMPurify ou similar
grep -r "sanitize\|DOMPurify" src/ --include="*.ts" --include="*.tsx"
```

**Severidade:** HIGH (input nao validado = -15 pontos)

---

## 5. SQL Injection Prevention

### 5.1 Parameterized Queries
- [ ] Supabase client sempre usado
- [ ] Nenhum string concatenation em queries
- [ ] Prepared statements quando raw SQL

### 5.2 Input Sanitization
- [ ] Escapar caracteres especiais
- [ ] Whitelist de campos permitidos
- [ ] Type coercion

**Verificacao:**
```bash
# Buscar raw queries
grep -rn "\.rpc\|\.from\|\.select" src/ --include="*.ts" | grep -i "string"
```

**Severidade:** CRITICAL (SQL injection vulneravel = -30 pontos)

---

## 6. XSS Prevention

### 6.1 React
- [ ] Evitar dangerouslySetInnerHTML
- [ ] Sanitizar user input
- [ ] Content Security Policy

### 6.2 Output Encoding
- [ ] HTML entities escapadas
- [ ] URL encoding quando necessario
- [ ] JSON encoding correto

**Verificacao:**
```bash
# Verificar dangerouslySetInnerHTML
grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx"

# Verificar innerHTML
grep -rn "innerHTML" src/ --include="*.ts" --include="*.tsx"
```

**Severidade:** HIGH (XSS vulneravel = -15 pontos)

---

## 7. CORS Configuration

### 7.1 Allowed Origins
- [ ] Origins especificos (nao *)
- [ ] Ambiente apropriado (dev vs prod)
- [ ] Subdomains controlados

### 7.2 Headers
- [ ] Access-Control-Allow-Origin restritivo
- [ ] Access-Control-Allow-Methods minimos
- [ ] Access-Control-Allow-Headers controlados
- [ ] Access-Control-Max-Age configurado

**Verificacao:**
```bash
# Verificar CORS wildcards
grep -rn "'*'" supabase/functions/ --include="*.ts" | grep -i "origin\|cors"
```

**Severidade:** HIGH (CORS * em producao = -15 pontos)

---

## 8. HTTPS & Transport Security

### 8.1 HTTPS
- [ ] HTTPS enforced em producao
- [ ] HSTS habilitado
- [ ] Secure cookies
- [ ] No mixed content

### 8.2 Certificates
- [ ] SSL valido
- [ ] Auto-renovacao configurada
- [ ] TLS 1.2+

**Verificacao:**
```bash
# Verificar URLs HTTP
grep -rn "http://" src/ --include="*.ts" --include="*.tsx" | grep -v "localhost"
```

---

## 9. Logging & Monitoring

### 9.1 Security Logs
- [ ] Login attempts logados
- [ ] Failed auth logado
- [ ] Permission denied logado
- [ ] Suspicious activity alertada

### 9.2 No Sensitive Data in Logs
- [ ] Sem passwords em logs
- [ ] Sem tokens em logs
- [ ] Sem PII desnecessario
- [ ] Logs sanitizados

**Verificacao:**
```bash
# Verificar console.log de dados sensiveis
grep -rn "console\." src/ --include="*.ts" --include="*.tsx" | grep -i "password\|token\|secret"
```

**Severidade:** MEDIUM (PII em logs = -5 pontos)

---

## 10. Rate Limiting

### 10.1 API Rate Limits
- [ ] Rate limit por IP
- [ ] Rate limit por usuario
- [ ] Rate limit por endpoint critico
- [ ] Headers de rate limit retornados

### 10.2 Auth Rate Limits
- [ ] Login attempts limitados
- [ ] Password reset limitado
- [ ] Sign up limitado
- [ ] 2FA attempts limitados

**Verificacao:**
```bash
# Verificar implementacao de rate limit
grep -rn "rateLimit\|rate-limit\|throttle" src/ supabase/ --include="*.ts"
```

---

## 11. Session Management

### 11.1 Session Security
- [ ] Session timeout configurado
- [ ] Idle timeout implementado
- [ ] Session invalidation on logout
- [ ] Concurrent session control

### 11.2 Token Storage
- [ ] Tokens em httpOnly cookies ou secure storage
- [ ] Nao em localStorage para dados sensiveis
- [ ] Clear on logout

**Verificacao:**
```bash
# Verificar localStorage usage
grep -rn "localStorage" src/ --include="*.ts" --include="*.tsx"
```

---

## 12. Dependency Security

### 12.1 Vulnerability Scanning
- [ ] npm audit sem CRITICAL
- [ ] npm audit sem HIGH
- [ ] Dependencies atualizadas
- [ ] Snyk/Dependabot configurado

### 12.2 Supply Chain
- [ ] Package-lock.json commitado
- [ ] Registries confiaveis
- [ ] Nao usar packages abandonados

**Verificacao:**
```bash
# Verificar vulnerabilidades
npm audit

# Verificar dependencies desatualizadas
npm outdated
```

**Severidade:** HIGH (vulnerabilidade critica = -15 pontos)

---

## Calculo de Score

```typescript
const securityChecks = {
  authentication: { weight: 20, checks: ['config', 'jwt', 'mfa'] },
  authorization: { weight: 20, checks: ['rls', 'rbac'] },
  secrets: { weight: 20, checks: ['noHardcoded', 'envVars', 'rotation'] },
  inputValidation: { weight: 15, checks: ['frontend', 'backend', 'sql'] },
  transport: { weight: 10, checks: ['https', 'cors', 'headers'] },
  session: { weight: 10, checks: ['timeout', 'storage', 'invalidation'] },
  dependencies: { weight: 5, checks: ['audit', 'updates'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de seguranca
@auditor security

# npm audit
npm audit --audit-level=high

# Buscar secrets
git secrets --scan
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
