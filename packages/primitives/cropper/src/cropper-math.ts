import { clamp } from '@radix-ng/primitives/core';

/** A crop rectangle in the source image's natural-pixel coordinate space. */
export type Area = { x: number; y: number; width: number; height: number };

/** The rendered geometry the crop math operates on (all in CSS px, wrapper measured at zoom 1). */
export interface CropperGeometry {
    /** Image-wrapper width at zoom 1. */
    wrapperWidth: number;
    /** Image-wrapper height at zoom 1. */
    wrapperHeight: number;
    /** Crop window width. */
    cropWidth: number;
    /** Crop window height. */
    cropHeight: number;
}

/**
 * Clamp a pan offset so the zoomed image always fully covers the crop window — the user can never
 * drag an image edge inside the crop frame. The offset is measured from the centered position, so the
 * allowed travel on each axis is half the overflow of the scaled wrapper past the crop window.
 *
 * Returns `{ x: 0, y: 0 }` when the geometry is not ready yet (any dimension `<= 0`).
 */
export function restrictOffset(
    offsetX: number,
    offsetY: number,
    zoom: number,
    geometry: CropperGeometry
): { x: number; y: number } {
    const { wrapperWidth, wrapperHeight, cropWidth, cropHeight } = geometry;

    if (wrapperWidth <= 0 || wrapperHeight <= 0 || cropWidth <= 0 || cropHeight <= 0) {
        return { x: 0, y: 0 };
    }

    const maxDragX = Math.max(0, (wrapperWidth * zoom - cropWidth) / 2);
    const maxDragY = Math.max(0, (wrapperHeight * zoom - cropHeight) / 2);

    return {
        x: clamp(offsetX, -maxDragX, maxDragX),
        y: clamp(offsetY, -maxDragY, maxDragY)
    };
}

/**
 * Project the current pan/zoom into a crop rectangle in the source image's natural pixels.
 *
 * The wrapper is centered in the crop window and scaled by `zoom`; `baseScale` converts rendered px
 * back to natural px. The result is rounded and clamped to the image bounds.
 *
 * Returns `null` when the geometry/image is not ready (any dimension `<= 0` or no image), or when the
 * computed crop collapses to zero area.
 */
export function calculateCropData(
    offsetX: number,
    offsetY: number,
    zoom: number,
    geometry: CropperGeometry,
    image: { width: number | null; height: number | null }
): Area | null {
    const { wrapperWidth, wrapperHeight, cropWidth, cropHeight } = geometry;
    const imgW = image.width;
    const imgH = image.height;

    if (!imgW || !imgH || wrapperWidth <= 0 || wrapperHeight <= 0 || cropWidth <= 0 || cropHeight <= 0) {
        return null;
    }

    const scaledWrapperWidth = wrapperWidth * zoom;
    const scaledWrapperHeight = wrapperHeight * zoom;
    const topLeftOffsetX = offsetX + (cropWidth - scaledWrapperWidth) / 2;
    const topLeftOffsetY = offsetY + (cropHeight - scaledWrapperHeight) / 2;
    const baseScale = imgW / wrapperWidth;

    if (isNaN(baseScale) || baseScale === 0) {
        return null;
    }

    const sx = (-topLeftOffsetX * baseScale) / zoom;
    const sy = (-topLeftOffsetY * baseScale) / zoom;
    const sWidth = (cropWidth * baseScale) / zoom;
    const sHeight = (cropHeight * baseScale) / zoom;

    const finalX = clamp(Math.round(sx), 0, imgW);
    const finalY = clamp(Math.round(sy), 0, imgH);
    const finalWidth = clamp(Math.round(sWidth), 0, imgW - finalX);
    const finalHeight = clamp(Math.round(sHeight), 0, imgH - finalY);

    if (finalWidth <= 0 || finalHeight <= 0) {
        return null;
    }

    return { x: finalX, y: finalY, width: finalWidth, height: finalHeight };
}
