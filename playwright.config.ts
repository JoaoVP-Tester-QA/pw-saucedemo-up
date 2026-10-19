import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

/**
 * A URL alvo pode ser sobrescrita via BASE_URL (ex.: um ambiente de homologação
 * ou uma cópia local do Sauce Demo). O padrão é o site público.
 */
const baseURL = process.env.BASE_URL ?? 'https://www.saucedemo.com';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // Uma única retentativa no CI: o objetivo é capturar trace de uma falha
  // intermitente, não mascará-la. Testes que passam só na retentativa
  // aparecem como "flaky" no relatório HTML.
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },

  reporter: isCI
    ? [['github'], ['list'], ['html', { open: 'never' }], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    // O Sauce Demo expõe o atributo data-test em todos os elementos relevantes.
    testIdAttribute: 'data-test',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Evita que o service worker do app interfira no roteamento de requisições.
    serviceWorkers: 'block',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
