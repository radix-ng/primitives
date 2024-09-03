import { Directive, ElementRef, inject, Input } from '@angular/core';
import { RdxLabelDirective } from '@radix-ng/primitives/label';
import { FORM_CONTEXT } from './form.component';

@Directive({
    selector: '[rdxFormField]',
    standalone: true,
    host: {
        '[attr.data-valid]': 'isValid()',
        '[attr.data-invalid]': 'isInvalid()'
    }
})
export class RdxFormFieldDirective {
    @Input() name!: string;

    private context = inject(FORM_CONTEXT);

    isValid() {
        const validityState = this.context.getValidityState(this.name);
        return validityState.valid && (validityState.touched || validityState.dirty);
    }

    isInvalid() {
        const validityState = this.context.getValidityState(this.name);
        return validityState.invalid && (validityState.touched || validityState.dirty);
    }
}

@Directive({
    selector: '[rdxFormControl]',
    standalone: true,
    host: {
        '[disabled]': 'isDisabled()',
        '[attr.data-invalid]': 'isInvalid()',
        '[attr.aria-invalid]': 'undefined',
        // disable default browser behaviour of showing built-in error message on hover
        '[title]': '""'
    }
})
export class RdxFormControlDirective {
    private readonly context = inject(FORM_CONTEXT);
    private readonly elementRef = inject(ElementRef);

    @Input() name!: string;

    isDisabled() {
        return this.context.disabled;
    }

    isInvalid() {
        const validityState = this.context.getValidityState(this.elementRef.nativeElement.id);
        return validityState.invalid && (validityState.touched || validityState.dirty);
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
