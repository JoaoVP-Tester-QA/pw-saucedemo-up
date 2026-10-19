import { test, expect } from '../fixtures/fixtures';
import { products } from '../data/testData';

test.describe('Carrinho', () => {
  test.beforeEach(async ({ loggedIn }) => {}); // a fixture `loggedIn` faz o login

  test('adiciona um produto ao carrinho', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await expect(header.cartBadge).toHaveText('1');

    await header.openCart();

    await expect(cartPage.itemNames).toHaveText([products.backpack.name]);
    await expect(cartPage.itemPrices).toHaveText([products.backpack.price]);
  });

  test('adiciona vários produtos ao carrinho', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await inventoryPage.addToCart(products.onesie.name);
    await expect(header.cartBadge).toHaveText('3');

    await header.openCart();

    await expect(cartPage.itemNames).toHaveText([
      products.backpack.name,
      products.bikeLight.name,
      products.onesie.name,
    ]);
  });

  test('remove um produto do carrinho', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.bikeLight.name);
    await header.openCart();

    await cartPage.removeItem(products.backpack.name);

    await expect(cartPage.itemNames).toHaveText([products.bikeLight.name]);
    await expect(header.cartBadge).toHaveText('1');
  });
});
