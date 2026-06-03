import { injectCheckboxRootContext } from './checkbox-root';
import { booleanAttribute, computed, Directive, input } from '@angular/core';
import { BooleanInput } from '@radix-ng/primitives/core';

@Directive({
    selector: '[rdxCheckboxIndicator]',
    host: {
        '[attr.data-checked]': 'rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-unchecked]': '!rootContext.checked() && !rootContext.indeterminate() ? "" : undefined',
        '[attr.data-indeterminate]': 'rootContext.indeterminate() ? "" : undefined',
        '[attr.data-disabled]': 'rootContext.disabled() ? "" : undefined',
        '[attr.data-readonly]': 'rootContext.readonly() ? "" : undefined',
        '[attr.data-required]': 'rootContext.required() ? "" : undefined',
        '[attr.data-starting-style]': 'isVisible() ? "" : undefined',
        '[attr.data-ending-style]': '!isVisible() ? "" : undefined',
        '[style.display]': '!keepMounted() && !isVisible() ? "none" : null',
        '[style.pointer-events]': '"none"'
    }
})
export class RdxCheckboxIndicatorDirective {
    protected readonly rootContext = injectCheckboxRootContext();

    /** Keep the indicator in the DOM when unchecked so CSS exit animations can play. */
    readonly keepMounted = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    protected readonly isVisible = computed(() => this.rootContext.checked() || this.rootContext.indeterminate());
}
