import { authenticatedTest as test, expect } from '@fixtures/test';
import { catalog, products, sortOptionLabels } from '@data/products';
import { formatPrice } from '@utils/price';

/** Oráculo independente: nomes do catálogo em ordem alfabética. */
const namesAsc = catalog.map((p) => p.name).sort((a, b) => a.localeCompare(b));

test.describe('Catálogo de produtos', () => {
  test('lista todos os produtos com nome, preço e botão de compra @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(catalog.length);

    for (const product of catalog) {
      const card = inventoryPage.item(product.name);
      await expect(card).toHaveCount(1);
      await expect(card.getByTestId('inventory-item-price')).toHaveText(formatPrice(product.price));
      await expect(card.getByTestId('inventory-item-desc')).not.toBeEmpty();
      await expect(inventoryPage.addToCartButton(product.name)).toBeEnabled();
    }
  });

  test('exibe ordenação padrão por nome (A a Z)', async ({ inventoryPage }) => {
    await expect(inventoryPage.activeSortOption).toHaveText(sortOptionLabels.az);
    await expect(inventoryPage.itemNames).toHaveText(namesAsc);
  });

  test.describe('Ordenação', () => {
    const expectedNames = { az: namesAsc, za: [...namesAsc].reverse() };

    for (const option of ['za', 'az'] as const) {
      test(`ordena por ${sortOptionLabels[option]}`, async ({ inventoryPage }) => {
        // Parte da ordenação oposta para garantir que houve mudança real na lista.
        await inventoryPage.sortBy(option === 'az' ? 'za' : 'az');
        await inventoryPage.sortBy(option);

        await expect(inventoryPage.activeSortOption).toHaveText(sortOptionLabels[option]);
        await expect(inventoryPage.itemNames).toHaveText(expectedNames[option]);
      });
    }

    // Há dois produtos com o mesmo preço ($15.99) e a aplicação não define
    // critério de desempate; por isso a ordenação por preço é validada sobre a
    // sequência de preços, e não de nomes — evita um teste frágil.
    for (const option of ['lohi', 'hilo'] as const) {
      test(`ordena por ${sortOptionLabels[option]}`, async ({ inventoryPage }) => {
        await inventoryPage.sortBy(option);

        await expect(inventoryPage.activeSortOption).toHaveText(sortOptionLabels[option]);
        const expectedPrices = catalog
          .map((p) => p.price)
          .sort((a, b) => (option === 'lohi' ? a - b : b - a))
          .map(formatPrice);
        await expect(inventoryPage.itemPrices).toHaveText(expectedPrices);
      });
    }

    test('mantém os itens do carrinho ao trocar a ordenação', async ({ inventoryPage }) => {
      await inventoryPage.addToCart(products.onesie.name);

      await inventoryPage.sortBy('hilo');

      await expect(inventoryPage.removeButton(products.onesie.name)).toBeVisible();
      await inventoryPage.header.expectCartCount(1);
    });
  });

  test.describe('Página de detalhes', () => {
    test('abre o detalhe pelo nome com os mesmos dados da listagem @smoke', async ({
      inventoryPage,
      productDetailsPage,
    }) => {
      const product = products.backpack;
      const listedDescription = await inventoryPage
        .item(product.name)
        .getByTestId('inventory-item-desc')
        .textContent();

      await inventoryPage.openProduct(product.name);

      await productDetailsPage.expectProduct(product);
      await expect(productDetailsPage.description).toHaveText(listedDescription ?? '');
      await expect(productDetailsPage.addToCartButton).toBeVisible();
    });

    test('abre o detalhe pela imagem do produto', async ({ inventoryPage, productDetailsPage }) => {
      await inventoryPage.openProductByImage(products.onesie.name);

      await productDetailsPage.expectProduct(products.onesie);
    });

    test('adiciona e remove o produto a partir do detalhe', async ({ productDetailsPage }) => {
      await productDetailsPage.goto(products.bikeLight.id);
      await productDetailsPage.expectProduct(products.bikeLight);

      await productDetailsPage.addToCart();
      await productDetailsPage.header.expectCartCount(1);

      await productDetailsPage.removeFromCart();
      await productDetailsPage.header.expectCartCount(0);
    });

    test('volta para a listagem pelo botão "Back to products"', async ({
      inventoryPage,
      productDetailsPage,
    }) => {
      await productDetailsPage.goto(products.redTShirt.id);
      await productDetailsPage.expectProduct(products.redTShirt);

      await productDetailsPage.backToProducts();

      await inventoryPage.expectLoaded();
      await expect(inventoryPage.items).toHaveCount(catalog.length);
    });
  });
});
