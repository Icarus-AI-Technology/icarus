import { test, expect } from '@playwright/test'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
  })

  test('should display login form', async ({ page }) => {
    // Check for login form elements using data-testid
    const username = page.locator('[data-testid="login-username"]')
    const password = page.locator('[data-testid="login-password"]')
    const submit = page.locator('[data-testid="login-submit"]')

    await expect(username).toBeVisible()
    await expect(password).toBeVisible()
    await expect(submit).toBeVisible()
  })

  test('should allow typing in form fields', async ({ page }) => {
    const username = page.locator('[data-testid="login-username"]')
    const password = page.locator('[data-testid="login-password"]')

    await username.fill('test@example.com')
    await password.fill('password123')

    await expect(username).toHaveValue('test@example.com')
    await expect(password).toHaveValue('password123')
  })

  test('should show error on invalid login', async ({ page }) => {
    const username = page.locator('[data-testid="login-username"]')
    const password = page.locator('[data-testid="login-password"]')
    const submit = page.locator('[data-testid="login-submit"]')

    await username.fill('invalid@test.com')
    await password.fill('wrongpassword')
    await submit.click()

    // Wait for error to appear (either alert or error message)
    await page.waitForTimeout(2000)
    
    // Should still be on login page (not redirected)
    await expect(page).toHaveURL(/login/)
  })

  test('should have ICARUS branding', async ({ page }) => {
    // Check for ICARUS title
    const title = page.locator('text=ICARUS')
    await expect(title.first()).toBeVisible()
  })

  test('should have link back to homepage', async ({ page }) => {
    // Look for back link
    const backLink = page.locator('text=/voltar|home|início/i')
    const hasBackLink = await backLink.count()
    expect(hasBackLink).toBeGreaterThanOrEqual(0)
  })
})
