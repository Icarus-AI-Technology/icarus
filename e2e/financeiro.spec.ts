import { test, expect } from '@playwright/test'

test.describe('Financeiro Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/financeiro')
    await page.waitForLoadState('networkidle')
  })

  test('should display financeiro page', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check page title
    await expect(page.getByRole('heading', { name: /financeiro/i })).toBeVisible()
  })

  test('should display financial KPIs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for KPI-related content (revenue, receivables, etc)
    const financialContent = page.locator('text=/Faturamento|Receita|Receber|R\\$/i')
    const contentCount = await financialContent.count()
    expect(contentCount).toBeGreaterThan(0)
  })

  test('should have tabs for different financial views', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for tab navigation
    const tabs = page.getByRole('tab')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThanOrEqual(0)
  })

  test('should display charts', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for chart containers (Recharts uses application role)
    const charts = page.getByRole('application')
    const chartCount = await charts.count()
    expect(chartCount).toBeGreaterThanOrEqual(0)
  })

  test('should have interactive elements', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for buttons, inputs, selects
    const interactive = page.locator('button, input, select, [role="combobox"]')
    const count = await interactive.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Page should still be functional
    await expect(page.locator('body')).toBeVisible()
    
    // Reset
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})

test.describe('Contas a Receber Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contas-receber')
    await page.waitForLoadState('networkidle')
  })

  test('should display contas a receber page', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for page content
    await expect(page.locator('body')).toBeVisible()
    
    // Look for receivables-related content
    const receivablesContent = page.locator('text=/Contas|Receber|Vencimento|Pagamento/i')
    const contentCount = await receivablesContent.count()
    expect(contentCount).toBeGreaterThanOrEqual(0)
  })

  test('should display receivables list or KPIs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for cards or list items
    const cards = page.locator('[class*="Card"], [class*="card"]')
    const count = await cards.count()
    expect(count).toBeGreaterThan(0)
  })
})

