import { describe, expect, it } from 'vitest';
import { findTypeaheadMatch } from '../src/composables/typeahead';

describe('findTypeaheadMatch', () => {
    it('matches case-insensitive prefixes, wraps and skips unavailable labels', () => {
        const labels = ['Amsterdam', null, 'New York', 'New Delhi'];
        expect(findTypeaheadMatch(labels, 'NEW ', 3)).toBe(3);
        expect(findTypeaheadMatch(labels, 'new y', 3)).toBe(2);
        expect(findTypeaheadMatch(labels, 'a', 1)).toBe(0);
    });
    it('identifies equal labels by their distinct positions', () => {
        expect(findTypeaheadMatch(['Berlin', 'Berlin'], 'b', 1)).toBe(1);
        expect(findTypeaheadMatch(['Berlin', 'Berlin'], 'b', 2)).toBe(0);
    });
    it('returns no match for empty, unavailable and unmatched lists', () => {
        expect(findTypeaheadMatch([], 'n')).toBeUndefined();
        expect(findTypeaheadMatch([null, undefined], 'n')).toBeUndefined();
        expect(findTypeaheadMatch(['Amsterdam'], 'n')).toBeUndefined();
    });
});
