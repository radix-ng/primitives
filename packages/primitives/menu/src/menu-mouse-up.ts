import { rdxPlatform } from '@radix-ng/primitives/core';
import type { RdxMenuRootContext } from './menu-root';

/** How far the cursor may drift and still count as the same point (Base UI). */
const CURSOR_POINT_TOLERANCE = 1;

/**
 * Whether a `mouseup` over an item should activate it — the "press the trigger, drag onto an item,
 * release" gesture, as opposed to the click path.
 *
 * A context menu is the interesting case. Its own release is what finished the opening right-click,
 * so an item under the cursor must not be selected by it; the gesture origin recorded by the trigger
 * identifies that release. Beyond it, only macOS treats a right-button release over an item as a
 * selection — on Windows and Linux that release belongs to the opening gesture and never selects
 * (Base UI `useMenuItemCommonProps`).
 */
export function shouldActivateOnMouseUp(event: MouseEvent, rootContext: RdxMenuRootContext | null): boolean {
    if (!rootContext) {
        return false;
    }

    if (rootContext.isContextMenu()) {
        const origin = rootContext.consumeInitialCursorPoint();
        if (
            origin &&
            Math.abs(event.clientX - origin.x) <= CURSOR_POINT_TOLERANCE &&
            Math.abs(event.clientY - origin.y) <= CURSOR_POINT_TOLERANCE
        ) {
            return false;
        }

        if (!rdxPlatform.os.mac || event.button !== 2) {
            return false;
        }
    } else if (event.button !== 0) {
        return false;
    }

    return rootContext.allowMouseUpTrigger();
}
