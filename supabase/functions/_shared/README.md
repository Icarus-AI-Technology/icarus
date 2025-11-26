# ICARUS Edge Functions - Shared Utilities

> Utilitarios compartilhados para Edge Functions do ICARUS v5.0

## Arquivos

### `cors.ts`
Configuracao de CORS segura para todas as Edge Functions.

```typescript
import { getCorsHeaders, handleCorsPreflightRequest, jsonResponse, errorResponse } from '../_shared/cors.ts';

// Em cada Edge Function
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCorsPreflightRequest(req);
  }

  // Use jsonResponse para respostas de sucesso
  return jsonResponse({ data: result }, req, 200);

  // Use errorResponse para erros
  return errorResponse('Erro interno', req, 500);
});
```

### `validation.ts`
Validacao de entrada com Zod e protecao contra prompt injection.

```typescript
import {
  validateRequestBody,
  ChatRequestSchema,
  validatePromptSecurity,
  sanitizePII,
  escapeHtml
} from '../_shared/validation.ts';

// Validar body
const validation = await validateRequestBody(req, ChatRequestSchema);
if (!validation.success) {
  return errorResponse('Erro de validacao', req, 400);
}
const { message, sessionId, context } = validation.data;

// Validar seguranca do prompt
const securityCheck = validatePromptSecurity(message);
if (!securityCheck.valid) {
  return errorResponse('Entrada invalida', req, 400);
}

// Sanitizar PII na saida
const safeResponse = sanitizePII(aiResponse);

// Escapar HTML para emails
const safeHtml = escapeHtml(userInput);
```

### `supabase.ts`
Cliente Supabase autenticado e funcoes auxiliares.

```typescript
import {
  verifyAuth,
  createServiceClient,
  getUserEmpresaId,
  getUserProfile
} from '../_shared/supabase.ts';

// Verificar autenticacao
const { user, error, supabase } = await verifyAuth(req);
if (!user) {
  return errorResponse('Nao autorizado', req, 401);
}

// Obter empresa_id do usuario
const empresaId = await getUserEmpresaId(supabase, user.id);

// Ou obter perfil completo
const profile = await getUserProfile(supabase, user.id);
```

## Schemas Disponíveis

| Schema | Uso |
|--------|-----|
| `ChatRequestSchema` | chat/index.ts |
| `ResearchRequestSchema` | gpt-researcher/index.ts |
| `ComplianceCheckRequestSchema` | agent-compliance/index.ts |
| `LeadEmailSchema` | send-lead-email/index.ts |

## Seguranca

### Protecao contra Prompt Injection
```typescript
const check = validatePromptSecurity(userMessage);
// Detecta padroes como:
// - "ignore previous instructions"
// - "reveal system prompt"
// - "forget everything"
```

### Filtragem de PII
```typescript
const safe = sanitizePII(aiResponse);
// Remove:
// - CPF: 123.456.789-00 -> [CPF REDACTED]
// - CNPJ: 12.345.678/0001-00 -> [CNPJ REDACTED]
// - Cartoes de credito
// - Telefones
// - Emails
```

### Sanitizacao HTML
```typescript
const safeHtml = escapeHtml(userInput);
// Previne XSS em emails e outputs HTML
```

## Configuracao CORS

Para producao, edite `cors.ts` e adicione seus dominios:

```typescript
const ALLOWED_ORIGINS = [
  'https://icarus.app',
  'https://app.icarus.com.br',
  // Adicione seus dominios aqui
];
```

## Ambiente

Variaveis de ambiente necessarias:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `FRONTEND_URL` (opcional, para CORS)
