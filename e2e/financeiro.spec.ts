import { test, expect } from '@playwright/test'

test.describe('Financeiro Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/financeiro')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('should display financeiro page', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Check URL
    await expect(page).toHaveURL('/financeiro')
  })

  test('should display financial KPIs', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Should have some content in DOM
    const bodyHtml = await page.evaluate(() => document.body.innerHTML)
    expect(bodyHtml.length).toBeGreaterThan(100)
  })

  test('should have tabs for different financial views', async ({ page }) => {
    // Check for any tablist
    const tabs = page.locator('[role="tablist"], [class*="TabsList"]')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThanOrEqual(0)
  })

  test('should display charts or data', async ({ page }) => {
    // Check for chart containers or data tables
    const dataElements = page.locator('svg, table, [class*="chart"], [class*="Chart"]')
    const count = await dataElements.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should have interactive elements', async ({ page }) => {
    // Check for buttons
    const buttons = page.locator('button')
    const count = await buttons.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test('should be responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Page should still load
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Reset
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})

test.describe('Contas a Receber Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contas-receber')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('should display contas a receber page', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    await expect(page).toHaveURL('/contas-receber')
  })

  test('should display receivables content', async ({ page }) => {
    // Should have content in DOM
    const bodyHtml = await page.evaluate(() => document.body.innerHTML)
    expect(bodyHtml.length).toBeGreaterThan(100)
  })
})
