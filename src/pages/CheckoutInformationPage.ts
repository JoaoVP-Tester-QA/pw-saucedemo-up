import { expect } from '@playwright/test';
import type { CustomerInfo } from '@data/checkout';
import { BasePage } from './BasePage';

/** Passo 1 do checkout: dados do comprador. */
export class CheckoutInformationPage extends BasePage {
  protected readonly path = '/checkout-step-one.html';
  protected readonly titleText = 'Checkout: Your Information';

  readonly firstNameInput = this.page.getByTestId('firstName');
  readonly lastNameInput = this.page.getByTestId('lastName');
  readonly postalCodeInput = this.page.getByTestId('postalCode');
  readonly continueButton = this.page.getByTestId('continue');
  readonly cancelButton = this.page.getByTestId('cancel');
  readonly errorMessage = this.page.getByTestId('error');

  async fillInformation(info: CustomerInfo): Promise<void> {
    await this.firstNameInput.fill(info.firstName);
    await this.lastNameInput.fill(info.lastName);
    await this.postalCodeInput.fill(info.postalCode);
  }

  async continue(): Promise<void> {
    await this.continueButton.click();
  }

  async submit(info: CustomerInfo): Promise<void> {
    await this.fillInformation(info);
    await this.continue();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toHaveText(message);
  }
}
