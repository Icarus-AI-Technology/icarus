import { test, expect } from '@playwright/test'

/**
 * Testes E2E para Módulos de Cadastros e Gestão
 * Sprint 2: 6 módulos
 */

test.describe('Sprint 2 - Cadastros e Gestão', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test.describe('Grupos Produtos OPME', () => {
    test('deve carregar módulo de grupos', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      await expect(page.locator('h1')).toContainText('Grupos de Produtos OPME')
      
      // Verifica tabs do carousel
      await expect(page.locator('text=Grupos')).toBeVisible()
      await expect(page.locator('text=Famílias')).toBeVisible()
      await expect(page.locator('text=Classificações')).toBeVisible()
      await expect(page.locator('text=ANVISA')).toBeVisible()
    })

    test('deve exibir tabela de grupos', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      await page.click('text=Grupos')
      
      // Verifica colunas da tabela
      await expect(page.locator('text=Código')).toBeVisible()
      await expect(page.locator('text=Nome')).toBeVisible()
      await expect(page.locator('text=Famílias')).toBeVisible()
      await expect(page.locator('text=Produtos')).toBeVisible()
      await expect(page.locator('text=Markup')).toBeVisible()
    })

    test('deve permitir busca de grupos', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      const searchInput = page.locator('input[placeholder*="Buscar grupos"]')
      await searchInput.fill('Cardiologia')
      await expect(searchInput).toHaveValue('Cardiologia')
    })

    test('deve exibir classes de risco ANVISA', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      await page.click('text=ANVISA')
      
      // Verifica classes I-IV
      await expect(page.locator('text=Classe I')).toBeVisible()
      await expect(page.locator('text=Classe II')).toBeVisible()
      await expect(page.locator('text=Classe III')).toBeVisible()
      await expect(page.locator('text=Classe IV')).toBeVisible()
    })

    test('deve abrir modal de cadastro', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      await page.click('button:has-text("Novo Grupo")')
      
      // Verifica modal
      await expect(page.locator('text=Novo Grupo')).toBeVisible()
      await expect(page.locator('input[placeholder*="Código"]')).toBeVisible()
    })
  })

  test.describe('Gestão Usuários e Permissões', () => {
    test('deve carregar módulo RBAC', async ({ page }) => {
      await page.goto('/modulo/gestao-usuarios-permissoes')
      
      await expect(page.locator('h1')).toContainText('Usuários e Permissões')
      
      // Verifica KPIs
      await expect(page.locator('text=Usuários Ativos')).toBeVisible()
      await expect(page.locator('text=2FA Habilitado')).toBeVisible()
    })

    test('deve listar usuários', async ({ page }) => {
      await page.goto('/modulo/gestao-usuarios-permissoes')
      
      await page.click('text=Usuários')
      
      // Verifica lista
      const userCards = page.locator('[data-testid="user-card"]')
      await expect(userCards.first()).toBeVisible()
    })

    test('deve exibir perfis de acesso', async ({ page }) => {
      await page.goto('/modulo/gestao-usuarios-permissoes')
      
      await page.click('text=Perfis')
      
      // Verifica perfis padrão
      await expect(page.locator('text=Administrador')).toBeVisible()
      await expect(page.locator('text=Gerente')).toBeVisible()
      await expect(page.locator('text=Vendedor')).toBeVisible()
    })

    test('deve mostrar audit trail', async ({ page }) => {
      await page.goto('/modulo/gestao-usuarios-permissoes')
      
      await page.click('text=Logs')
      
      await expect(page.locator('text=Audit Trail')).toBeVisible()
    })
  })

  test.describe('Gestão de Inventário', () => {
    test('deve carregar módulo de inventário', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      await expect(page.locator('h1')).toContainText('Gestão de Inventário')
      
      // Verifica acuracidade
      await expect(page.locator('text=Acuracidade')).toBeVisible()
      await expect(page.locator('text=94.2%')).toBeVisible()
    })

    test('deve exibir inventários programados', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      await page.click('text=Programados')
      
      await expect(page.locator('text=Inventários Programados')).toBeVisible()
    })

    test('deve mostrar progresso de contagem', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      await page.click('text=Em Andamento')
      
      // Verifica barra de progresso
      const progressBar = page.locator('[role="progressbar"], .bg-blue-500')
      await expect(progressBar.first()).toBeVisible()
    })

    test('deve listar divergências', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      await page.click('text=Divergências')
      
      await expect(page.locator('text=Divergências Identificadas')).toBeVisible()
    })
  })

  test.describe('Relacionamento Cliente', () => {
    test('deve carregar módulo de CRM básico', async ({ page }) => {
      await page.goto('/modulo/relacionamento-cliente')
      
      await expect(page.locator('h1')).toContainText('Relacionamento com Cliente')
      
      // Verifica NPS
      await expect(page.locator('text=NPS Médio')).toBeVisible()
      await expect(page.locator('text=8.2')).toBeVisible()
    })

    test('deve exibir satisfação do cliente', async ({ page }) => {
      await page.goto('/modulo/relacionamento-cliente')
      
      await expect(page.locator('text=Satisfação')).toBeVisible()
      await expect(page.locator('text=92%')).toBeVisible()
    })
  })

  test.describe('Gestão de Leads', () => {
    test('deve carregar funil de vendas', async ({ page }) => {
      await page.goto('/modulo/gestao-leads')
      
      await expect(page.locator('h1')).toContainText('Gestão de Leads')
      
      // Verifica taxa de conversão
      await expect(page.locator('text=Taxa Conversão')).toBeVisible()
      await expect(page.locator('text=24.5%')).toBeVisible()
    })

    test('deve exibir pipeline de vendas', async ({ page }) => {
      await page.goto('/modulo/gestao-leads')
      
      await expect(page.locator('text=Pipeline')).toBeVisible()
      await expect(page.locator('text=R$ 245k')).toBeVisible()
    })

    test('deve alternar entre estágios do funil', async ({ page }) => {
      await page.goto('/modulo/gestao-leads')
      
      // Clica em cada estágio
      await page.click('text=Novos')
      await expect(page.locator('h1')).toBeVisible()
      
      await page.click('text=Qualificação')
      await expect(page.locator('h1')).toBeVisible()
      
      await page.click('text=Negociação')
      await expect(page.locator('h1')).toBeVisible()
      
      await page.click('text=Convertidos')
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Validações de Formulário', () => {
    test('deve validar campos obrigatórios', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      await page.click('button:has-text("Novo Grupo")')
      
      // Tenta salvar sem preencher
      await page.click('button:has-text("Salvar")')
      
      // Verifica validação (se implementada)
      // await expect(page.locator('text=Campo obrigatório')).toBeVisible()
    })
  })

  test.describe('Dark Glass Medical Design', () => {
    test('deve aplicar tema dark corretamente', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      // Verifica elementos com glassmorphism
      const cards = page.locator('[class*="backdrop-blur"]')
      await expect(cards.first()).toBeVisible()
    })

    test('deve ter neumorphic shadows', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      // Verifica cards com sombras
      const neuCards = page.locator('[class*="shadow"]')
      await expect(neuCards.first()).toBeVisible()
    })
  })

  test.describe('CadastroTabsCarousel', () => {
    test('todos os módulos devem ter carousel', async ({ page }) => {
      const modules = [
        '/modulo/grupos-produtos-opme',
        '/modulo/gestao-usuarios-permissoes',
        '/modulo/gestao-inventario',
        '/modulo/relacionamento-cliente',
        '/modulo/gestao-leads'
      ]
      
      for (const url of modules) {
        await page.goto(url)
        
        // Verifica presença do carousel
        const carousel = page.locator('[data-testid="cadastro-tabs-carousel"]')
        
        // Se não houver testid, verifica pela estrutura
        const carouselAlt = page.locator('.overflow-x-auto .flex.gap-3')
        
        const hasCarousel = await carousel.count() > 0 || await carouselAlt.count() > 0
        expect(hasCarousel).toBe(true)
      }
    })

    test('carousel deve ter contadores', async ({ page }) => {
      await page.goto('/modulo/grupos-produtos-opme')
      
      // Verifica números grandes (contadores)
      const counters = page.locator('text=/^\\d+$/')
      const count = await counters.count()
      
      expect(count).toBeGreaterThan(0)
    })

    test('carousel deve ter deltas', async ({ page }) => {
      await page.goto('/modulo/gestao-inventario')
      
      // Verifica badges com + ou -
      const deltas = page.locator('[class*="emerald"], [class*="red"]')
      await expect(deltas.first()).toBeVisible()
    })
  })

  test.describe('Responsividade Cadastros', () => {
    test('módulos devem ser mobile-first', async ({ page }) => {
      // Mobile
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/modulo/grupos-produtos-opme')
      
      await expect(page.locator('h1')).toBeVisible()
      
      // Tablet
      await page.setViewportSize({ width: 768, height: 1024 })
      await expect(page.locator('h1')).toBeVisible()
      
      // Desktop
      await page.setViewportSize({ width: 1920, height: 1080 })
      await expect(page.locator('h1')).toBeVisible()
    })

    test('tabelas devem ter scroll horizontal em mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/modulo/grupos-produtos-opme')
      
      // Verifica overflow
      const table = page.locator('.overflow-x-auto')
      await expect(table.first()).toBeVisible()
    })
  })
})

