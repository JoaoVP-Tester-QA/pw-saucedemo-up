# Sauce Demo — Testes E2E com Playwright

Automação de ponta a ponta do fluxo de compra do [Sauce Demo](https://www.saucedemo.com) com **Playwright + TypeScript**, organizada com Page Objects, fixtures customizadas, dados de teste desacoplados e relatórios de execução.

| | |
|---|---|
| **Cenários** | 40 testes (37 E2E + 3 unitários do oráculo de preços) |
| **Cobertura obrigatória** | Login · Catálogo (listagem, ordenação, detalhes) · Carrinho · Checkout |
| **Estabilidade** | 400/400 execuções sem falha — 370 E2E + 30 unitárias (`--repeat-each=10`, 4 workers, 0 retries) |
| **Defeito encontrado** | Subtotal exibido sem arredondamento (ver [Defeito encontrado](#defeito-encontrado)) |

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Execução](#execução)
- [Relatórios](#relatórios)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Decisões técnicas](#decisões-técnicas)
- [Cenários cobertos](#cenários-cobertos)
- [Defeito encontrado](#defeito-encontrado)
- [Estabilidade](#estabilidade)
- [Cenários pendentes e próximos passos](#cenários-pendentes-e-próximos-passos)

---

## Pré-requisitos

- **Node.js 20+** (versão de referência em `.nvmrc`: 22)
- npm

## Instalação

```bash
git clone <url-do-repositorio>
cd saucedemo-playwright
npm install
npx playwright install --with-deps chromium
```

> Para rodar em Firefox e WebKit também: `npx playwright install --with-deps`.

## Execução

| Comando | O que faz |
|---|---|
| `npm test` | Suíte completa no Chromium (headless) |
| `npm run test:smoke` | Apenas os cenários críticos (`@smoke`) |
| `npm run test:headed` | Suíte com o navegador visível |
| `npm run test:ui` | Modo UI do Playwright (debug interativo, time-travel) |
| `npm run test:all-browsers` | Chromium, Firefox e WebKit |
| `npm run test:stability` | Repete cada teste 5× para detectar flakiness |
| `npm run report` | Abre o último relatório HTML |
| `npm run typecheck` | Verificação de tipos (TypeScript strict) |

Filtros úteis do Playwright continuam disponíveis, por exemplo:

```bash
npx playwright test tests/checkout            # uma pasta
npx playwright test -g "ordena por"           # por título
npx playwright test --grep @e2e --headed      # por tag
```

### Variáveis de ambiente

| Variável | Padrão | Uso |
|---|---|---|
| `BASE_URL` | `https://www.saucedemo.com` | Ambiente alvo (homologação, cópia local etc.) |
| `SAUCE_PASSWORD` | `secret_sauce` | Senha dos usuários de teste |
| `CI` | — | Ativa `forbidOnly`, 1 retry, 2 workers e reporters de CI |

**Rodar contra uma cópia local do Sauce Demo** (útil se o site público estiver instável): o build publicado em produção fica na branch `gh-pages` do repositório oficial.

```bash
git clone --depth 1 -b gh-pages https://github.com/saucelabs/sample-app-web.git /tmp/saucedemo
npx serve -s /tmp/saucedemo -l 4173          # -s: fallback SPA para index.html
BASE_URL=http://localhost:4173 npm test
```

## Relatórios

- **HTML** (`playwright-report/`): gerado em toda execução; `npm run report` para abrir. Testes com `test.step` (jornada E2E) aparecem com as etapas nomeadas.
- **Evidências de falha** (`test-results/`): screenshot, vídeo e **trace** (`npx playwright show-trace <arquivo>.zip`) são mantidos apenas quando um teste falha.
- **CI** (GitHub Actions): além do HTML, gera **JUnit** (`test-results/junit.xml`) e anotações inline no PR (reporter `github`). Relatório e traces são publicados como artefatos do workflow.

## Estrutura do projeto

```
.
├── .github/workflows/playwright.yml   # CI: push, PR, manual e execução diária
├── playwright.config.ts               # baseURL, testIdAttribute, reporters, projetos
├── src/
│   ├── data/                          # dados de teste desacoplados
│   │   ├── users.ts                   #   credenciais + casos de login inválido
│   │   ├── products.ts                #   catálogo esperado (oráculo) + rótulos de ordenação
│   │   └── checkout.ts                #   comprador, validações obrigatórias, textos do pedido
│   ├── fixtures/
│   │   └── test.ts                    # `test` (deslogado) e `authenticatedTest` (logado)
│   ├── pages/                         # Page Objects
│   │   ├── BasePage.ts                #   header + verificação de página carregada
│   │   ├── components/HeaderComponent.ts  # carrinho e menu lateral
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ProductDetailsPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutInformationPage.ts
│   │   ├── CheckoutOverviewPage.ts
│   │   └── CheckoutCompletePage.ts
│   └── utils/
│       └── price.ts                   # parse/format e cálculo independente dos totais
└── tests/
    ├── auth/login.spec.ts             # login válido/inválido, logout, rota protegida
    ├── catalog/products.spec.ts       # listagem, ordenação, página de detalhes
    ├── cart/cart.spec.ts              # adição, remoção, persistência do carrinho
    ├── checkout/checkout.spec.ts      # validações, revisão, totais, confirmação
    ├── e2e/purchase-flow.spec.ts      # jornada completa, sem atalhos
    └── unit/price.spec.ts             # testes do oráculo de preços (sem navegador)
```

## Decisões técnicas

**Page Objects enxutos, asserções reutilizáveis.** Cada página expõe locators e ações de negócio (`addToCart`, `submit`, `finish`). As verificações que se repetem entre specs (`expectItems`, `expectTotals`, `expectOrderConfirmed`) também ficam no Page Object, para que a regra "o que significa um carrinho correto" exista em um só lugar. Verificações específicas de um cenário ficam no próprio teste.

**Locators estáveis.** O Sauce Demo expõe `data-test` em praticamente todos os elementos, então o projeto configura `testIdAttribute: 'data-test'` e usa `getByTestId`. Itens são localizados **pelo nome do produto** (`items.filter({ has: ... getByText(name, { exact: true }) })`) e não por índice ou por IDs derivados do nome, o que mantém os testes legíveis e independentes da ordem da lista. Botões dentro de um card usam `getByRole` com o nome acessível.

**Duas fixtures de teste.**
- `test`: injeta os Page Objects; usado nos cenários que começam deslogados (login, jornada E2E).
- `authenticatedTest`: cada teste já começa **logado, com carrinho vazio, na listagem**. A sessão é criada injetando o cookie `session-username` (é assim que o app guarda a sessão) em vez de repetir o login pela UI em todos os testes: mais rápido e sem acoplar dezenas de testes à tela de login, que já tem cobertura dedicada. Alternativa considerada: `storageState` em um *setup project*; descartada porque o cookie do app expira em 10 minutos, o que tornaria execuções longas frágeis. O usuário é configurável via `test.use({ user })`.

**Isolamento total.** Cada teste roda em um contexto de navegador novo (cookies e `localStorage` próprios), o que permite `fullyParallel: true` sem que o carrinho de um teste vaze para outro.

**Dados desacoplados e oráculos independentes.** Produtos, preços, mensagens de erro e dados do comprador vivem em `src/data`. Os totais do checkout são comparados com um cálculo feito **em centavos inteiros** a partir dos dados de teste (`calculateOrderTotals`), e não com valores lidos da própria tela — foi isso que revelou o defeito de arredondamento. O oráculo tem seus próprios testes unitários.

**Data-driven onde faz sentido.** Login inválido (5 casos) e campos obrigatórios do checkout (3 casos) são gerados a partir de tabelas de dados, mantendo um teste por caso no relatório.

**Ruído externo bloqueado.** O app envia telemetria para `backtrace.io`; essas chamadas são abortadas por uma fixture automática, porque não fazem parte do sistema sob teste e só adicionam latência e risco. Service workers também são bloqueados (`serviceWorkers: 'block'`).

**Sem esperas fixas.** Nenhum `waitForTimeout`: toda sincronização é feita com asserções *web-first* (`toHaveText`, `toHaveCount`, `toHaveAttribute`), que fazem retry automático até o estado esperado.

**Retries conscientes.** Localmente `retries: 0`. No CI, 1 retry com trace — para diagnosticar uma eventual intermitência de rede no site público, não para escondê-la: testes que só passam na retentativa aparecem como *flaky* no relatório.

**TypeScript estrito** (`strict`, `noUnusedLocals`, `noUnusedParameters`) e *path aliases* (`@pages`, `@data`, `@fixtures`, `@utils`), com `npm run typecheck` no CI.

## Cenários cobertos

### 1. Login — `tests/auth/login.spec.ts` (9)
| Cenário | Validações principais |
|---|---|
| Credenciais válidas `@smoke` | Redireciona para `/inventory.html`, título "Products", 6 produtos, cookie de sessão criado |
| Credenciais inválidas (data-driven, 5 casos) | Usuário e senha vazios · senha vazia · senha incorreta · usuário inexistente · `locked_out_user` → mensagem exata, permanece no login, campos marcados com erro |
| Fechar mensagem de erro | Mensagem some e o destaque de erro dos campos é removido |
| Acesso direto a rota protegida sem sessão | Volta ao login com a mensagem "You can only access '/inventory.html'…" |
| Logout pelo menu | Volta ao login e a rota protegida passa a exigir login novamente |

### 2. Navegação e listagem — `tests/catalog/products.spec.ts` (11)
| Cenário | Validações principais |
|---|---|
| Listagem completa `@smoke` | Os 6 produtos com preço exato, descrição e botão "Add to cart" |
| Ordenação padrão | "Name (A to Z)" ativo e nomes em ordem alfabética |
| Ordenar A→Z, Z→A | Sequência exata de nomes + rótulo da opção ativa |
| Ordenar preço ↑, preço ↓ | Sequência exata de preços + rótulo da opção ativa |
| Trocar ordenação com itens no carrinho | Itens e contador preservados |
| Detalhe pelo nome `@smoke` | URL `?id=`, nome, preço, descrição igual à da listagem, imagem |
| Detalhe pela imagem | Abre o produto correto |
| Adicionar/remover no detalhe | Botão alterna e contador do carrinho atualiza |
| "Back to products" | Volta para a listagem completa |

### 3. Carrinho — `tests/cart/cart.spec.ts` (8)
| Cenário | Validações principais |
|---|---|
| Carrinho começa vazio | Sem badge e sem itens |
| Adicionar 1 produto `@smoke` | Badge "1"; nome, preço e quantidade no carrinho |
| Adicionar vários produtos | Badge, conteúdo **exato e na ordem de inclusão** (nome, preço, qtd.) |
| Remover pela listagem | Contador e conteúdo atualizados |
| Remover dentro do carrinho | Linha removida, contador atualizado |
| "Continue Shopping" | Volta à listagem mantendo os itens |
| Recarregar a página | Carrinho persiste |
| "Reset App State" | Carrinho esvaziado |

### 4. Finalização da compra — `tests/checkout/checkout.spec.ts` (8)
| Cenário | Validações principais |
|---|---|
| Campos obrigatórios (data-driven, 3 casos) | Primeiro nome, sobrenome e CEP → mensagem exata, permanece no passo 1 |
| Cancelar no passo 1 | Volta ao carrinho com os itens |
| Revisão do pedido | Itens, "SauceCard #31337", "Free Pony Express Delivery!", **subtotal, imposto (8%) e total** calculados de forma independente |
| Cancelar na revisão | Volta à listagem sem perder o carrinho |
| Finalizar `@smoke` | Página de confirmação (título, mensagens, imagem), carrinho zerado, "Back Home" |
| Defeito conhecido (`test.fail`) | Subtotal deve ter 2 casas decimais — ver abaixo |

### 5. Jornada completa — `tests/e2e/purchase-flow.spec.ts` (1) `@smoke @e2e`
Login pela UI → ordena por menor preço → adiciona o mais barato pela listagem → abre o detalhe de outro produto e adiciona por lá → valida o carrinho → preenche dados → revisa itens e totais → finaliza → confirma pedido e carrinho vazio. Cada etapa é um `test.step`, visível no relatório.

## Defeito encontrado

**O subtotal ("Item total") é exibido sem formatação monetária quando a soma em ponto flutuante gera dízima.**

| | |
|---|---|
| **Passos** | Logar com `standard_user` → adicionar *Sauce Labs Onesie* ($7.99) e *Sauce Labs Fleece Jacket* ($49.99) → Checkout → preencher dados → Continue |
| **Esperado** | `Item total: $57.98` |
| **Obtido** | `Item total: $57.980000000000004` |
| **Impacto** | Apenas exibição: o valor numérico, o imposto e o total (`toFixed(2)`) estão corretos. Também ocorre com *Bike Light* + *Fleece Jacket* |
| **Causa provável** | O subtotal é renderizado direto da soma `7.99 + 49.99` sem `toFixed(2)` |

O cenário está automatizado em `checkout.spec.ts` com `test.fail()`: a suíte permanece verde enquanto o defeito existir e o teste **passa a falhar** ("expected to fail, but passed") quando ele for corrigido, sinalizando que a anotação deve ser removida. Os demais testes de checkout usam combinações de produtos que não disparam o defeito, para que uma falha conhecida não mascare regressões novas.

## Estabilidade

A estabilidade foi tratada como requisito, não como consequência:

- **Medição:** a suíte foi executada com `--repeat-each=10 --workers=4 --retries=0` (400 execuções — 370 delas E2E — em paralelo, com CPU sob carga para provocar condições de corrida). Resultado final: **400/400**.
- **Intermitência encontrada e corrigida pela causa raiz:** nas primeiras rodadas, ~1 em 370 execuções falhava ao abrir o menu lateral (logout / Reset App State). Investigando o trace e o código da biblioteca `react-burger-menu`, a causa é um timer de 500 ms, agendado quando o menu monta, que aplica o atributo `hidden` ao contêiner. Se o clique em "Open Menu" acontece dentro dessa janela (logo após uma navegação), o menu fica "aberto" (`aria-hidden="false"`) porém invisível. O comportamento foi reproduzido isoladamente clicando perto da marca de 500 ms.
  - A primeira tentativa de correção (repetir o clique com `toPass`) foi descartada: além de mascarar o problema, um segundo clique com o menu aberto o fechava.
  - Correção adotada (`HeaderComponent.openMenu`): aguardar o estado fechado estabilizar (`hidden` presente) antes de clicar e, depois, validar `aria-hidden="false"`, ausência de `hidden` e visibilidade real do link. Determinístico, sem esperas fixas.
  - Lição registrada no código: `toBeVisible()` nos links do menu **não** prova que ele abriu — antes da primeira abertura os links já estão no DOM, apenas fora da tela.
- **Outra escolha para evitar fragilidade:** a ordenação por preço é validada pela sequência de preços, não de nomes, porque dois produtos custam $15.99 e o app não define critério de desempate.

Para repetir a medição: `npm run test:stability` (ou `npx playwright test --repeat-each=10 --workers=4 --retries=0`).

## Cenários pendentes e próximos passos

Priorizei o fluxo de compra do `standard_user` com profundidade de asserções e estabilidade. Os itens abaixo ficaram de fora conscientemente, com a abordagem que eu seguiria:

| Item | Por que ficou de fora | Como eu abordaria |
|---|---|---|
| **Usuários com defeitos propositais** (`problem_user`, `error_user`, `performance_glitch_user`) | Cada um exige um conjunto de "defeitos esperados"; fora do fluxo feliz obrigatório | Reutilizar os specs com `test.use({ user: users.problem })` em um *project* separado do Playwright, marcando as falhas conhecidas com `test.fail()` + anotação (ex.: imagens trocadas, ordenação quebrada, campo "Last Name" com comportamento incorreto no checkout). Para `performance_glitch_user`, medir o tempo de login com um orçamento explícito em vez de aumentar timeouts |
| **Regressão visual** (`visual_user`) | Snapshots dependem de SO/fontes; exigiria baseline gerada no CI | `expect(page).toHaveScreenshot()` com máscaras em áreas dinâmicas, baselines geradas em container Docker oficial do Playwright para eliminar diferenças de renderização |
| **Cross-browser no CI** | Projetos Firefox/WebKit já estão configurados (`npm run test:all-browsers`), mas o CI roda apenas Chromium para manter o feedback rápido | Matriz no workflow (ou execução noturna) com os três navegadores e *sharding* |
| **Acessibilidade** | Fora do escopo funcional pedido | `@axe-core/playwright` nas páginas principais, falhando em violações *critical/serious* |
| **Viewport mobile** | Fora do escopo pedido | *Project* com `devices['Pixel 7']` reutilizando a jornada E2E |
| **Checkout com todos os produtos / quantidade alta** | Coberto em parte pelos testes de múltiplos itens | Teste data-driven gerando combinações do catálogo e validando totais com o oráculo (é também a forma mais eficaz de achar outras dízimas) |
| **Catálogo dinâmico** (`dynamic-catalog-*` no menu) | Funcionalidade recente do app, fora do fluxo de compra | Specs próprios para *lazy load*, *spinner* e *slider*, sincronizando por estado da UI e não por tempo |
| **Lint/format** (ESLint + Prettier, regra `playwright/no-wait-for-timeout` etc.) | Priorizei TypeScript estrito + typecheck no CI | `eslint-plugin-playwright` com *pre-commit* (husky + lint-staged) |
