import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RdxFormComponent, ValidityMatcher } from '../src/form.component';
import { RdxFormControlDirective, RdxFormFieldDirective, RdxFormLabelDirective } from '../src/form.directives';

@Component({
    selector: 'rdx-form-usage',
    standalone: true,
    imports: [
        CommonModule,
        RdxFormComponent,
        RdxFormFieldDirective,
        RdxFormControlDirective,
        RdxFormLabelDirective,
        ReactiveFormsModule
    ],
    styleUrls: ['form-usage.styles.css'],
    template: `
        <rdx-form
            [formGroup]="form"
            [validityMatchers]="validityMatchers"
            (onSubmit)="onSubmit()"
            (onInvalid)="onInvalid($event)"
            (onReset)="onReset()"
        >
            <div class="FormField" rdxFormField name="email">
                <label class="FormLabel" rdxFormLabel htmlFor="email">Email</label>
                <input class="Input" id="email" rdxFormControl formControlName="email" type="email" />
            </div>
            <div class="FormField" rdxFormField name="password">
                <label class="FormLabel" rdxFormLabel htmlFor="password">Password</label>
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
                <button class="Button" [disabled]="form.invalid" type="submit">Submit</button>
                <button class="Button" type="reset">Reset</button>
            </div>
        </rdx-form>
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
