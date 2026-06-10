import { Directive } from '@angular/core';
import { injectMeterRootContext } from './meter-root.directive';

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
