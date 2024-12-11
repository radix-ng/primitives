import { computed, Directive, input } from '@angular/core';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';
import { injectRadioItem } from './radio-item.directive';

@Directive({
    selector: '[rdxRadioItemInput]',
    exportAs: 'rdxRadioItemInput',
    standalone: true,
    hostDirectives: [
        { directive: RdxVisuallyHiddenDirective, inputs: ['feature'] }],
    host: {
        type: 'radio',
        '[attr.name]': 'name()',
        '[attr.required]': 'required()',
        '[attr.disabled]': 'disabled() ? disabled() : undefined',
        '[attr.checked]': 'checked()',
        '[value]': 'value()'
    }
})
export class RdxRadioItemInputDirective {
    private readonly radioItem = injectRadioItem();

    readonly name = input<string>();
    readonly value = computed(() => this.radioItem.value() || undefined);
    readonly checked = computed(() => this.radioItem.checkedState() || undefined);
    readonly required = input<boolean | undefined>(this.radioItem.required());
    readonly disabled = input<boolean | undefined>(this.radioItem.disabled());
}
