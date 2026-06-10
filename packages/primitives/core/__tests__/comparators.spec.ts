import { CalendarDate, CalendarDateTime, parseZonedDateTime, Time } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import {
    areAllDaysBetweenValid,
    getDaysInMonth,
    getDefaultDate,
    getDefaultTime,
    getLastFirstDayOfWeek,
    getNextLastDayOfWeek,
    hasTime,
    isAfter,
    isAfterOrSame,
    isBefore,
    isBeforeOrSame,
    isBetween,
    isBetweenInclusive,
    isCalendarDateTime,
    isZonedDateTime
} from '../src/date-time/comparators';

describe('date-time type guards', () => {
    it('isCalendarDateTime / isZonedDateTime narrow by instance', () => {
        const date = new CalendarDate(2024, 1, 1);
        const dateTime = new CalendarDateTime(2024, 1, 1, 12, 0, 0);
        const zoned = parseZonedDateTime('2024-01-01T00:00[America/New_York]');

        expect(isCalendarDateTime(date)).toBe(false);
        expect(isCalendarDateTime(dateTime)).toBe(true);
        expect(isZonedDateTime(zoned)).toBe(true);
        expect(isZonedDateTime(dateTime)).toBe(false);
    });

    it('hasTime is true for date-times and zoned values, false for plain dates', () => {
        expect(hasTime(new CalendarDate(2024, 1, 1))).toBe(false);
        expect(hasTime(new CalendarDateTime(2024, 1, 1, 0, 0, 0))).toBe(true);
        expect(hasTime(parseZonedDateTime('2024-01-01T00:00[America/New_York]'))).toBe(true);
    });
});

describe('getDaysInMonth', () => {
    it('handles leap and non-leap February for DateValue', () => {
        expect(getDaysInMonth(new CalendarDate(2024, 2, 1))).toBe(29);
        expect(getDaysInMonth(new CalendarDate(2023, 2, 1))).toBe(28);
        expect(getDaysInMonth(new CalendarDate(2024, 4, 1))).toBe(30);
        expect(getDaysInMonth(new CalendarDate(2024, 1, 1))).toBe(31);
    });

    it('handles native Date input', () => {
        // month is 0-indexed in the Date constructor: 1 === February
        expect(getDaysInMonth(new Date(2024, 1, 15))).toBe(29);
        expect(getDaysInMonth(new Date(2023, 1, 15))).toBe(28);
    });
});

describe('date comparison helpers', () => {
    const a = new CalendarDate(2024, 1, 1);
    const b = new CalendarDate(2024, 1, 2);

    it('isBefore / isAfter are strict', () => {
        expect(isBefore(a, b)).toBe(true);
        expect(isBefore(b, a)).toBe(false);
        expect(isBefore(a, a)).toBe(false);
        expect(isAfter(b, a)).toBe(true);
        expect(isAfter(a, a)).toBe(false);
    });

    it('isBeforeOrSame / isAfterOrSame are inclusive', () => {
        expect(isBeforeOrSame(a, a)).toBe(true);
        expect(isBeforeOrSame(a, b)).toBe(true);
        expect(isBeforeOrSame(b, a)).toBe(false);
        expect(isAfterOrSame(a, a)).toBe(true);
        expect(isAfterOrSame(b, a)).toBe(true);
    });

    it('isBetween is exclusive, isBetweenInclusive includes the bounds', () => {
        const start = new CalendarDate(2024, 1, 1);
        const mid = new CalendarDate(2024, 1, 2);
        const end = new CalendarDate(2024, 1, 3);

        expect(isBetween(mid, start, end)).toBe(true);
        expect(isBetween(start, start, end)).toBe(false);
        expect(isBetween(end, start, end)).toBe(false);

        expect(isBetweenInclusive(start, start, end)).toBe(true);
        expect(isBetweenInclusive(end, start, end)).toBe(true);
        expect(isBetweenInclusive(new CalendarDate(2024, 1, 5), start, end)).toBe(false);
    });
});

describe('week boundary helpers (en-US, week starts Sunday)', () => {
    // 2024-01-03 is a Wednesday
    const wednesday = new CalendarDate(2024, 1, 3);

    it('getLastFirstDayOfWeek walks back to the start of the week', () => {
        const result = getLastFirstDayOfWeek(wednesday, 0, 'en-US');
        expect(result).toStrictEqual(new CalendarDate(2023, 12, 31)); // the preceding Sunday
    });

    it('getNextLastDayOfWeek walks forward to the end of the week', () => {
        const result = getNextLastDayOfWeek(wednesday, 0, 'en-US');
        expect(result).toStrictEqual(new CalendarDate(2024, 1, 6)); // the following Saturday
    });
});

describe('areAllDaysBetweenValid', () => {
    const start = new CalendarDate(2024, 1, 1);
    const end = new CalendarDate(2024, 1, 5);

    it('is true when no matchers are provided', () => {
        expect(areAllDaysBetweenValid(start, end, undefined, undefined)).toBe(true);
    });

    it('is true when no day in the open-start range matches', () => {
        const never = () => false;
        expect(areAllDaysBetweenValid(start, end, never, never)).toBe(true);
    });

    it('is false when a disabled/unavailable day falls inside the range', () => {
        expect(areAllDaysBetweenValid(start, end, undefined, (d) => d.day === 3)).toBe(false);
        expect(areAllDaysBetweenValid(start, end, (d) => d.day === 4, undefined)).toBe(false);
        // the end date is included in the check
        expect(areAllDaysBetweenValid(start, end, undefined, (d) => d.day === 5)).toBe(false);
    });

    it('does not check the start date itself', () => {
        expect(areAllDaysBetweenValid(start, end, undefined, (d) => d.day === 1)).toBe(true);
    });
});

describe('getDefaultTime', () => {
    it('copies an explicit default value', () => {
        const result = getDefaultTime({ defaultValue: new Time(10, 30) });
        expect(result.hour).toBe(10);
        expect(result.minute).toBe(30);
    });

    it('falls back to the default placeholder, then to midnight', () => {
        expect(getDefaultTime({ defaultPlaceholder: new Time(5) }).hour).toBe(5);

        const midnight = getDefaultTime({});
        expect(midnight.hour).toBe(0);
        expect(midnight.minute).toBe(0);
        expect(midnight.second).toBe(0);
    });
});

describe('getDefaultDate', () => {
    it('uses the last entry of an array default value', () => {
        const result = getDefaultDate({
            defaultValue: [new CalendarDate(2020, 1, 1), new CalendarDate(2021, 2, 2)]
        });
        expect(result).toStrictEqual(new CalendarDate(2021, 2, 2));
    });

    it('uses a single default value, then the placeholder', () => {
        expect(getDefaultDate({ defaultValue: new CalendarDate(2019, 3, 3) })).toStrictEqual(
            new CalendarDate(2019, 3, 3)
        );
        expect(getDefaultDate({ defaultPlaceholder: new CalendarDate(2020, 5, 5) })).toStrictEqual(
            new CalendarDate(2020, 5, 5)
        );
    });

    it('treats an empty array as no selection and falls through to placeholder / today', () => {
        // empty multi-select array → placeholder when provided
        expect(getDefaultDate({ defaultValue: [], defaultPlaceholder: new CalendarDate(2020, 5, 5) })).toStrictEqual(
            new CalendarDate(2020, 5, 5)
        );
        // empty array with nothing else → today
        const todayDefault = getDefaultDate({ defaultValue: [] });
        expect(todayDefault.year).toBe(new Date().getFullYear());
    });

    it('falls back to today, with granularity deciding date vs date-time', () => {
        const dayDefault = getDefaultDate({});
        expect('hour' in dayDefault).toBe(false);
        expect(dayDefault.year).toBe(new Date().getFullYear());

        const timeDefault = getDefaultDate({ granularity: 'minute' });
        expect('hour' in timeDefault).toBe(true);
    });
});
