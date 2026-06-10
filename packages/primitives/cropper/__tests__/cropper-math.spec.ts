import { describe, expect, it } from 'vitest';
import { calculateCropData, CropperGeometry, restrictOffset } from '../src/cropper-math';

describe('restrictOffset', () => {
    // Wrapper 200x100 inside a 100x100 crop window: horizontal overflow only.
    const geometry: CropperGeometry = { wrapperWidth: 200, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };

    it('returns {0,0} when the geometry is not ready', () => {
        expect(restrictOffset(50, 50, 1, { ...geometry, wrapperWidth: 0 })).toEqual({ x: 0, y: 0 });
        expect(restrictOffset(50, 50, 1, { ...geometry, cropHeight: 0 })).toEqual({ x: 0, y: 0 });
    });

    it('passes through an offset that keeps the image covering the crop window', () => {
        // maxDragX = (200 - 100) / 2 = 50; maxDragY = (100 - 100) / 2 = 0.
        expect(restrictOffset(30, 0, 1, geometry)).toEqual({ x: 30, y: 0 });
    });

    it('clamps each axis independently to its allowed travel', () => {
        // x clamps to ±50, y has no slack (clamps to 0).
        expect(restrictOffset(80, 25, 1, geometry)).toEqual({ x: 50, y: 0 });
        expect(restrictOffset(-80, 0, 1, geometry)).toEqual({ x: -50, y: 0 });
    });

    it('scales the allowed travel with zoom', () => {
        // zoom 2 → maxDragX = (400 - 100) / 2 = 150, maxDragY = (200 - 100) / 2 = 50.
        expect(restrictOffset(120, 40, 2, geometry)).toEqual({ x: 120, y: 40 });
        expect(restrictOffset(200, 80, 2, geometry)).toEqual({ x: 150, y: 50 });
    });
});

describe('calculateCropData', () => {
    it('returns null when the image or geometry is not ready', () => {
        const geometry: CropperGeometry = { wrapperWidth: 100, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        expect(calculateCropData(0, 0, 1, geometry, { width: null, height: null })).toBeNull();
        expect(calculateCropData(0, 0, 1, { ...geometry, wrapperWidth: 0 }, { width: 1000, height: 1000 })).toBeNull();
    });

    it('maps the whole image at zoom 1 with no offset (square image, square crop)', () => {
        const geometry: CropperGeometry = { wrapperWidth: 100, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        expect(calculateCropData(0, 0, 1, geometry, { width: 1000, height: 1000 })).toEqual({
            x: 0,
            y: 0,
            width: 1000,
            height: 1000
        });
    });

    it('returns the centered half-size crop at zoom 2', () => {
        const geometry: CropperGeometry = { wrapperWidth: 100, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        expect(calculateCropData(0, 0, 2, geometry, { width: 1000, height: 1000 })).toEqual({
            x: 250,
            y: 250,
            width: 500,
            height: 500
        });
    });

    it('shifts the crop toward an edge as the image is panned', () => {
        const geometry: CropperGeometry = { wrapperWidth: 100, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        // Panning the image right (+x) reveals the left part of the source → crop x moves to 0.
        expect(calculateCropData(50, 0, 2, geometry, { width: 1000, height: 1000 })).toEqual({
            x: 0,
            y: 250,
            width: 500,
            height: 500
        });
    });

    it('center-crops a landscape image fitted to a square crop window', () => {
        // Image 2000x1000, square crop → wrapper 200x100 (cover height), baseScale = 2000/200 = 10.
        const geometry: CropperGeometry = { wrapperWidth: 200, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        expect(calculateCropData(0, 0, 1, geometry, { width: 2000, height: 1000 })).toEqual({
            x: 500,
            y: 0,
            width: 1000,
            height: 1000
        });
    });

    it('returns null when the crop collapses past the image edge', () => {
        const geometry: CropperGeometry = { wrapperWidth: 100, wrapperHeight: 100, cropWidth: 100, cropHeight: 100 };
        // offsetX = -100 pushes sx to the right image edge so the clamped width is 0.
        expect(calculateCropData(-100, 0, 1, geometry, { width: 1000, height: 1000 })).toBeNull();
    });
});
