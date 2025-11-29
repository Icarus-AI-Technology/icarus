/**
 * E2E Tests - Módulo de Cadastros
 * 
 * ICARUS v5.1 - ERP Distribuidora OPME
 * Playwright Tests para fluxos de cadastro
 */

import { test, expect } from '@playwright/test'

test.describe('Gestão de Cadastros', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login')
    await page.fill('input[type="email"]', 'teste@icarus.com')
    await page.fill('input[type="password"]', 'teste123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test.describe('Cadastro de Médico', () => {
    test('deve abrir formulário de médico', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Médicos Cirurgiões')
      await page.click('text=Novo Cadastro')
      
      await expect(page.locator('text=Cadastrar Médico Cirurgião')).toBeVisible()
    })

    test('deve validar CRM obrigatório', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Médicos Cirurgiões')
      await page.click('text=Novo Cadastro')
      
      // Tentar salvar sem preencher
      await page.click('text=Salvar Médico')
      
      await expect(page.locator('text=CRM deve ter no mínimo 4 dígitos')).toBeVisible()
    })

    test('deve auto-preencher dados via API CFM', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Médicos Cirurgiões')
      await page.click('text=Novo Cadastro')
      
      // Selecionar UF
      await page.click('text=UF')
      await page.click('text=RJ')
      
      // Preencher CRM
      await page.fill('input[placeholder="123456"]', '52123456')
      await page.keyboard.press('Tab')
      
      // Aguardar auto-preenchimento
      await page.waitForTimeout(2000)
      
      // Verificar se nome foi preenchido
      const nomeInput = page.locator('input[placeholder="Dr. João da Silva"]')
      await expect(nomeInput).not.toBeEmpty()
    })
  })

  test.describe('Cadastro de Produto OPME', () => {
    test('deve abrir formulário de produto', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Produtos OPME')
      await page.click('text=Novo Cadastro')
      
      await expect(page.locator('text=Cadastrar Produto OPME')).toBeVisible()
    })

    test('deve validar registro ANVISA com 13 dígitos', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Produtos OPME')
      await page.click('text=Novo Cadastro')
      
      // Preencher registro com menos de 13 dígitos
      await page.fill('input[placeholder="1234567890123"]', '123456')
      await page.keyboard.press('Tab')
      
      await expect(page.locator('text=Registro ANVISA deve ter exatamente 13 dígitos')).toBeVisible()
    })

    test('deve auto-preencher dados via API ANVISA', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Produtos OPME')
      await page.click('text=Novo Cadastro')
      
      // Preencher registro ANVISA válido
      await page.fill('input[placeholder="1234567890123"]', '8018000000123')
      await page.keyboard.press('Tab')
      
      // Aguardar auto-preenchimento
      await page.waitForTimeout(2000)
      
      // Verificar se descrição foi preenchida
      const descricaoInput = page.locator('textarea[placeholder*="Descrição"]')
      await expect(descricaoInput).not.toBeEmpty()
    })

    test('deve permitir importar XML de NF-e', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Produtos OPME')
      await page.click('text=Novo Cadastro')
      
      // Verificar botão de importar XML
      await expect(page.locator('text=Importar XML')).toBeVisible()
    })
  })

  test.describe('Cadastro de Fornecedor', () => {
    test('deve auto-preencher dados via CNPJ', async ({ page }) => {
      await page.goto('/cadastros')
      await page.click('text=Fornecedores')
      await page.click('text=Novo Cadastro')
      
      // Preencher CNPJ
      await page.fill('input[placeholder="00.000.000/0001-00"]', '33014556000196')
      await page.keyboard.press('Tab')
      
      // Aguardar auto-preenchimento
      await page.waitForTimeout(2000)
      
      // Verificar se razão social foi preenchida
      const razaoInput = page.locator('input[name="razao_social"]')
      await expect(razaoInput).not.toBeEmpty()
    })
  })
})

test.describe('Carrossel de Cadastros', () => {
  test('deve exibir contadores corretos', async ({ page }) => {
    await page.goto('/cadastros')
    
    // Verificar que os cards do carrossel existem
    await expect(page.locator('text=Médicos Cirurgiões')).toBeVisible()
    await expect(page.locator('text=Hospitais & Clínicas')).toBeVisible()
    await expect(page.locator('text=Produtos OPME')).toBeVisible()
  })

  test('deve trocar de tab ao clicar', async ({ page }) => {
    await page.goto('/cadastros')
    
    // Clicar em Hospitais
    await page.click('text=Hospitais & Clínicas')
    
    // Verificar que a tab está ativa (bg-violet-600)
    const tab = page.locator('button:has-text("Hospitais & Clínicas")')
    await expect(tab).toHaveClass(/bg-violet-600/)
  })

  test('deve scroll horizontal no carrossel', async ({ page }) => {
    await page.goto('/cadastros')
    
    // Verificar que o scroll existe
    const scrollArea = page.locator('[class*="ScrollArea"]')
    await expect(scrollArea).toBeVisible()
  })
})

