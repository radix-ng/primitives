import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, effect, inject, PLATFORM_ID, Signal } from '@angular/core';

interface BodyPointerEventsState {
    /** The body's saved inline `pointer-events`, captured on the `0 -> 1` transition for this document. */
    original: string | null;
    /** Number of active locks sharing this document's saved state. */
    count: number;
}

/**
 * Per-`Document` ownership of `<body>`'s inline `pointer-events` while one or more dismissable layers
 * disable outside pointer events (ADR 0015 §6 / Phase 1 — the WeakMap replacement for the legacy engine's
 * module-global `originalBodyPointerEvents`).
 *
 * Keyed by the owner `Document` (a `WeakMap`) so locks in different documents — iframes, multi-document
 * test environments — never share or corrupt each other's saved value. Within one document a single
 * shared counter is essential: with separate per-layer counters two open layers would each capture the
 * other's already-`none` value as the "original" and restore it on close, leaving the body permanently
 * non-interactive. Mirrors the per-`Document` scroll-lock state in `use-scroll-lock.ts`.
 */
const bodyPointerEventsStates = new WeakMap<Document, BodyPointerEventsState>();

function getBodyPointerEventsState(document: Document): BodyPointerEventsState {
    let state = bodyPointerEventsStates.get(document);
    if (!state) {
        state = { original: null, count: 0 };
        bodyPointerEventsStates.set(document, state);
    }
    return state;
}

/**
 * Sets `<body>`'s `pointer-events: none` while `active()` is `true`, and restores the original value when
 * it becomes `false` or the calling context is destroyed. This blocks interaction with everything outside
 * the dismissable layers; each layer re-enables itself with its own `pointer-events: auto` (the layer's
 * concern, not this primitive's).
 *
 * Ownership is shared across all callers in the same document via a per-`Document` counter, so stacked or
 * concurrent layers compose correctly. No-op on the server. Must be called in an injection context.
 */
export function useBodyPointerEventsLock(active: Signal<boolean>): void {
    const document = inject(DOCUMENT);
    const isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
    let isLocked = false;

    const lock = () => {
        if (isLocked) {
            return;
        }

        const state = getBodyPointerEventsState(document);

        if (state.count === 0) {
            state.original = document.body.style.pointerEvents;
            document.body.style.pointerEvents = 'none';
        }

        state.count++;
        isLocked = true;
    };

    const unlock = () => {
        if (!isLocked) {
            return;
        }

        const state = getBodyPointerEventsState(document);
        state.count--;
        isLocked = false;

        if (state.count === 0 && state.original !== null) {
            document.body.style.pointerEvents = state.original;
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

    inject(DestroyRef).onDestroy(unlock);
}
