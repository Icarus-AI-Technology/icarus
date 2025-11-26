# Vercel Audit Checklist

> **Area:** Vercel (Deploy, Domains, Environment)
> **Peso:** 5%
> **Itens:** ~30

---

## 1. Deployment Configuration

### 1.1 Build Settings
- [ ] Build command correto (`npm run build`)
- [ ] Output directory correto (`dist`)
- [ ] Node.js version especificada
- [ ] Framework preset correto (Vite)

### 1.2 Git Integration
- [ ] Repositorio conectado
- [ ] Branch principal configurado
- [ ] Auto-deploy habilitado
- [ ] Preview deployments funcionando

### 1.3 Build Optimization
- [ ] Build cache habilitado
- [ ] Incremental builds (se disponivel)
- [ ] Build time < 2 minutos

**Verificacao:**
```bash
# Verificar vercel.json
cat vercel.json

# Via CLI
vercel project ls
```

---

## 2. Environment Variables

### 2.1 Required Variables
- [ ] VITE_SUPABASE_URL configurada
- [ ] VITE_SUPABASE_ANON_KEY configurada
- [ ] VITE_APP_URL configurada
- [ ] Todas as VITE_* necessarias

### 2.2 Sensitive Variables
- [ ] SUPABASE_SERVICE_ROLE_KEY (se usada)
- [ ] OPENAI_API_KEY
- [ ] Outras chaves de API

### 2.3 Environment Separation
- [ ] Production env vars
- [ ] Preview env vars
- [ ] Development env vars
- [ ] Valores diferentes por ambiente

**Verificacao:**
```bash
# Listar env vars (via CLI)
vercel env ls

# Verificar arquivo .env.example
cat .env.example
```

**Severidade:** HIGH (env var faltando = -10 pontos)

---

## 3. Domain Configuration

### 3.1 Primary Domain
- [ ] Dominio customizado configurado
- [ ] www redirect configurado
- [ ] DNS correto (CNAME/A record)

### 3.2 SSL/TLS
- [ ] SSL habilitado
- [ ] HTTPS enforced
- [ ] Certificado automatico valido
- [ ] TLS 1.2+ apenas

### 3.3 Subdomains
- [ ] api.domain.com (se aplicavel)
- [ ] staging.domain.com
- [ ] Wildcard (se necessario)

**Verificacao:**
```bash
# Verificar dominios
vercel domains ls

# Testar SSL
curl -vI https://app.icarus.com 2>&1 | grep -i ssl
```

---

## 4. Edge Functions

### 4.1 Configuration
- [ ] Runtime edge configurado
- [ ] Regions especificadas
- [ ] Timeout adequado

### 4.2 Performance
- [ ] Cold start monitorado
- [ ] Execution time < limits
- [ ] Memory usage adequado

### 4.3 Middleware
- [ ] middleware.ts configurado (se usado)
- [ ] Matcher correto
- [ ] Performance otimizada

**Verificacao:**
```bash
# Verificar edge functions
find . -name "*.ts" -path "./api/*" | head -10
```

---

## 5. Analytics & Monitoring

### 5.1 Vercel Analytics
- [ ] Analytics habilitado
- [ ] Real User Monitoring ativo
- [ ] Page views coletados

### 5.2 Speed Insights
- [ ] Speed Insights habilitado
- [ ] Core Web Vitals monitorados
- [ ] Alertas configurados

### 5.3 Logs
- [ ] Function logs acessiveis
- [ ] Build logs acessiveis
- [ ] Log retention adequado

**Verificacao:**
```bash
# Verificar package.json
grep -i "@vercel/analytics\|@vercel/speed-insights" package.json

# Verificar implementacao
grep -r "Analytics\|SpeedInsights" src/ --include="*.tsx"
```

**Severidade:** LOW (analytics desabilitado = -2 pontos)

---

## 6. Security

### 6.1 Headers
- [ ] Strict-Transport-Security
- [ ] X-Content-Type-Options
- [ ] X-Frame-Options
- [ ] Content-Security-Policy

### 6.2 Authentication
- [ ] Password protection (se staging)
- [ ] IP allowlist (se necessario)

### 6.3 DDoS Protection
- [ ] Vercel DDoS protection ativo
- [ ] Rate limiting configurado

**Verificacao:**
```bash
# Verificar headers em vercel.json
cat vercel.json | grep -A 20 "headers"

# Testar headers
curl -I https://app.icarus.com
```

---

## 7. Performance

### 7.1 Caching
- [ ] Static assets com cache longo
- [ ] Cache-Control headers corretos
- [ ] CDN cache funcionando

### 7.2 Compression
- [ ] Gzip habilitado
- [ ] Brotli habilitado
- [ ] Assets comprimidos

### 7.3 Edge Network
- [ ] Global CDN ativo
- [ ] Region mais proxima servindo
- [ ] Latencia < 100ms

**Verificacao:**
```bash
# Verificar cache headers
curl -I https://app.icarus.com/assets/index.js | grep -i cache

# Verificar compressao
curl -I https://app.icarus.com -H "Accept-Encoding: gzip" | grep -i encoding
```

---

## 8. Preview Deployments

### 8.1 Configuration
- [ ] Preview branches habilitados
- [ ] PR comments habilitados
- [ ] Preview URL unica por PR

### 8.2 Environment
- [ ] Env vars de preview separadas
- [ ] Nao usar producao data
- [ ] Password protection (opcional)

### 8.3 Cleanup
- [ ] Auto-cleanup de previews antigos
- [ ] Nao acumular deployments

**Verificacao:**
```bash
# Listar deployments
vercel ls --limit 20
```

---

## 9. Team & Permissions

### 9.1 Access Control
- [ ] Team members corretos
- [ ] Roles apropriados
- [ ] MFA habilitado

### 9.2 API Tokens
- [ ] Tokens com escopo minimo
- [ ] Tokens rotacionados
- [ ] Nao compartilhar tokens

---

## 10. Cost & Limits

### 10.1 Usage Monitoring
- [ ] Bandwidth monitorado
- [ ] Function executions monitoradas
- [ ] Build minutes monitorados

### 10.2 Limits
- [ ] Dentro dos limites do plano
- [ ] Alertas de uso configurados
- [ ] Upgrade path definido

---

## vercel.json Recomendado

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Calculo de Score

```typescript
const vercelChecks = {
  deployment: { weight: 25, checks: ['build', 'git', 'optimization'] },
  envVars: { weight: 25, checks: ['required', 'sensitive', 'separation'] },
  domain: { weight: 20, checks: ['primary', 'ssl', 'subdomains'] },
  analytics: { weight: 10, checks: ['enabled', 'speedInsights', 'logs'] },
  security: { weight: 10, checks: ['headers', 'ddos'] },
  performance: { weight: 10, checks: ['caching', 'compression', 'cdn'] },
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de Vercel
@auditor vercel

# Via Vercel CLI
vercel project ls
vercel env ls
vercel domains ls
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
