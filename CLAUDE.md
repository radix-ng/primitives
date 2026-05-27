# Radix NG Primitives — Claude Guide

## Project overview

Angular port of Radix UI headless primitives. This is a **signals-first, headless** component library — directives carry no styles; state is exposed via `data-*` attributes for consumers to style.

- **Monorepo**: Nx 21, pnpm workspaces
- **Angular**: 20 (signals API: `input()`, `model()`, `computed()`, `signal()`, `linkedSignal()`)
- **TypeScript**: 5.9
- **Testing**: Jest + `jest-preset-angular` + `@testing-library/angular`
- **Storybook**: 9 (AnalogJS vite plugin)
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
        styles.css
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
   - `stories/<name>.stories.ts` + `stories/<name>.ts` + `stories/styles.css`
2. Register secondary entry in **`tsconfig.base.json`** under `compilerOptions.paths`:
   ```json
   "@radix-ng/primitives/<name>": ["packages/primitives/<name>/index.ts"]
   ```
3. Run `pnpm primitives:build` to verify build.

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
