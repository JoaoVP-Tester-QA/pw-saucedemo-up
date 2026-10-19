import { expect, type Locator, type Page } from '@playwright/test';

/** Cabeçalho comum às páginas autenticadas: carrinho e menu lateral. */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly openMenuButton: Locator;
  /** Contêiner do menu lateral; a lib não expõe data-test nele. */
  readonly menu: Locator;
  readonly logoutLink: Locator;
  readonly resetAppStateLink: Locator;
  readonly allItemsLink: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.openMenuButton = page.getByRole('button', { name: 'Open Menu' });
    this.menu = page.locator('.bm-menu-wrap');
    this.logoutLink = page.getByTestId('logout-sidebar-link');
    this.resetAppStateLink = page.getByTestId('reset-sidebar-link');
    this.allItemsLink = page.getByTestId('inventory-sidebar-link');
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  /**
   * Abre o menu lateral (react-burger-menu) de forma determinística.
   *
   * Causa raiz de uma intermitência encontrada nos testes de estabilidade: a
   * biblioteca agenda, 500 ms após montar o menu, um timer que aplica o
   * atributo `hidden` ao contêiner. Se o clique em "Open Menu" acontece dentro
   * dessa janela (logo após uma navegação), o timer dispara depois do clique e
   * o menu fica "aberto" (aria-hidden="false") porém invisível.
   *
   * Em vez de retentativas ou esperas fixas, aguardamos o menu fechado
   * estabilizar (atributo `hidden` presente) antes de clicar e, depois,
   * validamos o estado aberto pelo `aria-hidden` e pela visibilidade real.
   */
  async openMenu(): Promise<void> {
    await expect(this.menu).toHaveAttribute('hidden');
    await this.openMenuButton.click();
    await expect(this.menu).toHaveAttribute('aria-hidden', 'false');
    await expect(this.menu).not.toHaveAttribute('hidden');
    await expect(this.logoutLink).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }

  /** Valida o contador do carrinho. Com 0 itens o badge não é renderizado. */
  async expectCartCount(count: number): Promise<void> {
    if (count === 0) {
      await expect(this.cartBadge).toHaveCount(0);
    } else {
      await expect(this.cartBadge).toHaveText(String(count));
    }
  }
}
