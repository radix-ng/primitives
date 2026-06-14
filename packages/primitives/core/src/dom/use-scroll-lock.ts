import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, effect, inject, PLATFORM_ID, Signal } from '@angular/core';

interface ScrollLockState {
    /** The scroller's saved inline styles, captured on the `0 -> 1` transition for this document. */
    original: { bodyOverflow: string; htmlOverflow: string; htmlPaddingRight: string } | null;
    /** Number of active locks sharing this document's saved state. */
    count: number;
}

/**
 * Per-`Document` ownership of the scroller's overflow while one or more overlays lock scrolling.
 *
 * State is keyed by the owner `Document` (a `WeakMap`) rather than module-global, so locks in different
 * documents — iframes, multi-document test environments — never share or corrupt each other's saved
 * state (ADR 0015 §6 / Phase -1). Within one document a single shared counter is still essential: with
 * separate per-primitive counters a popover and a dialog open at the same time would each capture the
 * other's already-locked state as the "original" and restore it on close, leaving the page permanently
 * unscrollable.
 */
const scrollLockStates = new WeakMap<Document, ScrollLockState>();

function getScrollLockState(document: Document): ScrollLockState {
    let state = scrollLockStates.get(document);
    if (!state) {
        state = { original: null, count: 0 };
        scrollLockStates.set(document, state);
    }
    return state;
}

/**
 * Locks page scrolling while `active()` is `true`, and restores the original state when it becomes
 * `false` or the calling context is destroyed.
 *
 * Locks **both** `<body>` and `<html>`: a `body { overflow: hidden }` lock alone does *not* stop the
 * page when `<html>` is the scroller (e.g. a global `overflow-y: scroll`, as Storybook sets), because
 * body-overflow only propagates to the viewport when `<html>`'s overflow is `visible`. The width of
 * the removed scrollbar is added as `padding-right` on `<html>` so the page doesn't shift.
 *
 * Lock ownership is shared across all callers in the same document via a per-`Document` counter, so
 * nested or concurrent overlays compose correctly. No-op on the server. Must be called in an injection
 * context.
 */
export function useScrollLock(active: Signal<boolean>): void {
    const document = inject(DOCUMENT);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let isLocked = false;

    const lock = () => {
        if (isLocked) {
            return;
        }

        const state = getScrollLockState(document);

        if (state.count === 0) {
            const html = document.documentElement;
            const body = document.body;
            const win = document.defaultView;
            const scrollbarWidth = win ? Math.max(0, win.innerWidth - html.clientWidth) : 0;

            state.original = {
                bodyOverflow: body.style.overflow,
                htmlOverflow: html.style.overflow,
                htmlPaddingRight: html.style.paddingRight
            };

            body.style.overflow = 'hidden';
            html.style.overflow = 'hidden';
            if (scrollbarWidth > 0) {
                const currentPadding = win ? parseFloat(win.getComputedStyle(html).paddingRight) || 0 : 0;
                html.style.paddingRight = `${currentPadding + scrollbarWidth}px`;
            }
        }

        state.count++;
        isLocked = true;
    };

    const unlock = () => {
        if (!isLocked) {
            return;
        }

        const state = getScrollLockState(document);
        state.count--;
        isLocked = false;

        if (state.count === 0 && state.original !== null) {
            const html = document.documentElement;
            document.body.style.overflow = state.original.bodyOverflow;
            html.style.overflow = state.original.htmlOverflow;
            html.style.paddingRight = state.original.htmlPaddingRight;
            state.original = null;
        }
    };

    effect(() => {
        if (!isBrowser) {
            return;
        }
        if (active()) {
            lock();
        } else {
            unlock();
        }
    });

    // Only register the browser-DOM unlock callback when actually in a browser — on the server
    // lock() is never called (guarded by isBrowser in the effect), so unlock() would no-op
    // anyway (isLocked stays false), but keeping the DestroyRef subscription is still misleading
    // and leaks a closure that references browser globals.
    if (isBrowser) {
        inject(DestroyRef).onDestroy(unlock);
    }
}
