import { isHTMLElement, isShadowRoot } from '@radix-ng/primitives/core';

const MAX_LAYOUT_ROUNDING_ERROR = 2;

export interface TabGeometry {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
}

/** CSS coordinates in the List's padding box, following the pinned Base UI geometry policy. */
export function measureTabGeometry(tab: HTMLElement, list: HTMLElement): TabGeometry {
    const style = tab.ownerDocument.defaultView!.getComputedStyle(tab);
    const { width, height } = cssDimensions(tab, style);
    const listSize = cssDimensions(list);
    const listRect = list.getBoundingClientRect();
    const tabRect = tab.getBoundingClientRect();
    const scaleX = listSize.width > 0 ? listRect.width / listSize.width : 1;
    const scaleY = listSize.height > 0 ? listRect.height / listSize.height : 1;
    const tabOffset = cumulativeOffset(tab);
    const listOffset = cumulativeOffset(list);
    let left = tabOffset.left - listOffset.left - list.clientLeft;
    let top = tabOffset.top - listOffset.top - list.clientTop;

    // The List's own scroll is shared by its indicator. Intermediate scrollers move only the Tab.
    let parent = composedParent(tab);
    while (parent && parent !== list) {
        left -= parent.scrollLeft;
        top -= parent.scrollTop;
        parent = composedParent(parent);
    }

    const rectLeft = (tabRect.left - listRect.left) / scaleX + list.scrollLeft - list.clientLeft;
    const rectTop = (tabRect.top - listRect.top) / scaleY + list.scrollTop - list.clientTop;
    const translation = tabTranslation(tab, style);
    // Rects retain subpixel precision when they agree with layout offsets (rounded by the DOM).
    // Rotation/skew/flip/perspective break that agreement. Degenerate scales produce nonfinite
    // candidates and naturally keep layout offsets. A Tab's own translation should still be followed.
    if (
        Math.abs(rectLeft - translation.x - left) <= MAX_LAYOUT_ROUNDING_ERROR &&
        Math.abs(rectTop - translation.y - top) <= MAX_LAYOUT_ROUNDING_ERROR
    ) {
        left = rectLeft;
        top = rectTop;
    }
    return {
        left,
        top,
        width,
        height,
        right: list.scrollWidth - left - width,
        bottom: list.scrollHeight - top - height
    };
}

function cssDimensions(element: HTMLElement, style = element.ownerDocument.defaultView!.getComputedStyle(element)) {
    let width = Number.parseFloat(style.width) || 0;
    let height = Number.parseFloat(style.height) || 0;
    if (Math.round(width) !== element.offsetWidth || Math.round(height) !== element.offsetHeight) {
        width = element.offsetWidth;
        height = element.offsetHeight;
    }
    return { width, height };
}

function cumulativeOffset(element: HTMLElement) {
    let left = 0;
    let top = 0;
    let current: HTMLElement | null = element;
    while (current) {
        left += current.offsetLeft;
        top += current.offsetTop;
        const parent = current.offsetParent as HTMLElement | null;
        if (parent) {
            left += parent.clientLeft;
            top += parent.clientTop;
        }
        current = parent;
    }
    return { left, top };
}

function composedParent(element: HTMLElement): HTMLElement | null {
    const parent = element.assignedSlot ?? element.parentNode;
    if (isShadowRoot(parent)) return isHTMLElement(parent.host) ? parent.host : null;
    return isHTMLElement(parent) ? parent : null;
}

function tabTranslation(element: HTMLElement, style: CSSStyleDeclaration) {
    const matrix = style.transform
        ?.match(/matrix(?:3d)?\(([^)]+)\)/)?.[1]
        .split(',')
        .map(Number);
    let x = matrix?.[matrix.length === 16 ? 12 : 4] ?? 0;
    let y = matrix?.[matrix.length === 16 ? 13 : 5] ?? 0;
    if (style.translate && style.translate !== 'none') {
        const parts = style.translate.split(/\s+/);
        x += translateLength(parts[0], element.offsetWidth);
        y += translateLength(parts[1], element.offsetHeight);
    }
    return { x, y };
}

function translateLength(value: string | undefined, reference: number): number {
    if (!value) return 0;
    const numeric = Number.parseFloat(value);
    if (!Number.isFinite(numeric)) return 0;
    return value.endsWith('%') ? (numeric / 100) * reference : numeric;
}
