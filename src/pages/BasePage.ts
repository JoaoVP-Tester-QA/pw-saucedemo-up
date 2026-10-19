import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from './components/HeaderComponent';

/**
 * Base das páginas autenticadas. Concentra o cabeçalho e a verificação de
 * "página carregada" (URL + título), para que cada Page Object declare apenas
 * o que é específico dele.
 */
export abstract class BasePage {
  readonly header: HeaderComponent;
  readonly title: Locator;

  protected abstract readonly path: string;
  protected abstract readonly titleText: string;

  constructor(protected readonly page: Page) {
    this.header = new HeaderComponent(page);
    this.title = page.getByTestId('title');
  }

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(`${escapeRegExp(this.path)}$`));
    await expect(this.title).toHaveText(this.titleText);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
