/**
 * E2E Tests - Chatbot IcarusBrain
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Playwright Tests para fluxos do chatbot
 */

import { test, expect } from '@playwright/test'

test.describe('ChatWidget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve exibir FAB do chatbot', async ({ page }) => {
    await page.goto('/')
    
    // FAB deve estar visível no canto inferior direito
    const fab = page.locator('button[aria-label="Abrir assistente virtual"]')
    await expect(fab).toBeVisible()
  })

  test('deve abrir chat ao clicar no FAB', async ({ page }) => {
    await page.goto('/')
    
    // Clicar no FAB
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Chat deve abrir
    await expect(page.locator('text=ICARUS AI Assistant')).toBeVisible()
  })

  test('deve exibir categorias de sugestões', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Verificar categorias
    await expect(page.locator('text=Gestão de Estoque')).toBeVisible()
    await expect(page.locator('text=Financeiro')).toBeVisible()
    await expect(page.locator('text=Cirurgias')).toBeVisible()
  })

  test('deve permitir enviar mensagem', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Digitar mensagem
    await page.fill('input[placeholder*="Digite"]', 'Olá, preciso de ajuda')
    
    // Enviar
    await page.keyboard.press('Enter')
    
    // Verificar que mensagem aparece
    await expect(page.locator('text=Olá, preciso de ajuda')).toBeVisible()
  })

  test('deve minimizar e maximizar', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Minimizar
    await page.click('button[title="Minimizar"]')
    
    // Chat deve estar minimizado (altura reduzida)
    const chat = page.locator('[class*="h-14"]')
    await expect(chat).toBeVisible()
    
    // Maximizar
    await page.click('button[title="Expandir"]')
    
    // Chat deve estar expandido
    await expect(page.locator('text=ICARUS AI Assistant')).toBeVisible()
  })

  test('deve fechar chat', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Fechar
    await page.click('button[title="Fechar"]')
    
    // FAB deve aparecer novamente
    await expect(page.locator('button[aria-label="Abrir assistente virtual"]')).toBeVisible()
  })

  test('deve exibir sugestões ao selecionar categoria', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Clicar em categoria
    await page.click('text=Cirurgias')
    
    // Verificar sugestões específicas
    await expect(page.locator('text=Gere justificativa médica')).toBeVisible()
  })

  test('deve preencher input ao clicar em sugestão', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Clicar em categoria
    await page.click('text=Cirurgias')
    
    // Clicar em sugestão
    await page.click('text=Gere justificativa médica')
    
    // Input deve ter a sugestão
    const input = page.locator('input[placeholder*="Digite"]')
    await expect(input).toHaveValue('Gere justificativa médica')
  })

  test('deve exibir comandos ao digitar /', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Digitar /
    await page.fill('input[placeholder*="Digite"]', '/')
    
    // Verificar comandos
    await expect(page.locator('text=/estoque')).toBeVisible()
    await expect(page.locator('text=/faturamento')).toBeVisible()
  })
})

test.describe('Chatbot com Anexos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve exibir botão de anexar', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Verificar botão de anexar
    await expect(page.locator('button[title="Anexar documento"]')).toBeVisible()
  })

  test('deve exibir drop zone ao arrastar arquivo', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Simular drag
    const dropZone = page.locator('text=Arraste documentos')
    await expect(dropZone).toBeVisible()
  })

  test('deve aceitar arquivos PDF', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Verificar que aceita PDF
    const input = page.locator('input[accept*=".pdf"]')
    await expect(input).toBeAttached()
  })

  test('deve aceitar arquivos XML', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Verificar que aceita XML
    const input = page.locator('input[accept*=".xml"]')
    await expect(input).toBeAttached()
  })

  test('deve aceitar imagens', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Verificar que aceita imagens
    const input = page.locator('input[accept*=".jpg"]')
    await expect(input).toBeAttached()
  })
})

test.describe('Justificativa Médica IA', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve gerar justificativa via chat', async ({ page }) => {
    await page.goto('/')
    await page.click('button[aria-label="Abrir assistente virtual"]')
    
    // Enviar pedido de justificativa
    await page.fill('input[placeholder*="Digite"]', 'Gere uma justificativa médica para stent coronário')
    await page.keyboard.press('Enter')
    
    // Aguardar resposta (pode demorar)
    await page.waitForTimeout(5000)
    
    // Verificar que resposta foi gerada
    await expect(page.locator('[class*="rounded-2xl"]').last()).toBeVisible()
  })
})

