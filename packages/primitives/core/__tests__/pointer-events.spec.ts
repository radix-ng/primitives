// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { rdxPlatform } from '../src/dom/platform';
import { isStationaryWebKitPointer } from '../src/dom/pointer-events';

/** A pointer move carrying explicit deltas (jsdom's `MouseEvent` does not implement `movementX`). */
function move(movementX: number, movementY: number): MouseEvent {
    return Object.assign(new MouseEvent('pointermove'), { movementX, movementY });
}

describe('isStationaryWebKitPointer', () => {
    it('never suppresses a move outside WebKit', () => {
        // Chromium and Gecko report real deltas, and a genuine zero-delta move there (a tap, a
        // programmatic dispatch) must keep working — only WebKit invents these events.
        expect(rdxPlatform.engine.webkit).toBe(false);
        expect(isStationaryWebKitPointer(move(0, 0))).toBe(false);
        expect(isStationaryWebKitPointer(move(4, 0))).toBe(false);
    });

    it('tolerates events without movement data', () => {
        // jsdom omits `movementX` entirely; synthetic events in the unit suite must not be swallowed.
        expect(isStationaryWebKitPointer(new MouseEvent('pointermove'))).toBe(false);
    });
});
