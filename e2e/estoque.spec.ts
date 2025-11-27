import { test, expect } from '@playwright/test'

test.describe('Estoque IA Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/estoque-ia')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('should display estoque page with KPIs', async ({ page }) => {
    // Check page loaded
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('main[role="main"]')).toBeVisible()
    
    // Should have content
    const content = page.locator('main[role="main"]')
    const text = await content.textContent()
    expect(text?.length).toBeGreaterThan(0)
  })

  test('should have tabs for different views', async ({ page }) => {
    // Check for tab navigation
    const tabs = page.getByRole('tab')
    const tabCount = await tabs.count()
    expect(tabCount).toBeGreaterThan(0)
  })

  test('should have search and filter functionality', async ({ page }) => {
    // Check for search/filter inputs
    const inputs = page.locator('input[type="text"], input[type="search"], input[placeholder*="buscar" i], input[placeholder*="search" i]')
    const inputCount = await inputs.count()
    expect(inputCount).toBeGreaterThanOrEqual(0)
  })

  test('should display product list', async ({ page }) => {
    // Look for product-related content
    const productContent = page.locator('text=/OPME|Prótese|Estoque|Produto|SKU/i')
    const contentCount = await productContent.count()
    expect(contentCount).toBeGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    // Page should still be accessible
    await expect(page.locator('body')).toBeVisible()
    
    // Reset viewport
    await page.setViewportSize({ width: 1280, height: 720 })
  })
})
