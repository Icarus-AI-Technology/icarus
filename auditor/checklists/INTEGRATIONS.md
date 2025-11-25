# Integrations Audit Checklist

> **Area:** Integrations (Microsoft 365, Pluggy, SEFAZ)
> **Peso:** 5%
> **Itens:** ~40

---

## 1. Microsoft 365 Integration

### 1.1 OAuth Configuration
- [ ] App registrado no Azure AD
- [ ] Client ID configurado
- [ ] Client Secret em secrets
- [ ] Redirect URIs corretas

### 1.2 Permissions (Scopes)
- [ ] Scopes minimos necessarios
- [ ] User.Read para perfil
- [ ] Mail.Send para emails (se usado)
- [ ] Calendar.ReadWrite (se usado)
- [ ] Consent flow funcionando

### 1.3 Token Management
- [ ] Access token armazenado seguramente
- [ ] Refresh token implementado
- [ ] Token expiration tratada
- [ ] Revocation handling

**Verificacao:**
```bash
# Verificar configuracao Microsoft
grep -r "MICROSOFT\|AZURE\|MSAL" src/ --include="*.ts" | wc -l

# Verificar env vars
grep -i "microsoft\|azure" .env.example
```

**Severidade:** HIGH (OAuth mal configurado = -10 pontos)

### 1.4 Graph API Usage
- [ ] SDK oficial utilizado (@microsoft/microsoft-graph-client)
- [ ] Error handling implementado
- [ ] Rate limiting respeitado
- [ ] Batch requests quando apropriado

---

## 2. Pluggy Integration (Open Finance)

### 2.1 Configuration
- [ ] Client ID configurado
- [ ] Client Secret em secrets
- [ ] Webhook URL configurada
- [ ] Ambiente correto (sandbox/production)

### 2.2 Connect Widget
- [ ] Widget integrado
- [ ] Callback handlers implementados
- [ ] Error states tratados
- [ ] Loading states

### 2.3 Webhooks
- [ ] Endpoint de webhook implementado
- [ ] Signature validation
- [ ] Event types tratados
- [ ] Retry logic para falhas

**Verificacao:**
```bash
# Verificar Pluggy
grep -r "pluggy\|PLUGGY" src/ supabase/ --include="*.ts" | wc -l

# Verificar webhook handler
find supabase/functions -name "*pluggy*" -o -name "*webhook*"
```

### 2.4 Data Handling
- [ ] Dados bancarios criptografados
- [ ] Minimo de dados armazenados
- [ ] Logs sanitizados
- [ ] LGPD compliance

**Severidade:** CRITICAL (dados bancarios expostos = -30 pontos)

### 2.5 Item Management
- [ ] Item status monitorado
- [ ] Reconexao automatica
- [ ] Notificacao de desconexao
- [ ] Cleanup de items inativos

---

## 3. SEFAZ Integration (NF-e/NFS-e)

### 3.1 Certificado Digital
- [ ] Certificado A1 ou A3 configurado
- [ ] Validade monitorada
- [ ] Arquivo .pfx seguro
- [ ] Senha em secrets

**Verificacao:**
```bash
# Verificar certificado
openssl pkcs12 -info -in certificado.pfx -noout 2>&1 | grep "MAC"

# Verificar validade
openssl pkcs12 -in certificado.pfx -nokeys -out cert.pem
openssl x509 -in cert.pem -noout -dates
```

**Severidade:** CRITICAL (certificado expirado = -30 pontos)

### 3.2 NF-e Configuration
- [ ] Ambiente correto (producao/homologacao)
- [ ] CNPJ configurado
- [ ] Inscricao Estadual
- [ ] Codigo de regime tributario

### 3.3 NF-e Operations
- [ ] Emissao funcionando
- [ ] Consulta status
- [ ] Cancelamento
- [ ] Carta de correcao
- [ ] Contingencia offline

### 3.4 NFS-e (Nota Fiscal de Servico)
- [ ] Integracao com prefeitura
- [ ] RPS gerado
- [ ] Conversao para NFS-e
- [ ] Cancelamento

### 3.5 XML Storage
- [ ] XMLs assinados armazenados
- [ ] Retencao de 5 anos
- [ ] Backup automatico
- [ ] Recuperacao testada

---

## 4. ANVISA Integration

### 4.1 API Access
- [ ] Credenciais configuradas
- [ ] Ambiente correto
- [ ] Rate limits respeitados

### 4.2 Consultas
- [ ] Consulta de registro de produtos
- [ ] Consulta de situacao de produto
- [ ] Cache de consultas

### 4.3 Notificacoes
- [ ] Eventos adversos API
- [ ] Recall notifications
- [ ] Alertas sanitarios

---

## 5. Email Integration (Resend/SendGrid)

### 5.1 Configuration
- [ ] API key configurada
- [ ] Domain verificado
- [ ] SPF/DKIM configurados
- [ ] From address validado

### 5.2 Templates
- [ ] Templates versionados
- [ ] Personalizacao funcionando
- [ ] Unsubscribe link

### 5.3 Deliverability
- [ ] Bounce handling
- [ ] Complaint handling
- [ ] Metricas monitoradas

**Verificacao:**
```bash
# Verificar integracao de email
grep -r "resend\|sendgrid\|smtp" src/ supabase/ --include="*.ts" | wc -l
```

---

## 6. Payment Integration (se aplicavel)

### 6.1 Configuration
- [ ] API keys em secrets
- [ ] Webhook secret configurado
- [ ] Ambiente sandbox/production

### 6.2 Webhooks
- [ ] Signature validation
- [ ] Idempotency handling
- [ ] All events handled

### 6.3 PCI Compliance
- [ ] Nao armazenar dados de cartao
- [ ] Usar tokenizacao
- [ ] HTTPS everywhere

---

## 7. Error Handling

### 7.1 API Errors
- [ ] Retry logic com backoff
- [ ] Circuit breaker (opcional)
- [ ] Fallback strategies
- [ ] User notification

### 7.2 Logging
- [ ] Requests logados
- [ ] Errors logados
- [ ] Sensitive data sanitizado
- [ ] Correlacao de logs

### 7.3 Alerting
- [ ] Alertas de falha
- [ ] Alertas de rate limit
- [ ] Alertas de expiracao

**Verificacao:**
```bash
# Verificar retry logic
grep -r "retry\|backoff\|circuit" src/ --include="*.ts" | wc -l
```

---

## 8. Testing

### 8.1 Mock Environments
- [ ] Sandbox configs
- [ ] Mock servers para dev
- [ ] Test data separado

### 8.2 Integration Tests
- [ ] Fluxos criticos testados
- [ ] Error scenarios testados
- [ ] Webhook tests

---

## 9. Documentation

### 9.1 API Documentation
- [ ] Endpoints documentados
- [ ] Payloads documentados
- [ ] Error codes documentados

### 9.2 Runbooks
- [ ] Troubleshooting guide
- [ ] Escalation procedures
- [ ] Contact information

---

## 10. Monitoring

### 10.1 Health Checks
- [ ] Endpoint de health check
- [ ] Status page
- [ ] Uptime monitoring

### 10.2 Metrics
- [ ] Success rate
- [ ] Latency (P50, P95, P99)
- [ ] Error rate

---

## Calculo de Score

```typescript
const integrationsChecks = {
  microsoft365: {
    weight: 25,
    checks: ['oauth', 'permissions', 'tokens', 'graphApi']
  },
  pluggy: {
    weight: 25,
    checks: ['config', 'widget', 'webhooks', 'data']
  },
  sefaz: {
    weight: 30,
    checks: ['certificado', 'nfe', 'nfse', 'storage']
  },
  anvisa: {
    weight: 10,
    checks: ['api', 'consultas', 'notificacoes']
  },
  email: {
    weight: 10,
    checks: ['config', 'templates', 'deliverability']
  }
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de integracoes
@auditor integrations

# Verificar certificado SEFAZ
openssl x509 -in cert.pem -noout -dates

# Verificar webhooks
curl -X POST https://app.icarus.com/api/webhooks/pluggy -d '{}' -H "Content-Type: application/json"
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
