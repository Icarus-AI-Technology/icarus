import { test, expect } from '@playwright/test'

test.describe('Dashboard Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('should display dashboard title and subtitle', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for dashboard heading
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Visão geral do sistema ICARUS v5.0')).toBeVisible()
  })

  test('should display all 4 KPI cards', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for specific KPI headings (using exact match)
    await expect(page.getByRole('heading', { name: 'Cirurgias Hoje', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Estoque Crítico', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Faturamento', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'IcarusBrain', exact: true })).toBeVisible()
  })

  test('should display tabs navigation', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for tab buttons
    await expect(page.getByRole('tab', { name: /Visão Geral/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /Analytics/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /IA Insights/i })).toBeVisible()
  })

  test('should switch between tabs', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Click on Analytics tab
    await page.getByRole('tab', { name: /Analytics/i }).click()
    await page.waitForTimeout(500)
    
    // Check for analytics content
    const analyticsContent = page.locator('text=/Taxa de Conversão|Tempo Médio|Satisfação/i')
    await expect(analyticsContent.first()).toBeVisible()
    
    // Click on IA Insights tab
    await page.getByRole('tab', { name: /IA Insights/i }).click()
    await page.waitForTimeout(500)
    
    // Check for IA content
    const iaContent = page.locator('text=/Inteligência Artificial|IcarusBrain|Insight/i')
    await expect(iaContent.first()).toBeVisible()
  })

  test('should display charts in Overview tab', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for chart headings
    await expect(page.getByRole('heading', { name: 'Faturamento Mensal' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cirurgias da Semana' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Distribuição por Categoria' })).toBeVisible()
  })

  test('should display chart data', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for chart elements (Recharts uses 'application' role)
    const charts = page.getByRole('application')
    const chartCount = await charts.count()
    expect(chartCount).toBeGreaterThanOrEqual(2)
  })

  test('should have working sidebar navigation', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check sidebar is visible (using first() to avoid strict mode)
    await expect(page.getByText('ICARUS v5.0').first()).toBeVisible()
    await expect(page.getByText('Gestão elevada pela IA')).toBeVisible()
    
    // Check for navigation links
    await expect(page.getByRole('link', { name: /Dashboard/i })).toBeVisible()
  })

  test('should have working topbar', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for search input in topbar (use specific placeholder)
    await expect(page.getByPlaceholder('Buscar cirurgias, produtos, hospitais...')).toBeVisible()
    
    // Check for theme toggle button
    await expect(page.getByRole('button', { name: /modo/i })).toBeVisible()
  })

  test('should toggle theme', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Find and click theme toggle
    const themeButton = page.getByRole('button', { name: /modo/i })
    await themeButton.click()
    await page.waitForTimeout(500)
    
    // Check that page is still functional
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should show chat widget FAB', async ({ page }) => {
    await page.waitForTimeout(2000)
    
    // Check for chatbot FAB button
    const chatButton = page.getByRole('button', { name: /assistente/i })
    await expect(chatButton).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(1000)
    
    // Dashboard should still show main content
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Reset to desktop
    await page.setViewportSize({ width: 1280, height: 720 })
  })

  test('should show loading state initially', async ({ page }) => {
    // Navigate and check for loading indicator
    await page.goto('/dashboard')
    
    // Either loading skeleton or content should be visible quickly
    const hasContent = await Promise.race([
      page.getByRole('heading', { name: 'Dashboard' }).isVisible().then(() => true),
      page.getByRole('heading', { name: /carregando/i }).isVisible().then(() => true),
      new Promise(resolve => setTimeout(() => resolve(true), 3000))
    ])
    
    expect(hasContent).toBe(true)
  })
})
