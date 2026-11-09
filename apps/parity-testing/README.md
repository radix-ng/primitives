# Primitive behavioral comparisons

The same Playwright actions run against Angular primitives and unmodified, pinned Base UI React
sources. These are regression checks with reviewed differences, not full parity certification.
[Select](primitives/select/README.md) is the first suite.

## Structure

```text
parity-testing/
  shared/                    # reference preparation, comparison, reporter, suite discovery and tests
  primitives/
    select/
      suite.json             # title and preview port
      tsconfig.json          # Angular fixture's AOT entry points
      angular.html
      react.html
      src/                   # framework fixtures and this primitive's recording contract
      tests/                 # driver, scenarios and Playwright spec
      expected-differences.json
      README.md              # coverage, decisions and differences for this primitive
  reference.json             # one Base UI pin for all suites
  run.ts                     # discover suites, type-check/build fixtures, run Playwright
  tsconfig.base.json         # shared Angular compiler settings
  tsconfig.tools.json        # strict Node tooling type check
  vite.config.mts
  playwright.config.ts
```

Drivers, DOM snapshots, recording contracts and scenario lists stay with their primitive. Shared
infrastructure handles reference integrity, exact difference matching, builds and reporting. Extract
behavior shared by concrete suites as it appears; there is no universal control driver.

## Run

Use Node.js 24 (`nvm use`) and install workspace dependencies, then:

```bash
pnpm exec playwright install chromium firefox webkit
pnpm test-parity                 # every discovered suite
pnpm test-parity select          # one primitive
pnpm test-parity:select          # convenience alias
pnpm test-parity select --project=webkit # one engine
pnpm parity:build select         # type-check/build one suite without running browsers
pnpm parity:build                # type-check/build every suite
pnpm parity:typecheck            # Node tooling types only
```

The runner and shared tooling are TypeScript executed directly by Node 24 (`node apps/parity-testing/run.ts select`).
[Node's type stripping](https://nodejs.org/docs/latest-v24.x/api/typescript.html#type-stripping) does
not check types; the pnpm commands run a separate strict `tsc` check. Node-side imports include `.ts`
extensions and use `import type` for types. `tsconfig.tools.json` enforces `erasableSyntaxOnly` and
`verbatimModuleSyntax`. Angular/React browser fixtures use the Angular compiler and Vite.

Every scenario runs in Chromium, Firefox and WebKit by default. The engine projects live in
`tools/playwright/browser-projects.mts`, also used by the Select Storybook behavior checks
(`pnpm test-browser:select`). The screenshot configuration keeps its existing Chromium baselines.

On macOS, Firefox's app-data bookkeeping is isolated under
`node_modules/.cache/radix-ng-parity/firefox-app-data` via its child-process `CFFIXED_USER_HOME`.
Its temporary profile alone still reads the installed Firefox's app-data directory, which can stall
startup on macOS 27 ([upstream issue](https://github.com/microsoft/playwright/issues/42768)). This
isolation changes neither the host environment nor the installed browser profile. Linux CI uses
Playwright's ordinary launch environment.

The first run fetches the commit in `reference.json` into a bare cache. To prepare without fetching,
use a local repository containing that object:

```bash
BASE_UI_SOURCE=/path/to/base-ui pnpm parity:prepare
pnpm test-parity select
```

Preparation archives committed git objects, ignoring dirty working files and leaving the checkout
untouched. The archive is reused offline from `node_modules/.cache/radix-ng-parity`; each run checks
its SHA-256 content digest. To update the reference, edit `reference.json`, prepare again and review
each suite's observations and exceptions. There is no automatic acceptance command.

## Add a primitive

1. Add `primitives/<name>/suite.json` with a human-readable `title` and an unused preview `port`.
2. Add `angular.html`, `react.html` and the framework fixtures. Keep real state/lifecycle ownership
   inside each primitive; recording adapters must not synchronize implementations.
3. Add `tsconfig.json` extending `../../tsconfig.base.json` and listing the Angular fixture entries.
4. Add the primitive's driver, scenarios and spec under `tests/`, plus its reviewed
   `expected-differences.json` and coverage/difference notes in `README.md`.
5. Run `pnpm test-parity <name>`. The all-suite command and CI discover the folder automatically.

Each fixture serves at `/angular.html` or `/react.html` on its suite's port. For manual preview, set
`PARITY_PRIMITIVE=<name>` when running Vite with the root config. See the Select guide for an example.
No changes to the shared runner, Vite config or Playwright config are needed to add a suite.

## Evidence and CI

`dist/parity-testing/<name>/fixtures/` contains each build and its reference manifest;
`dist/parity-testing/<name>/results/` contains observations, a Markdown summary, an HTML report and
failure traces. Reports retain all observed differences, including the reviewed ones. Each row is
identified by browser and scenario; observations also record the engine version and host platform.

The `parity` CI job runs all discovered suites on Node 24 and Chromium/Firefox/WebKit on Ubuntu 24.04.
It also builds Storybook and runs Select behavior checks in the same three engines, including native
submission/validation, synthetic autofill, labels, focus, retained exits and positioning. It publishes
per-primitive summaries and uploads differential results and Storybook reports/traces. New, changed and disappeared differences require
review; a passing check means there is no unreviewed drift.
