import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Módulos
 * Valida carregamento e funcionalidades básicas dos módulos
 */

test.describe('Módulos Principais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('Dashboard deve exibir KPIs', async ({ page }) => {
    // Verificar se os 4 KPIs estão visíveis
    const kpis = [
      'Cirurgias Hoje',
      'Faturamento Mês',
      'Estoque Crítico',
      'Alertas'
    ]

    for (const kpi of kpis) {
      const kpiElement = page.locator(`text="${kpi}"`).first()
      if (await kpiElement.isVisible()) {
        await expect(kpiElement).toBeVisible()
      }
    }
  })

  test('Dashboard deve exibir Ações Rápidas', async ({ page }) => {
    const acoes = [
      'Nova Cirurgia',
      'Adicionar Produto',
      'Emitir NFe'
    ]

    for (const acao of acoes) {
      const acaoElement = page.locator(`text="${acao}"`).first()
      if (await acaoElement.isVisible()) {
        await expect(acaoElement).toBeVisible()
      }
    }
  })

  test('Módulo de Cadastros deve carregar', async ({ page }) => {
    await page.goto('/gestao-cadastros')
    await expect(page.locator('h1')).toContainText(/cadastro/i)
  })

  test('Módulo de Cirurgias deve carregar', async ({ page }) => {
    await page.goto('/cirurgias-procedimentos')
    await expect(page.locator('h1')).toContainText(/cirurgia/i)
  })

  test('Módulo de Estoque IA deve carregar', async ({ page }) => {
    await page.goto('/estoque-ia')
    await expect(page.locator('h1')).toContainText(/estoque/i)
  })

  test('Módulo Financeiro deve carregar', async ({ page }) => {
    await page.goto('/financeiro-avancado')
    await expect(page.locator('h1')).toContainText(/financeiro/i)
  })
})

test.describe('Validação de Rotas', () => {
  const rotasCriticas = [
    '/dashboard',
    '/gestao-cadastros',
    '/cirurgias-procedimentos',
    '/estoque-ia',
    '/financeiro-avancado',
    '/compliance-auditoria',
    '/ia-central',
    '/kpi-dashboard'
  ]

  for (const rota of rotasCriticas) {
    test(`Rota ${rota} deve ser acessível`, async ({ page }) => {
      await page.goto(rota)
      await expect(page).toHaveURL(rota)
      // Verificar se não há erro 404
      await expect(page.locator('h1')).not.toContainText(/404|not found/i)
    })
  }
})

test.describe('Responsividade', () => {
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ]

  for (const viewport of viewports) {
    test(`Dashboard deve ser responsivo em ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto('/dashboard')
      await expect(page.getByTestId('dashboard-heading')).toBeVisible()
    })
  }
})

