import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRdxMenuCheckboxItemContext } from './menu-checkbox-item';
import { getCheckedState, isIndeterminate } from './menu-utils';

/**
 * Renders when the parent checkbox item is checked or indeterminate.
 * Set `keepMounted` to keep the element in the DOM when unchecked (enables CSS animations).
 */
@Directive({
    selector: '[rdxMenuCheckboxItemIndicator]',
    exportAs: 'rdxMenuCheckboxItemIndicator',
    host: {
        '[attr.data-state]': 'dataState()',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null'
    }
})
export class RdxMenuCheckboxItemIndicator {
    private readonly itemContext = injectRdxMenuCheckboxItemContext()!;

    /** Keep the indicator in the DOM when unchecked so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly dataState = computed(() => getCheckedState(this.itemContext.checked()));
    protected readonly isVisible = computed(
        () => isIndeterminate(this.itemContext.checked()) || this.itemContext.checked() === true
    );
}
