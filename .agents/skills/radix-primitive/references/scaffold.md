# Primitive scaffold examples

These illustrate file structure. Derive the actual value type, parts and behavior from the primitive contract.

## ng-package.json

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

export const [injectFooRootContext, provideFooRootContext] = createContext<RdxFooRootContext>(
  'FooRootContext',
  'components/foo'
);

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
Prefer running the **`radix-storybook` skill**, which enforces the full CSF/MDX contract.

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
