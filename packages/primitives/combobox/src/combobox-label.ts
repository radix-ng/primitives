import { Directive } from '@angular/core';
import { injectId, useLabel } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from '@radix-ng/primitives/field';
import { injectComboboxRootContext } from './combobox-root';

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
        '[attr.id]': 'id',
        '(mousedown)': 'label.onMouseDown($event)',
        '(pointerdown)': 'label.onPointerDown($event)',
        '(click)': 'label.onClick($event)'
    }
})
export class RdxComboboxLabel {
    private readonly rootContext = injectComboboxRootContext();
    private readonly field = injectFieldRootContext(true);

    readonly id = injectId('rdx-combobox-label-');

    protected readonly label = useLabel({
        id: () => this.id,
        registries: this.field ? [this.rootContext, this.field] : [this.rootContext],
        control: this.rootContext.labelControlElement
    });
}
