# Compliance Audit Checklist

> **Area:** Compliance (ANVISA, LGPD, SEFAZ)
> **Peso:** 15%
> **Itens:** ~45

---

## 1. ANVISA Compliance (RDC 16/2013, RDC 185/2001)

### 1.1 Registro de Produtos
- [ ] Tabela `produtos` com campos ANVISA
- [ ] `registro_anvisa` obrigatorio para produtos OPME
- [ ] `validade_registro` controlada
- [ ] `classe_risco` definida (I, II, III, IV)
- [ ] `fabricante` registrado

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_anvisa_compliance();
```

### 1.2 Controle de Lotes
- [ ] Tabela `lotes` implementada
- [ ] `numero_lote` unico por produto
- [ ] `data_fabricacao` registrada
- [ ] `data_validade` registrada
- [ ] `quantidade` controlada
- [ ] `status_anvisa` (ativo, suspenso, cancelado)

### 1.3 Rastreabilidade de Implantes
- [ ] Tabela `implantes` ou `rastreabilidade_opme`
- [ ] `paciente_id` vinculado (opcional LGPD)
- [ ] `procedimento_id` registrado
- [ ] `profissional_responsavel` identificado
- [ ] `hospital_id` registrado
- [ ] `data_implante` obrigatoria
- [ ] `registro_anvisa` do produto
- [ ] `numero_serie` quando aplicavel

**Severidade:** CRITICAL (rastreabilidade incompleta = -30 pontos)

### 1.4 Eventos Adversos
- [ ] Tabela `eventos_adversos` existe
- [ ] Notificacao ANVISA preparada
- [ ] Prazo de notificacao (24h graves)
- [ ] Documentacao completa

### 1.5 Recall
- [ ] Processo de recall documentado
- [ ] Identificacao rapida de lotes
- [ ] Notificacao de stakeholders
- [ ] Rastreamento de destino

**Verificacao SQL:**
```sql
-- Verificar campos ANVISA em produtos
SELECT column_name FROM information_schema.columns
WHERE table_name = 'produtos'
AND column_name IN ('registro_anvisa', 'classe_risco', 'fabricante');

-- Verificar rastreabilidade
SELECT COUNT(*) FROM rastreabilidade_opme
WHERE registro_anvisa IS NULL OR profissional_responsavel IS NULL;
```

---

## 2. LGPD Compliance (Lei 13.709/2018)

### 2.1 Minimizacao de Dados
- [ ] Coletar apenas dados necessarios
- [ ] Definir finalidade clara
- [ ] Tempo de retencao definido
- [ ] Anonimizacao quando possivel

### 2.2 Consentimento
- [ ] Tabela `consentimentos` existe
- [ ] `tipo_consentimento` registrado
- [ ] `data_consentimento` registrada
- [ ] `versao_termos` controlada
- [ ] `revogacao` permitida

**Verificacao SQL:**
```sql
SELECT * FROM audit_check_lgpd_compliance();
```

### 2.3 Direitos do Titular
- [ ] Acesso aos dados implementado
- [ ] Correcao de dados permitida
- [ ] Exclusao (anonimizacao) disponivel
- [ ] Portabilidade possivel
- [ ] Revogacao de consentimento funcional

### 2.4 Dados Sensiveis (Saude)
- [ ] Dados de saude identificados
- [ ] Criptografia em dados sensiveis
- [ ] Acesso restrito por role
- [ ] Audit log obrigatorio

### 2.5 Audit Log
- [ ] Tabela `audit_log` implementada
- [ ] Registra CREATE, UPDATE, DELETE
- [ ] Imutavel (sem UPDATE/DELETE)
- [ ] Retencao minima de 5 anos
- [ ] Campos: usuario, ip, timestamp, dados

**Verificacao SQL:**
```sql
-- Verificar estrutura audit_log
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'audit_log';

-- Verificar integridade (sem DELETEs)
SELECT COUNT(*) FROM audit_log; -- comparar historico
```

**Severidade:** HIGH (audit log ausente = -15 pontos)

### 2.6 Encarregado (DPO)
- [ ] DPO nomeado
- [ ] Canal de comunicacao definido
- [ ] Processo de atendimento documentado

---

## 3. SEFAZ Compliance (NF-e, NFS-e)

### 3.1 Certificado Digital
- [ ] Certificado A1/A3 configurado
- [ ] Validade monitorada
- [ ] Renovacao planejada
- [ ] Backup do certificado

### 3.2 NF-e
- [ ] Emissao de NF-e implementada
- [ ] Cancelamento funcionando
- [ ] Carta de correcao disponivel
- [ ] Contingencia configurada
- [ ] DANFE gerado

### 3.3 NFS-e
- [ ] Integracao com prefeitura
- [ ] RPS emitido
- [ ] Conversao para NFS-e
- [ ] Cancelamento funcionando

### 3.4 Armazenamento Fiscal
- [ ] XMLs armazenados
- [ ] Retencao de 5 anos
- [ ] Backup automatico
- [ ] Acesso para fiscalizacao

**Verificacao:**
```bash
# Verificar certificado
openssl x509 -in cert.pem -noout -dates

# Verificar integracao SEFAZ
grep -r "sefaz\|nfe\|nfse" src/ --include="*.ts" | wc -l
```

---

## 4. Seguranca de Dados (Compliance Geral)

### 4.1 Criptografia
- [ ] Dados em repouso criptografados
- [ ] Dados em transito (TLS 1.2+)
- [ ] Chaves gerenciadas corretamente
- [ ] Hashing de senhas (bcrypt/argon2)

### 4.2 Controle de Acesso
- [ ] Principio do minimo privilegio
- [ ] Segregacao de funcoes
- [ ] Revisao periodica de acessos
- [ ] Logs de acesso

### 4.3 Backup e Recovery
- [ ] Backup automatico diario
- [ ] Backup testado mensalmente
- [ ] RPO definido (< 24h)
- [ ] RTO definido (< 4h)
- [ ] Retencao conforme regulamentacao

---

## 5. Documentacao

### 5.1 Politicas
- [ ] Politica de Privacidade publicada
- [ ] Termos de Uso publicados
- [ ] Politica de Cookies
- [ ] Politica de Seguranca

### 5.2 Processos
- [ ] Processo de resposta a incidentes
- [ ] Processo de notificacao ANPD
- [ ] Processo de atendimento ao titular
- [ ] Processo de recall ANVISA

### 5.3 Registros
- [ ] Registro de tratamento de dados
- [ ] RIPD (quando necessario)
- [ ] Contratos com operadores

---

## SQL Functions de Compliance

### audit_check_anvisa_compliance()
```sql
CREATE OR REPLACE FUNCTION audit_check_anvisa_compliance()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Verificar campos obrigatorios em produtos
  RETURN QUERY
  SELECT
    'Produtos - Campos ANVISA'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END,
    COUNT(*)::TEXT || ' produtos sem registro_anvisa'
  FROM produtos
  WHERE registro_anvisa IS NULL AND tipo = 'OPME';

  -- Verificar rastreabilidade
  RETURN QUERY
  SELECT
    'Rastreabilidade OPME'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'FAIL' ELSE 'PASS' END,
    COUNT(*)::TEXT || ' registros incompletos'
  FROM rastreabilidade_opme
  WHERE profissional_responsavel IS NULL
  OR data_implante IS NULL;

  -- Verificar lotes
  RETURN QUERY
  SELECT
    'Controle de Lotes'::TEXT,
    CASE WHEN COUNT(*) > 0 THEN 'WARN' ELSE 'PASS' END,
    COUNT(*)::TEXT || ' lotes sem validade'
  FROM lotes
  WHERE data_validade IS NULL;
END;
$$ LANGUAGE plpgsql;
```

### audit_check_lgpd_compliance()
```sql
CREATE OR REPLACE FUNCTION audit_check_lgpd_compliance()
RETURNS TABLE (
  check_name TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- Verificar tabela audit_log
  RETURN QUERY
  SELECT
    'Audit Log Existe'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_log')
    THEN 'PASS' ELSE 'FAIL' END,
    'Tabela audit_log';

  -- Verificar consentimentos
  RETURN QUERY
  SELECT
    'Tabela Consentimentos'::TEXT,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'consentimentos')
    THEN 'PASS' ELSE 'WARN' END,
    'Tabela consentimentos';

  -- Verificar soft delete (excluido_em)
  RETURN QUERY
  SELECT
    'Soft Delete Implementado'::TEXT,
    CASE WHEN (
      SELECT COUNT(*) FROM information_schema.columns
      WHERE column_name = 'excluido_em' AND table_schema = 'public'
    ) > 10 THEN 'PASS' ELSE 'WARN' END,
    'Colunas excluido_em encontradas';
END;
$$ LANGUAGE plpgsql;
```

---

## Calculo de Score

```typescript
const complianceChecks = {
  anvisa: {
    weight: 40,
    checks: ['registro', 'lotes', 'rastreabilidade', 'recall']
  },
  lgpd: {
    weight: 40,
    checks: ['minimizacao', 'consentimento', 'direitos', 'auditLog']
  },
  sefaz: {
    weight: 15,
    checks: ['certificado', 'nfe', 'nfse', 'armazenamento']
  },
  documentacao: {
    weight: 5,
    checks: ['politicas', 'processos', 'registros']
  }
};

// Score = 100 - penalties
```

---

## Comandos de Auditoria

```bash
# Executar auditoria de compliance
@auditor compliance

# Via SQL
SELECT * FROM audit_check_anvisa_compliance();
SELECT * FROM audit_check_lgpd_compliance();
```

---

**Versao:** 2.0.0
**Ultima Atualizacao:** 2025-11-25
