import { Directive, inject } from '@angular/core';
import { RdxAutocompleteRoot } from './autocomplete-root';

/**
 * The listbox (or grid) container for suggestions. Carries the id referenced by the input's
 * `aria-controls`, and switches its role to `grid` when the root has `grid` enabled.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxAutocompleteList]',
    exportAs: 'rdxAutocompleteList',
    host: {
        '[attr.role]': 'root.grid() ? "grid" : "listbox"',
        '[attr.id]': 'root.listId'
    }
})
export class RdxAutocompleteList {
    protected readonly root = inject(RdxAutocompleteRoot);
}
