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
