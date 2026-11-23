# Signal Forms — Field driven by Signal Forms

> One example from the [Signal Forms](../components/signal-forms.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The `rdxFieldRoot` carries no manual `[invalid]`/`[touched]`/`[dirty]` — `rdxSignalField` maps them from
the field, including the validation message shown by `rdxFieldError`.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { email as emailFormat, form, FormField, required } from '@angular/forms/signals';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot
} from '@radix-ng/primitives/field';
import { RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { RdxSignalField, RdxSignalForm } from '@radix-ng/primitives/signal-forms';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'signal-forms-field-example',
    imports: [
        FormField,
        RdxFormRoot,
        RdxSignalForm,
        RdxFieldRoot,
        RdxSignalField,
        RdxFieldLabel,
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError
    ],
    template: `
        <form
            class="flex w-80 flex-col gap-3"
            [rdxSignalForm]="loginForm"
            (onFormSubmit)="onSubmit($event)"
            rdxFormRoot
        >
            <!--
              No manual [invalid]/[touched]/[dirty]/[disabled] on rdxFieldRoot — rdxSignalField drives them
              from the Signal Forms field, and the field expression is bound exactly once (on [formField]).
            -->
            <div class="flex flex-col gap-2" rdxFieldRoot required>
                <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
                    Email
                </label>
                <input
                    class="demo-input data-[invalid]:border-destructive data-[invalid]:ring-destructive/20 h-9 w-full px-3"
                    [formField]="email"
                    rdxFieldControl
                    rdxSignalField
                    type="email"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    Use the email connected to your account.
                </p>
                <p class="text-destructive text-sm" #err="rdxFieldError" rdxFieldError>
                    {{ err.messages().join(' ') }}
                </p>
            </div>

            <button class="demo-button demo-button-primary h-9 self-start px-4" type="submit">Submit</button>
        </form>
    `
})
export class SignalFormsFieldExample {
    readonly model = signal({ email: '' });
    readonly loginForm = form(this.model, (path) => {
        required(path.email, { message: 'Email is required.' });
        emailFormat(path.email, { message: 'Enter a valid email address.' });
    });

    get email() {
        return this.loginForm.email;
    }

    // `(onFormSubmit)` is RdxFormRoot's guarded submit — it fires only when the form is valid (an
    // invalid submit focuses the first invalid field instead), so this runs only on a valid form.
    onSubmit(event: RdxFormSubmitEvent): void {
        console.log(event.values, this.model());
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

#### `../../form/stories/form.shared.ts`

```typescript
export interface AccountFormValue {
    username: string;
    email: string;
}

export const initialAccountValue = (): AccountFormValue => ({ username: '', email: '' });
export const unavailableUsername = 'admin';
export const takenEmail = 'taken@example.com';
export const simulateFormRequest = (duration = 500): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, duration));

export const formField = 'flex flex-col gap-1.5';
export const formLabel = 'text-foreground text-sm font-bold';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-8 w-full px-2 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-8 px-3 self-start';
export const formReset = 'demo-button demo-button-outline h-8 px-3';
```
