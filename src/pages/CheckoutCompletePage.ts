import { expect } from '@playwright/test';
import { orderTexts } from '@data/checkout';
import { BasePage } from './BasePage';

/** Confirmação da compra. */
export class CheckoutCompletePage extends BasePage {
  protected readonly path = '/checkout-complete.html';
  protected readonly titleText = 'Checkout: Complete!';

  readonly completeHeader = this.page.getByTestId('complete-header');
  readonly completeText = this.page.getByTestId('complete-text');
  readonly confirmationImage = this.page.getByTestId('pony-express');
  readonly backHomeButton = this.page.getByTestId('back-to-products');

  async expectOrderConfirmed(): Promise<void> {
    await this.expectLoaded();
    await expect(this.completeHeader).toHaveText(orderTexts.completeHeader);
    await expect(this.completeText).toHaveText(orderTexts.completeText);
    await expect(this.confirmationImage).toBeVisible();
  }

  async backHome(): Promise<void> {
    await this.backHomeButton.click();
  }
}
