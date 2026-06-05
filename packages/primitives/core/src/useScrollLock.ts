import { DOCUMENT } from '@angular/common';
import { DestroyRef, effect, inject, Signal } from '@angular/core';

/**
 * Process-wide ownership of `document.body`'s overflow while one or more overlays lock scrolling.
 *
 * A single shared counter across every primitive that locks scroll is essential: with separate
 * per-primitive counters, a popover and a dialog open at the same time would each capture the
 * other's already-locked `overflow: hidden` as the "original" value and restore it on close,
 * leaving the page permanently unscrollable.
 */
let originalBodyOverflow: string | null = null;
let scrollLockCount = 0;

/**
 * Locks `document.body` scrolling while `active()` is `true`, and restores the original overflow
 * when it becomes `false` or the calling context is destroyed.
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

        const body = document.body;

        if (scrollLockCount === 0) {
            originalBodyOverflow = body.style.overflow;
            body.style.overflow = 'hidden';
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

        if (scrollLockCount === 0 && originalBodyOverflow !== null) {
            document.body.style.overflow = originalBodyOverflow;
            originalBodyOverflow = null;
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
