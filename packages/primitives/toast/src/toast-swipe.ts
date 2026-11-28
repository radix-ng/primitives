import { assertInInjectionContext, DestroyRef, inject } from '@angular/core';
import { isElement, usePointerDrag } from '@radix-ng/primitives/core';

/** Direction a swipe travels to dismiss a toast. */
export type RdxToastSwipeDirection = 'up' | 'down' | 'left' | 'right';

type Axis = 'x' | 'y';
type Point = Record<Axis, number>;

const AXIS: Record<RdxToastSwipeDirection, Axis> = { up: 'y', down: 'y', left: 'x', right: 'x' };
const SIGN: Record<RdxToastSwipeDirection, number> = { up: -1, down: 1, left: -1, right: 1 };
const REST: Point = { x: 0, y: 0 };
const DEFAULT_THRESHOLD = 40;
const REVERSE_CANCEL_THRESHOLD = 10;
const SWIPE_IGNORE =
    'button,a,input,textarea,[role="button"],[data-base-ui-swipe-ignore],[data-swipe-ignore],[data-toast-swipe-ignore]';

interface Swipe {
    origin?: Point;
    previous: Point;
    baseline: Point;
    axis?: Axis;
    direction?: RdxToastSwipeDirection;
    initialTravel: number;
    offset: Point;
    canceled: boolean;
}

export interface RdxToastSwipeConfig {
    /** The toast element the gesture lives on (CSS variables and data attributes are written here). */
    element: () => HTMLElement;
    /** Allowed dismiss directions. When both axes are enabled, the first displacement locks the axis. */
    directions: () => RdxToastSwipeDirection[];
    /** Whether the gesture is armed (false while the toast is leaving). */
    enabled: () => boolean;
    /** Travel (px) past which a release dismisses. Defaults to 40 CSS px. */
    threshold?: number;
    /** Called once per release that commits to dismissal. */
    onDismiss: (event: PointerEvent) => void;
    /** Called when a swipe begins. */
    onPress?: () => void;
    /** Called when a started swipe ends, balancing onPress. */
    onRelease?: () => void;
}

const displacement = (direction: RdxToastSwipeDirection, point: Point) => point[AXIS[direction]] * SIGN[direction];

function signedDirection(axis: Axis, value: number): RdxToastSwipeDirection {
    return axis === 'x' ? (value > 0 ? 'right' : 'left') : value > 0 ? 'down' : 'up';
}

/** Dampen motion opposite to the allowed directions while keeping the drag on its active axis. */
function damp(value: number, axis: Axis, directions: readonly RdxToastSwipeDirection[]): number {
    return directions.includes(signedDirection(axis, value)) ? value : Math.sign(value) * Math.sqrt(Math.abs(value));
}

/**
 * Writes headless swipe state through CSS variables and data attributes. The shared pointer-drag
 * handler owns capture and cancellation. Interactive descendants and swipe-ignore markers opt out.
 */
export function useToastSwipe(config: RdxToastSwipeConfig): void {
    assertInInjectionContext(useToastSwipe);

    const threshold = config.threshold ?? DEFAULT_THRESHOLD;
    let swipe: Swipe | undefined;

    const write = (offset: Point) => {
        const node = config.element();
        node.style.setProperty('--toast-swipe-movement-x', `${offset.x}px`);
        node.style.setProperty('--toast-swipe-movement-y', `${offset.y}px`);
    };

    usePointerDrag({
        // The first move sets the origin, including the small movement that precedes a touch drag.
        startThreshold: 0,
        canStart: (event) =>
            config.enabled() && !event.composedPath().some((node) => isElement(node) && node.matches(SWIPE_IGNORE)),
        onStart: (event) => {
            const press = { x: event.clientX, y: event.clientY };
            swipe = { previous: press, baseline: { ...press }, initialTravel: 0, offset: REST, canceled: false };
            const node = config.element();
            node.setAttribute('data-swiping', '');
            node.removeAttribute('data-swipe-direction');
            node.removeAttribute('data-swipe-dismiss');
            config.onPress?.();
        },
        onMove: (event) => {
            if (!swipe || !config.enabled()) return false;

            event.preventDefault();
            const point = { x: event.clientX, y: event.clientY };
            const origin = (swipe.origin ??= point);
            // When the pointer reverses, measure cancellation from the new position.
            for (const axis of ['x', 'y'] as const) {
                if ((point[axis] - swipe.previous[axis]) * (point[axis] - swipe.baseline[axis]) < 0) {
                    swipe.baseline[axis] = point[axis];
                }
            }
            swipe.previous = point;

            const delta = { x: point.x - origin.x, y: point.y - origin.y };
            const directions = config.directions();
            const horizontal = directions.includes('left') || directions.includes('right');
            const vertical = directions.includes('up') || directions.includes('down');
            if (!swipe.axis && horizontal && vertical && Math.hypot(delta.x, delta.y) >= 1) {
                swipe.axis = Math.abs(delta.x) > Math.abs(delta.y) ? 'x' : 'y';
            }

            if (!swipe.direction) {
                const axis = swipe.axis ?? (Math.abs(delta.x) >= Math.abs(delta.y) ? 'x' : 'y');
                const direction = signedDirection(axis, delta[axis]);
                if (delta[axis] !== 0 && directions.includes(direction)) {
                    swipe.direction = direction;
                    swipe.initialTravel = displacement(direction, delta);
                    config.element().setAttribute('data-swipe-direction', direction);
                }
            } else {
                const { baseline, direction, initialTravel } = swipe;
                const travel = displacement(direction, { x: point.x - baseline.x, y: point.y - baseline.y });
                if (travel > threshold) {
                    swipe.canceled = false;
                } else if (
                    !(directions.includes('left') && directions.includes('right')) &&
                    !(directions.includes('up') && directions.includes('down')) &&
                    initialTravel - travel >= REVERSE_CANCEL_THRESHOLD
                ) {
                    swipe.canceled = true;
                }
            }

            swipe.offset = {
                x: horizontal && swipe.axis !== 'y' ? damp(delta.x, 'x', directions) : 0,
                y: vertical && swipe.axis !== 'x' ? damp(delta.y, 'y', directions) : 0
            };
            write(swipe.offset);
            return true;
        },
        onEnd: (event, committed) => {
            const completed = swipe;
            swipe = undefined;
            const node = config.element();
            node.removeAttribute('data-swiping');

            const direction =
                committed && completed && !completed.canceled && config.enabled()
                    ? config.directions().find((candidate) => displacement(candidate, completed.offset) > threshold)
                    : undefined;

            try {
                if (direction) {
                    node.setAttribute('data-swipe-direction', direction);
                    node.setAttribute('data-swipe-dismiss', '');
                    config.onDismiss(event);
                } else {
                    node.removeAttribute('data-swipe-direction');
                    write(REST);
                }
            } finally {
                config.onRelease?.();
            }
        }
    });

    // The shared handler releases listeners on destroy. Balance the outstanding timer hold here.
    inject(DestroyRef).onDestroy(() => {
        if (swipe) {
            swipe = undefined;
            config.onRelease?.();
        }
    });
}
