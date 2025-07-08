// Implementation from https://github.com/unovue/radix-vue

import { Directive, ElementRef, Injector, afterNextRender, computed, effect, inject, input } from '@angular/core';
import { RdxVisuallyHiddenInputBubbleDirective } from './visually-hidden-input-bubble.directive';
import { VisuallyHidden } from './visually-hidden.directive';

@Directive({
    selector: '[rdxVisuallyHiddenInput]',
    hostDirectives: [
        {
            directive: RdxVisuallyHiddenInputBubbleDirective,
            inputs: [
                'feature: feature',
                'name: name ',
                'value: value',
                'checked: checked',
                'disabled: disabled',
                'required: required'
            ]
        }
    ]
})
export class RdxVisuallyHiddenInputDirective<T> {
    private readonly elementRef = inject(ElementRef);
    private readonly injector = inject(Injector);

    readonly name = input<string | undefined>(undefined);
    readonly value = input<T | string>();
    readonly checked = input<boolean | undefined>(undefined);
    readonly required = input<boolean | undefined>(undefined);
    readonly disabled = input<boolean | undefined>(undefined);
    readonly feature = input<VisuallyHidden>('fully-hidden');

    readonly parsedValue = computed(() => {
        const value = this.value();
        const name = this.name();

        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            return [{ name, value }];
        }

        if (Array.isArray(value)) {
            return value.flatMap((obj, index) => {
                if (typeof obj === 'object') {
                    return Object.entries(obj).map(([key, val]) => ({
                        name: `[${name}][${index}][${key}]`,
                        value: val
                    }));
                } else {
                    return { name: `[${name}][${index}]`, value: obj };
                }
            });
        }

        if (value !== null && typeof value === 'object') {
            return Object.entries(value).map(([key, val]) => ({
                name: `[${name}][${key}]`,
                value: val
            }));
        }

        return [];
    });

    constructor() {
        afterNextRender(() => {
            effect(
                () => {
                    const parsedValues = this.parsedValue();

                    parsedValues.forEach((parsed) => {
                        const inputElement = this.elementRef.nativeElement;
                        inputElement.setAttribute('name', parsed.name);
                        inputElement.setAttribute('value', parsed.value);
                    });
                },
                { injector: this.injector }
            );
        });
    }
}
