import { Directive, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

export interface ValidityState {
    valid: boolean;
    invalid: boolean;
    pending: boolean;
    errors: Record<string, any> | null;
    touched: boolean;
    untouched: boolean;
    dirty: boolean;
    pristine: boolean;
}

export interface ValidityMatcher {
    matcher: (value: any, formGroup: FormGroup) => boolean;
    message: string;
}

export const DEFAULT_BUILT_IN_MESSAGES: Record<string, string> = {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    minlength: 'This field is too short',
    maxlength: 'This field is too long',
    pattern: 'This field is invalid'
};

export const DEFAULT_INVALID_MESSAGE = 'This form is invalid';

@Directive({
    selector: 'form[rdxForm]',
    standalone: true,
    host: {
        '[attr.aria-invalid]': 'form.invalid',
        '[attr.data-state]': 'form.invalid ? "invalid" : "valid"',
        '(submit)': 'onSubmit($event)',
        '(reset)': 'onReset($event)'
    }
})
export class RdxFormDirective implements OnInit {
    private fb = inject(FormBuilder);

    @Input() form!: FormGroup;
    @Output() submitForm = new EventEmitter<any>();

    ngOnInit() {
        if (!this.form) {
            this.form = this.fb.group({});
        }
    }

    onSubmit(event: Event) {
        event.preventDefault();
        if (this.form.valid) {
            this.submitForm.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }

    onReset(event: Event) {
        event.preventDefault();
        this.form.reset();
    }

    getFieldState(fieldName: string) {
        const control = this.form.get(fieldName);
        return {
            invalid: control?.invalid,
            isDirty: control?.dirty,
            isTouched: control?.touched,
            value: control?.value
        };
    }
}
