import { Directive, input } from '@angular/core';
import { injectId, rdxCheckLabelElement } from '@radix-ng/primitives/core';
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

    readonly htmlFor = () => this.rootContext.controlId();

    constructor() {
        rdxCheckLabelElement('rdxFieldLabel', 'field/unassociated-label', 'components/field');
    }

    protected readonly dataAttr = attr;
}
