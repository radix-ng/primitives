import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxMenuCheckboxItemContext } from './menu-checkbox-item';
import { useMenuIndicatorTransition } from './menu-indicator-transition';
import { isIndeterminate } from './menu-utils';

/**
 * Renders when the parent checkbox item is checked or indeterminate.
 * The consumer-owned host hides after its CSS exit finishes. `keepMounted` leaves it displayed
 * while unchecked, so the consumer can style both settled states.
 */
@Directive({
    selector: '[rdxMenuCheckboxItemIndicator]',
    exportAs: 'rdxMenuCheckboxItemIndicator',
    host: {
        'aria-hidden': 'true',
        '[attr.data-checked]': 'checked() === true ? "" : undefined',
        '[attr.data-unchecked]': 'checked() === false ? "" : undefined',
        '[attr.data-indeterminate]': 'isIndeterminate(checked()) ? "" : undefined',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-starting-style]': 'transition.status() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transition.status() === "ending" ? "" : undefined',
        '[style.display]': '!keepMounted() && !transition.present() ? "none" : null'
    }
})
export class RdxMenuCheckboxItemIndicator {
    private readonly itemContext = injectRdxMenuCheckboxItemContext();

    /** Leave the host displayed when unchecked. Exit animations also finish when false. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly checked = this.itemContext.checked;
    protected readonly disabled = this.itemContext.disabled;
    protected readonly isIndeterminate = isIndeterminate;
    protected readonly isVisible = computed(
        () => isIndeterminate(this.itemContext.checked()) || this.itemContext.checked() === true
    );
    protected readonly transition = useMenuIndicatorTransition(this.isVisible);
}
