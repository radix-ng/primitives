import { Directive } from '@angular/core';
import { injectMeterRootContext } from './meter-root.directive';

/**
 * Contains the visual meter indicator.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterTrack]',
    exportAs: 'rdxMeterTrack',
    host: {
        '[attr.data-value]': 'meter.valueState()',
        '[attr.data-min]': 'meter.minState()',
        '[attr.data-max]': 'meter.maxState()',
        '[attr.data-percent]': 'meter.percentageState()'
    }
})
export class RdxMeterTrackDirective {
    protected readonly meter = injectMeterRootContext()!;
}
