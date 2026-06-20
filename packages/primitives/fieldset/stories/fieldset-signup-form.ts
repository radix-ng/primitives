import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';
import { RdxFieldsetLegend, RdxFieldsetRoot } from '@radix-ng/primitives/fieldset';
import { RdxInputDirective } from '@radix-ng/primitives/input';
import { cn, demoButton, demoInput } from '../../storybook/styles';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'fieldset-signup-form-example',
    imports: [
        ReactiveFormsModule,
        RdxFieldsetRoot,
        RdxFieldsetLegend,
        RdxFieldRoot,
        RdxFieldLabel,
        RdxFieldDescription,
        RdxFieldError,
        RdxInputDirective
    ],
    template: `
        <form class="w-96 space-y-5" [formGroup]="form" (ngSubmit)="submit()">
            <fieldset class="border-border space-y-4 rounded-md border p-4" [disabled]="submitting" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                    Account details
                </legend>

                <div class="space-y-2" [invalid]="isInvalid('firstName')" [disabled]="submitting" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>First name</label>
                    <input [class]="inputClass" rdxInput autocomplete="given-name" formControlName="firstName" />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>Used in your workspace profile.</p>
                    <p class="text-destructive text-sm" rdxFieldError>First name is required.</p>
                </div>

                <div class="space-y-2" [invalid]="isInvalid('email')" [disabled]="submitting" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Email</label>
                    <input [class]="inputClass" rdxInput autocomplete="email" formControlName="email" type="email" />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>
                        We'll send the invite confirmation here.
                    </p>
                    <p class="text-destructive text-sm" rdxFieldError>Enter a valid email address.</p>
                </div>

                <div class="flex items-start gap-3 pt-1">
                    <input
                        class="border-border accent-primary mt-1 size-4 rounded disabled:opacity-50"
                        id="product-updates"
                        formControlName="updates"
                        type="checkbox"
                    />
                    <div class="space-y-1">
                        <label class="text-foreground text-sm font-medium" for="product-updates">Product updates</label>
                        <p class="text-muted-foreground text-sm">
                            Receive occasional release notes and migration tips.
                        </p>
                    </div>
                </div>
            </fieldset>

            <button [class]="cn(button.base, button.primary, button.size.md)" type="submit">
                {{ submitting ? 'Submitting...' : 'Create account' }}
            </button>

            @if (submittedEmail) {
                <p class="text-muted-foreground text-sm">Submitted {{ submittedEmail }}</p>
            }
        </form>
    `
})
export class FieldsetSignupFormExample {
    private readonly formBuilder = inject(FormBuilder);

    protected readonly cn = cn;
    protected readonly button = demoButton;
    protected readonly inputClass = demoInput;

    protected submitting = false;
    protected submittedEmail = '';

    protected readonly form = this.formBuilder.nonNullable.group({
        firstName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        updates: [true]
    });

    protected isInvalid(controlName: 'firstName' | 'email'): boolean {
        const control = this.form.controls[controlName];
        return control.invalid && (control.touched || control.dirty);
    }

    protected submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.submitting = true;
        this.submittedEmail = this.form.controls.email.value;
    }
}
