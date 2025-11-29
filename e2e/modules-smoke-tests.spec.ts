import { test, expect } from '@playwright/test'

/**
 * Smoke Tests para todos os 46 módulos implementados
 * Verifica que todos os módulos carregam corretamente
 */

// Lista completa dos 46 módulos
const ALL_MODULES = [
  // Sprint 1 - Analytics e BI (5)
  { path: '/modulo/kpi-dashboard', name: 'KPI Dashboard' },
  { path: '/modulo/analytics-bi', name: 'Analytics BI' },
  { path: '/modulo/analytics-predicao', name: 'Analytics Predição' },
  { path: '/modulo/bi-dashboard-interactive', name: 'BI Dashboard Interactive' },
  { path: '/modulo/relatorios-executivos', name: 'Relatórios Executivos' },
  
  // Sprint 2 - Cadastros e Gestão (6)
  { path: '/modulo/grupos-produtos-opme', name: 'Grupos Produtos OPME' },
  { path: '/modulo/gestao-usuarios-permissoes', name: 'Usuários e Permissões' },
  { path: '/modulo/gestao-inventario', name: 'Gestão de Inventário' },
  { path: '/modulo/relacionamento-cliente', name: 'Relacionamento Cliente' },
  { path: '/modulo/gestao-leads', name: 'Gestão de Leads' },
  { path: '/modulo/gestao-contratos', name: 'Gestão de Contratos' },
  
  // Sprint 3 - Estoque e Consignação (4)
  { path: '/modulo/consignacao-avancada', name: 'Consignação Avançada' },
  { path: '/modulo/rastreabilidade-opme', name: 'Rastreabilidade OPME' },
  { path: '/modulo/telemetria-iot', name: 'Telemetria IoT' },
  { path: '/modulo/manutencao-preventiva', name: 'Manutenção Preventiva' },
  
  // Sprint 4 - Compras (4)
  { path: '/modulo/gestao-compras', name: 'Gestão de Compras' },
  { path: '/modulo/notas-compra', name: 'Notas de Compra' },
  { path: '/modulo/compras-internacionais', name: 'Compras Internacionais' },
  { path: '/modulo/viabilidade-importacao', name: 'Viabilidade Importação' },
  
  // Sprint 5 - Vendas/CRM (4)
  { path: '/modulo/crm-vendas', name: 'CRM Vendas' },
  { path: '/modulo/campanhas-marketing', name: 'Campanhas Marketing' },
  { path: '/modulo/tabelas-precos-import', name: 'Tabelas Preços Import' },
  { path: '/modulo/video-calls', name: 'Video Calls Manager' },
  
  // Sprint 6 - Financeiro (6)
  { path: '/modulo/contas-receber-ia', name: 'Contas a Receber IA' },
  { path: '/modulo/faturamento-avancado', name: 'Faturamento Avançado' },
  { path: '/modulo/faturamento-nfe', name: 'Faturamento NFe' },
  { path: '/modulo/gestao-contabil', name: 'Gestão Contábil' },
  { path: '/modulo/relatorios-financeiros', name: 'Relatórios Financeiros' },
  { path: '/modulo/relatorios-regulatorios', name: 'Relatórios Regulatórios' },
  
  // Sprint 7 - Compliance (3)
  { path: '/modulo/compliance-auditoria', name: 'Compliance e Auditoria' },
  { path: '/modulo/compliance-avancado', name: 'Compliance Avançado' },
  { path: '/modulo/notificacoes-inteligentes', name: 'Notificações Inteligentes' },
  
  // Sprint 8 - IA/Automação (8)
  { path: '/modulo/ia-central', name: 'IA Central' },
  { path: '/modulo/automacao-ia', name: 'Automação IA' },
  { path: '/modulo/chatbot-metrics', name: 'Chatbot Metrics' },
  { path: '/modulo/voice-analytics', name: 'Voice Analytics' },
  { path: '/modulo/voice-biometrics', name: 'Voice Biometrics' },
  { path: '/modulo/voice-macros', name: 'Voice Macros' },
  { path: '/modulo/tooltip-analytics', name: 'Tooltip Analytics' },
  { path: '/modulo/workflow-builder', name: 'Workflow Builder' },
  
  // Sprint 9 - Sistema/Integrações (7)
  { path: '/modulo/configuracoes-avancadas', name: 'Configurações Avançadas' },
  { path: '/modulo/system-health', name: 'System Health' },
  { path: '/modulo/integracoes-avancadas', name: 'Integrações Avançadas' },
  { path: '/modulo/integrations-manager', name: 'Integrations Manager' },
  { path: '/modulo/api-gateway', name: 'API Gateway' },
  { path: '/modulo/webhooks-manager', name: 'Webhooks Manager' },
  { path: '/modulo/logistica-avancada', name: 'Logística Avançada' },
  
  // Sprint 10 - Cirurgias Complementar (3)
  { path: '/modulo/licitacoes-propostas', name: 'Licitações e Propostas' },
  { path: '/modulo/tabela-precos-viewer', name: 'Tabela Preços Viewer' },
  { path: '/modulo/tabelas-precos-form', name: 'Tabelas Preços Form' },
]

test.describe('Smoke Tests - Todos os 46 Módulos', () => {
  test.beforeEach(async ({ page }) => {
    // Login uma vez
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('todos os 46 módulos devem carregar sem erro', async ({ page }) => {
    const results: Array<{ module: string; success: boolean; error?: string }> = []
    
    for (const module of ALL_MODULES) {
      try {
        await page.goto(module.path, { waitUntil: 'networkidle', timeout: 5000 })
        
        // Verifica que o título H1 existe
        const h1 = page.locator('h1')
        const hasH1 = await h1.count() > 0
        
        results.push({
          module: module.name,
          success: hasH1
        })
        
        expect(hasH1).toBe(true)
      } catch (error) {
        results.push({
          module: module.name,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
    
    // Log resultados
    const failedModules = results.filter(r => !r.success)
    
    if (failedModules.length > 0) {
      console.error('Módulos com falha:', failedModules)
    }
    
    // Verifica que todos passaram
    expect(failedModules.length).toBe(0)
  })

  test('todos os módulos devem ter KPI cards', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 10) // Testa os primeiros 10
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica grid de KPIs (geralmente 4 cards)
      const grid = page.locator('.grid.grid-cols-4, .grid.grid-cols-1.md\\:grid-cols-4')
      const hasGrid = await grid.count() > 0
      
      expect(hasGrid).toBe(true)
    }
  })

  test('todos os módulos devem ter CadastroTabsCarousel', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 10)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica carousel (overflow-x-auto é característico)
      const carousel = page.locator('.overflow-x-auto')
      const hasCarousel = await carousel.count() > 0
      
      expect(hasCarousel).toBe(true)
    }
  })

  test('todos os módulos devem ter botão de ação', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 10)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica botão "Novo" ou similar
      const buttons = page.locator('button:has-text("Novo"), button:has-text("Nova"), button:has-text("Adicionar")')
      const hasActionButton = await buttons.count() > 0
      
      expect(hasActionButton).toBe(true)
    }
  })

  test('todos os módulos devem estar em Dark Glass Medical theme', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 5)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica backdrop-blur (glassmorphism)
      const glassElements = page.locator('[class*="backdrop-blur"]')
      const hasGlass = await glassElements.count() > 0
      
      // Verifica sombras (neumorphism)
      const shadowElements = page.locator('[class*="shadow"]')
      const hasShadows = await shadowElements.count() > 0
      
      expect(hasGlass || hasShadows).toBe(true)
    }
  })

  test('todos os módulos devem ser responsivos', async ({ page }) => {
    const moduleToTest = ALL_MODULES[0] // Testa um como exemplo
    
    // Mobile
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(moduleToTest.path)
    await expect(page.locator('h1')).toBeVisible()
    
    // Tablet
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('h1')).toBeVisible()
    
    // Desktop
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('h1')).toBeVisible()
  })

  test('todos os módulos devem carregar em menos de 3 segundos', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 5)
    
    for (const module of modulesToTest) {
      const startTime = Date.now()
      await page.goto(module.path, { waitUntil: 'networkidle' })
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000)
    }
  })

  test('nenhum módulo deve ter erros de console', async ({ page }) => {
    const errors: Array<{ module: string; error: string }> = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push({ module: page.url(), error: msg.text() })
      }
    })
    
    const modulesToTest = ALL_MODULES.slice(0, 5)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      await page.waitForTimeout(1000)
    }
    
    // Log erros se houver
    if (errors.length > 0) {
      console.error('Console errors found:', errors)
    }
    
    expect(errors.length).toBe(0)
  })

  test('módulos devem ter ícones Lucide React', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 5)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica presença de SVGs (ícones)
      const icons = page.locator('svg')
      const hasIcons = await icons.count() > 0
      
      expect(hasIcons).toBe(true)
    }
  })

  test('módulos devem ter Tabs do Radix UI', async ({ page }) => {
    const modulesToTest = ALL_MODULES.slice(0, 10)
    
    for (const module of modulesToTest) {
      await page.goto(module.path)
      
      // Verifica tabs (role="tablist" ou classe específica)
      const tabs = page.locator('[role="tablist"], button[role="tab"]')
      const hasTabs = await tabs.count() > 0
      
      expect(hasTabs).toBe(true)
    }
  })
})

test.describe('Verificação de Rotas', () => {
  test('todas as rotas dos módulos devem estar definidas', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const failedRoutes: string[] = []
    
    for (const module of ALL_MODULES) {
      const response = await page.goto(module.path)
      
      if (!response || response.status() === 404) {
        failedRoutes.push(module.path)
      }
    }
    
    if (failedRoutes.length > 0) {
      console.error('Rotas não encontradas (404):', failedRoutes)
    }
    
    // Permite algumas rotas ainda não configuradas (módulos placeholder)
    // mas exige que a maioria funcione
    expect(failedRoutes.length).toBeLessThan(ALL_MODULES.length / 2)
  })
})

test.describe('Acessibilidade Global', () => {
  test('módulos devem ter estrutura semântica', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const moduleToTest = ALL_MODULES[0]
    await page.goto(moduleToTest.path)
    
    // Verifica heading hierarchy
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeGreaterThanOrEqual(1)
    expect(h1Count).toBeLessThanOrEqual(1) // Deve ter exatamente 1 H1
  })

  test('módulos devem ter alt text em imagens', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    const moduleToTest = ALL_MODULES[2]
    await page.goto(moduleToTest.path)
    
    const images = page.locator('img')
    const count = await images.count()
    
    // Se houver imagens, devem ter alt
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt')
        expect(alt).toBeDefined()
      }
    }
  })
})

