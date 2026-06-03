import { injectComboboxGroupContext } from './combobox-group';
import { DestroyRef, Directive, inject } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';

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
        // Clear the registration on unmount so the group doesn't reference a removed label's id.
        inject(DestroyRef).onDestroy(() => {
            if (this.groupContext.labelId() === this.id) {
                this.groupContext.labelId.set(undefined);
            }
        });
    }
}
