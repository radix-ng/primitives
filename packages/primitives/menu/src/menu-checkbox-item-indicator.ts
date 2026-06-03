import { injectRdxMenuCheckboxItemContext } from './menu-checkbox-item';
import { isIndeterminate } from './menu-utils';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';

/**
 * Renders when the parent checkbox item is checked or indeterminate.
 * Set `keepMounted` to keep the element in the DOM when unchecked (enables CSS animations).
 */
@Directive({
    selector: '[rdxMenuCheckboxItemIndicator]',
    exportAs: 'rdxMenuCheckboxItemIndicator',
    host: {
        '[attr.data-checked]': 'checked() === true ? "" : undefined',
        '[attr.data-unchecked]': 'checked() === false ? "" : undefined',
        '[attr.data-indeterminate]': 'isIndeterminate(checked()) ? "" : undefined',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null'
    }
})
export class RdxMenuCheckboxItemIndicator {
    private readonly itemContext = injectRdxMenuCheckboxItemContext();

    /** Keep the indicator in the DOM when unchecked so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly checked = this.itemContext.checked;
    protected readonly isIndeterminate = isIndeterminate;
    protected readonly isVisible = computed(
        () => isIndeterminate(this.itemContext.checked()) || this.itemContext.checked() === true
    );
}
