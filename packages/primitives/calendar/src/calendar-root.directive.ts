import { BooleanInput } from '@angular/cdk/coercion';
import {
    AfterViewInit,
    booleanAttribute,
    Directive,
    effect,
    ElementRef,
    forwardRef,
    inject,
    input,
    linkedSignal,
    model,
    signal
} from '@angular/core';
import { DateValue, isEqualDay, isSameDay } from '@internationalized/date';
import { DateMatcher, Formatter, getDefaultDate, Month, watch } from '@radix-ng/primitives/core';
import { calendar, calendarState } from './calendar';
import { CALENDAR_ROOT_CONTEXT } from './сalendar-сontext.token';

@Directive({
    selector: '[rdxCalendarRoot]',
    exportAs: 'rdxCalendarRoot',
    providers: [
        { provide: CALENDAR_ROOT_CONTEXT, useExisting: forwardRef(() => RdxCalendarRootDirective) }],
    host: {
        role: 'application',
        '[attr.aria-label]': 'fullCalendarLabel()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-readonly]': 'readonly() ? "" : undefined',
        '[attr.data-invalid]': 'isInvalid ? "" : undefined',
        '[attr.dir]': 'dir()'
    }
})
export class RdxCalendarRootDirective implements AfterViewInit {
    private readonly elementRef = inject(ElementRef<HTMLElement>);

    /**
     * The controlled checked state of the calendar
     */
    readonly value = model<DateValue | DateValue[] | undefined>();

    /**
     * The default placeholder date
     */
    readonly defaultPlaceholder = model<DateValue>();

    readonly locale = input<string>('en');

    readonly defaultDate = getDefaultDate({
        defaultPlaceholder: this.defaultPlaceholder(),
        defaultValue: this.value(),
        locale: this.locale()
    });

    /**
     * The placeholder date, which is used to determine what month to display when no date is selected.
     * This updates as the user navigates the calendar and can be used to programmatically control the calendar view
     */
    readonly placeholder = model<DateValue>(this.defaultPlaceholder() ?? this.defaultDate.copy());

    readonly multiple = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether to always display 6 weeks in the calendar
     */
    readonly fixedWeeks = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether the calendar is disabled
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Whether to prevent the user from deselecting a date without selecting another date first
     */
    readonly preventDeselect = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The day of the week to start the calendar on
     */
    readonly weekStartsOn = input<0 | 1 | 2 | 3 | 4 | 5 | 6>(1);

    /**
     * The number of months to display at once
     */
    readonly numberOfMonths = input<number>(1);

    /**
     * The reading direction of the calendar when applicable.
     */
    readonly dir = input<'ltr' | 'rtl'>('ltr');

    /**
     * The minimum date that can be selected
     */
    readonly minValue = input<DateValue>();

    /**
     * The maximum date that can be selected
     */
    readonly maxValue = input<DateValue>();

    /**
     * The format to use for the weekday strings provided via the weekdays slot prop
     */
    readonly weekdayFormat = input<Intl.DateTimeFormatOptions['weekday']>('narrow');

    /**
     * The accessible label for the calendar
     */
    readonly calendarLabel = input<string>();

    /**
     * Whether the calendar is readonly
     */
    readonly readonly = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * This property causes the previous and next buttons to navigate by the number of months displayed at once, rather than one month
     */
    readonly pagedNavigation = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly propsNextPage = input<(placeholder: DateValue) => DateValue>();

    readonly propsPrevPage = input<(placeholder: DateValue) => DateValue>();

    readonly isDateDisabled = input<DateMatcher>();

    readonly isDateUnavailable = input<DateMatcher>();

    readonly initialFocus = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly months = model<Month<DateValue>[]>();

    readonly weekDays = model<string[]>();

    protected readonly fixedWeeksRef = linkedSignal({
        source: this.fixedWeeks,
        computation: (value) => value as boolean
    });

    protected readonly disabledRef = linkedSignal({
        source: this.disabled,
        computation: (value) => value as boolean
    });

    protected readonly pagedNavigationRef = linkedSignal({
        source: this.pagedNavigation,
        computation: (value) => value as boolean
    });

    readonly headingValue = signal<string>('');

    readonly fullCalendarLabel = signal<string>('');

    nextPage: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    prevPage: (nextPageFunc?: (date: DateValue) => DateValue) => void;

    isNextButtonDisabled: (nextPageFunc?: (date: DateValue) => DateValue) => boolean;
    isPrevButtonDisabled: (nextPageFunc?: (date: DateValue) => DateValue) => boolean;

    isDateSelected: DateMatcher;
    isInvalid: boolean;
    isOutsideVisibleView: (date: DateValue) => boolean;

    formatter: Formatter;

    currentElement!: HTMLElement;

    private readonly calendar = calendar({
        locale: this.locale,
        placeholder: this.placeholder,
        weekStartsOn: this.weekStartsOn,
        fixedWeeks: this.fixedWeeksRef,
        numberOfMonths: this.numberOfMonths,
        minValue: this.minValue,
        maxValue: this.maxValue,
        disabled: this.disabledRef,
        weekdayFormat: this.weekdayFormat,
        pagedNavigation: this.pagedNavigationRef,
        isDateDisabled: this.isDateDisabled,
        isDateUnavailable: this.isDateUnavailable,
        calendarLabel: this.calendarLabel,
        nextPage: this.propsNextPage,
        prevPage: this.propsPrevPage
    });

    constructor() {
        this.nextPage = this.calendar.nextPage;
        this.prevPage = this.calendar.prevPage;
        this.isOutsideVisibleView = this.calendar.isOutsideVisibleView;
        this.isNextButtonDisabled = this.calendar.isNextButtonDisabled;
        this.isPrevButtonDisabled = this.calendar.isPrevButtonDisabled;
        this.formatter = this.calendar.formatter;

        effect(() => {
            this.months.set(this.calendar.month());

            this.weekDays.set(this.calendar.weekdays());

            this.fullCalendarLabel.set(this.calendar.fullCalendarLabel());

            this.headingValue.set(this.calendar.headingValue());

            const { isInvalid, isDateSelected } = calendarState({
                date: this.value,
                isDateDisabled: this.isDateDisabled(),
                isDateUnavailable: this.isDateUnavailable()
            });

            this.isDateSelected = isDateSelected;
            this.isInvalid = isInvalid();
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

    ngAfterViewInit() {
        this.currentElement = this.elementRef.nativeElement;
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
