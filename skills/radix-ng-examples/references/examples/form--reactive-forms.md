# Form — Reactive Forms

> One example from the [Form](../components/form.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

The complete recipe composes Form → Fieldset → Field → Control with `rdxNgControlField`, async
validation, error-key matching, server errors that clear on edit, submit reveal/focus, and reset.
Reactive Forms remains the value/validation source of truth; Form never stops `(ngSubmit)` propagation.
It is intentionally paired with the
[Signal Forms account recipe](?path=/docs/primitives-signal-forms--docs#one-recipe-two-angular-apis):
the UI and behavior stay the same while Angular's binding, validation, submission, and reset APIs
change.

```typescript
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { RdxFormErrors, RdxFormRoot } from '../index';
import {
    type AccountFormValue,
    formError,
    formField,
    formInput,
    formLabel,
    formReset,
    formSubmit,
    simulateFormRequest,
    takenEmail,
    unavailableUsername
} from './form.shared';

/**
 * Complete Reactive Forms lifecycle: NgControl → Field state, async validation, server errors that
 * clear on edit, submit reveal/focus, and Angular-owned reset.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reactive-forms-example',
    imports: [
        ReactiveFormsModule,
        RdxFormRoot,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxInputDirective,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form
            class="flex w-full max-w-96 flex-col gap-4"
            [formGroup]="form"
            [errors]="serverErrors()"
            (onClearErrors)="clearServerErrors($event)"
            (ngSubmit)="submit()"
            (reset)="resetFeedback()"
            rdxFormRoot
        >
            <fieldset
                class="border-border flex flex-col gap-4 rounded-md border p-4"
                [disabled]="submitting()"
                rdxFieldsetRoot
            >
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Account</legend>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Username</label>
                    <input
                        [class]="input"
                        autocomplete="username"
                        formControlName="username"
                        rdxInput
                        rdxNgControlField
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>admin</code>
                        to preview asynchronous validation.
                    </p>
                    @if (username.pending) {
                        <p class="text-muted-foreground text-sm" role="status">Checking availability…</p>
                    }
                    <p [class]="error" match="required" rdxFieldError>Username is required.</p>
                    <p [class]="error" match="minlength" rdxFieldError>Use at least 3 characters.</p>
                    <p #usernameError="rdxFieldError" [class]="error" match="unavailable" rdxFieldError>
                        {{ usernameError.messages().join(' ') }}
                    </p>
                </div>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Email</label>
                    <input
                        [class]="input"
                        autocomplete="email"
                        type="email"
                        formControlName="email"
                        rdxInput
                        rdxNgControlField
                    />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        Use
                        <code>taken@example.com</code>
                        to preview a server error.
                    </p>
                    <p #emailError="rdxFieldError" [class]="error" rdxFieldError>
                        @if (email.hasError('required')) {
                            Email is required.
                        } @else if (email.hasError('email')) {
                            Enter a valid email address.
                        } @else {
                            {{ emailError.messages().join(' ') }}
                        }
                    </p>
                </div>
            </fieldset>

            <div class="flex items-center gap-2">
                <button [class]="submitButton" [disabled]="submitting()" type="submit">
                    {{ submitting() ? 'Submitting…' : 'Submit' }}
                </button>
                <button [class]="resetButton" [disabled]="submitting()" type="reset">Reset</button>
            </div>

            <p class="text-muted-foreground text-xs" aria-live="polite">
                {{ form.dirty ? 'Dirty' : 'Pristine' }} ·
                {{ form.touched ? 'Touched' : 'Untouched' }}
            </p>

            @if (savedAccount(); as account) {
                <p class="text-foreground text-sm" role="status">Submitted {{ account.username }}.</p>
            }
        </form>
    `
})
export class FormReactiveFormsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submitButton = formSubmit;
    protected readonly resetButton = formReset;

    private readonly formBuilder = inject(FormBuilder);
    private readonly usernameAvailability: AsyncValidatorFn = async (control) => {
        await simulateFormRequest();
        return String(control.value).trim().toLowerCase() === unavailableUsername
            ? { unavailable: { message: 'That username is unavailable.' } }
            : null;
    };

    readonly serverErrors = signal<RdxFormErrors>({});
    readonly savedAccount = signal<AccountFormValue | null>(null);
    readonly submitting = signal(false);
    readonly form = this.formBuilder.nonNullable.group({
        username: this.formBuilder.nonNullable.control('', {
            validators: [Validators.required, Validators.minLength(3)],
            asyncValidators: [this.usernameAvailability]
        }),
        email: this.formBuilder.nonNullable.control('', [Validators.required, Validators.email])
    });

    protected get username() {
        return this.form.controls.username;
    }

    protected get email() {
        return this.form.controls.email;
    }

    protected clearServerErrors(errors: RdxFormErrors): void {
        this.serverErrors.set(errors);
        this.savedAccount.set(null);
    }

    protected async submit(): Promise<void> {
        if (this.form.pending || this.form.invalid) {
            this.form.markAllAsTouched();
            this.savedAccount.set(null);
            return;
        }

        if (this.submitting()) {
            return;
        }

        this.submitting.set(true);
        this.savedAccount.set(null);

        try {
            await simulateFormRequest();

            if (this.email.value === takenEmail) {
                this.serverErrors.set({ email: 'That email already has an account.' });
                return;
            }

            this.serverErrors.set({});
            this.savedAccount.set(this.form.getRawValue());
        } finally {
            this.submitting.set(false);
        }
    }

    protected resetFeedback(): void {
        this.serverErrors.set({});
        this.savedAccount.set(null);
    }
}
```
