import { expect, Locator, Page } from '@playwright/test';

/** Cabeçalho presente em todas as páginas logadas: carrinho e menu lateral. */
export class Header {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;
  readonly menu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.menu = page.locator('.bm-menu-wrap');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
  }

  async openCart() {
    await this.cartLink.click();
  }

  async openMenu() {
    // A biblioteca do menu aplica o atributo `hidden` ~500 ms depois de carregar.
    // Clicar antes disso às vezes deixa o menu aberto mas invisível (teste intermitente),
    // então esperamos o menu "assentar" antes de clicar.
    await expect(this.menu).toHaveAttribute('hidden');
    await this.menuButton.click();
    await expect(this.menu).toHaveAttribute('aria-hidden', 'false');
  }

  async logout() {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
