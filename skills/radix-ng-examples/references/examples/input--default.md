# Input — Default

> One example from the [Input](../components/input.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.1` — if the installed version differs, verify the API against the installed package.

Copy the standalone component and follow the linked example setup.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RdxInputDirective } from '@radix-ng/primitives/input';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-input-default-example',
    imports: [FormsModule, ReactiveFormsModule, RdxInputDirective],
    template: `
        <label class="text-foreground flex flex-col items-start gap-1 text-sm font-bold">
            Email
            <input class="demo-input h-8 w-40 px-2 font-normal" rdxInput type="email" placeholder="name@example.com" />
        </label>
    `
})
export class InputDefaultStory {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

Install `@lucide/angular` when an example imports it.
