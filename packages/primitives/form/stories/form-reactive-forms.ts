import { RdxFormRoot } from '../index';
import { formError, formField, formInput, formLabel, formSubmit } from './form.shared';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFieldControl, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '@radix-ng/primitives/field';

/**
 * Reactive Forms owns validity; `RdxFormRoot` adds the aggregate `data-*` attributes and submit/reset
 * handling on the same `<form>`. Use `(ngSubmit)` as the source of truth here — `RdxFormRoot` never
 * stops propagation, so both fire — and map each `FormControl`'s validity into the Field's `invalid`.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'form-reactive-forms-example',
    imports: [ReactiveFormsModule, RdxFormRoot, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldError],
    template: `
        <form class="flex w-80 flex-col gap-4" rdxFormRoot [formGroup]="form" (ngSubmit)="submit()">
            <div
                name="email"
                rdxFieldRoot
                required
                [class]="field"
                [invalid]="email.invalid && (email.touched || submitted())"
                [touched]="email.touched"
                [dirty]="email.dirty"
            >
                <label rdxFieldLabel [class]="label">Email</label>
                <input type="email" formControlName="email" rdxFieldControl [class]="input" />
                <p rdxFieldError [class]="error">
                    @if (email.hasError('required')) {
                        Email is required.
                    } @else {
                        Enter a valid email address.
                    }
                </p>
            </div>

            <button type="submit" [class]="submitButton">Submit</button>
        </form>
    `
})
export class FormReactiveFormsExample {
    protected readonly field = formField;
    protected readonly label = formLabel;
    protected readonly input = formInput;
    protected readonly error = formError;
    protected readonly submitButton = formSubmit;

    private readonly formBuilder = inject(FormBuilder);

    readonly submitted = signal(false);
    readonly form = this.formBuilder.group({
        email: this.formBuilder.control('', [Validators.required, Validators.email])
    });

    get email() {
        return this.form.controls.email;
    }

    submit(): void {
        this.submitted.set(true);
        this.form.markAllAsTouched();
    }
}
