import {
    booleanAttribute,
    Directive,
    HostListener,
    Input,
    OnChanges,
    SimpleChanges
} from '@angular/core';

import {
    injectRovingFocusItem,
    RdxRovingFocusItemDirective
} from '@radix-ng/primitives/roving-focus';

import { RdxToggleGroupButtonToken } from './toggle-group-button.token';
import { injectToggleGroup } from './toggle-group.token';

@Directive({
    selector: 'button[rdxToggleGroupButton]',
    standalone: true,
    hostDirectives: [RdxRovingFocusItemDirective],
    providers: [{ provide: RdxToggleGroupButtonToken, useExisting: RdxToggleGroupButtonDirective }],
    host: {
        role: 'radio',
        '[attr.aria-checked]': 'checked',
        '[attr.aria-disabled]': 'disabled || toggleGroup.disabled',
        '[attr.data-disabled]': 'disabled || toggleGroup.disabled',
        '[attr.data-state]': 'checked ? "on" : "off"',
        '[attr.data-orientation]': 'toggleGroup.orientation'
    }
})
export class RdxToggleGroupButtonDirective implements OnChanges {
    /**
     * Access the toggle group.
     */
    protected readonly toggleGroup = injectToggleGroup();

    /**
     * Access the roving focus item.
     */
    private readonly rovingFocusItem = injectRovingFocusItem();

    /**
     * The value of this toggle button.
     */
    @Input({ alias: 'rdxToggleGroupButtonValue', required: true }) value!: string;

    /**
     * Whether this toggle button is disabled.
     * @default false
     */
    @Input({ alias: 'rdxToggleGroupButtonDisabled', transform: booleanAttribute }) disabled = false;

    /**
     * Whether this toggle button is checked.
     */
    protected get checked(): boolean {
        return this.toggleGroup.isSelected(this.value);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('disabled' in changes) {
            this.updateDisabled();
        }
    }

    /**
     * Toggle this toggle button.
     */
    @HostListener('click')
    toggle(): void {
        if (this.disabled) {
            return;
        }

        this.toggleGroup.toggle(this.value);
    }

    /**
     * Ensure the disabled state is propagated to the roving focus item.
     * @internal
     */
    updateDisabled(): void {
        this.rovingFocusItem.disabled = this.disabled || this.toggleGroup.disabled;
    }
}
