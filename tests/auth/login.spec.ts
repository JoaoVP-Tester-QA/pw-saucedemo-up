import { expect, test } from '@fixtures/test';
import { invalidLoginCases, users } from '@data/users';

/** Classe CSS aplicada aos campos quando há erro (o token isolado "error"). */
const ERROR_CLASS = /(^|\s)error(\s|$)/;

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('autentica com credenciais válidas e abre a listagem de produtos @smoke', async ({
    loginPage,
    inventoryPage,
    context,
  }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.items).toHaveCount(6);

    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === 'session-username')?.value).toBe(users.standard.username);
  });

  for (const scenario of invalidLoginCases) {
    test(`exibe erro e permanece na tela de login: ${scenario.title}`, async ({ loginPage, page }) => {
      await loginPage.login(scenario.username, scenario.password);

      await loginPage.expectError(scenario.expectedError);
      await loginPage.expectLoaded();
      // Campos são destacados como inválidos.
      await expect(loginPage.usernameInput).toHaveClass(ERROR_CLASS);
      await expect(loginPage.passwordInput).toHaveClass(ERROR_CLASS);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('permite fechar a mensagem de erro', async ({ loginPage }) => {
    await loginPage.login('', '');
    await expect(loginPage.errorMessage).toBeVisible();

    await expect(loginPage.usernameInput).toHaveClass(ERROR_CLASS);

    await loginPage.dismissErrorButton.click();

    await expect(loginPage.errorMessage).toHaveCount(0);
    await expect(loginPage.usernameInput).not.toHaveClass(ERROR_CLASS);
    await expect(loginPage.passwordInput).not.toHaveClass(ERROR_CLASS);
  });

  test('bloqueia acesso direto a página protegida sem sessão', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await loginPage.expectLoaded();
    await loginPage.expectError(
      "Epic sadface: You can only access '/inventory.html' when you are logged in.",
    );
  });

  test('encerra a sessão pelo menu (logout)', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();

    await inventoryPage.header.logout();

    await loginPage.expectLoaded();
    // Após o logout, a página protegida volta a exigir login.
    await page.goto('/inventory.html');
    await loginPage.expectLoaded();
  });
});
