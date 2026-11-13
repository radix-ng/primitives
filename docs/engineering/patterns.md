# Runtime patterns

Common invariants and verification scope live in [AGENTS.md](../../AGENTS.md). This guide records implementation conventions needed when editing primitives.

## Naming and entry points

New families use `Rdx<Name><Role>` and `<name>-<role>.ts`; retain an existing family's `Directive` naming when extending it. Selectors and `exportAs` use `rdx<Name><Role>`. Contexts are explicit exported `Rdx<Name>RootContext` interfaces, with `inject<Name>RootContext` / `provide<Name>RootContext` helpers. Export public parts and types from the secondary barrel.

For a new family use [radix-primitive](../../.agents/skills/radix-primitive/SKILL.md), which covers the entry, tsconfig path, peer dependencies, schematic, stories and checks.

## Imports and story boundaries

ESLint restricts private package paths and cross-entry `src` imports in library/application code; use public secondary entry points. Local implementation helpers remain relative imports. Unit specs may intentionally inspect internals. Story/recipe components use shared demo styles; ESLint rejects component styles, inline `<style>` blocks and static style attributes. Computed layout bindings remain available for positioning and virtualization. These rules run in the existing ESLint checks locally and in CI.

## State and reactivity

Match each Base UI part's documented boolean attributes (`data-open`, `data-closed`, `data-popup-open`, `data-checked`, etc.); do not substitute a generic `data-state` enum. `data-instant` remains a string where the contract uses one. `data-starting-style` / `data-ending-style` are transient transition status, not permanent mirrors of open state. Remove absent attributes with `undefined`.

Use `input`, `model` and `output`; boolean inputs use Angular's `booleanAttribute` with the core `BooleanInput` type. Existing families initialize a defined `defaultValue` from an effect. Preserve the family's controlled/default semantics and verify behavior rather than mechanically forcing every root into one state template. Derive state with `computed` / `linkedSignal`; avoid unnecessary mirrors.

## Lifecycle and zoneless execution

| Need                                   | API                                                        |
| -------------------------------------- | ---------------------------------------------------------- |
| DI and host-element setup              | Constructor; the host exists, bound inputs are not yet set |
| Input-driven reactions                 | `effect`, `computed`, `linkedSignal`                       |
| Rendered DOM, children or measurements | `afterNextRender`, `afterRenderEffect`, signal queries     |
| Cleanup                                | `inject(DestroyRef).onDestroy(...)`                        |

ESLint restricts `ngOnInit` / `ngOnChanges` / `ngOnDestroy` in primitive `src/**`. Render-hook migration is case-specific; story and test code have different lifecycle needs. The demos, SSR app and unit suite run zoneless. Attach DOM listeners directly and update signals; use platform/render guards for browser work rather than `NgZone` wrappers.

Menu's final accepted-close notification during a closed ancestor's disposal uses `ngOnDestroy`
before Angular removes output subscriptions. Cleanup still uses DestroyRef. This narrow exception
has a local ESLint justification and lifecycle guards; see [ADR 0065](../adr/0065-menu-popover-composition.md).

## Context and composition

Use `createContext<RdxFooRootContext>('FooRootContext', 'components/foo')` with the docs path (`components/<name>` or `utils/<name>`). Required injectors already throw and return a non-nullable type; no trailing `!` is needed. The optional `injectFooContext(true)` returns null.

Define context signal members explicitly instead of `ReturnType<typeof factory>`; keep callbacks typed. Compose existing primitives with `hostDirectives`, except the documented thin-positioner subclassing pattern. See [composition](composition.md) for projected children, providers and floating ownership.

## Accessibility

Preserve native host semantics and connect visible labels to controls. Scope ARIA to the actual pattern: tooltip/preview-card are supplementary content, not disclosure widgets; native attributes carry required/disabled state for native controls. Describe standards-backed behavior precisely and verify it with appropriate [tests](../../.agents/skills/radix-testing/SKILL.md).

## Dev-mode diagnostics (ADR 0013)

One shared helper in `core` — `core/src/dev/diagnostics.ts` — is the single mechanism for runtime
dev-mode misuse feedback. **New checks go through it, not a new ad-hoc `console.warn`/`throw`.**

- `rdxDevWarning(code, message, docsPath?)` — deduplicated `console.warn` for a recoverable mistake;
  no-op outside `isDevMode()`. `rdxDevError(code, message, docsPath?)` — throws for markup that can't
  work (e.g. the structural portal guards). Codes are stable `<primitive>/<slug>` strings (e.g.
  `field/unassociated-label`); messages are prefixed `[rdx:<code>]` and get a `See <docsUrl>` hint.
  `resetRdxDevWarnings()` is test-only (clears the per-code dedup set).
- `rdxCheckTriggerElement(name, code, docsPath)` / `rdxCheckLabelElement(name, code, docsPath)` —
  `HOST_TAG_NAME`-based host-element checks; call them in the part's **constructor**. Only needed where
  the **selector** can't already enforce the host (`button[rdxSelectTrigger]`, `label[rdxLabel]` need
  no runtime check) and the directive doesn't adapt its own ARIA (e.g. `rdxMenuTrigger` auto-applies
  `role`/`tabindex`). Don't add a trigger check to parts that can legitimately be a focusable composite
  (e.g. a tooltip trigger on a slider thumb) — it would false-positive.
- **`debugName` convention.** Root state signals/computeds and long-lived `effect`s get
  `debugName: 'Rdx<Name>Root.<signal>'` so Angular DevTools shows named nodes instead of anonymous
  ones. `model()` / `input()` don't accept `debugName` (skip them). Applied to shared machinery
  (`PresenceMachine`) and `RdxPopoverRoot` as the worked example; roll it into other roots as they're
  touched.

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
