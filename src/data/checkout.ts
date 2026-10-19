export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customer: CustomerInfo = {
  firstName: 'João',
  lastName: 'Silva',
  postalCode: '12010-000',
};

export interface MissingFieldCase {
  title: string;
  info: CustomerInfo;
  expectedError: string;
}

/** Validações obrigatórias do passo "Your Information" (data-driven). */
export const missingFieldCases: MissingFieldCase[] = [
  {
    title: 'primeiro nome ausente',
    info: { ...customer, firstName: '' },
    expectedError: 'Error: First Name is required',
  },
  {
    title: 'sobrenome ausente',
    info: { ...customer, lastName: '' },
    expectedError: 'Error: Last Name is required',
  },
  {
    title: 'CEP ausente',
    info: { ...customer, postalCode: '' },
    expectedError: 'Error: Postal Code is required',
  },
];

/** Textos fixos exibidos no resumo e na confirmação do pedido. */
export const orderTexts = {
  paymentInfo: 'SauceCard #31337',
  shippingInfo: 'Free Pony Express Delivery!',
  completeHeader: 'Thank you for your order!',
  completeText:
    'Your order has been dispatched, and will arrive just as fast as the pony can get there!',
} as const;

/** Alíquota de imposto aplicada pelo Sauce Demo sobre o subtotal. */
export const TAX_RATE = 0.08;
