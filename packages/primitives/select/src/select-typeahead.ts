import { findTypeaheadMatch } from '@radix-ng/primitives/core';

/** The search timeout used by the pinned Base UI Select. */
export const SELECT_TYPEAHEAD_RESET_MS = 750;

export interface SelectTypeaheadEntry {
    text: string;
    disabled: boolean;
}

/** Ephemeral keyboard search state. Selection and highlight remain owned by the caller. */
export function createSelectTypeahead() {
    let search = '';
    let origin = -1;
    let matched: number | undefined;

    return {
        get active(): boolean {
            return search.length > 0;
        },
        reset(): void {
            search = '';
            origin = -1;
            matched = undefined;
        },
        match(key: string, entries: readonly SelectTypeaheadEntry[], startIndex: number): number | undefined {
            const newSession = search === '';
            if (newSession) origin = startIndex;

            // A repeated initial may be part of a label (e.g. Aachen), rather than a cycling gesture.
            const canCycle = entries.every(
                ({ text, disabled }) => disabled || !text || text[0]?.toLowerCase() !== text[1]?.toLowerCase()
            );
            if (canCycle && search === key) {
                search = '';
                origin = matched ?? -1;
            }
            search += key;
            const from = (newSession ? startIndex : origin) + 1;
            const index = findTypeaheadMatch(
                entries.map((entry) => (entry.disabled ? null : entry.text)),
                search,
                from
            );
            if (index !== undefined) {
                matched = index;
                return index;
            }
            // A miss starts a fresh session on the next character. Spaces can extend a multiword query.
            if (key !== ' ') search = '';
            return undefined;
        }
    };
}
