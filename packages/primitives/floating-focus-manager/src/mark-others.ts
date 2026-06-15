/**
 * `markOthers` — the Angular port of Base UI's `floating-ui-react/utils/markOthers` (ADR 0017 §3). It
 * isolates a popup from the rest of the page by walking the owner `Document`'s `<body>` and applying an
 * attribute to every element **outside** the kept (`avoidElements`) subtree — siblings of the popup's
 * ancestor chain — leaving the popup, its ancestors, and any `[aria-live]` region untouched.
 *
 * Two independent passes (Base UI makes two separate calls, never bundling them):
 * - **`ariaHidden`** — `aria-hidden="true"` for AT isolation (applied only for modal / typeable popups).
 * - **`mark`** — a neutral marker attribute ({@link RDX_FLOATING_MARKER}) applied whenever the focus
 *   manager is active; read by ADR 0015's outside-press guard to detect third-party-injected subtrees.
 *
 * Per-**element** ref-counting (`WeakMap<Element, number>`) lets overlapping popups compose: an element
 * marked by two popups is only cleared when both undo. An element that was **already** `aria-hidden`
 * before the call is recorded and left in place on undo. `inert` is deliberately **not** ported — no Base
 * UI focus-manager consumer passes it (ADR 0017 §3).
 *
 * @returns an `Undo` that reverses exactly what this call applied.
 */
export type Undo = () => void;

export interface MarkOthersOptions {
    /** Apply `aria-hidden="true"` to outside elements (AT isolation). */
    ariaHidden?: boolean;
    /** Apply the neutral {@link RDX_FLOATING_MARKER} to outside elements. Default `true`. */
    mark?: boolean;
}

/** The neutral "outside the active floating layer" marker (Base UI `data-base-ui-inert`). */
export const RDX_FLOATING_MARKER = 'data-rdx-floating-inert';

const ARIA_HIDDEN = 'aria-hidden';

/** Per-element ref-counts. Keyed by element, so they are naturally per-`Document`. */
let ariaHiddenCounters = new WeakMap<Element, number>();
let markerCounters = new WeakMap<Element, number>();
/** Elements that were already `aria-hidden` before we touched them — left in place on undo. */
let preExistingHidden = new WeakSet<Element>();
let lockCount = 0;

function unwrapHost(node: Node | null): Element | null {
    if (!node) {
        return null;
    }
    return node instanceof ShadowRoot ? node.host : unwrapHost(node.parentNode);
}

/** Maps each target to the element actually inside `parent` (piercing shadow hosts), dropping the rest. */
function correctElements(parent: HTMLElement, targets: Element[]): Element[] {
    return targets
        .map((target) => {
            if (parent.contains(target)) {
                return target;
            }
            const host = unwrapHost(target);
            return host && parent.contains(host) ? host : null;
        })
        .filter((element): element is Element => element != null);
}

/** The set of nodes on the path from each target up to the root — the "keep" subtree. */
function buildKeepSet(targets: Element[]): Set<Node> {
    const keep = new Set<Node>();
    targets.forEach((target) => {
        let node: Node | null = target;
        while (node && !keep.has(node)) {
            keep.add(node);
            node = node.parentNode;
        }
    });
    return keep;
}

/** Collects every element outside the kept subtree (a sibling of the kept ancestor chain). */
function collectOutsideElements(root: HTMLElement, keep: Set<Node>, stop: Set<Node>): Element[] {
    const outside: Element[] = [];
    const walk = (parent: Element | null): void => {
        if (!parent || stop.has(parent)) {
            return;
        }
        Array.from(parent.children).forEach((node) => {
            if (node.nodeName.toLowerCase() === 'script') {
                return;
            }
            if (keep.has(node)) {
                walk(node);
            } else {
                outside.push(node);
            }
        });
    };
    walk(root);
    return outside;
}

export function markOthers(avoidElements: Element[], options: MarkOthersOptions = {}): Undo {
    const { ariaHidden = false, mark = true } = options;
    const first = avoidElements[0];
    if (!first) {
        return () => {};
    }
    const body = first.ownerDocument.body;
    const avoid = correctElements(body, avoidElements);

    const hiddenElements: Element[] = [];
    const markedElements: Element[] = [];

    if (ariaHidden) {
        // `aria-live` regions stay announceable, so keep them out of the hidden set too.
        const live = correctElements(body, Array.from(body.querySelectorAll('[aria-live]')));
        const controlElements = avoid.concat(live);
        const targets = collectOutsideElements(body, buildKeepSet(controlElements), new Set<Node>(controlElements));

        targets.forEach((node) => {
            const attr = node.getAttribute(ARIA_HIDDEN);
            const alreadyHidden = attr !== null && attr !== 'false';
            const count = (ariaHiddenCounters.get(node) ?? 0) + 1;
            ariaHiddenCounters.set(node, count);
            hiddenElements.push(node);

            if (count === 1 && alreadyHidden) {
                preExistingHidden.add(node);
            }
            if (!alreadyHidden) {
                node.setAttribute(ARIA_HIDDEN, 'true');
            }
        });
    }

    if (mark) {
        const targets = collectOutsideElements(body, buildKeepSet(avoid), new Set<Node>(avoid));
        targets.forEach((node) => {
            const count = (markerCounters.get(node) ?? 0) + 1;
            markerCounters.set(node, count);
            markedElements.push(node);
            if (count === 1) {
                node.setAttribute(RDX_FLOATING_MARKER, '');
            }
        });
    }

    lockCount += 1;

    return () => {
        hiddenElements.forEach((element) => {
            const count = (ariaHiddenCounters.get(element) ?? 0) - 1;
            ariaHiddenCounters.set(element, count);
            if (count === 0) {
                if (!preExistingHidden.has(element)) {
                    element.removeAttribute(ARIA_HIDDEN);
                }
                preExistingHidden.delete(element);
            }
        });

        markedElements.forEach((element) => {
            const count = (markerCounters.get(element) ?? 0) - 1;
            markerCounters.set(element, count);
            if (count === 0) {
                element.removeAttribute(RDX_FLOATING_MARKER);
            }
        });

        lockCount -= 1;
        if (lockCount === 0) {
            // No active locks anywhere — drop the ref-count tables so detached elements can be GC'd.
            ariaHiddenCounters = new WeakMap();
            markerCounters = new WeakMap();
            preExistingHidden = new WeakSet();
        }
    };
}
