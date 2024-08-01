import { booleanAttribute, Directive, inject, InjectionToken, Input } from '@angular/core';
import { injectRadioGroup } from './radio-root.directive';

export const RdxRadioItemToken = new InjectionToken<RdxRadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RdxRadioItemDirective {
    return inject(RdxRadioItemToken);
}

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

@Directive({
    selector: '[RadioItem]',
    exportAs: 'RadioItem',
    standalone: true,
    providers: [{ provide: RdxRadioItemToken, useExisting: RdxRadioItemDirective }],
    host: {
        type: 'button',
        role: 'radio',
        '[attr.id]': 'id',
        '[attr.aria-checked]': 'radioGroup.value === value ? "true" : "false"',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'radioGroup.value === value ? "checked" : "unchecked"',

        '(focus)': '_onFocus()',
        '(click)': '_onClick()',
        '(keydown)': '_onKeydown($event)'
    }
})
export class RdxRadioItemDirective {
    protected readonly radioGroup = injectRadioGroup();

    @Input() id = `rdx-radio-${++nextUniqueId}`;

    @Input({ required: true }) value!: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    _onKeydown(event: KeyboardEvent): void {
        // According to WAI ARIA, radio groups don't activate items on enter keypress
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    _onFocus(): void {
        this.radioGroup.select(this.value);
    }

    _onClick(): void {
        this.radioGroup.select(this.value);
    }
}
