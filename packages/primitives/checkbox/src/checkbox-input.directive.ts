import { computed, Directive, input } from '@angular/core';
import { RdxVisuallyHiddenInputDirective } from '@radix-ng/primitives/visually-hidden';
import { injectCheckbox } from './checkbox.token';

@Directive({
    standalone: true,
    selector: 'input[rdxCheckboxInput]',
    hostDirectives: [{ directive: RdxVisuallyHiddenInputDirective, inputs: ['feature: "fully-hidden"'] }],
    host: {
        type: 'checkbox',
        tabindex: '-1',
        '[checked]': 'checkbox.checked',
        '[disabled]': 'checkbox.disabled',
        '[required]': 'checkbox.required',
        '[attr.id]': 'elementId()',
        '[attr.aria-hidden]': 'true',
        '[attr.aria-checked]': 'checkbox.indeterminate ? "mixed" : checkbox.checked',
        '[attr.aria-required]': 'checkbox.required ? "" : null',
        '[attr.data-state]': 'checkbox.state',
        '[attr.data-disabled]': 'checkbox.disabled ? "" : null',
        '[attr.value]': 'value()'
    }
})
export class RdxCheckboxInputDirective {
    protected readonly checkbox = injectCheckbox();

    readonly id = input<string>();

    protected readonly elementId = computed(() => (this.id() ? this.id() : `rdx-checkbox-${this.id()}`));

    protected readonly value = computed(() => {
        const state = this.checkbox.state;
        if (state === 'indeterminate') {
            return '';
        }

        return state ? 'on' : 'off';
    });
}
