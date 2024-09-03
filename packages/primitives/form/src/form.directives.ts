import { Directive, ElementRef, inject, Input, OnInit } from '@angular/core';
import { ControlContainer, NgControl } from '@angular/forms';
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
    private readonly controlContainer = inject(ControlContainer);

    @Input() name!: string;
    @Input() serverInvalid = false;

    isValid() {
        return !this.serverInvalid && this.control?.valid && (this.control?.touched || this.control?.dirty);
    }

    isInvalid() {
        return this.serverInvalid || (this.control?.invalid && (this.control?.touched || this.control?.dirty));
    }

    private get control() {
        return this.controlContainer?.control?.get(this.name);
    }
}

@Directive({
    selector: '[rdxFormControl]',
    standalone: true,
    host: {
        '[disabled]': 'isDisabled()',
        '[attr.data-invalid]': 'isInvalid()',
        '[attr.aria-invalid]': 'isInvalid()',
        '[attr.aria-describedby]': 'getDescribedBy()',
        // disable default browser behaviour of showing built-in error message on hover
        '[title]': '""'
    }
})
export class RdxFormControlDirective implements OnInit {
    private readonly context = inject(FORM_CONTEXT);
    private readonly elementRef = inject(ElementRef);
    private readonly ngControl = inject(NgControl, { optional: true });

    @Input() id?: string;

    ngOnInit() {
        if (!this.ngControl) {
            throw new Error('FormControlDirective must be used with a form control');
        }

        if (!this.elementRef.nativeElement.id) {
            const controlName = this.ngControl.name !== null ? this.ngControl.name.toString() : '';
            this.elementRef.nativeElement.id = this.context.generateId(controlName);
        }
    }

    isDisabled() {
        return this.context.disabled;
    }

    isInvalid() {
        const validityState = this.context.getValidityState(this.elementRef.nativeElement.id);
        return validityState.invalid && (validityState.touched || validityState.dirty);
    }

    getDescribedBy() {
        return `${this.elementRef.nativeElement.id}-description`;
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
