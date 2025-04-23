import { DateFormatter, type DateValue, getLocalTimeZone, today } from '@internationalized/date';
import { hasTime, isZonedDateTime, toDate } from './comparators';
import { HourCycle } from './types';

const defaultPartOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

export interface DateFormatterOptions extends Intl.DateTimeFormatOptions {
    calendar?: string;
}

export type Formatter = {
    getLocale: () => string;
    setLocale: (newLocale: string) => void;
    custom: (date: Date, options: DateFormatterOptions) => string;
    selectedDate: (date: DateValue, includeTime?: boolean) => string;
    dayOfWeek: (date: Date, length?: DateFormatterOptions['weekday']) => string;
    fullMonthAndYear: (date: Date, options?: DateFormatterOptions) => string;
    fullMonth: (date: Date, options?: DateFormatterOptions) => string;
    fullYear: (date: Date, options?: DateFormatterOptions) => string;
    dayPeriod: (date: Date) => string;
    part: (dateObj: DateValue, type: Intl.DateTimeFormatPartTypes, options?: DateFormatterOptions) => string;
    toParts: (date: DateValue, options?: DateFormatterOptions) => Intl.DateTimeFormatPart[];
    getMonths: () => { label: string; value: number }[];
};

/**
 * Creates a wrapper around the `DateFormatter`, which is
 * an improved version of the {@link Intl.DateTimeFormat} API,
 * that is used internally by the various date builders to
 * easily format dates in a consistent way.
 *
 * @see [DateFormatter](https://react-spectrum.adobe.com/internationalized/date/DateFormatter.html)
 */
export function createFormatter(initialLocale: string): Formatter {
    let locale = initialLocale;

    function setLocale(newLocale: string) {
        locale = newLocale;
    }

    function getLocale() {
        return locale;
    }

    function custom(date: Date, options: Intl.DateTimeFormatOptions) {
        return new DateFormatter(locale, options).format(date);
    }

    function selectedDate(date: DateValue, includeTime = true) {
        if (hasTime(date) && includeTime) {
            return custom(toDate(date), {
                dateStyle: 'long',
                timeStyle: 'long'
            });
        } else {
            return custom(toDate(date), {
                dateStyle: 'long'
            });
        }
    }

    function fullMonthAndYear(date: Date) {
        return new DateFormatter(locale, { month: 'long', year: 'numeric' }).format(date);
    }

    function fullMonth(date: Date) {
        return new DateFormatter(locale, { month: 'long' }).format(date);
    }

    function fullYear(date: Date) {
        return new DateFormatter(locale, { year: 'numeric' }).format(date);
    }

    function toParts(date: DateValue, options?: Intl.DateTimeFormatOptions) {
        if (isZonedDateTime(date)) {
            return new DateFormatter(locale, {
                ...options,
                timeZone: date.timeZone
            }).formatToParts(toDate(date));
        } else {
            return new DateFormatter(locale, options).formatToParts(toDate(date));
        }
    }

    function dayOfWeek(date: Date, length: Intl.DateTimeFormatOptions['weekday'] = 'narrow') {
        return new DateFormatter(locale, { weekday: length }).format(date);
    }

    function dayPeriod(date: Date, hourCycle: HourCycle | undefined = undefined) {
        const parts = new DateFormatter(locale, {
            hour: 'numeric',
            minute: 'numeric',
            hourCycle: hourCycle === 24 ? 'h23' : undefined
        }).formatToParts(date);
        const value = parts.find((p) => p.type === 'dayPeriod')?.value;
        if (value === 'PM') {
            return 'PM';
        }
        return 'AM';
    }

    function part(dateObj: DateValue, type: Intl.DateTimeFormatPartTypes, options: Intl.DateTimeFormatOptions = {}) {
        const opts = { ...defaultPartOptions, ...options };
        const parts = toParts(dateObj, opts);
        const part = parts.find((p) => p.type === type);
        return part ? part.value : '';
    }

    function getMonths() {
        const defaultDate = today(getLocalTimeZone());
        const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        return months.map((item) => ({ label: fullMonth(toDate(defaultDate.set({ month: item }))), value: item }));
    }

    return {
        setLocale,
        getLocale,
        fullMonth,
        fullYear,
        fullMonthAndYear,
        toParts,
        custom,
        part,
        dayPeriod,
        selectedDate,
        dayOfWeek,
        getMonths
    };
}
