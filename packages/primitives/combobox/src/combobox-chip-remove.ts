import { injectComboboxChipContext } from './combobox-chip';
import { injectComboboxRootContext } from './combobox-root';
import { Directive } from '@angular/core';

/**
 * Removes its chip's value from the selection, keeping focus in the input.
 *
 * @group Components
 */
@Directive({
    selector: 'button[rdxComboboxChipRemove]',
    exportAs: 'rdxComboboxChipRemove',
    host: {
        type: 'button',
        tabindex: '-1',
        'aria-label': 'Remove',
        '(click)': 'onClick()'
    }
})
export class RdxComboboxChipRemove {
    private readonly rootContext = injectComboboxRootContext();
    private readonly chipContext = injectComboboxChipContext();

    onClick(): void {
        this.rootContext.removeValue(this.chipContext.value());
        this.rootContext.focusInput();
    }
}
