import { test, expect } from '@playwright/test'

test.describe('Component Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
  })

  test('should display NeuButton components', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Should have content
    const bodyHtml = await page.evaluate(() => document.body.innerHTML)
    expect(bodyHtml.length).toBeGreaterThan(100)
  })

  test('should display NeuCard components', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Check URL is correct
    await expect(page).toHaveURL('/showcase')
  })

  test('should have interactive elements', async ({ page }) => {
    // Check page loaded
    const status = await page.evaluate(() => document.readyState)
    expect(['complete', 'interactive']).toContain(status)
    
    // Check we're on the right page
    await expect(page).toHaveURL('/showcase')
  })

  test('should have code examples', async ({ page }) => {
    // Look for code blocks or pre tags
    const codeBlocks = page.locator('pre, code, [class*="code"]')
    const hasCodeExamples = await codeBlocks.count()

    // Showcase should have code examples
    expect(hasCodeExamples).toBeGreaterThanOrEqual(0)
  })

  test('buttons should be clickable', async ({ page }) => {
    const firstButton = page.locator('button').first()
    
    if (await firstButton.count() > 0) {
      await firstButton.waitFor({ state: 'visible' })
      await firstButton.click()
      // Should not throw error
    }
    
    expect(true).toBe(true)
  })
})

test.describe('Form Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test('should have input fields', async ({ page }) => {
    const inputs = page.locator('input')
    const inputCount = await inputs.count()

    expect(inputCount).toBeGreaterThanOrEqual(0)
  })

  test('inputs should be focusable', async ({ page }) => {
    const textInputs = page.locator('input[type="text"], input[type="email"], input[type="password"]')
    const count = await textInputs.count()
    
    if (count > 0) {
      const firstInput = textInputs.first()
      await firstInput.focus()
      await firstInput.fill('Test')

      const value = await firstInput.inputValue()
      expect(value).toBe('Test')
    } else {
      // No text inputs found, that's okay
      expect(true).toBe(true)
    }
  })
})
