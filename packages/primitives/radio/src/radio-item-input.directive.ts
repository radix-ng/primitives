import { computed, Directive, effect, ElementRef, inject } from '@angular/core';
import { RdxVisuallyHiddenDirective } from '@radix-ng/primitives/visually-hidden';
import { injectRadioItem } from './radio-item.directive';
import { RDX_RADIO_GROUP } from './radio-tokens';

@Directive({
    selector: 'input[rdxRadioItemInput]',
    exportAs: 'rdxRadioItemInput',
    hostDirectives: [{ directive: RdxVisuallyHiddenDirective, inputs: ['feature'] }],
    host: {
        type: 'radio',
        tabindex: '-1',
        'aria-hidden': 'true',
        '[attr.name]': 'name()',
        '[attr.form]': 'form()',
        '[attr.required]': 'required() ? "" : undefined',
        '[attr.disabled]': 'disabled() ? "" : undefined',
        '[attr.checked]': 'checked() ? "" : undefined',
        '[checked]': 'checked()',
        '[attr.value]': 'value()',
        '[style]': `{
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 0,
          margin: 0,
          inset: 0,
          transform: 'translateX(-100%)',
        }`
    }
})
export class RdxRadioItemInputDirective {
    private readonly radioItem = injectRadioItem();
    private readonly radioGroup = inject(RDX_RADIO_GROUP);
    private readonly input = inject<ElementRef<HTMLInputElement>>(ElementRef).nativeElement;

    readonly name = computed(() => this.radioGroup.name());
    readonly form = computed(() => this.radioGroup.form());
    readonly value = computed(() => this.radioItem.value() || undefined);
    readonly checked = computed(() => this.radioItem.checkedState());
    readonly required = computed(() => this.radioItem.requiredState());
    readonly disabled = computed(() => this.radioItem.disabledState());

    constructor() {
        let isInitial = true;

        effect(() => {
            const checked = this.checked();

            if (isInitial) {
                isInitial = false;
                return;
            }

            if (checked) {
                this.input.dispatchEvent(new Event('input', { bubbles: true }));
                this.input.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    }
}
