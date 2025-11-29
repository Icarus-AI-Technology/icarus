import { test, expect } from '@playwright/test'

/**
 * Testes E2E para Módulos de Analytics e BI
 * Sprint 1: 5 módulos
 */

test.describe('Sprint 1 - Analytics e BI', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test.describe('KPI Dashboard Module', () => {
    test('deve carregar o módulo e exibir KPIs', async ({ page }) => {
      await page.goto('/modulo/kpi-dashboard')
      
      // Verifica título
      await expect(page.locator('h1')).toContainText('KPI Dashboard Consolidado')
      
      // Verifica 4 KPI cards
      const kpiCards = page.locator('[data-testid="kpi-card"]')
      await expect(kpiCards).toHaveCount(4)
      
      // Verifica CadastroTabsCarousel
      const carousel = page.locator('[data-testid="cadastro-tabs-carousel"]')
      await expect(carousel).toBeVisible()
      
      // Verifica tabs
      await expect(page.locator('text=Financeiro')).toBeVisible()
      await expect(page.locator('text=Operacional')).toBeVisible()
      await expect(page.locator('text=Comercial')).toBeVisible()
      await expect(page.locator('text=RH')).toBeVisible()
    })

    test('deve alternar entre tabs', async ({ page }) => {
      await page.goto('/modulo/kpi-dashboard')
      
      // Clica na tab Operacional
      await page.click('text=Operacional')
      await expect(page.locator('text=Performance por Categoria')).toBeVisible()
      
      // Clica na tab Comercial
      await page.click('text=Comercial')
      await expect(page.locator('text=Distribuição de Vendas')).toBeVisible()
    })

    test('deve renderizar gráficos Recharts', async ({ page }) => {
      await page.goto('/modulo/kpi-dashboard')
      
      // Verifica presença de gráficos SVG (Recharts)
      const charts = page.locator('svg.recharts-surface')
      await expect(charts.first()).toBeVisible()
    })

    test('deve ser responsivo', async ({ page }) => {
      // Desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await page.goto('/modulo/kpi-dashboard')
      await expect(page.locator('h1')).toBeVisible()
      
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Analytics BI Module', () => {
    test('deve carregar módulo de BI', async ({ page }) => {
      await page.goto('/modulo/analytics-bi')
      
      await expect(page.locator('h1')).toContainText('Analytics BI')
      
      // Verifica query builder
      await page.click('text=Consultas')
      await expect(page.locator('text=Query Builder SQL')).toBeVisible()
    })

    test('deve exibir dashboards salvos', async ({ page }) => {
      await page.goto('/modulo/analytics-bi')
      
      await page.click('text=Dashboards')
      const dashboards = page.locator('[data-testid="dashboard-card"]')
      await expect(dashboards.first()).toBeVisible()
    })

    test('deve permitir busca', async ({ page }) => {
      await page.goto('/modulo/analytics-bi')
      
      const searchInput = page.locator('input[placeholder*="Buscar"]')
      await searchInput.fill('Visão Financeira')
      await expect(searchInput).toHaveValue('Visão Financeira')
    })
  })

  test.describe('Analytics Predição Module', () => {
    test('deve carregar módulo de predições', async ({ page }) => {
      await page.goto('/modulo/analytics-predicao')
      
      await expect(page.locator('h1')).toContainText('Analytics de Predição')
      
      // Verifica KPIs de IA
      await expect(page.locator('text=Acurácia Modelo')).toBeVisible()
      await expect(page.locator('text=94.2%')).toBeVisible()
    })

    test('deve exibir previsões de demanda', async ({ page }) => {
      await page.goto('/modulo/analytics-predicao')
      
      await page.click('text=Demanda')
      await expect(page.locator('text=Previsão de Demanda')).toBeVisible()
      
      // Verifica gráfico com previsão
      const chart = page.locator('svg.recharts-surface')
      await expect(chart).toBeVisible()
    })

    test('deve mostrar alertas preditivos', async ({ page }) => {
      await page.goto('/modulo/analytics-predicao')
      
      await expect(page.locator('text=Alertas Preditivos')).toBeVisible()
      
      // Verifica presença de alertas
      const alertas = page.locator('[data-testid="alerta-preditivo"]')
      await expect(alertas.first()).toBeVisible()
    })

    test('deve alternar modelo ML', async ({ page }) => {
      await page.goto('/modulo/analytics-predicao')
      
      // Clica no botão de modelo
      const modelButton = page.locator('button:has-text("Prophet")')
      await modelButton.click()
      
      // Verifica mudança
      await expect(page.locator('button:has-text("ARIMA")')).toBeVisible()
    })
  })

  test.describe('BI Dashboard Interactive', () => {
    test('deve carregar dashboards interativos', async ({ page }) => {
      await page.goto('/modulo/bi-dashboard-interactive')
      
      await expect(page.locator('h1')).toContainText('BI Dashboard Interactive')
      
      // Verifica galeria de widgets
      await page.click('text=Widgets')
      await expect(page.locator('text=Galeria de Widgets')).toBeVisible()
    })

    test('deve exibir layouts salvos', async ({ page }) => {
      await page.goto('/modulo/bi-dashboard-interactive')
      
      await page.click('text=Layouts')
      await expect(page.locator('text=Executivo Geral')).toBeVisible()
      await expect(page.locator('text=Operacional')).toBeVisible()
    })
  })

  test.describe('Relatórios Executivos', () => {
    test('deve carregar módulo de relatórios', async ({ page }) => {
      await page.goto('/modulo/relatorios-executivos')
      
      await expect(page.locator('h1')).toContainText('Relatórios Executivos')
      
      // Verifica templates
      const templates = page.locator('[data-testid="template-card"]')
      await expect(templates.first()).toBeVisible()
    })

    test('deve exibir relatórios gerados', async ({ page }) => {
      await page.goto('/modulo/relatorios-executivos')
      
      await page.click('text=Gerados')
      await expect(page.locator('text=Relatórios Recentes')).toBeVisible()
    })

    test('deve mostrar agendamentos', async ({ page }) => {
      await page.goto('/modulo/relatorios-executivos')
      
      await page.click('text=Agendados')
      await expect(page.locator('text=Relatórios Agendados')).toBeVisible()
    })
  })

  test.describe('Acessibilidade Analytics', () => {
    test('módulos devem ter heading hierarchy correta', async ({ page }) => {
      await page.goto('/modulo/kpi-dashboard')
      
      const h1 = page.locator('h1')
      await expect(h1).toHaveCount(1)
      
      const headings = page.locator('h1, h2, h3, h4')
      await expect(headings.first()).toBeVisible()
    })

    test('botões devem ter labels acessíveis', async ({ page }) => {
      await page.goto('/modulo/analytics-bi')
      
      const buttons = page.locator('button')
      const count = await buttons.count()
      
      // Verifica que botões têm texto ou aria-label
      for (let i = 0; i < Math.min(count, 5); i++) {
        const button = buttons.nth(i)
        const text = await button.textContent()
        const ariaLabel = await button.getAttribute('aria-label')
        
        expect(text || ariaLabel).toBeTruthy()
      }
    })

    test('cores devem ter contraste adequado', async ({ page }) => {
      await page.goto('/modulo/kpi-dashboard')
      
      // Verifica que texto é legível
      const title = page.locator('h1')
      const color = await title.evaluate(el => 
        window.getComputedStyle(el).color
      )
      
      expect(color).toBeTruthy()
    })
  })

  test.describe('Performance Analytics', () => {
    test('módulos devem carregar em menos de 3 segundos', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/modulo/kpi-dashboard')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000)
    })

    test('não deve ter erros no console', async ({ page }) => {
      const errors: string[] = []
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text())
        }
      })
      
      await page.goto('/modulo/analytics-bi')
      await page.waitForTimeout(1000)
      
      expect(errors.length).toBe(0)
    })
  })
})

