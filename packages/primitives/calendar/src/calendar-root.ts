import { computed, signal, WritableSignal } from '@angular/core';
import { DateFields, DateValue, isEqualMonth } from '@internationalized/date';
import {
    createFormatter,
    createMonths,
    DateFormatterOptions,
    DateMatcher,
    getDaysInMonth,
    Month,
    toDate,
    watch
} from '@radix-ng/primitives/core';

export type CalendarProps = {
    locale: WritableSignal<string>;
    placeholder: WritableSignal<DateValue>;
    weekStartsOn: WritableSignal<0 | 1 | 2 | 3 | 4 | 5 | 6>;
    fixedWeeks: WritableSignal<boolean>;
    numberOfMonths: WritableSignal<number>;
    minValue: WritableSignal<DateValue | undefined>;
    maxValue: WritableSignal<DateValue | undefined>;
    disabled: WritableSignal<boolean>;
    weekdayFormat: WritableSignal<Intl.DateTimeFormatOptions['weekday']>;
    pagedNavigation: WritableSignal<boolean>;
    isDateDisabled?: DateMatcher;
    isDateUnavailable?: DateMatcher;
    calendarLabel: WritableSignal<string | undefined>;
    nextPage: WritableSignal<((placeholder: DateValue) => DateValue) | undefined>;
    prevPage: WritableSignal<((placeholder: DateValue) => DateValue) | undefined>;
};

function handleNextPage(date: DateValue, nextPageFunc: (date: DateValue) => DateValue): DateValue {
    return nextPageFunc(date);
}

export function calendarRoot(props: CalendarProps) {
    const formatter = createFormatter(props.locale());

    const headingFormatOptions = computed(() => {
        const options: DateFormatterOptions = {
            calendar: props.placeholder().calendar.identifier
        };

        if (props.placeholder().calendar.identifier === 'gregory' && props.placeholder().era === 'BC') {
            options.era = 'short';
        }

        return options;
    });

    const month = signal<Month<DateValue>[]>(
        createMonths({
            dateObj: props.placeholder(),
            weekStartsOn: props.weekStartsOn(),
            locale: props.locale(),
            fixedWeeks: props.fixedWeeks(),
            numberOfMonths: props.numberOfMonths()
        })
    );

    const visibleView = computed(() => {
        return month().map((month) => month.value);
    });

    const nextPage = (nextPageFunc?: (date: DateValue) => DateValue) => {
        const firstDate = month()[0].value;

        if (!nextPageFunc && !props.nextPage()) {
            const newDate = firstDate.add({ months: props.pagedNavigation() ? props.numberOfMonths() : 1 });

            const newMonth = createMonths({
                dateObj: newDate,
                weekStartsOn: props.weekStartsOn(),
                locale: props.locale(),
                fixedWeeks: props.fixedWeeks(),
                numberOfMonths: props.numberOfMonths()
            });

            month.set(newMonth);
            props.placeholder.set(newMonth[0].value.set({ day: 1 }));

            return;
        }

        const newDate = handleNextPage(firstDate, nextPageFunc || props.nextPage()!);
        const newMonth = createMonths({
            dateObj: newDate,
            weekStartsOn: props.weekStartsOn(),
            locale: props.locale(),
            fixedWeeks: props.fixedWeeks(),
            numberOfMonths: props.numberOfMonths()
        });

        month.set(newMonth);

        const duration: DateFields = {};

        if (!nextPageFunc) {
            const diff = newMonth[0].value.compare(firstDate);
            if (diff >= getDaysInMonth(firstDate)) {
                duration.day = 1;
            }

            if (diff >= 365) {
                duration.month = 1;
            }
        }

        props.placeholder.set(newMonth[0].value.set({ ...duration }));
    };

    const weekdays = computed(() => {
        if (!month().length) return [];
        return month()[0].weeks[0].map((date) => {
            return formatter.dayOfWeek(toDate(date), props.weekdayFormat());
        });
    });

    watch([props.placeholder], ([placeholder]) => {
        if (visibleView().some((month) => isEqualMonth(month, placeholder))) {
            return;
        }

        month.set(
            createMonths({
                dateObj: placeholder,
                weekStartsOn: props.weekStartsOn(),
                locale: props.locale(),
                fixedWeeks: props.fixedWeeks(),
                numberOfMonths: props.numberOfMonths()
            })
        );
    });

    watch(
        [props.locale, props.weekStartsOn, props.fixedWeeks, props.numberOfMonths],
        ([locale, weekStartsOn, fixedWeeks, numberOfMonths]) => {
            month.set(
                createMonths({
                    dateObj: props.placeholder(),
                    weekStartsOn: weekStartsOn,
                    locale: locale,
                    fixedWeeks: fixedWeeks,
                    numberOfMonths: numberOfMonths
                })
            );
        }
    );

    const headingValue = computed(() => {
        if (!month().length) {
            return '';
        }

        if (props.locale() !== formatter.getLocale()) formatter.setLocale(props.locale());

        if (month().length === 1) {
            const _month = month()[0].value;
            return `${formatter.fullMonthAndYear(toDate(_month), headingFormatOptions())}`;
        }

        const startMonth = toDate(month()[0].value);
        const endMonth = toDate(month()[month().length - 1].value);

        const startMonthName = formatter.fullMonth(startMonth, headingFormatOptions());
        const endMonthName = formatter.fullMonth(endMonth, headingFormatOptions());
        const startMonthYear = formatter.fullYear(startMonth, headingFormatOptions());
        const endMonthYear = formatter.fullYear(endMonth, headingFormatOptions());

        const content =
            startMonthYear === endMonthYear
                ? `${startMonthName} - ${endMonthName} ${endMonthYear}`
                : `${startMonthName} ${startMonthYear} - ${endMonthName} ${endMonthYear}`;

        return content;
    });

    return {
        month,
        weekdays,
        visibleView,
        formatter,
        nextPage,
        headingValue
    };
}
