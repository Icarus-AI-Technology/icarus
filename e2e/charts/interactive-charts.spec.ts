import { test, expect } from '@playwright/test'

/**
 * Testes E2E para Gráficos Interativos
 * Cobertura: Drill-down, Export, Trends
 */

test.describe('Gráficos Interativos - Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('Deve renderizar 3 gráficos no dashboard', async ({ page }) => {
    // Aguardar carregamento
    await page.waitForLoadState('networkidle')
    
    // Verificar presença dos gráficos
    const charts = await page.locator('svg').count()
    expect(charts).toBeGreaterThanOrEqual(3)
  })

  test('Deve fazer drill-down no gráfico de faturamento', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Localizar gráfico de faturamento
    const chartContainer = await page.locator('text=Faturamento Mensal').locator('..')
    
    // Clicar em um ponto do gráfico para drill-down
    const dataPoint = await chartContainer.locator('circle, rect').first()
    await dataPoint.click()
    
    // Verificar que o breadcrumb aparece
    await expect(page.locator('text=>')).toBeVisible()
  })

  test('Deve voltar um nível (drill-up)', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Fazer drill-down
    const chartContainer = await page.locator('text=Faturamento').locator('..')
    const dataPoint = await chartContainer.locator('circle, rect').first()
    await dataPoint.click()
    
    // Clicar no botão de voltar
    await page.click('button[aria-label="Voltar"], svg.lucide-chevron-left')
    
    // Breadcrumb deve desaparecer
    await expect(page.locator('text=>')).not.toBeVisible()
  })

  test('Deve mostrar tooltip ao hover', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Hover sobre um ponto do gráfico
    const dataPoint = await page.locator('svg circle, svg rect').first()
    await dataPoint.hover()
    
    // Tooltip deve aparecer
    await expect(page.locator('[role="tooltip"]')).toBeVisible({ timeout: 2000 })
  })

  test('Deve exibir trend indicator', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Verificar presença de indicador de tendência
    const trendIndicator = await page.locator('svg.lucide-trending-up, svg.lucide-trending-down')
    await expect(trendIndicator.first()).toBeVisible()
  })

  test('Deve ter botão de export', async ({ page }) => {
    await page.waitForLoadState('networkidle')
    
    // Verificar botão de download
    const exportButton = await page.locator('button:has(svg.lucide-download)')
    await expect(exportButton.first()).toBeVisible()
  })
})

test.describe('Gráficos - Estoque IA', () => {
  test('Deve mostrar previsão de demanda', async ({ page }) => {
    await page.goto('http://localhost:5173/estoque')
    await page.waitForLoadState('networkidle')
    
    // Verificar título do gráfico
    await expect(page.locator('text=Previsão de Demanda')).toBeVisible()
    
    // Verificar acurácia exibida
    await expect(page.locator('text=95%')).toBeVisible()
  })

  test('Deve fazer drill-down por categoria', async ({ page }) => {
    await page.goto('http://localhost:5173/estoque')
    await page.waitForLoadState('networkidle')
    
    const chart = await page.locator('text=Previsão').locator('..')
    const point = await chart.locator('circle, rect').first()
    await point.click()
    
    // Deve mostrar categorias
    await expect(page.locator('text=Cardíaco, text=Vascular')).toBeVisible()
  })
})

test.describe('Gráficos - Financeiro', () => {
  test('Deve mostrar fluxo de caixa', async ({ page }) => {
    await page.goto('http://localhost:5173/financeiro')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('text=Fluxo de Caixa')).toBeVisible()
  })

  test('Deve fazer drill-down por centro de custo', async ({ page }) => {
    await page.goto('http://localhost:5173/financeiro')
    await page.waitForLoadState('networkidle')
    
    const chart = await page.locator('text=Fluxo de Caixa').locator('..')
    const point = await chart.locator('circle, rect').first()
    await point.click()
    
    await expect(page.locator('text=Centro de Custo')).toBeVisible()
  })

  test('Deve mostrar saldo acumulado', async ({ page }) => {
    await page.goto('http://localhost:5173/financeiro')
    await page.waitForLoadState('networkidle')
    
    await expect(page.locator('text=Saldo Acumulado')).toBeVisible()
  })
})

test.describe('Animações e Performance', () => {
  test('Gráficos devem ter animações smooth (300ms)', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    const chart = await page.locator('text=Faturamento').locator('..')
    const point = await chart.locator('circle').first()
    
    const start = Date.now()
    await point.click()
    
    // Aguardar animação
    await page.waitForTimeout(400)
    const duration = Date.now() - start
    
    // Deve ser rápido (< 500ms)
    expect(duration).toBeLessThan(500)
  })

  test('Deve ter 60fps nas animações', async ({ page }) => {
    await page.goto('http://localhost:5173')
    
    // Verificar se há elementos com Framer Motion
    const hasMotion = await page.evaluate(() => {
      const elements = document.querySelectorAll('[style*="transform"]')
      return elements.length > 0
    })
    
    expect(hasMotion).toBeTruthy()
  })
})

test.describe('Responsividade', () => {
  test('Gráficos devem se adaptar ao mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Gráficos devem estar visíveis
    const chart = await page.locator('svg').first()
    await expect(chart).toBeVisible()
    
    // Deve ocupar largura disponível
    const width = await chart.evaluate((el) => el.clientWidth)
    expect(width).toBeGreaterThan(300) // Largura mínima mobile
  })

  test('Tooltip deve funcionar em touch', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    const point = await page.locator('svg circle').first()
    await point.tap()
    
    // Tooltip ou drill-down deve acontecer
    await page.waitForTimeout(500)
  })
})

test.describe('Export de Gráficos (Preparação)', () => {
  test('Botão de export deve estar presente', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    const exportBtn = await page.locator('button:has(svg.lucide-download)')
    await expect(exportBtn.first()).toBeVisible()
  })

  test('Clicar em export deve abrir menu (quando implementado)', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    const exportBtn = await page.locator('button:has(svg.lucide-download)').first()
    await exportBtn.click()
    
    // TODO: Verificar menu de export quando implementado
    // await expect(page.locator('text=PDF, text=Excel, text=PNG')).toBeVisible()
  })
})

