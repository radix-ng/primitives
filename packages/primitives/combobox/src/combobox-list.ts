import { Directive } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * The listbox container for options. Carries the id referenced by the input's `aria-controls`.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxList]',
    exportAs: 'rdxComboboxList',
    host: {
        role: 'listbox',
        '[attr.id]': 'rootContext.listId',
        '[attr.aria-multiselectable]': 'rootContext.multiple() ? "true" : undefined'
    }
})
export class RdxComboboxList {
    protected readonly rootContext = injectComboboxRootContext();
}
