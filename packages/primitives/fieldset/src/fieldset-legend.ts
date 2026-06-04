import { Directive } from '@angular/core';
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
        '[attr.data-disabled]': 'dataAttr(rootContext.disabledState())'
    }
})
export class RdxFieldsetLegend {
    protected readonly rootContext = injectFieldsetRootContext()!;
    protected readonly dataAttr = attr;
}
