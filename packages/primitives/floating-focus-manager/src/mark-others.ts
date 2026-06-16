/**
 * `markOthers` — the Angular port of Base UI's `floating-ui-react/utils/markOthers` (ADR 0017 §3). It
 * isolates a popup from the rest of the page by walking the owner `Document`'s `<body>` and applying an
 * attribute to every element **outside** the kept (`avoidElements`) subtree — siblings of the popup's
 * ancestor chain — leaving the popup, its ancestors, and any `[aria-live]` region untouched.
 *
 * Two independent passes (Base UI makes two separate calls, never bundling them):
 * - **control attribute** — either `inert` (the real attribute: non-interactive **and** removed from the
 *   a11y tree) or `aria-hidden="true"` (AT-only). `inert` takes precedence and is what replaces the
 *   global body pointer-lock for modal isolation (ADR 0017 §3 / finding #4): it blocks pointer + focus
 *   on outside content **scoped** to siblings of the popup's ancestor chain, so independent overlays at a
 *   higher layer are unaffected (unlike `body { pointer-events: none }`).
 * - **`mark`** — a neutral marker attribute ({@link RDX_FLOATING_MARKER}) applied whenever the focus
 *   manager is active; read by ADR 0015's outside-press guard to detect third-party-injected subtrees.
 *
 * Per-**element**, per-**attribute** ref-counting (`WeakMap<Element, number>`) lets overlapping popups
 * compose: an element controlled by two popups is only cleared when both undo. An element that already
 * carried the control attribute before the call is recorded and left in place on undo.
 *
 * @returns an `Undo` that reverses exactly what this call applied.
 */
export type Undo = () => void;

export interface MarkOthersOptions {
    /** Apply `aria-hidden="true"` to outside elements (AT-only isolation). Ignored when `inert` is set. */
    ariaHidden?: boolean;
    /**
     * Apply the real `inert` attribute to outside elements — non-interactive **and** a11y-hidden in one.
     * Takes precedence over `ariaHidden`; this is the scoped replacement for the body pointer-lock.
     */
    inert?: boolean;
    /** Apply the neutral {@link RDX_FLOATING_MARKER} to outside elements. Default `true`. */
    mark?: boolean;
}

/** The neutral "outside the active floating layer" marker (Base UI `data-base-ui-inert`). */
export const RDX_FLOATING_MARKER = 'data-rdx-floating-inert';

/** The mutually-exclusive control attribute (Base UI: `inert` wins over `aria-hidden`). */
type ControlAttribute = 'inert' | 'aria-hidden';

/** Per-element, per-attribute ref-counts. Keyed by element, so they are naturally per-`Document`. */
const controlCounters: Record<ControlAttribute, WeakMap<Element, number>> = {
    inert: new WeakMap(),
    'aria-hidden': new WeakMap()
};
/** Elements that already carried the control attribute before we touched them — left in place on undo. */
const preExistingControlled: Record<ControlAttribute, WeakSet<Element>> = {
    inert: new WeakSet(),
    'aria-hidden': new WeakSet()
};
let markerCounters = new WeakMap<Element, number>();
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
    const { ariaHidden = false, inert = false, mark = true } = options;
    const first = avoidElements[0];
    if (!first) {
        return () => {};
    }
    const body = first.ownerDocument.body;
    const avoid = correctElements(body, avoidElements);

    // `inert` wins over `aria-hidden` (it already removes the subtree from the a11y tree, Base UI).
    const controlAttribute: ControlAttribute | null = inert ? 'inert' : ariaHidden ? 'aria-hidden' : null;
    const controlledElements: Element[] = [];
    const markedElements: Element[] = [];

    if (controlAttribute) {
        const counters = controlCounters[controlAttribute];
        const preExisting = preExistingControlled[controlAttribute];
        // `aria-live` regions stay announceable, so keep them out of the controlled set too.
        const live = correctElements(body, Array.from(body.querySelectorAll('[aria-live]')));
        const controlElements = avoid.concat(live);
        const targets = collectOutsideElements(body, buildKeepSet(controlElements), new Set<Node>(controlElements));

        targets.forEach((node) => {
            const attr = node.getAttribute(controlAttribute);
            const already = attr !== null && attr !== 'false';
            const count = (counters.get(node) ?? 0) + 1;
            counters.set(node, count);
            controlledElements.push(node);

            if (count === 1 && already) {
                preExisting.add(node);
            }
            if (!already) {
                node.setAttribute(controlAttribute, controlAttribute === 'inert' ? '' : 'true');
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
        if (controlAttribute) {
            const counters = controlCounters[controlAttribute];
            const preExisting = preExistingControlled[controlAttribute];
            controlledElements.forEach((element) => {
                const count = (counters.get(element) ?? 0) - 1;
                counters.set(element, count);
                if (count === 0) {
                    if (!preExisting.has(element)) {
                        element.removeAttribute(controlAttribute);
                    }
                    preExisting.delete(element);
                }
            });
        }

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
            controlCounters.inert = new WeakMap();
            controlCounters['aria-hidden'] = new WeakMap();
            preExistingControlled.inert = new WeakSet();
            preExistingControlled['aria-hidden'] = new WeakSet();
            markerCounters = new WeakMap();
        }
    };
}
