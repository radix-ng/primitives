---
name: patterns
description: Project-specific coding conventions, naming, git workflow, testing, and story patterns for Radix NG
metadata:
  type: project
---

# Patterns

## Naming conventions

| Thing             | Pattern                                        | Example                      |
| ----------------- | ---------------------------------------------- | ---------------------------- |
| Directive class   | `Rdx<Name><Role>Directive`                     | `RdxAccordionItemDirective`  |
| Newer component   | `Rdx<Name><Role>`                              | `RdxSelectRoot`              |
| Selector          | `[rdx<Name><Role>]`                            | `[rdxAccordionItem]`         |
| `exportAs`        | `rdx<Name><Role>`                              | `rdxAccordionItem`           |
| Context type      | `<Name>RootContext`                            | `AccordionRootContext`       |
| Context injectors | `inject<Name>Context` / `provide<Name>Context` | `injectAccordionRootContext` |
| NgModule          | `Rdx<Name>Module`                              | `RdxAccordionModule`         |

## Adding a new primitive — checklist

1. Create `packages/primitives/<name>/` with `ng-package.json`, `src/`, `index.ts`, `__tests__/`, `stories/`
2. Register path in `tsconfig.base.json` under `compilerOptions.paths`
3. If new runtime package needed: add to `packages/primitives/package.json` peerDeps + `schematics/ng-add/index.ts`
4. Run `pnpm primitives:build` to verify the build

## Headless state — `data-*` attributes

All state is exposed via `host` bindings using `data-*` attributes. Never use inline styles for state. Use CSS custom properties only for animation dimensions (e.g., collapsible height). Use `undefined` (not `null`/`false`) to remove an attribute.

## Inputs and outputs

- Two-way binding: `model<T>()` for controlled values; `input<T>()` for `defaultValue`
- Initialize `defaultValue` in `constructor()` with `effect()`
- Boolean inputs: `input<boolean, BooleanInput>(false, { transform: booleanAttribute })`
- Outputs: `output<T>()` — name with `on` prefix (`onValueChange`)

## Lifecycle — prefer signals over `ngOn*` hooks

Signals-first: **avoid `OnInit` / `OnChanges` / `OnDestroy`** in primitive source
(`packages/primitives/*/src/**`). An ESLint `no-restricted-syntax` rule (scoped to that path,
severity `warn`) flags `ngOnInit` / `ngOnChanges` / `ngOnDestroy`. Replace by intent — this is **not**
a blanket "move it to the constructor":

| Need                                                                          | Replacement                                                                                       |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| DI / host-element work (store or register `inject(ElementRef).nativeElement`) | the **`constructor`** — the host element already exists there; `input()` values do not yet        |
| Logic reading `input()` values (and reacting to changes)                      | **`effect()` / `computed()` / `linkedSignal()`** — covers both `ngOnInit` reads and `ngOnChanges` |
| Rendered DOM / view-or-content children / measurements                        | **`afterNextRender()` / `afterRenderEffect()`**, signal `viewChild()` / `contentChild()`          |
| Cleanup                                                                       | **`inject(DestroyRef).onDestroy(() => …)`** instead of `ngOnDestroy`                              |

Rationale: a directive's host element is created **before** its constructor runs, so
`ElementRef.nativeElement` is valid there; `ngOnInit` differs only in that bound `input()` values are
set by then. So `ngOnInit` is wrong both when you read no inputs (use the constructor) and when you do
(use `effect()`, since the input can change later). `number-field` registers its input/cursor elements in
the constructor and cleans up via `DestroyRef` — no lifecycle interfaces.

**Out of scope of the rule:** `AfterViewInit` (needs `afterNextRender()` / `afterRenderEffect()`, migrate
case by case — ~12 existing usages), and story/demo + test files (reactive-forms demos may build a
`FormGroup` in `ngOnInit`). Existing `ngOnInit`/`ngOnDestroy` in primitive source surface as warnings to
migrate over time; flip the rule to `error` once they are cleared.

## Zoneless — no `NgZone`

The library is signals-first and **zoneless** — the Storybook app, the SSR-testing app, and the Vitest test suite all run with `provideZonelessChangeDetection` (zone.js is no longer loaded in any of those runtimes). Do **not** use `NgZone`, `runOutsideAngular`, or `zone.run` — change detection is scheduled by the signal scheduler when a signal changes, not by the zone, so the zone wrappers are unnecessary noise. The `zone.js` package is still a dependency, kept only for the deprecated `radix-docs` app.

- Attach DOM event listeners directly; update signals directly inside the handlers. The scheduler reacts to the signal write.
- This holds even for high-frequency events. `dismissable-layer` attaches its global pointer/key listeners with no `NgZone`; the drawer gesture engine (`usePointerDrag` / `useDrawerSwipe`) does the same.
- Guard browser-only work for SSR with `isPlatformBrowser` / `afterNextRender` (not the zone) — see the drawer gesture helpers and `presence`.

## Composition via `hostDirectives`

Prefer `hostDirectives` over inheritance to reuse primitives. Map inputs/outputs explicitly in the decorator. This is the preferred reuse pattern throughout the library.

## Context pattern

Every primitive family uses `createContext` from `@radix-ng/primitives/core`. Root directive provides context; children inject it. Pattern:

- `injectFooContext()` — throws if absent (required child)
- `injectFooContext(true)` — returns null if absent (optional composition)

## Testing

- **Framework:** Vitest + AnalogJS angular plugin + `@testing-library/angular`
- **Globals:** use `vi.fn`, `vi.spyOn`, `vi.mock` (not Jest globals)
- **Setup:** `packages/primitives/test-setup.ts` — sets `provideZonelessChangeDetection`, initializes the Angular testing env, `@testing-library/jest-dom/vitest`, `jest-axe`. It does **not** import AnalogJS's `setup-vitest` (that harness hard-loads zone.js), so the suite is zone-free.
- **Run all tests:** `pnpm primitives:test`
- **Run single file:** `nx run primitives:test --testFile packages/primitives/<name>/__tests__/<file>.spec.ts`
- `xdescribe` / `xit` are mapped to `describe.skip` / `it.skip` — used for legacy skipped suites
- **Zoneless test conventions** (the suite runs zone-free):
  - `fakeAsync` / `tick` / `waitForAsync` are unavailable. Use `vi.useFakeTimers()` + `vi.advanceTimersByTime()` for `setTimeout`-based delays, `await fixture.whenStable()` for render/effects, and a macrotask (`await new Promise(r => setTimeout(r))`) to drain a chained microtask queue.
  - Mutating a **plain (non-signal) field** on a fixture component and then calling `fixture.detectChanges()` throws `NG0100` — the plain write doesn't dirty the view. Call `fixture.changeDetectorRef.markForCheck()` first. Signal writes (`input.set`, `model.set`, `linkedSignal.set`, `componentRef.setInput`) don't need it.

## Storybook stories

- **Story file:** `stories/<name>.stories.ts` (CSF format)
- **Demo components:** one component per file (`stories/<name>-<variant>.ts`) — required for `?raw` source imports
- **No local CSS** — only Tailwind v4 utilities in templates; never `styleUrl`, `styles`, or `<style>` blocks
- **Shared demo styles:** `packages/primitives/storybook/styles.ts` — use `cn`, `demoButton`, `demoCard`, `demoInput`, `demoFocusRing`; never inline long class strings
- **Wrapper:** `tailwindDemoDecorator()` — wraps every story in the centered demo frame with `data-demo="tailwind"`
- **Semantic tokens first:** `bg-background`, `text-foreground`, `bg-muted`, `bg-popover`, `border-border`, etc. — avoid raw palette colors
- **`?raw` source import:** wired via `rawTsPlugin` in `.storybook/main.ts`; types in `packages/primitives/storybook/raw.d.ts`
- **"Show code" pattern:** `const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });` — use with `parameters: source(rawImport)` on each story
- **Story order:** Default → state variants (Disabled, Readonly) → form integration (ReactiveForms, TemplateDrivenForms, Validation) → advanced

## Docs MDX template (`stories/<name>.docs.mdx`)

Section order: `# Name` + one-line summary → hero Canvas → `## Features` (✅ bullets) → `## Import` → `## Anatomy` → `## Examples` (each with `### Title` + description + Canvas) → `## API Reference` (ArgTypes per part)

## Accessibility requirements

- WAI-ARIA roles and `aria-*` in `host` bindings
- Every visible `<label>` must be programmatically connected to its control: `for`/`id` native, `htmlFor` on `RdxLabelDirective`, or `rdxFieldLabel` inside `rdxFieldRoot`
- Keyboard nav: `arrowDown`, `arrowUp`, `home`, `end`, `enter`, `space` via `(keydown.*)` host listeners
- Use `useArrowNavigation` from `core` for list navigation
- Support `dir` input (`'ltr' | 'rtl'`)

## Git workflow

- Branch from `main`; PR back to `main`
- CI gate (must pass before merge): lint (prettier + stylelint + eslint), unit tests, library build, schematics build
- Chromatic runs on push to `main` for visual regression
- Release: `nx release` managed via Nx release tooling; `release:primitives` for library-only release

## Linting — zero-warning policy (two gotchas)

ESLint runs with `--max-warnings=0` in **both** places: CI (`.github/workflows/ci.yml` → `pnpm run eslint --max-warnings=0`) and the pre-commit hook (lint-staged: `'*.{js,cjs,mjs,ts,html}': 'eslint --max-warnings=0 --fix'`). So in this repo a `warn` is effectively an `error`. Two consequences when changing lint config or doing cleanups:

1. **Never add a `warn`-level rule that already has violations.** With `--max-warnings=0` it blocks every commit and CI immediately. A regression-guard rule (e.g. `@typescript-eslint/no-non-null-assertion`) is only viable if you first drive violations to **zero**, then set it to `error`. Many primitives keep load-bearing `!` (DOM measurements, `map.get()`, indexed access in positioning math like `select-item-aligned-position`, `core/composables/use-grace-area`) that can't be removed without real narrowing refactors — so such a rule is currently not worth adding.
2. **Never run `eslint --fix` with a partial/custom config.** ESLint 10 defaults `linterOptions.reportUnusedDisableDirectives` to warn, and `--fix` **auto-removes** any `eslint-disable` directive whose rule isn't defined in the active config. A one-off config that enables a single rule will silently strip legitimate `eslint-disable` comments for every other rule (e.g. `no-useless-assignment`, `no-unused-vars`, `ban-ts-comment`), re-exposing suppressed errors elsewhere. For a targeted rule sweep, run it **check-only** (no `--fix`) and apply edits by hand, or use the repo's full config via `pnpm eslint:fix`.

Always verify a cleanup with `pnpm run eslint --max-warnings=0` (the exact CI command) before suggesting a commit.

## Reference primitive

**`packages/primitives/button/`** — use as reference when creating stories and docs; shows correct Tailwind styling, `demoButton` usage, and docs MDX structure.
