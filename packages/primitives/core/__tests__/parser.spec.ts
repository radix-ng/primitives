import { createFormatter } from '../src/date-time/formatter';
import {
    createContent,
    initializeSegmentValues,
    syncSegmentValues,
    syncTimeSegmentValues
} from '../src/date-time/parser';
import { InputSignal } from '@angular/core';
import { CalendarDate, CalendarDateTime } from '@internationalized/date';
import { describe, expect, it } from 'vitest';

// `locale` is typed as an InputSignal in the parser API; a plain getter is enough for these tests.
const localeSignal = (value: string) => (() => value) as unknown as InputSignal<string>;

describe('initializeSegmentValues', () => {
    it('exposes only date parts for day granularity', () => {
        const values = initializeSegmentValues('day');
        expect(Object.keys(values).sort()).toEqual(['day', 'month', 'year']);
        expect(values).toEqual({ day: null, month: null, year: null });
    });

    it('adds hour + dayPeriod (defaulting to AM) for hour granularity, without minute/second', () => {
        const values = initializeSegmentValues('hour');
        expect(Object.keys(values).sort()).toEqual(['day', 'dayPeriod', 'hour', 'month', 'year']);
        expect((values as Record<string, unknown>)['dayPeriod']).toBe('AM');
        expect((values as Record<string, unknown>)['hour']).toBeNull();
    });

    it('includes minute but not second for minute granularity', () => {
        const keys = Object.keys(initializeSegmentValues('minute'));
        expect(keys).toContain('minute');
        expect(keys).not.toContain('second');
    });

    it('includes every editable part for second granularity', () => {
        const keys = Object.keys(initializeSegmentValues('second')).sort();
        expect(keys).toEqual(['day', 'dayPeriod', 'hour', 'minute', 'month', 'second', 'year']);
    });

    it('omits date parts for a time-only field so the value can be committed', () => {
        const keys = Object.keys(initializeSegmentValues('minute', true)).sort();
        expect(keys).toEqual(['dayPeriod', 'hour', 'minute']);
        expect(keys).not.toContain('day');
        expect(keys).not.toContain('month');
        expect(keys).not.toContain('year');
    });
});

describe('syncSegmentValues', () => {
    const formatter = createFormatter('en-US');

    it('returns only date parts for a plain CalendarDate', () => {
        const values = syncSegmentValues({ value: new CalendarDate(2024, 3, 15), formatter });
        expect(values).toEqual({ day: 15, month: 3, year: 2024 });
    });

    it('merges time parts for a CalendarDateTime', () => {
        const values = syncSegmentValues({
            value: new CalendarDateTime(2024, 3, 15, 13, 30, 0),
            formatter
        }) as Record<string, unknown>;

        expect(values['day']).toBe(15);
        expect(values['hour']).toBe(13);
        expect(values['minute']).toBe(30);
        expect(values['dayPeriod']).toBe('PM');
    });
});

describe('syncTimeSegmentValues', () => {
    const formatter = createFormatter('en-US');

    it('derives the day period from the wall-clock hour', () => {
        const morning = syncTimeSegmentValues({
            value: new CalendarDateTime(2024, 1, 1, 9, 0, 0),
            formatter
        }) as Record<string, unknown>;

        expect(morning['hour']).toBe(9);
        expect(morning['dayPeriod']).toBe('AM');
    });
});

describe('createContent', () => {
    const formatter = createFormatter('en-US');

    it('produces a content object and a non-empty ordered parts array', () => {
        const dateRef = new CalendarDate(2024, 1, 15);
        const segmentValues = syncSegmentValues({ value: dateRef, formatter });

        const content = createContent({
            granularity: 'day',
            dateRef,
            formatter,
            hideTimeZone: false,
            hourCycle: undefined,
            segmentValues,
            locale: localeSignal('en-US')
        });

        expect(typeof content.obj.day).toBe('string');
        expect(content.obj.day).toBe('15');
        expect(Array.isArray(content.arr)).toBe(true);
        expect(content.arr.length).toBeGreaterThan(0);
        // every emitted segment carries a part name and a string value
        for (const segment of content.arr) {
            expect(segment.part).toBeTruthy();
            expect(typeof segment.value).toBe('string');
        }
    });
});
