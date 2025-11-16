# Sentry Error Tracking

Este documento explica como usar Sentry para monitoramento de erros e performance no ICARUS v5.0.

## 📚 Visão Geral

Sentry é uma plataforma de monitoramento de erros que ajuda a:
- Rastrear e corrigir bugs em produção
- Monitorar performance da aplicação
- Gravar sessões de usuário (Session Replay)
- Profiling de performance
- Alertas em tempo real

## 🚀 Configuração

### 1. Criar Conta no Sentry

1. Acesse [sentry.io](https://sentry.io)
2. Crie uma conta gratuita
3. Crie um novo projeto React
4. Copie o DSN fornecido

### 2. Configurar Variáveis de Ambiente

Adicione as variáveis ao arquivo `.env.local`:

```bash
# Sentry Configuration
VITE_SENTRY_DSN=https://your_key@o0.ingest.sentry.io/0000000
VITE_ENVIRONMENT=production
# VITE_SENTRY_FORCE_ENABLE=true  # Descomentar para forçar em dev
```

**Variáveis disponíveis:**

| Variável | Descrição | Obrigatório |
|----------|-----------|-------------|
| `VITE_SENTRY_DSN` | DSN do projeto Sentry | Sim |
| `VITE_ENVIRONMENT` | Ambiente (development, staging, production) | Não (padrão: NODE_ENV) |
| `VITE_SENTRY_FORCE_ENABLE` | Forçar Sentry em desenvolvimento | Não (padrão: false) |

### 3. Inicialização

Sentry é inicializado automaticamente em `src/main.tsx`:

```tsx
import { initSentry } from './lib/sentry/config'

// Initialize Sentry before rendering the app
initSentry()
```

## 🔧 Uso

### Capturar Erros Manualmente

```tsx
import { captureError } from '@/lib/sentry/config'

try {
  // Código que pode falhar
  riskyOperation()
} catch (error) {
  captureError(error as Error, {
    operation: 'riskyOperation',
    userId: user.id,
  })
}
```

### Capturar Mensagens

```tsx
import { captureMessage } from '@/lib/sentry/config'

captureMessage('Operação importante realizada', 'info')
captureMessage('Falha ao processar pagamento', 'error')
```

### Adicionar Breadcrumbs

Breadcrumbs ajudam a rastrear o caminho do usuário antes do erro:

```tsx
import { addBreadcrumb } from '@/lib/sentry/config'

addBreadcrumb('Usuário clicou em "Salvar"', {
  formId: 'product-form',
  action: 'save',
})
```

### Definir Contexto de Usuário

Associe erros a usuários específicos:

```tsx
import { setUser, clearUser } from '@/lib/sentry/config'

// No login
setUser({
  id: user.id,
  email: user.email,
  username: user.name,
})

// No logout
clearUser()
```

## 🎯 Integração com ErrorBoundary

O componente `ErrorBoundary` já está integrado com Sentry:

```tsx
<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

Quando um erro ocorre:
1. ErrorBoundary captura o erro
2. Erro é enviado automaticamente ao Sentry
3. UI de fallback é exibida ao usuário
4. Equipe é notificada via Sentry

## 📊 Performance Monitoring

Sentry rastreia automaticamente:
- **Tempo de carregamento de páginas**
- **Transações de API** (fetch, axios)
- **Navegação entre rotas**
- **Web Vitals** (LCP, FID, CLS)

### Criar Transação Customizada

```tsx
import { Sentry } from '@/lib/sentry/config'

const transaction = Sentry.startTransaction({
  name: 'Load Products',
  op: 'function',
})

try {
  await loadProducts()
  transaction.setStatus('ok')
} catch (error) {
  transaction.setStatus('internal_error')
  throw error
} finally {
  transaction.finish()
}
```

## 🎥 Session Replay

Sentry grava sessões de usuário quando erros ocorrem (sem gravar dados sensíveis):

**Configuração atual:**
- 10% de sessões normais (em produção)
- 100% de sessões com erro
- Textos e mídias mascarados por padrão

## 🔍 Filtros de Erros

Alguns erros são automaticamente filtrados (não enviados ao Sentry):

```tsx
// Em development (a menos que VITE_SENTRY_FORCE_ENABLE=true)
// Erros de rede (NetworkError, Failed to fetch)
// ResizeObserver loop errors (benignos)
```

Para customizar filtros, edite `src/lib/sentry/config.ts`:

```tsx
beforeSend(event, hint) {
  const error = hint.originalException

  // Adicione seus filtros aqui
  if (error && error.message.includes('Ignore this')) {
    return null
  }

  return event
}
```

## 📈 Métricas e Alertas

### Configurar Alertas no Sentry

1. Acesse seu projeto no Sentry
2. Vá para **Alerts** → **Create Alert**
3. Configure alertas para:
   - Novos erros detectados
   - Erros acima de X ocorrências
   - Erros em funcionalidades críticas
   - Degradação de performance

### Métricas Importantes

- **Error Rate**: Taxa de erros por sessão
- **Affected Users**: Usuários impactados por erros
- **Crash-Free Sessions**: % de sessões sem crashes
- **APDEX Score**: Índice de satisfação de performance

## 🧪 Testando Sentry

### Forçar Erro de Teste

Adicione um botão de teste (apenas em dev):

```tsx
import { captureError } from '@/lib/sentry/config'

function TestButton() {
  const testSentry = () => {
    try {
      throw new Error('Teste de erro Sentry')
    } catch (error) {
      captureError(error as Error, {
        test: true,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <Button onClick={testSentry}>
      Testar Sentry
    </Button>
  )
}
```

### Verificar Configuração

```bash
# 1. Iniciar aplicação
npm run dev

# 2. Abrir console do navegador
# 3. Procurar por mensagem de inicialização do Sentry
# 4. Se DSN não configurado, verá aviso:
#    "Sentry DSN not configured. Error tracking disabled."
```

## 🚨 Troubleshooting

### Problema: Erros não aparecem no Sentry

**Soluções:**

1. **Verificar DSN**
   ```bash
   echo $VITE_SENTRY_DSN
   ```

2. **Verificar ambiente**
   - Em development, erros não são enviados por padrão
   - Configure `VITE_SENTRY_FORCE_ENABLE=true`

3. **Verificar filtros**
   - Revise a função `beforeSend` em `config.ts`

### Problema: Muitos erros sendo reportados

**Soluções:**

1. **Ajustar sample rates**
   ```tsx
   // Em config.ts
   tracesSampleRate: 0.1,  // 10% de transações
   replaysSessionSampleRate: 0.1,  // 10% de replays
   ```

2. **Adicionar filtros**
   - Filtrar erros conhecidos e não-críticos

### Problema: Performance impacto na aplicação

**Soluções:**

1. **Reduzir sample rates**
2. **Desabilitar Session Replay**
   ```tsx
   replaysSessionSampleRate: 0,
   replaysOnErrorSampleRate: 0,
   ```

## 📚 Estrutura de Arquivos

```
src/
├── lib/
│   └── sentry/
│       └── config.ts          # Configuração Sentry
├── components/
│   └── common/
│       └── ErrorBoundary.tsx  # Integração com Sentry
└── main.tsx                   # Inicialização
```

## 🔐 Segurança

### Dados Sensíveis

Sentry **NÃO** captura:
- Textos de inputs (mascarados no Replay)
- Mídias (bloqueadas no Replay)
- Headers de autenticação (filtrados automaticamente)

### Compliance

Para conformidade com LGPD/GDPR:
1. Configure `maskAllText: true` (já configurado)
2. Não envie PII em contextos customizados
3. Configure retenção de dados no Sentry
4. Adicione aviso de monitoramento nos termos de uso

## 📖 Recursos Adicionais

- [Sentry Documentation](https://docs.sentry.io/)
- [React Integration](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)
- [Session Replay](https://docs.sentry.io/product/session-replay/)

---

**v5.0.3** | 2025-11-16
