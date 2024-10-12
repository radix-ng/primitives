// Implementation from https://github.com/unovue/radix-vue

import { Directive, ElementRef, OnInit, computed, inject, input } from '@angular/core';
import { RdxVisuallyHiddenInputBubbleDirective } from './visually-hidden-input-bubble.directive';

@Directive({
    selector: '[rdxVisuallyHiddenInput]',
    standalone: true,
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
export class RdxVisuallyHiddenInputDirective<T> implements OnInit {
    private readonly elementRef = inject(ElementRef);

    readonly name = input<string>('');
    readonly value = input<T | null>(null);
    readonly checked = input<boolean | undefined>(undefined);
    readonly required = input<boolean | undefined>(undefined);
    readonly disabled = input<boolean | undefined>(undefined);
    readonly feature = input<'focusable' | 'fully-hidden'>('fully-hidden');

    readonly parsedValue = computed<{ name: string; value: any }[]>(() => {
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

    ngOnInit() {
        const parsedValues = this.parsedValue();

        parsedValues.forEach((parsed) => {
            const inputElement = this.elementRef.nativeElement;
            inputElement.setAttribute('name', parsed.name);
            inputElement.setAttribute('value', parsed.value);
        });
    }
}
