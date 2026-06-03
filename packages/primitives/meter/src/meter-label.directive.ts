import { injectMeterRootContext } from './meter-root.directive';
import { Directive } from '@angular/core';

/**
 * Labels the meter.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterLabel]',
    exportAs: 'rdxMeterLabel',
    host: {
        '[attr.id]': 'meter.labelId()'
    }
})
export class RdxMeterLabelDirective {
    protected readonly meter = injectMeterRootContext();
}
