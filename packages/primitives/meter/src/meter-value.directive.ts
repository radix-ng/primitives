import { Directive } from '@angular/core';
import { injectMeterRootContext } from './meter-root.directive';

/**
 * Displays the formatted meter value.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterValue]',
    exportAs: 'rdxMeterValue',
    host: {
        '[attr.id]': 'meter.valueId()',
        '[textContent]': 'meter.formattedValueState()',
        '[attr.data-value]': 'meter.valueState()',
        '[attr.data-min]': 'meter.minState()',
        '[attr.data-max]': 'meter.maxState()',
        '[attr.data-percent]': 'meter.percentageState()'
    }
})
export class RdxMeterValueDirective {
    protected readonly meter = injectMeterRootContext()!;
}
