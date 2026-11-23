# Form — Server errors with clear-on-edit

> One example from the [Form](../components/form.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.4.0` — if the installed version differs, verify the API against the installed package.

The submit handler simulates a backend rejecting a taken email (try `taken@example.com`); the returned
error maps onto the field by `name` and clears when you edit it.

> Bind `errors` to a **stable reference** — a `signal`/property you reassign, not a getter or method
> that returns a fresh object every change detection. Form tracks which fields the user has cleared
> against the `errors` reference; a new reference resets that set (by design — the server "spoke again"),
> so an always-fresh reference would resurrect cleared errors on the next change-detection pass.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '@radix-ng/primitives/form';

/**
 * Server-error mapping with clear-on-edit. The submit handler simulates a backend that rejects a
 * taken email; the returned error maps onto the matching field by `name`. Editing the field clears
 * its error, and binding `(onClearErrors)` back into `errors` keeps the controlled map in sync.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-default-example',
    imports: [RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form
            class="flex w-64 max-w-full flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            rdxFormRoot
        >
            <div class="flex flex-col items-start gap-1" name="email" rdxFieldRoot>
                <label class="text-foreground text-sm font-bold" rdxFieldLabel>Email</label>
                <input
                    class="demo-input h-8 w-full px-2"
                    name="email"
                    type="email"
                    rdxFieldControl
                    placeholder="name@example.com"
                />
                <p class="text-destructive text-sm" #emailError="rdxFieldError" rdxFieldError>
                    {{ emailError.messages().join(' ') }}
                </p>
            </div>

            <button class="demo-button demo-button-outline h-8 px-3" type="submit">Create account</button>
            @if (success()) {
                <p class="text-muted-foreground text-sm">Account created for {{ success() }}.</p>
            }
        </form>
    `
})
export class FormDefaultExample {
    readonly errors = signal<RdxFormErrors | null>(null);
    readonly success = signal<string | null>(null);

    onSubmit(event: RdxFormSubmitEvent): void {
        const email = String(event.values['email'] ?? '');
        // Simulated server response: this address is already taken.
        if (email === 'taken@example.com') {
            this.success.set(null);
            this.errors.set({ email: 'This email is already registered.' });
        } else {
            this.errors.set(null);
            this.success.set(email);
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
export const formLabel = 'text-foreground text-sm font-bold';
export const formError = 'text-destructive text-sm';
export const formInput =
    'demo-input h-8 w-full px-2 data-[invalid]:border-destructive data-[invalid]:ring-destructive/30';
export const formSubmit = 'demo-button demo-button-primary h-8 px-3 self-start';
export const formReset = 'demo-button demo-button-outline h-8 px-3';
```
