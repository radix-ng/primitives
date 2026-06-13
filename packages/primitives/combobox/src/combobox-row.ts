import { Directive } from '@angular/core';

/**
 * A row in a grid-layout combobox list. Groups the items in one row so the root can navigate by row
 * (`ArrowUp` / `ArrowDown`) and within a row (`ArrowLeft` / `ArrowRight`). Only meaningful when the
 * root has `grid` enabled; the root resolves an item's row from its nearest `[rdxComboboxRow]` ancestor.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxRow]',
    exportAs: 'rdxComboboxRow',
    host: {
        role: 'row'
    }
})
export class RdxComboboxRow {}
