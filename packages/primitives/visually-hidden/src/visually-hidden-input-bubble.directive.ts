import { Directive, effect, ElementRef, inject, input } from '@angular/core';
import { RdxVisuallyHiddenDirective } from './visually-hidden.directive';

/**
 * <input rdxVisuallyHiddenInputBubble [name]="'testInput'" [value]="'Hello'" [checked]="true" />
 */
@Directive({
    selector: '[rdxVisuallyHiddenInputBubble]',
    standalone: true,
    hostDirectives: [RdxVisuallyHiddenDirective],
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

    constructor() {
        effect(() => {
            this.updateInputValue();
        });
    }

    protected onChange() {
        this.updateInputValue();
    }

    private updateInputValue() {
        const inputElement = this.elementRef.nativeElement;

        if (this.checked() !== undefined) {
            inputElement.checked = this.checked()!;
        } else {
            inputElement.value = String(this.value());
        }

        const inputEvent = new Event('input', { bubbles: true });
        const changeEvent = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(inputEvent);
        inputElement.dispatchEvent(changeEvent);
    }
}
