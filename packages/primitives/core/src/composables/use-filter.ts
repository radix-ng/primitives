/**
 * Locale-aware string matching backed by `Intl.Collator`, mirroring Base UI's `useFilter`.
 *
 * The collator defaults to `sensitivity: 'base'`, so matching is both case-insensitive and
 * diacritic-insensitive (`"Äpfel"` matches `"ap"`, `"résumé"` matches `"resume"`). Pass `locale`
 * and/or any `Intl.Collator` options to override.
 */
export interface UseFilterOptions extends Intl.CollatorOptions {
    /** Locale(s) for the collator. Defaults to the runtime's default locale. */
    locale?: Intl.LocalesArgument;
}

/** Predicates returned by {@link useFilter}. An empty `query` always matches. */
export interface FilterPredicates {
    /** Whether `text` contains `query`. */
    contains: (text: string, query: string) => boolean;
    /** Whether `text` starts with `query`. */
    startsWith: (text: string, query: string) => boolean;
    /** Whether `text` ends with `query`. */
    endsWith: (text: string, query: string) => boolean;
}

/**
 * Creates locale-aware `contains` / `startsWith` / `endsWith` predicates.
 *
 * Matching uses `Intl.Collator` with `sensitivity: 'base'` and `usage: 'search'` by default, so
 * comparisons ignore case and diacritics. An empty (or whitespace-only) `query` matches everything,
 * which is the natural "no filter applied" state for a combobox.
 *
 * @example
 * const { contains } = useFilter();
 * contains('Äpfel', 'ap'); // true
 */
export function useFilter(options?: UseFilterOptions): FilterPredicates {
    const { locale, ...collatorOptions } = options ?? {};
    const collator = new Intl.Collator(locale, {
        usage: 'search',
        sensitivity: 'base',
        ...collatorOptions
    });

    // `Intl.Collator` only compares whole strings, so we scan every substring window of `text`
    // the same length as `query` and treat a collator match as a hit. This keeps the locale rules
    // (case/diacritic folding) consistent with `===`-style equality the collator provides.
    const matchesAt = (text: string, query: string, start: number): boolean =>
        collator.compare(text.slice(start, start + query.length), query) === 0;

    const isEmpty = (query: string): boolean => query.length === 0;

    return {
        contains(text, query) {
            if (isEmpty(query)) {
                return true;
            }
            for (let i = 0; i + query.length <= text.length; i++) {
                if (matchesAt(text, query, i)) {
                    return true;
                }
            }
            return false;
        },
        startsWith(text, query) {
            if (isEmpty(query)) {
                return true;
            }
            return query.length <= text.length && matchesAt(text, query, 0);
        },
        endsWith(text, query) {
            if (isEmpty(query)) {
                return true;
            }
            return query.length <= text.length && matchesAt(text, query, text.length - query.length);
        }
    };
}
