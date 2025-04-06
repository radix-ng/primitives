import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, forwardRef, input, linkedSignal, model, signal } from '@angular/core';
import { CalendarDate, DateValue } from '@internationalized/date';
import { calendarRoot, calendarState } from './calendar-root';
import { CALENDAR_ROOT_CONTEXT } from './сalendar-сontext.token';

@Directive({
    selector: '[rdxCalendarRoot]',
    exportAs: 'rdxCalendarRoot',
    providers: [
        { provide: CALENDAR_ROOT_CONTEXT, useExisting: forwardRef(() => RdxCalendarRootDirective) }],
    host: {
        role: 'application'
    }
})
export class RdxCalendarRootDirective {
    readonly value = model<DateValue | DateValue[] | undefined>();

    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    locale = signal<string>('en');

    placeholder = signal<DateValue>(new CalendarDate(2024, 8, 10));

    weekStartsOn = signal<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);

    readonly fixedWeeks = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    numberOfMonths = signal<number>(1);

    minValue = signal<DateValue>(new CalendarDate(2024, 7, 10));

    maxValue = signal<DateValue>(new CalendarDate(2024, 7, 10));

    protected readonly fixedWeeksRef = linkedSignal({
        source: this.fixedWeeks,
        computation: (value) => value as boolean
    });

    months = signal<any>([]);

    weekDays = signal<any>([]);

    readonly headingValue = signal<string>('');

    nextPage: (nextPageFunc?: (date: DateValue) => DateValue) => void;

    constructor() {
        const { formatter, month, weekdays, nextPage, prevPage, visibleView, headingValue } = calendarRoot({
            nextPage: signal(undefined),
            prevPage: signal(undefined),
            locale: this.locale,
            placeholder: this.placeholder,
            weekStartsOn: this.weekStartsOn,
            fixedWeeks: this.fixedWeeksRef,
            numberOfMonths: this.numberOfMonths,
            minValue: this.minValue,
            maxValue: this.maxValue,
            disabled: signal(true),
            calendarLabel: signal(undefined),
            pagedNavigation: signal(false),
            weekdayFormat: signal('narrow')
        });

        this.nextPage = nextPage;

        effect(() => {
            this.months.set(month());
            this.weekDays.set(weekdays());

            this.headingValue.set(headingValue());
        });
    }

    ngOnInit() {
        const { isInvalid, isDateSelected } = calendarState({
            date: this.value
        });
    }
}
