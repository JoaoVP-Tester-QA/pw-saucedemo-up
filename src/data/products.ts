/**
 * Catálogo esperado do Sauce Demo. Serve como oráculo para as asserções de
 * listagem, ordenação, detalhe e totais do pedido.
 */
export interface Product {
  id: number;
  name: string;
  /** Preço em dólares, exatamente como exibido (sem o símbolo). */
  price: number;
}

export const products = {
  backpack: { id: 4, name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { id: 0, name: 'Sauce Labs Bike Light', price: 9.99 },
  boltTShirt: { id: 1, name: 'Sauce Labs Bolt T-Shirt', price: 15.99 },
  fleeceJacket: { id: 5, name: 'Sauce Labs Fleece Jacket', price: 49.99 },
  onesie: { id: 2, name: 'Sauce Labs Onesie', price: 7.99 },
  redTShirt: { id: 3, name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const satisfies Record<string, Product>;

export const catalog: readonly Product[] = Object.values(products);

export type SortOption = 'az' | 'za' | 'lohi' | 'hilo';

export const sortOptionLabels: Record<SortOption, string> = {
  az: 'Name (A to Z)',
  za: 'Name (Z to A)',
  lohi: 'Price (low to high)',
  hilo: 'Price (high to low)',
};
