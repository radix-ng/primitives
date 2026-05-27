# /new-primitive

Scaffold a new headless Angular primitive in `packages/primitives/<name>/`.

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

## What this command does

1. Derives `<name>` (kebab-case), `<Name>` (PascalCase), and `Rdx<Name>` (class prefix).
2. Looks up the WAI-ARIA pattern for `<PrimitiveName>`.
3. Identifies the minimal set of directive parts required.
4. Creates the full file scaffold:

```
packages/primitives/<name>/
  ng-package.json
  index.ts
  src/
    <name>-root.directive.ts   ← context type + root directive
    <name>-<part>.directive.ts ← one file per part
  __tests__/
    <name>-root.directive.spec.ts
  stories/
    <name>.stories.ts
    <name>.ts
    styles.css
```

5. Adds `@radix-ng/primitives/<name>` to `tsconfig.base.json`.
6. Runs `pnpm primitives:build` to validate the build.
7. Reports what was created and next steps.

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
import { RdxFooRootDirective } from './src/foo-root.directive';
// ... other imports

export * from './src/foo-root.directive';
// ... other exports

const _imports = [
  RdxFooRootDirective
  // ...
];

@NgModule({ imports: [..._imports], exports: [..._imports] })
export class RdxFooModule {}
```

## Template: Root directive

```ts
import { Directive, input, model, output } from '@angular/core';
import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute } from '@angular/core';
import { createContext } from '@radix-ng/primitives/core';

export interface RdxFooRootContext {
    // define the contract consumed by child directives
}

export const [injectFooRootContext, provideFooRootContext] =
    createContext<RdxFooRootContext>('FooRootContext');

const rootContext = (): RdxFooRootContext => {
    const instance = inject(RdxFooRootDirective);
    return { ... };
};

@Directive({
    selector: '[rdxFooRoot]',
    exportAs: 'rdxFooRoot',
    providers: [provideFooRootContext(rootContext)],
    host: {
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
    }
})
export class RdxFooRootDirective {
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

## Template: Spec file

```ts
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { RdxFooRootDirective } from '../src/foo-root.directive';

@Component({
  template: `
    <div rdxFooRoot></div>
  `,
  imports: [RdxFooRootDirective]
})
class TestHostComponent {}

describe('RdxFooRootDirective', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should create', () => {
    const fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[rdxFooRoot]')).toBeTruthy();
  });
});
```

## After scaffolding

Run:

```bash
pnpm primitives:build        # verify it compiles
pnpm storybook:primitives    # check story renders
nx run primitives:test --testFile packages/primitives/<name>/__tests__/<name>-root.directive.spec.ts
```
