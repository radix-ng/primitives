import { computed, Directive, input } from '@angular/core';
import { injectMeterRootContext, MeterValueFormatter } from './meter-root.directive';

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
        'aria-hidden': 'true',
        '[textContent]': 'valueText()',
        '[attr.data-value]': 'meter.valueState()',
        '[attr.data-min]': 'meter.minState()',
        '[attr.data-max]': 'meter.maxState()',
        '[attr.data-percent]': 'meter.percentageState()'
    }
})
export class RdxMeterValueDirective {
    protected readonly meter = injectMeterRootContext();

    /** Formats visible text from the formatted value and the original supplied number. */
    readonly getValueText = input<MeterValueFormatter>();

    protected readonly valueText = computed(() => {
        const formatted = this.meter.formattedValueState();
        return this.getValueText()?.(formatted, this.meter.value()) ?? formatted;
    });
}
