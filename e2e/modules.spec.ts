import { test, expect } from '@playwright/test'

test.describe('Modules Navigation and Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('should navigate to Estoque IA module', async ({ page }) => {
    await page.click('text=Estoque IA')
    await expect(page).toHaveURL('/estoque-ia')
    await expect(page.locator('h1, h2, [data-testid="module-title"]')).toBeVisible()
  })

  test('should navigate to Cirurgias module', async ({ page }) => {
    await page.click('text=Cirurgias')
    await expect(page).toHaveURL('/cirurgias')
    await expect(page.locator('h1, h2, [data-testid="module-title"]')).toBeVisible()
  })

  test('should navigate to Financeiro module', async ({ page }) => {
    await page.click('text=Financeiro')
    await expect(page).toHaveURL('/financeiro')
    await expect(page.locator('h1, h2, [data-testid="module-title"]')).toBeVisible()
  })

  test('should navigate to CRM & Vendas module', async ({ page }) => {
    await page.click('text=CRM & Vendas')
    await expect(page).toHaveURL('/crm-vendas')
    await expect(page.locator('h1, h2, [data-testid="module-title"]')).toBeVisible()
  })

  test('should navigate to Produtos OPME module', async ({ page }) => {
    await page.click('text=Produtos OPME')
    await expect(page).toHaveURL('/produtos')
    await expect(page.locator('h1, h2, [data-testid="module-title"]')).toBeVisible()
  })

  test('should navigate to Showcase module', async ({ page }) => {
    // Find Dev Tools section and click Showcase
    const devToolsSection = page.locator('text=Dev Tools').first()
    await devToolsSection.click()

    await page.click('text=Showcase')
    await expect(page).toHaveURL('/showcase')
    await expect(page.locator('h1, h2, text=/Showcase|Componentes/')).toBeVisible()
  })

  test('should display module placeholders for unimplemented modules', async ({ page }) => {
    // Try to access an unimplemented module
    await page.goto('/compras')
    await expect(page).toHaveURL('/compras')

    // Should show placeholder or module content
    const content = page.locator('main, [role="main"], #root')
    await expect(content).toBeVisible()
  })

  test('all navigation categories should be expandable', async ({ page }) => {
    const categories = [
      'Principal',
      'Core Business',
      'Compras & Fornecedores',
      'Cadastros & Gestão',
      'Operações & Logística',
      'Analytics & BI',
      'Marketing & Vendas',
      'Automação & IA',
      'Integrações',
      'Dev Tools'
    ]

    for (const category of categories) {
      const categoryElement = page.locator(`text=${category}`).first()
      if (await categoryElement.isVisible()) {
        await categoryElement.click()
        await page.waitForTimeout(300) // Wait for animation
      }
    }
  })
})
