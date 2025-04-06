import { computed, Directive, input } from '@angular/core';
import { DateValue, getLocalTimeZone, isSameMonth, isToday } from '@internationalized/date';

@Directive({
    selector: '[rdxCalendarCellTrigger]',
    exportAs: 'rdxCalendarCellTrigger',
    host: {
        role: 'button',
        '[attr.data-value]': 'day().toString()',
        '[attr.data-today]': 'isDateToday() ? "" : undefined',
        '[attr.data-outside-view]': 'isOutsideView() ? "" : undefined'
    }
})
export class RdxCalendarCellTriggerDirective {
    readonly day = input<DateValue>();

    readonly month = input<DateValue>();

    readonly dayValue = computed(() => this.day()?.day.toLocaleString());

    readonly isDateToday = computed(() => {
        return isToday(<DateValue>this.day(), getLocalTimeZone());
    });

    readonly isOutsideView = computed(() => {
        return !isSameMonth(<DateValue>this.day(), <DateValue>this.month());
    });
}
