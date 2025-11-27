import { defineConfig, devices } from '@playwright/test'

/**
 * Configuração Playwright para ICARUS v5.0
 * Testes E2E completos com suporte a múltiplos browsers
 */

export default defineConfig({
  testDir: './tests/e2e',
  
  // Timeout para testes
  timeout: 30 * 1000,
  expect: {
    timeout: 5000
  },

  // Execução paralela
  fullyParallel: true,
  
  // Falhar no CI se testes forem deixados com .only
  forbidOnly: !!process.env.CI,
  
  // Retry em caso de falha
  retries: process.env.CI ? 2 : 0,
  
  // Workers paralelos
  workers: process.env.CI ? 1 : undefined,

  // Reporter
  reporter: [
    ['html'],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],

  // Configuração compartilhada
  use: {
    // URL base
    baseURL: 'http://localhost:5173',

    // Trace em caso de falha
    trace: 'on-first-retry',

    // Screenshot em caso de falha
    screenshot: 'only-on-failure',

    // Video em caso de falha
    video: 'retain-on-failure',

    // Timeout para ações
    actionTimeout: 10000,

    // Navegação
    navigationTimeout: 15000,
  },

  // Projetos (browsers)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },

    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad Pro'] },
    },
  ],

  // Web server local
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
