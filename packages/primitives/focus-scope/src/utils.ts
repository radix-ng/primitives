import { getActiveElement } from '@radix-ng/primitives/core';

// Tabbable / focusable detection lives in `./tabbable` (Base UI port). Re-exported here so existing
// `./utils` imports — and the `@radix-ng/primitives/focus-scope` barrel — keep their public surface.
export {
    composedContains,
    focusable,
    getNextTabbable,
    getPreviousTabbable,
    getTabbableAfterElement,
    getTabbableBeforeElement,
    getTabbableCandidates,
    getTabbableEdges,
    isTabbable,
    queryComposedAll,
    tabbable
} from './tabbable';
export type { FocusableElement } from './tabbable';

import type { FocusableElement } from './tabbable';

export const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount';
export const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount';
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusableTarget = HTMLElement | { focus: () => void };

/**
 * The real target of a (possibly retargeted) event, piercing shadow boundaries via `composedPath()`.
 * Falls back to `event.target` when `composedPath` is unavailable.
 */
export function getEventTarget(event: Event): EventTarget | null {
    return event.composedPath?.()[0] ?? event.target;
}

/**
 * Attempts focusing the first element in a list of candidates.
 * Stops when focus has actually moved.
 *
 * Reads the active element from `root` (a focus scope passes its host's `ownerDocument`); falling back to
 * the global `document` would, in an iframe / multi-document scope, never detect that focus moved inside
 * the inner document and so walk past every candidate, leaving focus on the last one instead of the first.
 */
export function focusFirst(
    candidates: FocusableElement[],
    { select = false, root }: { select?: boolean; root?: DocumentOrShadowRoot } = {}
) {
    const ownerRoot = root ?? candidates[0]?.ownerDocument ?? document;
    const previouslyFocusedElement = getActiveElement(ownerRoot);
    for (const candidate of candidates) {
        focus(candidate, { select });
        if (getActiveElement(ownerRoot) !== previouslyFocusedElement) return true;
    }

    return;
}

export function isSelectableInput(element: any): element is FocusableTarget & { select: () => void } {
    return element instanceof HTMLInputElement && 'select' in element;
}

export function focus(element?: FocusableTarget | null, { select = false } = {}) {
    // only focus if that element is focusable
    if (element && element.focus) {
        // Read the active element from the element's own document so the same-element select() check stays
        // correct across iframes / multi-document scopes (consistent with this module's ownerDocument focus).
        const root = 'ownerDocument' in element ? element.ownerDocument : undefined;
        const previouslyFocusedElement = getActiveElement(root ?? document);
        // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
        element.focus({ preventScroll: true });
        // only select if its not the same element, it supports selection and we need to select
        if (element !== previouslyFocusedElement && isSelectableInput(element) && select) {
            element.select();
        }
    }
}
