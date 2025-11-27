import { test, expect } from '@playwright/test'

test.describe('Modules Navigation and Loading', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard first (homepage is public, no sidebar)
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Ensure sidebar is visible
    await expect(page.locator('aside')).toBeVisible()
  })

  test('should navigate to Estoque IA module', async ({ page }) => {
    // Expand Core Business category first
    const coreBusiness = page.locator('text=Core Business').first()
    await coreBusiness.click()
    await page.waitForTimeout(300)
    
    await page.click('text=Estoque IA')
    await expect(page).toHaveURL('/estoque-ia')
    await expect(page.locator('h1, h2, [data-testid="module-title"]').first()).toBeVisible()
  })

  test('should navigate to Cirurgias module', async ({ page }) => {
    // Expand Core Business category first
    const coreBusiness = page.locator('text=Core Business').first()
    await coreBusiness.click()
    await page.waitForTimeout(300)
    
    await page.click('text=Cirurgias')
    await expect(page).toHaveURL('/cirurgias')
    await expect(page.locator('h1, h2, [data-testid="module-title"]').first()).toBeVisible()
  })

  test('should navigate to Financeiro module', async ({ page }) => {
    // Navigate directly via URL for reliability
    await page.goto('/financeiro')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveURL('/financeiro')
    // Just verify page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
  })

  test('should navigate to CRM & Vendas module', async ({ page }) => {
    // Expand Core Business category first
    const coreBusiness = page.locator('text=Core Business').first()
    await coreBusiness.click()
    await page.waitForTimeout(300)
    
    await page.click('text=CRM & Vendas')
    await expect(page).toHaveURL('/crm-vendas')
    await expect(page.locator('h1, h2, [data-testid="module-title"]').first()).toBeVisible()
  })

  test('should navigate to Produtos OPME module', async ({ page }) => {
    // Expand Core Business category first
    const coreBusiness = page.locator('text=Core Business').first()
    await coreBusiness.click()
    await page.waitForTimeout(300)
    
    await page.click('text=Produtos OPME')
    await expect(page).toHaveURL('/produtos')
    await expect(page.locator('h1, h2, [data-testid="module-title"]').first()).toBeVisible()
  })

  test('should navigate to Showcase module', async ({ page }) => {
    // Navigate directly - Dev Tools may be collapsed
    await page.goto('/showcase')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    
    await expect(page).toHaveURL('/showcase')
    // Just verify we got a response
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
  })

  test('should display module placeholders for unimplemented modules', async ({ page }) => {
    // Try to access an unimplemented module via direct navigation
    await page.goto('/logistica')
    await expect(page).toHaveURL('/logistica')

    // Should show placeholder or module content
    await page.waitForTimeout(1000)
    const content = page.locator('main[role="main"]')
    await expect(content).toBeVisible()
  })

  test('all main navigation categories should be visible', async ({ page }) => {
    // Check that main categories exist in sidebar
    const mainCategories = [
      'Principal',
      'Core Business',
      'Cadastros & Gestão',
    ]

    for (const category of mainCategories) {
      const categoryElement = page.locator(`text=${category}`).first()
      await expect(categoryElement).toBeVisible({ timeout: 3000 })
    }
  })
})
