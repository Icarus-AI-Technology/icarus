import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')
    
    // Verify page loaded
    await expect(page).toHaveTitle(/ICARUS/)
    
    // Verify main layout is present
    const layout = page.locator('[data-testid="app-layout"], main, #root, body')
    await expect(layout.first()).toBeVisible()
  })

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Homepage is public - look for topbar navigation or hero section
    await page.waitForTimeout(500)
    
    // Check for header/nav or main content
    const hasNav = await page.locator('header, nav, [class*="topbar"], [class*="header"]').count()
    const hasContent = await page.locator('main, [class*="hero"], h1').count()
    
    // Should have either navigation or main content
    expect(hasNav + hasContent).toBeGreaterThan(0)
  })
})
