# Testes E2E - Playwright

Testes end-to-end usando Playwright para validar fluxos completos da aplicação ICARUS.

## Executar Testes

```bash
# Rodar todos os testes E2E
npm run test:e2e

# Rodar em modo interativo (UI)
npm run test:e2e:ui

# Ver relatório dos últimos testes
npm run test:e2e:report
```

## Estrutura de Testes

- `homepage.spec.ts` - Testes da página inicial e layout
- `dashboard.spec.ts` - Testes do módulo Dashboard

## Browsers Testados

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

## Configuração

Configurado em `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Retry automático em CI
- Traces habilitados para debug
- Web server automático para testes
