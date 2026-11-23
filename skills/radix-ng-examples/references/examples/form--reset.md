# Form — Reset

> One example from the [Form](../components/form.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

After the native reset completes, Form clears the previous external errors and resets each field's
interaction state. The field's `filled` reflects its restored value. Canceling the reset preserves
errors and field state. A new `errors` object assigned during reset takes effect independently.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

/**
 * Native `reset` clears external errors and every field's interaction state (touched/dirty/focused),
 * and re-syncs `filled` to the reverted values — no manual wiring. Submit a wrong code to surface a
 * server error, then press Reset; submit `1234` to pass.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reset-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            (reset)="verified.set(false)"
            rdxFormRoot
        >
            <div [class]="field" name="code" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Access code</label>
                <input [class]="input" name="code" rdxFieldControl placeholder="1234" />
                <p #codeError="rdxFieldError" [class]="error" rdxFieldError>{{ codeError.messages().join(' ') }}</p>
            </div>

            <div class="flex gap-2">
                <button [class]="submit" type="submit">Verify</button>
                <button [class]="reset" type="reset">Reset</button>
            </div>
            @if (verified()) {
                <p class="text-muted-foreground text-sm">Code accepted.</p>
            }
        </form>
    `
})
export class FormResetExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;
    protected readonly reset = formReset;

    readonly errors = signal<RdxFormErrors | null>(null);
    readonly verified = signal(false);

    onSubmit(event: RdxFormSubmitEvent): void {
        if (String(event.values['code'] ?? '') === '1234') {
            this.errors.set(null);
            this.verified.set(true);
        } else {
            this.verified.set(false);
            this.errors.set({ code: 'Invalid code, try 1234.' });
        }
    }
}
```

[Example setup](../guides/styling.md#copy-an-example-into-your-app)

## Example files

#### `./form.shared.ts`

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
export const formLabel = 'text-foreground text-sm font-medium';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-9 w-full px-3 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-9 px-4 self-start';
export const formReset = 'demo-button demo-button-outline h-9 px-4';
```
