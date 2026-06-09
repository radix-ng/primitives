import { isPlatformBrowser } from '@angular/common';
import { assertInInjectionContext, DestroyRef, ElementRef, inject, PLATFORM_ID } from '@angular/core';

export interface RdxPointerDragHandlers {
    /** Whether a press may begin a drag (e.g. enabled, not on an opt-out element, at a scroll edge). */
    canStart: (event: PointerEvent) => boolean;
    /** A drag actually began (the pointer moved past the start threshold). */
    onStart: (event: PointerEvent) => void;
    /** Pointer moved during a drag. Return `false` to end the gesture early (treated as not committed). */
    onMove: (event: PointerEvent) => void | boolean;
    /** The drag ended. `committed` is true only for a normal `pointerup`, false for cancel/lost-capture/early-stop. */
    onEnd: (event: PointerEvent, committed: boolean) => void;
}

/** Pointer travel (px) before a press becomes a drag — below this a press stays a click/tap. */
const DRAG_THRESHOLD = 4;

/**
 * Shared pointer-drag lifecycle for gesture primitives (drawer swipe, toast swipe, etc.).
 *
 * A press only becomes a drag once the pointer moves past {@link DRAG_THRESHOLD}; until then it is a
 * plain tap, so clicks on buttons inside the element keep working (the gesture never captures the
 * pointer for a tap). Once dragging, the pointer is captured so a drag that leaves the element still
 * completes, and `lostpointercapture` / `pointercancel` count as a non-committed end — a swallowed
 * `pointerup` (native context menu, OS gesture, tab switch) can never wedge the gesture. Only the
 * primary pointer is tracked, so a second finger can't start a parallel gesture. No-op outside the
 * browser, keeping SSR safe.
 *
 * `onEnd` is NOT called if the host is destroyed mid-drag — callers that pair `onStart`/`onEnd`
 * (e.g. to pause/resume timers) should balance that case in their own `DestroyRef` cleanup.
 *
 * Must be called from an injection context (a directive/component constructor).
 */
export function usePointerDrag(handlers: RdxPointerDragHandlers): void {
    assertInInjectionContext(usePointerDrag);

    if (!isPlatformBrowser(inject(PLATFORM_ID))) {
        return;
    }

    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    let pointerId: number | null = null;
    let downEvent: PointerEvent | null = null;
    let dragging = false;

    const removeWindowListeners = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerUp);
    };

    const reset = (event: PointerEvent, committed: boolean) => {
        if (pointerId === null) {
            return;
        }

        const wasDragging = dragging;

        try {
            host.releasePointerCapture?.(pointerId);
        } catch {
            // Capture may already be gone (e.g. on lostpointercapture); ignore.
        }

        pointerId = null;
        downEvent = null;
        dragging = false;
        removeWindowListeners();

        // A press that never crossed the threshold was a tap — leave the click untouched.
        if (wasDragging) {
            handlers.onEnd(event, committed);
        }
    };

    function onPointerMove(event: PointerEvent) {
        if (event.pointerId !== pointerId || !downEvent) {
            return;
        }

        if (!dragging) {
            const dx = event.clientX - downEvent.clientX;
            const dy = event.clientY - downEvent.clientY;

            if (Math.hypot(dx, dy) < DRAG_THRESHOLD) {
                return;
            }

            dragging = true;

            try {
                host.setPointerCapture?.(pointerId);
            } catch {
                // Not all environments support pointer capture; the window listeners still drive the gesture.
            }

            handlers.onStart(downEvent);
        }

        if (handlers.onMove(event) === false) {
            reset(event, false);
        }
    }

    function onPointerUp(event: PointerEvent) {
        if (event.pointerId !== pointerId) {
            return;
        }

        reset(event, event.type === 'pointerup');
    }

    const onLostCapture = (event: PointerEvent) => {
        if (event.pointerId === pointerId) {
            reset(event, false);
        }
    };

    const onPointerDown = (event: PointerEvent) => {
        if (pointerId !== null || !event.isPrimary || event.button !== 0 || !handlers.canStart(event)) {
            return;
        }

        pointerId = event.pointerId;
        downEvent = event;
        dragging = false;

        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('lostpointercapture', onLostCapture as EventListener);

    inject(DestroyRef).onDestroy(() => {
        host.removeEventListener('pointerdown', onPointerDown);
        host.removeEventListener('lostpointercapture', onLostCapture as EventListener);
        removeWindowListeners();
    });
}
