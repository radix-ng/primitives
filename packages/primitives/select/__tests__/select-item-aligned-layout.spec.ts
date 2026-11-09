import {
    expandedItemAlignedLayout,
    finishItemAlignedLayout,
    initialItemAlignedLayout,
    type ItemAlignedMeasurements
} from '../src/select-item-aligned-layout';

const box = (left: number, top: number, width: number, height: number) => ({
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height
});
const measurements: ItemAlignedMeasurements = {
    trigger: box(100, 180, 200, 40),
    positioner: box(105, 225, 200, 1128),
    value: box(110, 190, 50, 20),
    text: box(120, 525, 50, 14),
    rtl: false,
    viewportWidth: 640,
    viewportHeight: 480,
    marginTop: 10,
    marginBottom: 10,
    minHeight: 100,
    borderBottom: 1,
    scrollHeight: 1128
};

describe('item-aligned geometry policy', () => {
    it('aligns text and allocates the viewport before scrolling the selected row', () => {
        const initial = initialItemAlignedLayout(measurements);
        expect(initial.left).toBe(95);
        expect(initial.availableHeight).toBe(460);
        expect(initial.height).toBe(460);
        expect(initial.scrollTop).toBe(118);
        expect(finishItemAlignedLayout(initial, 800)).toMatchObject({
            height: 460,
            bottom: 0,
            fallback: false,
            scrollTop: 118
        });
    });
    it('keeps a short list intrinsic rather than forcing five item heights', () => {
        const initial = initialItemAlignedLayout({
            ...measurements,
            positioner: box(105, 225, 200, 122),
            text: undefined,
            scrollHeight: 120
        });
        expect(finishItemAlignedLayout(initial, 0)).toMatchObject({ height: 122, top: 169, fallback: false });
    });
    it.each([10, 450])('falls back at viewport edge %s', (top) => {
        const initial = initialItemAlignedLayout({ ...measurements, trigger: box(100, top, 200, 30) });
        expect(finishItemAlignedLayout(initial, 800).fallback).toBe(true);
    });
    it('clamps inline placement to the viewport in both directions', () => {
        for (const rtl of [false, true]) {
            const left = initialItemAlignedLayout({ ...measurements, rtl, value: box(620, 190, 50, 20) }).left;
            expect(left).toBe(435);
        }
    });
    it('expands down before retaining scroll and preserves overshoot at the height limit', () => {
        expect(expandedItemAlignedLayout(200, 400, 50, 900, false)).toEqual({ height: 250, scrollTop: 0 });
        expect(expandedItemAlignedLayout(380, 400, 40, 900, false)).toEqual({ height: 400, scrollTop: 20 });
    });
    it('expands up and settles fractional edge movement without negative height changes', () => {
        expect(expandedItemAlignedLayout(200, 400, 850, 900, true)).toEqual({ height: 250, scrollTop: Infinity });
        expect(expandedItemAlignedLayout(200, 400, 900.5, 900, true)).toEqual({ height: 200, scrollTop: Infinity });
    });
});
