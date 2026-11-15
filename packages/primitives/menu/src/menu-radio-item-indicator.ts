import { booleanAttribute, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { useMenuIndicatorTransition } from './menu-indicator-transition';
import { injectRdxMenuRadioItemContext } from './menu-radio-item';

/**
 * Renders when the parent radio item is selected.
 * The consumer-owned host hides after its CSS exit finishes. `keepMounted` leaves it displayed
 * while unselected, so the consumer can style both settled states.
 */
@Directive({
    selector: '[rdxMenuRadioItemIndicator]',
    exportAs: 'rdxMenuRadioItemIndicator',
    host: {
        'aria-hidden': 'true',
        '[attr.data-checked]': 'checked() ? "" : undefined',
        '[attr.data-unchecked]': 'checked() ? undefined : ""',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-starting-style]': 'transition.status() === "starting" ? "" : undefined',
        '[attr.data-ending-style]': 'transition.status() === "ending" ? "" : undefined',
        '[style.display]': '!keepMounted() && !transition.present() ? "none" : null'
    }
})
export class RdxMenuRadioItemIndicator {
    private readonly itemContext = injectRdxMenuRadioItemContext();

    /** Leave the host displayed when unselected. Exit animations also finish when false. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly checked = this.itemContext.checked;
    protected readonly disabled = this.itemContext.disabled;
    protected readonly transition = useMenuIndicatorTransition(this.checked);
}
