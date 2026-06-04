import { Directive } from '@angular/core';
import { injectMeterRootContext } from './meter-root.directive';

/**
 * Displays the visual meter fill.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterIndicator]',
    exportAs: 'rdxMeterIndicator',
    host: {
        '[attr.data-value]': 'meter.valueState()',
        '[attr.data-min]': 'meter.minState()',
        '[attr.data-max]': 'meter.maxState()',
        '[attr.data-percent]': 'meter.percentageState()'
    }
})
export class RdxMeterIndicatorDirective {
    protected readonly meter = injectMeterRootContext()!;
}
