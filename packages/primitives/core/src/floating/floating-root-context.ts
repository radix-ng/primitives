import { isDevMode } from '@angular/core';
import { rdxDevError } from '../dev/diagnostics';
import { RdxTriggerRegistry } from './trigger-registry';

const DOCS = 'utils/floating-tree';

/** Initialization for a {@link RdxFloatingRootContext}. */
export interface RdxFloatingRootContextInit {
    ownerDocument: Document;
    /** Popup open-state lifecycle. Defaults to `() => false`. */
    open?: () => boolean;
    floatingElement?: HTMLElement | null;
    referenceElement?: Element | null;
}

/**
 * The per-popup **root context / store** — the Angular counterpart of Base UI's `FloatingRootStore`
 * (`FloatingRootContext`). It is a **separate entity from {@link RdxFloatingNode}** (which is only
 * `id` + `parent` + a context ref), mirroring Base UI: the node carries tree membership, the root
 * context carries the popup's `open`, elements, and trigger registry.
 *
 * Crucially it can exist **without** a node — the `getEmptyRootContext()` analog ({@link
 * createFloatingRootContext}) — which is what lets a **node-optional** capability (Navigation Menu,
 * ADR 0015 §1 / ADR 0017 #12) still read `open()`, `triggers`, and the elements while its tree node is
 * temporarily absent. A dismissal/focus capability therefore references a root context **mandatorily**
 * and a node **optionally**.
 *
 * `floatingElement` / `referenceElement` are exposed read-only and mutated **only** through the
 * validated setters, so a consumer cannot bypass the owner-`Document` invariant with a raw assignment.
 */
export class RdxFloatingRootContext {
    readonly ownerDocument: Document;
    /** Neutral popup open-state lifecycle (singular). Tree traversal's `onlyOpen` filter reads this. */
    readonly open: () => boolean;
    /** Per-popup trigger registry (Base UI `triggerElements`), read by both dismissal and focus. */
    readonly triggers = new RdxTriggerRegistry();

    private floatingElementRef: HTMLElement | null = null;
    private referenceElementRef: Element | null = null;

    constructor(init: RdxFloatingRootContextInit) {
        this.ownerDocument = init.ownerDocument;
        this.open = init.open ?? (() => false);
        if (init.floatingElement !== undefined) {
            this.setFloatingElement(init.floatingElement);
        }
        if (init.referenceElement !== undefined) {
            this.setReferenceElement(init.referenceElement);
        }
    }

    /** The floating (popup) element, once it renders. `null` while mounted-but-not-yet-rendered. */
    get floatingElement(): HTMLElement | null {
        return this.floatingElementRef;
    }

    /** The reference (anchor / trigger) element the popup is positioned against. */
    get referenceElement(): Element | null {
        return this.referenceElementRef;
    }

    /** Assigns the floating element, validating it shares this context's `ownerDocument`. */
    setFloatingElement(element: HTMLElement | null): void {
        this.assertSameDocument(element);
        this.floatingElementRef = element;
    }

    /** Assigns the reference element, validating it shares this context's `ownerDocument`. */
    setReferenceElement(element: Element | null): void {
        this.assertSameDocument(element);
        this.referenceElementRef = element;
    }

    private assertSameDocument(element: Element | null): void {
        if (isDevMode() && element !== null && element.ownerDocument !== this.ownerDocument) {
            rdxDevError(
                'floating/cross-document-element',
                "A floating element must share its root context's ownerDocument.",
                DOCS
            );
        }
    }
}

/**
 * Creates a standalone {@link RdxFloatingRootContext} **without** a tree node — the Angular counterpart
 * of Base UI's `getEmptyRootContext()`. Use it for a node-optional capability that needs a root context
 * before (or without) registering a floating node.
 */
export function createFloatingRootContext(init: RdxFloatingRootContextInit): RdxFloatingRootContext {
    return new RdxFloatingRootContext(init);
}
