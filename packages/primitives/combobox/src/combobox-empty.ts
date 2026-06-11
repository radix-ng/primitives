import { Directive } from '@angular/core';
import { injectComboboxRootContext } from './combobox-root';

/**
 * Shown only when no items match the current query.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxEmpty]',
    exportAs: 'rdxComboboxEmpty',
    host: {
        role: 'presentation',
        '[hidden]': 'rootContext.visibleCount() > 0'
    }
})
export class RdxComboboxEmpty {
    protected readonly rootContext = injectComboboxRootContext();
}
