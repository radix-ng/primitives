import { clamp } from '@radix-ng/primitives/core';
import { RdxDrawerSwipeDirection } from './drawer-swipe';

/**
 * A resting position for the drawer along the dismiss axis.
 *
 * - a number in `(0, 1]` — a fraction of the drawer's size (`1` = fully open);
 * - a number `> 1` — an absolute amount of the drawer revealed, in pixels;
 * - a string — `'148px'` (pixels), `'30rem'` (root-em), `'40%'` (fraction of size), or a bare number
 *   as above.
 *
 * Order the `snapPoints` array ascending by openness; the first entry is the default the drawer opens
 * to when `defaultSnapPoint` is not set.
 */
export type RdxDrawerSnapPoint = number | string;

/**
 * Resolve a snap point to the number of pixels of the drawer revealed at that point. `rootFontSize`
 * (px) resolves `rem` units; it defaults to the CSS initial value of `16`.
 */
export function snapPointReveal(value: RdxDrawerSnapPoint, size: number, rootFontSize = 16): number {
    if (typeof value === 'number') {
        return value > 0 && value <= 1 ? value * size : clamp(value, 0, size);
    }

    const trimmed = value.trim();

    if (trimmed.endsWith('%')) {
        return clamp((parseFloat(trimmed) / 100) * size, 0, size);
    }

    const parsed = parseFloat(trimmed);

    if (Number.isNaN(parsed)) {
        return size;
    }

    if (trimmed.endsWith('rem')) {
        return clamp(parsed * rootFontSize, 0, size);
    }

    // A bare unit-less value still follows the number rule (`<= 1` is a fraction).
    return trimmed.endsWith('px')
        ? clamp(parsed, 0, size)
        : parsed > 0 && parsed <= 1
          ? parsed * size
          : clamp(parsed, 0, size);
}

export interface RdxDrawerSnapEntry {
    value: RdxDrawerSnapPoint;
    /** Pixels of the drawer revealed at this point. */
    reveal: number;
    /** Translate magnitude (px) toward dismissal from fully-open; `0` is fully open. */
    offset: number;
}

/**
 * Build the snap entries for a given drawer size, sorted by openness (most open / smallest offset
 * first). `offset = size - reveal`, so a fully-revealed point sits at offset `0`.
 */
export function buildSnapEntries(
    values: readonly RdxDrawerSnapPoint[],
    size: number,
    rootFontSize = 16
): RdxDrawerSnapEntry[] {
    return values
        .map((value) => {
            const reveal = snapPointReveal(value, size, rootFontSize);
            return { value, reveal, offset: clamp(size - reveal, 0, size) };
        })
        .sort((a, b) => a.offset - b.offset);
}

/** How many milliseconds of momentum a release's velocity projects forward when picking a target. */
const MOMENTUM_MS = 120;

export type RdxDrawerSnapTarget = { dismiss: true } | { index: number };

export interface RdxDrawerSnapResolveOptions {
    /** Snap offsets (px), ascending; index-aligned to the sorted entries. */
    offsets: readonly number[];
    /** Index of the currently active offset. */
    activeIndex: number;
    /** Projected resting offset (px toward dismissal) at release. */
    projected: number;
    /** Signed release velocity (px/ms), positive toward dismissal. */
    velocity: number;
    /** Drawer size (px); the dismiss target sits here (fully hidden). */
    size: number;
    /** Step at most one snap point per release instead of velocity-skipping. */
    sequential: boolean;
    /** Whether passing the most-closed point may dismiss the drawer. */
    canDismiss: boolean;
}

/** Pick the snap point (or dismissal) a release lands on. */
export function resolveSnapTarget(options: RdxDrawerSnapResolveOptions): RdxDrawerSnapTarget {
    const { offsets, activeIndex, projected, velocity, size, sequential, canDismiss } = options;

    if (sequential) {
        const active = offsets[activeIndex] ?? 0;

        if (projected > active) {
            const next = activeIndex + 1 < offsets.length ? offsets[activeIndex + 1] : canDismiss ? size : active;
            const midpoint = (active + next) / 2;

            if (projected >= midpoint) {
                if (activeIndex + 1 >= offsets.length) {
                    return canDismiss ? { dismiss: true } : { index: activeIndex };
                }

                return { index: activeIndex + 1 };
            }

            return { index: activeIndex };
        }

        const previous = activeIndex - 1 >= 0 ? offsets[activeIndex - 1] : 0;
        const midpoint = (previous + active) / 2;

        return projected <= midpoint && activeIndex - 1 >= 0 ? { index: activeIndex - 1 } : { index: activeIndex };
    }

    const target = projected + velocity * MOMENTUM_MS;
    let bestIndex = 0;
    let bestDistance = Infinity;

    offsets.forEach((offset, index) => {
        const distance = Math.abs(offset - target);

        if (distance < bestDistance) {
            bestDistance = distance;
            bestIndex = index;
        }
    });

    if (canDismiss && Math.abs(size - target) < bestDistance) {
        return { dismiss: true };
    }

    return { index: bestIndex };
}

/** The unit translate vector pointing toward dismissal for a direction. */
export function dismissUnitVector(direction: RdxDrawerSwipeDirection): { x: number; y: number } {
    switch (direction) {
        case 'down':
            return { x: 0, y: 1 };
        case 'up':
            return { x: 0, y: -1 };
        case 'right':
            return { x: 1, y: 0 };
        case 'left':
            return { x: -1, y: 0 };
    }
}
