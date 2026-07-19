# Field — Custom Control

> One example from the [Field](../components/field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

For custom controls, pass `filled` and `focused` state to the root when the native events are not
enough.

```typescript
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldCustomTrigger, fieldDescription, fieldError, fieldLabel } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-custom-control-example',
    imports: [RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <div class="flex w-80 flex-col gap-2" [filled]="selected()" [focused]="open()" rdxFieldRoot>
            <label [class]="labelClass" rdxFieldLabel>Plan</label>
            <button [class]="triggerClass" (click)="open.update((value) => !value)" type="button" rdxFieldControl>
                {{ selected() ? 'Pro' : 'Choose a plan' }}
            </button>
            <p [class]="descriptionClass" rdxFieldDescription>Custom controls can pass state into the field root.</p>
            <p [class]="errorClass" rdxFieldError>Choose a plan.</p>
        </div>
    `
})
export class FieldCustomControlExample {
    readonly open = signal(false);
    readonly selected = computed(() => this.open());

    protected readonly triggerClass = fieldCustomTrigger;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;
}
```
