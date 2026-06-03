import { RdxFieldControl } from '../src/field-control';
import { RdxFieldDescription } from '../src/field-description';
import { RdxFieldError } from '../src/field-error';
import { RdxFieldLabel } from '../src/field-label';
import { RdxFieldRoot } from '../src/field-root';
import { fieldDescription, fieldError, fieldInputInvalid, fieldLabel, fieldSubmitButton } from './field.shared';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'field-reactive-forms-example',
    imports: [ReactiveFormsModule, RdxFieldRoot, RdxFieldLabel, RdxFieldControl, RdxFieldDescription, RdxFieldError],
    template: `
        <form class="flex w-80 flex-col gap-3" [formGroup]="form" (ngSubmit)="submit()">
            <div
                class="flex flex-col gap-2"
                rdxFieldRoot
                required
                [invalid]="email.invalid && (email.touched || submitted())"
                [dirty]="email.dirty"
                [touched]="email.touched"
                [disabled]="email.disabled"
            >
                <label rdxFieldLabel [class]="labelClass">Email</label>
                <input rdxFieldControl type="email" formControlName="email" [class]="inputClass" />
                <p rdxFieldDescription [class]="descriptionClass">Use the email connected to your account.</p>
                <p rdxFieldError [class]="errorClass">
                    @if (email.hasError('required')) {
                        Email is required.
                    } @else {
                        Enter a valid email address.
                    }
                </p>
            </div>

            <button type="submit" [class]="buttonClass">Submit</button>
        </form>
    `
})
export class FieldReactiveFormsExample {
    protected readonly inputClass = fieldInputInvalid;
    protected readonly buttonClass = fieldSubmitButton;
    protected readonly labelClass = fieldLabel;
    protected readonly descriptionClass = fieldDescription;
    protected readonly errorClass = fieldError;

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
