import { getActiveElement } from '@radix-ng/primitives/core';

/**
 * Tabbable / focusable detection ported from Base UI (`floating-ui-react/utils/tabbable.ts`). Unlike the
 * old `TreeWalker` approximation this:
 * - **pierces shadow DOM and `<slot>`** via composed traversal (`getComposedChildren`), so guards / portal
 *   tab-order see candidates inside web components and projected content;
 * - honours **`inert`** ancestors, **`hidden`**, and computed-style visibility (`display`/`visibility`/
 *   `checkVisibility()` content-visibility);
 * - treats **`<details>`/`<summary>`**, **`contenteditable`**, and **`audio`/`video[controls]`** as
 *   focusable with the right implicit tab index;
 * - applies **radio-group** semantics (only the checked radio of a named group — or the first when none is
 *   checked — is tabbable).
 *
 * `composedContains` is the shadow-aware `Node.contains`, kept here as the low-level primitive so this
 * module stays a leaf (only `@radix-ng/primitives/core`); `utils.ts` re-exports it for back-compat.
 */

export type FocusableElement = HTMLElement | SVGElement;

const CANDIDATE_SELECTOR =
    'a[href],button,input,select,textarea,summary,details,iframe,object,embed,[tabindex],[contenteditable]:not([contenteditable="false"]),audio[controls],video[controls]';

const getNodeName = (node: Node): string => node.nodeName.toLowerCase();

const isNode = (value: unknown): value is Node => value != null && typeof (value as Node).nodeType === 'number';

/**
 * Owner-window-safe `HTMLElement` check. A raw `value instanceof HTMLElement` is realm-sensitive — it
 * returns `false` for an element from another document (iframe / popup window), whose realm has its own
 * `HTMLElement` constructor. Resolve the constructor from the node's own `defaultView` (the same pattern
 * as `dismissable-layer`'s `dismiss.ts`; Base UI `isHTMLElement`).
 */
const isHTMLElement = (value: unknown): value is HTMLElement => {
    if (!isNode(value)) {
        return false;
    }
    const view = (value as Node).ownerDocument?.defaultView;
    return view ? value instanceof view.HTMLElement : value instanceof HTMLElement;
};

/** A shadow root, detected structurally (`DOCUMENT_FRAGMENT_NODE` with a `host`) so it is realm- and SSR-safe. */
const isShadowRoot = (node: Node | null): node is ShadowRoot => node !== null && node.nodeType === 11 && 'host' in node;

const getComputedStyleOf = (element: Element): CSSStyleDeclaration | null => {
    const view = element.ownerDocument.defaultView;
    return view ? view.getComputedStyle(element) : null;
};

/**
 * Shadow-DOM-aware containment: whether `node` is `container` or lives inside it, crossing shadow roots
 * via their `host` (unlike `Node.contains`, which stops at a shadow boundary). Base UI `contains`.
 */
export function composedContains(container: Node, node: Node | null): boolean {
    let current: Node | null = node;
    while (current) {
        if (current === container) {
            return true;
        }
        current = isShadowRoot(current) ? current.host : current.parentNode;
    }
    return false;
}

function isHiddenByStyles(styles: CSSStyleDeclaration): boolean {
    return styles.visibility === 'hidden' || styles.visibility === 'collapse';
}

function isElementVisible(element: Element, styles: CSSStyleDeclaration | null): boolean {
    if (!element.isConnected || !styles || isHiddenByStyles(styles)) {
        return false;
    }
    if (typeof element.checkVisibility === 'function') {
        return element.checkVisibility();
    }
    return styles.display !== 'none' && styles.display !== 'contents';
}

/** The composed parent: an assigned `<slot>`, the element's parent, or the shadow host at a boundary. */
function getParentElement(element: Element): Element | null {
    const assignedSlot = (element as Element & { assignedSlot?: HTMLSlotElement | null }).assignedSlot;
    if (assignedSlot) {
        return assignedSlot;
    }
    if (element.parentElement) {
        return element.parentElement;
    }
    const rootNode = element.getRootNode();
    return isShadowRoot(rootNode) ? rootNode.host : null;
}

function getDetailsSummary(details: Element): Element | null {
    for (const child of Array.from(details.children)) {
        if (getNodeName(child) === 'summary') {
            return child;
        }
    }
    return null;
}

function isWithinOpenDetailsSummary(element: Element, details: Element): boolean {
    const summary = getDetailsSummary(details);
    return !!summary && (element === summary || composedContains(summary, element));
}

function isFocusableCandidate(element: Element | null): element is FocusableElement {
    const nodeName = element ? getNodeName(element) : '';
    return (
        element != null &&
        element.matches(CANDIDATE_SELECTOR) &&
        // a `<summary>` is only focusable as the (first) summary of a `<details>`
        (nodeName !== 'summary' ||
            (element.parentElement != null &&
                getNodeName(element.parentElement) === 'details' &&
                getDetailsSummary(element.parentElement) === element)) &&
        // a `<details>` with its own summary is not focusable (the summary is)
        (nodeName !== 'details' || getDetailsSummary(element) == null) &&
        (nodeName !== 'input' || (element as HTMLInputElement).type !== 'hidden')
    );
}

function isVisibleInTabbableTree(element: Element, isAncestor: boolean): boolean {
    const styles = getComputedStyleOf(element);
    if (!isAncestor) {
        return isElementVisible(element, styles);
    }
    return !!styles && styles.display !== 'none';
}

function isFocusableElement(element: Element | null): element is FocusableElement {
    if (!isFocusableCandidate(element) || !element.isConnected || element.matches(':disabled')) {
        return false;
    }

    for (let current: Element | null = element; current; current = getParentElement(current)) {
        const isAncestor = current !== element;
        const isSlot = getNodeName(current) === 'slot';

        if (current.hasAttribute('inert')) {
            return false;
        }

        if (
            (isAncestor &&
                getNodeName(current) === 'details' &&
                !(current as HTMLDetailsElement).open &&
                !isWithinOpenDetailsSummary(element, current)) ||
            current.hasAttribute('hidden') ||
            (!isSlot && !isVisibleInTabbableTree(current, isAncestor))
        ) {
            return false;
        }
    }

    return true;
}

/** The effective tab index, giving `<details>`/media/`contenteditable` their implicit `0`. */
function getTabIndex(element: FocusableElement): number {
    const tabIndex = element.tabIndex;
    if (tabIndex < 0) {
        const nodeName = getNodeName(element);
        if (
            nodeName === 'details' ||
            nodeName === 'audio' ||
            nodeName === 'video' ||
            (isHTMLElement(element) && element.isContentEditable)
        ) {
            return 0;
        }
    }
    return tabIndex;
}

function getNamedRadioInput(element: FocusableElement): HTMLInputElement | null {
    if (getNodeName(element) !== 'input') {
        return null;
    }
    const input = element as HTMLInputElement;
    return input.type === 'radio' && input.name !== '' ? input : null;
}

/** Within a named radio group only the checked radio (or the first, if none is checked) is tabbable. */
function isTabbableRadio(element: FocusableElement, candidates: FocusableElement[]): boolean {
    const input = getNamedRadioInput(element);
    if (!input) {
        return true;
    }

    const checkedRadio = candidates.find((candidate) => {
        const radio = getNamedRadioInput(candidate);
        return radio?.name === input.name && radio.form === input.form && radio.checked;
    });

    if (checkedRadio) {
        return checkedRadio === input;
    }

    return (
        candidates.find((candidate) => {
            const radio = getNamedRadioInput(candidate);
            return radio?.name === input.name && radio.form === input.form;
        }) === input
    );
}

/** The composed children of a node: `<slot>` assigned elements, then shadow-root children, else children. */
function getComposedChildren(container: ParentNode): Element[] {
    if (isHTMLElement(container) && getNodeName(container) === 'slot') {
        const assignedElements = (container as HTMLSlotElement).assignedElements({ flatten: true });
        if (assignedElements.length > 0) {
            return assignedElements;
        }
    }
    if (isHTMLElement(container) && container.shadowRoot) {
        return Array.from(container.shadowRoot.children);
    }
    return Array.from(container.children);
}

function appendCandidates(container: ParentNode, list: FocusableElement[]): void {
    getComposedChildren(container).forEach((child) => {
        if (isFocusableCandidate(child)) {
            list.push(child);
        }
        appendCandidates(child, list);
    });
}

/** Collects elements matching `selector` across the composed tree (shadow / slot aware). */
export function queryComposedAll(container: ParentNode, selector: string): HTMLElement[] {
    const list: HTMLElement[] = [];
    const walk = (node: ParentNode): void => {
        getComposedChildren(node).forEach((child) => {
            if (isHTMLElement(child) && child.matches(selector)) {
                list.push(child);
            }
            walk(child);
        });
    };
    walk(container);
    return list;
}

/** Whether `element` is reachable by Tab right now (Base UI `isTabbable`). */
export function isTabbable(element: Element | null): boolean {
    return isFocusableElement(element) && getTabIndex(element) >= 0;
}

/** All programmatically focusable elements inside `container`, in composed document order. */
export function focusable(container: Element): FocusableElement[] {
    const candidates: FocusableElement[] = [];
    appendCandidates(container, candidates);
    return candidates.filter(isFocusableElement);
}

/** All keyboard-tabbable elements inside `container`, in composed document order (Base UI `tabbable`). */
export function tabbable(container: Element): FocusableElement[] {
    const candidates = focusable(container);
    return candidates.filter((element) => getTabIndex(element) >= 0 && isTabbableRadio(element, candidates));
}

/**
 * Back-compat alias for {@link tabbable} — historically returned a looser `TreeWalker` approximation;
 * now the full Base UI tabbable set. Kept so existing imports (`getTabbableCandidates`) keep working.
 */
export function getTabbableCandidates(container: Element): FocusableElement[] {
    return tabbable(container);
}

/** The first and last tabbable elements inside `container`. */
export function getTabbableEdges(
    container: Element
): readonly [FocusableElement | undefined, FocusableElement | undefined] {
    const list = tabbable(container);
    return [list[0], list[list.length - 1]] as const;
}

function getTabbableIn(container: HTMLElement, dir: 1 | -1): FocusableElement | undefined {
    const list = tabbable(container);
    if (list.length === 0) {
        return undefined;
    }
    const active = getActiveElement(container.ownerDocument) as FocusableElement | null;
    const index = active ? list.indexOf(active) : -1;
    const nextIndex = index === -1 ? (dir === 1 ? 0 : list.length - 1) : index + dir;
    return list[nextIndex];
}

/**
 * The next tabbable in the document after the current focus (Base UI `getNextTabbable`) — used by the
 * portal-focus bridge's trailing guard to step focus past the popup. Falls back to `reference`.
 */
export function getNextTabbable(reference: Element | null): FocusableElement | null {
    const body = (reference?.ownerDocument ?? document).body;
    return getTabbableIn(body, 1) ?? (reference as FocusableElement | null);
}

/** The previous tabbable in the document before the current focus (Base UI `getPreviousTabbable`). */
export function getPreviousTabbable(reference: Element | null): FocusableElement | null {
    const body = (reference?.ownerDocument ?? document).body;
    return getTabbableIn(body, -1) ?? (reference as FocusableElement | null);
}

function getTabbableNearElement(reference: Element | null, dir: 1 | -1): FocusableElement | null {
    if (!reference) {
        return null;
    }
    const list = tabbable(reference.ownerDocument.body);
    const index = list.indexOf(reference as FocusableElement);
    if (list.length === 0 || index === -1) {
        return null;
    }
    return list[(index + dir + list.length) % list.length];
}

/** The tabbable immediately after `reference` in the document, wrapping (Base UI `getTabbableAfterElement`). */
export function getTabbableAfterElement(reference: Element | null): FocusableElement | null {
    return getTabbableNearElement(reference, 1);
}

/** The tabbable immediately before `reference` in the document, wrapping (Base UI `getTabbableBeforeElement`). */
export function getTabbableBeforeElement(reference: Element | null): FocusableElement | null {
    return getTabbableNearElement(reference, -1);
}
