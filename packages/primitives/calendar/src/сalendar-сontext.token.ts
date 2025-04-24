import { inject, InjectionToken, InputSignal, ModelSignal, WritableSignal } from '@angular/core';
import { DateValue } from '@internationalized/date';
import { DateMatcher, Formatter } from '@radix-ng/primitives/core';
import { PrimitiveElementController } from './usePrimitiveElement';

export interface CalendarRootContextToken {
    nextPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    prevPage?: (nextPageFunc?: (date: DateValue) => DateValue) => void;
    headingValue: WritableSignal<string>;
    dir: InputSignal<'ltr' | 'rtl'>;
    numberOfMonths: InputSignal<number>;
    placeholder: ModelSignal<DateValue>;
    pagedNavigation: boolean;
    disabled: boolean;
    isDateSelected?: DateMatcher;
    isDateDisabled?: DateMatcher;
    formatter: Formatter;
    onDateChange: (date: DateValue) => void;
    currentElement: PrimitiveElementController['currentElement'];
}

export const CALENDAR_ROOT_CONTEXT = new InjectionToken<CalendarRootContextToken>('CalendarRootContext');

export function injectCalendarRootContext(): CalendarRootContextToken {
    return inject(CALENDAR_ROOT_CONTEXT);
}
