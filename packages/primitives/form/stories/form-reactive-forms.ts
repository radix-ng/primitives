import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AsyncValidatorFn, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    RdxFieldControl,
    RdxFieldDescription,
    RdxFieldError,
    RdxFieldLabel,
    RdxFieldRoot,
    RdxNgControlField
} from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxFormErrors, RdxFormRoot } from '../index';
import { formError, formField, formInput, formLabel, formReset, formSubmit } from './form.shared';

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
        RdxFieldControl,
        RdxFieldDescription,
        RdxFieldError,
        RdxNgControlField
    ],
    template: `
        <form
            class="flex w-96 flex-col gap-4"
            [formGroup]="form"
            [errors]="serverErrors()"
            (onClearErrors)="clearServerErrors($event)"
            (ngSubmit)="submit()"
            (reset)="successMessage.set('')"
            rdxFormRoot
        >
            <fieldset class="border-border space-y-4 rounded-md border p-4" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Account</legend>

                <div [class]="field" rdxFieldRoot required>
                    <label [class]="label" rdxFieldLabel>Username</label>
                    <input
                        [class]="input"
                        autocomplete="username"
                        formControlName="username"
                        rdxFieldControl
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
                        rdxFieldControl
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

            <div class="flex gap-2">
                <button [class]="submitButton" type="submit">Submit</button>
                <button [class]="resetButton" type="reset">Reset</button>
            </div>

            @if (successMessage()) {
                <p class="text-foreground text-sm" role="status">{{ successMessage() }}</p>
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
        await new Promise((resolve) => setTimeout(resolve, 500));
        return String(control.value).trim().toLowerCase() === 'admin'
            ? { unavailable: { message: 'That username is unavailable.' } }
            : null;
    };

    readonly serverErrors = signal<RdxFormErrors>({});
    readonly successMessage = signal('');
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
        this.successMessage.set('');
    }

    protected submit(): void {
        if (this.form.pending || this.form.invalid) {
            this.form.markAllAsTouched();
            this.successMessage.set('');
            return;
        }

        if (this.email.value === 'taken@example.com') {
            this.serverErrors.set({ email: 'That email already has an account.' });
            this.successMessage.set('');
            return;
        }

        this.serverErrors.set({});
        this.successMessage.set(`Submitted ${this.username.value}.`);
    }
}
