import { expect, type Locator } from '@playwright/test';
import type { Product } from '@data/products';
import { formatPrice } from '@utils/price';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  protected readonly path = '/cart.html';
  protected readonly titleText = 'Your Cart';

  readonly items = this.page.getByTestId('inventory-item');
  readonly checkoutButton = this.page.getByTestId('checkout');
  readonly continueShoppingButton = this.page.getByTestId('continue-shopping');

  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  async removeItem(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove' }).click();
    await expect(this.item(name)).toHaveCount(0);
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }

  async continueShopping(): Promise<void> {
    await this.continueShoppingButton.click();
  }

  /**
   * Valida o conteúdo exato do carrinho: mesma quantidade de linhas, na mesma
   * ordem de inclusão, com nome, preço e quantidade (1) corretos.
   */
  async expectItems(expected: readonly Product[]): Promise<void> {
    await expect(this.items).toHaveCount(expected.length);
    await expect(this.items.getByTestId('inventory-item-name')).toHaveText(expected.map((p) => p.name));
    await expect(this.items.getByTestId('inventory-item-price')).toHaveText(
      expected.map((p) => formatPrice(p.price)),
    );
    await expect(this.items.getByTestId('item-quantity')).toHaveText(expected.map(() => '1'));
  }
}
