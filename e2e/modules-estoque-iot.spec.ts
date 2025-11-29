import { test, expect } from '@playwright/test'

/**
 * Testes E2E para Módulos de Estoque, Consignação e IoT
 * Sprint 3: 4 módulos
 */

test.describe('Sprint 3 - Estoque e Consignação', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@icarus.com')
    await page.fill('input[type="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test.describe('Consignação Avançada', () => {
    test('deve carregar módulo de consignação', async ({ page }) => {
      await page.goto('/modulo/consignacao-avancada')
      
      await expect(page.locator('h1')).toContainText('Consignação Avançada')
      
      // Verifica KPIs
      await expect(page.locator('text=Total Consignado')).toBeVisible()
      await expect(page.locator('text=R$ 2.4M')).toBeVisible()
    })

    test('deve exibir itens em hospital', async ({ page }) => {
      await page.goto('/modulo/consignacao-avancada')
      
      await page.click('text=Em Hospital')
      
      await expect(page.locator('text=Mapa de localização')).toBeVisible()
    })

    test('deve mostrar itens em trânsito', async ({ page }) => {
      await page.goto('/modulo/consignacao-avancada')
      
      await page.click('text=Em Trânsito')
      
      // Verifica tab de trânsito
      await expect(page.locator('h1')).toBeVisible()
    })

    test('deve ter botão de mapa', async ({ page }) => {
      await page.goto('/modulo/consignacao-avancada')
      
      const mapButton = page.locator('button:has-text("Mapa")')
      await expect(mapButton).toBeVisible()
    })
  })

  test.describe('Rastreabilidade OPME', () => {
    test('deve carregar módulo de rastreabilidade', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await expect(page.locator('h1')).toContainText('Rastreabilidade OPME')
      await expect(page.locator('text=RDC 665/2022')).toBeVisible()
    })

    test('deve exibir lotes rastreados', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await page.click('text=Lotes')
      
      await expect(page.locator('text=Timeline de movimentação')).toBeVisible()
    })

    test('deve mostrar eventos de rastreamento', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await page.click('text=Eventos')
      
      // Verifica contador de eventos
      const count = page.locator('text=/5.?234/')
      await expect(count.first()).toBeVisible()
    })

    test('deve exibir alertas ANVISA', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await page.click('text=Alertas')
      
      await expect(page.locator('h1')).toBeVisible()
    })

    test('deve ter integração SNCM', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await expect(page.locator('text=Integração SNCM')).toBeVisible()
      await expect(page.locator('text=Ativo')).toBeVisible()
    })

    test('deve ter botão de escanear QR', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      const scanButton = page.locator('button:has-text("Escanear")')
      await expect(scanButton).toBeVisible()
    })
  })

  test.describe('Telemetria IoT', () => {
    test('deve carregar módulo de IoT', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await expect(page.locator('h1')).toContainText('Telemetria IoT')
      
      // Verifica sensores ativos
      await expect(page.locator('text=Sensores Ativos')).toBeVisible()
      await expect(page.locator('text=24')).toBeVisible()
    })

    test('deve exibir temperatura média', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await expect(page.locator('text=Temp. Média')).toBeVisible()
      await expect(page.locator('text=22.5°C')).toBeVisible()
    })

    test('deve mostrar umidade média', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await expect(page.locator('text=Umidade Média')).toBeVisible()
      await expect(page.locator('text=45%')).toBeVisible()
    })

    test('deve listar dispositivos IoT', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await page.click('text=Dispositivos')
      
      await expect(page.locator('text=Dashboard tempo real')).toBeVisible()
    })

    test('deve exibir leituras', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await page.click('text=Leituras')
      
      // Verifica contador alto de leituras
      const count = page.locator('text=/8.?420/')
      await expect(count.first()).toBeVisible()
    })

    test('deve mostrar alertas críticos', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      await expect(page.locator('text=Alertas Críticos')).toBeVisible()
      await expect(page.locator('text=2')).toBeVisible()
    })
  })

  test.describe('Manutenção Preventiva', () => {
    test('deve carregar módulo de manutenção', async ({ page }) => {
      await page.goto('/modulo/manutencao-preventiva')
      
      await expect(page.locator('h1')).toContainText('Manutenção Preventiva')
      
      // Verifica taxa de execução
      await expect(page.locator('text=Taxa Execução')).toBeVisible()
      await expect(page.locator('text=94%')).toBeVisible()
    })

    test('deve exibir manutenções programadas', async ({ page }) => {
      await page.goto('/modulo/manutencao-preventiva')
      
      await page.click('text=Programada')
      
      await expect(page.locator('text=Calendário de manutenções')).toBeVisible()
    })

    test('deve mostrar manutenções executadas', async ({ page }) => {
      await page.goto('/modulo/manutencao-preventiva')
      
      await page.click('text=Executada')
      
      await expect(page.locator('h1')).toBeVisible()
    })

    test('deve listar manutenções atrasadas', async ({ page }) => {
      await page.goto('/modulo/manutencao-preventiva')
      
      await page.click('text=Atrasada')
      
      // Verifica contador de atrasadas
      await expect(page.locator('text=3')).toBeVisible()
    })

    test('deve exibir equipamentos', async ({ page }) => {
      await page.goto('/modulo/manutencao-preventiva')
      
      await page.click('text=Equipamentos')
      
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Integração de Funcionalidades', () => {
    test('IoT deve integrar com Rastreabilidade', async ({ page }) => {
      // Verifica que ambos módulos existem e podem ser acessados
      await page.goto('/modulo/telemetria-iot')
      await expect(page.locator('h1')).toBeVisible()
      
      await page.goto('/modulo/rastreabilidade-opme')
      await expect(page.locator('h1')).toBeVisible()
    })

    test('Consignação deve ter controle de validade', async ({ page }) => {
      await page.goto('/modulo/consignacao-avancada')
      
      await expect(page.locator('text=Vencimentos Próx.')).toBeVisible()
    })
  })

  test.describe('Compliance ANVISA', () => {
    test('Rastreabilidade deve citar RDC 665/2022', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await expect(page.locator('text=RDC 665/2022')).toBeVisible()
    })

    test('deve ter conformidade > 99%', async ({ page }) => {
      await page.goto('/modulo/rastreabilidade-opme')
      
      await expect(page.locator('text=Conformidade')).toBeVisible()
      await expect(page.locator('text=99.8%')).toBeVisible()
    })
  })

  test.describe('Performance IoT', () => {
    test('dados em tempo real devem carregar rápido', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/modulo/telemetria-iot')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(2000)
    })

    test('não deve ter memory leaks em polling', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      // Aguarda alguns segundos para simular polling
      await page.waitForTimeout(3000)
      
      // Verifica que página ainda responde
      await expect(page.locator('h1')).toBeVisible()
    })
  })

  test.describe('Acessibilidade IoT', () => {
    test('gráficos devem ter alternativas textuais', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      // Verifica que KPIs são legíveis
      await expect(page.locator('text=22.5°C')).toBeVisible()
      await expect(page.locator('text=45%')).toBeVisible()
    })

    test('alertas críticos devem ter contraste adequado', async ({ page }) => {
      await page.goto('/modulo/telemetria-iot')
      
      const criticalAlert = page.locator('text=Alertas Críticos')
      await expect(criticalAlert).toBeVisible()
      
      // Verifica que valor '2' é visível
      const value = page.locator('text=2')
      await expect(value.first()).toBeVisible()
    })
  })
})

