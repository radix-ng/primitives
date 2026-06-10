import { Directive, input } from '@angular/core';
import { injectFieldRootContext } from './field-root';

let labelId = 0;

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
    readonly id = input(`rdx-field-label-${labelId++}`);

    readonly htmlFor = () => this.rootContext.controlId();

    protected readonly dataAttr = attr;
}
