import { ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, ARROW_UP, Direction, END, HOME } from '@radix-ng/primitives/core';
import { RdxCompositeModifierKey, RdxCompositeOrientation } from './types';

export const ACTIVE_COMPOSITE_ITEM = 'data-composite-item-active';

export const ARROW_KEYS = new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT]);
export const COMPOSITE_KEYS = new Set([...ARROW_KEYS, HOME, END]);
export const MODIFIER_KEYS: RdxCompositeModifierKey[] = ['Shift', 'Control', 'Alt', 'Meta'];

export function compareNodeDocumentPosition(a: Node, b: Node): number {
    const position = a.compareDocumentPosition(b);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING || position & Node.DOCUMENT_POSITION_CONTAINED_BY) {
        return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
        return 1;
    }

    return 0;
}

export function sortByDocumentPosition<T extends { element: HTMLElement }>(items: readonly T[]): T[] {
    return [...items]
        .filter((item) => item.element.isConnected)
        .sort((a, b) => compareNodeDocumentPosition(a.element, b.element));
}

/**
 * Smallest set of container elements whose child order can change the relative
 * order of the given (already document-sorted) nodes. Observing each adjacent
 * pair's common ancestor catches both direct item moves and wrapper moves at the
 * boundary, mirroring Base UI's composite list observer.
 */
export function getAdjacentNodeRoots(nodes: readonly Element[]): Set<Element> {
    const roots = new Set<Element>();

    for (let index = 1; index < nodes.length; index += 1) {
        const ancestor = getCommonAncestor(nodes[index - 1], nodes[index]);

        if (ancestor) {
            roots.add(ancestor);
        }
    }

    return roots;
}

function getCommonAncestor(firstNode: Element, lastNode: Element): Element | null {
    let ancestor = firstNode.parentElement;

    // `parentElement` cannot cross shadow boundaries, so native `contains` suffices.
    while (ancestor && !ancestor.contains(lastNode)) {
        ancestor = ancestor.parentElement;
    }

    return ancestor;
}

/**
 * Whether a batch of mutations moved a node (removed then re-added in the same
 * batch, or reparented so a removed node is still connected) rather than a pure
 * add/remove. Pure adds/removals re-sort through register/unregister and cannot
 * change the relative order of the remaining items.
 */
export function hasMovedNode(entries: readonly MutationRecord[]): boolean {
    const removed = new Set<Node>();

    // Records are chronological: an addition following a removal is a move, while
    // a removal following an addition is a net removal.
    for (const entry of entries) {
        for (let i = 0; i < entry.addedNodes.length; i += 1) {
            if (removed.has(entry.addedNodes[i])) {
                return true;
            }
        }

        for (let i = 0; i < entry.removedNodes.length; i += 1) {
            removed.add(entry.removedNodes[i]);
        }
    }

    // A removed node that is still connected was reparented into a container this
    // observer does not watch.
    for (const node of removed) {
        if (node.isConnected) {
            return true;
        }
    }

    return false;
}

export function isModifierKeySet(
    event: KeyboardEvent,
    allowedModifierKeys: readonly RdxCompositeModifierKey[]
): boolean {
    return MODIFIER_KEYS.some((key) => !allowedModifierKeys.includes(key) && event.getModifierState(key));
}

export function isNativeTextInput(target: EventTarget | null): target is HTMLInputElement | HTMLTextAreaElement {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (target.tagName === 'TEXTAREA') {
        return true;
    }

    if (target.tagName !== 'INPUT') {
        return false;
    }

    // Only inputs that expose a text caret count: `selectionStart` is `null` for
    // input types without text selection (checkbox, radio, number, email, …) and
    // may even throw in older engines. Either way such controls are not text
    // inputs and must not block arrow-key navigation when they are the focused
    // composite item.
    try {
        return (target as HTMLInputElement).selectionStart != null;
    } catch {
        return false;
    }
}

export function getCompositeNavigationKeys(orientation: RdxCompositeOrientation, dir: Direction) {
    const horizontalForwardKey = dir === 'rtl' ? ARROW_LEFT : ARROW_RIGHT;
    const horizontalBackwardKey = dir === 'rtl' ? ARROW_RIGHT : ARROW_LEFT;

    return {
        forwardKeys:
            orientation === 'horizontal'
                ? [horizontalForwardKey]
                : orientation === 'vertical'
                  ? [ARROW_DOWN]
                  : [horizontalForwardKey, ARROW_DOWN],
        backwardKeys:
            orientation === 'horizontal'
                ? [horizontalBackwardKey]
                : orientation === 'vertical'
                  ? [ARROW_UP]
                  : [horizontalBackwardKey, ARROW_UP]
    };
}

export function shouldKeepNativeTextInputBehavior(
    event: KeyboardEvent,
    target: HTMLInputElement | HTMLTextAreaElement,
    orientation: RdxCompositeOrientation,
    dir: Direction
): boolean {
    const { forwardKeys, backwardKeys } = getCompositeNavigationKeys(orientation, dir);
    const selectionStart = target.selectionStart;
    const selectionEnd = target.selectionEnd;
    const value = target.value ?? '';

    if (selectionStart == null || selectionEnd == null || event.shiftKey || selectionStart !== selectionEnd) {
        return true;
    }

    if (!backwardKeys.includes(event.key) && selectionStart < value.length) {
        return true;
    }

    if (!forwardKeys.includes(event.key) && selectionStart > 0) {
        return true;
    }

    return false;
}

export function isIndexOutOfListBounds<T>(list: readonly T[], index: number): boolean {
    return index < 0 || index >= list.length;
}

export function getMinListIndex(list: readonly HTMLElement[], disabledIndices?: readonly number[]): number {
    return findNonDisabledListIndex(list, { startingIndex: -1, disabledIndices });
}

export function getMaxListIndex(list: readonly HTMLElement[], disabledIndices?: readonly number[]): number {
    return findNonDisabledListIndex(list, { startingIndex: list.length, decrement: true, disabledIndices });
}

export function findNonDisabledListIndex(
    list: readonly HTMLElement[],
    options: { startingIndex?: number; decrement?: boolean; disabledIndices?: readonly number[] } = {}
): number {
    const { startingIndex = -1, decrement = false, disabledIndices } = options;
    const step = decrement ? -1 : 1;

    for (let index = startingIndex + step; index >= 0 && index < list.length; index += step) {
        if (!isListIndexDisabled(list, index, disabledIndices)) {
            return index;
        }
    }

    return -1;
}

export function isListIndexDisabled(
    list: readonly HTMLElement[],
    index: number,
    disabledIndices?: readonly number[]
): boolean {
    if (disabledIndices?.includes(index)) {
        return true;
    }

    const element = list[index];

    if (!element) {
        return false;
    }

    if (!isElementVisible(element)) {
        return true;
    }

    return (
        disabledIndices === undefined &&
        (element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true')
    );
}

export function isElementDisabled(element: HTMLElement | null): boolean {
    return element === null || element.hasAttribute('disabled') || element.getAttribute('aria-disabled') === 'true';
}

export function isElementVisible(element: HTMLElement | null): boolean {
    if (!element || !element.isConnected) {
        return false;
    }

    if (typeof Element !== 'undefined' && !(element instanceof Element)) {
        return true;
    }

    let styles: CSSStyleDeclaration;
    try {
        styles = getComputedStyle(element);
    } catch {
        return true;
    }

    return styles.visibility !== 'hidden' && styles.visibility !== 'collapse';
}

export function scrollIntoViewIfNeeded(
    scrollContainer: HTMLElement | null,
    element: HTMLElement | null,
    direction: Direction,
    orientation: RdxCompositeOrientation
): void {
    if (!scrollContainer || !element || typeof scrollContainer.scrollTo !== 'function') {
        return;
    }

    const isOverflowingX = scrollContainer.clientWidth < scrollContainer.scrollWidth;
    const isOverflowingY = scrollContainer.clientHeight < scrollContainer.scrollHeight;
    let left = scrollContainer.scrollLeft;
    let top = scrollContainer.scrollTop;

    if (isOverflowingX && orientation !== 'vertical') {
        const elementOffsetLeft = getOffset(scrollContainer, element, 'left');
        const containerStyles = getScrollStyles(scrollContainer);
        const elementStyles = getScrollStyles(element);

        // Which edge to align first differs by direction (Base UI parity): LTR resolves a
        // right-edge overflow before a left one, RTL the reverse. It only matters when the
        // element is wider than the container, where both edges overflow at once.
        if (direction === 'ltr') {
            if (
                elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight >
                scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight
            ) {
                // overflow to the right, align right edges
                left =
                    elementOffsetLeft +
                    element.offsetWidth +
                    elementStyles.scrollMarginRight -
                    scrollContainer.clientWidth +
                    containerStyles.scrollPaddingRight;
            } else if (
                elementOffsetLeft - elementStyles.scrollMarginLeft <
                scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
            ) {
                // overflow to the left, align left edges
                left = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
            }
        }

        if (direction === 'rtl') {
            if (
                elementOffsetLeft - elementStyles.scrollMarginRight <
                scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
            ) {
                // overflow to the left, align left edges
                left = elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
            } else if (
                elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight >
                scrollContainer.scrollLeft + scrollContainer.clientWidth - containerStyles.scrollPaddingRight
            ) {
                // overflow to the right, align right edges
                left =
                    elementOffsetLeft +
                    element.offsetWidth +
                    elementStyles.scrollMarginRight -
                    scrollContainer.clientWidth +
                    containerStyles.scrollPaddingRight;
            }
        }
    }

    if (isOverflowingY && orientation !== 'horizontal') {
        const elementOffsetTop = getOffset(scrollContainer, element, 'top');
        const containerStyles = getScrollStyles(scrollContainer);
        const elementStyles = getScrollStyles(element);

        if (
            elementOffsetTop - elementStyles.scrollMarginTop <
            scrollContainer.scrollTop + containerStyles.scrollPaddingTop
        ) {
            top = elementOffsetTop - elementStyles.scrollMarginTop - containerStyles.scrollPaddingTop;
        } else if (
            elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom >
            scrollContainer.scrollTop + scrollContainer.clientHeight - containerStyles.scrollPaddingBottom
        ) {
            top =
                elementOffsetTop +
                element.offsetHeight +
                elementStyles.scrollMarginBottom -
                scrollContainer.clientHeight +
                containerStyles.scrollPaddingBottom;
        }
    }

    scrollContainer.scrollTo({ left, top, behavior: 'auto' });
}

function getOffset(ancestor: HTMLElement, element: HTMLElement, side: 'left' | 'top'): number {
    const propName = side === 'left' ? 'offsetLeft' : 'offsetTop';
    let result = 0;
    let current: HTMLElement | null = element;

    while (current?.offsetParent) {
        result += current[propName];
        if (current.offsetParent === ancestor) {
            break;
        }
        current = current.offsetParent as HTMLElement;
    }

    return result;
}

function getScrollStyles(element: HTMLElement) {
    const styles = getComputedStyle(element);

    return {
        scrollMarginTop: parseFloat(styles.scrollMarginTop) || 0,
        scrollMarginRight: parseFloat(styles.scrollMarginRight) || 0,
        scrollMarginBottom: parseFloat(styles.scrollMarginBottom) || 0,
        scrollMarginLeft: parseFloat(styles.scrollMarginLeft) || 0,
        scrollPaddingTop: parseFloat(styles.scrollPaddingTop) || 0,
        scrollPaddingRight: parseFloat(styles.scrollPaddingRight) || 0,
        scrollPaddingBottom: parseFloat(styles.scrollPaddingBottom) || 0,
        scrollPaddingLeft: parseFloat(styles.scrollPaddingLeft) || 0
    };
}
