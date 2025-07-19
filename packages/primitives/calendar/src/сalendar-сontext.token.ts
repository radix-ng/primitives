import { inject, InjectionToken, InputSignal, ModelSignal, Signal, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { DateMatcher, Formatter } from '@radix-ng/primitives/core';

export interface CalendarRootContextToken {
    nextPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    prevPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    isNextButtonDisabled: (nextPageFunc?: (date: DateValue) => DateValue) => boolean;
    isPrevButtonDisabled: (nextPageFunc?: (date: DateValue) => DateValue) => boolean;
    headingValue: WritableSignal<string>;
    dir: InputSignal<'ltr' | 'rtl'>;
    readonly: boolean;
    numberOfMonths: InputSignal<number>;
    placeholder: ModelSignal<DateValue>;
    pagedNavigation: boolean;
    disabled: InputSignal<boolean>;
    isDateSelected?: DateMatcher;
    isDateDisabled?: DateMatcher;
    isDateUnavailable: DateMatcher;
    formatter: Formatter;
    onDateChange: (date: DateValue) => void;
    currentElement: HTMLElement;
    startingWeekNumber: Signal<number[]>;
}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
