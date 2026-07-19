# Field — Default

> One example from the [Field](../components/field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

The root owns the relationships between the field parts.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-default-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" rdxFieldRoot required>
            <label [class]="labelClass" rdxFieldLabel>Email</label>
            <input [class]="inputClass" rdxFieldControl type="email" placeholder="name@example.com" />
            <p [class]="descriptionClass" rdxFieldDescription>Used for account notifications.</p>
            <p [class]="errorClass" rdxFieldError>Enter a valid email address.</p>
        </div>
    `
})
export class FieldDefaultExample {
    protected readonly inputClass =
        'border-border bg-background text-foreground placeholder:text-muted-foreground h-9 w-full rounded-md border px-3 text-sm outline-none';
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```
