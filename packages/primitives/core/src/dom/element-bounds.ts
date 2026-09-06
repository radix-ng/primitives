import { rdxPlatform } from './platform';

/** Viewport-relative bounds of an element, possibly widened by its pseudo-elements. */
export interface RdxElementBounds {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

/**
 * Tolerance applied around the bounds so a quick press whose pointer drifts a few pixels before the
 * release is not read as "released outside" (Base UI `BOUNDARY_OFFSET`). Matches the drag threshold
 * browsers and desktop environments use.
 */
const BOUNDARY_OFFSET = 5;

/**
 * The element's box, expanded to cover a `::before` / `::after` that renders larger than the element
 * itself — a decorative pseudo-element usually sets `pointer-events: none`, so a release over it has
 * the element's visible bounds but not the element as its target.
 *
 * Returns the plain bounding rect when there are no pseudo-elements, on the server, and under jsdom
 * (which throws "Not implemented: window.getComputedStyle(elt, pseudoElt)").
 */
export function getPseudoElementBounds(element: HTMLElement): RdxElementBounds {
    const rect = element.getBoundingClientRect();
    const win = element.ownerDocument.defaultView;

    if (!win || rdxPlatform.env.jsdom) {
        return rect;
    }

    const beforeStyles = win.getComputedStyle(element, '::before');
    const afterStyles = win.getComputedStyle(element, '::after');

    if (beforeStyles.content === 'none' && afterStyles.content === 'none') {
        return rect;
    }

    const width = Math.max(rect.width, parseFloat(beforeStyles.width) || 0, parseFloat(afterStyles.width) || 0);
    const height = Math.max(rect.height, parseFloat(beforeStyles.height) || 0, parseFloat(afterStyles.height) || 0);

    // A pseudo-element that outgrows its host is assumed to be centered on it, which is how the
    // usual "expand the hit area" / decorative-ring patterns are written.
    const widthDiff = width - rect.width;
    const heightDiff = height - rect.height;

    return {
        left: rect.left - widthDiff / 2,
        right: rect.right + widthDiff / 2,
        top: rect.top - heightDiff / 2,
        bottom: rect.bottom + heightDiff / 2
    };
}

/**
 * Whether a mouse event happened within an element's visible bounds (pseudo-elements included), with
 * a small tolerance for pointer drift. Used to tell "the press was released on the trigger" from a
 * genuine release elsewhere, which cancels a just-opened popup.
 */
export function isMouseWithinBounds(event: MouseEvent, element: HTMLElement): boolean {
    const bounds = getPseudoElementBounds(element);
    return (
        event.clientX >= bounds.left - BOUNDARY_OFFSET &&
        event.clientX <= bounds.right + BOUNDARY_OFFSET &&
        event.clientY >= bounds.top - BOUNDARY_OFFSET &&
        event.clientY <= bounds.bottom + BOUNDARY_OFFSET
    );
}
