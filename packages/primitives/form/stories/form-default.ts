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
