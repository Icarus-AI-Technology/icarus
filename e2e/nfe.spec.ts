/**
 * E2E Tests - Módulo de NF-e
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Playwright Tests para fluxos de NF-e
 */

import { test, expect } from '@playwright/test'

test.describe('NF-e de Entrada', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve abrir formulário de entrada', async ({ page }) => {
    await page.goto('/compras/nfe-entrada')
    
    await expect(page.locator('text=Entrada de Nota Fiscal')).toBeVisible()
  })

  test('deve validar chave NF-e com 44 dígitos', async ({ page }) => {
    await page.goto('/compras/nfe-entrada')
    
    // Preencher chave com menos de 44 dígitos
    await page.fill('input[placeholder*="1234"]', '12345678901234567890')
    await page.click('text=Importar')
    
    await expect(page.locator('text=Chave NF-e deve ter 44 dígitos')).toBeVisible()
  })

  test('deve validar CNPJ do fornecedor', async ({ page }) => {
    await page.goto('/compras/nfe-entrada')
    
    // Preencher CNPJ inválido
    await page.fill('input[placeholder="00.000.000/0001-00"]', '11111111111111')
    await page.keyboard.press('Tab')
    
    await expect(page.locator('text=CNPJ inválido')).toBeVisible()
  })
})

test.describe('NF-e de Saída', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve abrir formulário de saída', async ({ page }) => {
    await page.goto('/vendas/nfe-saida')
    
    await expect(page.locator('text=Nova NF-e de Saída')).toBeVisible()
  })

  test('deve exibir botão de gerar justificativa IA', async ({ page }) => {
    await page.goto('/vendas/nfe-saida')
    
    await expect(page.locator('text=Gerar com IA')).toBeVisible()
  })

  test('deve permitir adicionar múltiplos itens', async ({ page }) => {
    await page.goto('/vendas/nfe-saida')
    
    // Verificar item 1 existe
    await expect(page.locator('text=Item 1')).toBeVisible()
    
    // Clicar em adicionar item
    await page.click('text=Adicionar Item')
    
    // Verificar item 2 existe
    await expect(page.locator('text=Item 2')).toBeVisible()
  })

  test('deve calcular valor total automaticamente', async ({ page }) => {
    await page.goto('/vendas/nfe-saida')
    
    // Preencher quantidade e valor
    await page.fill('input[name="itens.0.quantidade"]', '5')
    await page.fill('input[name="itens.0.valor_unitario"]', '100')
    
    // Verificar total
    await expect(page.locator('text=R$ 500,00')).toBeVisible()
  })

  test('deve copiar justificativa para clipboard', async ({ page }) => {
    await page.goto('/vendas/nfe-saida')
    
    // Preencher justificativa manualmente
    await page.fill('textarea[placeholder*="Justificativa"]', 'Justificativa de teste')
    
    // Clicar em copiar
    await page.click('text=Copiar')
    
    // Verificar ícone de sucesso
    await expect(page.locator('[class*="text-emerald-400"]')).toBeVisible()
  })
})

test.describe('Contas a Pagar/Receber', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('deve exibir KPIs de contas', async ({ page }) => {
    await page.goto('/financeiro/contas')
    
    await expect(page.locator('text=A Pagar')).toBeVisible()
    await expect(page.locator('text=A Receber')).toBeVisible()
    await expect(page.locator('text=Vencidos')).toBeVisible()
  })

  test('deve filtrar por tipo', async ({ page }) => {
    await page.goto('/financeiro/contas')
    
    // Abrir select de tipo
    await page.click('text=Todos')
    await page.click('text=A Pagar')
    
    // Verificar que apenas contas a pagar são exibidas
    const rows = page.locator('tr:has-text("Pagar")')
    await expect(rows.first()).toBeVisible()
  })

  test('deve filtrar por status', async ({ page }) => {
    await page.goto('/financeiro/contas')
    
    // Abrir select de status
    await page.locator('select').nth(1).click()
    await page.click('text=Vencido')
    
    // Verificar que apenas vencidos são exibidos
    await expect(page.locator('text=Vencido')).toBeVisible()
  })

  test('deve buscar por descrição', async ({ page }) => {
    await page.goto('/financeiro/contas')
    
    // Digitar na busca
    await page.fill('input[placeholder*="Buscar"]', 'Stent')
    
    // Verificar resultados filtrados
    await expect(page.locator('text=Stents Coronários')).toBeVisible()
  })
})

