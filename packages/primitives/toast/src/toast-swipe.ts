import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import { usePointerDrag } from '@radix-ng/primitives/core';

/** Direction a swipe travels to dismiss a toast. */
export type RdxToastSwipeDirection = 'up' | 'down' | 'left' | 'right';

/** Unit vectors per dismiss direction (screen coordinates: +y is down). */
const UNIT: Record<RdxToastSwipeDirection, { x: number; y: number }> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 }
};

/** Default travel (px) past which a release dismisses. */
const DEFAULT_THRESHOLD = 45;
/** Signed velocity (px/ms) toward the dismiss direction that flicks a toast away. */
const FLICK_VELOCITY = 0.3;
/** iOS-style resistance when dragging opposite the dismiss direction. */
const RUBBER_BAND = 0.5;

export interface RdxToastSwipeConfig {
    /** The toast element the gesture lives on (CSS variables + data attributes are written here). */
    element: () => HTMLElement;
    /** Allowed dismiss directions; the gesture follows whichever the user drags toward most. */
    directions: () => RdxToastSwipeDirection[];
    /** Whether the gesture is armed (false while the toast is leaving). */
    enabled: () => boolean;
    /** Travel (px) past which a release dismisses. Defaults to {@link DEFAULT_THRESHOLD}. */
    threshold?: number;
    /** Called once per release that commits to dismissal. */
    onDismiss: (event: PointerEvent) => void;
    /** Called when a swipe actually begins (e.g. to pause auto-dismiss timers). */
    onPress?: () => void;
    /** Called when a started swipe ends, dismissing or not (balances {@link RdxToastSwipeConfig.onPress}). */
    onRelease?: () => void;
}

/**
 * Headless swipe-to-dismiss for a toast, built on the shared {@link usePointerDrag} lifecycle (which
 * owns pointer capture, the start threshold, window listeners, and tap/cancel handling). This layer
 * adds the toast-specific direction projection, rubber-banding, flick detection, and the styling
 * contract — it applies no transform itself:
 *
 * - `--toast-swipe-movement-x` / `--toast-swipe-movement-y` — signed px offset along the active axis.
 * - `[data-swiping]` — present while a gesture is active (drive `transition: none` off this).
 * - `[data-swipe-direction]` — the active direction.
 * - `[data-swipe-dismiss]` — present briefly when a release commits to dismissal.
 *
 * Mark inner interactive regions with `[data-toast-swipe-ignore]` to opt them out of the gesture.
 * `RdxToastRoot` (the gesture host) sets `touch-action: none` so a touch-drag is not stolen by native
 * scrolling — without it the gesture only works with a mouse, not on touch devices.
 * Must be called from an injection context (a directive constructor).
 */
export function useToastSwipe(config: RdxToastSwipeConfig): void {
    assertInInjectionContext(useToastSwipe);

    const el = () => config.element();
    const axisSize = (direction: RdxToastSwipeDirection | null) =>
        direction === 'left' || direction === 'right' ? el().offsetWidth : el().offsetHeight;

    const rubber = (distance: number, direction: RdxToastSwipeDirection | null) => {
        const size = axisSize(direction) || 1;
        return (1 - 1 / ((Math.abs(distance) * RUBBER_BAND) / size + 1)) * size;
    };

    let active = false;
    let startX = 0;
    let startY = 0;
    let direction: RdxToastSwipeDirection | null = null;
    let pending = 0;
    let lastProjected = 0;
    let lastTime = 0;
    let velocity = 0;

    const write = (offset: number, dir: RdxToastSwipeDirection | null) => {
        const unit = dir ? UNIT[dir] : { x: 0, y: 0 };
        const node = el();
        node.style.setProperty('--toast-swipe-movement-x', `${unit.x * offset}px`);
        node.style.setProperty('--toast-swipe-movement-y', `${unit.y * offset}px`);
    };

    /** Pick the allowed direction the drag points toward most, with its signed projection (px). */
    const project = (dx: number, dy: number) => {
        let best: RdxToastSwipeDirection | null = null;
        let bestProjection = 0;
        for (const dir of config.directions()) {
            const unit = UNIT[dir];
            const projection = dx * unit.x + dy * unit.y;
            if (projection > bestProjection) {
                bestProjection = projection;
                best = dir;
            }
        }
        return { direction: best, projection: bestProjection };
    };

    usePointerDrag({
        canStart: (event) => {
            if (!config.enabled()) {
                return false;
            }
            return !(event.target as Element | null)?.closest('[data-toast-swipe-ignore]');
        },
        onStart: (event) => {
            active = true;
            startX = event.clientX;
            startY = event.clientY;
            direction = null;
            pending = 0;
            lastProjected = 0;
            lastTime = event.timeStamp;
            velocity = 0;

            el().setAttribute('data-swiping', '');
            el().removeAttribute('data-swipe-dismiss');
            config.onPress?.();
        },
        onMove: (event) => {
            // Abort if the toast began leaving mid-drag; the end handler settles back.
            if (!config.enabled()) {
                return false;
            }

            const dx = event.clientX - startX;
            const dy = event.clientY - startY;
            const { direction: dir, projection } = project(dx, dy);

            if (dir) {
                direction = dir;
            }
            el().setAttribute('data-swipe-direction', direction ?? '');

            // Move freely toward the dismiss direction; resist dragging the other way.
            pending = projection >= 0 ? projection : -rubber(projection, direction);

            const dt = event.timeStamp - lastTime;
            if (dt > 0) {
                velocity = (projection - lastProjected) / dt;
                lastProjected = projection;
                lastTime = event.timeStamp;
            }

            write(pending, direction);
            return true;
        },
        onEnd: (event, committed) => {
            active = false;
            el().removeAttribute('data-swiping');

            const threshold = config.threshold ?? DEFAULT_THRESHOLD;
            const dismiss = committed && config.enabled() && (pending >= threshold || velocity >= FLICK_VELOCITY);

            if (dismiss) {
                el().setAttribute('data-swipe-dismiss', '');
                config.onDismiss(event);
            } else {
                // Settle home; the consumer's `transition` animates the snap-back.
                write(0, direction);
            }

            config.onRelease?.();
            direction = null;
        }
    });

    // usePointerDrag does not call onEnd when the host is destroyed mid-gesture; balance the onPress
    // that paused the timers so the manager doesn't stay paused forever.
    inject(DestroyRef).onDestroy(() => {
        if (active) {
            active = false;
            config.onRelease?.();
        }
    });
}
