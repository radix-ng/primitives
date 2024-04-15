import { Directive, HostListener, Input, booleanAttribute } from '@angular/core';
import { injectRadioGroup } from './radio-group.token';
import { RadioItemToken } from './radio-item.token';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { RovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

@Directive({
    selector: 'button[rdxRadioItem]',
    standalone: true,
    hostDirectives: [RovingFocusItemDirective],
    providers: [{ provide: RadioItemToken, useExisting: RadioItemDirective }],
    host: {
        type: 'button',
        role: 'radio',
        '[attr.aria-checked]': 'radioGroup.value === value ? "true" : "false"',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'radioGroup.value === value ? "checked" : "unchecked"'
    }
})
export class RadioItemDirective {
    /**
     * Access the radio group.
     */
    protected readonly radioGroup = injectRadioGroup();

    /**
     * The value of the radio item.
     */
    @Input({ required: true }) value!: string;

    /**
     * Whether the radio item is disabled.
     * @default false
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    /**
     * Handle keydown events.
     * @param event The keydown event.
     * @internal
     */
    @HostListener('keydown', ['$event'])
    protected onKeydown(event: KeyboardEvent): void {
        // According to WAI ARIA, radio groups don't activate items on enter keypress
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }

    /**
     * When the item receives focus, select it.
     * @internal
     */
    @HostListener('focus')
    protected onFocus(): void {
        this.radioGroup.select(this.value);
    }

    /**
     * When the item receives a click, select it.
     * @internal
     */
    @HostListener('click')
    protected onClick(): void {
        this.radioGroup.select(this.value);
    }
}
