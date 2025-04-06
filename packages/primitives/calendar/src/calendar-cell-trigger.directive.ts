import { computed, Directive, input } from '@angular/core';
import { DateValue, getLocalTimeZone, isSameMonth, isToday } from '@internationalized/date';
import { injectCalendarRootContext } from './сalendar-сontext.token';

@Directive({
    selector: '[rdxCalendarCellTrigger]',
    exportAs: 'rdxCalendarCellTrigger',
    host: {
        role: 'button',
        '[attr.data-value]': 'day().toString()',
        '[attr.data-today]': 'isDateToday() ? "" : undefined',
        '[attr.data-outside-view]': 'isOutsideView() ? "" : undefined',
        '[attr.data-selected]': 'isSelectedDate() ? "" : undefined',

        '(click)': 'onClick()'
    }
})
export class RdxCalendarCellTriggerDirective {
    private readonly rootContext = injectCalendarRootContext();

    readonly day = input<DateValue>();

    readonly month = input<DateValue>();

    readonly dayValue = computed(() => this.day()?.day.toLocaleString());

    readonly isDateToday = computed(() => {
        return isToday(<DateValue>this.day(), getLocalTimeZone());
    });

    readonly isSelectedDate = computed(() => this.rootContext.isDateSelected(<DateValue>this.day()));

    readonly isOutsideView = computed(() => {
        return !isSameMonth(<DateValue>this.day(), <DateValue>this.month());
    });

    protected onClick() {
        this.changeDate(this.day()!);
    }

    changeDate(date: DateValue) {
        this.rootContext.onDateChange(date);
    }
}
