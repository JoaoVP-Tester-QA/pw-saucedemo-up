// Dados de teste centralizados (separados do código dos testes).

export const users = {
  standard: { username: 'standard_user', password: 'secret_sauce' },
  lockedOut: { username: 'locked_out_user', password: 'secret_sauce' },
};

export const products = {
  backpack: { name: 'Sauce Labs Backpack', price: '$29.99' },
  bikeLight: { name: 'Sauce Labs Bike Light', price: '$9.99' },
  boltTShirt: { name: 'Sauce Labs Bolt T-Shirt', price: '$15.99' },
  fleeceJacket: { name: 'Sauce Labs Fleece Jacket', price: '$49.99' },
  onesie: { name: 'Sauce Labs Onesie', price: '$7.99' },
  redTShirt: { name: 'Test.allTheThings() T-Shirt (Red)', price: '$15.99' },
};

export const customer = { firstName: 'João', lastName: 'Silva', postalCode: '12010-000' };

// Pedido usado no checkout: Backpack + Bike Light
// 29.99 + 9.99 = 39.98 | imposto 8% = 3.20 | total = 43.18
export const order = {
  items: [products.backpack, products.bikeLight],
  subtotal: 'Item total: $39.98',
  tax: 'Tax: $3.20',
  total: 'Total: $43.18',
};

export const messages = {
  usernameRequired: 'Epic sadface: Username is required',
  invalidCredentials: 'Epic sadface: Username and password do not match any user in this service',
  lockedOut: 'Epic sadface: Sorry, this user has been locked out.',
  firstNameRequired: 'Error: First Name is required',
  lastNameRequired: 'Error: Last Name is required',
  postalCodeRequired: 'Error: Postal Code is required',
  orderComplete: 'Thank you for your order!',
};
