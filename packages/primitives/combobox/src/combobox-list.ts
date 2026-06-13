import { Directive } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * The listbox container for options. Carries the id referenced by the input's `aria-controls`, and
 * exposes `data-empty` while no options match the current query (Base UI's `ComboboxList` empty state).
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxList]',
    exportAs: 'rdxComboboxList',
    host: {
        role: 'listbox',
        '[attr.id]': 'rootContext.listId',
        '[attr.aria-multiselectable]': 'rootContext.multiple() ? "true" : undefined',
        '[attr.data-empty]': 'rootContext.visibleCount() === 0 ? "" : undefined'
    }
})
export class RdxComboboxList {
    protected readonly rootContext = injectComboboxRootContext();
}
