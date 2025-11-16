import { test, expect } from '@playwright/test'

test.describe('Component Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase')
    await page.waitForLoadState('networkidle')
  })

  test('should display NeuButton components', async ({ page }) => {
    await page.waitForTimeout(1000)

    const buttons = page.locator('button[class*="neu"], button[class*="Neu"]')
    const buttonCount = await buttons.count()

    // Should have multiple button examples
    expect(buttonCount).toBeGreaterThan(0)
  })

  test('should display NeuCard components', async ({ page }) => {
    const cards = page.locator('[class*="card"], [class*="Card"]')
    const cardCount = await cards.count()

    // Should have multiple card examples
    expect(cardCount).toBeGreaterThan(0)
  })

  test('should have interactive elements', async ({ page }) => {
    const interactiveElements = page.locator('button, input, select, [role="button"], [role="textbox"]')
    const count = await interactiveElements.count()

    // Should have many interactive elements in showcase
    expect(count).toBeGreaterThan(5)
  })

  test('should have code examples', async ({ page }) => {
    await page.waitForTimeout(1000)

    // Look for code blocks or pre tags
    const codeBlocks = page.locator('pre, code, [class*="code"]')
    const hasCodeExamples = await codeBlocks.count()

    // Showcase should have code examples
    expect(hasCodeExamples).toBeGreaterThan(0)
  })

  test('buttons should be clickable', async ({ page }) => {
    await page.waitForTimeout(1000)

    const firstButton = page.locator('button').first()
    await firstButton.waitFor({ state: 'visible' })
    await firstButton.click()

    // Should not throw error
    expect(true).toBe(true)
  })
})

test.describe('Form Components', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showcase')
    await page.waitForLoadState('networkidle')
  })

  test('should have input fields', async ({ page }) => {
    const inputs = page.locator('input')
    const inputCount = await inputs.count()

    expect(inputCount).toBeGreaterThan(0)
  })

  test('inputs should be focusable', async ({ page }) => {
    const firstInput = page.locator('input[type="text"], input[type="email"]').first()

    if (await firstInput.count() > 0) {
      await firstInput.focus()
      await firstInput.fill('Test')

      const value = await firstInput.inputValue()
      expect(value).toBe('Test')
    }
  })
})
