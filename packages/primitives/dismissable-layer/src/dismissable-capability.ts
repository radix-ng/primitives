import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, inject, PLATFORM_ID } from '@angular/core';
import { RdxFloatingNode, RdxFloatingRootContext } from '@radix-ng/primitives/core';

/** Why a dismissal was requested — mirrors Base UI's open-change `reason` strings (`useDismiss.ts`). */
export type RdxDismissReason = 'escape-key' | 'outside-press' | 'focus-outside';

/**
 * Configuration for {@link RdxDismissableCapability}. Every flag is a getter so it can be a signal
 * read (reactive) or a plain predicate. The `on*` pre-hooks are **preventable**: call
 * `event.preventDefault()` inside one to veto that dismissal (the layer then stays open).
 */
export interface RdxDismissableConfig {
    /** Whole-capability gate (on top of `context.open()`). Default `() => true`. */
    enabled?: () => boolean;
    /** Whether Escape requests dismissal. Default `() => true`. */
    escapeKey?: () => boolean;
    /**
     * Whether this layer's Escape **bubbles** to ancestor layers (Base UI `bubbles.escapeKey`). Default
     * `() => false` — Escape closes only the deepest layer. `true` re-emits to the parent too (this is
     * Menu's `closeParentOnEsc`: a submenu's Escape also closes the parent menu).
     */
    escapeKeyBubbles?: () => boolean;
    /** Whether an outside pointer press requests dismissal. Default `() => true`. */
    outsidePress?: () => boolean;
    /**
     * When an outside press dismisses (Base UI `outsidePressEvent`). `'sloppy'` (default) closes on
     * `pointerdown` — immediate, OS-like. `'intentional'` closes on `click` — requires a full
     * press-and-release on the same outside target, and suppresses the click when the press **started
     * inside** (so selecting text and dragging out does not dismiss).
     */
    outsidePressEvent?: () => 'sloppy' | 'intentional';
    /**
     * Whether this layer's outside-press **bubbles** to ancestor layers (Base UI `bubbles.outsidePress`).
     * Default `() => true` — an outside press closes the whole stack. `false` makes an open non-bubbling
     * child block the parent (only the deepest closes).
     */
    outsidePressBubbles?: () => boolean;
    /** Whether focus leaving the layer requests dismissal. Default `() => true`. */
    focusOutside?: () => boolean;
    /** Preventable pre-hook for Escape. */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /** Preventable pre-hook for an outside pointer press. */
    onPointerDownOutside?: (event: PointerEvent) => void;
    /** Preventable pre-hook for focus moving outside. */
    onFocusOutside?: (event: FocusEvent) => void;
    /** Called when a non-prevented dismissal is requested. */
    onDismiss?: (reason: RdxDismissReason, event: Event) => void;
}

const alwaysTrue = (): boolean => true;
const alwaysFalse = (): boolean => false;
const sloppy = (): 'sloppy' => 'sloppy';

/** Duck-types an `EventTarget` to `Node` (cross-realm-safe; `Node.contains` throws on a non-Node). */
function isNode(target: EventTarget | null): target is Node {
    return target !== null && typeof (target as Node).nodeType === 'number';
}

/** Only a primary (left / default) press dismisses — a non-primary mouse button is ignored. */
function isPrimaryButton(event: Event): boolean {
    return !('button' in event) || (event as MouseEvent).button === 0;
}

/**
 * Whether the press landed on `target`'s scrollbar (a scrollbar drag must not dismiss). Mirrors Base
 * UI's geometry check (`useDismiss.ts`): skipped for touch (scrollbars get no touch events) and resolved
 * from the element's scroll metrics + the press offset.
 *
 * @remarks Layout-dependent — verified by Playwright, not jsdom (which reports zero box metrics, so this
 * correctly returns `false` there). See `apps/visual-regression`.
 */
function isScrollbarPress(event: Event): boolean {
    const target = event.target;
    if (!(target instanceof HTMLElement) || 'touches' in event || typeof (event as MouseEvent).offsetX !== 'number') {
        return false;
    }
    const view = target.ownerDocument.defaultView;
    if (!view) {
        return false;
    }
    const press = event as MouseEvent;
    const style = view.getComputedStyle(target);
    const scrollable = /auto|scroll/;
    const canScrollX = scrollable.test(style.overflowX) && target.scrollWidth > target.clientWidth;
    const canScrollY = scrollable.test(style.overflowY) && target.scrollHeight > target.clientHeight;
    const isRtl = style.direction === 'rtl';

    const onVerticalScrollbar =
        canScrollY &&
        (isRtl ? press.offsetX <= target.offsetWidth - target.clientWidth : press.offsetX > target.clientWidth);
    const onHorizontalScrollbar = canScrollX && press.offsetY > target.clientHeight;

    return onVerticalScrollbar || onHorizontalScrollbar;
}

/** A layer's per-event "bubbles to ancestors" policy, published for its ancestors to read. */
interface DismissBubbles {
    escapeKey: () => boolean;
    outsidePress: () => boolean;
}

/**
 * Each capability publishes its bubbles policy here, keyed by its root context, so an **ancestor**'s
 * `hasBlockingChild` can read a child's flags — the Angular counterpart of Base UI storing
 * `__escapeKeyBubbles` / `__outsidePressBubbles` on the context's `dataRef` (`useDismiss.ts`). Kept in a
 * dismissal-private `WeakMap` (not on the neutral context) so the context stays capability-agnostic.
 */
const dismissBubblesByContext = new WeakMap<RdxFloatingRootContext, DismissBubbles>();

/**
 * Whether a child `context` lets the given event bubble past it to its ancestors. Defaults match Base
 * UI for a child that has no dismissal policy (e.g. focus-only): Escape does **not** bubble (so it
 * blocks), an outside press **does** (so it does not block).
 */
function childBubbles(context: RdxFloatingRootContext, reason: RdxDismissReason): boolean {
    const bubbles = dismissBubblesByContext.get(context);
    if (reason === 'escape-key') {
        return bubbles ? bubbles.escapeKey() : false;
    }
    return bubbles ? bubbles.outsidePress() : true;
}

/**
 * The dismissal **capability** (ADR 0015 §1) — the Angular counterpart of Base UI's `useDismiss`. It
 * **references** a {@link RdxFloatingRootContext} (mandatory: `open` / `triggers` / elements live there)
 * and a {@link RdxFloatingNode} (**optional**: a node-optional / Navigation-Menu state has `node ===
 * null`); it never creates them. It listens for Escape / outside-press / focus-out and **requests** a
 * dismissal via `onDismiss` when an interaction lands outside the logical layer and this layer owns the
 * event.
 *
 * **Logical, not DOM-order, containment.** "Inside" is resolved through the shared tree — this popup's
 * floating element + its registered triggers, **plus** the same for every open descendant node, **plus**
 * this capability's own {@link branches}. So a portal-relocated child still counts as inside its parent,
 * which the legacy DOM-order `isLayerExist` cannot do.
 *
 * **Ownership & propagation (`hasBlockingChild`, Phase 2).** Each layer publishes per-event `bubbles`
 * flags (`escapeKeyBubbles` default `false`, `outsidePressBubbles` default `true`); an ancestor reads its
 * open children's flags via {@link childBubbles}. A non-bubbling layer **yields** to a non-bubbling open
 * child, so by default Escape closes only the **deepest** layer while an outside press closes the **whole
 * stack**. A layer with `escapeKeyBubbles = true` re-emits to its parent (Menu's `closeParentOnEsc`). The
 * owning non-bubbling Escape layer also `stopPropagation()`s so the key does not reach app handlers.
 *
 * **Press / IME hardening (Phase 3).** Outside-press honors `outsidePressEvent` (`'sloppy'` →
 * `pointerdown`, `'intentional'` → `click` with press-start-inside drag-out suppression), ignores
 * non-primary mouse buttons and scrollbar presses, resets on `pointercancel`, and ignores Escape while an
 * IME composition is active. **Touch** gesture hardening (long-press / drag distance thresholds) is
 * deliberately **not** ported here — jsdom cannot exercise it; it belongs in `apps/visual-regression`
 * (Playwright), and the legacy engine keeps driving touch until the Phase-4 cutover.
 *
 * **Scope.** Built in parallel and **not wired** to the live legacy path (the Phase-4 atomic cutover does
 * that). Must be constructed in an injection context (`DestroyRef` / `PLATFORM_ID`). No-op on the server.
 */
export class RdxDismissableCapability {
    /** This capability's own inside-content set (ADR 0015 Phase 1 — separate from the legacy global). */
    readonly branches = new Set<Element>();

    /** This capability's active-ness: the popup is open **and** the capability is enabled. */
    readonly active: () => boolean;

    constructor(
        readonly context: RdxFloatingRootContext,
        readonly node: () => RdxFloatingNode | null,
        config: RdxDismissableConfig = {}
    ) {
        const enabled = config.enabled ?? alwaysTrue;
        const escapeKey = config.escapeKey ?? alwaysTrue;
        const escapeKeyBubbles = config.escapeKeyBubbles ?? alwaysFalse;
        const outsidePress = config.outsidePress ?? alwaysTrue;
        const outsidePressBubbles = config.outsidePressBubbles ?? alwaysTrue;
        const outsidePressEvent = config.outsidePressEvent ?? sloppy;
        const focusOutside = config.focusOutside ?? alwaysTrue;

        // Plain function (not `computed`) so it re-reads `open()` per event even when `open` is not a
        // signal — while still tracking signals when read inside a reactive context.
        this.active = () => this.context.open() && enabled();

        // Publish this layer's bubbles policy so an ANCESTOR's hasBlockingChild can read it. Registered
        // (and cleaned up) regardless of platform so SSR leaves no stale entry.
        dismissBubblesByContext.set(this.context, { escapeKey: escapeKeyBubbles, outsidePress: outsidePressBubbles });
        const destroyRef = inject(DestroyRef);
        destroyRef.onDestroy(() => dismissBubblesByContext.delete(this.context));

        if (!isPlatformBrowser(inject(PLATFORM_ID))) {
            return; // SSR: no listeners, no DOM access.
        }

        const ownerDocument = this.context.ownerDocument;
        const ownerWindow = ownerDocument.defaultView ?? globalThis;

        const dismiss = (reason: RdxDismissReason, event: Event): void => {
            config.onDismiss?.(reason, event);
        };

        // IME: a press of Escape while composing should close the compose menu, not the popup.
        let isComposing = false;
        // Press-start-inside tracking (drag-out suppression for `intentional` mode).
        let pressStartedInside = false;

        const handleKeyDown = (event: KeyboardEvent): void => {
            if (event.key !== 'Escape' || !this.active() || !escapeKey() || isComposing) {
                return;
            }
            // A non-bubbling layer yields to a deeper non-bubbling open layer (Base UI:
            // `!escapeKeyBubbles && hasBlockingChild`). A bubbling layer never yields.
            if (!escapeKeyBubbles() && this.hasBlockingChild('escape-key')) {
                return;
            }
            config.onEscapeKeyDown?.(event);
            if (!event.defaultPrevented) {
                dismiss('escape-key', event);
            }
            // Propagation control: the owning non-bubbling layer consumes the Escape so it does not
            // reach ancestor layers / app-level handlers (Base UI `event.stopPropagation()`).
            if (!escapeKeyBubbles()) {
                event.stopPropagation();
            }
        };

        const handleCompositionStart = (): void => {
            isComposing = true;
        };
        const handleCompositionEnd = (): void => {
            // Safari fires `compositionend` before `keydown`, so clear on the next tick (Base UI).
            ownerWindow.setTimeout(() => {
                isComposing = false;
            }, 0);
        };

        const tryOutsidePress = (event: Event): void => {
            if (!this.active() || !outsidePress() || !isPrimaryButton(event) || this.isInside(event.target)) {
                return;
            }
            if (isScrollbarPress(event)) {
                return; // a scrollbar drag is not an outside press
            }
            // By default outside-press bubbles (closes the whole stack); only a non-bubbling layer with
            // a non-bubbling open child yields to it.
            if (!outsidePressBubbles() && this.hasBlockingChild('outside-press')) {
                return;
            }
            config.onPointerDownOutside?.(event as PointerEvent);
            if (!event.defaultPrevented) {
                dismiss('outside-press', event);
            }
        };

        // Capture-phase, so it records where the press began before any dismiss handler runs.
        const handlePressStart = (event: Event): void => {
            pressStartedInside = this.isInside(event.target);
        };
        const handlePointerCancel = (): void => {
            pressStartedInside = false;
        };

        const handlePointerDown = (event: Event): void => {
            if (outsidePressEvent() !== 'sloppy') {
                return; // `intentional` dismisses on click, not pointerdown
            }
            tryOutsidePress(event);
        };
        const handleClick = (event: Event): void => {
            if (outsidePressEvent() !== 'intentional') {
                return;
            }
            // A press that started inside (text selection dragged out) consumes its one outside click.
            if (pressStartedInside) {
                pressStartedInside = false;
                return;
            }
            tryOutsidePress(event);
        };

        const handleFocusIn = (event: FocusEvent): void => {
            // Defer two microtasks so focus settles before reading containment (matches the legacy
            // RdxFocusOutside; the `on*` hook still runs synchronously, so `preventDefault` is honored).
            void Promise.resolve()
                .then(() => Promise.resolve())
                .then(() => {
                    if (!this.active() || !focusOutside() || this.isInside(event.target)) {
                        return;
                    }
                    config.onFocusOutside?.(event);
                    if (!event.defaultPrevented) {
                        dismiss('focus-outside', event);
                    }
                });
        };

        ownerDocument.addEventListener('keydown', handleKeyDown, { capture: true });
        ownerDocument.addEventListener('compositionstart', handleCompositionStart, { capture: true });
        ownerDocument.addEventListener('compositionend', handleCompositionEnd, { capture: true });
        ownerDocument.addEventListener('focusin', handleFocusIn);
        ownerDocument.addEventListener('pointerdown', handlePressStart, { capture: true });
        ownerDocument.addEventListener('pointercancel', handlePointerCancel, { capture: true });

        // Defer attaching the dismiss listeners past the current event loop so the very interaction that
        // opened this layer doesn't immediately dismiss it (the opening press is still propagating).
        const pointerTimer = ownerWindow.setTimeout(() => {
            ownerDocument.addEventListener('pointerdown', handlePointerDown);
            ownerDocument.addEventListener('click', handleClick);
        }, 0);

        destroyRef.onDestroy(() => {
            ownerWindow.clearTimeout(pointerTimer);
            ownerDocument.removeEventListener('keydown', handleKeyDown, { capture: true });
            ownerDocument.removeEventListener('compositionstart', handleCompositionStart, { capture: true });
            ownerDocument.removeEventListener('compositionend', handleCompositionEnd, { capture: true });
            ownerDocument.removeEventListener('focusin', handleFocusIn);
            ownerDocument.removeEventListener('pointerdown', handlePressStart, { capture: true });
            ownerDocument.removeEventListener('pointercancel', handlePointerCancel, { capture: true });
            ownerDocument.removeEventListener('pointerdown', handlePointerDown);
            ownerDocument.removeEventListener('click', handleClick);
        });
    }

    /**
     * Whether `target` is logically inside this layer: within this popup's floating element or one of its
     * registered triggers, within any **open descendant** node's floating element / triggers, or within a
     * registered branch.
     */
    private isInside(target: EventTarget | null): boolean {
        if (this.contextContains(this.context, target)) {
            return true;
        }

        const node = this.node();
        if (node) {
            for (const child of node.tree.children(node, { onlyOpen: true })) {
                if (child.context && this.contextContains(child.context, target)) {
                    return true;
                }
            }
        }

        if (isNode(target)) {
            for (const branch of this.branches) {
                if (branch.contains(target)) {
                    return true;
                }
            }
        }

        return false;
    }

    /** `target` is inside a context's floating element or one of its registered triggers. */
    private contextContains(context: RdxFloatingRootContext, target: EventTarget | null): boolean {
        const floating = context.floatingElement;
        if (floating && isNode(target) && floating.contains(target)) {
            return true;
        }
        return context.triggers.contains(target);
    }

    /**
     * Whether an open descendant blocks this layer for `reason` (so it should yield). A child blocks when
     * it does **not** let the event bubble past it ({@link childBubbles} is `false`). Base UI's
     * `hasBlockingChild` (`useDismiss.ts:170`) is a capability-local function — **not** a tree method — so
     * the tree stays neutral.
     */
    private hasBlockingChild(reason: RdxDismissReason): boolean {
        const node = this.node();
        if (!node) {
            return false;
        }
        return node.tree
            .children(node, { onlyOpen: true })
            .some((child) => child.context !== null && !childBubbles(child.context, reason));
    }
}
