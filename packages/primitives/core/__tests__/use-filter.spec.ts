import { useFilter } from '../src/composables/use-filter';
import { describe, expect, it } from 'vitest';

describe('useFilter', () => {
    it('matches case-insensitively', () => {
        const { contains } = useFilter();
        expect(contains('Apple', 'apple')).toBe(true);
        expect(contains('Äpfel', 'äp')).toBe(true);
        expect(contains('BANANA', 'nan')).toBe(true);
    });

    it('matches diacritic-insensitively by default', () => {
        const { contains } = useFilter();
        expect(contains('résumé', 'resume')).toBe(true);
        expect(contains('Crème brûlée', 'creme')).toBe(true);
    });

    it('contains finds substrings anywhere', () => {
        const { contains } = useFilter();
        expect(contains('Pineapple', 'apple')).toBe(true);
        expect(contains('Pineapple', 'pine')).toBe(true);
        expect(contains('Pineapple', 'xyz')).toBe(false);
    });

    it('startsWith only matches the prefix', () => {
        const { startsWith } = useFilter();
        expect(startsWith('Banana', 'ban')).toBe(true);
        expect(startsWith('Banana', 'an')).toBe(false);
    });

    it('endsWith only matches the suffix', () => {
        const { endsWith } = useFilter();
        expect(endsWith('Banana', 'ana')).toBe(true);
        expect(endsWith('Banana', 'ban')).toBe(false);
    });

    it('treats an empty query as matching everything', () => {
        const { contains, startsWith, endsWith } = useFilter();
        expect(contains('anything', '')).toBe(true);
        expect(startsWith('anything', '')).toBe(true);
        expect(endsWith('anything', '')).toBe(true);
    });

    it('returns false when the query is longer than the text', () => {
        const { contains, startsWith, endsWith } = useFilter();
        expect(contains('ab', 'abc')).toBe(false);
        expect(startsWith('ab', 'abc')).toBe(false);
        expect(endsWith('ab', 'abc')).toBe(false);
    });

    it('respects a case-sensitive override', () => {
        const { contains } = useFilter({ sensitivity: 'case' });
        expect(contains('Apple', 'apple')).toBe(false);
        expect(contains('Apple', 'Apple')).toBe(true);
    });
});
