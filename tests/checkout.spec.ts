import { test, expect } from '../fixtures/fixtures';
import { customer, messages, order, products } from '../data/testData';

test.describe('Checkout', () => {
  // Todo teste de checkout começa logado, com o pedido no carrinho, na etapa 1
  test.beforeEach(async ({ loggedIn, inventoryPage, header, cartPage }) => {
    for (const item of order.items) {
      await inventoryPage.addToCart(item.name);
    }
    await header.openCart();
    await cartPage.checkout();
  });

  const missingFields = [
    { case: 'primeiro nome', data: { ...customer, firstName: '' }, error: messages.firstNameRequired },
    { case: 'sobrenome', data: { ...customer, lastName: '' }, error: messages.lastNameRequired },
    { case: 'CEP', data: { ...customer, postalCode: '' }, error: messages.postalCodeRequired },
  ];

  for (const field of missingFields) {
    test(`exige o campo ${field.case}`, async ({ checkoutPage }) => {
      await checkoutPage.fillInformation(field.data);

      await expect(checkoutPage.error).toHaveText(field.error);
    });
  }

  test('revisão mostra os itens e os valores corretos', async ({ page, checkoutPage }) => {
    await checkoutPage.fillInformation(customer);

    await expect(page).toHaveURL(/checkout-step-two\.html/);
    await expect(checkoutPage.itemNames).toHaveText(order.items.map((item) => item.name));
    await expect(checkoutPage.subtotal).toHaveText(order.subtotal);
    await expect(checkoutPage.tax).toHaveText(order.tax);
    await expect(checkoutPage.total).toHaveText(order.total);
  });

  test('finaliza a compra', async ({ page, checkoutPage, header }) => {
    await checkoutPage.fillInformation(customer);
    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html/);
    await expect(checkoutPage.completeHeader).toHaveText(messages.orderComplete);
    await expect(header.cartBadge).toHaveCount(0); // carrinho foi esvaziado
  });
});

// BUG encontrado no Sauce Demo: com Onesie ($7.99) + Fleece Jacket ($49.99) o subtotal
// aparece como "$57.980000000000004" em vez de "$57.98".
// test.fail() = "esperamos que falhe": a suíte fica verde enquanto o bug existir
// e avisa quando ele for corrigido.
test('BUG: subtotal deveria ter 2 casas decimais', async ({ loggedIn, inventoryPage, header, cartPage, checkoutPage }) => {
  test.fail();

  await inventoryPage.addToCart(products.onesie.name);
  await inventoryPage.addToCart(products.fleeceJacket.name);
  await header.openCart();
  await cartPage.checkout();
  await checkoutPage.fillInformation(customer);

  await expect(checkoutPage.subtotal).toHaveText('Item total: $57.98');
});
