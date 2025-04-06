import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, forwardRef, input, linkedSignal, model, signal } from '@angular/core';
import { CalendarDate, DateValue, isEqualDay, isSameDay } from '@internationalized/date';
import { DateMatcher, watch } from '@radix-ng/primitives/core';
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

    readonly fixedWeeks = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly preventDeselect = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    locale = signal<string>('en');

    placeholder = signal<DateValue>(new CalendarDate(2024, 8, 10));

    weekStartsOn = signal<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);

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
    prevPage: (nextPageFunc?: (date: DateValue) => DateValue) => void;

    isDateSelected: DateMatcher;

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
        this.prevPage = prevPage;

        effect(() => {
            this.months.set(month());
            this.weekDays.set(weekdays());

            this.headingValue.set(headingValue());

            const { isInvalid, isDateSelected } = calendarState({
                date: this.value
            });

            this.isDateSelected = isDateSelected;
        });

        watch([this.value], (_modelValue) => {
            if (Array.isArray(_modelValue) && _modelValue.length) {
                const lastValue = _modelValue[_modelValue.length - 1];
                if (lastValue && !isEqualDay(this.placeholder(), <DateValue>lastValue)) {
                    this.onPlaceholderChange(<DateValue>lastValue);
                }
            } else if (!Array.isArray(_modelValue) && _modelValue && !isEqualDay(this.placeholder(), _modelValue)) {
                this.onPlaceholderChange(_modelValue);
            }
        });
    }

    onPlaceholderChange(value: DateValue) {
        this.placeholder.set(value.copy());
    }

    onDateChange(date: DateValue) {
        const currentValue = this.value();

        if (!this.multiple()) {
            // for single selection
            if (!this.value()) {
                this.value.set(date.copy());
                return;
            }

            if (!this.preventDeselect() && isEqualDay(this.value() as DateValue, date)) {
                this.placeholder.set(date.copy());
                this.value.set(undefined);
            } else {
                this.value.set(date.copy());
            }
        } else if (!this.value()) {
            // for multiple selection
            this.value.set([date.copy()]);
        } else if (Array.isArray(currentValue)) {
            const index = currentValue.findIndex((d: DateValue) => isSameDay(d, date));
            if (index === -1) {
                this.value.set([...currentValue, date.copy()]);
            } else if (!this.preventDeselect()) {
                const next = currentValue.filter((d: DateValue) => !isSameDay(d, date));
                if (next.length === 0) {
                    this.placeholder.set(date.copy());
                    this.value.set(undefined);
                    return;
                }
                this.value.set(next.map((d) => d.copy()));
            }
        }
    }
}
