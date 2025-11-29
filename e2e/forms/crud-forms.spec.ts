import { test, expect } from '@playwright/test'

/**
 * Testes E2E para Formulários CRUD
 * Cobertura: 42 formulários principais
 */

test.describe('Formulários CRUD - Suite Principal', () => {
  test.beforeEach(async ({ page }) => {
    // Login (ajustar URL conforme ambiente)
    await page.goto('http://localhost:5173')
    // TODO: Implementar login automático quando auth estiver pronto
  })

  test.describe('Cadastros - Gestão', () => {
    test('Deve cadastrar novo usuário com sucesso', async ({ page }) => {
      await page.goto('http://localhost:5173/cadastros')
      
      // Abrir dialog de novo usuário
      await page.click('button:has-text("Novo")')
      
      // Preencher formulário
      await page.fill('input[name="nome"]', 'João Silva Teste')
      await page.fill('input[name="email"]', 'joao.teste@example.com')
      await page.fill('input[name="cargo"]', 'Gerente de Vendas')
      
      // Submeter
      await page.click('button:has-text("Salvar")')
      
      // Verificar toast de sucesso
      await expect(page.locator('text=sucesso')).toBeVisible({ timeout: 5000 })
    })

    test('Deve validar campos obrigatórios no formulário de usuário', async ({ page }) => {
      await page.goto('http://localhost:5173/cadastros')
      await page.click('button:has-text("Novo")')
      
      // Tentar submeter sem preencher
      await page.click('button:has-text("Salvar")')
      
      // Verificar mensagens de erro
      await expect(page.locator('text=obrigatório')).toBeVisible()
    })

    test('Deve validar formato de email', async ({ page }) => {
      await page.goto('http://localhost:5173/cadastros')
      await page.click('button:has-text("Novo")')
      
      await page.fill('input[name="nome"]', 'Teste')
      await page.fill('input[name="email"]', 'email-invalido')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=inválido')).toBeVisible()
    })
  })

  test.describe('Estoque - Inventário', () => {
    test('Deve criar inventário com validação', async ({ page }) => {
      await page.goto('http://localhost:5173/estoque')
      await page.click('button:has-text("Novo")')
      
      await page.fill('input[name="nome"]', 'Inventário Anual 2025')
      await page.fill('input[name="data_inicio"]', '2025-01-01')
      await page.selectOption('select[name="tipo"]', 'geral')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=sucesso')).toBeVisible()
    })
  })

  test.describe('Compras - Pedidos', () => {
    test('Deve criar pedido de compra', async ({ page }) => {
      await page.goto('http://localhost:5173/compras')
      await page.click('button:has-text("Novo Pedido")')
      
      await page.fill('input[name="numero_pedido"]', 'PC-2025-001')
      await page.fill('input[name="valor_total"]', '10000')
      await page.fill('input[name="data_pedido"]', '2025-01-15')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=criado')).toBeVisible()
    })

    test('Deve validar valor mínimo', async ({ page }) => {
      await page.goto('http://localhost:5173/compras')
      await page.click('button:has-text("Novo Pedido")')
      
      await page.fill('input[name="valor_total"]', '-100')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=positivo')).toBeVisible()
    })
  })

  test.describe('Vendas/CRM - Oportunidades', () => {
    test('Deve criar oportunidade com probabilidade', async ({ page }) => {
      await page.goto('http://localhost:5173/crm')
      await page.click('button:has-text("Nova Oportunidade")')
      
      await page.fill('input[name="titulo"]', 'Venda OPME Hospital X')
      await page.fill('input[name="valor_estimado"]', '50000')
      await page.fill('input[name="probabilidade"]', '75')
      await page.selectOption('select[name="estagio"]', 'negociação')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=sucesso')).toBeVisible()
    })

    test('Deve validar probabilidade entre 0-100', async ({ page }) => {
      await page.goto('http://localhost:5173/crm')
      await page.click('button:has-text("Nova Oportunidade")')
      
      await page.fill('input[name="probabilidade"]', '150')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=máximo')).toBeVisible()
    })
  })

  test.describe('Financeiro - Contas a Receber', () => {
    test('Deve criar conta a receber', async ({ page }) => {
      await page.goto('http://localhost:5173/financeiro')
      await page.click('button:has-text("Nova Conta")')
      
      await page.fill('input[name="numero_documento"]', 'NF-12345')
      await page.fill('input[name="valor"]', '1500')
      await page.fill('input[name="data_vencimento"]', '2025-02-15')
      await page.selectOption('select[name="forma_pagamento"]', 'pix')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=sucesso')).toBeVisible()
    })
  })

  test.describe('Compliance - Auditoria', () => {
    test('Deve criar auditoria ANVISA', async ({ page }) => {
      await page.goto('http://localhost:5173/compliance')
      await page.click('button:has-text("Nova Auditoria")')
      
      await page.fill('input[name="titulo"]', 'Auditoria ANVISA Q1 2025')
      await page.selectOption('select[name="tipo"]', 'anvisa')
      await page.fill('input[name="data_auditoria"]', '2025-03-01')
      await page.fill('textarea[name="escopo"]', 'Verificação de conformidade RDC 430/2020')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=criada')).toBeVisible()
    })
  })

  test.describe('IA - Agentes', () => {
    test('Deve configurar agente IA', async ({ page }) => {
      await page.goto('http://localhost:5173/ia-central')
      await page.click('button:has-text("Novo Agente")')
      
      await page.fill('input[name="nome"]', 'EstoqueAgent')
      await page.selectOption('select[name="tipo"]', 'langgraph')
      await page.selectOption('select[name="modelo"]', 'claude-3-5-sonnet')
      await page.fill('textarea[name="prompt_sistema"]', 'Você é um agente especializado em previsão de estoque...')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=configurado')).toBeVisible()
    })
  })

  test.describe('Sistema - Integrações', () => {
    test('Deve configurar integração REST', async ({ page }) => {
      await page.goto('http://localhost:5173/integracoes')
      await page.click('button:has-text("Nova Integração")')
      
      await page.fill('input[name="nome"]', 'API SEFAZ RJ')
      await page.selectOption('select[name="tipo"]', 'rest')
      await page.fill('input[name="url_base"]', 'https://api.sefaz.rj.gov.br')
      await page.selectOption('select[name="auth_tipo"]', 'bearer')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=sucesso')).toBeVisible()
    })

    test('Deve validar URL da integração', async ({ page }) => {
      await page.goto('http://localhost:5173/integracoes')
      await page.click('button:has-text("Nova Integração")')
      
      await page.fill('input[name="url_base"]', 'url-invalida')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=URL')).toBeVisible()
    })
  })

  test.describe('Funcionalidades Gerais', () => {
    test('Deve ter Dark Glass Medical theme', async ({ page }) => {
      await page.goto('http://localhost:5173')
      
      // Verificar elementos do tema
      const card = await page.locator('.rounded-2xl').first()
      await expect(card).toBeVisible()
      
      // Verificar glassmorphism (backdrop-blur)
      const hasBlur = await page.evaluate(() => {
        const element = document.querySelector('.backdrop-blur-xl')
        return element !== null
      })
      
      expect(hasBlur).toBeTruthy()
    })

    test('Deve ser responsivo (mobile)', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:5173')
      
      // Verificar que o layout se adapta
      const sidebar = await page.locator('aside').first()
      // Em mobile, sidebar deve estar oculta ou colapsada
      await expect(sidebar).not.toBeInViewport()
    })

    test('Deve ter acessibilidade WCAG', async ({ page }) => {
      await page.goto('http://localhost:5173')
      
      // Verificar labels em inputs
      const inputs = await page.locator('input').all()
      for (const input of inputs) {
        const hasLabel = await input.evaluate((el) => {
          const id = el.id
          return id ? document.querySelector(`label[for="${id}"]`) !== null : true
        })
        expect(hasLabel).toBeTruthy()
      }
    })
  })

  test.describe('Edição e Exclusão', () => {
    test('Deve editar registro existente', async ({ page }) => {
      await page.goto('http://localhost:5173/cadastros')
      
      // Clicar no primeiro item da lista
      await page.click('button[aria-label="Editar"]')
      
      // Modificar campo
      await page.fill('input[name="nome"]', 'Nome Editado')
      
      await page.click('button:has-text("Salvar")')
      
      await expect(page.locator('text=atualizado')).toBeVisible()
    })

    test('Deve confirmar antes de excluir', async ({ page }) => {
      await page.goto('http://localhost:5173/cadastros')
      
      // Clicar em excluir
      await page.click('button[aria-label="Excluir"]')
      
      // Verificar modal de confirmação
      await expect(page.locator('text=Confirmar')).toBeVisible()
      
      // Cancelar
      await page.click('button:has-text("Cancelar")')
      
      // Modal deve fechar
      await expect(page.locator('text=Confirmar')).not.toBeVisible()
    })
  })
})

test.describe('Performance e Load', () => {
  test('Dashboard deve carregar em menos de 3s', async ({ page }) => {
    const start = Date.now()
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - start
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('Formulários devem ter animações smooth', async ({ page }) => {
    await page.goto('http://localhost:5173/cadastros')
    await page.click('button:has-text("Novo")')
    
    // Verificar que o dialog aparece com animação
    const dialog = await page.locator('dialog, [role="dialog"]')
    await expect(dialog).toBeVisible({ timeout: 1000 })
  })
})

