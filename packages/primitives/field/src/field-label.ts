import { Directive, input } from '@angular/core';
import { injectId, rdxCheckLabelElement, useLabel } from '@radix-ng/primitives/core';
import { injectFieldRootContext } from './field-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Labels the field control.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxFieldLabel]',
    exportAs: 'rdxFieldLabel',
    host: {
        '[attr.id]': 'id()',
        '[attr.for]': 'htmlFor()',
        '(mousedown)': 'label.onMouseDown($event)',
        '(pointerdown)': 'label.onPointerDown($event)',
        '(click)': 'label.onClick($event)',
        '[attr.data-invalid]': 'dataAttr(rootContext.invalidState())',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())',
        '[attr.data-required]': 'dataAttr(rootContext.requiredState())'
    }
})
export class RdxFieldLabel {
    protected readonly rootContext = injectFieldRootContext();

    /**
     * Label id.
     *
     * @group Props
     */
    readonly id = input(injectId('rdx-field-label-'));

    protected readonly label = useLabel({
        id: this.id,
        controlId: this.rootContext.controlId,
        registries: [this.rootContext]
    });

    readonly htmlFor = this.label.htmlFor;

    constructor() {
        rdxCheckLabelElement('rdxFieldLabel', 'field/unassociated-label', 'components/field');
    }

    protected readonly dataAttr = attr;
}
