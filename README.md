# Sauce Demo — Testes E2E com Playwright

Automação do fluxo de compra do [Sauce Demo](https://www.saucedemo.com) usando **Playwright + TypeScript**.

## Como rodar

Pré-requisito: **Node.js 20 ou superior**.

```bash
npm install        # instala as dependências e o navegador Chromium
npm test           # roda todos os testes
npm run report     # abre o relatório HTML da última execução
```

Outros comandos:

| Comando | O que faz |
|---|---|
| `npm run test:headed` | Roda os testes com o navegador visível |
| `npm run test:ui` | Abre o modo interativo do Playwright (bom para depurar) |
| `npx playwright test tests/cart.spec.ts` | Roda um arquivo específico |

> Se aparecer o erro `Executable doesn't exist`, rode `npx playwright install chromium`.

## Estrutura

```
├── data/testData.ts        # dados de teste: usuários, produtos, comprador, mensagens
├── fixtures/fixtures.ts    # entrega os Page Objects prontos e faz o login (loggedIn)
├── pages/                  # Page Objects (um por tela)
│   ├── LoginPage.ts
│   ├── InventoryPage.ts    # listagem de produtos
│   ├── ProductPage.ts      # detalhes do produto
│   ├── CartPage.ts
│   ├── CheckoutPage.ts     # as 3 etapas do checkout
│   └── Header.ts           # carrinho e menu (comum a todas as telas)
├── tests/                  # os testes, um arquivo por funcionalidade
└── playwright.config.ts
```

## Decisões técnicas

- **Page Objects:** os seletores e as ações de cada tela ficam em `pages/`. Os testes só descrevem o comportamento esperado; se a tela mudar, o ajuste é feito em um lugar só.
- **Fixtures:** em vez de criar `new LoginPage(page)` em todo teste, a fixture já entrega os Page Objects. A fixture `loggedIn` faz o login antes do teste.
- **Dados desacoplados:** usuários, produtos, preços e mensagens ficam em `data/testData.ts`.
- **Seletores estáveis:** o site tem o atributo `data-test` nos elementos, então usamos `getByTestId` (configurado em `testIdAttribute`). Produtos são encontrados pelo nome, não pela posição na lista.
- **Data-driven:** login inválido e campos obrigatórios do checkout rodam o mesmo teste com dados diferentes.
- **Sem esperas fixas:** nenhum `waitForTimeout`; as asserções do Playwright esperam o estado certo automaticamente.
- **Relatórios:** relatório HTML a cada execução, com screenshot e trace dos testes que falharem. No GitHub Actions o relatório fica disponível como artefato.

## Cenários cobertos (20 testes)

| Funcionalidade | Cenários |
|---|---|
| **Login** | Credenciais válidas · usuário vazio · senha incorreta · usuário bloqueado · logout |
| **Produtos** | Lista os 6 produtos · ordena por nome (Z-A) · ordena por preço (crescente e decrescente) · abre a página de detalhes |
| **Carrinho** | Adiciona um produto · adiciona vários · remove um produto |
| **Checkout** | Campos obrigatórios (nome, sobrenome, CEP) · revisão com subtotal, imposto e total · finaliza a compra |
| **Fluxo completo** | Login → adiciona produtos → carrinho → checkout → confirmação |

### Bug encontrado

Com **Sauce Labs Onesie** ($7.99) + **Sauce Labs Fleece Jacket** ($49.99) no carrinho, a revisão do pedido mostra `Item total: $57.980000000000004` em vez de `$57.98` (erro de arredondamento). O teste desse caso usa `test.fail()`: fica verde enquanto o bug existir e avisa quando ele for corrigido.

### Estabilidade

A suíte foi executada 10 vezes seguidas em paralelo (`npx playwright test --repeat-each=10 --workers=4`) sem nenhuma falha. Durante essa verificação apareceu um teste intermitente no menu lateral: o menu do site só responde corretamente cerca de 500 ms depois de carregar. A correção está em `Header.openMenu()`, que espera o menu ficar pronto antes de clicar.

## Cenários pendentes

Priorizei o fluxo de compra com o `standard_user`. O que eu faria a seguir:

- **Outros usuários do site** (`problem_user`, `error_user`, `performance_glitch_user`): reaproveitar os mesmos testes trocando o usuário, marcando com `test.fail()` os defeitos propositais de cada um.
- **Mais navegadores:** adicionar Firefox e WebKit em `projects` no `playwright.config.ts`.
- **Regressão visual:** comparar screenshots com `toHaveScreenshot()` (útil para o `visual_user`).
- **Acessibilidade:** checar as telas principais com `@axe-core/playwright`.
