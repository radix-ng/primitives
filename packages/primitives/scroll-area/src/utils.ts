import { clamp } from '@radix-ng/primitives/core';
import { SCROLL_EDGE_TOLERANCE_PX } from './constants';

/**
 * Returns the combined start/end `margin` or `padding` of an element along an axis,
 * resolving logical (inline/block) properties so RTL layouts compute correctly.
 */
export function getOffset(element: Element | null, prop: 'margin' | 'padding', axis: 'x' | 'y'): number {
    if (!element) {
        return 0;
    }

    const styles = getComputedStyle(element);
    const propAxis = axis === 'x' ? 'Inline' : 'Block';

    // Safari misreports `marginInlineEnd` in RTL. We have to assume the start/end
    // values are symmetrical, which is likely.
    if (axis === 'x' && prop === 'margin') {
        return parseFloat(styles[`${prop}InlineStart` as keyof CSSStyleDeclaration] as string) * 2;
    }

    return (
        parseFloat(styles[`${prop}${propAxis}Start` as keyof CSSStyleDeclaration] as string) +
        parseFloat(styles[`${prop}${propAxis}End` as keyof CSSStyleDeclaration] as string)
    );
}

/**
 * Snaps a scroll offset that is within {@link SCROLL_EDGE_TOLERANCE_PX} of either end
 * to that boundary, giving the overflow edge attributes a "sticky" feel at scroll limits.
 */
export function normalizeScrollOffset(value: number, max: number): number {
    if (max <= 0) {
        return 0;
    }

    const clamped = clamp(value, 0, max);
    const startDistance = clamped;
    const endDistance = max - clamped;
    const withinStartTolerance = startDistance <= SCROLL_EDGE_TOLERANCE_PX;
    const withinEndTolerance = endDistance <= SCROLL_EDGE_TOLERANCE_PX;

    if (withinStartTolerance && withinEndTolerance) {
        return startDistance <= endDistance ? 0 : max;
    }
    if (withinStartTolerance) {
        return 0;
    }
    if (withinEndTolerance) {
        return max;
    }

    return clamped;
}

/**
 * Injects (once per document) the CSS that hides the native scrollbars of the viewport.
 * Headless directives can't hide WebKit scrollbars via inline styles, so a small
 * stylesheet keyed by the `[rdxScrollAreaViewport]` selector is appended to `<head>`.
 */
export function injectScrollbarHideStyles(document: Document, nonce?: string | null): void {
    if (typeof document === 'undefined' || document.head.querySelector('style[data-rdx-scroll-area]')) {
        return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-rdx-scroll-area', '');
    if (nonce) {
        style.nonce = nonce;
    }
    style.textContent = `[rdxScrollAreaViewport]{scrollbar-width:none;-ms-overflow-style:none}[rdxScrollAreaViewport]::-webkit-scrollbar{display:none}`;
    document.head.appendChild(style);
}
