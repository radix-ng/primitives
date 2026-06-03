import { RdxAutocompleteRoot } from './autocomplete-root';
import { Directive, inject } from '@angular/core';

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
        // Base UI: the list is a programmatic focus target (`tabindex="-1"`) and selects the highlighted
        // item on Enter, for custom layouts that move focus onto the list rather than the input.
        tabindex: '-1',
        '[attr.role]': 'root.grid() ? "grid" : "listbox"',
        '[attr.id]': 'root.listId',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxAutocompleteList {
    protected readonly root = inject(RdxAutocompleteRoot);

    onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        // Base UI bails early when disabled / read-only — don't swallow Enter (e.g. a form submit).
        if (this.root.disabledState() || this.root.readOnly()) {
            return;
        }
        const hasHighlight = this.root.virtualized()
            ? this.root.highlightedIndex() >= 0
            : this.root.highlightedItem() !== null;
        if (hasHighlight) {
            // Base UI `stopEvent`: also stop propagation so a parent keydown handler doesn't re-handle
            // Enter after the selection.
            event.preventDefault();
            event.stopPropagation();
            this.root.selectHighlighted();
        }
    }
}
