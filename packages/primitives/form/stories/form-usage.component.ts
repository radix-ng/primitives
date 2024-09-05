import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFormDirective, ValidityMatcher } from '../src/form.component';
import { RdxFormControlDirective, RdxFormFieldDirective, RdxFormLabelDirective } from '../src/form.directives';

@Component({
    selector: 'rdx-form-usage',
    standalone: true,
    imports: [
        CommonModule,
        RdxFormFieldDirective,
        RdxFormControlDirective,
        RdxFormLabelDirective,
        ReactiveFormsModule,
        RdxFormDirective
    ],
    styleUrls: ['form-usage.styles.css'],
    template: `
        <form [formGroup]="form" (submit)="onSubmit()" (reset)="onReset()" rdxForm>
            <div class="FormField" rdxFormField name="email">
                <div style="display: flex; align-items: baseline; justify-content:space-between">
                    <label class="FormLabel" rdxFormLabel htmlFor="email">Email</label>
                    <span
                        class="FormMessage"
                        *ngIf="form.get('email')?.hasError('required') && form.get('email')?.touched"
                    >
                        {{ customMessages['email'] }}
                    </span>
                </div>
                <input class="Input" id="email" rdxFormControl formControlName="email" type="email" />
            </div>
            <div class="FormField" rdxFormField name="password">
                <div style="display: flex; align-items: baseline; justify-content:space-between">
                    <label class="FormLabel" rdxFormLabel htmlFor="password">Password</label>
                    <span
                        class="FormMessage"
                        *ngIf="form.get('password')?.hasError('required') && form.get('password')?.touched"
                    >
                        {{ customMessages['required'] }}
                    </span>
                </div>
                <input
                    class="Input"
                    id="password"
                    autocomplete="on"
                    rdxFormControl
                    formControlName="password"
                    type="password"
                />
            </div>
            <div class="FormField" rdxFormField name="confirmPassword">
                <label class="FormLabel" rdxFormLabel htmlFor="confirmPassword">Confirm Password</label>
                <input
                    class="Input"
                    id="confirmPassword"
                    autocomplete="on"
                    rdxFormControl
                    formControlName="confirmPassword"
                    type="confirmPassword"
                />
            </div>
            <div class="ButtonGroup">
                <button class="Button" type="submit">Submit</button>
                <button class="Button" type="reset">Reset</button>
            </div>
        </form>
    `
})
export class FormUsageComponent {
    private readonly fb = inject(FormBuilder);

    form = this.fb.group({
        email: ['test@mail.com', [Validators.required, Validators.email]],
        password: ['', [Validators.required]],
        confirmPassword: ['', [Validators.required]]
    });

    validityMatchers: ValidityMatcher[] = [
        {
            matcher: (value) => value.password === value.confirmPassword,
            message: 'Passwords do not match'
        }
    ];

    customMessages = {
        required: 'This field is absolutely necessary!',
        email: 'Please provide a valid email address.'
    };

    onSubmit() {
        console.log('Form submitted:', this.form.value);
    }

    onInvalid(errors: string[]) {
        console.log('Form is invalid. Errors:', errors);
    }

    onReset() {
        console.log('Form has been reset');
    }
}
