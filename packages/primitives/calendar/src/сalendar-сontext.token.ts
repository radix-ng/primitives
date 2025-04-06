import { inject, InjectionToken, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { DateMatcher } from '@radix-ng/primitives/core';

export interface CalendarRootContextToken {
    nextPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    prevPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    headingValue: WritableSignal<string>;
    disabled: boolean;
    isDateSelected: DateMatcher;
    onDateChange: (date: DateValue) => void;
}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
