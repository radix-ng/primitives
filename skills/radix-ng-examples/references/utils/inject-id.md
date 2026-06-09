# injectId

#### Generates unique, SSR-stable element IDs — the Angular counterpart of React's `useId`.

Each field below calls `injectId('rdx-field-')` in its own injection context, wiring its `<label for>`
to the matching `<input id>` without hardcoding an id or risking a collision.

```typescript
import { Component, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { cn, demoInput } from '../../storybook/styles';

/**
 * Each instance calls `injectId('rdx-field-')` in its injection context, so every
 * label/input pair is wired with a unique, SSR-stable id without hardcoding one.
 */
@Component({
    selector: 'inject-id-field',
    imports: [],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" [attr.for]="id">{{ label() }}</label>
            <input [id]="id" [class]="inputClass" [placeholder]="label()" type="text" />
            <code class="text-muted-foreground text-xs">id="{{ id }}"</code>
        </div>
    `
})
export class InjectIdField {
    readonly label = input.required<string>();

    /** Generated once per instance; the shared per-prefix counter keeps ids unique and ordered. */
    readonly id = injectId('rdx-field-');

    protected readonly inputClass = cn(demoInput);
}

@Component({
    selector: 'inject-id-example',
    imports: [InjectIdField],
    template: `
        <div class="flex w-72 flex-col gap-5">
            <inject-id-field label="First name" />
            <inject-id-field label="Last name" />
            <inject-id-field label="Email" />
        </div>
    `
})
export class InjectIdExample {}
```

## Features

- ✅ Unique per call — a monotonic per-prefix counter guarantees no two ids collide.
- ✅ SSR/hydration safe — deterministic sequences keep server and client renders in sync.
- ✅ Multi-app safe — the application's `APP_ID` is folded into the prefix (omitted for the default `ng` app to keep ids short).
- ✅ Tiny call-site API; no manual cleanup.

## Import

```typescript
import { injectId, RdxIdGenerator } from '@radix-ng/primitives/core';
```

## Usage

Call `injectId(prefix)` in an injection context (a field initializer or constructor). It returns a
string id you can bind to `id` / `for` / `aria-*`.

```typescript
import { Component, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

@Component({
    selector: 'app-field',
    template: `
        <label [attr.for]="id">{{ label() }}</label>
        <input [id]="id" type="text" />
    `
})
export class FieldComponent {
    readonly label = input.required<string>();
    readonly id = injectId('rdx-field-');
}
```

## Generating ids outside an injection context

When you need an id lazily (outside a field initializer/constructor), inject `RdxIdGenerator` and call
`getId(prefix)` directly:

```typescript
import { Component, inject } from '@angular/core';
import { RdxIdGenerator } from '@radix-ng/primitives/core';

@Component({ /* … */ })
export class ExampleComponent {
    private readonly idGenerator = inject(RdxIdGenerator);

    createRow(): string {
        return this.idGenerator.getId('rdx-row-');
    }
}
```
