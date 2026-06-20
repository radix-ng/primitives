import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxMenuRadioItemContext } from './menu-radio-item';

/**
 * Renders when the parent radio item is selected.
 * Set `keepMounted` to keep the element in the DOM when unselected (enables CSS animations).
 */
@Directive({
    selector: '[rdxMenuRadioItemIndicator]',
    exportAs: 'rdxMenuRadioItemIndicator',
    host: {
        '[attr.data-checked]': 'checked() ? "" : undefined',
        '[attr.data-unchecked]': 'checked() ? undefined : ""',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null'
    }
})
export class RdxMenuRadioItemIndicator {
    private readonly itemContext = injectRdxMenuRadioItemContext();

    /** Keep the indicator in the DOM when unselected so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly checked = this.itemContext.checked;
    protected readonly isVisible = computed(() => this.itemContext.checked() === true);
}
