import { Directive } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * The listbox container for options. Carries the id referenced by the input's `aria-controls`, exposes
 * `data-empty` while no options match the current query (Base UI's `ComboboxList` empty state), and
 * switches its `role` to `grid` when the root has `grid` enabled.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxList]',
    exportAs: 'rdxComboboxList',
    host: {
        // Base UI: the list is a programmatic focus target (`tabindex="-1"`) and selects the highlighted
        // item on Enter, for custom layouts that move focus onto the list rather than the input.
        tabindex: '-1',
        '[attr.role]': 'rootContext.grid() ? "grid" : "listbox"',
        '[attr.id]': 'rootContext.listId',
        '[attr.aria-multiselectable]': 'rootContext.multiple() ? "true" : undefined',
        '[attr.data-empty]': 'rootContext.visibleCount() === 0 ? "" : undefined',
        '(keydown)': 'onKeydown($event)'
    }
})
export class RdxComboboxList {
    protected readonly rootContext = injectComboboxRootContext();

    onKeydown(event: KeyboardEvent): void {
        if (event.key !== 'Enter') {
            return;
        }
        // Base UI bails early when disabled / read-only — don't swallow Enter (e.g. a form submit).
        if (this.rootContext.disabledState() || this.rootContext.readonly()) {
            return;
        }
        const hasHighlight = this.rootContext.virtualized()
            ? this.rootContext.highlightedIndex() >= 0
            : this.rootContext.highlightedItem() !== null;
        if (hasHighlight) {
            // Base UI `stopEvent`: also stop propagation so a parent keydown handler doesn't re-handle
            // Enter after the selection.
            event.preventDefault();
            event.stopPropagation();
            this.rootContext.selectHighlighted();
        }
    }
}
