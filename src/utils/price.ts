import { TAX_RATE } from '@data/checkout';
import type { Product } from '@data/products';

/** Converte textos como "$29.99", "Item total: $39.98" ou "Tax: $3.20" em número. */
export function parsePrice(text: string): number {
  const match = text.match(/\$(\d+(?:\.\d{1,2})?)/);
  if (!match) {
    throw new Error(`Não foi possível extrair um preço de: "${text}"`);
  }
  return Number(match[1]);
}

/** Formata um valor como o Sauce Demo exibe: "$29.99". */
export function formatPrice(value: number): string {
  return `$${value.toFixed(2)}`;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  total: number;
}

/**
 * Calcula o total esperado do pedido em centavos inteiros, evitando erros de
 * ponto flutuante (ex.: 0.1 + 0.2). É o oráculo independente usado para
 * validar os valores exibidos no resumo do checkout.
 */
export function calculateOrderTotals(items: readonly Pick<Product, 'price'>[]): OrderTotals {
  const subtotalCents = items.reduce((sum, item) => sum + Math.round(item.price * 100), 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  return {
    subtotal: subtotalCents / 100,
    tax: taxCents / 100,
    total: (subtotalCents + taxCents) / 100,
  };
}
