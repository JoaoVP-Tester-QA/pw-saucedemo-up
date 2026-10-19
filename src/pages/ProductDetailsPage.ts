import { expect, type Locator, type Page } from '@playwright/test';
import type { Product } from '@data/products';
import { formatPrice } from '@utils/price';
import { HeaderComponent } from './components/HeaderComponent';

/** Página de detalhes de um produto (/inventory-item.html?id=N). Não possui título de seção. */
export class ProductDetailsPage {
  readonly header: HeaderComponent;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly image: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  readonly backToProductsButton: Locator;

  constructor(private readonly page: Page) {
    this.header = new HeaderComponent(page);
    const container = page.getByTestId('inventory-item');
    this.name = container.getByTestId('inventory-item-name');
    this.description = container.getByTestId('inventory-item-desc');
    this.price = container.getByTestId('inventory-item-price');
    this.image = container.getByRole('img');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.removeButton = page.getByTestId('remove');
    this.backToProductsButton = page.getByTestId('back-to-products');
  }

  async goto(productId: number): Promise<void> {
    await this.page.goto(`/inventory-item.html?id=${productId}`);
  }

  async expectProduct(product: Product): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`/inventory-item\\.html\\?id=${product.id}$`));
    await expect(this.name).toHaveText(product.name);
    await expect(this.price).toHaveText(formatPrice(product.price));
    await expect(this.description).not.toBeEmpty();
    await expect(this.image).toHaveAttribute('alt', product.name);
  }

  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
    await expect(this.removeButton).toBeVisible();
  }

  async removeFromCart(): Promise<void> {
    await this.removeButton.click();
    await expect(this.addToCartButton).toBeVisible();
  }

  async backToProducts(): Promise<void> {
    await this.backToProductsButton.click();
  }
}
