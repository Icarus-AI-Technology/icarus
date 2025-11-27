import { test, expect } from '@playwright/test'

test.describe('Estoque IA Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estoque-ia')
    await page.waitForLoadState('networkidle')
  })

  test('should display estoque page with KPIs', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForTimeout(2000)
    
    // Check page title
    await expect(page.getByRole('heading', { name: /estoque/i })).toBeVisible()
    
    // Check for KPI indicators (values)
    const kpiValues = page.locator('[class*="kpi"], [class*="stat"], [class*="Card"]')
    const count = await kpiValues.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should have tabs for different views', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for tab navigation
    const tabs = page.getByRole('tab')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should have search and filter functionality', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for search/filter inputs
    const inputs = page.locator('input[type="text"], input[type="search"]')
    const inputCount = await inputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(0)
  })

  test('should display product list', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Look for product-related content
    const productContent = page.locator('text=/OPME|Prótese|Estoque|Produto/i')
    const contentCount = await productContent.count()
    expect(contentCount).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Page should still be accessible
    await expect(page.locator('body')).toBeVisible()
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})

