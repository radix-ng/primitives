# Form — Server errors with clear-on-edit

> One example from the [Form](../components/form.md) docs — imports, anatomy, and the data-attribute styling contract live there.

> Generated from `@radix-ng/primitives@1.1.0` — if the installed version differs, verify the API against the installed package.

The submit handler simulates a backend rejecting a taken email (try `taken@example.com`); the returned
error maps onto the field by `name` and clears when you edit it.

> Bind `errors` to a **stable reference** — a `signal`/property you reassign, not a getter or method
> that returns a fresh object every change detection. Form tracks which fields the user has cleared
> against the `errors` reference; a new reference resets that set (by design — the server "spoke again"),
> so an always-fresh reference would resurrect cleared errors on the next change-detection pass.

```typescript
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';

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
            class="flex w-80 flex-col gap-4"
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
            rdxFormRoot
        >
            <div [class]="field" name="email" rdxFieldRoot>
                <label [class]="label" rdxFieldLabel>Email</label>
                <input [class]="input" name="email" type="email" rdxFieldControl placeholder="name@example.com" />
                <p #emailError="rdxFieldError" [class]="error" rdxFieldError>{{ emailError.messages().join(' ') }}</p>
            </div>

            <button [class]="submit" type="submit">Create account</button>
            @if (success()) {
                <p class="text-muted-foreground text-sm">Account created for {{ success() }}.</p>
            }
        </form>
    `
})
export class FormDefaultExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submit = formSubmit;

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
