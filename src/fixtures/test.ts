import { test as base, expect } from '@playwright/test';
import { users, type User } from '@data/users';
import {
  CartPage,
  CheckoutCompletePage,
  CheckoutInformationPage,
  CheckoutOverviewPage,
  InventoryPage,
  LoginPage,
  ProductDetailsPage,
} from '@pages/index';

/**
 * Hosts de terceiros chamados pelo Sauce Demo (telemetria de erros). Não fazem
 * parte do sistema sob teste e, se lentos ou indisponíveis, só adicionam ruído
 * e risco de instabilidade; por isso são abortados em todos os testes.
 */
const THIRD_PARTY_HOSTS = /events\.backtrace\.io|submit\.backtrace\.io/;

/** O Sauce Demo guarda a sessão neste cookie (ver tests/auth/login.spec.ts). */
const SESSION_COOKIE = 'session-username';

type PageObjects = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  productDetailsPage: ProductDetailsPage;
  cartPage: CartPage;
  checkoutInformationPage: CheckoutInformationPage;
  checkoutOverviewPage: CheckoutOverviewPage;
  checkoutCompletePage: CheckoutCompletePage;
};

type Options = {
  /** Usuário usado pelo fixture `authenticated`. Sobrescreva com `test.use({ user })`. */
  user: User;
};

type InternalFixtures = {
  blockThirdParty: void;
};

/**
 * `test` base: injeta os Page Objects e bloqueia chamadas de terceiros.
 * Use para cenários que começam deslogados (ex.: login).
 */
export const test = base.extend<PageObjects & Options & InternalFixtures>({
  user: [users.standard, { option: true }],

  blockThirdParty: [
    async ({ context }, use) => {
      await context.route(THIRD_PARTY_HOSTS, (route) => route.abort());
      await use();
    },
    { auto: true },
  ],

  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  productDetailsPage: async ({ page }, use) => use(new ProductDetailsPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutInformationPage: async ({ page }, use) => use(new CheckoutInformationPage(page)),
  checkoutOverviewPage: async ({ page }, use) => use(new CheckoutOverviewPage(page)),
  checkoutCompletePage: async ({ page }, use) => use(new CheckoutCompletePage(page)),
});

/**
 * `test` autenticado: cada teste começa logado, com carrinho vazio, na
 * listagem de produtos.
 *
 * A autenticação é feita injetando o cookie de sessão em vez de repetir o
 * login pela UI em todos os testes — mais rápido e sem dependência da tela de
 * login, que já é coberta em tests/auth. Cada teste recebe um contexto novo,
 * então o estado do carrinho (localStorage) nunca vaza entre testes.
 */
export const authenticatedTest = test.extend<{ authenticated: void }>({
  authenticated: [
    async ({ context, baseURL, user, inventoryPage }, use) => {
      if (!baseURL) throw new Error('baseURL não configurada no playwright.config.ts');
      await context.addCookies([{ name: SESSION_COOKIE, value: user.username, url: baseURL }]);
      await inventoryPage.goto();
      await inventoryPage.expectLoaded();
      await use();
    },
    { auto: true },
  ],
});

export { expect };
