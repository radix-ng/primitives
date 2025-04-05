import { inject, InjectionToken } from '@angular/core';

export interface CalendarRootContextToken {}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
