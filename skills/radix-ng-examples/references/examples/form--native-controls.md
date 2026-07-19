# Form — Native controls

> One example from the [Form](../components/form.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

No `@angular/forms` at all — a valid submit serializes the form's `FormData` into a plain values object
(repeated names collapse into arrays).

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formField, formInput, formLabel, formSubmit } from './form.shared';

/**
 * No `@angular/forms` at all — just native controls. On a valid submit the Form serializes the form's
 * `FormData` into a plain values object (repeated `name`s collapse into arrays).
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-native-controls-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl],
    template: `
        <form class="flex w-80 flex-col gap-4" (onFormSubmit)="onSubmit($event)" rdxFormRoot>
            <div [class]="field" name="name" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Name</label>
                <input [class]="input" name="name" rdxFieldControl value="Ada" />
            </div>
            <div [class]="field" name="role" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Role</label>
                <input [class]="input" name="role" rdxFieldControl value="Engineer" />
            </div>

            <button [class]="submit" type="submit">Submit</button>
            @if (values()) {
                <pre class="bg-muted text-foreground rounded-md p-3 text-xs">{{ values() }}</pre>
            }
        </form>
    `
})
export class FormNativeControlsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly submit = formSubmit;

    readonly values = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        this.values.set(JSON.stringify(event.values, null, 2));
    }
}
```
