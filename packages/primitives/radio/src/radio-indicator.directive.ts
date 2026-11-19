import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';
import { injectRadioItemContext } from './radio-item.directive';

@Directive({
    selector: '[rdxRadioIndicator]',
    exportAs: 'rdxRadioIndicator',
    host: {
        '[attr.data-checked]': 'itemContext.checkedState() ? "" : undefined',
        '[attr.data-unchecked]': '!itemContext.checkedState() ? "" : undefined',
        '[attr.data-disabled]': 'itemContext.disabledState() ? "" : undefined',
        '[attr.data-readonly]': 'itemContext.readonlyState() ? "" : undefined',
        '[attr.data-required]': 'itemContext.requiredState() ? "" : undefined',
        '[attr.data-valid]': 'itemContext.field?.validState() === true ? "" : undefined',
        '[attr.data-invalid]': 'itemContext.field?.validState() === false ? "" : undefined',
        '[attr.data-touched]': 'itemContext.field?.touchedState() ? "" : undefined',
        '[attr.data-dirty]': 'itemContext.field?.dirtyState() ? "" : undefined',
        '[attr.data-filled]': 'itemContext.field?.filledState() ? "" : undefined',
        '[attr.data-focused]': 'itemContext.field?.focusedState() ? "" : undefined',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxRadioIndicatorDirective {
    protected readonly itemContext = injectRadioItemContext();

    /** Keep the indicator in the DOM when unchecked so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly isVisible = computed(() => this.itemContext.checkedState());
}
