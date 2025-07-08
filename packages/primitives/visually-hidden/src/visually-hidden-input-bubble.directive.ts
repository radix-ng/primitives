import { computed, Directive, effect, ElementRef, inject, input, linkedSignal } from '@angular/core';
import { watch } from '@radix-ng/primitives/core';
import { RdxVisuallyHiddenDirective, VisuallyHidden } from './visually-hidden.directive';

/**
 *
 */
@Directive({
    selector: 'input[rdxVisuallyHiddenInputBubble]',
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenDirective,
            inputs: ['feature: feature']
        }
    ],
    host: {
        '[attr.name]': 'name()',
        '[attr.required]': 'required()',
        '[attr.disabled]': 'disabled()',
        '[attr.checked]': 'checked()',
        '[value]': 'computedValue()'
    }
})
export class RdxVisuallyHiddenInputBubbleDirective<T> {
    private readonly elementRef = inject(ElementRef);
    private readonly visuallyHidden = inject(RdxVisuallyHiddenDirective);

    readonly feature = input<VisuallyHidden>('fully-hidden');

    readonly name = input<string | undefined>(undefined);
    readonly value = input<T | string | null>();
    readonly checked = input<boolean | undefined>(undefined);
    readonly required = input<boolean | undefined>(undefined);
    readonly disabled = input<boolean | undefined>(undefined);

    protected readonly computedFeature = linkedSignal(this.feature);
    protected readonly computedValue = linkedSignal(this.value);

    readonly valueState = computed(() => this.checked() ?? this.computedValue());

    constructor() {
        watch([this.valueState], ([cur]) => {
            if (!this.elementRef.nativeElement) {
                return;
            }

            const input = this.elementRef.nativeElement as HTMLInputElement;
            const inputProto = window.HTMLInputElement.prototype;
            const descriptor = Object.getOwnPropertyDescriptor(inputProto, 'value') as PropertyDescriptor;
            const setValue = descriptor.set;

            if (setValue) {
                const inputEvent = new Event('input', { bubbles: true });
                const changeEvent = new Event('change', { bubbles: true });
                setValue.call(input, cur);
                input.dispatchEvent(inputEvent);
                input.dispatchEvent(changeEvent);
            }
        });

        effect(() => {
            this.visuallyHidden.setFeature(this.computedFeature());
        });
    }

    setValue(value: string) {
        this.computedValue.set(value);
    }

    setFeature(feature: VisuallyHidden) {
        this.computedFeature.set(feature);
    }
}
