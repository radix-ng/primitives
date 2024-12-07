import { computed, Directive, inject, input } from '@angular/core';
import { RdxRadioItemDirective } from '@radix-ng/primitives/radio';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';

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
    private readonly radioItem = inject(RdxRadioItemDirective);

    readonly name = input<string>();
    readonly value = computed(() => this.radioItem.value() || undefined);
    readonly checked = computed(() => this.radioItem.checked || undefined);
    readonly required = input<boolean | undefined>(this.radioItem.required());
    readonly disabled = input<boolean | undefined>(this.radioItem.disabled());
}
