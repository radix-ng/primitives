# Input — Disabled

> One example from the [Input](../components/input.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Disables the native input and exposes `data-disabled`.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-input-disabled-example',
    imports: [FormsModule, ReactiveFormsModule, RdxInputDirective],
    template: `
        <input class="demo-input h-8 w-full px-2" rdxInput disabled defaultValue="name@example.com" />
    `
})
export class InputDisabledStory {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
