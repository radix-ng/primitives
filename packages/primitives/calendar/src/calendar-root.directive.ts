import { Directive, ElementRef, inject, signal } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { calendarRoot } from './calendar-root';

@Directive({
    selector: '[rdxCalendarRoot]',
    host: {
        role: 'application'
    }
})
export class RdxCalendarRootDirective {
    private readonly elementRef = inject(ElementRef);

    locale = signal<string>('en');

    placeholder = signal<DateValue>(new CalendarDate(2024, 8, 10));

    weekStartsOn = signal<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);

    fixedWeeks = signal<boolean>(false);

    numberOfMonths = signal<number>(1);

    minValue = signal<DateValue>(new CalendarDate(2024, 7, 10));

    maxValue = signal<DateValue>(new CalendarDate(2024, 7, 10));

    constructor() {
        const { formatter, month, weekdays, nextPage, visibleView } = calendarRoot({
            nextPage: signal(undefined),
            prevPage: signal(undefined),
            locale: this.locale,
            placeholder: this.placeholder,
            weekStartsOn: this.weekStartsOn,
            fixedWeeks: this.fixedWeeks,
            numberOfMonths: this.numberOfMonths,
            minValue: this.minValue,
            maxValue: this.maxValue,
            disabled: signal(true),
            calendarLabel: signal(undefined),
            pagedNavigation: signal(false),
            weekdayFormat: signal('narrow')
        });
    }
}
