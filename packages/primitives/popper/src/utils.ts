import type { Middleware, Placement } from '@floating-ui/dom';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SIDE_OPTIONS = ['top', 'right', 'bottom', 'left'] as const;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ALIGN_OPTIONS = ['start', 'center', 'end'] as const;

export type Side = (typeof SIDE_OPTIONS)[number];
export type Align = (typeof ALIGN_OPTIONS)[number];

/**
 * How the popper avoids collisions with the boundary edges (Base UI `collisionAvoidance`).
 *
 * - `side` — behavior on the **preferred placement axis** (`top`/`bottom` or `left`/`right`):
 *   `'flip'` swaps to the opposite side when it doesn't fit, `'shift'` keeps the side and nudges the
 *   popup within the boundary, `'none'` leaves side-axis overflow uncorrected.
 * - `align` — behavior on the **alignment axis** (`start`/`center`/`end`): `'flip'` swaps `start`/`end`,
 *   `'shift'` nudges the popup along the alignment axis, `'none'` leaves it uncorrected.
 * - `fallbackAxisSide` — when neither preferred side fits, whether to fall back to the perpendicular
 *   axis and which logical side to prefer (`'start'` / `'end'`), or `'none'` to stay on the axis.
 *
 * Any omitted field falls back to the wrapper default (`side: 'flip'`, `align: 'flip'`,
 * `fallbackAxisSide: 'end'`), matching Base UI.
 */
export interface RdxCollisionAvoidance {
    side?: 'flip' | 'shift' | 'none';
    align?: 'flip' | 'shift' | 'none';
    fallbackAxisSide?: 'start' | 'end' | 'none';
}

/** Fully-resolved {@link RdxCollisionAvoidance} — every field present (no wrapper-default fallback left). */
export type ResolvedCollisionAvoidance = Required<RdxCollisionAvoidance>;

/**
 * Function form of `sideOffset` / `alignOffset` (Base UI `OffsetFunction`). Receives the resolved
 * placement and the measured anchor / positioner dimensions, and returns the offset in pixels — e.g.
 * `({ anchor }) => anchor.width` to offset by the trigger's own width. `side` is the physical side the
 * popup is placed against.
 */
export type OffsetFunction = (data: {
    side: Side;
    align: Align;
    anchor: { width: number; height: number };
    positioner: { width: number; height: number };
}) => number;

export function isNotNull<T>(value: T | null): value is T {
    return value !== null;
}

export function transformOrigin(options: { arrowWidth: number; arrowHeight: number }): Middleware {
    return {
        name: 'transformOrigin',
        options,
        fn(data) {
            const { placement, rects, middlewareData } = data;

            const cannotCenterArrow = middlewareData.arrow?.centerOffset !== 0;
            const isArrowHidden = cannotCenterArrow;
            const arrowWidth = isArrowHidden ? 0 : options.arrowWidth;
            const arrowHeight = isArrowHidden ? 0 : options.arrowHeight;

            const [placedSide, placedAlign] = getSideAndAlignFromPlacement(placement);
            const noArrowAlign = { start: '0%', center: '50%', end: '100%' }[placedAlign];

            const arrowXCenter = (middlewareData.arrow?.x ?? 0) + arrowWidth / 2;
            const arrowYCenter = (middlewareData.arrow?.y ?? 0) + arrowHeight / 2;

            let x = '';
            let y = '';

            if (placedSide === 'bottom') {
                x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
                y = `${-arrowHeight}px`;
            } else if (placedSide === 'top') {
                x = isArrowHidden ? noArrowAlign : `${arrowXCenter}px`;
                y = `${rects.floating.height + arrowHeight}px`;
            } else if (placedSide === 'right') {
                x = `${-arrowHeight}px`;
                y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
            } else if (placedSide === 'left') {
                x = `${rects.floating.width + arrowHeight}px`;
                y = isArrowHidden ? noArrowAlign : `${arrowYCenter}px`;
            }
            return { data: { x, y } };
        }
    };
}

export function getSideAndAlignFromPlacement(placement: Placement) {
    const [side, align = 'center'] = placement.split('-');
    return [side as Side, align as Align] as const;
}
