import { test, expect } from '@playwright/test'

/**
 * Testes E2E - Tema e Dark Mode
 * Valida troca de tema e consistência visual
 */

test.describe('Dark Glass Medical Theme', () => {
  test('Deve carregar em dark mode por padrão', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verificar se o body tem classe dark ou data-theme="dark"
    const bodyClass = await page.locator('body').getAttribute('class')
    const dataTheme = await page.locator('body').getAttribute('data-theme')
    
    const isDarkMode = bodyClass?.includes('dark') || dataTheme === 'dark'
    expect(isDarkMode).toBeTruthy()
  })

  test('Deve alternar entre light e dark mode', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Localizar botão de toggle de tema
    const themeToggle = page.locator('[aria-label*="theme"], [data-testid*="theme-toggle"]').first()
    
    if (await themeToggle.isVisible()) {
      // Estado inicial (dark)
      const initialClass = await page.locator('body').getAttribute('class')
      
      // Alternar para light
      await themeToggle.click()
      await page.waitForTimeout(300) // Aguardar animação
      
      const afterToggleClass = await page.locator('body').getAttribute('class')
      
      // Verificar se mudou
      expect(afterToggleClass).not.toBe(initialClass)
    }
  })

  test('Deve manter tema após navegação', async ({ page }) => {
    await page.goto('/dashboard')
    
    const themeToggle = page.locator('[aria-label*="theme"]').first()
    
    if (await themeToggle.isVisible()) {
      await themeToggle.click()
      const themeAfterToggle = await page.locator('body').getAttribute('class')
      
      // Navegar para outro módulo
      await page.goto('/gestao-cadastros')
      
      const themeAfterNavigation = await page.locator('body').getAttribute('class')
      
      // Tema deve ser mantido
      expect(themeAfterNavigation).toBe(themeAfterToggle)
    }
  })
})

test.describe('Neumorphic Effects', () => {
  test('Cards devem ter efeito neumórfico', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verificar se cards têm shadow (neumorphism)
    const cards = page.locator('[class*="shadow"], [class*="neu"]')
    const count = await cards.count()
    
    expect(count).toBeGreaterThan(0)
  })
})

