import { test, expect } from '../fixtures/fixtures';
import { customer, messages, order, products, users } from '../data/testData';

// Fluxo completo de compra, do login à confirmação, como um usuário faria.
test('fluxo de compra completo', async ({ page, loginPage, inventoryPage, productPage, header, cartPage, checkoutPage }) => {
  await test.step('Login', async () => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await expect(inventoryPage.title).toHaveText('Products');
  });

  await test.step('Adiciona produtos (pela listagem e pela página de detalhes)', async () => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.openProduct(products.bikeLight.name);
    await productPage.addToCart();
    await expect(header.cartBadge).toHaveText('2');
  });

  await test.step('Confere o carrinho', async () => {
    await header.openCart();
    await expect(cartPage.itemNames).toHaveText(order.items.map((item) => item.name));
    await cartPage.checkout();
  });

  await test.step('Preenche dados e revisa o pedido', async () => {
    await checkoutPage.fillInformation(customer);
    await expect(checkoutPage.total).toHaveText(order.total);
  });

  await test.step('Finaliza a compra', async () => {
    await checkoutPage.finish();
    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText(messages.orderComplete);
  });
});
