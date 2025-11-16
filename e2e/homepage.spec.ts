import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load the application', async ({ page }) => {
    await page.goto('/')
    
    // Verifica se a página carregou
    await expect(page).toHaveTitle(/ICARUS/)
    
    // Verifica se o layout principal está presente
    const layout = page.locator('[data-testid="app-layout"], main, #root')
    await expect(layout).toBeVisible()
  })

  test('should have navigation menu', async ({ page }) => {
    await page.goto('/')
    
    // Aguarda um elemento de navegação comum aparecer
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 5000 })
    
    // Verifica se existe algum tipo de menu/navegação
    const hasNav = await page.locator('nav, aside, [role="navigation"]').count()
    expect(hasNav).toBeGreaterThan(0)
  })
})
