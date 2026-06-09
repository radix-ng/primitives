# /new-primitive

Scaffold a new headless Angular primitive in `packages/primitives/<name>/`, following
current project conventions (signals-first, no CDK, newer suffix-less naming).

## Usage

```
/new-primitive <PrimitiveName> [--parts <part1,part2,...>] [--composes <existing-primitive>]
```

**Arguments:**

- `<PrimitiveName>` — PascalCase name, e.g. `Tabs`, `ProgressBar`, `Toggle`
- `--parts` — comma-separated list of parts beyond Root (defaults to common sense for the ARIA pattern)
- `--composes` — existing primitive to build on via `hostDirectives`

**Examples:**

```
/new-primitive Tabs
/new-primitive Toggle --composes Checkbox
/new-primitive Breadcrumb --parts Item,Link,Separator
```

## Conventions to follow (authoritative: CLAUDE.md + `.claude/skills/project-knowledge/references/patterns.md`)

- **Reference [Base UI](https://base-ui.com/) first** for the component API/anatomy, Radix UI second.
- **Newer naming style** (matches dialog/select/drawer): class `Rdx<Name><Role>` and file
  `<name>-<role>.ts` — **no `Directive` suffix, no `.directive.ts`**. Selector `[rdx<Name><Role>]`,
  `exportAs` `rdx<Name><Role>`.
- **No `@angular/cdk`.** It is fully removed. Import `BooleanInput` / `NumberInput` / `Direction`
  from `@radix-ng/primitives/core`, not `@angular/cdk/coercion`. Use `injectId()` for ids,
  `RdxLiveAnnouncer` for announcements, `isPlatformBrowser(inject(PLATFORM_ID))` for platform checks.
- **Signals-first lifecycle.** Avoid `ngOnInit` / `ngOnChanges` / `ngOnDestroy` in `src/**` (ESLint
  warns). Use the `constructor` for DI/host-element work, `effect()` / `computed()` / `linkedSignal()`
  for input-driven logic, `afterNextRender()` / `afterRenderEffect()` for DOM work,
  `inject(DestroyRef).onDestroy(...)` for cleanup.
- **Headless state via `host` data-attributes**, never inline styles (CSS custom properties for
  animation dimensions are the only exception). Remove an attribute with `undefined`.
- **Compose existing primitives** via `hostDirectives` when `--composes` is given (e.g. Accordion Item
  composes CollapsibleRoot).

## What this command does

1. Derives `<name>` (kebab-case), `<Name>` (PascalCase), and `Rdx<Name>` (class prefix).
2. Looks up the WAI-ARIA pattern and the Base UI anatomy for `<PrimitiveName>`.
3. Identifies the minimal set of directive parts required.
4. Creates the full file scaffold:

```
packages/primitives/<name>/
  ng-package.json
  index.ts
  src/
    <name>-root.ts            ← context type + root directive
    <name>-<part>.ts          ← one file per part
  __tests__/
    <name>-root.spec.ts
  stories/
    <name>.stories.ts
    <name>.ts                 ← optional standalone demo component (one component per file)
```

5. Adds `@radix-ng/primitives/<name>` to `tsconfig.base.json` under `compilerOptions.paths`.
6. **If the primitive imports a new external runtime package**, adds it to
   `packages/primitives/package.json` `peerDependencies` (+ matching devDependency) and updates
   `packages/primitives/schematics/ng-add/index.ts` so `ng add` installs it.
7. Runs `pnpm primitives:build` to validate the build.
8. Reports what was created and next steps.

## Template: `ng-package.json`

```json
{
  "lib": {
    "entryFile": "index.ts"
  }
}
```

## Template: `index.ts`

```ts
import { NgModule } from '@angular/core';
import { RdxFooRoot } from './src/foo-root';
// ... other part imports

export * from './src/foo-root';
// ... other exports

const _imports = [
  RdxFooRoot
  // ...parts
];

@NgModule({ imports: [..._imports], exports: [..._imports] })
export class RdxFooModule {}
```

## Template: Root directive (`src/foo-root.ts`)

```ts
import { booleanAttribute, Directive, effect, inject, input, model, output } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxFooRootContext {
  // define the contract consumed by child directives (signals/methods)
}

export const [injectFooRootContext, provideFooRootContext] = createContext<RdxFooRootContext>('FooRootContext');

const rootContext = (): RdxFooRootContext => {
  const instance = inject(RdxFooRoot);
  return {
    // expose instance signals/methods to children
  };
};

@Directive({
  selector: '[rdxFooRoot]',
  exportAs: 'rdxFooRoot',
  providers: [provideFooRootContext(rootContext)],
  host: {
    '[attr.data-disabled]': 'disabled() ? "" : undefined'
  }
})
export class RdxFooRoot {
  readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });
  readonly value = model<string>();
  readonly defaultValue = input<string>();
  readonly onValueChange = output<string>();

  constructor() {
    effect(() => {
      if (this.defaultValue() !== undefined) {
        this.value.set(this.defaultValue());
      }
    });
  }
}
```

## Template: Child part (`src/foo-item.ts`)

```ts
import { Directive } from '@angular/core';
import { injectFooRootContext } from './foo-root';

@Directive({
  selector: '[rdxFooItem]',
  exportAs: 'rdxFooItem',
  host: {
    '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined'
  }
})
export class RdxFooItem {
  protected readonly rootContext = injectFooRootContext();
}
```

## Template: Spec file (`__tests__/foo-root.spec.ts`)

```ts
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RdxFooRoot } from '../src/foo-root';

@Component({
  template: `
    <div rdxFooRoot></div>
  `,
  imports: [RdxFooRoot]
})
class TestHostComponent {}

describe('RdxFooRoot', () => {
  it('should create', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[rdxFooRoot]')).toBeTruthy();
  });
});
```

## Template: Stories (`stories/foo.stories.ts`)

Stories use **Tailwind v4 utilities only** — no story-local CSS files, no `styleUrls`/`styles`/inline
`<style>`. Wrap with `tailwindDemoDecorator()`, use semantic tokens (`bg-background`, `text-foreground`,
`border-border`, …), and reuse shared constants from `packages/primitives/storybook/styles.ts`.
For standalone demo components, one component per file and import its source `?raw` for "Show code".
Prefer running the **`storybook-story` skill**, which enforces the full CSF/MDX contract.

```ts
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxFooRoot } from '../src/foo-root';

const html = String.raw;

export default {
  title: 'Primitives/Foo',
  decorators: [moduleMetadata({ imports: [RdxFooRoot] }), tailwindDemoDecorator()]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: html`
      <div rdxFooRoot></div>
    `
  })
};
```

## After scaffolding

```bash
pnpm primitives:build        # verify it compiles
pnpm storybook:primitives    # check story renders (http://localhost:4400)
nx run primitives:test --testFile packages/primitives/<name>/__tests__/<name>-root.spec.ts
pnpm eslint:fix && pnpm prettier:fix
```

Then write the docs MDX (`stories/<name>.docs.mdx`) and full stories via the `storybook-story` skill.
