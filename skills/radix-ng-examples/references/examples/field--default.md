# Field — Default

> One example from the [Field](../components/field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The root owns the relationships between the field parts.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-64 max-w-full flex-col items-start gap-1" rdxFieldRoot required>
            <label class="text-foreground text-sm font-bold" rdxFieldLabel>Email</label>
            <input
                class="demo-input h-8 self-stretch px-2"
                rdxFieldControl
                type="email"
                placeholder="name@example.com"
            />
            <p class="text-muted-foreground text-sm" rdxFieldDescription>Used for account notifications.</p>
            <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

#### `./field.shared.ts`

```typescript
export const fieldLabel = 'text-foreground text-sm font-bold data-[disabled]:opacity-50';
export const fieldDescription = 'text-muted-foreground text-sm';
export const fieldError = 'text-destructive text-sm';

export const fieldInputInvalid =
    'demo-input h-8 w-full px-2 data-[invalid]:border-destructive data-[invalid]:ring-destructive/20';

export const fieldCustomTrigger =
    'demo-input h-8 w-full px-2 inline-flex items-center text-left data-[filled]:text-foreground data-[focused]:ring-2 data-[focused]:ring-ring';

export const fieldSubmitButton = 'demo-button demo-button-primary h-8 px-3 self-start';
```
