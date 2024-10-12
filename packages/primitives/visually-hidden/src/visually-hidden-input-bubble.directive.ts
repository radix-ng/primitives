import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxVisuallyHiddenDirective } from './visually-hidden.directive';

/**
 *
 */
@Directive({
    selector: '[rdxVisuallyHiddenInputBubble]',
    standalone: true,
    hostDirectives: [{ directive: RdxVisuallyHiddenDirective, inputs: ['feature: feature'] }],
    host: {
        '[attr.name]': 'name()',
        '[attr.required]': 'required()',
        '[attr.disabled]': 'disabled()',
        '[attr.checked]': 'checked()',
        '[value]': 'value()',
        '(change)': 'onChange()'
    }
})
export class RdxVisuallyHiddenInputBubbleDirective<T> {
    private readonly elementRef = inject(ElementRef);

    readonly name = input<string>('');
    readonly value = input<T | null>(null);
    readonly checked = input<boolean | undefined>(undefined);
    readonly required = input<boolean | undefined>(undefined);
    readonly disabled = input<boolean | undefined>(undefined);
    readonly feature = input<string>('fully-hidden');

    constructor() {
        effect(() => {
            this.updateInputValue();
        });
    }

    protected onChange() {
        this.updateInputValue();
    }

    private updateInputValue() {
        let valueChanged = false;
        let checkedChanged = false;

        // Check if the value has changed before applying the update
        const currentValue = this.inputElement.value;
        const newValue = String(this.value());

        if (currentValue !== newValue) {
            this.inputElement.value = newValue;
            valueChanged = true;
        }

        if (this.inputElement.type === 'checkbox' || this.inputElement.type === 'radio') {
            const currentChecked = this.inputElement.checked;
            const newChecked = !!this.checked();

            if (currentChecked !== newChecked) {
                this.inputElement.checked = newChecked;
                checkedChanged = true;
            }
        }

        if (valueChanged || checkedChanged) {
            this.dispatchInputEvents();
        }
    }

    private get inputElement() {
        return this.elementRef.nativeElement;
    }

    private dispatchInputEvents() {
        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });

        this.inputElement.dispatchEvent(inputEvent);
        this.inputElement.dispatchEvent(changeEvent);
    }
}
