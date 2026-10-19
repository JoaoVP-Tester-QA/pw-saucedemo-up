import { authenticatedTest as test, expect } from '@fixtures/test';
import { products } from '@data/products';

test.describe('Carrinho', () => {
  test('carrinho começa vazio', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.header.expectCartCount(0);

    await inventoryPage.header.openCart();

    await cartPage.expectLoaded();
    await expect(cartPage.items).toHaveCount(0);
  });

  test('adiciona um produto e valida o conteúdo do carrinho @smoke', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.header.expectCartCount(1);

    await inventoryPage.header.openCart();

    await cartPage.expectLoaded();
    await cartPage.expectItems([products.backpack]);
  });

  test('adiciona vários produtos e valida nome, preço, quantidade e ordem', async ({
    inventoryPage,
    cartPage,
  }) => {
    const selected = [products.fleeceJacket, products.bikeLight, products.redTShirt];

    await inventoryPage.addToCart(...selected.map((p) => p.name));
    await inventoryPage.header.expectCartCount(selected.length);

    await inventoryPage.header.openCart();

    await cartPage.expectItems(selected);
  });

  test('remove produto pela listagem e atualiza o contador', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name, products.onesie.name);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.removeFromCart(products.backpack.name);

    await inventoryPage.header.expectCartCount(1);
    await inventoryPage.header.openCart();
    await cartPage.expectItems([products.onesie]);
  });

  test('remove produto dentro do carrinho', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name, products.bikeLight.name);
    await inventoryPage.header.openCart();

    await cartPage.removeItem(products.backpack.name);

    await cartPage.expectItems([products.bikeLight]);
    await cartPage.header.expectCartCount(1);
  });

  test('"Continue Shopping" volta para a listagem mantendo os itens', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.boltTShirt.name);
    await inventoryPage.header.openCart();

    await cartPage.continueShopping();

    await inventoryPage.expectLoaded();
    await expect(inventoryPage.removeButton(products.boltTShirt.name)).toBeVisible();
    await inventoryPage.header.expectCartCount(1);
  });

  test('mantém o carrinho após recarregar a página', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.addToCart(products.backpack.name, products.fleeceJacket.name);
    await inventoryPage.header.openCart();

    await page.reload();

    await cartPage.expectItems([products.backpack, products.fleeceJacket]);
  });

  test('"Reset App State" esvazia o carrinho', async ({ inventoryPage, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name, products.onesie.name);
    await inventoryPage.header.expectCartCount(2);

    await inventoryPage.header.openMenu();
    await inventoryPage.header.resetAppStateLink.click();

    await inventoryPage.header.expectCartCount(0);
    await inventoryPage.header.openCart();
    await expect(cartPage.items).toHaveCount(0);
  });
});
