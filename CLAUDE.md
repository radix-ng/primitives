# Radix NG Primitives — Claude Guide

## Project overview

Angular port of headless UI primitives. This is a **signals-first, headless** component library — directives carry no styles; state is exposed via `data-*` attributes for consumers to style.

**Reference priority:** [Base UI](https://base-ui.com/) is the primary reference we align to — match its component APIs, naming, and behavior when designing or updating primitives. [Radix UI](https://www.radix-ui.com/) was the original foundation of this library and remains a valid secondary reference to consult, especially for patterns Base UI doesn't cover.

- **Monorepo**: Nx 22, pnpm workspaces
- **Angular**: 21 (signals API: `input()`, `model()`, `computed()`, `signal()`, `linkedSignal()`)
- **TypeScript**: 5.9
- **Testing**: Jest + `jest-preset-angular` + `@testing-library/angular`
- **Storybook**: 10 (`@storybook/angular` + AnalogJS vite plugin)
- **Styling in stories**: Tailwind v4 (see "Stories & Storybook")
- **Prefix**: `rdx` (selectors and `exportAs`)
- **Class prefix**: `Rdx`

## Monorepo structure

```
packages/
  primitives/          ← main Angular library (ng-packagr secondary entries)
    <name>/
      index.ts         ← barrel exports + optional NgModule
      ng-package.json  ← secondary entry point {"lib":{"entryFile":"index.ts"}}
      src/
        <name>-root.directive.ts
        <name>-<role>.directive.ts   (or .ts without "directive" suffix for newer style)
      __tests__/
        <name>-root.directive.spec.ts
      stories/
        <name>.stories.ts
        <name>.ts                    ← standalone story components
  components/          ← styled components that consume primitives
apps/
  radix-storybook/     ← Storybook app for primitives
  radix-docs/          ← documentation site
tools/
  scripts/             ← build helpers
```

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
| Spec file         | `<name>-<role>.directive.spec.ts`              |                              |
| Stories file      | `<name>.stories.ts`                            |                              |

## Context pattern (dependency injection)

Every primitive family uses `createContext` from `@radix-ng/primitives/core`:

```ts
import { createContext } from '@radix-ng/primitives/core';

export type RdxFooRootContext = { ... };

export const [injectFooRootContext, provideFooRootContext] =
    createContext<RdxFooRootContext>('FooRootContext');

const rootContext = (): RdxFooRootContext => {
    const instance = inject(RdxFooRootDirective);
    return { ... };
};

@Directive({
    providers: [provideFooRootContext(rootContext)],
})
export class RdxFooRootDirective { ... }
```

Child directives inject with `injectFooRootContext()` (throws) or `injectFooRootContext(true)` (returns null if absent).

## Headless state — data attributes

Expose state via `host` bindings, never inline styles (except CSS custom properties for animation dimensions):

```ts
host: {
    '[attr.data-state]': 'open() ? "open" : "closed"',
    '[attr.data-disabled]': 'disabled() ? "" : undefined',
    '[attr.data-orientation]': 'orientation()',
}
```

Use `undefined` (not `null` or `false`) to remove an attribute.

## Inputs / Outputs — signals API

```ts
// Controlled / uncontrolled value
readonly value = model<string>();
readonly defaultValue = input<string>();

// Boolean coercion
readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

// Output
readonly onValueChange = output<string>();
```

Set `defaultValue` inside `constructor()` with `effect()`:

```ts
constructor() {
    effect(() => {
        if (this.defaultValue() !== undefined) {
            this.value.set(this.defaultValue());
        }
    });
}
```

## hostDirectives composition

Prefer `hostDirectives` to re-use existing primitives (e.g., Accordion Item composes CollapsibleRoot):

```ts
@Directive({
    hostDirectives: [{
        directive: RdxCollapsibleRootDirective,
        inputs: ['disabled: disabled', 'open: open'],
    }]
})
```

## Adding a new primitive checklist

1. Create `packages/primitives/<name>/` with:
   - `ng-package.json` → `{"lib":{"entryFile":"index.ts"}}`
   - `src/<name>-root.directive.ts` — root context + directive
   - `src/<name>-<role>.directive.ts` — each child part
   - `index.ts` — re-exports + optional NgModule
   - `__tests__/<name>-*.spec.ts`
   - `stories/<name>.stories.ts` + optional `stories/<name>.ts`
2. Register secondary entry in **`tsconfig.base.json`** under `compilerOptions.paths`:
   ```json
   "@radix-ng/primitives/<name>": ["packages/primitives/<name>/index.ts"]
   ```
3. Run `pnpm primitives:build` to verify build.

## Stories & Storybook

- Dev server: `pnpm storybook:primitives` (runs on `http://localhost:4400`). Full compile check: `nx run radix-storybook:build-storybook` (add `--skip-nx-cache` to force a real rebuild — Nx caches this target).
- **Use Tailwind v4 utilities directly in story templates and standalone story components.** Do not add story-local CSS files, Angular `styleUrl` / `styleUrls` / `styles`, inline `<style>` blocks, or `style="..."` attributes. If a demo cannot reasonably be expressed with Tailwind utilities, document the reason and ask before adding CSS.
- Use semantic tokens first: `bg-background`, `text-foreground`, `bg-muted`, `bg-popover`, `border-border`, `text-popover-foreground`, `text-primary-foreground`. Avoid reintroducing raw Radix theme colors such as `violet`, `mauve`, `black-a*`, or hard-coded `white`/`black` when a semantic token exists.
- Story shells should use the shared wrapper from `packages/primitives/storybook/tailwind-demo.ts`. It applies the standard centered demo frame and marks the root with `data-demo="tailwind"` so Tailwind preflight and theme variables stay active.
- If a story needs the reset/theme variables, keep `data-demo="tailwind"` on the outermost demo container. If it does not, leave the wrapper alone and only use utilities that do not depend on the reset.
- Storybook Tailwind config is CSS-based at `apps/radix-storybook/.storybook/tailwind.css` (`@import 'tailwindcss/...'` + a `@theme {}` block); there is **no** `tailwind.config.js`.
- Files: `stories/<name>.stories.ts` (CSF) + optional `stories/<name>.ts` (standalone story components) + optional `stories/<name>.docs.mdx`. In the mdx, `<Meta title="…">` matching the CSF `title` attaches it as that group's docs page; use `<Canvas of={Stories.X} />` to embed a story and `<ArgTypes of={Directive} />` for the props table.
- Storybook theme switching is controlled from the toolbar, not OS color scheme. The preview decorator sets `document.documentElement[data-theme]`, so stories should use tokens that respond to that attribute instead of reading `prefers-color-scheme`.

## Shared composition primitives

Complex components compose these headless building blocks — good entry points when tracing behavior:

- `core` — `createContext`, `useArrowNavigation`, id generators, shared types/utils.
- `collection` — `RdxCollectionProvider` + `RdxCollectionItem`: collects item directives in **DOM order** via `contentChildren` (matches `hostDirectives` too). Read items off the instance (`item.element`, `item.value()`, `item.disabled()`); `useCollection()` = `inject(RdxCollectionProvider)`. Only consumer: `select2`.
- `portal` — `RdxPortal`: teleports its host element into a container (default `document.body`), reactively; non-element containers fall back to body.
- `presence` — conditional mount/unmount with enter/leave animation support.
- `roving-focus`, `focus-scope`, `dismissable-layer`, `popper` — focus roving, focus trapping, outside-dismiss, positioning.

## Useful commands

```bash
pnpm primitives:test              # run Jest tests
pnpm primitives:build             # build the library
pnpm storybook:primitives         # start Storybook dev server
pnpm eslint:fix                   # lint + fix
pnpm prettier:fix                 # format
nx run primitives:test --testFile packages/primitives/<name>/__tests__/<file>.spec.ts
```

## Accessibility

- Follow WAI-ARIA authoring practices for the component pattern.
- Use `role`, `aria-*` attributes in `host` bindings.
- Support keyboard navigation (`arrowDown`, `arrowUp`, `home`, `end`, `enter`, `space`) via `(keydown.*)` host listeners.
- Use `useArrowNavigation` from `@radix-ng/primitives/core` for list navigation.
- Support `dir` input (`'ltr' | 'rtl'`) for bidirectional text.

## Key utilities from `@radix-ng/primitives/core`

- `createContext<T>(description)` — DI context factory
- `useArrowNavigation(event, current, container, opts)` — keyboard list nav
- `DataOrientation` — `'horizontal' | 'vertical'`
- `AcceptableValue` — `string | Record<string, any> | null`
- `isNullish(v)` — null/undefined check
