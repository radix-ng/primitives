import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, effect, forwardRef, input, linkedSignal, model, signal } from '@angular/core';
import { DateValue, isEqualDay, isSameDay } from '@internationalized/date';
import { DateMatcher, getDefaultDate, watch } from '@radix-ng/primitives/core';
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

    readonly defaultPlaceholder = model<DateValue>();

    readonly locale = input<string>('en');

    readonly defaultDate = getDefaultDate({
        defaultPlaceholder: this.defaultPlaceholder(),
        defaultValue: this.value(),
        locale: this.locale()
    });

    readonly placeholder = model<DateValue>(this.defaultPlaceholder() ?? this.defaultDate.copy());

    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly fixedWeeks = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly preventDeselect = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly weekStartsOn = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);

    readonly numberOfMonths = input<number>(1);

    readonly minValue = input<DateValue>();

    readonly maxValue = input<DateValue>();

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

    private readonly calendar = calendarRoot({
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

    constructor() {
        //const { formatter, month, weekdays, nextPage, prevPage, visibleView, headingValue }

        this.nextPage = this.calendar.nextPage;
        this.prevPage = this.calendar.prevPage;

        effect(() => {
            this.months.set(this.calendar.month());
            this.weekDays.set(this.calendar.weekdays());

            this.headingValue.set(this.calendar.headingValue());

            const { isDateSelected } = calendarState({
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
