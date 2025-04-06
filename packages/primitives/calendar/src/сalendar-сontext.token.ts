import { inject, InjectionToken, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';

export interface CalendarRootContextToken {
    nextPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    headingValue: WritableSignal<string>;
}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
