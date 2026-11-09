import { describe, expect, it } from 'vitest';
import { createPointerMoveGuard } from '../src/dom/pointer-events';

const move = (clientX: number, clientY: number, delta = 0) =>
    Object.assign(new MouseEvent('pointermove', { clientX, clientY }), { movementX: delta, movementY: 0 });

describe('viewport-aware pointer guard', () => {
    it('recognizes real travel with zero movement deltas and keeps its result across capture/item handlers', () => {
        const guard = createPointerMoveGuard({ clientX: 10, clientY: 20 });
        const event = move(30, 20);
        expect(guard(event)).toBe(false);
        expect(guard(event)).toBe(false);
        expect(guard(move(30, 20))).toBe(true);
        expect(guard(move(30, 40))).toBe(false);
    });
    it('suppresses same-position scroll events, including an unknown first stationary event', () => {
        const guard = createPointerMoveGuard();
        expect(guard(move(20, 20))).toBe(true);
        expect(guard(move(20, 20))).toBe(true);
        expect(guard(move(20, 20, 1))).toBe(false);
    });
    it('keeps movement history local to its owner', () => {
        const a = createPointerMoveGuard({ clientX: 0, clientY: 0 });
        const b = createPointerMoveGuard({ clientX: 20, clientY: 20 });
        expect(a(move(20, 20))).toBe(false);
        expect(b(move(20, 20))).toBe(true);
    });
});
