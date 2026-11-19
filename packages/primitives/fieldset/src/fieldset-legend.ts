import { Directive, input } from '@angular/core';
import { injectId, useLabel } from '@radix-ng/primitives/core';
import { injectFieldsetRootContext } from './fieldset-root';

const attr = (value: boolean) => (value ? '' : undefined);

/**
 * Labels the fieldset.
 *
 * @group Components
 */
@Directive({
    selector: 'legend[rdxFieldsetLegend]',
    exportAs: 'rdxFieldsetLegend',
    host: {
        '[attr.id]': 'id()',
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())'
    }
})
export class RdxFieldsetLegend {
    /** ID that nested composite controls can use to reference this legend. */
    readonly id = input(injectId('rdx-fieldset-legend-'));

    protected readonly rootContext = injectFieldsetRootContext();
    protected readonly dataAttr = attr;

    constructor() {
        useLabel({ id: this.id, registries: [this.rootContext] });
    }
}
