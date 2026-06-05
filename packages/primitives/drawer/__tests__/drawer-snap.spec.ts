import { buildSnapEntries, resolveSnapTarget, snapPointReveal } from '@radix-ng/primitives/drawer';

describe('drawer snap helpers', () => {
    describe('snapPointReveal', () => {
        it('treats numbers in (0,1] as fractions of size', () => {
            expect(snapPointReveal(0.5, 400)).toBe(200);
            expect(snapPointReveal(1, 400)).toBe(400);
        });

        it('treats numbers > 1 as pixels, clamped to size', () => {
            expect(snapPointReveal(160, 400)).toBe(160);
            expect(snapPointReveal(800, 400)).toBe(400);
        });

        it('parses px, %, and bare string values', () => {
            expect(snapPointReveal('160px', 400)).toBe(160);
            expect(snapPointReveal('40%', 400)).toBe(160);
            expect(snapPointReveal('0.5', 400)).toBe(200);
            expect(snapPointReveal('300', 400)).toBe(300);
        });

        it('resolves rem against the root font size', () => {
            expect(snapPointReveal('10rem', 400)).toBe(160);
            expect(snapPointReveal('10rem', 400, 10)).toBe(100);
        });
    });

    describe('buildSnapEntries', () => {
        it('computes offsets (size - reveal) and sorts most-open first', () => {
            const entries = buildSnapEntries(['160px', 0.5, 1], 400);

            expect(entries.map((entry) => entry.value)).toEqual([1, 0.5, '160px']);
            expect(entries.map((entry) => entry.offset)).toEqual([0, 200, 240]);
        });
    });

    describe('resolveSnapTarget', () => {
        const offsets = [0, 200, 240];
        const size = 400;

        it('picks the nearest point at low velocity', () => {
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 0,
                    projected: 190,
                    velocity: 0,
                    size,
                    sequential: false,
                    canDismiss: true
                })
            ).toEqual({ index: 1 });
        });

        it('lets a fast flick skip toward dismissal', () => {
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 0,
                    projected: 0,
                    velocity: 1,
                    size,
                    sequential: false,
                    canDismiss: true
                })
            ).toEqual({ index: 1 });
        });

        it('dismisses when the projection lands past the lowest point', () => {
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 2,
                    projected: 360,
                    velocity: 0,
                    size,
                    sequential: false,
                    canDismiss: true
                })
            ).toEqual({ dismiss: true });
        });

        it('never dismisses when dismissal is disallowed', () => {
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 2,
                    projected: 360,
                    velocity: 0,
                    size,
                    sequential: false,
                    canDismiss: false
                })
            ).toEqual({ index: 2 });
        });

        it('steps at most one point in sequential mode', () => {
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 0,
                    projected: 120,
                    velocity: 5,
                    size,
                    sequential: true,
                    canDismiss: true
                })
            ).toEqual({ index: 1 });
            expect(
                resolveSnapTarget({
                    offsets,
                    activeIndex: 0,
                    projected: 80,
                    velocity: 5,
                    size,
                    sequential: true,
                    canDismiss: true
                })
            ).toEqual({ index: 0 });
        });
    });
});
