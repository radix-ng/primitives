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

## Composition via `hostDirectives`

Prefer `hostDirectives` over inheritance to reuse primitives. Map inputs/outputs explicitly in the decorator. This is the preferred reuse pattern throughout the library.

## Context pattern

Every primitive family uses `createContext` from `@radix-ng/primitives/core`. Root directive provides context; children inject it. Pattern:

- `injectFooContext()` — throws if absent (required child)
- `injectFooContext(true)` — returns null if absent (optional composition)

## Testing

- **Framework:** Vitest + AnalogJS angular plugin + `@testing-library/angular`
- **Globals:** use `vi.fn`, `vi.spyOn`, `vi.mock` (not Jest globals)
- **Setup:** `packages/primitives/test-setup.ts` — initializes Angular testing env, `@testing-library/jest-dom/vitest`, `jest-axe`
- **Run all tests:** `pnpm primitives:test`
- **Run single file:** `nx run primitives:test --testFile packages/primitives/<name>/__tests__/<file>.spec.ts`
- `xdescribe` / `xit` are mapped to `describe.skip` / `it.skip` — used for legacy skipped suites

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

## Reference primitive

**`packages/primitives/button/`** — use as reference when creating stories and docs; shows correct Tailwind styling, `demoButton` usage, and docs MDX structure.
