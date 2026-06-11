import { Directive } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { injectComboboxGroupContext } from './combobox-group';

/**
 * Accessible label for a {@link RdxComboboxGroup}. Wires itself up via `aria-labelledby`.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxComboboxGroupLabel]',
    exportAs: 'rdxComboboxGroupLabel',
    host: {
        '[attr.id]': 'id'
    }
})
export class RdxComboboxGroupLabel {
    private readonly groupContext = injectComboboxGroupContext();

    readonly id = injectId('rdx-combobox-group-label-');

    constructor() {
        this.groupContext.labelId.set(this.id);
    }
}
