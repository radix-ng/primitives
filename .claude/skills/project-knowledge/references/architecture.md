---
name: architecture
description: Tech stack, monorepo structure, key dependencies, and composition primitives for Radix NG
metadata:
  type: project
---

# Architecture

## Tech stack

| Layer                  | Choice                                                   | Why                                                           |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------- |
| Framework              | Angular 21, zoneless                                     | Modern signals API; zoneless for performance                  |
| Monorepo               | Nx 22 + pnpm workspaces                                  | Task caching, affected-graph CI, secondary entry generation   |
| Build                  | ng-packagr                                               | Angular library standard; each primitive is a secondary entry |
| Tests                  | Vitest + AnalogJS vite plugin + @testing-library/angular | Faster than Jest; AnalogJS bridges Angular and Vite           |
| Storybook              | Storybook 10 + @storybook/angular + AnalogJS             | Visual development; Chromatic for visual regression           |
| Styling (stories only) | Tailwind v4 (CSS-based config, no tailwind.config.js)    | Zero-style primitives; Tailwind only in demo/story layer      |
| Positioning            | @floating-ui/dom                                         | Precise floating element positioning (popover, tooltip, etc.) |
| Dates                  | @internationalized/date, @internationalized/number       | Locale-aware date/number primitives                           |
| Icons (stories)        | @lucide/angular                                          | Consistent icon set in demos                                  |

## Monorepo layout

```
packages/
  primitives/          ← published library (@radix-ng/primitives)
    <name>/
      index.ts         ← barrel exports + optional NgModule
      ng-package.json  ← secondary entry: {"lib":{"entryFile":"index.ts"}}
      src/             ← directive implementations
      __tests__/       ← Vitest specs
      stories/         ← Storybook stories + demo components
    storybook/         ← shared story utilities (styles.ts, tailwind-demo.ts, etc.)
    schematics/        ← ng-add schematic
apps/
  radix-storybook/     ← Storybook app (port 4400)
  radix-docs/          ← documentation site (Astro)
  radix-ssr-testing/   ← SSR smoke-test app
packages/
  components/          ← styled components consuming primitives (not part of published lib)
tools/scripts/         ← build helpers (typedoc, api-docs)
```

## Shared building blocks (composition primitives in `packages/primitives/`)

These are the headless infrastructure layers that complex primitives compose:

- **`core`** — `createContext`, `useArrowNavigation`, id generators, shared types (`DataOrientation`, `AcceptableValue`, `isNullish`)
- **`collection`** — `RdxCollectionProvider` + `RdxCollectionItem`: collects child items in DOM order via `contentChildren`; only used by `select` currently
- **`portal`** — `RdxPortal`: teleports host element into a container (default `document.body`)
- **`presence`** — conditional mount/unmount with enter/leave animation hooks (waits for `animationend`, not `transitionend`)
- **`roving-focus`** — focus roving for keyboard list navigation
- **`focus-scope`** — focus trap for dialogs and modals
- **`focus-guards`** — sentinel elements for focus containment
- **`popper`** — floating-ui wrapper for positioned overlays
- **`dismissable-layer`** — outside-dismiss via Escape / pointer-down-outside / focus-outside. Focus-outside check is async (two microtasks); register external triggers as branches via `rdxDismissableLayerBranch` to prevent premature dismissal

## DI context pattern

Every primitive family exposes state via `createContext` from `@radix-ng/primitives/core`. The root directive provides context; children inject it. Optionality: `injectFooContext()` throws if absent; `injectFooContext(true)` returns null.

## Key architectural decisions

- **`hostDirectives` composition** — primitives reuse each other (e.g., AccordionItem composes CollapsibleRoot) without inheritance
- **Checkbox group co-location** — `RdxCheckboxGroupDirective` lives in the same ng-packagr entry as `RdxCheckboxRootDirective` to avoid circular cross-entry imports
- **`data-*` state only** — inline styles are never used for state; CSS custom properties are the only exception (for animation dimensions)
- **`undefined` removes attributes** — `host` bindings use `undefined` (not `null` or `false`) to remove attributes
- **`defaultValue` via `effect()`** — uncontrolled initialization is done in `constructor()` with an `effect()`

## External peer dependencies (installed by ng-add)

`@angular/common` (matched to app version), `@angular/cdk`, `@floating-ui/dom`, `@internationalized/date`, `@internationalized/number`

## @angular/cdk — migration direction

**Goal: remove `@angular/cdk` as a peer dependency entirely.** New code must not add new CDK imports.

Current state of CDK usage — what still needs to be replaced:

| CDK import                                                              | Used for                  | Where                                                      |
| ----------------------------------------------------------------------- | ------------------------- | ---------------------------------------------------------- |
| `_IdGenerator` (`cdk/a11y`)                                             | Unique ID generation      | accordion, tooltip, popover, switch, preview-card, popover |
| `FocusKeyManager` (`cdk/a11y`)                                          | Keyboard focus management | navigation-menu                                            |
| `CdkTrapFocus` (`cdk/a11y`)                                             | Focus trap directive      | alert-dialog                                               |
| `LiveAnnouncer` (`cdk/a11y`)                                            | ARIA live region          | stepper                                                    |
| `Platform` (`cdk/platform`)                                             | SSR/browser detection     | `core/is-client`                                           |
| `Dialog`, `DialogModule`, `DialogRef`, `DIALOG_DATA` (`cdk/dialog`)     | Full dialog service       | dialog primitive                                           |
| `Overlay`, `OverlayRef`, `TemplatePortal` (`cdk/overlay`, `cdk/portal`) | Overlay mechanism         | alert-dialog                                               |

Type-only imports that are low-priority (zero runtime cost, but ideally replaced with own types):

- `BooleanInput`, `NumberInput` (`cdk/coercion`) — used as TypeScript type parameters in 67 files
- `Direction` (`cdk/bidi`) — type alias for `'ltr' | 'rtl'`; can be replaced with a local type in `core`
- `FocusableOption` (`cdk/a11y`) — TypeScript interface in navigation-menu

## tsconfig paths

Each new primitive must be registered in root `tsconfig.base.json` under `compilerOptions.paths` as `"@radix-ng/primitives/<name>": ["packages/primitives/<name>/index.ts"]`.
