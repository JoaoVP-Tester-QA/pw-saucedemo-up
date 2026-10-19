import { authenticatedTest as test, expect } from '@fixtures/test';
import { customer, missingFieldCases } from '@data/checkout';
import { products, type Product } from '@data/products';
import { parsePrice } from '@utils/price';

const cartItems: Product[] = [products.backpack, products.bikeLight];

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage, checkoutInformationPage }) => {
    await inventoryPage.addToCart(...cartItems.map((p) => p.name));
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInformationPage.expectLoaded();
  });

  test.describe('Passo 1 — dados do comprador', () => {
    for (const scenario of missingFieldCases) {
      test(`valida campo obrigatório: ${scenario.title}`, async ({ checkoutInformationPage }) => {
        await checkoutInformationPage.submit(scenario.info);

        await checkoutInformationPage.expectError(scenario.expectedError);
        await checkoutInformationPage.expectLoaded();
      });
    }

    test('"Cancel" volta ao carrinho preservando os itens', async ({ checkoutInformationPage, cartPage }) => {
      await checkoutInformationPage.cancel();

      await cartPage.expectLoaded();
      await cartPage.expectItems(cartItems);
    });
  });

  test.describe('Passo 2 — revisão do pedido', () => {
    test.beforeEach(async ({ checkoutInformationPage, checkoutOverviewPage }) => {
      await checkoutInformationPage.submit(customer);
      await checkoutOverviewPage.expectLoaded();
    });

    test('exibe itens, pagamento, entrega e totais corretos', async ({ checkoutOverviewPage }) => {
      await checkoutOverviewPage.expectItems(cartItems);
      await checkoutOverviewPage.expectPaymentAndShipping();
      // Subtotal = 29.99 + 9.99 = 39.98 | Imposto 8% = 3.20 | Total = 43.18
      await checkoutOverviewPage.expectTotals(cartItems);
    });

    test('"Cancel" volta para a listagem sem perder o carrinho', async ({
      checkoutOverviewPage,
      inventoryPage,
    }) => {
      await checkoutOverviewPage.cancel();

      await inventoryPage.expectLoaded();
      await inventoryPage.header.expectCartCount(cartItems.length);
    });

    test('"Finish" confirma a compra e esvazia o carrinho @smoke', async ({
      checkoutOverviewPage,
      checkoutCompletePage,
      inventoryPage,
    }) => {
      await checkoutOverviewPage.finish();

      await checkoutCompletePage.expectOrderConfirmed();
      await checkoutCompletePage.header.expectCartCount(0);

      await checkoutCompletePage.backHome();
      await inventoryPage.expectLoaded();
      await expect(inventoryPage.addToCartButton(products.backpack.name)).toBeVisible();
    });
  });
});

test.describe('Checkout — defeitos conhecidos', () => {
  /**
   * BUG: o subtotal ("Item total") é exibido sem arredondamento para 2 casas
   * quando a soma em ponto flutuante gera dízima. Ex.: Onesie ($7.99) + Fleece
   * Jacket ($49.99) => "Item total: $57.980000000000004" (esperado "$57.98").
   * O imposto e o total usam toFixed(2) e não são afetados.
   *
   * Marcado com test.fail(): a suíte segue verde enquanto o defeito existir e
   * passa a FALHAR ("expected to fail, but passed") quando for corrigido —
   * sinal para remover a anotação.
   */
  test('subtotal deve ser exibido com duas casas decimais', async ({
    inventoryPage,
    cartPage,
    checkoutInformationPage,
    checkoutOverviewPage,
  }) => {
    test.fail(true, 'Defeito conhecido do Sauce Demo: subtotal sem formatação monetária');
    const items = [products.onesie, products.fleeceJacket];

    await inventoryPage.addToCart(...items.map((p) => p.name));
    await inventoryPage.header.openCart();
    await cartPage.checkout();
    await checkoutInformationPage.submit(customer);
    await checkoutOverviewPage.expectLoaded();

    // O valor numérico está correto; o defeito é apenas de formatação.
    expect(parsePrice((await checkoutOverviewPage.subtotal.textContent()) ?? '')).toBeCloseTo(57.98, 2);
    await checkoutOverviewPage.expectTotals(items);
  });
});
