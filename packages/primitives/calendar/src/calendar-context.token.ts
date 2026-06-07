import { inject, InjectionToken, InputSignal, ModelSignal, Signal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { DateMatcher, Formatter } from '@radix-ng/primitives/core';

export interface CalendarRootContextToken {
    nextPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    prevPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    isNextButtonDisabled: (nextPageFunc?: (date: DateValue) => DateValue) => boolean;
    isPrevButtonDisabled: (prevPageFunc?: (date: DateValue) => DateValue) => boolean;
    headingValue: Signal<string>;
    dir: InputSignal<'ltr' | 'rtl'>;
    readonly: Signal<boolean>;
    numberOfMonths: InputSignal<number>;
    placeholder: ModelSignal<DateValue>;
    pagedNavigation: Signal<boolean>;
    disabled: Signal<boolean>;
    /** Resolved matcher: whether the given date is currently selected. */
    isDateSelected: DateMatcher;
    /** Resolved matcher: disabled = root `disabled` OR `isDateDisabled` input OR outside min/max. */
    dateDisabled: DateMatcher;
    /** Resolved matcher: unavailable = `isDateUnavailable` input. */
    dateUnavailable: DateMatcher;
    formatter: Formatter;
    onDateChange: (date: DateValue) => void;
    currentElement: HTMLElement;
    startingWeekNumber: Signal<number[]>;
}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
