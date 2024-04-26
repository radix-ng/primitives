import { booleanAttribute, Directive, HostListener, Input } from '@angular/core';

// eslint-disable-next-line @nx/enforce-module-boundaries
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';

import { injectRadioGroup } from './radio-group.token';
import { RdxRadioItemToken } from './radio-item.token';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

@Directive({
    selector: '[rdxRadioItem]',
    standalone: true,
    hostDirectives: [RdxRovingFocusItemDirective],
    providers: [{ provide: RdxRadioItemToken, useExisting: RdxRadioItemDirective }],
    host: {
        type: 'button',
        role: 'radio',
        '[attr.id]': 'id',
        '[attr.aria-checked]': 'radioGroup.value === value ? "true" : "false"',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'radioGroup.value === value ? "checked" : "unchecked"'
    }
})
export class RdxRadioItemDirective {
    /**
     * Access the radio group.
     */
    protected readonly radioGroup = injectRadioGroup();

    /** The unique ID for the radio button. */
    @Input() id: string | undefined;

    /**
     * The value of the radio item.
     */
    @Input({ required: true }) value!: string;

    /**
     * Whether the radio item is disabled.
     * @default false
     */
    @Input({ transform: booleanAttribute }) disabled = false;

    private readonly uniqueId: string = `rdx-radio-${++nextUniqueId}`;

    constructor() {
        this.id = this.uniqueId;
    }

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
