import { rdxPlatform } from './platform';

/**
 * Whether a pointer / mouse move carries **no** movement.
 *
 * WebKit fires zero-delta `mousemove` / `pointermove` events when a list scrolls beneath a stationary
 * pointer, so arrowing through a scrolling list yanks the highlight onto whatever item happens to sit
 * under the cursor. Hover-highlight handlers ignore such an event and wait for a real move (Base UI
 * `isStationaryWebKitPointer`, https://github.com/mui/base-ui/issues/4002).
 *
 * A one-shot "ignore the first move after a key press" flag is not enough on its own: WebKit emits a
 * whole run of these events, so the second one would still steal the highlight.
 */
export function isStationaryWebKitPointer(event: MouseEvent | PointerEvent): boolean {
    return rdxPlatform.engine.webkit && event.movementX === 0 && event.movementY === 0;
}

/**
 * Scope-local guard for zero-delta events, including engines that report them during real travel.
 * Observe document moves in capture, then reuse the classification in item handlers. Viewport
 * coordinates distinguish travel from list/page scrolling beneath a stationary pointer.
 */
export function createPointerMoveGuard(initialPosition?: { clientX: number; clientY: number }) {
    let previousPosition = initialPosition;
    let previousEvent: MouseEvent | PointerEvent | undefined;
    let stationary = false;
    return (event: MouseEvent | PointerEvent): boolean => {
        if (previousEvent === event) return stationary;
        stationary =
            event.movementX === 0 &&
            event.movementY === 0 &&
            (!previousPosition ||
                (event.clientX === previousPosition.clientX && event.clientY === previousPosition.clientY));
        previousPosition = { clientX: event.clientX, clientY: event.clientY };
        previousEvent = event;
        return stationary;
    };
}
