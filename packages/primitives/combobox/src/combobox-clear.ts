import { computed, Directive } from '@angular/core';
import { RdxDismissableLayerBranch } from '@radix-ng/primitives/dismissable-layer';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Clears the current selection and the input text. Hidden when there is nothing to clear.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxComboboxClear]',
    exportAs: 'rdxComboboxClear',
    hostDirectives: [RdxDismissableLayerBranch],
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Clear',
        '[hidden]': 'isEmpty()',
        '[attr.disabled]': 'rootContext.disabledState() ? "" : undefined',
        '(click)': 'onClick()'
    }
})
export class RdxComboboxClear {
    protected readonly rootContext = injectComboboxRootContext();

    protected readonly isEmpty = computed(() => {
        const value = this.rootContext.value();
        if (Array.isArray(value)) {
            return value.length === 0;
        }
        return value === null || value === undefined;
    });

    onClick(): void {
        this.rootContext.clearSelection();
    }
}
