import { DOCUMENT } from '@angular/common';
import { DestroyRef, effect, inject, Signal } from '@angular/core';

/**
 * Process-wide ownership of the document scroller's overflow while one or more overlays lock
 * scrolling.
 *
 * A single shared counter across every primitive that locks scroll is essential: with separate
 * per-primitive counters, a popover and a dialog open at the same time would each capture the
 * other's already-locked state as the "original" and restore it on close, leaving the page
 * permanently unscrollable.
 */
let original: { bodyOverflow: string; htmlOverflow: string; htmlPaddingRight: string } | null = null;
let scrollLockCount = 0;

/**
 * Locks page scrolling while `active()` is `true`, and restores the original state when it becomes
 * `false` or the calling context is destroyed.
 *
 * Locks **both** `<body>` and `<html>`: a `body { overflow: hidden }` lock alone does *not* stop the
 * page when `<html>` is the scroller (e.g. a global `overflow-y: scroll`, as Storybook sets), because
 * body-overflow only propagates to the viewport when `<html>`'s overflow is `visible`. The width of
 * the removed scrollbar is added as `padding-right` on `<html>` so the page doesn't shift.
 *
 * Lock ownership is shared across all callers via a single module-level counter, so nested or
 * concurrent overlays compose correctly. Must be called in an injection context.
 */
export function useScrollLock(active: Signal<boolean>): void {
    const document = inject(DOCUMENT);
    let isLocked = false;

    const lock = () => {
        if (isLocked) {
            return;
        }

        if (scrollLockCount === 0) {
            const html = document.documentElement;
            const body = document.body;
            const win = document.defaultView;
            const scrollbarWidth = win ? Math.max(0, win.innerWidth - html.clientWidth) : 0;

            original = {
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

        scrollLockCount++;
        isLocked = true;
    };

    const unlock = () => {
        if (!isLocked) {
            return;
        }

        scrollLockCount--;
        isLocked = false;

        if (scrollLockCount === 0 && original !== null) {
            const html = document.documentElement;
            document.body.style.overflow = original.bodyOverflow;
            html.style.overflow = original.htmlOverflow;
            html.style.paddingRight = original.htmlPaddingRight;
            original = null;
        }
    };

    effect(() => {
        if (active()) {
            lock();
        } else {
            unlock();
        }
    });

    inject(DestroyRef).onDestroy(unlock);
}
