import { test, expect } from '../fixtures/fixtures';
import { products } from '../data/testData';

test.describe('Produtos', () => {
  test.beforeEach(async ({ loggedIn }) => {}); // a fixture `loggedIn` faz o login

  test('lista os 6 produtos do catálogo', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
    await expect(inventoryPage.item(products.backpack.name)).toContainText(products.backpack.price);
  });

  test('ordena por nome (Z a A)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');

    await expect(inventoryPage.itemNames.first()).toHaveText(products.redTShirt.name);
    const names = await inventoryPage.itemNames.allTextContents();
    expect(names).toEqual([...names].sort().reverse());
  });

  test('ordena por preço (menor para maior)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');

    await expect(inventoryPage.itemNames.first()).toHaveText(products.onesie.name);
    const prices = (await inventoryPage.itemPrices.allTextContents()).map((p) => Number(p.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('ordena por preço (maior para menor)', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');

    await expect(inventoryPage.itemNames.first()).toHaveText(products.fleeceJacket.name);
    const prices = (await inventoryPage.itemPrices.allTextContents()).map((p) => Number(p.replace('$', '')));
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('abre a página de detalhes do produto', async ({ page, inventoryPage, productPage }) => {
    await inventoryPage.openProduct(products.backpack.name);

    await expect(page).toHaveURL(/inventory-item\.html\?id=4/);
    await expect(productPage.name).toHaveText(products.backpack.name);
    await expect(productPage.price).toHaveText(products.backpack.price);
    await expect(productPage.description).not.toBeEmpty();
    await expect(productPage.addToCartButton).toBeVisible();
  });
});
