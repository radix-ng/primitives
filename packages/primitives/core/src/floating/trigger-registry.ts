/**
 * Per-popup store of active **trigger** elements — the Angular counterpart of Base UI's
 * `triggerElements` (`PopupTriggerMap`) on each `FloatingRootStore`. One registry lives on each
 * {@link RdxFloatingRootContext} (NOT on the shared tree, and NOT on the node — the context can exist
 * without a node, e.g. the node-optional Navigation Menu case). Scoping it per-context is what keeps
 * one independent popup's trigger from counting as inside-content for an unrelated popup.
 *
 * Within its context it is read by **both** the dismissal engine (ADR 0015 — outside-press / focus-out
 * containment) and the focus manager (ADR 0017 — inside-element checks), so the two never drift into
 * different inside-element sets (ADR 0015 §1 pillar 3, §2). A trigger is plain inside-content: it has
 * **no** floating node and **no** parent — only its membership is stored here.
 *
 * Matching mirrors Base UI's `isTargetInsideEnabledTrigger`: a target counts when it is exactly a
 * registered element ({@link hasElement}) **or** a descendant of one ({@link hasMatchingElement}).
 * Membership is by **reference** (`Set.has` / `Node.contains`), so it stays correct **cross-realm** for
 * elements from another `Window` / iframe — where `target instanceof Element` against the local realm
 * would wrongly return `false`.
 */
export class RdxTriggerRegistry {
    private readonly elements = new Set<Element>();

    /** Registers `element` as a trigger. Idempotent. */
    add(element: Element): void {
        this.elements.add(element);
    }

    /** Removes `element` from the registry. */
    delete(element: Element): void {
        this.elements.delete(element);
    }

    /**
     * Exact membership — Base UI `triggerElements.hasElement(target)`. Uses reference identity
     * (`Set.has`), **not** `instanceof Element`, so a trigger from another realm/iframe still matches.
     */
    hasElement(target: EventTarget | Node | null): boolean {
        return target !== null && this.elements.has(target as Element);
    }

    /**
     * Ancestor match — Base UI `hasMatchingElement((t) => contains(t, target))`: `true` when any
     * registered trigger contains `target`. Catches a press/focus landing on a child of the trigger.
     */
    hasMatchingElement(target: Node | null): boolean {
        if (!target) {
            return false;
        }
        for (const element of this.elements) {
            if (element.contains(target)) {
                return true;
            }
        }
        return false;
    }

    /** `true` when `target` is a registered trigger or lives inside one. */
    contains(target: EventTarget | Node | null): boolean {
        return this.hasElement(target) || this.hasMatchingElement(target as Node | null);
    }
}
