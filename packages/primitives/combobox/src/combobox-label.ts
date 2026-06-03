import { injectComboboxRootContext } from './combobox-root';
import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

/**
 * An accessible label for the combobox. Registers its id so the input (and trigger) reference it via
 * `aria-labelledby`.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxLabel]',
    exportAs: 'rdxComboboxLabel',
    host: {
        '[attr.id]': 'id'
    }
})
export class RdxComboboxLabel {
    private readonly rootContext = injectComboboxRootContext();

    readonly id = injectId('rdx-combobox-label-');

    constructor() {
        this.rootContext.setLabelId(this.id);
        inject(DestroyRef).onDestroy(() => this.rootContext.setLabelId(undefined));
    }
}
