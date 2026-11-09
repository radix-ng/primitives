import { describe, expect, it } from 'vitest';
import { createSelectTypeahead, SelectTypeaheadEntry } from '../src/select-typeahead';

const entries = (labels: string[]): SelectTypeaheadEntry[] => labels.map((text) => ({ text, disabled: false }));

describe('Select typeahead search', () => {
    it('keeps the session origin while extending a prefix, independently of the current highlight', () => {
        const search = createSelectTypeahead();
        const list = entries(['Amsterdam', 'New York', 'Newark', 'New Delhi']);
        expect(search.match('n', list, 0)).toBe(1);
        expect(search.match('e', list, 1)).toBe(1);
        expect(search.match('w', list, 1)).toBe(1);
        expect(search.match(' ', list, 1)).toBe(1);
        expect(search.match('d', list, 1)).toBe(3);
    });
    it('cycles repeated initials and skips unavailable matching labels', () => {
        const search = createSelectTypeahead();
        const list = entries(['Amsterdam', 'Berlin', 'Blueberry', 'Bern']);
        list[2].disabled = true;
        expect(search.match('b', list, 0)).toBe(1);
        expect(search.match('b', list, 1)).toBe(3);
        expect(search.match('b', list, 3)).toBe(1);
    });
    it('allows repeated initial letters in a label and ignores disabled double-letter labels', () => {
        const search = createSelectTypeahead();
        const list = entries(['Amsterdam', 'Aachen', 'Austin']);
        expect(search.match('a', list, 0)).toBe(1);
        expect(search.match('a', list, 1)).toBe(1);
        search.reset();
        list[1].disabled = true;
        expect(search.match('a', list, 0)).toBe(2);
        expect(search.match('a', list, 2)).toBe(0);
    });
    it('keeps duplicate labels distinct by index', () => {
        const search = createSelectTypeahead();
        const list = entries(['Other', 'Berlin', 'Berlin']);
        expect(search.match('b', list, 0)).toBe(1);
        expect(search.match('b', list, 1)).toBe(2);
        expect(search.match('b', list, 2)).toBe(1);
    });
    it('clears a missed query immediately and matches the next character case-insensitively', () => {
        const search = createSelectTypeahead();
        const list = entries(['Amsterdam', 'Berlin']);
        expect(search.match('z', list, 0)).toBeUndefined();
        expect(search.active).toBe(false);
        expect(search.match('B', list, 0)).toBe(1);
    });
    it('retains a leading Space session until reset or a non-space miss', () => {
        const search = createSelectTypeahead();
        const list = entries(['Other', 'Berlin']);
        expect(search.match(' ', list, 0)).toBeUndefined();
        expect(search.active).toBe(true);
        expect(search.match('b', list, 0)).toBeUndefined();
        expect(search.active).toBe(false);
        expect(search.match('b', list, 0)).toBe(1);
        search.reset();
        expect(search.active).toBe(false);
    });
});
