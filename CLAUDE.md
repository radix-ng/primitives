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
apps/
  radix-storybook/     ← Storybook app for primitives; also the public site on radix-ng.com
  radix-docs/          ← Astro docs site (deprecated, not deployed)
skills/                ← LLM consumer Agent Skills (generated from Storybook docs)
tools/
  scripts/             ← build helpers (incl. skills bundle generator)
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

// Second arg: docs path ('components/<name>' or 'utils/<name>') — appended to the
// missing-context error as a link to https://radix-ng.com/<path>.md. Always pass it.
export const [injectFooRootContext, provideFooRootContext] =
    createContext<RdxFooRootContext>('FooRootContext', 'components/foo');

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
- Current runtime peers installed by `ng-add`: `@angular/common` (matched to the app's `@angular/core` version), `@floating-ui/dom`, `@internationalized/date`, and `@internationalized/number`.
- **`@angular/cdk` has been fully removed** — it is no longer a peer dependency, is not installed by `ng-add`, and is absent from the lockfile. Do not reintroduce CDK imports. Own replacements: `injectId('rdx-…-')` / `RdxIdGenerator` for `_IdGenerator`; `RdxLiveAnnouncer` (`core`) for `LiveAnnouncer`; `isPlatformBrowser(inject(PLATFORM_ID))` for `Platform`; the `Direction`, `BooleanInput`, and `NumberInput` type aliases all live in `core/src/types.ts`. CDK Dialog/Overlay, `cdk/portal`, and `CdkTrapFocus` were already replaced earlier (consumers no longer need `@angular/cdk/overlay-prebuilt.css`). See the full breakdown in `.claude/skills/project-knowledge/references/architecture.md`.
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
- `Field` groups one control with its label, description, error message, and state. Use `rdxFieldRoot`, `rdxFieldLabel`, `rdxFieldDescription`, `rdxFieldError`, and either `rdxFieldControl` or a compatible control such as `rdxInput`. `rdxFieldRoot` takes a `name` (the key an enclosing `Form`'s `errors` map matches), registers with an optional enclosing `Form`, merges external errors into `invalidState`, and exposes matched messages via `rdxFieldError`'s `messages()`.
- `Fieldset` groups related fields with native `fieldset`/`legend` semantics. Use `fieldset[rdxFieldsetRoot]` and `legend[rdxFieldsetLegend]`; disabled state belongs on the root and is exposed to the legend with `data-disabled`.
- `Form` (`form[rdxFormRoot]`, entry `@radix-ng/primitives/form`) is the top layer: it maps server `errors` onto fields by `name` (clearing on edit, `onClearErrors`), intercepts submit (`onFormSubmit` with `FormData`-serialized values, focus first invalid), and resets field state on native reset. It owns no values/validation — `field` → `form` is the only dependency direction (Form never imports Field; keep it acyclic). A `RdxFormState` provider seam mirrors Field's `RdxFieldState` for a future Signal Forms `[rdxSignalForm]` adapter.
- For larger form demos, prefer composing `Form` → `Fieldset` → `Field` → `Input` so Storybook and `/primitives/components/*.md` examples show real accessible form structure.

### Storybook handbook index

Before changing primitive behavior, wrappers, demos, or docs, read the relevant handbook page instead
of rediscovering the project conventions from individual stories:

| Topic            | Read first                                                                                   | Use when                                                                                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Styling demos    | `packages/primitives/storybook/styling.docs.mdx` (`Guides/Styling`)                          | Adding or changing story markup, Tailwind utilities, semantic tokens, or shared demo classes                                                               |
| Composition      | `apps/radix-storybook/docs/guides/composition.docs.mdx` (`Guides/Composition`)               | Applying primitives to custom markup, stacking directives, or building wrapper components with `hostDirectives`                                            |
| Customization    | `apps/radix-storybook/docs/guides/customization.docs.mdx` (`Guides/Customization`)           | Working with inputs, outputs, controlled state, two-way binding, DOM events, or primitive-specific hooks                                                   |
| Animation        | `apps/radix-storybook/docs/guides/animation.docs.mdx` (`Guides/Animation`)                   | Adding transitions, CSS `@keyframes`, `RdxPresenceDirective`, Angular 21+ `animate.enter` / `animate.leave`, or JavaScript animation libraries             |
| Forms            | `apps/radix-storybook/docs/guides/forms.docs.mdx` (`Guides/Forms`)                           | Integrating controls with Reactive / template-driven / Signal Forms, `ControlValueAccessor`, the two-layer control + `Field` split, Signal Forms readiness |
| Naming           | `apps/radix-storybook/docs/guides/naming-conventions.docs.mdx` (`Guides/Naming Conventions`) | Naming selectors and directive classes                                                                                                                     |
| Consumer theming | `apps/radix-storybook/docs/overview/theming.docs.mdx` (`Overview/Theming`)                   | Documenting `data-*` state styling, design tokens, or dark mode                                                                                            |
| Accessibility    | `apps/radix-storybook/docs/overview/accessibility.docs.mdx` (`Overview/Accessibility`)       | Reviewing semantics, labels, keyboard navigation, or focus management                                                                                      |
| SSR & Hydration  | `apps/radix-storybook/docs/guides/ssr.docs.mdx` (`Guides/Server-Side Rendering`)             | SSR/hydration behavior — stable IDs (`injectId`), platform guards, portal no-op on server, browser-only positioning, hydration-mismatch troubleshooting    |
| Performance      | `apps/radix-storybook/docs/guides/performance.docs.mdx` (`Guides/Performance`)               | Benchmark suite (`pnpm primitives:bench`, `apps/radix-perf-testing`) — reading the report, writing a bench, the harness; design in `docs/adr/0009`         |

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

### LLM documentation & consumer skills (`llms.txt`, `.md`, `skills/`)

- Storybook docs MDX (`packages/primitives/**/stories/*.docs.mdx`) is the **single source of truth** for component API/examples. Everything LLM-facing is generated from it — keep the MDX correct and regenerate.
- The generated bundle under `skills/` powers two consumer Agent Skills (`radix-ng`, `radix-ng-examples`) distributed via skills.sh (`npx skills add radix-ng/primitives/skills`). It contains a per-primitive `styling-contract.json` (parts + `data-*`), an `api-contract.json` (per part: selector, `exportAs`, inputs with types/defaults, outputs, two-way bindings), per-component `.md`, an `llms.txt` index, and `llms-full.txt`. Both contracts are stamped with the `@radix-ng/primitives` version.
- Generator: `tools/scripts/skills/generate.mjs` (+ `storybook-docs.mjs`, an Astro-independent renderer that resolves `<Canvas>` blocks into real source; + `api-contract.mjs`, which reads the Storybook compodoc `documentation.json` — regenerating it via compodoc automatically when missing or older than `packages/primitives` sources). Run `pnpm skills:build` after changing any `*.docs.mdx` **or any primitive's public API**. Hand-authored skill files (`skills/radix-ng/SKILL.md` + its references) are not overwritten; generated files are in `.prettierignore` and CI-verified.
- The same bundle is served as static files by Storybook on the main domain (`radix-ng.com/llms.txt`, `/llms-full.txt`, `/<section>/<slug>.md`) via `staticDirs` in `apps/radix-storybook/.storybook/main.ts`.
- The Astro app `apps/radix-docs` (which previously generated these routes via `getStorybookDocs()`) is **deprecated and not deployed**. See `.claude/skills/project-knowledge/references/{architecture,deployment}.md` for the full pipeline.
- **compodoc gotcha — never use an inline `transform` arrow together with explicit generic union type arguments on `input()`.** A signal input written as `input<boolean | 'always', BooleanInput | 'always'>(false, { transform: (v) => … })` makes compodoc 1.2.1 **hang at 100% CPU while parsing that file** (it never finishes, so `documentation.json`, `build-storybook`, and `skills:build` all stall). This silently breaks both Storybook's ArgTypes and the generated `api-contract.json`. Fix: extract the transform to a **named module-level function** and drop the explicit generics — `function coerce(v: BooleanInput | 'always') { … }` then `input(false, { transform: coerce })`. Angular infers the same read/write types and compodoc parses it instantly. (Plain `input<boolean, BooleanInput>(false, { transform: booleanAttribute })` — simple generics + a function reference — is fine; the trigger is the inline arrow _combined with_ string-literal union generics.) See `combobox-root.ts` / `autocomplete-root.ts` `coerceAutoHighlight`.

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
- `portal` — `RdxPortal` (attribute): teleports its host element into a container (default `document.body`), reactively; non-element containers fall back to body. `RdxPortalPresence` (structural, `ng-template`): merges portal + presence — mounts its template while `present()` (from `RDX_PRESENCE_CONTEXT`) is true, relocates **all** root nodes into the container with **no wrapper element**, and waits for exit `@keyframes` on **every** `HTMLElement` root before unmounting (dialog backdrop + popup). This is the ADR 0010 anatomy-flattening primitive; popover is the migrated pilot (`*rdxPopoverPortal` on the positioner). Entry depends on `presence`.
- `presence` — conditional mount/unmount with enter/leave animation support. The state machine lives in `presence/src/presence-machine.ts` (`PresenceMachine`, parameterized by `mountView`/`destroyView`); both `RdxPresenceDirective` (in place) and `RdxPortalPresence` (relocating) reuse it.
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

### Shell conventions (fewer permission prompts)

Prefer the package.json scripts above over ad-hoc shell, and keep commands matchable against the
`.claude/settings.json` allow list:

- **Prefer the scripts**: `pnpm primitives:test`, `pnpm primitives:build`, `pnpm eslint:fix`,
  `pnpm prettier:fix`, `pnpm storybook:primitives`. For a single spec, `nx run primitives:test --testFile <path>`.
- **Don't prefix `cd /abs/path &&`** — the working directory persists between commands, and the
  Read/Grep/Glob tools take absolute paths directly. The permission matcher splits compound commands
  on `&&` / `;` / `|` and requires every segment to be allowed, so a stray `cd` forces a prompt.
- **Prefer the Read / Grep / Glob tools** over `cat` / `grep` / `find` / `sed -n` in Bash.
- **Keep commands simple** — `$(…)`, `while`/`for` loops, and `mapfile` defeat the matcher and always prompt.
- The allow list covers safe read-only commands (`cd`, `echo`, `head`, `tail`, `wc`, `sort`, `uniq`,
  `grep`, `ls`, `cat`, `git status/diff/log/show`) plus `pnpm`/`nx`/`npx`/`node`. Writing commands
  (`sed -i`, `git checkout/add/commit`) intentionally stay out and still prompt.

## Tests

- `packages/primitives` uses `@nx/vitest:test` with `packages/primitives/vite.config.ts`.
- Test setup lives in `packages/primitives/test-setup.ts`; it sets `provideZonelessChangeDetection`, initializes Angular's testing environment, loads `@testing-library/jest-dom/vitest`, and registers the `jest-axe` matcher. It intentionally does **not** import `@analogjs/vite-plugin-angular/setup-vitest` (that harness hard-loads zone.js), so the suite runs **zone-free**.
- The suite is zoneless: `fakeAsync` / `tick` / `waitForAsync` are unavailable — use `vi.useFakeTimers()` + `vi.advanceTimersByTime()`, `await fixture.whenStable()`, or a macrotask (`await new Promise(r => setTimeout(r))`) to drain chained microtasks. Mutating a plain (non-signal) fixture field then calling `fixture.detectChanges()` throws `NG0100`; call `fixture.changeDetectorRef.markForCheck()` first (signal writes don't need it).
- Use Vitest APIs (`vi.fn`, `vi.spyOn`, `vi.mock`, `vi.importActual`) instead of Jest globals. Legacy skipped suites may still use `xdescribe` / `xit`, which are mapped to `describe.skip` / `it.skip` in the setup file.
- `apps/radix-ssr-testing:test` is also a Vitest target. `src/ssr-rendering.spec.ts` renders the primitive
  pages through `renderApplication` (`@angular/platform-server`) and asserts server render does not throw,
  the markup is present, hydration annotations (`ngh`) are emitted, and ids are SSR-stable. It needs
  `import '@angular/compiler';` at the top (platform-server is partially compiled → JIT fallback). The
  target still keeps `passWithNoTests`. Note: CI excludes `radix-ssr-testing` from `test`/`build`, so its
  page components are not type-checked there — the select page had drifted onto a removed API and only the
  spec caught it; keep the pages current with the primitives' public API.

## Accessibility

- Follow WAI-ARIA authoring practices for the component pattern.
- Every visible label for a form control must be programmatically connected to that control. Prefer native `for`/`id`; use `htmlFor` on `RdxLabelDirective` or `rdxFieldLabel` inside `rdxFieldRoot` when using project primitives.
- Use `role`, `aria-*` attributes in `host` bindings.
- Support keyboard navigation (`arrowDown`, `arrowUp`, `home`, `end`, `enter`, `space`) via `(keydown.*)` host listeners.
- Use `useArrowNavigation` from `@radix-ng/primitives/core` for list navigation.
- Support `dir` input (`'ltr' | 'rtl'`) for bidirectional text.

## Key utilities from `@radix-ng/primitives/core`

- `createContext<T>(description, docs?)` — DI context factory; `docs` ('components/<name>') links the missing-context error to the primitive's docs page
- `useArrowNavigation(event, current, container, opts)` — keyboard list nav
- `DataOrientation` — `'horizontal' | 'vertical'`
- `AcceptableValue` — `string | Record<string, any> | null`
- `isNullish(v)` — null/undefined check
