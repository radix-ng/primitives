import { CalendarDate } from '@internationalized/date';
import { describe, expect, it } from 'vitest';
import { getDaysBetween, getWeekNumber } from '../src/date-time/calendar';

describe('getDaysBetween', () => {
    it('returns the days strictly between start and end (both ends exclusive)', () => {
        const days = getDaysBetween(new CalendarDate(2024, 1, 1), new CalendarDate(2024, 1, 5));
        expect(days.map((d) => d.day)).toEqual([2, 3, 4]);
    });

    it('returns an empty array for adjacent or equal bounds', () => {
        expect(getDaysBetween(new CalendarDate(2024, 1, 1), new CalendarDate(2024, 1, 2))).toEqual([]);
        expect(getDaysBetween(new CalendarDate(2024, 1, 1), new CalendarDate(2024, 1, 1))).toEqual([]);
    });
});

describe('getWeekNumber (en-US, week starts Sunday)', () => {
    // 2024 starts on Monday, so its first week starts Sunday 2023-12-31.
    it('counts whole weeks within the year, incrementing exactly on the week boundary', () => {
        expect(getWeekNumber(new CalendarDate(2024, 1, 1))).toBe(1); // Monday, week 1
        expect(getWeekNumber(new CalendarDate(2024, 1, 6))).toBe(1); // Saturday, last day of week 1
        expect(getWeekNumber(new CalendarDate(2024, 1, 7))).toBe(2); // Sunday, start of week 2 (the off-by-one case)
        expect(getWeekNumber(new CalendarDate(2024, 1, 13))).toBe(2); // last day of week 2
        expect(getWeekNumber(new CalendarDate(2024, 1, 14))).toBe(3); // start of week 3
    });
});
