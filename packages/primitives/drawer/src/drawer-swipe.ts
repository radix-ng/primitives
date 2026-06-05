import { assertInInjectionContext, DestroyRef, effect, inject, Signal } from '@angular/core';
import { clamp } from '@radix-ng/primitives/core';
import { usePointerDrag } from './drawer-pointer';
import { dismissUnitVector } from './drawer-snap';

/**
 * Direction a swipe travels to dismiss the drawer. Mirrors Base UI's `swipeDirection`:
 * `'down'` is the default (bottom sheet). The *visual* side of the drawer is consumer CSS;
 * this only controls the dismiss gesture and the data/CSS-variable contract below.
 */
export type RdxDrawerSwipeDirection = 'up' | 'down' | 'left' | 'right';

/** The decision a release resolves to: dismiss the drawer, or rest at a snap offset (px). */
export type RdxDrawerRelease = { type: 'dismiss' } | { type: 'snap'; offset: number };

export interface RdxDrawerSwipeConfig {
    /** The popup element the gesture lives on (CSS variables + data attributes are written here). */
    element: () => HTMLElement;
    /** Active swipe direction. */
    direction: Signal<RdxDrawerSwipeDirection>;
    /** Whether the gesture is currently armed (typically `open`). */
    enabled: Signal<boolean>;
    /**
     * Resting translate magnitude (px toward dismissal) of the active snap point; `0` is fully open
     * and the default when there are no snap points. The popup keeps this in sync with snap state.
     */
    restingOffset: Signal<number>;
    /**
     * Decide where a release lands. `projected` is the resting offset the drag reached (px toward
     * dismissal, may be negative past fully-open); `velocity` is signed px/ms toward dismissal;
     * `canDismiss` is false for a cancelled gesture or a closed drawer.
     */
    resolveRelease: (projected: number, velocity: number, canDismiss: boolean) => RdxDrawerRelease;
    /** Called once per release that resolves to dismissal. */
    onDismiss: (event: PointerEvent) => void;
    /** Called with the 0..1 live dismiss progress so siblings (backdrop) can react; `0` at rest. */
    onProgress?: (strength: number) => void;
}

/** iOS-style rubber-band resistance for dragging *past* the fully-open position. */
const RUBBER_BAND_CONSTANT = 0.55;
/** Idle time (ms) since the last movement past which a release counts as a hold, not a flick. */
const FLICK_IDLE_MS = 66;

const rubberBand = (distance: number, dimension: number) =>
    dimension <= 0 ? 0 : (1 - 1 / ((Math.abs(distance) * RUBBER_BAND_CONSTANT) / dimension + 1)) * dimension;

const isVertical = (direction: RdxDrawerSwipeDirection) => direction === 'up' || direction === 'down';

/**
 * Whether a scrollable region between `target` and `boundary` can still scroll in the direction the
 * swipe would reveal — in which case the gesture must yield to scrolling instead of dismissing.
 */
function scrollGuards(target: Element | null, boundary: HTMLElement, direction: RdxDrawerSwipeDirection): boolean {
    let node = target;

    while (node && node !== boundary) {
        if (node instanceof HTMLElement) {
            const style = getComputedStyle(node);
            const vertical = isVertical(direction);
            const overflow = vertical ? style.overflowY : style.overflowX;

            if (overflow === 'auto' || overflow === 'scroll') {
                const scrollPos = vertical ? node.scrollTop : node.scrollLeft;
                const maxScroll = vertical
                    ? node.scrollHeight - node.clientHeight
                    : node.scrollWidth - node.clientWidth;

                // Pulling the drawer in the dismiss direction reveals the *start* edge for
                // down/right and the *end* edge for up/left; only swipe when already at that edge.
                const atStartEdge = scrollPos <= 0;
                const atEndEdge = scrollPos >= maxScroll - 1;
                const needsStartEdge = direction === 'down' || direction === 'right';

                if (maxScroll > 0 && (needsStartEdge ? !atStartEdge : !atEndEdge)) {
                    return true;
                }
            }
        }

        node = node.parentElement;
    }

    return false;
}

/**
 * Headless swipe gesture for the drawer popup: dismiss, snap-back, and movement between snap points.
 *
 * Writes a small contract the consumer styles against (no transform is applied for you, keeping the
 * primitive headless):
 * - `--drawer-swipe-movement-x` / `--drawer-swipe-movement-y` — signed px offset along the axis,
 *   including the active snap point's resting offset while idle.
 * - `--drawer-swipe-strength` — 0..1 live dismiss progress (`0` at rest).
 * - `[data-swiping]` — present while a gesture is active (drive `transition: none` off this).
 * - `[data-swipe-direction]` — the active direction.
 * - `[data-swipe-dismiss]` — present briefly when a release commits to dismissal.
 *
 * While idle the movement variables hold the active snap offset; releasing without dismissing writes
 * the target offset so the consumer's `transition` animates between snap points and home.
 *
 * Must be called from an injection context (a directive/component constructor).
 */
export function useDrawerSwipe(config: RdxDrawerSwipeConfig): void {
    assertInInjectionContext(useDrawerSwipe);

    const element = () => config.element();
    const axisSize = () => (isVertical(config.direction()) ? element().offsetHeight : element().offsetWidth);

    let active = false;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;
    let pendingProjected = 0;
    let lastProjected = 0;
    let lastTime = 0;
    let velocity = 0;
    let rafId = 0;

    const cancelRaf = () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
    };

    /** Write the movement variables for a translate magnitude (px) and a 0..1 dismiss strength. */
    const writeMovement = (offset: number, strength: number) => {
        const unit = dismissUnitVector(config.direction());
        const el = element();
        el.style.setProperty('--drawer-swipe-movement-x', `${unit.x * offset}px`);
        el.style.setProperty('--drawer-swipe-movement-y', `${unit.y * offset}px`);
        el.style.setProperty('--drawer-swipe-strength', `${strength}`);
    };

    const writeLive = () => {
        rafId = 0;
        const size = axisSize();
        const visual = pendingProjected >= 0 ? pendingProjected : -rubberBand(pendingProjected, size);
        const strength = clamp(pendingProjected / (size || 1), 0, 1);
        writeMovement(visual, strength);
        config.onProgress?.(strength);
    };

    const scheduleWrite = () => {
        if (!rafId) {
            rafId = requestAnimationFrame(writeLive);
        }
    };

    /** Settle to a resting snap offset (animates via the consumer's transition); rest is not dismissing. */
    const settleTo = (offset: number) => {
        cancelRaf();
        writeMovement(offset, 0);
        config.onProgress?.(0);
    };

    usePointerDrag({
        canStart: (event) => {
            if (!config.enabled()) {
                return false;
            }

            const target = event.target as Element | null;

            if (target?.closest('[data-base-ui-swipe-ignore]')) {
                return false;
            }

            return !scrollGuards(target, element(), config.direction());
        },
        onStart: (event) => {
            active = true;
            startX = event.clientX;
            startY = event.clientY;
            startOffset = config.restingOffset();
            pendingProjected = startOffset;
            lastProjected = startOffset;
            lastTime = event.timeStamp;
            velocity = 0;

            const el = element();
            el.setAttribute('data-swiping', '');
            el.removeAttribute('data-swipe-dismiss');
        },
        onMove: (event) => {
            // Abort if the drawer closed mid-drag; the end handler settles back.
            if (!config.enabled()) {
                return false;
            }

            const unit = dismissUnitVector(config.direction());
            const drag = (event.clientX - startX) * unit.x + (event.clientY - startY) * unit.y;
            pendingProjected = startOffset + drag;

            const dt = event.timeStamp - lastTime;

            if (dt > 0) {
                velocity = (pendingProjected - lastProjected) / dt;
                lastProjected = pendingProjected;
                lastTime = event.timeStamp;
            }

            scheduleWrite();
            return true;
        },
        onEnd: (event, committed) => {
            active = false;
            cancelRaf();
            element().removeAttribute('data-swiping');

            // A pause before lift is a hold, not a flick: drop stale velocity.
            if (event.timeStamp - lastTime > FLICK_IDLE_MS) {
                velocity = 0;
            }

            const release = config.resolveRelease(pendingProjected, velocity, committed && config.enabled());

            if (release.type === 'dismiss') {
                element().setAttribute('data-swipe-dismiss', '');
                config.onDismiss(event);
                return;
            }

            settleTo(release.offset);
        }
    });

    // Keep the idle resting offset in sync with snap state and reset live progress to 0 at rest.
    // Skipped while dragging (the gesture owns the variables) and writes nothing while closed so the
    // exit keyframe starts from the last visible offset.
    effect(() => {
        const offset = config.restingOffset();
        const enabled = config.enabled();

        if (active) {
            return;
        }

        if (enabled) {
            writeMovement(offset, 0);
        }

        config.onProgress?.(0);
    });

    inject(DestroyRef).onDestroy(cancelRaf);
}
