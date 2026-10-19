import { test, expect } from '../fixtures/fixtures';
import { messages, users } from '../data/testData';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('login com credenciais válidas', async ({ page, loginPage, inventoryPage }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  // Mesmo teste com dados diferentes (data-driven)
  const invalidLogins = [
    { case: 'usuário vazio', username: '', password: 'secret_sauce', error: messages.usernameRequired },
    { case: 'senha incorreta', username: 'standard_user', password: 'errada', error: messages.invalidCredentials },
    { case: 'usuário bloqueado', username: users.lockedOut.username, password: users.lockedOut.password, error: messages.lockedOut },
  ];

  for (const data of invalidLogins) {
    test(`login inválido: ${data.case}`, async ({ page, loginPage }) => {
      await loginPage.login(data.username, data.password);

      await expect(loginPage.error).toHaveText(data.error);
      await expect(page).not.toHaveURL(/inventory\.html/);
    });
  }

  test('logout volta para a tela de login', async ({ page, loginPage, header }) => {
    await loginPage.login(users.standard.username, users.standard.password);

    await header.logout();

    await expect(loginPage.loginButton).toBeVisible();
    await expect(page).not.toHaveURL(/inventory\.html/);
  });
});
