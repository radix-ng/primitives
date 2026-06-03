import { RdxFormErrors, RdxFormRoot, RdxFormSubmitEvent } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

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
            rdxFormRoot
            [errors]="errors()"
            (onFormSubmit)="onSubmit($event)"
            (onClearErrors)="errors.set($event)"
        >
            <div name="email" rdxFieldRoot [class]="field">
                <label rdxFieldLabel [class]="label">Email</label>
                <input name="email" type="email" rdxFieldControl placeholder="name@example.com" [class]="input" />
                <p #emailError="rdxFieldError" rdxFieldError [class]="error">{{ emailError.messages().join(' ') }}</p>
            </div>

            <button type="submit" [class]="submit">Create account</button>
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
