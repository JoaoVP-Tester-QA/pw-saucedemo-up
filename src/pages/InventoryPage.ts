import { expect, type Locator } from '@playwright/test';
import type { SortOption } from '@data/products';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  protected readonly path = '/inventory.html';
  protected readonly titleText = 'Products';

  readonly items = this.page.getByTestId('inventory-item');
  readonly itemNames = this.page.getByTestId('inventory-item-name');
  readonly itemPrices = this.page.getByTestId('inventory-item-price');
  readonly sortSelect = this.page.getByTestId('product-sort-container');
  readonly activeSortOption = this.page.getByTestId('active-option');

  /** Card de um produto, localizado pelo nome exibido (e não por índice). */
  item(name: string): Locator {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').getByText(name, { exact: true }),
    });
  }

  addToCartButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Add to cart' });
  }

  removeButton(name: string): Locator {
    return this.item(name).getByRole('button', { name: 'Remove' });
  }

  async addToCart(...names: string[]): Promise<void> {
    for (const name of names) {
      await this.addToCartButton(name).click();
      // Confirma a troca do botão antes de seguir, garantindo que o estado foi aplicado.
      await expect(this.removeButton(name)).toBeVisible();
    }
  }

  async removeFromCart(name: string): Promise<void> {
    await this.removeButton(name).click();
    await expect(this.addToCartButton(name)).toBeVisible();
  }

  async openProduct(name: string): Promise<void> {
    await this.item(name).getByTestId('inventory-item-name').click();
  }

  async openProductByImage(name: string): Promise<void> {
    await this.item(name).getByRole('img').click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }
}
