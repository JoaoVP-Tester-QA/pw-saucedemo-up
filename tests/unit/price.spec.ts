import { expect, test } from '@playwright/test';
import { calculateOrderTotals, formatPrice, parsePrice } from '@utils/price';

/**
 * Testes do próprio oráculo de preços: se o cálculo esperado estiver errado,
 * as asserções de checkout perdem o valor. Não abrem navegador.
 */
test.describe('utils/price', () => {
  test('extrai valores de rótulos do Sauce Demo', () => {
    expect(parsePrice('$29.99')).toBe(29.99);
    expect(parsePrice('Item total: $39.98')).toBe(39.98);
    expect(parsePrice('Tax: $3.20')).toBe(3.2);
    expect(() => parsePrice('sem preço')).toThrow();
  });

  test('formata com duas casas decimais', () => {
    expect(formatPrice(3.2)).toBe('$3.20');
    expect(formatPrice(57.98)).toBe('$57.98');
  });

  test('calcula subtotal, imposto de 8% e total sem erro de ponto flutuante', () => {
    expect(calculateOrderTotals([{ price: 29.99 }, { price: 9.99 }])).toEqual({
      subtotal: 39.98,
      tax: 3.2,
      total: 43.18,
    });
    // 7.99 + 49.99 em ponto flutuante = 57.980000000000004
    expect(calculateOrderTotals([{ price: 7.99 }, { price: 49.99 }]).subtotal).toBe(57.98);
    expect(calculateOrderTotals([])).toEqual({ subtotal: 0, tax: 0, total: 0 });
  });
});
