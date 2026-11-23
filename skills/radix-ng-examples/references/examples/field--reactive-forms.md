# Field — Reactive Forms

> One example from the [Field](../components/field.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

Place `rdxNgControlField` next to `formControl`, `formControlName`, or `ngModel`. Angular Forms remains
responsible for validation; the adapter reports actual state while Field's `validationMode` controls when
it becomes visible. Use `rdxFieldError[match]` for a specific Angular error key.

```html
<div rdxFieldRoot required>
  <label rdxFieldLabel>Email</label>
  <input formControlName="email" rdxFieldControl rdxNgControlField />
  <p match="required" rdxFieldError>Email is required.</p>
  <p match="email" rdxFieldError>Enter a valid email address.</p>
</div>
```

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';

import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel, fieldSubmitButton } from './field.shared';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-reactive-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form class="flex w-80 flex-col gap-3" [formGroup]="form" (ngSubmit)="submit()">
            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label [class]="labelClass" rdxFieldLabel>Email</label>
                <input [class]="inputClass" rdxFieldControl rdxNgControlField type="email" formControlName="email" />
                <p [class]="descriptionClass" rdxFieldDescription>Use the email connected to your account.</p>
                <p [class]="errorClass" match="required" rdxFieldError>Email is required.</p>
                <p [class]="errorClass" match="email" rdxFieldError>Enter a valid email address.</p>
            </div>

            <button [class]="buttonClass" type="submit">Submit</button>
        </form>
    `
})
export class FieldReactiveFormsExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly buttonClass = fieldSubmitButton;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;

    private readonly formBuilder = inject(FormBuilder);

    readonly form = this.formBuilder.group({
        email: this.formBuilder.control('', [Validators.required, Validators.email])
    });

    get email() {
        return this.form.controls.email;
    }

    submit(): void {
        this.form.markAllAsTouched();
    }
}
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
