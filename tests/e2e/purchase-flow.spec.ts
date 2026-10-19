import { expect, test } from '@fixtures/test';
import { customer } from '@data/checkout';
import { products } from '@data/products';
import { users } from '@data/users';

/**
 * Jornada completa do usuário, sem atalhos: login pela UI, navegação no
 * catálogo, detalhe do produto, carrinho, checkout e confirmação.
 * Os demais specs cobrem cada etapa isoladamente e em mais profundidade.
 */
test('jornada de compra completa: do login à confirmação do pedido @smoke @e2e', async ({
  loginPage,
  inventoryPage,
  productDetailsPage,
  cartPage,
  checkoutInformationPage,
  checkoutOverviewPage,
  checkoutCompletePage,
}) => {
  const order = [products.onesie, products.backpack];

  await test.step('Login com usuário padrão', async () => {
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    await inventoryPage.expectLoaded();
  });

  await test.step('Ordena por menor preço e adiciona o mais barato pela listagem', async () => {
    await inventoryPage.sortBy('lohi');
    await expect(inventoryPage.itemNames.first()).toHaveText(products.onesie.name);
    await inventoryPage.addToCart(products.onesie.name);
    await inventoryPage.header.expectCartCount(1);
  });

  await test.step('Abre o detalhe de outro produto e adiciona a partir dele', async () => {
    await inventoryPage.openProduct(products.backpack.name);
    await productDetailsPage.expectProduct(products.backpack);
    await productDetailsPage.addToCart();
    await productDetailsPage.header.expectCartCount(2);
  });

  await test.step('Valida o carrinho', async () => {
    await productDetailsPage.header.openCart();
    await cartPage.expectLoaded();
    await cartPage.expectItems(order);
    await cartPage.checkout();
  });

  await test.step('Preenche os dados do comprador', async () => {
    await checkoutInformationPage.expectLoaded();
    await checkoutInformationPage.submit(customer);
  });

  await test.step('Revisa o pedido (itens e totais)', async () => {
    await checkoutOverviewPage.expectLoaded();
    await checkoutOverviewPage.expectItems(order);
    await checkoutOverviewPage.expectPaymentAndShipping();
    // 7.99 + 29.99 = 37.98 | imposto 8% = 3.04 | total = 41.02
    await checkoutOverviewPage.expectTotals(order);
    await checkoutOverviewPage.finish();
  });

  await test.step('Confirma a compra', async () => {
    await checkoutCompletePage.expectOrderConfirmed();
    await checkoutCompletePage.header.expectCartCount(0);
  });
});
