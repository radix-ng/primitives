import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideCheck } from '@lucide/angular';
import { RdxButtonDirective } from '@radix-ng/primitives/button';
import {
    RdxCheckboxButtonDirective,
    RdxCheckboxIndicatorDirective,
    RdxCheckboxInputDirective,
    RdxCheckboxRootDirective
} from '@radix-ng/primitives/checkbox';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { cn, demoButton, demoCheckbox, demoInput } from '../../storybook/styles';
import { RdxInputDirective } from '../src/input.directive';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'input-signup-form-example',
    imports: [
        ReactiveFormsModule,
        LucideCheck,
        RdxButtonDirective,
        RdxCheckboxRootDirective,
        RdxCheckboxButtonDirective,
        RdxCheckboxIndicatorDirective,
        RdxCheckboxInputDirective,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxInputDirective
    ],
    template: `
        <form class="flex w-[24rem] flex-col gap-5" [formGroup]="form" (ngSubmit)="submit()">
            <div class="grid grid-cols-2 gap-3">
                <div
                    class="flex flex-col gap-2"
                    [invalid]="firstName.invalid && (firstName.dirty || firstName.touched)"
                    [dirty]="firstName.dirty"
                    [touched]="firstName.touched"
                    rdxFieldRoot
                    required
                >
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>First name</label>
                    <input [class]="inputClass" rdxInput autocomplete="given-name" formControlName="firstName" />
                    <p class="text-destructive text-sm" rdxFieldError>Enter your first name.</p>
                </div>

                <div
                    class="flex flex-col gap-2"
                    [invalid]="lastName.invalid && (lastName.dirty || lastName.touched)"
                    [dirty]="lastName.dirty"
                    [touched]="lastName.touched"
                    rdxFieldRoot
                    required
                >
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Last name</label>
                    <input [class]="inputClass" rdxInput autocomplete="family-name" formControlName="lastName" />
                    <p class="text-destructive text-sm" rdxFieldError>Enter your last name.</p>
                </div>
            </div>

            <div
                class="flex flex-col gap-2"
                [invalid]="email.invalid && (email.dirty || email.touched)"
                [dirty]="email.dirty"
                [touched]="email.touched"
                rdxFieldRoot
                required
            >
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
                <input
                    [class]="inputClass"
                    rdxInput
                    type="email"
                    autocomplete="email"
                    placeholder="name@example.com"
                    formControlName="email"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>
                    Used for product updates and account recovery.
                </p>
                <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
            </div>

            <div
                class="flex flex-col gap-2"
                [invalid]="password.invalid && (password.dirty || password.touched)"
                [dirty]="password.dirty"
                [touched]="password.touched"
                rdxFieldRoot
                required
            >
                <label class="text-foreground text-sm font-medium" rdxFieldLabel>Password</label>
                <input
                    [class]="inputClass"
                    rdxInput
                    type="password"
                    autocomplete="new-password"
                    formControlName="password"
                />
                <p class="text-muted-foreground text-sm" rdxFieldDescription>Use at least 8 characters.</p>
                <p class="text-destructive text-sm" rdxFieldError>Password must be at least 8 characters.</p>
            </div>

            <div class="flex items-start gap-3">
                <div rdxCheckboxRoot required formControlName="terms">
                    <button id="signup-terms" [class]="checkbox.button" type="button" rdxCheckboxButton>
                        <svg [class]="checkbox.indicator" rdxCheckboxIndicator size="16" lucideCheck />
                    </button>
                    <input rdxCheckboxInput />
                </div>

                <label class="text-foreground text-sm leading-6" for="signup-terms">
                    I agree to receive onboarding emails and accept the workspace terms.
                </label>
            </div>

            <button [class]="submitClass" rdxButton type="submit">Create workspace</button>
        </form>
    `
})
export class InputSignupFormExample {
    readonly form = new FormGroup({
        firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
        email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
        password: new FormControl('', {
            nonNullable: true,
            validators: [Validators.required, Validators.minLength(8)]
        }),
        terms: new FormControl(false, { nonNullable: true, validators: [Validators.requiredTrue] })
    });

    protected readonly inputClass = demoInput;
    protected readonly checkbox = demoCheckbox;
    protected readonly submitClass = cn(demoButton.base, demoButton.primary, demoButton.size.md, 'w-full');

    protected get firstName() {
        return this.form.controls.firstName;
    }

    protected get lastName() {
        return this.form.controls.lastName;
    }

    protected get email() {
        return this.form.controls.email;
    }

    protected get password() {
        return this.form.controls.password;
    }

    submit(): void {
        this.form.markAllAsTouched();
    }
}
