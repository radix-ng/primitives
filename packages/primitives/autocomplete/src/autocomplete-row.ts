import { Directive } from '@angular/core';

/**
 * A row in a grid-layout autocomplete list. Groups the items in one row so the root can navigate by
 * row (ArrowUp / ArrowDown) and within a row (ArrowLeft / ArrowRight). Only meaningful when the root
 * has `grid` enabled; the root resolves an item's row from its nearest `[rdxAutocompleteRow]` ancestor.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteRow]',
    exportAs: 'rdxAutocompleteRow',
    host: {
        role: 'row'
    }
})
export class RdxAutocompleteRow {}
