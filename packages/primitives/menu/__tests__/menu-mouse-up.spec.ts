// @vitest-environment jsdom
import { signal } from '@angular/core';
import { rdxPlatform } from '@radix-ng/primitives/core';
import { describe, expect, it } from 'vitest';
import { shouldActivateOnMouseUp } from '../src/menu-mouse-up';
import type { RdxMenuRootContext } from '../src/menu-root';

/** The three context slots the rule reads, with a consumable gesture origin. */
function context(options: {
    isContextMenu?: boolean;
    allowMouseUpTrigger?: boolean;
    initialCursorPoint?: { x: number; y: number } | null;
}): RdxMenuRootContext {
    let point = options.initialCursorPoint ?? null;
    return {
        isContextMenu: signal(options.isContextMenu ?? false),
        allowMouseUpTrigger: signal(options.allowMouseUpTrigger ?? true),
        consumeInitialCursorPoint: () => {
            const current = point;
            point = null;
            return current;
        }
    } as unknown as RdxMenuRootContext;
}

function mouseUp(button: number, clientX = 0, clientY = 0): MouseEvent {
    return new MouseEvent('mouseup', { button, clientX, clientY });
}

describe('shouldActivateOnMouseUp', () => {
    describe('a menu opened from a trigger', () => {
        it('activates on a primary release once the trigger allows it', () => {
            expect(shouldActivateOnMouseUp(mouseUp(0), context({}))).toBe(true);
        });

        it('ignores a release the trigger has not allowed, and any non-primary button', () => {
            expect(shouldActivateOnMouseUp(mouseUp(0), context({ allowMouseUpTrigger: false }))).toBe(false);
            expect(shouldActivateOnMouseUp(mouseUp(2), context({}))).toBe(false);
            expect(shouldActivateOnMouseUp(mouseUp(1), context({}))).toBe(false);
        });

        it('needs no context to be safe', () => {
            expect(shouldActivateOnMouseUp(mouseUp(0), null)).toBe(false);
        });
    });

    describe('a context menu', () => {
        it('ignores the release that ended the opening right-click', () => {
            const rootContext = context({ isContextMenu: true, initialCursorPoint: { x: 100, y: 100 } });
            // Same point (within the 1px tolerance) — this is the gesture's own release.
            expect(shouldActivateOnMouseUp(mouseUp(2, 101, 100), rootContext)).toBe(false);
        });

        it('consumes the gesture origin, so a later release is judged on its own', () => {
            const rootContext = context({ isContextMenu: true, initialCursorPoint: { x: 100, y: 100 } });
            shouldActivateOnMouseUp(mouseUp(2, 100, 100), rootContext);

            // Second release: the origin is gone, so only the platform rule below decides.
            expect(shouldActivateOnMouseUp(mouseUp(2, 240, 320), rootContext)).toBe(rdxPlatform.os.mac);
        });

        it('never activates on a primary release', () => {
            // The drag-and-release gesture is a right-button one; a left click goes through `click`.
            const rootContext = context({ isContextMenu: true });
            expect(shouldActivateOnMouseUp(mouseUp(0, 240, 320), rootContext)).toBe(false);
        });

        it('activates on a right-button release away from the origin only on macOS', () => {
            // Windows and Linux give that release to the opening gesture; macOS treats it as a pick.
            // The unit suite runs as a non-Apple platform, so this asserts the non-macOS branch.
            const rootContext = context({ isContextMenu: true, initialCursorPoint: { x: 10, y: 10 } });
            expect(rdxPlatform.os.mac).toBe(false);
            expect(shouldActivateOnMouseUp(mouseUp(2, 240, 320), rootContext)).toBe(false);
        });
    });
});
