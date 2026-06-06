# Radix NG Primitives — Claude Guide

## Project knowledge

Detailed documentation lives in `.claude/skills/project-knowledge/references/`:

- **`project.md`** — what the library is, audience, available primitives
- **`architecture.md`** — tech stack, monorepo layout, composition primitives, DI context, CDK migration
- **`patterns.md`** — naming, new primitive checklist, signals conventions, testing, story patterns
- **`deployment.md`** — CI/CD, release process, Storybook/docs builds
- **`ux-guidelines.md`** — demo styling system, semantic tokens, animation patterns

Read the relevant file before starting any non-trivial task. The sections below in this file are a quick-reference summary; the `references/` files are the authoritative source.

## Project overview

Angular port of headless UI primitives. This is a **signals-first, headless** component library — directives carry no styles; state is exposed via `data-*` attributes for consumers to style.

**Reference priority:** [Base UI](https://base-ui.com/) is the primary reference we align to — match its component APIs, naming, and behavior when designing or updating primitives. [Radix UI](https://www.radix-ui.com/) was the original foundation of this library and remains a valid secondary reference to consult, especially for patterns Base UI doesn't cover.

- **Monorepo**: Nx 22, pnpm workspaces
- **Angular**: 21 (signals API: `input()`, `model()`, `computed()`, `signal()`, `linkedSignal()`)
- **TypeScript**: 5.9
- **Testing**: Vitest + AnalogJS Angular Vite plugin + `@testing-library/angular`
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

## Lifecycle — prefer signals over `ngOn*` hooks

This is a signals-first library: **avoid `OnInit` / `OnChanges` / `OnDestroy`** in primitive source
(`packages/primitives/*/src/**`). An ESLint rule warns on `ngOnInit` / `ngOnChanges` / `ngOnDestroy`
there. Note this is **not** "always move it to the constructor" — pick the replacement by what the code
actually needs:

| Need                                                                         | Use instead of a lifecycle hook                                                                     |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| DI and host-element work (store/register `inject(ElementRef).nativeElement`) | the **`constructor`** — the host element already exists there; `input()` values do **not** yet      |
| Logic that depends on `input()` values (and reacts to changes)               | **`effect()` / `computed()` / `linkedSignal()`** (replaces both `ngOnInit` reads and `ngOnChanges`) |
| Rendered DOM / view or content children / measurements                       | **`afterNextRender()` / `afterRenderEffect()`**, signal `viewChild()` / `contentChild()`            |
| Cleanup                                                                      | **`inject(DestroyRef).onDestroy(() => …)`**                                                         |

Key fact behind the constructor row: the directive's host element is created **before** its constructor
runs, so `ElementRef.nativeElement` is a valid reference there. `ngOnInit` differs only in that bound
`input()` values are set by then — so it's the wrong tool when you read no inputs (use the constructor),
and also the wrong tool when you do (use `effect()`, since the input can change later).

`AfterViewInit` is intentionally **not** covered by the lint rule: replacing it needs `afterNextRender()` /
`afterRenderEffect()`, not `effect()`, and must be migrated case by case. Story/demo and test files are
exempt (reactive-forms demos may legitimately build a `FormGroup` in `ngOnInit`).

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
3. If production code imports a new external runtime package, add it to `packages/primitives/package.json` `peerDependencies`, keep the matching dev dependency for local builds, and update `packages/primitives/schematics/ng-add/index.ts` so `ng add @radix-ng/primitives` installs it.
4. Run `pnpm primitives:build` to verify build.

## Installation & dependencies

- Consumers should install the package with `ng add @radix-ng/primitives`. In Nx Angular workspaces, document/use `npx ng add @radix-ng/primitives` from the workspace root; if the package is already installed, `nx g @radix-ng/primitives:ng-add` can run the schematic directly.
- Runtime packages imported by published primitives must be declared as peer dependencies in `packages/primitives/package.json` and installed by the `ng-add` schematic.
- Current runtime peers installed by `ng-add`: `@angular/common` (matched to the app's `@angular/core` version), `@angular/cdk`, `@floating-ui/dom`, `@internationalized/date`, and `@internationalized/number`.
- **`@angular/cdk` is being phased out.** Do not add new CDK imports. CDK Dialog/Overlay, `cdk/portal`, and `CdkTrapFocus` are already fully replaced with own implementations (so consumers no longer need `@angular/cdk/overlay-prebuilt.css`). Remaining runtime usage to replace over time: `_IdGenerator`, `LiveAnnouncer` (`cdk/a11y`) and `Platform` (`cdk/platform`). Type-only imports (`BooleanInput`, `NumberInput`, `Direction`) are low priority. See the full breakdown in `.claude/skills/project-knowledge/references/architecture.md`.
- Keep `apps/radix-storybook/docs/overview/installation.docs.mdx` in sync whenever the install command, peer dependency list, or schematic behavior changes.

## Stories & Storybook

- Dev server: `pnpm storybook:primitives` (runs on `http://localhost:4400`). Full compile check: `nx run radix-storybook:build-storybook` (add `--skip-nx-cache` to force a real rebuild — Nx caches this target).
- **Use Tailwind v4 utilities directly in story templates and standalone story components.** Do not add story-local CSS files, Angular `styleUrl` / `styleUrls` / `styles`, inline `<style>` blocks, or `style="..."` attributes. If a demo cannot reasonably be expressed with Tailwind utilities, document the reason and ask before adding CSS.
- Use semantic tokens first: `bg-background`, `text-foreground`, `bg-muted`, `bg-popover`, `border-border`, `text-popover-foreground`, `text-primary-foreground`. Avoid reintroducing raw Radix theme colors such as `violet`, `mauve`, `black-a*`, or hard-coded `white`/`black` when a semantic token exists.
- Story shells should use the shared wrapper from `packages/primitives/storybook/tailwind-demo.ts`. It applies the standard centered demo frame and marks the root with `data-demo="tailwind"` so Tailwind preflight and theme variables stay active.
- If a story needs the reset/theme variables, keep `data-demo="tailwind"` on the outermost demo container. If it does not, leave the wrapper alone and only use utilities that do not depend on the reset.
- Storybook Tailwind config is CSS-based at `apps/radix-storybook/.storybook/tailwind.css` (`@import 'tailwindcss/...'` + a `@theme {}` block); there is **no** `tailwind.config.js`.
- Files: `stories/<name>.stories.ts` (CSF) + optional `stories/<name>.ts` (standalone story components) + optional `stories/<name>.docs.mdx`. In the mdx, `<Meta title="…">` matching the CSF `title` attaches it as that group's docs page; use `<Canvas of={Stories.X} />` to embed a story and `<ArgTypes of={Directive} />` for the props table.
- Storybook theme switching is controlled from the toolbar, not OS color scheme. The preview decorator sets `document.documentElement[data-theme]`, so stories should use tokens that respond to that attribute instead of reading `prefers-color-scheme`.
- **Lucide icons use `@lucide/angular`.** Static icons should use standalone SVG directives such as `<svg lucideCheck />` with the matching `LucideCheck` import. Dynamic icons should use `<svg [lucideIcon]="icon" />` with `LucideDynamicIcon`; string-based dynamic names must be registered via `provideLucideIcons(...)` in `apps/radix-storybook/.storybook/preview.ts`.

### Story CSF template contract (`stories/<name>.stories.ts`)

When creating or rewriting primitive stories, follow this format by default:

- Imports: Storybook APIs → primitive dependencies → `../../storybook/styles` helpers → `tailwindDemoDecorator` → primitive directives/components → standalone demo components → raw `?raw` sources for standalone demos.
- Define `const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });` when a story renders only a standalone component tag.
- Define `const html = String.raw;`, `export default { title, decorators: [moduleMetadata({ imports: [...] }), tailwindDemoDecorator()] } as Meta;`, then `type Story = StoryObj;`.
- Story order: `Default` first, then state variants (`Disabled`, `Readonly`, `Required`, etc.), then form/value examples (`ReactiveForms`, `TemplateDrivenForms`, `Validation`) and advanced examples.
- `Default` should be a small inline template using shared style constants from `packages/primitives/storybook/styles.ts`; standalone component stories must set `parameters: source(rawSource)` so "Show code" displays the full source.
- For form controls, include form integration and controlled/template-driven examples when the primitive supports them. Prefer Checkbox/Radio/Switch stories as references.
- In form stories and demos, every visible `<label>` for an interactive control must be explicitly associated with the control: use `for`/`id` for native controls, `htmlFor` when using `RdxLabelDirective`, or `rdxFieldLabel` when the control is inside `rdxFieldRoot`. Do not leave a visual label next to an input, checkbox, radio, or switch without a programmatic association.
- Story export names should describe the behavior, not implementation details (`TemplateDrivenForms`, not `RadioGroupComponent`).

### Form primitives

- `Input` is the headless native text input primitive (`input[rdxInput]`). It can be used standalone, but should be wrapped in `Field` when it needs a label, description, error text, or inherited invalid/disabled/required state.
- `Field` groups one control with its label, description, error message, and state. Use `rdxFieldRoot`, `rdxFieldLabel`, `rdxFieldDescription`, `rdxFieldError`, and either `rdxFieldControl` or a compatible control such as `rdxInput`.
- `Fieldset` groups related fields with native `fieldset`/`legend` semantics. Use `fieldset[rdxFieldsetRoot]` and `legend[rdxFieldsetLegend]`; disabled state belongs on the root and is exposed to the legend with `data-disabled`.
- For larger form demos, prefer composing `Fieldset` → `Field` → `Input` so Storybook and `/primitives/components/*.md` examples show real accessible form structure.

### Storybook handbook index

Before changing primitive behavior, wrappers, demos, or docs, read the relevant handbook page instead
of rediscovering the project conventions from individual stories:

| Topic            | Read first                                                                                   | Use when                                                                                                                                       |
| ---------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling demos    | `packages/primitives/storybook/styling.docs.mdx` (`Guides/Styling`)                          | Adding or changing story markup, Tailwind utilities, semantic tokens, or shared demo classes                                                   |
| Composition      | `apps/radix-storybook/docs/guides/composition.docs.mdx` (`Guides/Composition`)               | Applying primitives to custom markup, stacking directives, or building wrapper components with `hostDirectives`                                |
| Customization    | `apps/radix-storybook/docs/guides/customization.docs.mdx` (`Guides/Customization`)           | Working with inputs, outputs, controlled state, two-way binding, DOM events, or primitive-specific hooks                                       |
| Animation        | `apps/radix-storybook/docs/guides/animation.docs.mdx` (`Guides/Animation`)                   | Adding transitions, CSS `@keyframes`, `RdxPresenceDirective`, Angular 21+ `animate.enter` / `animate.leave`, or JavaScript animation libraries |
| Naming           | `apps/radix-storybook/docs/guides/naming-conventions.docs.mdx` (`Guides/Naming Conventions`) | Naming selectors and directive classes                                                                                                         |
| Consumer theming | `apps/radix-storybook/docs/overview/theming.docs.mdx` (`Overview/Theming`)                   | Documenting `data-*` state styling, design tokens, or dark mode                                                                                |
| Accessibility    | `apps/radix-storybook/docs/overview/accessibility.docs.mdx` (`Overview/Accessibility`)       | Reviewing semantics, labels, keyboard navigation, or focus management                                                                          |

For animation work, distinguish the lifecycle owner before choosing an API:

- Always-mounted primitive parts: use CSS transitions driven by `data-state`.
- Application-owned conditional DOM (`@if`): prefer Angular 21+ `animate.enter` / `animate.leave`;
  legacy `@angular/animations` is not required.
- Parts mounted through `RdxPresenceDirective`: use exit CSS `@keyframes` driven by `data-state`;
  the current presence implementation waits for `animationend`, not `transitionend`.

### Centralized demo styles

- **Single source of truth: `packages/primitives/storybook/styles.ts`** (`cn`, `demoFocusRing`, `demoButton`, `demoCard`, `demoInput`). Reuse these constants instead of inlining/copy-pasting long Tailwind class strings; extend the file when a pattern recurs. Visual reference is [coss.com](https://coss.com/ui) / Base UI. Guide page: `storybook/styling.docs.mdx` ("Guides/Styling").
- In a standalone story component, expose them and bind via `[class]`:
  ```ts
  protected readonly cn = cn;
  protected readonly b = demoButton;
  // template: <button rdxButton [class]="cn(b.base, b.primary, b.size.md)">…</button>
  ```
- Semantic tokens live in `apps/radix-storybook/.storybook/tailwind.css` (`primary`, `muted`, `destructive`, `border`, `ring`, …). Add a token there (light + dark + `@theme`) rather than reaching for raw palette colors — note the theme strips default Tailwind palettes and resets `--color-red`/`--color-blue` inside `[data-demo="tailwind"]`.
- Reference example to copy from: **`packages/primitives/button/`** (primitive + stories + docs).

### Docs MDX template (`stories/<name>.docs.mdx`)

Follow this section order (modeled on Base UI): **`# Name` + one-line `####` summary → hero `<Canvas sourceState="hidden" of={…} />` → `## Features` (✅ bullets) → `## Import` → `## Anatomy` → `## Examples` → `## API Reference` (`<ArgTypes of={Directive} />`)**.

- **Anatomy**: short text + an HTML block showing the primitive assembled from all its parts (for compound primitives, every Root/Item/Trigger/Content part nested).
- **Examples**: each example gets `### Title` + a one-line description, then its `<Canvas of={Stories.X} />` — never a bare Canvas without a caption.
- **API Reference**: only render `<ArgTypes of={Directive} />` for parts that actually have inputs/outputs. Skip parts that read everything from context (a one-line note is enough) — an empty ArgTypes table is noise.

### LLM documentation (`llms.txt` and `.md` routes)

- The public docs app (`apps/radix-docs`) exposes `/llms.txt` and `/primitives/<section>/<slug>.md` as static Astro routes for LLM consumption.
- Overview pages (`/primitives/overview/*.md`) come from `apps/radix-docs/src/content/primitives`.
- Primitive, utility, guide, and example markdown pages come from Storybook docs MDX in `packages/primitives/**/stories/*.docs.mdx`, via `apps/radix-docs/src/utils/storybook-docs.ts`.
- Keep Storybook `*.docs.mdx` files as the source of truth for component API/examples; the docs app markdown endpoint strips Storybook-only imports and docs blocks (`Meta`, `Canvas`, `ArgTypes`, etc.) at build time.
- When adding or renaming a Storybook docs page, verify `getStorybookDocs()` still maps it to the intended URL. Normal components use `/primitives/components/<package-name>.md`; utilities use `/primitives/utils/<slug>.md`; guides use `/primitives/guides/<slug>.md`; examples use `/primitives/examples/<slug>.md`.
- Verify with `pnpm exec nx run radix-docs:build --skip-nx-cache`, then check `dist/radix-docs/llms.txt` and a generated page such as `dist/radix-docs/primitives/components/input.md`.

### "Show code" / full source in stories

- The demo wrapper is already stripped from the snippet globally via `parameters.docs.source.excludeDecorators` in `apps/radix-storybook/.storybook/preview.ts`.
- **Each standalone story component must live in its own file.** Never put multiple story components in a single `stories/<name>.ts` — `?raw` imports the entire file, so a shared file would show all components' source for every story. One component = one file: `stories/checkbox-validation.ts`, `stories/checkbox-indeterminate.ts`, etc.
- For a story that renders a standalone component tag (e.g. `<checkbox-validation-example />`), the "Show code" panel would only show that tag. To show the **full component source**, import the file raw and feed it to `source.code`:

  ```ts
  import validationSource from './checkbox-validation?raw';
  const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

  export const Validation: Story = {
    parameters: source(validationSource),
    render: () => ({
      template: html`
        <checkbox-validation-example />
      `
    })
  };
  ```

- `*.ts?raw` is wired by the `rawTsPlugin` in `.storybook/main.ts` (the AnalogJS Angular plugin shadows Vite's built-in `?raw`); types come from `packages/primitives/storybook/raw.d.ts`. Inline-template stories (source lives in `.stories.ts`) don't need this.
- Each story export gets `parameters: source(itsOwnRawFile)` — never point two story exports at one combined source file.

## Shared composition primitives

Complex components compose these headless building blocks — good entry points when tracing behavior:

- `core` — `createContext`, `useArrowNavigation`, id generators, shared types/utils.
- `collection` — `RdxCollectionProvider` + `RdxCollectionItem`: collects item directives in **DOM order** via `contentChildren` (matches `hostDirectives` too). Read items off the instance (`item.element`, `item.value()`, `item.disabled()`); `useCollection()` = `inject(RdxCollectionProvider)`. Only consumer: `select`.
- `portal` — `RdxPortal`: teleports its host element into a container (default `document.body`), reactively; non-element containers fall back to body.
- `presence` — conditional mount/unmount with enter/leave animation support.
- `roving-focus`, `focus-scope`, `popper` — focus roving, focus trapping, positioning.
- `dismissable-layer` — outside-dismiss (Escape / pointer-down-outside / focus-outside). **Gotcha:** the focus-outside check is **async** (defers two microtasks before deciding), so an element that takes focus _outside_ a layer and then opens it can be dismissed a tick later. Register such elements as **branches** (`rdxDismissableLayerBranch`, or push the element into `RdxDismissableLayersContextToken.branches`) so focus/pointer on them counts as "inside" and won't dismiss. Example: a menu trigger the menubar focuses before opening a sibling popup.
- `menu` / `menubar` — Menubar is a **coordinator over `rdxMenuRoot` + the standard `rdxMenuTrigger`** (no dedicated menubar-trigger directive, mirroring Base UI). The trigger reports interactions up via `registerTriggerInteractionHandler`; the menubar owns roving focus, arrow-key nav, and hover-to-switch.
- `context-menu` — two parts only: `RdxContextMenuRoot` (composes `RdxMenuRoot`, sets `RdxPopper.anchorOverride` to a `VirtualElement` at the cursor) and `RdxContextMenuTrigger` (opens on right-click / touch long-press). All popup parts come from `RdxMenuModule`. Pointer opening uses `autoFocus: 'popup'` (focus the container, no item highlighted); keyboard opening (`contextmenu` without a recent `pointerdown`) uses `'first'`.
- `checkbox` — `RdxCheckboxGroupDirective` lives in the **same entry** as `RdxCheckboxRootDirective` (not a separate ng-packagr entry) because root imports the `CheckedState` type from group and group imports context from root — a cross-entry circular dep that ng-packagr rejects. `parent` input on root makes it a "select all" with Base UI's cycle (partial → all → none → partial restored) and disabled-child preservation.

## Useful commands

```bash
pnpm primitives:test              # run Vitest tests
pnpm primitives:build             # build the library
pnpm storybook:primitives         # start Storybook dev server
pnpm eslint:fix                   # lint + fix
pnpm prettier:fix                 # format
nx run primitives:test --testFile packages/primitives/<name>/__tests__/<file>.spec.ts
```

## Tests

- `packages/primitives` uses `@nx/vitest:test` with `packages/primitives/vite.config.ts`.
- Test setup lives in `packages/primitives/test-setup.ts`; it initializes Angular's testing environment through `@analogjs/vite-plugin-angular/setup-vitest`, loads `@testing-library/jest-dom/vitest`, and registers the `jest-axe` matcher.
- Use Vitest APIs (`vi.fn`, `vi.spyOn`, `vi.mock`, `vi.importActual`) instead of Jest globals. Legacy skipped suites may still use `xdescribe` / `xit`, which are mapped to `describe.skip` / `it.skip` in the setup file.
- `apps/radix-ssr-testing:test` is also a Vitest target, but currently has no specs and uses `passWithNoTests`.

## Accessibility

- Follow WAI-ARIA authoring practices for the component pattern.
- Every visible label for a form control must be programmatically connected to that control. Prefer native `for`/`id`; use `htmlFor` on `RdxLabelDirective` or `rdxFieldLabel` inside `rdxFieldRoot` when using project primitives.
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
