import { getActiveElement } from '@radix-ng/primitives/core';

export const AUTOFOCUS_ON_MOUNT = 'focusScope.autoFocusOnMount';
export const AUTOFOCUS_ON_UNMOUNT = 'focusScope.autoFocusOnUnmount';
export const EVENT_OPTIONS = { bubbles: false, cancelable: true };

type FocusableTarget = HTMLElement | { focus: () => void };

/**
 * The real target of a (possibly retargeted) event, piercing shadow boundaries via `composedPath()`.
 * Falls back to `event.target` when `composedPath` is unavailable.
 */
export function getEventTarget(event: Event): EventTarget | null {
    return event.composedPath?.()[0] ?? event.target;
}

/**
 * Shadow-DOM-aware containment: whether `node` is `container` or lives inside it, crossing shadow roots
 * via their `host` (unlike `Node.contains`, which stops at a shadow boundary).
 */
export function composedContains(container: Node, node: Node | null): boolean {
    let current: Node | null = node;
    while (current) {
        if (current === container) {
            return true;
        }
        current = current instanceof ShadowRoot ? current.host : current.parentNode;
    }
    return false;
}

/**
 * Attempts focusing the first element in a list of candidates.
 * Stops when focus has actually moved.
 */
export function focusFirst(candidates: HTMLElement[], { select = false } = {}) {
    const previouslyFocusedElement = getActiveElement();
    for (const candidate of candidates) {
        focus(candidate, { select });
        if (getActiveElement() !== previouslyFocusedElement) return true;
    }

    return;
}

/**
 * Returns a list of potential tabbable candidates.
 *
 * NOTE: This is only a close approximation. For example it doesn't take into account cases like when
 * elements are not visible. This cannot be worked out easily by just reading a property, but rather
 * necessitate runtime knowledge (computed styles, etc). We deal with these cases separately.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/TreeWalker
 * Credit: https://github.com/discord/focus-layers/blob/master/src/util/wrapFocus.tsx#L1
 */
export function getTabbableCandidates(container: HTMLElement) {
    const nodes: HTMLElement[] = [];
    const walker = container.ownerDocument.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, {
        acceptNode: (node: any) => {
            const isHiddenInput = node.tagName === 'INPUT' && node.type === 'hidden';
            if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
            // `.tabIndex` is not the same as the `tabindex` attribute. It works on the
            // runtime's understanding of tabbability, so this automatically accounts
            // for any kind of element that could be tabbed to.
            return node.tabIndex >= 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
        }
    });
    while (walker.nextNode()) nodes.push(walker.currentNode as HTMLElement);
    // we do not take into account the order of nodes with positive `tabIndex` as it
    // hinders accessibility to have tab order different from visual order.
    return nodes;
}

export function isHidden(node: HTMLElement, { upTo }: { upTo?: HTMLElement }) {
    const view = node.ownerDocument.defaultView;
    if (!view) {
        return false; // no view (detached / SSR) — cannot resolve computed styles, treat as visible
    }
    if (view.getComputedStyle(node).visibility === 'hidden') return true;
    while (node) {
        // we stop at `upTo` (excluding it)
        if (upTo !== undefined && node === upTo) return false;
        if (view.getComputedStyle(node).display === 'none') return true;
        node = node.parentElement as HTMLElement;
    }
    return false;
}

/**
 * Returns the first visible element in a list.
 * NOTE: Only checks visibility up to the `container`.
 */
export function findVisible(elements: HTMLElement[], container: HTMLElement): HTMLElement | undefined {
    for (const element of elements) {
        // we stop checking if it's hidden at the `container` level (excluding)
        if (!isHidden(element, { upTo: container })) return element;
    }
    return undefined;
}

/**
 * Returns the first and last tabbable elements inside a container.
 */
export function getTabbableEdges(container: HTMLElement) {
    const candidates = getTabbableCandidates(container);
    const first = findVisible(candidates, container);
    const last = findVisible(candidates.reverse(), container);
    return [first, last] as const;
}

/** Visible tabbable elements of `root` in document order (the basis for tab-order navigation). */
function visibleTabbablesIn(root: HTMLElement): HTMLElement[] {
    return getTabbableCandidates(root).filter((el) => !isHidden(el, { upTo: root }));
}

/** The tabbable one step (`dir`) from the document's active element, within `container`. */
function getTabbableIn(container: HTMLElement, dir: 1 | -1): HTMLElement | undefined {
    const list = visibleTabbablesIn(container);
    if (list.length === 0) {
        return undefined;
    }
    const active = getActiveElement(container.ownerDocument) as HTMLElement | null;
    const index = active ? list.indexOf(active) : -1;
    const nextIndex = index === -1 ? (dir === 1 ? 0 : list.length - 1) : index + dir;
    return list[nextIndex];
}

/**
 * The next tabbable in the document after the current focus (Base UI `getNextTabbable`) — used by the
 * portal-focus bridge's trailing guard to step focus past the popup. Falls back to `reference`.
 */
export function getNextTabbable(reference: Element | null): HTMLElement | null {
    const body = (reference?.ownerDocument ?? document).body;
    return getTabbableIn(body, 1) ?? (reference as HTMLElement | null);
}

/** The previous tabbable in the document before the current focus (Base UI `getPreviousTabbable`). */
export function getPreviousTabbable(reference: Element | null): HTMLElement | null {
    const body = (reference?.ownerDocument ?? document).body;
    return getTabbableIn(body, -1) ?? (reference as HTMLElement | null);
}

/** The tabbable `dir` steps from `reference` in the document, wrapping around. */
function getTabbableNearElement(reference: Element | null, dir: 1 | -1): HTMLElement | null {
    if (!reference) {
        return null;
    }
    const list = visibleTabbablesIn(reference.ownerDocument.body);
    const index = list.indexOf(reference as HTMLElement);
    if (list.length === 0 || index === -1) {
        return null;
    }
    return list[(index + dir + list.length) % list.length];
}

/** The tabbable immediately after `reference` in the document, wrapping (Base UI `getTabbableAfterElement`). */
export function getTabbableAfterElement(reference: Element | null): HTMLElement | null {
    return getTabbableNearElement(reference, 1);
}

/** The tabbable immediately before `reference` in the document, wrapping (Base UI `getTabbableBeforeElement`). */
export function getTabbableBeforeElement(reference: Element | null): HTMLElement | null {
    return getTabbableNearElement(reference, -1);
}

export function isSelectableInput(element: any): element is FocusableTarget & { select: () => void } {
    return element instanceof HTMLInputElement && 'select' in element;
}

export function focus(element?: FocusableTarget | null, { select = false } = {}) {
    // only focus if that element is focusable
    if (element && element.focus) {
        const previouslyFocusedElement = getActiveElement();
        // NOTE: we prevent scrolling on focus, to minimize jarring transitions for users
        element.focus({ preventScroll: true });
        // only select if its not the same element, it supports selection and we need to select
        if (element !== previouslyFocusedElement && isSelectableInput(element) && select) {
            element.select();
        }
    }
}
