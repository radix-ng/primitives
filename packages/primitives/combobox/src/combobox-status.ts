import { Directive } from '@angular/core';

/**
 * A polite live region for async status (loading, result counts) announced without moving focus.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxStatus]',
    exportAs: 'rdxComboboxStatus',
    host: {
        role: 'status',
        'aria-live': 'polite'
    }
})
export class RdxComboboxStatus {}
