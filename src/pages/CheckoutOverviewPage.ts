import { expect } from '@playwright/test';
import { orderTexts } from '@data/checkout';
import type { Product } from '@data/products';
import { calculateOrderTotals, formatPrice } from '@utils/price';
import { BasePage } from './BasePage';

/** Passo 2 do checkout: revisão do pedido. */
export class CheckoutOverviewPage extends BasePage {
  protected readonly path = '/checkout-step-two.html';
  protected readonly titleText = 'Checkout: Overview';

  readonly items = this.page.getByTestId('inventory-item');
  readonly paymentInfo = this.page.getByTestId('payment-info-value');
  readonly shippingInfo = this.page.getByTestId('shipping-info-value');
  readonly subtotal = this.page.getByTestId('subtotal-label');
  readonly tax = this.page.getByTestId('tax-label');
  readonly total = this.page.getByTestId('total-label');
  readonly finishButton = this.page.getByTestId('finish');
  readonly cancelButton = this.page.getByTestId('cancel');

  async finish(): Promise<void> {
    await this.finishButton.click();
  }

  async cancel(): Promise<void> {
    await this.cancelButton.click();
  }

  async expectItems(expected: readonly Product[]): Promise<void> {
    await expect(this.items).toHaveCount(expected.length);
    await expect(this.items.getByTestId('inventory-item-name')).toHaveText(expected.map((p) => p.name));
    await expect(this.items.getByTestId('inventory-item-price')).toHaveText(
      expected.map((p) => formatPrice(p.price)),
    );
    await expect(this.items.getByTestId('item-quantity')).toHaveText(expected.map(() => '1'));
  }

  /** Compara subtotal, imposto e total com o cálculo independente feito a partir dos dados de teste. */
  async expectTotals(expected: readonly Product[]): Promise<void> {
    const totals = calculateOrderTotals(expected);
    await expect(this.subtotal).toHaveText(`Item total: ${formatPrice(totals.subtotal)}`);
    await expect(this.tax).toHaveText(`Tax: ${formatPrice(totals.tax)}`);
    await expect(this.total).toHaveText(`Total: ${formatPrice(totals.total)}`);
  }

  async expectPaymentAndShipping(): Promise<void> {
    await expect(this.paymentInfo).toHaveText(orderTexts.paymentInfo);
    await expect(this.shippingInfo).toHaveText(orderTexts.shippingInfo);
  }
}
