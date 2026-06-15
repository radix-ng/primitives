// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { getNextTabbable, getPreviousTabbable, getTabbableAfterElement, getTabbableBeforeElement } from '../src/utils';

/**
 * The tab-order navigation helpers (Base UI `tabbable.ts`) walk the whole document `<body>`, so each
 * test builds the body's tabbable set explicitly and tears it down. They power the portal-focus bridge's
 * guard redirects.
 */
describe('tabbable navigation', () => {
    let one: HTMLButtonElement;
    let two: HTMLButtonElement;
    let three: HTMLButtonElement;

    beforeEach(() => {
        [one, two, three] = ['one', 'two', 'three'].map((id) => {
            const button = document.createElement('button');
            button.id = id;
            document.body.appendChild(button);
            return button;
        });
    });

    afterEach(() => {
        [one, two, three].forEach((button) => button.remove());
    });

    describe('getNextTabbable / getPreviousTabbable (relative to the active element)', () => {
        it('returns the tabbable after the focused element', () => {
            two.focus();
            expect(getNextTabbable(two)).toBe(three);
        });

        it('returns the tabbable before the focused element', () => {
            two.focus();
            expect(getPreviousTabbable(two)).toBe(one);
        });

        it('falls back to the reference when there is no next/previous', () => {
            three.focus();
            expect(getNextTabbable(three)).toBe(three); // already last → fall back
            one.focus();
            expect(getPreviousTabbable(one)).toBe(one); // already first → fall back
        });
    });

    describe('getTabbableAfterElement / getTabbableBeforeElement (relative to a reference, wrapping)', () => {
        it('returns the tabbable immediately after the reference', () => {
            expect(getTabbableAfterElement(one)).toBe(two);
        });

        it('returns the tabbable immediately before the reference', () => {
            expect(getTabbableBeforeElement(two)).toBe(one);
        });

        it('wraps around the ends', () => {
            expect(getTabbableAfterElement(three)).toBe(one); // last → first
            expect(getTabbableBeforeElement(one)).toBe(three); // first → last
        });

        it('returns null for a reference that is not tabbable / not present', () => {
            const detached = document.createElement('button');
            expect(getTabbableAfterElement(detached)).toBeNull();
            expect(getTabbableAfterElement(null)).toBeNull();
        });
    });
});
