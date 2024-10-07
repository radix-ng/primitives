import { Directive, Inject, inject, InjectionToken, Input, Optional } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { RdxFormDirective } from './form.component';

export const FORM_FIELD_CONTEXT = new InjectionToken<RdxFormFieldDirective>('FORM_FIELD_CONTEXT');

@Directive({
    selector: '[rdxFormField]',
    standalone: true,
    providers: [
        {
            provide: FORM_FIELD_CONTEXT,
            useExisting: RdxFormFieldDirective
        }
    ],
    host: {
        '[attr.data-state]': 'getState()'
    }
})
export class RdxFormFieldDirective {
    @Input() name!: string;

    private form = inject(RdxFormDirective);

    get formGroup(): FormGroup {
        return this.form.form;
    }

    getState(): string {
        const control = this.formGroup.get(this.name);
        if (control?.invalid && (control.dirty || control.touched)) {
            return 'invalid';
        }
        return 'valid';
    }
}

@Directive({
    selector: '[rdxFormControl]',
    standalone: true,
    host: {
        '[attr.aria-invalid]': 'getState() === "invalid"',
        '[attr.aria-describedby]': 'formField?.name + "-message"',
        '[attr.data-state]': 'getState()'
    }
})
export class RdxFormControlDirective {
    constructor(@Optional() @Inject(FORM_FIELD_CONTEXT) protected formField: RdxFormFieldDirective) {}

    getState(): string {
        if (!this.formField) return 'valid';
        return this.formField.getState();
    }
}

@Directive({
    selector: '[rdxFormLabel]',
    standalone: true,
    hostDirectives: [
        {
            directive: RdxLabelDirective,
            inputs: ['htmlFor']
        }
    ],
    host: {}
})
export class RdxFormLabelDirective {}
