import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { injectRdxMenuRadioItemContext } from './menu-radio-item';
import { getCheckedState } from './menu-utils';

/**
 * Renders when the parent radio item is selected.
 * Set `keepMounted` to keep the element in the DOM when unselected (enables CSS animations).
 */
@Directive({
    selector: '[rdxMenuRadioItemIndicator]',
    exportAs: 'rdxMenuRadioItemIndicator',
    host: {
        '[attr.data-state]': 'dataState()',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null'
    }
})
export class RdxMenuRadioItemIndicator {
    private readonly itemContext = injectRdxMenuRadioItemContext()!;

    /** Keep the indicator in the DOM when unselected so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly dataState = computed(() => getCheckedState(this.itemContext.checked()));
    protected readonly isVisible = computed(() => this.itemContext.checked() === true);
}
