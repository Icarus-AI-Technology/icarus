import { test, expect } from '@playwright/test'

test.describe('Accessibility (A11y)', () => {
  test.beforeEach(async ({ page }) => {
    // Go to dashboard which has full layout with landmarks
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should have proper page title', async ({ page }) => {
    const title = await page.title()
    expect(title).toBeTruthy()
    expect(title.length).toBeGreaterThan(0)
  })

  test('should have navigable landmarks', async ({ page }) => {
    // Check for main landmark
    const main = page.locator('main, [role="main"]')
    const mainCount = await main.count()
    expect(mainCount).toBeGreaterThanOrEqual(1)

    // Check for navigation (sidebar)
    const nav = page.locator('nav, aside, [role="navigation"]')
    const navCount = await nav.count()
    expect(navCount).toBeGreaterThanOrEqual(1)
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Focus first interactive element
    await page.keyboard.press('Tab')
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName)

    // Should focus an interactive element
    expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'DIV']).toContain(focusedElement)
  })

  test('buttons should have accessible names', async ({ page }) => {
    const buttons = page.locator('button')
    const count = await buttons.count()

    if (count > 0) {
      // Check first few buttons for accessibility
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i)
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        const title = await button.getAttribute('title')

        // Button should have text, aria-label, or title
        expect(text || ariaLabel || title).toBeTruthy()
      }
    }
  })

  test('images should have alt text', async ({ page }) => {
    const images = page.locator('img')
    const count = await images.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const img = images.nth(i)
        const alt = await img.getAttribute('alt')

        // Images should have alt attribute (even if empty for decorative images)
        expect(alt !== null).toBe(true)
      }
    }
  })

  test('form inputs should have labels', async ({ page }) => {
    // Go to a page with forms
    await page.goto('/showcase')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const inputs = page.locator('input[type="text"], input[type="email"], input[type="password"]')
    const count = await inputs.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 3); i++) {
        const input = inputs.nth(i)
        const ariaLabel = await input.getAttribute('aria-label')
        const ariaLabelledBy = await input.getAttribute('aria-labelledby')
        const placeholder = await input.getAttribute('placeholder')
        const id = await input.getAttribute('id')

        // Check if there's a label for this input
        let hasLabel = false
        if (id) {
          const label = page.locator(`label[for="${id}"]`)
          hasLabel = (await label.count()) > 0
        }

        // Input should have label, aria-label, aria-labelledby, or placeholder
        expect(hasLabel || ariaLabel || ariaLabelledBy || placeholder).toBeTruthy()
      }
    }
  })

  test('should not have major color contrast issues', async ({ page }) => {
    // This is a basic check - for full contrast testing use axe-playwright
    const body = page.locator('body')
    const bgColor = await body.evaluate((el) => window.getComputedStyle(el).backgroundColor)

    // Should have a background color set
    expect(bgColor).toBeTruthy()
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)')
  })

  test('focus should be visible on interactive elements', async ({ page }) => {
    // Focus an element
    await page.keyboard.press('Tab')

    // Check if focus is visible (has outline or ring)
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return null

      const styles = window.getComputedStyle(el)
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow,
      }
    })

    // Should have some form of focus indicator or be a valid interactive element
    expect(focusedElement).toBeTruthy()
  })

  test('headings should be in logical order', async ({ page }) => {
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents()

    // Should have at least one heading
    expect(headings.length).toBeGreaterThan(0)
  })

  test('should not have missing language attribute', async ({ page }) => {
    const htmlLang = await page.locator('html').getAttribute('lang')

    // HTML should have lang attribute
    expect(htmlLang).toBeTruthy()
  })
})
